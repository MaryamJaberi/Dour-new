// Web Audio API Complete Dynamic Sound & Music Engine for DOUR Party Game
// Provides granular hierarchical control: Master Sound, In-Game SFX, and Background Music (BGM)
// Robust across Chrome, Safari, iOS, Android: handles autoplay unlock, suspended/interrupted states,
// tab visibility changes, non-repetitive SFX, and live-tempo gameplay BGM.

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;

  // Granular sound state
  private isMasterMuted: boolean = false;
  private isSfxOn: boolean = true;
  private isBgmOn: boolean = true;

  // Background music state
  private currentBgmMode: 'none' | 'menu' | 'game' = 'none';
  private desiredBgmMode: 'none' | 'menu' | 'game' = 'none';
  private gameplaySecondsRemaining: number = 90;
  private bgmTimeout: number | null = null;
  private bgmStep: number = 0;

  // Tracking last played variant to ensure consecutive sounds are never identical
  private lastCorrectVariant: number = -1;
  private lastSwapVariant: number = -1;
  private tickToggle: boolean = false;
  private isUnlocked: boolean = false;

  constructor() {
    this.loadPersistedPreferences();
    this.initAutoUnlock();
  }

  private loadPersistedPreferences() {
    if (typeof window === 'undefined') return;
    try {
      const savedMaster = localStorage.getItem('dor_sound_master');
      if (savedMaster !== null) {
        this.isMasterMuted = savedMaster === 'false';
      }
      const savedSfx = localStorage.getItem('dor_sound_sfx');
      if (savedSfx !== null) {
        this.isSfxOn = savedSfx === 'true';
      }
      const savedBgm = localStorage.getItem('dor_sound_bgm');
      if (savedBgm !== null) {
        this.isBgmOn = savedBgm === 'true';
      }
    } catch {
      // Safe fallback
    }
  }

  private persistPreferences() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('dor_sound_master', (!this.isMasterMuted).toString());
      localStorage.setItem('dor_sound_sfx', this.isSfxOn.toString());
      localStorage.setItem('dor_sound_bgm', this.isBgmOn.toString());
    } catch {
      // Ignore storage errors
    }
  }

  private playSilentUnlockPulse(ctx: AudioContext) {
    try {
      // iOS Safari requires a sound node started synchronously inside a user gesture to fully unlock audio
      if (typeof ctx.createBuffer === 'function' && typeof ctx.createBufferSource === 'function') {
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
      }
    } catch {
      // Safe fallback for mocked/minimal AudioContext
    }
  }

  private initAutoUnlock() {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      this.playSilentUnlockPulse(ctx);

      const finishUnlock = () => {
        if (ctx.state === 'running') {
          this.isUnlocked = true;
          window.removeEventListener('pointerdown', unlock);
          window.removeEventListener('keydown', unlock);
          window.removeEventListener('touchstart', unlock);
          window.removeEventListener('touchend', unlock);
          window.removeEventListener('click', unlock);
          this.syncBgmLoop();
        }
      };

      if (ctx.state === 'running') {
        finishUnlock();
      } else if (typeof ctx.resume === 'function') {
        ctx.resume().then(finishUnlock).catch(() => {});
      }
    };

    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('touchend', unlock, { passive: true });
    window.addEventListener('click', unlock, { passive: true });

    // Pause and suspend AudioContext whenever the app goes to background or loses focus
    const pauseForBackground = () => {
      this.clearBgmTimer();
      this.currentBgmMode = 'none';
      if (this.bgmGain && this.ctx) {
        try {
          this.bgmGain.gain.setValueAtTime(0, this.ctx.currentTime);
        } catch {}
      }
      if (this.ctx && this.ctx.state === 'running' && typeof this.ctx.suspend === 'function') {
        this.ctx.suspend().catch(() => {});
      }
    };

    const resumeFromBackground = () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      if (this.ctx && (this.ctx.state === 'suspended' || (this.ctx.state as string) === 'interrupted')) {
        this.ctx
          .resume()
          .then(() => {
            if (this.bgmGain && this.ctx) {
              try {
                this.bgmGain.gain.setValueAtTime(this.isBgmOn ? 0.55 : 0, this.ctx.currentTime);
              } catch {}
            }
            this.syncBgmLoop();
          })
          .catch(() => {});
      } else {
        if (this.bgmGain && this.ctx) {
          try {
            this.bgmGain.gain.setValueAtTime(this.isBgmOn ? 0.55 : 0, this.ctx.currentTime);
          } catch {}
        }
        this.syncBgmLoop();
      }
    };

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        pauseForBackground();
      } else {
        resumeFromBackground();
      }
    });

    window.addEventListener('pagehide', pauseForBackground);
    window.addEventListener('blur', pauseForBackground);
    window.addEventListener('focus', resumeFromBackground);
    window.addEventListener('pageshow', resumeFromBackground);
  }

  public getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.setupGainNodes();
      }
    }
    if (this.ctx && (this.ctx.state === 'suspended' || (this.ctx.state as string) === 'interrupted')) {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private setupGainNodes() {
    if (!this.ctx) return;
    try {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMasterMuted ? 0 : 1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.isSfxOn ? 0.95 : 0, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(this.isBgmOn ? 0.55 : 0, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);
    } catch {
      // Safe fallback
    }
  }

  private getSfxDestination(): AudioNode | null {
    const ctx = this.getAudioContext();
    if (!ctx) return null;
    if (!this.sfxGain) {
      this.setupGainNodes();
    }
    return this.sfxGain || ctx.destination;
  }

  private getBgmDestination(): AudioNode | null {
    const ctx = this.getAudioContext();
    if (!ctx) return null;
    if (!this.bgmGain) {
      this.setupGainNodes();
    }
    return this.bgmGain || ctx.destination;
  }

  /**
   * Executes an SFX callback only when AudioContext is actually running.
   * If suspended (e.g. first tap on mobile/Chrome), resumes first and then plays cleanly.
   */
  private withRunningSfx(playFn: (ctx: AudioContext, dest: AudioNode) => void) {
    if (this.isMasterMuted || !this.isSfxOn) return;
    const ctx = this.getAudioContext();
    const dest = this.getSfxDestination();
    if (!ctx || !dest) return;

    if (ctx.state === 'running') {
      playFn(ctx, dest);
    } else if (typeof ctx.resume === 'function') {
      ctx
        .resume()
        .then(() => {
          if (ctx.state === 'running' && !this.isMasterMuted && this.isSfxOn) {
            playFn(ctx, dest);
          }
        })
        .catch(() => {});
    }
  }

  private clearBgmTimer() {
    if (this.bgmTimeout !== null) {
      window.clearTimeout(this.bgmTimeout);
      this.bgmTimeout = null;
    }
  }

  private syncBgmLoop() {
    if (this.isMasterMuted || !this.isBgmOn || this.desiredBgmMode === 'none') {
      this.clearBgmTimer();
      this.currentBgmMode = 'none';
      return;
    }
    if (typeof document !== 'undefined' && document.hidden) {
      this.clearBgmTimer();
      return;
    }

    // Do not schedule oscillators while AudioContext is suspended; wait for user gesture unlock
    const ctx = this.getAudioContext();
    if (!ctx || ctx.state !== 'running') {
      this.clearBgmTimer();
      return;
    }

    if (this.currentBgmMode === this.desiredBgmMode && this.bgmTimeout !== null) {
      return;
    }

    this.clearBgmTimer();
    if (this.bgmGain && this.ctx) {
      try {
        this.bgmGain.gain.setValueAtTime(this.isBgmOn ? 0.55 : 0, this.ctx.currentTime);
      } catch {}
    }
    this.currentBgmMode = this.desiredBgmMode;
    this.bgmStep = 0;

    if (this.currentBgmMode === 'menu') {
      this.scheduleNextMenuBeat();
    } else if (this.currentBgmMode === 'game') {
      this.scheduleNextGameBeat();
    }
  }

  // --- MASTER & GRANULAR SOUND CONTROLS ---

  public setMuted(muted: boolean) {
    this.isMasterMuted = muted;
    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.setValueAtTime(muted ? 0 : 1.0, this.ctx.currentTime);
      } catch {}
    }
    if (muted) {
      this.clearBgmTimer();
      this.currentBgmMode = 'none';
    } else {
      this.syncBgmLoop();
    }
    this.persistPreferences();
  }

  public setSoundEnabled(enabled: boolean) {
    this.setMuted(!enabled);
  }

  public getMuted(): boolean {
    return this.isMasterMuted;
  }

  public isSoundEnabled(): boolean {
    return !this.isMasterMuted;
  }

  public setSfxEnabled(enabled: boolean) {
    this.isSfxOn = enabled;
    if (this.sfxGain && this.ctx) {
      try {
        this.sfxGain.gain.setValueAtTime(enabled ? 0.95 : 0, this.ctx.currentTime);
      } catch {}
    }
    this.persistPreferences();
  }

  public isSfxEnabled(): boolean {
    return this.isSfxOn && !this.isMasterMuted;
  }

  public setBgmEnabled(enabled: boolean) {
    this.isBgmOn = enabled;
    if (this.bgmGain && this.ctx) {
      try {
        this.bgmGain.gain.setValueAtTime(enabled ? 0.55 : 0, this.ctx.currentTime);
      } catch {}
    }
    if (!enabled) {
      this.clearBgmTimer();
      this.currentBgmMode = 'none';
    } else {
      this.syncBgmLoop();
    }
    this.persistPreferences();
  }

  public isBgmEnabled(): boolean {
    return this.isBgmOn && !this.isMasterMuted;
  }

  public getCurrentBgmMode(): 'none' | 'menu' | 'game' {
    return this.currentBgmMode;
  }

  public getDesiredBgmMode(): 'none' | 'menu' | 'game' {
    return this.desiredBgmMode;
  }

  public getGameplaySecondsRemaining(): number {
    return this.gameplaySecondsRemaining;
  }

  public stopMenuBGM() {
    if (this.desiredBgmMode === 'menu' || this.currentBgmMode === 'menu') {
      this.stopBGM();
    }
  }

  public playWinner() {
    this.playVictory();
  }

  // --- DYNAMIC NON-REPETITIVE SOUND EFFECTS ---

  // 1. UI Click with subtle random micro-pitch variation
  public playClick() {
    this.withRunningSfx((ctx, dest) => {
      try {
        const now = ctx.currentTime;
        const baseFreq = 540 + (Math.random() * 80 - 40);

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.6, now + 0.035);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(now);
        osc.stop(now + 0.045);
      } catch {}
    });
  }

  // 2. Toggle / Tab switch / Select with harmonic variation
  public playToggle() {
    this.withRunningSfx((ctx, dest) => {
      try {
        const now = ctx.currentTime;
        const pairs = [
          [587.33, 880.0],
          [659.25, 987.77],
          [523.25, 783.99]
        ];
        const selected = pairs[Math.floor(Math.random() * pairs.length)];

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(selected[0], now);
        osc.frequency.setValueAtTime(selected[1], now + 0.03);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(now);
        osc.stop(now + 0.08);
      } catch {}
    });
  }

  // 3. Start Game Fanfare
  public playStartGame() {
    this.withRunningSfx((ctx, dest) => {
      try {
        const now = ctx.currentTime;
        const notes = [392.0, 523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.06);

          gain.gain.setValueAtTime(0.24, now + i * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.22);

          osc.connect(gain);
          gain.connect(dest);

          osc.start(now + i * 0.06);
          osc.stop(now + i * 0.06 + 0.22);
        });
      } catch {}
    });
  }

  // 4. Correct Guess Chime - 6 distinct melodic variations
  public playCorrect() {
    this.withRunningSfx((ctx, dest) => {
      try {
        const now = ctx.currentTime;
        const chimeVariants: Array<Array<{ f: number; d: number }>> = [
          [
            { f: 523.25, d: 0.04 },
            { f: 659.25, d: 0.04 },
            { f: 783.99, d: 0.04 },
            { f: 1046.5, d: 0.16 }
          ],
          [
            { f: 698.46, d: 0.035 },
            { f: 880.0, d: 0.035 },
            { f: 1046.5, d: 0.04 },
            { f: 1318.51, d: 0.18 }
          ],
          [
            { f: 392.0, d: 0.04 },
            { f: 587.33, d: 0.04 },
            { f: 783.99, d: 0.05 },
            { f: 987.77, d: 0.16 }
          ],
          [
            { f: 659.25, d: 0.03 },
            { f: 783.99, d: 0.03 },
            { f: 880.0, d: 0.04 },
            { f: 1174.66, d: 0.18 }
          ],
          [
            { f: 587.33, d: 0.035 },
            { f: 739.99, d: 0.035 },
            { f: 880.0, d: 0.04 },
            { f: 1108.73, d: 0.17 }
          ],
          [
            { f: 440.0, d: 0.03 },
            { f: 554.37, d: 0.03 },
            { f: 659.25, d: 0.03 },
            { f: 880.0, d: 0.05 },
            { f: 1318.51, d: 0.18 }
          ]
        ];

        let chosenIdx = Math.floor(Math.random() * chimeVariants.length);
        if (chosenIdx === this.lastCorrectVariant) {
          chosenIdx = (chosenIdx + 1) % chimeVariants.length;
        }
        this.lastCorrectVariant = chosenIdx;

        const pattern = chimeVariants[chosenIdx];
        let offset = 0;

        pattern.forEach(({ f, d }, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = idx === pattern.length - 1 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(f, now + offset);

          const volume = idx === pattern.length - 1 ? 0.28 : 0.20;
          gain.gain.setValueAtTime(volume, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + d + 0.12);

          osc.connect(gain);
          gain.connect(dest);

          osc.start(now + offset);
          osc.stop(now + offset + d + 0.12);

          offset += d;
        });
      } catch {}
    });
  }

  // 5. Swap / Pass Sound - 3 distinct swoosh variations
  public playSwap() {
    this.withRunningSfx((ctx, dest) => {
      try {
        const now = ctx.currentTime;
        let variant = Math.floor(Math.random() * 3);
        if (variant === this.lastSwapVariant) {
          variant = (variant + 1) % 3;
        }
        this.lastSwapVariant = variant;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        if (variant === 0) {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(620, now);
          osc.frequency.exponentialRampToValueAtTime(160, now + 0.13);
          gain.gain.setValueAtTime(0.22, now);
          gain.gain.linearRampToValueAtTime(0.001, now + 0.13);
        } else if (variant === 1) {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
          osc.frequency.exponentialRampToValueAtTime(200, now + 0.12);
          gain.gain.setValueAtTime(0.24, now);
          gain.gain.linearRampToValueAtTime(0.001, now + 0.12);
        } else {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(750, now);
          osc.frequency.exponentialRampToValueAtTime(120, now + 0.11);
          gain.gain.setValueAtTime(0.20, now);
          gain.gain.linearRampToValueAtTime(0.001, now + 0.11);
        }

        osc.connect(gain);
        gain.connect(dest);

        osc.start(now);
        osc.stop(now + 0.14);
      } catch {}
    });
  }

  // 6. Natural Organic Mechanical Tick-Tock (Soft woodblock tone, audible on mobile)
  public playTick() {
    this.withRunningSfx((ctx, dest) => {
      try {
        const now = ctx.currentTime;
        this.tickToggle = !this.tickToggle;

        const freq = this.tickToggle ? 920 : 640;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.6, now + 0.025);

        gain.gain.setValueAtTime(0.10, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(now);
        osc.stop(now + 0.03);
      } catch {}
    });
  }

  // 7. Final 5 Seconds Urgent Dramatic Alarm
  public playUrgentTick(secondsRemaining: number) {
    this.withRunningSfx((ctx, dest) => {
      try {
        const now = ctx.currentTime;
        const stepIndex = Math.max(1, Math.min(5, secondsRemaining));
        const pitchOffset = (6 - stepIndex) * 90;

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'triangle';
        osc2.type = 'sine';

        const freq1 = 800 + pitchOffset;
        const freq2 = freq1 * 1.5;

        osc1.frequency.setValueAtTime(freq1, now);
        osc1.frequency.exponentialRampToValueAtTime(freq1 * 1.2, now + 0.08);

        osc2.frequency.setValueAtTime(freq2, now);
        osc2.frequency.exponentialRampToValueAtTime(freq2 * 1.2, now + 0.08);

        gain.gain.setValueAtTime(0.24, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(dest);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.1);
        osc2.stop(now + 0.1);
      } catch {}
    });
  }

  // 8. Elimination / Team Defeat Sound
  public playElimination() {
    this.withRunningSfx((ctx, dest) => {
      try {
        const now = ctx.currentTime;
        const notes = [311.13, 293.66, 261.63, 220.0, 164.81];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.11);

          gain.gain.setValueAtTime(0.24, now + i * 0.11);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.11 + 0.19);

          osc.connect(gain);
          gain.connect(dest);

          osc.start(now + i * 0.11);
          osc.stop(now + i * 0.11 + 0.19);
        });
      } catch {}
    });
  }

  // 9. Round Ended Resonant Gong
  public playRoundEnd() {
    this.withRunningSfx((ctx, dest) => {
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const subOsc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.7);

        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(140, now);
        subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.7);

        gain.gain.setValueAtTime(0.32, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

        osc.connect(gain);
        subOsc.connect(gain);
        gain.connect(dest);

        osc.start(now);
        subOsc.start(now);
        osc.stop(now + 0.7);
        subOsc.stop(now + 0.7);
      } catch {}
    });
  }

  // 10. Victory Fanfare
  public playVictory() {
    this.stopBGM();
    this.withRunningSfx((ctx, dest) => {
      try {
        const now = ctx.currentTime;
        const melody = [
          { f: 523.25, d: 0.11 },
          { f: 659.25, d: 0.11 },
          { f: 783.99, d: 0.11 },
          { f: 1046.5, d: 0.28 },
          { f: 880.0, d: 0.14 },
          { f: 1046.5, d: 0.14 },
          { f: 1318.51, d: 0.45 }
        ];

        let t = now;
        melody.forEach(({ f, d }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, t);

          gain.gain.setValueAtTime(0.26, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + d);

          osc.connect(gain);
          gain.connect(dest);

          osc.start(t);
          osc.stop(t + d);
          t += d * 0.92;
        });
      } catch {}
    });
  }

  // --- PROCEDURAL POLYPHONIC BACKGROUND MUSIC (BGM) ---

  public startMenuBGM() {
    this.desiredBgmMode = 'menu';
    this.syncBgmLoop();
  }

  private scheduleNextMenuBeat() {
    if (this.currentBgmMode !== 'menu' || this.isMasterMuted || !this.isBgmOn) return;
    const ctx = this.getAudioContext();
    const dest = this.getBgmDestination();
    if (!ctx || !dest || ctx.state !== 'running') {
      this.clearBgmTimer();
      return;
    }

    const stepMs = 300;
    const melodySeq = [
      523.25, 659.25, 783.99, 987.77, 783.99, 659.25, 523.25, null,
      440.0, 523.25, 659.25, 880.0, 659.25, 523.25, 440.0, null,
      587.33, 698.46, 880.0, 1046.5, 880.0, 698.46, 587.33, null,
      392.0, 493.88, 587.33, 739.99, 880.0, 739.99, 587.33, 523.25
    ];

    const bassSeq = [
      130.81, null, 130.81, null, 164.81, null, 196.0, null,
      110.0, null, 110.0, null, 130.81, null, 164.81, null,
      146.83, null, 146.83, null, 174.61, null, 220.0, null,
      98.0, null, 98.0, null, 123.47, null, 146.83, null
    ];

    try {
      const now = ctx.currentTime;
      const step = this.bgmStep % 32;
      const mNote = melodySeq[step];
      const bNote = bassSeq[step];

      if (mNote !== null) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(mNote, now);
        gain.gain.setValueAtTime(0.11, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.26);
      }

      if (bNote !== null) {
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(bNote, now);
        bassGain.gain.setValueAtTime(0.14, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
        bassOsc.connect(bassGain);
        bassGain.connect(dest);
        bassOsc.start(now);
        bassOsc.stop(now + 0.36);
      }
    } catch {}

    this.bgmStep++;
    this.clearBgmTimer();
    this.bgmTimeout = window.setTimeout(() => {
      this.scheduleNextMenuBeat();
    }, stepMs);
  }

  public startGameplayBGM(secondsRemaining: number) {
    this.gameplaySecondsRemaining = secondsRemaining;
    this.desiredBgmMode = 'game';
    this.syncBgmLoop();
  }

  public updateGameplayTempo(secondsRemaining: number) {
    this.gameplaySecondsRemaining = secondsRemaining;
  }

  private scheduleNextGameBeat() {
    if (this.currentBgmMode !== 'game' || this.isMasterMuted || !this.isBgmOn) return;
    const ctx = this.getAudioContext();
    const dest = this.getBgmDestination();
    if (!ctx || !dest || ctx.state !== 'running') {
      this.clearBgmTimer();
      return;
    }

    const secondsRemaining = this.gameplaySecondsRemaining;
    let stepMs = 240;
    if (secondsRemaining <= 5) stepMs = 140;
    else if (secondsRemaining <= 15) stepMs = 175;
    else if (secondsRemaining <= 30) stepMs = 205;

    const bassRhythm = [
      110.0, 110.0, 130.81, 146.83, 164.81, 146.83, 130.81, 98.0,
      110.0, 130.81, 146.83, 174.61, 164.81, 146.83, 110.0, 130.81
    ];

    try {
      const now = ctx.currentTime;
      const note = bassRhythm[this.bgmStep % bassRhythm.length];

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note, now);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.13);

      if (this.bgmStep % 2 === 1) {
        const shaker = ctx.createOscillator();
        const shakerGain = ctx.createGain();
        shaker.type = 'sine';
        shaker.frequency.setValueAtTime(2400 + Math.random() * 400, now);
        shakerGain.gain.setValueAtTime(0.05, now);
        shakerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        shaker.connect(shakerGain);
        shakerGain.connect(dest);

        shaker.start(now);
        shaker.stop(now + 0.03);
      }
    } catch {}

    this.bgmStep++;
    this.clearBgmTimer();
    this.bgmTimeout = window.setTimeout(() => {
      this.scheduleNextGameBeat();
    }, stepMs);
  }

  public stopBGM() {
    this.desiredBgmMode = 'none';
    this.currentBgmMode = 'none';
    this.clearBgmTimer();
    if (this.bgmGain && this.ctx) {
      try {
        this.bgmGain.gain.setValueAtTime(0, this.ctx.currentTime);
      } catch {}
    }
  }
}

export const sound = new SoundManager();
