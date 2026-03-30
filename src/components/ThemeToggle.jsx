import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDarkMode } from '../hooks/useDarkMode';

export default function ThemeToggle() {
  const dark = useDarkMode();

  const [theme, setTheme] = useState(() => {
    const s = localStorage.getItem('theme');
    if (s) return s;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const border  = dark ? 'rgba(255,255,255,0.12)' : '#E2E8F0';
  const bgBase  = dark ? 'rgba(255,255,255,0.06)' : 'transparent';
  const bgHover = dark ? 'rgba(255,255,255,0.12)' : '#F1F5F9';

  return (
    <motion.button
      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
      aria-label="Toggle theme"
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 40, height: 40, borderRadius: '50%',
        border: `1.5px solid ${border}`, background: bgBase, cursor: 'pointer',
      }}
      onMouseEnter={e => e.currentTarget.style.background = bgHover}
      onMouseLeave={e => e.currentTarget.style.background = bgBase}
    >
      {theme === 'light'
        ? <Moon size={17} color="#64748B" />
        : <Sun  size={17} color="#FCD34D" />
      }
    </motion.button>
  );
}
