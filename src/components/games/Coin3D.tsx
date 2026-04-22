'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface Coin3DProps {
  isFlipping: boolean;
  result: 'HEADS' | 'TAILS' | null;
}

export const Coin3D: React.FC<Coin3DProps> = ({ isFlipping, result }) => {
  // Determine final rotation based on result
  // Heads is 0deg, Tails is 180deg (flip to back)
  // When flipping, we add multiple rotations
  const finalRotation = result === 'HEADS' ? 0 : 180;
  
  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <motion.div
        className="w-24 h-24 relative"
        initial={false}
        animate={{
          rotateY: isFlipping ? [0, 720, 1440, 2160] : finalRotation,
          y: isFlipping ? [-20, 20, -20] : 0,
        }}
        transition={{
          duration: isFlipping ? 0.6 : 0.8,
          ease: isFlipping ? "linear" : "easeOut",
          repeat: isFlipping ? Infinity : 0,
        }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front Side (Heads - Gold) */}
        <div 
          className="absolute inset-0 w-full h-full rounded-full flex items-center justify-center border-4 border-yellow-500 shadow-xl"
          style={{
            background: 'radial-gradient(circle at 35% 35%, #fde68a 0%, #d97706 100%)',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(1px)',
          }}
        >
          <div className="text-6xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] select-none">H</div>
        </div>

        {/* Back Side (Tails - Silver) */}
        <div 
          className="absolute inset-0 w-full h-full rounded-full flex items-center justify-center border-4 border-zinc-300 shadow-xl"
          style={{
            background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #a1a1aa 100%)',
            transform: 'rotateY(180deg) translateZ(1px)',
            backfaceVisibility: 'hidden',
          }}
        >
          <div className="text-6xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] select-none">T</div>
        </div>

        {/* Thickness */}
        <div 
            className="absolute inset-0 rounded-full bg-zinc-800"
            style={{ transform: 'translateZ(0px)' }}
        ></div>
      </motion.div>
    </div>
  );
};
