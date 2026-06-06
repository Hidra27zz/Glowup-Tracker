'use client';

import { useState } from 'react';
import { Code, Trash2, Copy, CheckCircle, Plus } from 'lucide-react';
import { createCodeSnippet, deleteCodeSnippet } from '@/app/career/actions';

interface Snippet {
  id: string;
  title: string;
  language: string;
  code: string;
  tags?: string | null;
  createdAt: Date;
}

interface Props {
  snippets: Snippet[];
}

export default function SnippetLibrary({ snippets }: Props) {
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAddSnippet = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await createCodeSnippet(new FormData(e.currentTarget));
    e.currentTarget.reset();
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Xóa Snippet này?')) {
      setLoading(true);
      await deleteCodeSnippet(id);
      setLoading(false);
    }
  };

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Code size={22} color="#8b5cf6" /> Code Snippet Library
          </h3>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Lưu trữ các đoạn code hay, thuật toán, hoặc config tái sử dụng.</p>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <form onSubmit={handleAddSnippet} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input name="title" placeholder="Tên Snippet (VD: JWT Verify Middleware)" required style={{ flex: 2, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none' }} />
            <select name="language" required style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', color: '#fff', outline: 'none' }}>
              <option value="typescript">TypeScript / JS</option>
              <option value="python">Python</option>
              <option value="sql">SQL</option>
              <option value="bash">Bash / Shell</option>
              <option value="css">CSS / SASS</option>
              <option value="other">Khác</option>
            </select>
            <input name="tags" placeholder="Tags (VD: auth, middleware)" style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none' }} />
          </div>
          <textarea name="code" placeholder="Paste đoạn code vào đây..." rows={6} required style={{ width: '100%', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none', fontFamily: 'monospace', resize: 'vertical' }} />
          <button type="submit" disabled={loading} style={{ background: '#8b5cf6', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', alignSelf: 'flex-start' }}>
            <Plus size={18} /> Lưu Snippet
          </button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
        {snippets.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#64748b', padding: '40px 0', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>Chưa có Snippet nào.</div>
        ) : (
          snippets.map(snippet => (
            <div key={snippet.id} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.95rem' }}>{snippet.title}</div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.7rem', color: '#8b5cf6', textTransform: 'uppercase', fontWeight: 700, background: 'rgba(139,92,246,0.1)', padding: '2px 6px', borderRadius: '4px' }}>{snippet.language}</span>
                    {snippet.tags && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>#{snippet.tags}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleCopy(snippet.id, snippet.code)} style={{ background: 'none', border: 'none', color: copiedId === snippet.id ? '#10b981' : '#94a3b8', cursor: 'pointer', padding: '4px' }}>
                    {copiedId === snippet.id ? <CheckCircle size={16} /> : <Copy size={16} />}
                  </button>
                  <button onClick={() => handleDelete(snippet.id)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} /></button>
                </div>
              </div>

              <div style={{ padding: '16px', overflowX: 'auto' }}>
                <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.85rem', color: '#cbd5e1', whiteSpace: 'pre-wrap' }}>
                  <code>{snippet.code}</code>
                </pre>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
