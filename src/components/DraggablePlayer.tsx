'use client';

import { useState, useEffect, useRef } from 'react';
import { GripHorizontal, Settings2, X } from 'lucide-react';

const PRESETS = [
  { name: 'Deep Focus (Spotify)', url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWWQRwui0ExPn?utm_source=generator&theme=0' },
  { name: 'Lofi Girl (Spotify)', url: 'https://open.spotify.com/embed/playlist/0vvXsWCC9xrXsKd4Zsn6V8?utm_source=generator&theme=0' },
  { name: 'Piano Study (Spotify)', url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO?utm_source=generator&theme=0' },
  { name: 'Brain Food (Spotify)', url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ?utm_source=generator&theme=0' },
];

export default function DraggablePlayer() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(PRESETS[0].url);
  const [mounted, setMounted] = useState(false);
  
  const dragRef = useRef<{ startX: number; startY: number; initX: number; initY: number } | null>(null);

  useEffect(() => {
    // Initial position bottom right
    setPosition({ x: window.innerWidth - 324, y: window.innerHeight - 200 });
    setMounted(true);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: position.x,
      initY: position.y
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPosition({
      x: dragRef.current.initX + dx,
      y: dragRef.current.initY + dy
    });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  if (!mounted) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        left: 0, top: 0,
        transform: `translate(${position.x}px, ${position.y}px)`,
        zIndex: 9999,
        width: '300px',
        background: '#18181b',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.1)',
        opacity: isDragging ? 1 : 0.9,
        transition: isDragging ? 'none' : 'opacity 0.2s',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
      onMouseEnter={e => { if (!isDragging) e.currentTarget.style.opacity = '1'; }}
      onMouseLeave={e => { if (!isDragging) e.currentTarget.style.opacity = '0.9'; }}
    >
      <div 
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          padding: '8px 12px',
          background: 'rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: isDragging ? 'grabbing' : 'grab',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          userSelect: 'none',
          touchAction: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>
          <GripHorizontal size={14} />
          Focus Music
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
          style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, display: 'flex' }}
        >
          {showSettings ? <X size={14} /> : <Settings2 size={14} />}
        </button>
      </div>

      {showSettings ? (
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.2)', height: '152px', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 600 }}>Chọn danh sách phát:</div>
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => { setCurrentUrl(p.url); setShowSettings(false); }}
              style={{
                background: currentUrl === p.url ? 'rgba(56,189,248,0.1)' : 'rgba(255,255,255,0.05)',
                border: currentUrl === p.url ? '1px solid rgba(56,189,248,0.3)' : '1px solid rgba(255,255,255,0.1)',
                color: currentUrl === p.url ? '#38bdf8' : '#cbd5e1',
                padding: '6px 10px', borderRadius: '6px', textAlign: 'left', fontSize: '0.75rem', cursor: 'pointer'
              }}
            >
              {p.name}
            </button>
          ))}
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>Tùy chỉnh:</div>
          <input 
            type="text" 
            placeholder="URL Embed Spotify/YouTube..."
            value={currentUrl}
            onChange={e => setCurrentUrl(e.target.value)}
            style={{
              padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.75rem', outline: 'none'
            }}
          />
        </div>
      ) : (
        <iframe 
          style={{ width: '100%', height: '152px', border: '0', background: 'transparent' }} 
          src={currentUrl} 
          allowFullScreen={true} 
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture">
        </iframe>
      )}
    </div>
  );
}
