import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Square, ChevronDown, CheckCircle2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SESSIONS = [
  { key: 'work',       label: 'All'         },
  { key: 'shortBreak', label: 'Short Break' },
  { key: 'longBreak',  label: 'Long Break'  },
];

const SIZE = 280, CX = 140, CY = 140, R = 110;
const CIRC = 2 * Math.PI * R;

export default function Timer({
  timeLeft, totalTime, isActive, sessionType,
  selectedTask, tasks, sessionCount,
  onToggle, onReset, onSwitchSession, onSelectTask, dark,
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef(null);

  // Close picker on outside click
  useEffect(() => {
    if (!pickerOpen) return;
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target))
        setPickerOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [pickerOpen]);

  const c = {
    text:       dark ? '#F1F5F9' : '#0F172A',
    textSub:    dark ? '#64748B' : '#94A3B8',
    textMuted:  dark ? '#475569' : '#CBD5E1',
    border:     dark ? 'rgba(255,255,255,0.10)' : '#E2E8F0',
    tabBg:      dark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
    tabText:    dark ? '#94A3B8' : '#64748B',
    chipBg:     dark ? 'rgba(255,255,255,0.06)' : '#F8FAFC',
    chipText:   dark ? '#CBD5E1' : '#475569',
    ringTrack:  dark ? '#334155' : '#E2E8F0',
    iconBorder: dark ? 'rgba(255,255,255,0.12)' : '#E2E8F0',
    iconHover:  dark ? 'rgba(255,255,255,0.10)' : '#F1F5F9',
    stopBg:     dark ? 'rgba(255,255,255,0.12)' : '#0F172A',
    dropBg:     dark ? '#1E293B' : '#ffffff',
    dropBorder: dark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
    dropHover:  dark ? 'rgba(255,255,255,0.06)' : '#F8FAFC',
    dropActive: dark ? 'rgba(59,130,246,0.15)' : '#EFF6FF',
  };

  const remaining  = totalTime > 0 ? timeLeft / totalTime : 1;
  const dashOffset = CIRC * (1 - remaining);
  const dotAngle   = remaining * 2 * Math.PI;
  const dotX       = CX + R * Math.cos(dotAngle);
  const dotY       = CY + R * Math.sin(dotAngle);

  const pad = (n) => String(Math.floor(n)).padStart(2, '0');
  const timeStr = `${pad(timeLeft / 60)}:${pad(timeLeft % 60)}`;

  const availableTasks = (tasks || []).filter(t => !t.done);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%' }}>

      {/* Tabs */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        background: c.tabBg, borderRadius: 12, padding: 4, alignSelf: 'flex-start',
      }}>
        {SESSIONS.map(({ key, label }) => {
          const active = sessionType === key;
          return (
            <motion.button key={key} onClick={() => onSwitchSession(key)}
              style={{
                position: 'relative', padding: '8px 16px', borderRadius: 9,
                border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                color: active ? '#fff' : c.tabText, background: 'transparent', whiteSpace: 'nowrap',
              }}
            >
              {active && (
                <motion.div layoutId="tab-pill"
                  style={{ position: 'absolute', inset: 0, borderRadius: 9, background: '#3B82F6' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}
              <span style={{ position: 'relative', zIndex: 1 }}>{label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Ring */}
      <div style={{ position: 'relative', width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ transform: 'rotate(-90deg)', display: 'block' }}>
          <circle cx={CX} cy={CY} r={R} fill="none" stroke={c.ringTrack} strokeWidth="7" />
          <motion.circle
            cx={CX} cy={CY} r={R} fill="none" stroke="#3B82F6"
            strokeWidth="7" strokeLinecap="round" strokeDasharray={CIRC}
            animate={{ strokeDashoffset: dashOffset }} initial={false}
            transition={{ duration: 1, ease: 'linear' }}
          />
          <motion.circle cx={dotX} cy={dotY} r="6" fill="#3B82F6"
            animate={{ cx: dotX, cy: dotY }} initial={false}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </svg>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <span style={{
            fontSize: 56, fontWeight: 800, letterSpacing: '-2px',
            fontVariantNumeric: 'tabular-nums', lineHeight: 1, color: c.text,
          }}>
            {timeStr}
          </span>
          <span style={{
            marginTop: 8, fontSize: 11, fontWeight: 600,
            letterSpacing: '0.1em', textTransform: 'uppercase', color: c.textSub,
          }}>
            {isActive ? 'Running' : 'Paused'}
          </span>
        </div>
      </div>

      {/* Task picker */}
      <div ref={pickerRef} style={{ position: 'relative', width: '100%', maxWidth: 340 }}>
        {/* Trigger button */}
        <button
          onClick={() => setPickerOpen(v => !v)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 14px', borderRadius: 10,
            border: `1.5px solid ${pickerOpen ? '#3B82F6' : c.border}`,
            background: c.chipBg, cursor: 'pointer', gap: 8,
            transition: 'border-color 0.15s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
            {selectedTask ? (
              <>
                <CheckCircle2 size={15} color="#3B82F6" style={{ flexShrink: 0 }} />
                <span style={{
                  fontSize: 13, fontWeight: 500, color: c.chipText,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {selectedTask.title}
                </span>
                <span style={{ fontSize: 11, color: c.textSub, flexShrink: 0 }}>
                  {selectedTask.completedPomos}/{selectedTask.targetPomos} pomos
                </span>
              </>
            ) : (
              <span style={{ fontSize: 13, color: c.textMuted }}>
                {availableTasks.length > 0 ? 'Pick a task to focus on…' : 'No tasks yet — add one'}
              </span>
            )}
          </div>
          <motion.div animate={{ rotate: pickerOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={15} color={c.textSub} />
          </motion.div>
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {pickerOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 50,
                background: c.dropBg, borderRadius: 12,
                border: `1px solid ${c.dropBorder}`,
                boxShadow: dark
                  ? '0 8px 32px rgba(0,0,0,0.5)'
                  : '0 8px 32px rgba(0,0,0,0.10)',
                overflow: 'hidden', maxHeight: 240, overflowY: 'auto',
              }}
            >
              {/* Clear selection */}
              {selectedTask && (
                <button
                  onClick={() => { onSelectTask(null); setPickerOpen(false); }}
                  style={{
                    width: '100%', textAlign: 'left', padding: '10px 14px',
                    border: 'none', borderBottom: `1px solid ${c.dropBorder}`,
                    background: 'transparent', cursor: 'pointer',
                    fontSize: 12, color: c.textSub,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = c.dropHover}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  Clear selection
                </button>
              )}

              {availableTasks.length === 0 ? (
                <div style={{ padding: '16px 14px', fontSize: 13, color: c.textSub, textAlign: 'center' }}>
                  No tasks yet — add some in the task panel
                </div>
              ) : (
                availableTasks.map(task => {
                  const active = selectedTask?.id === task.id;
                  return (
                    <button
                      key={task.id}
                      onClick={() => { onSelectTask(task.id); setPickerOpen(false); }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 14px', border: 'none', cursor: 'pointer',
                        background: active ? c.dropActive : 'transparent',
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.background = c.dropHover; }}
                      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                    >
                      {active
                        ? <CheckCircle2 size={16} color="#3B82F6" style={{ flexShrink: 0 }} />
                        : <Circle size={16} color={c.textMuted} style={{ flexShrink: 0 }} />
                      }
                      <span style={{
                        flex: 1, fontSize: 13, fontWeight: 500, textAlign: 'left',
                        color: active ? '#3B82F6' : c.text,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {task.title}
                      </span>
                      <span style={{ fontSize: 11, color: c.textSub, flexShrink: 0 }}>
                        {task.completedPomos}/{task.targetPomos}
                      </span>
                    </button>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
          onClick={onReset} aria-label="Reset"
          style={{
            width: 44, height: 44, borderRadius: '50%', cursor: 'pointer',
            border: `1.5px solid ${c.iconBorder}`, background: 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onMouseEnter={e => e.currentTarget.style.background = c.iconHover}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <RotateCcw size={18} color={c.tabText} />
        </motion.button>

        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={onToggle} aria-label={isActive ? 'Pause' : 'Start'}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 36px', borderRadius: 99, border: 'none',
            background: '#3B82F6', color: '#fff', fontSize: 15, fontWeight: 600,
            cursor: 'pointer', boxShadow: '0 4px 14px rgba(59,130,246,0.35)',
          }}
        >
          {isActive ? <><Pause size={17} /><span>Pause</span></> : <><Play size={17} /><span>Start</span></>}
        </motion.button>

        <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
          onClick={onReset} aria-label="Stop"
          style={{
            width: 44, height: 44, borderRadius: '50%', border: 'none',
            background: c.stopBg, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Square size={14} color="#fff" fill="#fff" />
        </motion.button>
      </div>

      <p style={{ margin: 0, fontSize: 12, color: c.textSub }}>
        Sessions completed today:{' '}
        <span style={{ fontWeight: 600, color: '#3B82F6' }}>{sessionCount}</span>
      </p>
    </div>
  );
}
