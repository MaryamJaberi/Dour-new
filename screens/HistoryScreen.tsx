import React, { useState, useEffect } from 'react';
import { GameHistoryEntry, TeamColor, Language } from '../types';
import { COLORS_MAP } from '../constants';
import { TRANSLATIONS } from '../translations';
import { formatTemplate, isRTLLanguage } from '../i18n';
import { ACHIEVEMENTS_CATALOG, dbRepo } from '../database';
import { TeamMascot } from '../components/Mascots';
import { sound } from '../soundManager';
import { auth, fetchUserMatchHistory } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  Trophy,
  Crown,
  ArrowRight,
  ArrowLeft,
  Cloud,
  HardDrive,
  Calendar,
  Users,
  Award,
  Medal,
  Zap,
  Lock
} from 'lucide-react';

interface Props {
  language: Language;
  history: GameHistoryEntry[];
  onBack: () => void;
}

const HistoryScreen: React.FC<Props> = ({ language, history, onBack }) => {
  const t = TRANSLATIONS[language];
  const isRTL = isRTLLanguage(language);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cloudHistory, setCloudHistory] = useState<GameHistoryEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'local' | 'cloud' | 'leaderboard' | 'achievements'>('local');
  const [isLoadingCloud, setIsLoadingCloud] = useState(false);

  const stats = dbRepo.getStats();
  const leaderboard = dbRepo.getPlayerProfiles();
  const unlockedSet = new Set(stats.unlockedAchievements.map(a => a.id));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsLoadingCloud(true);
        const cloudMatches = await fetchUserMatchHistory(user.uid);
        setCloudHistory(cloudMatches);
        setIsLoadingCloud(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const displayedHistory = activeTab === 'cloud' && currentUser ? cloudHistory : history;

  return (
    <div className="h-full min-h-0 flex-1 flex flex-col bg-pixel-grid overflow-hidden select-none" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header Panel */}
      <div className="p-3.5 bg-gradient-to-r from-[#7B2CBF] via-[#FF007F] to-[#FF2E93] border-b-4 border-[#241442] flex items-center justify-between z-10 text-white shadow-[0px_3px_0px_0px_#241442] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FFE600] border-2 border-[#241442] flex items-center justify-center text-[#1a0833] shadow-[1px_1px_0px_0px_#241442]">
            <Trophy size={18} color="#1a0833" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider leading-tight">{t.history}</h2>
            <div className="text-[10px] font-black text-[#FFE600] flex items-center gap-1.5">
              <span>{formatTemplate(t.levelLabel, { n: stats.level })}</span>
              <span>•</span>
              <span>{formatTemplate(t.xpLabel, { n: stats.xp })}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="px-3.5 py-1.5 flex items-center justify-center bg-[#FFE600] hover:bg-yellow-300 text-[#1a0833] border-2 border-[#241442] font-black text-xs rounded-xl shadow-[2px_2px_0px_0px_#241442] active:translate-y-0.5"
        >
          {t.back}
        </button>
      </div>

      {/* Multi-Tab Database Hub Selector */}
      <div className="flex gap-1.5 p-2 bg-white border-b-2 border-[#241442] shrink-0 overflow-x-auto">
        <button
          onClick={() => { sound.playClick(); setActiveTab('local'); }}
          className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 border-2 border-[#241442] transition-all whitespace-nowrap ${
            activeTab === 'local' ? 'bg-[#00F0FF] text-[#1a0833] shadow-[2px_2px_0px_0px_#241442]' : 'bg-slate-100 text-slate-700'
          }`}
        >
          <HardDrive size={13} />
          <span>{t.localMatchesTab} ({history.length})</span>
        </button>

        {currentUser && (
          <button
            onClick={() => { sound.playClick(); setActiveTab('cloud'); }}
            className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 border-2 border-[#241442] transition-all whitespace-nowrap ${
              activeTab === 'cloud' ? 'bg-[#39FF14] text-[#1a0833] shadow-[2px_2px_0px_0px_#241442]' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <Cloud size={13} />
            <span>{t.cloudMatchesTab} ({cloudHistory.length})</span>
          </button>
        )}

        <button
          onClick={() => { sound.playClick(); setActiveTab('leaderboard'); }}
          className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 border-2 border-[#241442] transition-all whitespace-nowrap ${
            activeTab === 'leaderboard' ? 'bg-[#FFE600] text-[#1a0833] shadow-[2px_2px_0px_0px_#241442]' : 'bg-slate-100 text-slate-700'
          }`}
        >
          <Medal size={13} />
          <span>{t.leaderboardTab}</span>
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveTab('achievements'); }}
          className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 border-2 border-[#241442] transition-all whitespace-nowrap ${
            activeTab === 'achievements' ? 'bg-[#FF007F] text-white shadow-[2px_2px_0px_0px_#241442]' : 'bg-slate-100 text-slate-700'
          }`}
        >
          <Award size={13} />
          <span>{t.achievementsTab}</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="min-h-0 flex-1 overflow-y-auto p-3.5 space-y-2.5 overscroll-contain">
        {(activeTab === 'local' || activeTab === 'cloud') && (
          isLoadingCloud && activeTab === 'cloud' ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
              <div className="w-8 h-8 border-3 border-[#FF007F] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-black text-[#1a0833]">{t.loadingCloud}</p>
            </div>
          ) : displayedHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <div className="animate-party-float">
                <TeamMascot color={TeamColor.Yellow} size={90} />
              </div>
              <div className="bg-white p-4 border-[3px] border-[#241442] rounded-2xl shadow-[3px_3px_0px_0px_#241442] max-w-xs">
                <span className="text-[10px] bg-[#FFE600] border border-[#241442] px-2 py-0.5 rounded-lg font-black uppercase text-[#1a0833]">
                  {t.noGamesBadge}
                </span>
                <p className="text-xs font-black text-slate-700 mt-2">{t.noHistory}</p>
              </div>
            </div>
          ) : (
            displayedHistory.map(entry => {
              const hasColorMatch = entry.winnerColor !== 'TIE';
              const winnerBg = hasColorMatch ? COLORS_MAP[entry.winnerColor as TeamColor]?.bg : 'bg-slate-400';
              const winnerHex = hasColorMatch ? COLORS_MAP[entry.winnerColor as TeamColor]?.hex : '#94a3b8';

              return (
                <div
                  key={entry.id}
                  className="bg-white p-3 rounded-2xl border-[3px] border-[#241442] shadow-[3px_3px_0px_0px_#241442] flex items-center justify-between gap-3 relative transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-mono text-slate-600 tracking-wider mb-0.5 uppercase flex items-center gap-1.5 flex-wrap">
                      <Calendar size={12} />
                      <span>{entry.date}</span>
                      {typeof entry.wordsGuessed === 'number' && entry.wordsGuessed > 0 && (
                        <span className="px-1.5 py-0.5 bg-[#FAF5FF] border border-[#241442]/30 rounded text-[9px] font-black text-[#7B2CBF]">
                          ⚡ {formatTemplate(t.wordsGuessedStat, { n: entry.wordsGuessed })}
                        </span>
                      )}
                    </div>
                    <div className="text-[#1a0833] font-black text-sm uppercase tracking-tight flex items-center gap-1.5">
                      <Crown size={15} color="#FF007F" />
                      <span className="truncate">{entry.winnerNames.join(' & ')}</span>
                    </div>
                    <div className="text-[11px] font-bold text-slate-600 truncate mt-0.5 flex items-center gap-1">
                      <Users size={12} />
                      <span>{t.players}: {entry.players.join(', ')}</span>
                    </div>
                  </div>

                  <div
                    className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black text-[#1a0833] shadow-[2px_2px_0px_0px_#241442] border-2 border-[#241442] shrink-0 ${winnerBg}`}
                    style={{ backgroundColor: winnerHex }}
                  >
                    <Trophy size={16} color="#1a0833" />
                    <span className="text-[8px] text-[#1a0833] font-black tracking-tighter uppercase leading-none mt-0.5">
                      {entry.winnerColor === 'TIE' ? t.mutualTieBadge : (t.teamNames[entry.winnerColor] || entry.winnerColor).slice(0, 5)}
                    </span>
                  </div>
                </div>
              );
            })
          )
        )}

        {activeTab === 'leaderboard' && (
          leaderboard.length === 0 ? (
            <div className="bg-white p-5 rounded-2xl border-[3px] border-[#241442] text-center shadow-[3px_3px_0px_0px_#241442]">
              <Medal size={36} color="#FFE600" className="mx-auto mb-2" />
              <p className="text-xs font-black text-slate-700">{t.noLeaderboardYet}</p>
            </div>
          ) : (
            leaderboard.map((profile, idx) => (
              <div
                key={profile.key}
                className="bg-white p-3 rounded-2xl border-[3px] border-[#241442] shadow-[3px_3px_0px_0px_#241442] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-xl border-2 border-[#241442] flex items-center justify-center font-black text-xs shrink-0 ${
                    idx === 0 ? 'bg-[#FFE600] text-[#1a0833]' : idx === 1 ? 'bg-[#00F0FF] text-[#1a0833]' : 'bg-[#F4E8FF] text-[#1a0833]'
                  }`}>
                    #{idx + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-black text-[#1a0833] truncate">{profile.name}</div>
                    <div className="text-[10px] font-bold text-slate-600">
                      {profile.gamesPlayed} {t.gamesLabel} • {formatTemplate(t.wordsGuessedStat, { n: profile.wordsGuessed })}
                    </div>
                  </div>
                </div>
                <div className="px-2.5 py-1 bg-[#39FF14] text-[#1a0833] border-2 border-[#241442] rounded-xl text-xs font-black shrink-0">
                  {profile.wins} {t.winsLabel}
                </div>
              </div>
            ))
          )
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-2">
            <div className="bg-[#241442] text-white p-2.5 rounded-2xl border-2 border-[#FFE600] flex items-center justify-between text-xs font-black">
              <span className="flex items-center gap-1.5">
                <Zap size={14} color="#FFE600" fill="#FFE600" />
                <span>
                  {formatTemplate(t.achievementsUnlocked, {
                    n: stats.unlockedAchievements.length,
                    total: ACHIEVEMENTS_CATALOG.length
                  })}
                </span>
              </span>
              <span className="text-[#39FF14]">{formatTemplate(t.xpLabel, { n: stats.xp })}</span>
            </div>

            {ACHIEVEMENTS_CATALOG.map(meta => {
              const isUnlocked = unlockedSet.has(meta.id);
              const copy = t.achievements[meta.id];
              return (
                <div
                  key={meta.id}
                  className={`p-3 rounded-2xl border-[3px] border-[#241442] flex items-center justify-between gap-2.5 ${
                    isUnlocked ? 'bg-white shadow-[3px_3px_0px_0px_#241442]' : 'bg-slate-100/90 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-10 h-10 rounded-xl border-2 border-[#241442] flex items-center justify-center text-lg shrink-0 ${
                      isUnlocked ? 'bg-[#FFE600]' : 'bg-slate-200'
                    }`}>
                      {isUnlocked ? meta.icon : <Lock size={16} color="#64748b" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black text-[#1a0833] truncate">{copy.title}</div>
                      <div className="text-[10.5px] font-bold text-slate-600 leading-snug">{copy.desc}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-lg border border-[#241442] text-[10px] font-black shrink-0 ${
                    isUnlocked ? 'bg-[#39FF14] text-[#1a0833]' : 'bg-slate-200 text-slate-600'
                  }`}>
                    +{meta.xpReward} XP
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Return footer */}
      <div className="p-3 bg-white border-t-4 border-[#241442] z-10 shrink-0">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="pixel-btn pixel-btn-dark w-full py-3 text-base font-black uppercase tracking-wider flex items-center justify-center gap-2"
        >
          {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
          <span>{t.back}</span>
        </button>
      </div>
    </div>
  );
};

export default HistoryScreen;
