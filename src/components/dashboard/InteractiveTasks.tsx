'use client';

import { useTransition, useState } from 'react';
import { Circle, CheckCircle, Trash2, Plus, Zap } from 'lucide-react';
import { updateTaskStatus, deleteTask, addTask } from '@/app/tasks/actions';
import { Task } from '@prisma/client';

export default function InteractiveTasks({ tasks }: { tasks: Task[] }) {
  const [isPending, startTransition] = useTransition();
  const [isAdding, setIsAdding] = useState(false);

  const handleToggle = (id: string, currentStatus: string) => {
    startTransition(async () => {
      await updateTaskStatus(id, currentStatus === 'DONE' ? 'TODO' : 'DONE');
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteTask(id);
    });
  };

  const handleAddTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    startTransition(async () => {
      await addTask(formData);
      form.reset();
      setIsAdding(false);
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      
      {tasks.length === 0 ? (
        <div style={{ color: '#64748b', fontSize: '0.95rem', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', textAlign: 'center', fontStyle: 'italic' }}>
          Tuyệt vời, bạn không có task nào tồn đọng!
        </div>
      ) : (
        tasks.map(task => {
          const isDone = task.status === 'DONE';
          const daysLeft = Math.ceil((new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          const isUrgent = daysLeft <= 2 && !isDone;
          
          return (
            <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', borderLeft: `4px solid ${isDone ? '#10b981' : isUrgent ? '#ef4444' : '#3b82f6'}`, transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', opacity: isDone ? 0.5 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, overflow: 'hidden' }}>
                <button 
                  onClick={() => handleToggle(task.id, task.status)}
                  disabled={isPending}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: isPending ? 'wait' : 'pointer', color: isDone ? '#10b981' : (isUrgent ? '#ef4444' : '#3b82f6'), display: 'flex', flexShrink: 0 }}
                >
                  {isDone ? <CheckCircle size={20} /> : <Circle size={20} />}
                </button>
                <span style={{ fontWeight: 600, color: '#fff', fontSize: '1rem', textDecoration: isDone ? 'line-through' : 'none', transition: 'all 0.2s', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '0.85rem', color: isDone ? '#10b981' : (isUrgent ? '#ef4444' : '#94a3b8'), background: isDone ? 'rgba(16,185,129,0.1)' : (isUrgent ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)'), padding: '4px 10px', borderRadius: '10px', fontWeight: 600 }}>
                    {isDone ? 'Hoàn thành' : `${new Date(task.deadline).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} - ${new Date(task.deadline).toLocaleDateString('vi-VN')}`}
                  </span>
                  {!isDone && <span style={{ fontSize: '0.75rem', color: isUrgent ? '#ef4444' : '#64748b', marginTop: '4px', fontWeight: 600 }}>Còn {daysLeft} ngày</span>}
                </div>
                <button 
                  onClick={() => handleDelete(task.id)}
                  disabled={isPending}
                  style={{ background: 'rgba(239,68,68,0.1)', border: 'none', padding: '6px', borderRadius: '8px', cursor: isPending ? 'wait' : 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', opacity: isPending ? 0.5 : 1 }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })
      )}

      {/* QUICK ADD TASK FORM */}
      {!isAdding ? (
        <button onClick={() => setIsAdding(true)} style={{ marginTop: '8px', background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)', padding: '14px', borderRadius: '16px', color: '#94a3b8', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}>
          <Plus size={18} /> Thêm Task Mới
        </button>
      ) : (
        <form onSubmit={handleAddTask} style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '16px', border: '1px solid rgba(59,130,246,0.3)' }}>
          <input name="title" autoFocus placeholder="Tên công việc..." required disabled={isPending} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.95rem', outline: 'none' }} />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input name="deadline" type="datetime-local" required defaultValue={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)} disabled={isPending} style={{ flex: 1, minWidth: '150px', padding: '10px 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none', colorScheme: 'dark' }} />
            <select name="energyLevel" defaultValue="Medium" disabled={isPending} style={{ flex: 1, minWidth: '120px', padding: '0 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none', cursor: 'pointer' }}>
              <option value="High" style={{ color: '#000' }}>⚡ High</option>
              <option value="Medium" style={{ color: '#000' }}>🔋 Medium</option>
              <option value="Low" style={{ color: '#000' }}>🪫 Low</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button type="submit" disabled={isPending} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '12px', fontWeight: 600, cursor: isPending ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
               Lưu
            </button>
            <button type="button" onClick={() => setIsAdding(false)} disabled={isPending} style={{ background: 'transparent', color: '#94a3b8', border: 'none', padding: '10px 12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}>
              Hủy
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
