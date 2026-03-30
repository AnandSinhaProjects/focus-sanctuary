import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, ListTodo } from 'lucide-react';

import Timer         from './components/Timer';
import TaskList      from './components/TaskList';
import ThemeToggle   from './components/ThemeToggle';
import SettingsModal from './components/SettingsModal';
import { useDarkMode } from './hooks/useDarkMode';

const DEFAULT_SETTINGS = {
  workDuration:            25 * 60,
  shortBreakDuration:       5 * 60,
  longBreakDuration:       15 * 60,
  sessionsBeforeLongBreak: 4,
  autoStartNextSession:    false,
};

function getDuration(type, s) {
  if (type === 'work')       return s.workDuration;
  if (type === 'shortBreak') return s.shortBreakDuration;
  return s.longBreakDuration;
}

function playChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.38;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);
      osc.start(t); osc.stop(t + 0.65);
    });
    setTimeout(() => ctx.close(), 2500);
  } catch (_) {}
}

function getDateString() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function App() {
  const dark = useDarkMode();

  const c = {
    text:       dark ? '#F1F5F9' : '#0F172A',
    textSub:    dark ? '#94A3B8' : '#64748B',
    textMuted:  dark ? '#475569' : '#94A3B8',
    border:     dark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
    trackBg:    dark ? '#1E293B' : '#F1F5F9',
    iconBtn:    dark ? 'rgba(255,255,255,0.06)' : 'transparent',
    iconBorder: dark ? 'rgba(255,255,255,0.12)' : '#E2E8F0',
    iconHover:  dark ? 'rgba(255,255,255,0.12)' : '#F1F5F9',
    drawerBg:   dark ? '#1E293B' : '#ffffff',
  };

  const [settings, setSettings] = useState(() => {
    try { return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem('pomodoroSettings') || '{}') }; }
    catch { return DEFAULT_SETTINGS; }
  });

  const [sessionType,  setSessionType]  = useState('work');
  const [timeLeft,     setTimeLeft]     = useState(settings.workDuration);
  const [totalTime,    setTotalTime]    = useState(settings.workDuration);
  const [isActive,     setIsActive]     = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [tasks,        setTasks]        = useState(() => {
    try { return JSON.parse(localStorage.getItem('pomodoroTasks') || '[]'); }
    catch { return []; }
  });
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showSettings,   setShowSettings]   = useState(false);
  const [showTaskDrawer, setShowTaskDrawer] = useState(false);

  const sessionTypeRef  = useRef(sessionType);
  const selectedTaskRef = useRef(selectedTaskId);
  const settingsRef     = useRef(settings);
  const sessionCountRef = useRef(sessionCount);
  const isActiveRef     = useRef(isActive);

  useEffect(() => { sessionTypeRef.current  = sessionType;    }, [sessionType]);
  useEffect(() => { selectedTaskRef.current = selectedTaskId; }, [selectedTaskId]);
  useEffect(() => { settingsRef.current     = settings;       }, [settings]);
  useEffect(() => { sessionCountRef.current = sessionCount;   }, [sessionCount]);
  useEffect(() => { isActiveRef.current     = isActive;       }, [isActive]);

  useEffect(() => { localStorage.setItem('pomodoroSettings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('pomodoroTasks',    JSON.stringify(tasks));    }, [tasks]);

  const handleComplete = useCallback(() => {
    playChime();
    setIsActive(false);
    const type = sessionTypeRef.current, s = settingsRef.current;
    const taskId = selectedTaskRef.current, count = sessionCountRef.current;
    if (type === 'work' && taskId)
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completedPomos: t.completedPomos + 1 } : t));
    if (!s.autoStartNextSession) return;
    let nextType, nextCount = count;
    if (type === 'work') {
      nextCount = count + 1; setSessionCount(nextCount);
      nextType = nextCount % s.sessionsBeforeLongBreak === 0 ? 'longBreak' : 'shortBreak';
    } else { nextType = 'work'; }
    const dur = getDuration(nextType, s);
    setSessionType(nextType); setTimeLeft(dur); setTotalTime(dur); setIsActive(true);
  }, []);

  const handleCompleteRef = useRef(handleComplete);
  useEffect(() => { handleCompleteRef.current = handleComplete; }, [handleComplete]);

  useEffect(() => {
    if (!isActive) return;
    if (timeLeft <= 0) { handleCompleteRef.current(); return; }
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [isActive, timeLeft]);

  const toggleTimer   = () => setIsActive(a => !a);
  const resetTimer    = () => { setIsActive(false); setTimeLeft(totalTime); };
  const switchSession = (type) => {
    const dur = getDuration(type, settings);
    setIsActive(false); setSessionType(type); setTimeLeft(dur); setTotalTime(dur);
  };
  const updateSettings = (s) => {
    setSettings(s);
    if (!isActiveRef.current) { const d = getDuration(sessionTypeRef.current, s); setTimeLeft(d); setTotalTime(d); }
  };
  const addTask    = (title, tp) => setTasks(p => [...p, { id: Date.now(), title, targetPomos: tp, completedPomos: 0, done: false }]);
  const toggleDone = (id) => setTasks(p => p.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTask = (id) => { setTasks(p => p.filter(t => t.id !== id)); if (selectedTaskId === id) setSelectedTaskId(null); };

  const doneCount    = tasks.filter(t => t.done).length;
  const progressPct  = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;
  const selectedTask = tasks.find(t => t.id === selectedTaskId) || null;

  const iconBtnStyle = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 40, height: 40, borderRadius: '50%',
    border: `1.5px solid ${c.iconBorder}`, background: c.iconBtn, cursor: 'pointer',
  };

  const taskListProps = { tasks, selectedTaskId, onSelect: setSelectedTaskId, onAdd: addTask, onToggleDone: toggleDone, onDelete: deleteTask, onReorder: setTasks, dark };

  return (
    <div style={{ minHeight: '100vh', padding: '20px 16px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* ── Header ── */}
        <motion.div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        >
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: c.text }}>
            Focus Sanctuary
          </h1>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Tasks button — mobile only */}
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowTaskDrawer(true)}
              className="mobile-only"
              aria-label="Open tasks"
              style={{ ...iconBtnStyle, position: 'relative' }}
              onMouseEnter={e => e.currentTarget.style.background = c.iconHover}
              onMouseLeave={e => e.currentTarget.style.background = c.iconBtn}
            >
              <ListTodo size={17} color={c.textSub} />
              {tasks.length > 0 && (
                <span style={{
                  position: 'absolute', top: -2, right: -2,
                  width: 16, height: 16, borderRadius: '50%',
                  background: '#3B82F6', color: '#fff',
                  fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {tasks.length}
                </span>
              )}
            </motion.button>

            <ThemeToggle />

            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettings(true)}
              aria-label="Settings"
              style={iconBtnStyle}
              onMouseEnter={e => e.currentTarget.style.background = c.iconHover}
              onMouseLeave={e => e.currentTarget.style.background = c.iconBtn}
            >
              <Settings size={17} color={c.textSub} />
            </motion.button>
          </div>
        </motion.div>

        {/* ── Grid: left-col first in DOM but CSS orders timer first on mobile ── */}
        <div className="main-grid">

          {/* Left column — Daily Progress + Tasks (desktop only tasks) */}
          <div className="left-col left-panel">

            {/* Daily Progress */}
            <motion.div className="app-card" style={{ padding: '20px 24px' }}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <p style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: c.text }}>
                Daily Progress
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ padding: '2px 10px', borderRadius: 99, background: '#3B82F6', color: '#fff', fontSize: 12, fontWeight: 700 }}>
                  {doneCount}/{tasks.length}
                </span>
                <span style={{ fontSize: 13, color: c.textSub }}>Tasks completed</span>
                <span style={{ marginLeft: 'auto', fontSize: 12, color: c.textMuted }}>{getDateString()}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, height: 10, borderRadius: 99, overflow: 'hidden', background: c.trackBg }}>
                  <motion.div
                    style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg,#3B82F6,#60A5FA)' }}
                    animate={{ width: `${progressPct}%` }} initial={{ width: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                  />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, minWidth: 36, textAlign: 'right', color: c.textSub }}>
                  {progressPct}%
                </span>
              </div>
            </motion.div>

            {/* Task List — desktop only, hidden on mobile */}
            <motion.div className="app-card desktop-tasks"
              style={{ padding: '20px 24px' }}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
              <TaskList {...taskListProps} />
            </motion.div>
          </div>

          {/* Timer column */}
          <motion.div className="app-card right-col"
            style={{ padding: '32px 40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
            <Timer
              timeLeft={timeLeft} totalTime={totalTime}
              isActive={isActive} sessionType={sessionType}
              selectedTask={selectedTask} tasks={tasks} sessionCount={sessionCount}
              onToggle={toggleTimer} onReset={resetTimer}
              onSwitchSession={switchSession} onSelectTask={setSelectedTaskId} dark={dark}
            />
          </motion.div>
        </div>
      </div>

      {/* ── Mobile Task Drawer ── */}
      <AnimatePresence>
        {showTaskDrawer && (
          <>
            {/* Backdrop */}
            <motion.div
              className="task-drawer-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowTaskDrawer(false)}
            />
            {/* Drawer */}
            <motion.div
              className="task-drawer app-card"
              style={{ background: c.drawerBg, padding: '0 20px 32px' }}
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            >
              <div className="drawer-handle" />
              <div style={{ padding: '16px 0 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: c.text }}>Tasks</span>
                <button
                  onClick={() => setShowTaskDrawer(false)}
                  style={{
                    fontSize: 12, color: '#3B82F6', fontWeight: 600,
                    background: 'none', border: 'none', cursor: 'pointer',
                  }}
                >
                  Done
                </button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <TaskList {...taskListProps} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Settings modal */}
      <SettingsModal
        isOpen={showSettings} onClose={() => setShowSettings(false)}
        settings={settings} onUpdateSettings={updateSettings} dark={dark}
      />
    </div>
  );
}
