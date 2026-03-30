import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Slider = ({ label, min, max, value, unit, onChange, c }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: c.textSub }}>{label}</label>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#3B82F6' }}>{value} {unit}</span>
    </div>
    <input type="range" min={min} max={max} value={value} onChange={onChange}
      style={{ width: '100%', accentColor: '#3B82F6', cursor: 'pointer' }} />
  </div>
);

export default function SettingsModal({ isOpen, onClose, settings, onUpdateSettings, dark }) {
  const set = (key, val) => onUpdateSettings({ ...settings, [key]: val });

  const c = {
    text:    dark ? '#F1F5F9' : '#0F172A',
    textSub: dark ? '#94A3B8' : '#475569',
    border:  dark ? 'rgba(255,255,255,0.10)' : '#E2E8F0',
    closeBg: dark ? 'rgba(255,255,255,0.06)' : 'transparent',
    closeHover: dark ? 'rgba(255,255,255,0.12)' : '#F1F5F9',
    toggleOff: dark ? '#334155' : '#CBD5E1',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          onClick={onClose}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
            backgroundColor: 'rgba(15,23,42,0.6)',
          }}
        >
          <motion.div
            onClick={e => e.stopPropagation()}
            initial={{ scale: 0.93, y: 14 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 14 }}
            className="modal-card"
            style={{ width: '100%', maxWidth: 440, borderRadius: 16, padding: 28, overflowY: 'auto', maxHeight: '90vh' }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: c.text }}>Settings</h2>
              <button
                onClick={onClose} aria-label="Close"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32, borderRadius: 8,
                  border: `1px solid ${c.border}`, background: c.closeBg, cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.background = c.closeHover}
                onMouseLeave={e => e.currentTarget.style.background = c.closeBg}
              >
                <X size={16} color={c.textSub} />
              </button>
            </div>

            <Slider c={c} label="Focus Time"                min={1}  max={60} value={settings.workDuration / 60}          unit="min"      onChange={e => set('workDuration',            parseInt(e.target.value) * 60)} />
            <Slider c={c} label="Short Break"               min={1}  max={30} value={settings.shortBreakDuration / 60}     unit="min"      onChange={e => set('shortBreakDuration',      parseInt(e.target.value) * 60)} />
            <Slider c={c} label="Long Break"                min={1}  max={60} value={settings.longBreakDuration / 60}      unit="min"      onChange={e => set('longBreakDuration',       parseInt(e.target.value) * 60)} />
            <Slider c={c} label="Sessions before long break" min={1} max={10} value={settings.sessionsBeforeLongBreak}     unit="sessions" onChange={e => set('sessionsBeforeLongBreak', parseInt(e.target.value))}      />

            {/* Auto-start toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: c.textSub }}>Auto-start next session</label>
              <button
                onClick={() => set('autoStartNextSession', !settings.autoStartNextSession)}
                aria-label="Toggle auto-start"
                style={{
                  position: 'relative', width: 44, height: 24, borderRadius: 99, border: 'none',
                  cursor: 'pointer', transition: 'background 0.2s',
                  background: settings.autoStartNextSession ? '#3B82F6' : c.toggleOff,
                }}
              >
                <motion.span
                  animate={{ x: settings.autoStartNextSession ? 20 : 2 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  style={{
                    position: 'absolute', top: 4, left: 0,
                    width: 16, height: 16, borderRadius: '50%',
                    background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}
                />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
