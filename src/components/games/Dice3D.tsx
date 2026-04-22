'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface Dice3DProps {
  isRolling: boolean;
  result: number | null;
}

export const Dice3D: React.FC<Dice3DProps> = ({ isRolling, result }) => {
  // Mapping of die face to its rotation [x, y]
  const rotations: Record<number, [number, number]> = {
    1: [0, 0],       // Front
    6: [0, 180],     // Back
    2: [0, -90],     // Left
    5: [0, 90],      // Right
    3: [-90, 0],     // Top
    4: [90, 0],      // Bottom
  };

  const finalRotation = result ? rotations[result] : [20, 20]; // Default tilted view

  return (
    <div className="perspective-1000 w-32 h-32 relative flex items-center justify-center">
      <motion.div
        className="w-20 h-20 relative"
        initial={false}
        animate={isRolling ? {
          rotateX: [0, 360, 720, 1080],
          rotateY: [0, -360, -720, -1080],
          y: [-20, 20, -20],
        } : {
          rotateX: finalRotation[0],
          rotateY: finalRotation[1],
          y: 0,
        }}
        transition={isRolling ? {
          duration: 0.6,
          repeat: Infinity,
          ease: "linear",
        } : {
          type: "spring",
          stiffness: 200,
          damping: 20,
        }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Face 1 (Front) */}
        <div className="absolute inset-0 w-20 h-20 bg-white border border-zinc-300 rounded-lg flex items-center justify-center shadow-[inset_0_0_15px_rgba(0,0,0,0.05)]" style={{ transform: 'translateZ(40px)', backfaceVisibility: 'hidden' }}>
          <div className="w-5 h-5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.4),_inset_0_2px_4px_rgba(0,0,0,0.2)]"></div>
          {/* Surface Sheen */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none rounded-lg"></div>
          {/* Rim Light */}
          <div className="absolute inset-0 rounded-lg border-t border-l border-white/80 pointer-events-none"></div>
        </div>

        {/* Face 6 (Back) */}
        <div className="absolute inset-0 w-20 h-20 bg-white border border-zinc-300 rounded-lg p-3 grid grid-cols-2 shadow-[inset_0_0_15px_rgba(0,0,0,0.05)]" style={{ transform: 'rotateY(180deg) translateZ(40px)', backfaceVisibility: 'hidden' }}>
          {[...Array(6)].map((_, i) => <div key={i} className="w-3.5 h-3.5 rounded-full bg-red-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] m-1"></div>)}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none rounded-lg"></div>
          <div className="absolute inset-0 rounded-lg border-t border-l border-white/80 pointer-events-none"></div>
        </div>

        {/* Face 2 (Left) */}
        <div className="absolute inset-0 w-20 h-20 bg-white border border-zinc-300 rounded-lg p-4 flex flex-col justify-between items-center shadow-[inset_0_0_15px_rgba(0,0,0,0.05)]" style={{ transform: 'rotateY(-90deg) translateZ(40px)', backfaceVisibility: 'hidden' }}>
            <div className="w-4 h-4 rounded-full bg-red-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] self-start"></div>
            <div className="w-4 h-4 rounded-full bg-red-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] self-end"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none rounded-lg"></div>
            <div className="absolute inset-0 rounded-lg border-t border-l border-white/80 pointer-events-none"></div>
        </div>

        {/* Face 5 (Right) */}
        <div className="absolute inset-0 w-20 h-20 bg-white border border-zinc-300 rounded-lg p-2.5 flex flex-wrap content-between justify-between shadow-[inset_0_0_15px_rgba(0,0,0,0.05)]" style={{ transform: 'rotateY(90deg) translateZ(40px)', backfaceVisibility: 'hidden' }}>
            <div className="w-full flex justify-between">
                <div className="w-3 h-3 rounded-full bg-red-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"></div>
                <div className="w-3 h-3 rounded-full bg-red-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"></div>
            </div>
            <div className="w-full flex justify-center">
                <div className="w-3 h-3 rounded-full bg-red-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"></div>
            </div>
            <div className="w-full flex justify-between">
                <div className="w-3 h-3 rounded-full bg-red-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"></div>
                <div className="w-3 h-3 rounded-full bg-red-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"></div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none rounded-lg"></div>
            <div className="absolute inset-0 rounded-lg border-t border-l border-white/80 pointer-events-none"></div>
        </div>

        {/* Face 3 (Top) */}
        <div className="absolute inset-0 w-20 h-20 bg-white border border-zinc-300 rounded-lg p-4 flex flex-col justify-between items-end shadow-[inset_0_0_15px_rgba(0,0,0,0.05)]" style={{ transform: 'rotateX(90deg) translateZ(40px)', backfaceVisibility: 'hidden' }}>
            <div className="w-4 h-4 rounded-full bg-red-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"></div>
            <div className="w-4 h-4 rounded-full bg-red-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] self-center"></div>
            <div className="w-4 h-4 rounded-full bg-red-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] self-start"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none rounded-lg"></div>
            <div className="absolute inset-0 rounded-lg border-t border-l border-white/80 pointer-events-none"></div>
        </div>

        {/* Face 4 (Bottom) */}
        <div className="absolute inset-0 w-20 h-20 bg-white border border-zinc-300 rounded-lg p-3 flex flex-wrap content-between justify-between shadow-[inset_0_0_15px_rgba(0,0,0,0.05)]" style={{ transform: 'rotateX(-90deg) translateZ(40px)', backfaceVisibility: 'hidden' }}>
            <div className="w-full flex justify-between">
                <div className="w-3.5 h-3.5 rounded-full bg-red-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-red-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"></div>
            </div>
            <div className="w-full flex justify-between">
                <div className="w-3.5 h-3.5 rounded-full bg-red-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-red-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"></div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none rounded-lg"></div>
            <div className="absolute inset-0 rounded-lg border-t border-l border-white/80 pointer-events-none"></div>
        </div>
      </motion.div>

      {/* Dynamic Shadow */}
      <motion.div 
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-16 h-4 bg-black/30 blur-xl rounded-full"
        animate={{
            scale: isRolling ? [1, 1.4, 1] : 1,
            opacity: isRolling ? [0.2, 0.5, 0.2] : 0.5,
        }}
        transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
      ></motion.div>
    </div>
  );
};
