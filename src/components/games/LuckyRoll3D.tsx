'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LuckyRoll3DProps {
  isRolling: boolean;
  result: number | null;
  onTick?: () => void;
}

export const LuckyRoll3D: React.FC<LuckyRoll3DProps> = ({ isRolling, result, onTick }) => {
  const [displayValue, setDisplayValue] = useState(0);

  // During rolling, we show random fast-changing numbers
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRolling) {
      interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 100));
        if (onTick) onTick();
      }, 50);
    } else if (result !== null) {
      setDisplayValue(result);
    }
    return () => clearInterval(interval);
  }, [isRolling, result, onTick]);

  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      {/* Outer Rotating Energy Ring with Comet Effect */}
      <div className="absolute inset-0 border-4 border-dashed border-emerald-500/10 rounded-full"></div>
      <motion.div
        className="absolute inset-0 rounded-full border-t-4 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.4)]"
        animate={{ rotate: 360 }}
        transition={{ duration: isRolling ? 1 : 4, repeat: Infinity, ease: "linear" }}
      ></motion.div>
      
      {/* 3D Cylinder Container */}
      <div className="perspective-1000 w-32 h-40 relative flex items-center justify-center overflow-hidden bg-zinc-950 rounded-xl border border-zinc-800 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
        
        {/* Rim Light / Glow Sweep */}
        <motion.div 
            className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-emerald-500/20 to-transparent z-10"
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 1, repeat: Infinity }}
        ></motion.div>

        {/* Scanning Line */}
        <motion.div 
            className="absolute inset-x-0 top-1/2 h-0.5 bg-emerald-300 shadow-[0_0_20px_rgba(110,231,183,1),_0_0_40px_rgba(52,211,153,0.5)] z-20"
            animate={isRolling ? { scaleY: [1, 2.5, 1], opacity: [0.7, 1, 0.7] } : {}}
            transition={{ duration: 0.1, repeat: Infinity }}
        ></motion.div>
        
        {/* Glow behind number */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.2)_0%,_transparent_70%)] z-0"></div>

        <AnimatePresence mode="popLayout">
          <motion.div
            key={displayValue}
            initial={{ y: isRolling ? 20 : 40, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: isRolling ? -20 : -40, opacity: 0, scale: 0.8 }}
            transition={{ duration: isRolling ? 0.05 : 0.4, ease: "easeOut" }}
            className={`text-7xl font-black italic tracking-tighter z-10 ${isRolling ? 'text-emerald-400/60 blur-[1px]' : 'text-white drop-shadow-[0_0_15px_rgba(52,211,153,0.6)]'}`}
          >
            {displayValue.toString().padStart(2, '0')}
          </motion.div>
        </AnimatePresence>

        {/* Depth Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black via-transparent to-black z-10 opacity-70"></div>
        
        {/* Glass Reflection */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/5 to-transparent z-20"></div>
      </div>

      {/* Side Decorative Elements - Marquee Effect */}
      <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-8 h-24 bg-zinc-900/90 border border-zinc-800 rounded-lg flex flex-col justify-around items-center p-1 shadow-2xl">
          {[...Array(6)].map((_, i) => (
              <motion.div 
                key={i} 
                className="w-1.5 h-1.5 rounded-full bg-zinc-700"
                animate={isRolling ? {
                    backgroundColor: ["#3f3f46", "#10b981", "#3f3f46"],
                    boxShadow: ["0 0 0px rgba(0,0,0,0)", "0 0 8px rgba(16,185,129,0.8)", "0 0 0px rgba(0,0,0,0)"]
                } : {}}
                transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.1
                }}
              ></motion.div>
          ))}
      </div>
      <div className="absolute -right-5 top-1/2 -translate-y-1/2 w-8 h-24 bg-zinc-900/90 border border-zinc-800 rounded-lg flex flex-col justify-around items-center p-1 shadow-2xl">
          {[...Array(6)].map((_, i) => (
              <motion.div 
                key={i} 
                className="w-1.5 h-1.5 rounded-full bg-zinc-700"
                animate={isRolling ? {
                    backgroundColor: ["#3f3f46", "#10b981", "#3f3f46"],
                    boxShadow: ["0 0 0px rgba(0,0,0,0)", "0 0 8px rgba(16,185,129,0.8)", "0 0 0px rgba(0,0,0,0)"]
                } : {}}
                transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.1
                }}
              ></motion.div>
          ))}
      </div>
    </div>
  );
};
