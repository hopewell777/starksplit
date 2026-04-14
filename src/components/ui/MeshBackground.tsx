"use client";

import { motion } from "framer-motion";

export const MeshBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
      {/* Primary Glow */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-[20%] -left-[10%] w-[80%] h-[80%] rounded-full bg-accent-purple/20 blur-[120px]"
      />
      
      {/* Secondary Glow */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
          x: [0, -40, 0],
          y: [0, 60, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute -bottom-[20%] -right-[10%] w-[80%] h-[80%] rounded-full bg-accent-cyan/10 blur-[120px]"
      />

      {/* Center Soft Light */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent" />
    </div>
  );
};
