import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameSettings, GameStatus, GameHistoryEntry, Team, Player, TeamColor, GameMode, WordDifficulty } from './types';
import { WORD_BANK } from './words';
import { TRANSLATIONS } from './translations';
import { formatTemplate, isRTLLanguage, syncDocumentLanguage } from './i18n';
import { dbRepo, getDailyChallengeForDate } from './database';
import IntroScreen from './screens/IntroScreen';
import SetupScreen from './screens/SetupScreen';
import CategoryScreen from './screens/CategoryScreen';
import PlayerNameScreen from './screens/PlayerNameScreen';
import SeatingConfirmScreen from './screens/SeatingConfirmScreen';
import GameplayScreen from './screens/GameplayScreen';
import HistoryScreen from './screens/HistoryScreen';
import HelpScreen from './screens/HelpScreen';
import { sound } from './soundManager';
import { auth, syncSettingsToCloud } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface SessionWordItem {
  id: string;
  text: string;
  difficulty: WordDifficulty;
}

const DEFAULT_SETTINGS: GameSettings = {
  playerCount: 4,
  roundsCount: 3,
  roundDuration: 90,
  difficulty: 'easy',
  selectedCategories: ["CAT_OBJECTS", "CAT_ANIMALS", "CAT_FOOD"],
  selectedCustomPackIds: [],
  playerNames: Array(8).fill(''),
  language: 'fa',
  passPhoneScreenEnabled: false,
  soundEnabled: true,
  sfxEnabled: true,
  bgmEnabled: true
};

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'INTRO' | 'SETUP' | 'CATEGORIES' | 'PLAYERS' | 'SEATING_CONFIRM' | 'GAME' | 'HISTORY' | 'HELP'>('INTRO');
  const [prevScreen, setPrevScreen] = useState<'INTRO' | 'SETUP' | 'CATEGORIES' | 'PLAYERS' | 'SEATING_CONFIRM' | 'GAME' | 'HISTORY' | 'HELP'>('INTRO');
  const [activeHelpSection, setActiveHelpSection] = useState<string>('intro');
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);
  const [activeMode, setActiveMode] = useState<GameMode>('classic');
  const [activeDailyDateKey, setActiveDailyDateKey] = useState<string | undefined>(undefined);

  // Gameplay State
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Setup);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [roundTimer, setRoundTimer] = useState(0);

  // SESSION WORD POOL (supports built-in + custom word packs + anti-repeat memory)
  const [sessionWords, setSessionWords] = useState<SessionWordItem[]>([]);
  const [poolPointer, setPoolPointer] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [currentWordId, setCurrentWordId] = useState('');
  const [currentWordDifficulty, setCurrentWordDifficulty] = useState<WordDifficulty>('easy');
  const [swapCooldown, setSwapCooldown] = useState(20000);
  const [isPoolExhausted, setIsPoolExhausted] = useState(false);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const savedSettings = localStorage.getItem('dor_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings) || {};
        if (parsed.language === 'en-US') parsed.language = 'en';
        if (!(parsed.language in TRANSLATIONS)) delete parsed.language;
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch {
        // Fallback
      }
    }
    setHistory(dbRepo.getHistory());
  }, []);

  // Sync HTML document lang & dir whenever language changes
  useEffect(() => {
    syncDocumentLanguage(settings.language);
  }, [settings.language]);

  // Subscribe once to Firebase Auth & hydrate/sync cloud database cleanly
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const { cloudSettings } = await dbRepo.syncWithCloud(user.uid);
          if (cloudSettings && cloudSettings.language in TRANSLATIONS) {
            setSettings(prev => {
              const merged = { ...prev, ...cloudSettings };
              localStorage.setItem('dor_settings', JSON.stringify(merged));
              return merged;
            });
          }
          setHistory(dbRepo.getHistory());
        } catch (err) {
          console.error('Cloud sync error:', err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const isMasterOn = settings.soundEnabled ?? true;
    const isSfxOn = settings.sfxEnabled ?? true;
    const isBgmOn = settings.bgmEnabled ?? true;

    sound.setSoundEnabled(isMasterOn);
    sound.setSfxEnabled(isSfxOn);
    sound.setBgmEnabled(isBgmOn);
  }, [settings.soundEnabled, settings.sfxEnabled, settings.bgmEnabled]);

  // Background music plays ONLY on the first (INTRO) screen and stops on all other screens
  useEffect(() => {
    if (currentScreen === 'INTRO') {
      sound.startMenuBGM();
    } else {
      sound.stopBGM();
    }
  }, [currentScreen]);

  const saveSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    localStorage.setItem('dor_settings', JSON.stringify(newSettings));
    if (auth.currentUser) {
      syncSettingsToCloud(auth.currentUser.uid, newSettings).catch(console.error);
    }
  };

  /**
   * Word Selection from session pool with auto-recycling & seen-word tracking
   */
  const getNextWord = useCallback((outcome?: 'guessed' | 'swapped') => {
    if (outcome && currentWordId) {
      dbRepo.recordWordOutcome(currentWordId, outcome);
    }
    setPoolPointer(currentPtr => {
      let pool = sessionWords;
      if (!pool || pool.length === 0) {
        pool = WORD_BANK.map((w, idx) => ({
          id: w.id || `w_${idx}`,
          text: w.words[settings.language] || w.words.en,
          difficulty: w.difficulty
        }));
      }

      let nextPtr = currentPtr;
      if (nextPtr >= pool.length) {
        const reshuffled = [...pool].sort(() => Math.random() - 0.5);
        setSessionWords(reshuffled);
        pool = reshuffled;
        nextPtr = 0;
      }

      const item = pool[nextPtr] || pool[0];
      if (item) {
        setCurrentWord(item.text);
        setCurrentWordId(item.id);
        setCurrentWordDifficulty(item.difficulty || 'easy');
      }

      setSwapCooldown(20000);
      setIsPoolExhausted(false);
      return nextPtr + 1;
    });
  }, [sessionWords, settings.language, currentWordId]);

  /**
   * Builds the session word pool from selected categories + custom word packs,
   * prioritizing unseen words from the local-first word memory.
   */
  const buildSessionPool = (cfg: GameSettings): SessionWordItem[] => {
    const targetDifficulty = cfg.difficulty || 'easy';

    let relevantIndices = WORD_BANK
      .map((w, i) => {
        const catMatch = cfg.selectedCategories.includes(w.category);
        const diffMatch = targetDifficulty === 'all' || w.difficulty === targetDifficulty;
        return catMatch && diffMatch ? i : -1;
      })
      .filter(i => i !== -1);

    if (relevantIndices.length < 25) {
      const catIndices = WORD_BANK
        .map((w, i) => (cfg.selectedCategories.includes(w.category) ? i : -1))
        .filter(i => i !== -1);
      relevantIndices = Array.from(new Set([...relevantIndices, ...catIndices]));
    }

    if (relevantIndices.length < 25) {
      const diffIndices = WORD_BANK
        .map((w, i) => (targetDifficulty === 'all' || w.difficulty === targetDifficulty ? i : -1))
        .filter(i => i !== -1);
      relevantIndices = Array.from(new Set([...relevantIndices, ...diffIndices]));
    }

    if (relevantIndices.length === 0) {
      relevantIndices = WORD_BANK.map((_, i) => i);
    }

    const prioritizedIndices = dbRepo.prioritizeUnseenIndices(
      relevantIndices,
      idx => WORD_BANK[idx]?.id || `w_${idx}`
    );

    const builtInItems: SessionWordItem[] = prioritizedIndices.map(idx => {
      const w = WORD_BANK[idx];
      return {
        id: w.id || `w_${idx}`,
        text: w.words[cfg.language] || w.words.en,
        difficulty: w.difficulty
      };
    });

    // Mix in selected custom word packs (placed near the front so players see their own words!)
    const selectedPackIds = cfg.selectedCustomPackIds || [];
    const customItems: SessionWordItem[] = [];
    if (selectedPackIds.length > 0) {
      const allPacks = dbRepo.getCustomPacks();
      allPacks
        .filter(p => selectedPackIds.includes(p.id))
        .forEach(pack => {
          pack.words.forEach((word, wIdx) => {
            customItems.push({
              id: `${pack.id}_${wIdx}`,
              text: word,
              difficulty: pack.difficulty
            });
          });
        });
    }

    if (customItems.length > 0) {
      const shuffledCustom = [...customItems].sort(() => Math.random() - 0.5);
      return [...shuffledCustom, ...builtInItems];
    }

    return builtInItems;
  };

  /**
   * Prepares Teams, Seating, and Word Bank, then shows SEATING_CONFIRM
   */
  const prepareGameSeating = (overrideSettings?: GameSettings, mode?: GameMode) => {
    const cfg = overrideSettings || settings;
    const t = TRANSLATIONS[cfg.language];
    const teamColors = [TeamColor.Blue, TeamColor.Red, TeamColor.Green, TeamColor.Yellow];
    const teamCount = cfg.playerCount / 2;
    const totalGameTime = cfg.roundsCount * cfg.roundDuration * 1000;
    const timePerTeam = totalGameTime / teamCount;

    const initialTeams: Team[] = Array.from({ length: teamCount }).map((_, i) => ({
      id: i,
      color: teamColors[i],
      timeRemaining: timePerTeam,
      isEliminated: false,
      playerIds: [i, i + teamCount],
      wordsGuessed: 0
    }));

    const initialPlayers: Player[] = Array.from({ length: cfg.playerCount }).map((_, i) => {
      const teamId = i % teamCount;
      const defaultName = formatTemplate(t.playerPlaceholder, { n: i + 1 });
      return {
        id: i,
        name: cfg.playerNames[i]?.trim() || defaultName,
        teamId,
        teamColor: teamColors[teamId]
      };
    });

    const pool = buildSessionPool(cfg);
    setSessionWords(pool);
    setPoolPointer(0);
    setIsPoolExhausted(false);

    const resolvedMode: GameMode =
      mode || ((cfg.selectedCustomPackIds?.length || 0) > 0 ? 'custom' : 'classic');
    setActiveMode(resolvedMode);

    setTeams(initialTeams);
    setPlayers(initialPlayers);
    setCurrentRound(1);
    setActivePlayerIndex(0);
    setRoundTimer(cfg.roundDuration * 1000);

    if (pool.length > 0) {
      setCurrentWord(pool[0].text);
      setCurrentWordId(pool[0].id);
      setCurrentWordDifficulty(pool[0].difficulty || 'easy');
      setPoolPointer(1);
    }

    setGameStatus(GameStatus.SeatingConfirm);
    setCurrentScreen('SEATING_CONFIRM');
  };

  /**
   * Launches today's deterministic Daily Challenge
   */
  const handleStartDailyChallenge = () => {
    const daily = getDailyChallengeForDate();
    const dailySettings: GameSettings = {
      ...settings,
      selectedCategories: daily.categories,
      difficulty: daily.difficulty,
      selectedCustomPackIds: []
    };
    saveSettings(dailySettings);
    setActiveDailyDateKey(daily.dateKey);
    setActiveMode('daily');
    setCurrentScreen('PLAYERS');
  };

  const startConfirmedGame = () => {
    setGameStatus(GameStatus.ActiveTurn);
    setCurrentScreen('GAME');
  };

  const handleResume = () => {
    getNextWord();
    setGameStatus(prev => (prev === GameStatus.WinnerScreen || prev === GameStatus.GameEnded ? prev : GameStatus.ActiveTurn));
  };

  const openHelp = (section: string) => {
    setActiveHelpSection(section);
    if (currentScreen === 'GAME') setGameStatus(GameStatus.Paused);
    setPrevScreen(currentScreen);
    setCurrentScreen('HELP');
  };

  const closeHelp = () => {
    setCurrentScreen(prevScreen);
    if (prevScreen === 'GAME') {
      handleResume();
    }
  };

  // Millisecond Timer loop for ACTIVE_TURN with robust delta-time
  useEffect(() => {
    if (gameStatus === GameStatus.ActiveTurn) {
      let lastTime = Date.now();

      timerRef.current = window.setInterval(() => {
        const now = Date.now();
        const delta = Math.min(now - lastTime, 200);
        lastTime = now;

        setRoundTimer(prev => (prev <= delta ? 0 : prev - delta));

        const activePlayer = players[activePlayerIndex];
        if (activePlayer) {
          setTeams(prev =>
            prev.map(t => {
              if (t.id === activePlayer.teamId && !t.isEliminated) {
                const newTime = t.timeRemaining - delta;
                return { ...t, timeRemaining: Math.max(0, newTime) };
              }
              return t;
            })
          );
        }

        setSwapCooldown(prev => Math.max(0, prev - delta));
      }, 50);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStatus, players, activePlayerIndex]);

  const isRTL = isRTLLanguage(settings.language);

  return (
    <div
      className="h-[100dvh] min-h-[100dvh] max-h-[100dvh] md:h-[880px] md:max-h-[92vh] md:my-auto max-w-md mx-auto bg-pixel-grid relative flex flex-col overflow-hidden border-0 md:border-[5px] md:border-[#241442] shadow-2xl md:shadow-[8px_8px_0px_0px_#241442] rounded-none md:rounded-[28px]"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* 1. SPLASH / INTRO */}
      {currentScreen === 'INTRO' && (
        <IntroScreen
          language={settings.language}
          onLanguageChange={(l) => saveSettings({ ...settings, language: l })}
          onNext={() => {
            setActiveMode('classic');
            setActiveDailyDateKey(undefined);
            setGameStatus(GameStatus.Setup);
            setCurrentScreen('SETUP');
          }}
          onStartDailyChallenge={handleStartDailyChallenge}
          onOpenHistory={() => setCurrentScreen('HISTORY')}
          onOpenHelp={() => openHelp('rules')}
        />
      )}

      {/* 2. SETUP */}
      {currentScreen === 'SETUP' && (
        <SetupScreen
          settings={settings}
          onSave={saveSettings}
          onNext={() => setCurrentScreen('CATEGORIES')}
          onBack={() => { setGameStatus(GameStatus.Splash); setCurrentScreen('INTRO'); }}
          onOpenHelp={() => openHelp('setup')}
        />
      )}

      {/* CATEGORIES & CUSTOM PACKS */}
      {currentScreen === 'CATEGORIES' && (
        <CategoryScreen
          settings={settings}
          onSave={saveSettings}
          onNext={() => setCurrentScreen('PLAYERS')}
          onBack={() => setCurrentScreen('SETUP')}
          onOpenHelp={() => openHelp('categories')}
        />
      )}

      {/* PLAYERS */}
      {currentScreen === 'PLAYERS' && (
        <PlayerNameScreen
          settings={settings}
          onSave={saveSettings}
          onStart={() => prepareGameSeating(settings, activeMode)}
          onBack={() => setCurrentScreen(activeMode === 'daily' ? 'INTRO' : 'CATEGORIES')}
          onOpenHelp={() => openHelp('players')}
        />
      )}

      {/* 3. SEATING_CONFIRM */}
      {currentScreen === 'SEATING_CONFIRM' && (
        <SeatingConfirmScreen
          settings={settings}
          teams={teams}
          players={players}
          onConfirm={startConfirmedGame}
          onBack={() => setCurrentScreen('PLAYERS')}
          onOpenHelp={() => openHelp('seating')}
        />
      )}

      {/* 4. ACTIVE GAMEPLAY */}
      {currentScreen === 'GAME' && (
        <GameplayScreen
          settings={settings}
          onUpdateSettings={saveSettings}
          gameStatus={gameStatus}
          setGameStatus={setGameStatus}
          teams={teams}
          setTeams={setTeams}
          players={players}
          currentRound={currentRound}
          setCurrentRound={setCurrentRound}
          activePlayerIndex={activePlayerIndex}
          setActivePlayerIndex={setActivePlayerIndex}
          roundTimer={roundTimer}
          setRoundTimer={setRoundTimer}
          currentWord={currentWord}
          currentWordDifficulty={currentWordDifficulty}
          setCurrentWord={setCurrentWord}
          setCurrentWordDifficulty={setCurrentWordDifficulty}
          swapCooldown={swapCooldown}
          onGetNextWord={getNextWord}
          onResume={handleResume}
          isPoolExhausted={isPoolExhausted}
          gameMode={activeMode}
          dailyDateKey={activeDailyDateKey}
          onFinish={(entry) => {
            const { history: updated } = dbRepo.recordMatch(entry, settings, auth.currentUser?.uid);
            setHistory(updated);
          }}
          onExit={() => { setGameStatus(GameStatus.Setup); setCurrentScreen('INTRO'); }}
          onOpenHelp={() => openHelp('gameplay')}
        />
      )}

      {/* MATCH HISTORY, LEADERBOARD & ACHIEVEMENTS */}
      {currentScreen === 'HISTORY' && (
        <HistoryScreen
          language={settings.language}
          history={history}
          onBack={() => setCurrentScreen('INTRO')}
        />
      )}

      {/* RULES / HELP GUIDE */}
      {currentScreen === 'HELP' && (
        <HelpScreen
          language={settings.language}
          onClose={closeHelp}
          initialSection={activeHelpSection}
        />
      )}
    </div>
  );
};

export default App;
