// Ashi vs Zombie - Web Audio Synthesizer Engine
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.bgmPlaying = false;
        this.bgmInterval = null;
        this.bgmStep = 0;
        this.bgmTheme = 'day'; // day, night, pool, roof, boss
        this.soundEnabled = true;
        this.musicEnabled = true;
        this.masterVolume = 0.7;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setMusicEnabled(val) {
        this.musicEnabled = val;
        if (!val && this.bgmPlaying) {
            this.stopBGM();
        } else if (val && !this.bgmPlaying) {
            this.startBGM(this.bgmTheme);
        }
    }

    setSoundEnabled(val) {
        this.soundEnabled = val;
    }

    // --- Sound Effects ---

    playShoot(type = 'pea') {
        if (!this.soundEnabled) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        if (type === 'ice') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(900, now);
            osc.frequency.exponentialRampToValueAtTime(300, now + 0.12);
            gain.gain.setValueAtTime(0.25 * this.masterVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        } else if (type === 'gatling') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(650, now);
            osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);
            gain.gain.setValueAtTime(0.3 * this.masterVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        } else if (type === 'web') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.linearRampToValueAtTime(700, now + 0.1);
            gain.gain.setValueAtTime(0.15 * this.masterVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        } else { // standard pea
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(520, now);
            osc.frequency.exponentialRampToValueAtTime(180, now + 0.09);
            gain.gain.setValueAtTime(0.28 * this.masterVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
        }

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
    }

    playHit(type = 'splat') {
        if (!this.soundEnabled) return;
        this.init();
        const now = this.ctx.currentTime;

        if (type === 'metal') {
            // Metallic bucket or shield hit
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(1200, now);
            osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
            gain.gain.setValueAtTime(0.35 * this.masterVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.09);
            return;
        }

        // Flesh splat
        const bufSize = this.ctx.sampleRate * 0.06;
        const buffer = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.3));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(type === 'ice' ? 2400 : 900, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(now);
    }

    playSun() {
        if (!this.soundEnabled) return;
        this.init();
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            const now = this.ctx.currentTime + idx * 0.055;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.2 * this.masterVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.25);
        });
    }

    playPlant() {
        if (!this.soundEnabled) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.12);
        gain.gain.setValueAtTime(0.4 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.13);
    }

    playShovel() {
        if (!this.soundEnabled) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
        gain.gain.setValueAtTime(0.25 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.11);
    }

    playChomp() {
        if (!this.soundEnabled) return;
        this.init();
        const now = this.ctx.currentTime;
        // Big crunchy bite
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.14);
        gain.gain.setValueAtTime(0.5 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
    }

    playBoom() {
        if (!this.soundEnabled) return;
        this.init();
        const now = this.ctx.currentTime;
        // Sub rumble + noise burst
        const bufSize = this.ctx.sampleRate * 0.5;
        const buffer = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.25));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(80, now + 0.45);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.8 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(now);

        // Sub bass drop
        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(130, now);
        sub.frequency.exponentialRampToValueAtTime(25, now + 0.4);
        subGain.gain.setValueAtTime(0.7 * this.masterVolume, now);
        subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        sub.connect(subGain);
        subGain.connect(this.ctx.destination);
        sub.start(now);
        sub.stop(now + 0.45);
    }

    playJalapeno() {
        if (!this.soundEnabled) return;
        this.init();
        const now = this.ctx.currentTime;
        // Fire whoosh
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.2);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.6);
        gain.gain.setValueAtTime(0.5 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.65);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.7);
    }

    playMower() {
        if (!this.soundEnabled) return;
        this.init();
        const now = this.ctx.currentTime;
        // Flying Ashi engine revving up
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(750, now + 0.4);
        osc.frequency.linearRampToValueAtTime(600, now + 1.2);
        gain.gain.setValueAtTime(0.4 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 1.5);
    }

    playSquash() {
        if (!this.soundEnabled) return;
        this.init();
        const now = this.ctx.currentTime;
        // Whistle up
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(250, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.25);
        gain.gain.setValueAtTime(0.3 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.26);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.28);

        // Heavy slam
        setTimeout(() => {
            this.playBoom();
        }, 260);
    }

    playZombieGroan() {
        if (!this.soundEnabled) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110 + Math.random() * 30, now);
        osc.frequency.linearRampToValueAtTime(90, now + 0.35);
        osc.frequency.linearRampToValueAtTime(115, now + 0.7);
        gain.gain.setValueAtTime(0.22 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.75);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.8);
    }

    playHugeWave() {
        if (!this.soundEnabled) return;
        this.init();
        const now = this.ctx.currentTime;
        // Siren
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(750, now + 0.4);
        osc.frequency.linearRampToValueAtTime(440, now + 0.8);
        osc.frequency.linearRampToValueAtTime(750, now + 1.2);
        gain.gain.setValueAtTime(0.35 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 1.6);
    }

    playWin() {
        if (!this.soundEnabled) return;
        this.init();
        const chords = [
            [523.25, 659.25, 783.99], // C
            [587.33, 739.99, 880.00], // D
            [659.25, 830.61, 987.77], // E
            [783.99, 987.77, 1174.66, 1567.98] // G chord fanfare!
        ];
        chords.forEach((chord, i) => {
            const time = this.ctx.currentTime + i * 0.16;
            const dur = i === chords.length - 1 ? 0.7 : 0.14;
            chord.forEach(freq => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, time);
                gain.gain.setValueAtTime(0.18 * this.masterVolume, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(time);
                osc.stop(time + dur + 0.05);
            });
        });
    }

    playLose() {
        if (!this.soundEnabled) return;
        this.init();
        const freqs = [349.23, 329.63, 311.13, 293.66]; // F, E, Eb, D sad descent
        freqs.forEach((freq, i) => {
            const time = this.ctx.currentTime + i * 0.32;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, time);
            osc.frequency.linearRampToValueAtTime(freq - 15, time + 0.28);
            gain.gain.setValueAtTime(0.3 * this.masterVolume, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(time);
            osc.stop(time + 0.33);
        });
    }

    // --- Dynamic Procedural BGM Engine ---
    startBGM(theme = 'day') {
        this.bgmTheme = theme;
        if (!this.musicEnabled) return;
        this.init();
        if (this.bgmPlaying) this.stopBGM();

        this.bgmPlaying = true;
        this.bgmStep = 0;

        // PvZ themed scales
        // Day: C major / A minor bouncy
        const dayBass = [130.81, 0, 164.81, 146.83, 130.81, 196.00, 164.81, 0];
        const dayMelody = [523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 392.00];

        // Night: Spooky minor / Phrygian
        const nightBass = [110.00, 0, 123.47, 130.81, 110.00, 146.83, 123.47, 0];
        const nightMelody = [440.00, 493.88, 523.25, 659.25, 587.33, 523.25, 493.88, 329.63];

        // Boss: Fast driving chromatic riff
        const bossBass = [98.00, 98.00, 116.54, 110.00, 98.00, 130.81, 123.47, 110.00];
        const bossMelody = [783.99, 830.61, 783.99, 698.46, 783.99, 880.00, 932.33, 783.99];

        const tempo = theme === 'boss' ? 140 : 175; // ms per step

        this.bgmInterval = setInterval(() => {
            if (!this.musicEnabled || !this.bgmPlaying) return;
            const now = this.ctx.currentTime;
            const step = this.bgmStep % 8;
            this.bgmStep++;

            let bassSeq = dayBass;
            let melSeq = dayMelody;
            if (this.bgmTheme === 'night') {
                bassSeq = nightBass;
                melSeq = nightMelody;
            } else if (this.bgmTheme === 'boss') {
                bassSeq = bossBass;
                melSeq = bossMelody;
            }

            // Bass note
            const bFreq = bassSeq[step];
            if (bFreq > 0) {
                const bOsc = this.ctx.createOscillator();
                const bGain = this.ctx.createGain();
                bOsc.type = this.bgmTheme === 'boss' ? 'sawtooth' : 'triangle';
                bOsc.frequency.setValueAtTime(bFreq, now);
                bGain.gain.setValueAtTime(0.18 * this.masterVolume, now);
                bGain.gain.exponentialRampToValueAtTime(0.001, now + (tempo / 1000) * 0.9);
                bOsc.connect(bGain);
                bGain.connect(this.ctx.destination);
                bOsc.start(now);
                bOsc.stop(now + tempo / 1000);
            }

            // High hat / percussive tick
            if (step % 2 === 0) {
                const hatOsc = this.ctx.createOscillator();
                const hatGain = this.ctx.createGain();
                hatOsc.type = 'highpass';
                hatOsc.frequency.setValueAtTime(6000, now);
                hatGain.gain.setValueAtTime(0.04 * this.masterVolume, now);
                hatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
                hatOsc.connect(hatGain);
                hatGain.connect(this.ctx.destination);
                hatOsc.start(now);
                hatOsc.stop(now + 0.05);
            }

            // Melody note on specific beats
            if (step % 2 === 1 || (this.bgmTheme === 'boss' && step % 2 === 0)) {
                const mFreq = melSeq[step];
                const mOsc = this.ctx.createOscillator();
                const mGain = this.ctx.createGain();
                mOsc.type = 'sine';
                mOsc.frequency.setValueAtTime(mFreq, now);
                mGain.gain.setValueAtTime(0.09 * this.masterVolume, now);
                mGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                mOsc.connect(mGain);
                mGain.connect(this.ctx.destination);
                mOsc.start(now);
                mOsc.stop(now + 0.16);
            }
        }, tempo);
    }

    stopBGM() {
        if (this.bgmInterval) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
        this.bgmPlaying = false;
    }
}

// Global audio singleton
window.AudioMgr = new SoundEngine();

