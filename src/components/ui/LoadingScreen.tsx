'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const LOADING_MESSAGES = [
    "ENTERING THE HOUSE...",
    "SYNCING WITH BLOCKCHAIN...",
    "VERIFYING PROVABLE FAIRNESS...",
    "PREPARING NEON TABLES...",
    "ESTABLISHING SECURE VAULT...",
    "LOADING METAVERSE CASINO...",
    "CALCULATING LUCK PROTOCOLS..."
];

interface LoadingScreenProps {
    fullScreen?: boolean;
    message?: string;
}

export function LoadingScreen({ fullScreen = true, message }: LoadingScreenProps) {
    const [displayMessage, setDisplayMessage] = useState(message || LOADING_MESSAGES[0]);

    useEffect(() => {
        if (!message) {
            const interval = setInterval(() => {
                const randomMessage = LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
                setDisplayMessage(randomMessage);
            }, 2500);
            return () => clearInterval(interval);
        }
    }, [message]);

    return (
        <div className={`flex flex-col items-center justify-center bg-zinc-950 z-[9999] ${fullScreen ? 'fixed inset-0' : 'w-full h-full py-20'}`}>
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full" />
            
            <div className="relative flex flex-col items-center">
                {/* Logo Animation */}
                <motion.div
                    animate={{ 
                        scale: [1, 1.05, 1],
                        opacity: [0.8, 1, 0.8]
                    }}
                    transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="relative w-24 h-24 mb-8"
                >
                    <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse" />
                    <Image
                        src="/logo.png"
                        alt="Loading Logo"
                        fill
                        className="object-contain"
                        priority
                        sizes="96px"
                    />
                </motion.div>

                {/* Brand Name */}
                <h2 className="text-2xl font-black text-white italic tracking-tighter mb-4">
                    DOPAHOUSE
                </h2>

                {/* Progress Indicator */}
                <div className="w-48 h-1 bg-zinc-900 rounded-full overflow-hidden mb-6 relative border border-zinc-800">
                    <motion.div
                        initial={{ left: "-100%" }}
                        animate={{ left: "100%" }}
                        transition={{ 
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute top-0 bottom-0 w-1/3 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]"
                    />
                </div>

                {/* Loading Text */}
                <AnimatePresence mode="wait">
                    <motion.p
                        key={displayMessage}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.3em] font-mono italic"
                    >
                        {displayMessage}
                    </motion.p>
                </AnimatePresence>
            </div>

            {/* Corner Accents */}
            <div className="absolute top-8 left-8 w-4 h-4 border-t-2 border-l-2 border-zinc-800" />
            <div className="absolute top-8 right-8 w-4 h-4 border-t-2 border-r-2 border-zinc-800" />
            <div className="absolute bottom-8 left-8 w-4 h-4 border-b-2 border-l-2 border-zinc-800" />
            <div className="absolute bottom-8 right-8 w-4 h-4 border-b-2 border-r-2 border-zinc-800" />
        </div>
    );
}
