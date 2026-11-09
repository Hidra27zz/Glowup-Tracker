'use client';

import React, { useState, useRef, useEffect } from 'react';

const PRESET_PLAYLISTS = [
  { name: '🎧 Lofi Hip Hop Radio', url: 'https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1', type: 'youtube' },
  { name: '🧠 Brain Food (Spotify)', url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWXLeA8Omikj7?utm_source=generator&theme=0', type: 'spotify' },
  { name: '🎹 Deep Focus (Spotify)', url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ?utm_source=generator&theme=0', type: 'spotify' },
  { name: '🌌 Ambient Synthwave', url: 'https://www.youtube.com/embed/4xDzrJKXOOY?autoplay=1', type: 'youtube' },
];

export default function DraggablePlayer() {
  const [isMinimized, setIsMinimized] = useState(true);
  const [hasActivatedEmbed, setHasActivatedEmbed] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(PRESET_PLAYLISTS[0]);
  const [customInput, setCustomInput] = useState('');

  // Built-in Web Audio Focus Synthesizer (never stops across tabs, works offline/instantly)
  const [synthPlaying, setSynthPlaying] = useState(false);
  const [synthMode, setSynthMode] = useState<'binaural' | 'rain'>('binaural');
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Draggable state
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPosition({ x: Math.max(20, window.innerWidth - 360), y: Math.max(80, window.innerHeight - 440) });
    }
  }, []);

  const stopSynth = () => {
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch {
        // ignore
      }
      audioCtxRef.current = null;
      gainNodeRef.current = null;
    }
    setSynthPlaying(false);
  };

  const startSynth = (mode: 'binaural' | 'rain') => {
    stopSynth();
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.12;
    masterGain.connect(ctx.destination);

    if (mode === 'binaural') {
      // 200Hz left + 214Hz right = 14Hz Alpha/Beta Focus Binaural Beat
      const oscL = ctx.createOscillator();
      const oscR = ctx.createOscillator();
      const merger = ctx.createChannelMerger(2);
      oscL.type = 'sine';
      oscR.type = 'sine';
      oscL.frequency.value = 200;
      oscR.frequency.value = 214;
      oscL.connect(merger, 0, 0);
      oscR.connect(merger, 0, 1);
      merger.connect(masterGain);
      oscL.start();
      oscR.start();
    } else {
      // Soft Brown Noise / Rain Sound
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 2.5;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;
      whiteNoise.connect(masterGain);
      whiteNoise.start(0);
    }

    audioCtxRef.current = ctx;
    gainNodeRef.current = masterGain;
    setSynthMode(mode);
    setSynthPlaying(true);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPosition({
        x: Math.max(10, Math.min(window.innerWidth - 260, dragRef.current.initialX + dx)),
        y: Math.max(60, Math.min(window.innerHeight - 100, dragRef.current.initialY + dy)),
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput) return;

    let embedUrl = customInput;
    let type = 'custom';

    if (customInput.includes('youtube.com/watch?v=')) {
      const v = customInput.split('v=')[1]?.split('&')[0];
      embedUrl = `https://www.youtube.com/embed/${v}?autoplay=1`;
      type = 'youtube';
    } else if (customInput.includes('youtu.be/')) {
      const v = customInput.split('youtu.be/')[1]?.split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${v}?autoplay=1`;
      type = 'youtube';
    } else if (customInput.includes('open.spotify.com/')) {
      embedUrl = customInput.replace('open.spotify.com/', 'open.spotify.com/embed/');
      type = 'spotify';
    }

    setCurrentTrack({ name: '🎵 Kênh Tùy Chỉnh', url: embedUrl, type });
    setHasActivatedEmbed(true);
    setCustomInput('');
  };

  const isAudioActive = synthPlaying || hasActivatedEmbed;

  return (
    <>
      {/* Bottom-right Floating Pill Button when Minimized */}
      {isMinimized && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(15, 16, 22, 0.94)',
            backdropFilter: 'blur(18px)',
            border: `1px solid ${isAudioActive ? 'rgba(139, 92, 246, 0.6)' : 'rgba(255,255,255,0.12)'}`,
            borderRadius: '16px',
            padding: '10px 14px',
            boxShadow: isAudioActive
              ? '0 8px 28px rgba(139, 92, 246, 0.35)'
              : '0 8px 24px rgba(0,0,0,0.45)',
          }}
        >
          <button
            onClick={() => {
              setIsMinimized(false);
              setHasActivatedEmbed(true);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 700,
              fontSize: '0.84rem',
              padding: 0,
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>{isAudioActive ? '🔊' : '🎵'}</span>
            <span>{isAudioActive ? 'Nhạc đang phát (Xuyên Tab)' : 'Trạm Âm Thanh Focus'}</span>
          </button>

          {synthPlaying && (
            <button
              onClick={stopSynth}
              title="Tắt sóng âm Focus"
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#f87171',
                borderRadius: '8px',
                padding: '3px 7px',
                fontSize: '0.72rem',
                cursor: 'pointer',
              }}
            >
              Tắt
            </button>
          )}
        </div>
      )}

      {/* Persistent Player Panel: NEVER unmounts once activated so iframe music continues across tabs and when minimized */}
      <div
        className="glass-card"
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: isMinimized ? '1px' : '330px',
          height: isMinimized ? '1px' : 'auto',
          opacity: isMinimized ? 0 : 1,
          pointerEvents: isMinimized ? 'none' : 'auto',
          overflow: 'hidden',
          zIndex: 9999,
          padding: isMinimized ? '0' : '16px',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.65)',
          border: '1px solid rgba(139, 92, 246, 0.4)',
          background: 'rgba(14, 15, 22, 0.95)',
          backdropFilter: 'blur(20px)',
          transition: 'opacity 0.2s ease',
        }}
      >
        {/* Drag Handle Header */}
        <div
          onMouseDown={handleMouseDown}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '12px',
            marginBottom: '12px',
            borderBottom: '1px solid var(--glass-border)',
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🎵</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                Focus Audio (Xuyên Tab)
              </div>
              <div style={{ fontSize: '0.68rem', color: '#10b981' }}>
                Thu gọn hoặc chuyển trang nhạc vẫn phát
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setIsMinimized(true)}
              title="Thu gọn (Nhạc vẫn tiếp tục phát)"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '0.78rem',
                padding: '4px 8px',
                borderRadius: '6px',
                fontWeight: 600,
              }}
            >
              Thu gọn —
            </button>
            <button
              onClick={() => {
                setIsMinimized(true);
                setHasActivatedEmbed(false);
                stopSynth();
              }}
              title="Tắt hẳn nhạc"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: 'none',
                color: '#f87171',
                cursor: 'pointer',
                fontSize: '0.78rem',
                padding: '4px 8px',
                borderRadius: '6px',
                fontWeight: 600,
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* 1-Tap Instant Sound Generator (No YouTube ads / instant playback) */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
            ⚡ Sóng Âm Tập Trung Tức Thì (Không quảng cáo):
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => (synthPlaying && synthMode === 'binaural' ? stopSynth() : startSynth('binaural'))}
              style={{
                flex: 1,
                padding: '7px 8px',
                borderRadius: '8px',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                background:
                  synthPlaying && synthMode === 'binaural'
                    ? 'var(--accent-primary)'
                    : 'rgba(139, 92, 246, 0.1)',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {synthPlaying && synthMode === 'binaural' ? '⏸ Đang phát Alpha 14Hz' : '🧠 Sóng Alpha 14Hz'}
            </button>
            <button
              onClick={() => (synthPlaying && synthMode === 'rain' ? stopSynth() : startSynth('rain'))}
              style={{
                flex: 1,
                padding: '7px 8px',
                borderRadius: '8px',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                background:
                  synthPlaying && synthMode === 'rain' ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {synthPlaying && synthMode === 'rain' ? '⏸ Đang phát Tiếng Mưa' : '🌧️ Tiếng Mưa Dịu'}
            </button>
          </div>
        </div>

        {/* YouTube / Spotify Embed Container */}
        {hasActivatedEmbed && (
          <div
            style={{
              borderRadius: '10px',
              overflow: 'hidden',
              marginBottom: '12px',
              background: '#000',
              height: currentTrack.type === 'spotify' ? '152px' : '180px',
            }}
          >
            <iframe
              src={currentTrack.url}
              width="100%"
              height="100%"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          </div>
        )}

        {/* Preset Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            📻 Kênh Lofi / Spotify:
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {PRESET_PLAYLISTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentTrack(p);
                  setHasActivatedEmbed(true);
                }}
                style={{
                  background:
                    hasActivatedEmbed && currentTrack.name === p.name
                      ? 'var(--accent-primary)'
                      : 'rgba(255,255,255,0.05)',
                  color: hasActivatedEmbed && currentTrack.name === p.name ? '#fff' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontWeight: hasActivatedEmbed && currentTrack.name === p.name ? 700 : 500,
                }}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Link Form */}
        <form onSubmit={handleCustomSubmit} style={{ display: 'flex', gap: '6px' }}>
          <input
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Dán link YouTube hoặc Spotify..."
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--glass-border)',
              color: 'white',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
            }}
          />
          <button
            type="submit"
            className="glass-button"
            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
          >
            Phát
          </button>
        </form>
      </div>
    </>
  );
}
