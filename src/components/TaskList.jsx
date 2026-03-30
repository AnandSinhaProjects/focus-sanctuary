import React, { useState } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { Plus, Trash2, CheckCircle2, Circle, GripVertical } from 'lucide-react';

function TaskRow({ task, selectedTaskId, onSelect, onToggleDone, onDelete, c, isLast }) {
  const dragControls = useDragControls();
  return (
    <Reorder.Item value={task} dragListener={false} dragControls={dragControls}
      style={{ listStyle: 'none' }}
    >
      <div
        onClick={() => onSelect(task.id === selectedTaskId ? null : task.id)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 8px', borderRadius: 10, cursor: 'pointer',
          background: selectedTaskId === task.id ? c.rowActive : 'transparent',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => { if (selectedTaskId !== task.id) e.currentTarget.style.background = c.rowHover; }}
        onMouseLeave={e => { if (selectedTaskId !== task.id) e.currentTarget.style.background = 'transparent'; }}
      >
        {/* Drag handle */}
        <div
          onPointerDown={e => { e.preventDefault(); dragControls.start(e); }}
          style={{ cursor: 'grab', flexShrink: 0, display: 'flex', opacity: 0.3, padding: '0 2px' }}
          onClick={e => e.stopPropagation()}
        >
          <GripVertical size={13} color={c.textSub} />
        </div>

        <button onClick={e => { e.stopPropagation(); onToggleDone(task.id); }}
          style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', flexShrink: 0, display: 'flex' }}>
          {task.done
            ? <CheckCircle2 size={20} color="#3B82F6" />
            : <Circle size={20} color={selectedTaskId === task.id ? '#93C5FD' : c.circleInactive} />
          }
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: 0, fontSize: 13, fontWeight: 500,
            color: task.done ? c.textDone : c.text,
            textDecoration: task.done ? 'line-through' : 'none',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {task.title}
          </p>
          <p style={{ margin: '1px 0 0', fontSize: 11, color: c.textSub }}>
            Pomos {task.completedPomos}/{task.targetPomos}
          </p>
        </div>

        <button onClick={e => { e.stopPropagation(); onDelete(task.id); }}
          style={{
            border: 'none', background: 'transparent', padding: 4,
            cursor: 'pointer', flexShrink: 0, opacity: 0.3,
            display: 'flex', borderRadius: 6, transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.3'}
        >
          <Trash2 size={13} color="#EF4444" />
        </button>
      </div>
      {!isLast && <div style={{ height: 1, background: c.divider, margin: '0 8px' }} />}
    </Reorder.Item>
  );
}

export default function TaskList({ tasks, selectedTaskId, onSelect, onAdd, onToggleDone, onDelete, onReorder, dark }) {
  const [input,       setInput]  = useState('');
  const [targetPomos, setTarget] = useState(2);
  const [addOpen,     setAddOpen] = useState(false);

  const c = {
    text:       dark ? '#F1F5F9' : '#1E293B',
    textSub:    dark ? '#64748B' : '#94A3B8',
    textDone:   dark ? '#475569' : '#94A3B8',
    border:     dark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
    inputBg:    dark ? '#0F172A' : '#F8FAFC',
    inputText:  dark ? '#F1F5F9' : '#1E293B',
    rowHover:   dark ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
    rowActive:  dark ? 'rgba(59,130,246,0.12)' : '#EFF6FF',
    iconBorder: dark ? 'rgba(255,255,255,0.10)' : '#E2E8F0',
    iconBg:     dark ? 'transparent' : 'transparent',
    iconHover:  dark ? 'rgba(255,255,255,0.08)' : '#F1F5F9',
    emptyIcon:  dark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
    divider:    dark ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
    pomoBg:     dark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
    pomoText:   dark ? '#64748B' : '#64748B',
    circleInactive: dark ? '#334155' : '#CBD5E1',
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onAdd(input.trim(), targetPomos);
    setInput(''); setTarget(2); setAddOpen(false);
  };

  const btnBase = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 32, height: 32, borderRadius: '50%',
    border: `1.5px solid ${c.iconBorder}`, background: c.iconBg, cursor: 'pointer',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: c.text }}>
          Task List{' '}
          <span style={{ fontWeight: 400, color: c.textSub }}>
            ({tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'})
          </span>
        </h2>
        <button
          onClick={() => setAddOpen(v => !v)}
          aria-label="Add task"
          style={btnBase}
          onMouseEnter={e => e.currentTarget.style.background = c.iconHover}
          onMouseLeave={e => e.currentTarget.style.background = c.iconBg}
        >
          <Plus size={15} color={c.textSub} />
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {addOpen && (
          <motion.form key="add-form" onSubmit={handleAdd}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: 12 }}
          >
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                autoFocus type="text" value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Task name…"
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: 10,
                  border: `1.5px solid ${c.border}`, outline: 'none',
                  fontSize: 13, color: c.inputText, background: c.inputBg,
                }}
                onFocus={e => e.target.style.borderColor = '#3B82F6'}
                onBlur={e => e.target.style.borderColor = c.border}
              />
              <button type="submit" style={{
                padding: '8px 16px', borderRadius: 10, border: 'none',
                background: '#3B82F6', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>
                Add
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: c.textSub }}>Target pomos:</span>
              {[1,2,3,4].map(n => (
                <button key={n} type="button" onClick={() => setTarget(n)}
                  style={{
                    width: 26, height: 26, borderRadius: '50%', border: 'none',
                    cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'background 0.15s',
                    background: targetPomos === n ? '#3B82F6' : c.pomoBg,
                    color: targetPomos === n ? '#fff' : c.pomoText,
                  }}>
                  {n}
                </button>
              ))}
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', margin: '0 -24px', padding: '0 24px' }}>
        {tasks.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: c.emptyIcon, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Plus size={18} color={c.circleInactive} />
            </div>
            <p style={{ margin: 0, fontSize: 13, color: c.textSub }}>No tasks yet</p>
            <button onClick={() => setAddOpen(true)} style={{
              padding: '6px 16px', borderRadius: 8,
              border: `1.5px solid #3B82F6`, background: 'transparent',
              color: '#3B82F6', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}>
              Add your first task
            </button>
          </motion.div>
        ) : (
          <Reorder.Group axis="y" values={tasks} onReorder={onReorder}
            style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {tasks.map((task, i) => (
              <TaskRow key={task.id} task={task} selectedTaskId={selectedTaskId}
                onSelect={onSelect} onToggleDone={onToggleDone} onDelete={onDelete}
                c={c} isLast={i === tasks.length - 1} />
            ))}
          </Reorder.Group>
        )}
      </div>
    </div>
  );
}
