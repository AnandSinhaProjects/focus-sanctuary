import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Beautiful multi-stage tree ─────────────────────────────────────── */
const Tree = ({ stage }) => (
  <svg viewBox="0 0 120 130" className="w-32 h-36 mx-auto drop-shadow-sm">
    {/* Soil */}
    <ellipse cx="60" cy="122" rx="35" ry="7" fill="#d4a574" opacity="0.4" />

    {/* Trunk */}
    <rect x="54" y="75" width="12" height="47" rx="6" fill="#a0714f" opacity="0.75" />

    {/* Stage 1 – tiny sprout */}
    {stage >= 1 && (
      <motion.ellipse
        cx="60" cy="70" rx="10" ry="12"
        fill="#86efac"
        initial={{ scale: 0, originX: '60px', originY: '70px' }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      />
    )}

    {/* Stage 2 – side leaves */}
    {stage >= 2 && (
      <>
        <motion.ellipse cx="40" cy="68" rx="16" ry="11"
          fill="#4ade80"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        />
        <motion.ellipse cx="80" cy="68" rx="16" ry="11"
          fill="#4ade80"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        />
      </>
    )}

    {/* Stage 3 – fuller canopy */}
    {stage >= 3 && (
      <>
        <motion.ellipse cx="60" cy="52" rx="22" ry="18"
          fill="#86efac"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        />
        <motion.ellipse cx="42" cy="50" rx="14" ry="12"
          fill="#4ade80"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        />
        <motion.ellipse cx="78" cy="50" rx="14" ry="12"
          fill="#4ade80"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        />
      </>
    )}

    {/* Stage 4 – blossoms */}
    {stage >= 4 && (
      <>
        <motion.ellipse cx="60" cy="34" rx="18" ry="16"
          fill="#86efac"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ duration: 0.4 }}
        />
        {/* Pink flowers */}
        {[
          [44, 44], [76, 44], [58, 26], [68, 36], [50, 34]
        ].map(([cx, cy], i) => (
          <motion.circle key={i} cx={cx} cy={cy} r="5"
            fill="#fda4af"
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 + i * 0.07 }}
          />
        ))}
        {/* Flower centers */}
        {[
          [44, 44], [76, 44], [58, 26], [68, 36], [50, 34]
        ].map(([cx, cy], i) => (
          <circle key={`c${i}`} cx={cx} cy={cy} r="2" fill="#fef08a" />
        ))}
      </>
    )}
  </svg>
);

/* ── Stage labels ────────────────────────────────────────────────────── */
const STAGE_LABELS = ['Seedling', 'Sapling', 'Young Tree', 'Blooming Tree'];

const SanctuaryProgress = ({ level, xp, xpToNextLevel }) => {
  const xpInLevel = xp % xpToNextLevel;
  const progress  = Math.min((xpInLevel / xpToNextLevel) * 100, 100);

  const stage = xpInLevel < xpToNextLevel * 0.25 ? 1
              : xpInLevel < xpToNextLevel * 0.50 ? 2
              : xpInLevel < xpToNextLevel * 0.75 ? 3
              : 4;

  const [showXpGain, setShowXpGain] = useState(false);
  const prevXpRef = useRef(xp);
  useEffect(() => {
    if (xp > prevXpRef.current) {
      setShowXpGain(true);
      const t = setTimeout(() => setShowXpGain(false), 1500);
      prevXpRef.current = xp;
      return () => clearTimeout(t);
    }
  }, [xp]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Tree */}
      <div className="relative">
        <Tree stage={stage} />
        <AnimatePresence>
          {showXpGain && (
            <motion.div
              key="xp"
              className="absolute -top-2 left-1/2 -translate-x-1/2 text-sm font-bold text-pink-400 drop-shadow"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: -8 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              +100 XP!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stage label */}
      <p className="text-xs font-medium text-violet-400 dark:text-violet-300 tracking-wide uppercase">
        {STAGE_LABELS[stage - 1]}
      </p>

      {/* Level badge */}
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-gray-700 dark:text-gray-200">
          Level {level}
        </span>
      </div>

      {/* XP text */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {xpInLevel} <span className="text-gray-400 dark:text-gray-500">/</span> {xpToNextLevel} XP
      </p>

      {/* Progress bar */}
      <div className="w-full bg-gray-200/60 dark:bg-white/10 rounded-full h-2.5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #f9a8d4, #c4b5fd)' }}
          animate={{ width: `${progress}%` }}
          initial={{ width: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

export default SanctuaryProgress;
