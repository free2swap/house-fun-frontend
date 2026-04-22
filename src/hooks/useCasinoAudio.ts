'use client';

import { useCallback, useRef, useEffect } from 'react';

export function useCasinoAudio() {
    const clickAudio = useRef<HTMLAudioElement | null>(null);
    const heartbeatAudio = useRef<HTMLAudioElement | null>(null);
    const winAudio = useRef<HTMLAudioElement | null>(null);
    const coinSpinAudio = useRef<HTMLAudioElement | null>(null);
    const diceRollAudio = useRef<HTMLAudioElement | null>(null);
    const luckyTickAudio = useRef<HTMLAudioElement | null>(null);
    const unlockedRef = useRef(false);

    useEffect(() => {
        // Initialize all audio elements
        clickAudio.current = new Audio('/sounds/chip.mp3');
        clickAudio.current.volume = 0.5;

        heartbeatAudio.current = new Audio('/sounds/fast-heartbeat-493.wav');
        heartbeatAudio.current.loop = true;
        heartbeatAudio.current.volume = 0.4;

        winAudio.current = new Audio('/sounds/slot-machine-win-alarm-1995.wav');
        winAudio.current.volume = 0.6;

        coinSpinAudio.current = new Audio('/sounds/coinspin.wav');
        coinSpinAudio.current.volume = 0.5;

        diceRollAudio.current = new Audio('/sounds/diceroll.wav');
        diceRollAudio.current.volume = 0.5;

        luckyTickAudio.current = new Audio('/sounds/luckroll.wav');
        luckyTickAudio.current.volume = 0.3;

        // Unlock ALL audio elements
        const unlockOnce = () => {
            if (unlockedRef.current) return;
            unlockedRef.current = true;

            [
                heartbeatAudio.current,
                winAudio.current,
                clickAudio.current,
                coinSpinAudio.current,
                diceRollAudio.current,
                luckyTickAudio.current
            ].forEach(audio => {
                if (!audio) return;
                audio.play()
                    .then(() => { audio.pause(); audio.currentTime = 0; })
                    .catch(() => { });
            });

            document.removeEventListener('click', unlockOnce, true);
            document.removeEventListener('touchstart', unlockOnce, true);
        };

        document.addEventListener('click', unlockOnce, true);
        document.addEventListener('touchstart', unlockOnce, true);

        return () => {
            document.removeEventListener('click', unlockOnce, true);
            document.removeEventListener('touchstart', unlockOnce, true);
            if (heartbeatAudio.current) {
                heartbeatAudio.current.pause();
            }
        };
    }, []);

    const playClick = useCallback(() => {
        const a = clickAudio.current;
        if (!a) return;
        a.currentTime = 0;
        a.play().catch(() => { });
    }, []);

    const playHeartbeat = useCallback(() => {
        const a = heartbeatAudio.current;
        if (!a) return;
        if (a.paused) {
            a.play().catch(e => console.log('[Audio] heartbeat error:', e));
        }
    }, []);

    const stopHeartbeat = useCallback(() => {
        const a = heartbeatAudio.current;
        if (!a) return;
        a.pause();
        a.currentTime = 0;
    }, []);

    const playWin = useCallback(() => {
        const a = winAudio.current;
        if (!a) return;
        a.currentTime = 0;
        a.play().catch(e => console.log('[Audio] win error:', e));
    }, []);

    // Synthesized buzzer via Web Audio API — no file needed, works everywhere
    const playLose = useCallback(() => {
        try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            // Deep, mournful sigh-like sound
            osc.type = 'sine';
            osc.frequency.setValueAtTime(100, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.8);
            
            gain.gain.setValueAtTime(0.4, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.8);
        } catch (e) {
            console.log('[Audio] lose error:', e);
        }
    }, []);

    const playCoinSpin = useCallback(() => {
        const a = coinSpinAudio.current;
        if (!a) return;
        a.currentTime = 0;
        a.play().catch(() => { });
    }, []);

    const playDiceRoll = useCallback(() => {
        const a = diceRollAudio.current;
        if (!a) return;
        a.currentTime = 0;
        a.play().catch(() => { });
    }, []);

    const playLuckyTick = useCallback(() => {
        const a = luckyTickAudio.current;
        if (!a) return;
        a.currentTime = 0;
        a.play().catch(() => { });
    }, []);

    return { 
        playClick, 
        playHeartbeat, 
        stopHeartbeat, 
        playWin, 
        playLose, 
        playCoinSpin, 
        playDiceRoll, 
        playLuckyTick 
    };
}
