'use client';

import { useState } from 'react';
import { Briefcase, Plus, Trash2, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { createJobApplication, updateJobApplicationStatus, deleteJobApplication } from '@/app/career/actions';

interface JobApplication {
  id: string;
  company: string;
  position: string;
  status: string;
  appliedDate: Date;
  notes?: string | null;
}

interface Props {
  applications: JobApplication[];
}

const STATUSES = [
  { id: 'CV_SENT', label: 'CV Sent', color: '#3b82f6' },
  { id: 'HR_CALL', label: 'HR Call', color: '#f59e0b' },
  { id: 'INTERVIEW', label: 'Interview', color: '#8b5cf6' },
  { id: 'OFFER', label: 'Offer', color: '#10b981' },
  { id: 'REJECTED', label: 'Rejected', color: '#ef4444' }
] as const;

export default function InternshipPipeline({ applications }: Props) {
  const [loading, setLoading] = useState(false);

  const handleAddJob = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await createJobApplication(new FormData(e.currentTarget));
    e.currentTarget.reset();
    setLoading(false);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setLoading(true);
    await updateJobApplicationStatus(id, newStatus);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Xóa Job Application này?')) {
      setLoading(true);
      await deleteJobApplication(id);
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('jobId', id);
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = async (e: React.DragEvent, statusId: string) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData('jobId');
    if (!jobId) return;
    
    // Avoid updating if the status hasn't changed
    const job = applications.find(app => app.id === jobId);
    if (job && job.status !== statusId) {
      await handleStatusChange(jobId, statusId);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.3s ease' }}>
      <style>{`
        .job-card.dragging {
          opacity: 0.5;
        }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Briefcase size={22} color="#f43f5e" /> Internship Pipeline
          </h3>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Quản lý lộ trình ứng tuyển. Kéo thả để cập nhật trạng thái.</p>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <form onSubmit={handleAddJob} style={{ display: 'flex', gap: '12px' }}>
          <input name="company" placeholder="Tên công ty (VD: Google)" required style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none' }} />
          <input name="position" placeholder="Vị trí (VD: Frontend Intern)" required style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none' }} />
          <input name="notes" placeholder="Ghi chú thêm..." style={{ flex: 2, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none' }} />
          <button type="submit" disabled={loading} style={{ background: '#f43f5e', color: '#fff', border: 'none', padding: '0 20px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Thêm
          </button>
        </form>
      </div>

      {/* Kanban Board */}
      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px' }}>
        {STATUSES.map(status => {
          const columnJobs = applications.filter(app => app.status === status.id);
          return (
            <div 
              key={status.id} 
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status.id)}
              style={{ flex: '0 0 300px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', padding: '16px', borderTop: `4px solid ${status.color}`, display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '300px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, color: status.color, fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>{status.label}</h4>
                <span style={{ background: 'rgba(255,255,255,0.1)', color: '#cbd5e1', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>{columnJobs.length}</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '100px' }}>
                {columnJobs.map(job => (
                  <div 
                    key={job.id} 
                    className="job-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, job.id)}
                    onDragEnd={handleDragEnd}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'grab' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>{job.company}</div>
                      <button onClick={() => handleDelete(job.id)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}><Trash2 size={14} /></button>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{job.position}</div>
                    {job.notes && <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic', borderLeft: '2px solid rgba(255,255,255,0.1)', paddingLeft: '6px' }}>{job.notes}</div>}
                    <div style={{ fontSize: '0.75rem', color: '#475569' }}>Applied: {new Date(job.appliedDate).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
