'use client';

import { useState, useEffect, useRef } from 'react';
import { Footprints, Map, Flame, Activity } from 'lucide-react';

export default function ActivityTracker() {
  const [steps, setSteps] = useState(0);
  const [distance, setDistance] = useState(0); // in km
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For pedometer algorithm
  const lastAccel = useRef({ x: 0, y: 0, z: 0 });
  const threshold = 1.2; // G-force threshold for a step
  const lastStepTime = useRef(0);

  // For geolocation algorithm
  const lastPos = useRef<{ lat: number, lng: number } | null>(null);
  const watchId = useRef<number | null>(null);

  // Haversine formula to calculate distance between two coordinates in km
  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleDeviceMotion = (event: DeviceMotionEvent) => {
    if (!event.accelerationIncludingGravity) return;
    const { x, y, z } = event.accelerationIncludingGravity;
    if (x === null || y === null || z === null) return;

    // Calculate total acceleration vector
    const currentAccel = Math.sqrt(x * x + y * y + z * z) / 9.81; // Convert to G-force

    // Peak detection (simplified)
    if (currentAccel > threshold) {
      const now = Date.now();
      if (now - lastStepTime.current > 300) { // minimum 300ms between steps
        setSteps(s => s + 1);
        lastStepTime.current = now;
      }
    }

    lastAccel.current = { x, y, z };
  };

  const requestPermissions = async () => {
    try {
      // 1. Request DeviceMotion (iOS requires user gesture & permission)
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        const permissionState = await (DeviceMotionEvent as any).requestPermission();
        if (permissionState === 'granted') {
          window.addEventListener('devicemotion', handleDeviceMotion);
        } else {
          setError('Quyền truy cập cảm biến chuyển động bị từ chối.');
          return;
        }
      } else {
        // Non-iOS or older devices
        window.addEventListener('devicemotion', handleDeviceMotion);
      }

      // 2. Request Geolocation
      if ('geolocation' in navigator) {
        watchId.current = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            if (lastPos.current) {
              const dist = getDistanceFromLatLonInKm(
                lastPos.current.lat, lastPos.current.lng,
                latitude, longitude
              );
              // Filter out GPS noise (only count > 5 meters and < 1km per update)
              if (dist > 0.005 && dist < 1) {
                setDistance(d => d + dist);
              }
            }
            lastPos.current = { lat: latitude, lng: longitude };
          },
          (err) => {
            console.warn('Geolocation error:', err);
            // Don't set error blocking if only GPS fails, pedometer might still work
          },
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
      }

      setIsTracking(true);
      setError(null);
    } catch (e: any) {
      setError('Lỗi khi kích hoạt cảm biến: ' + e.message);
    }
  };

  const stopTracking = () => {
    window.removeEventListener('devicemotion', handleDeviceMotion);
    if (watchId.current !== null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(watchId.current);
    }
    setIsTracking(false);
  };

  useEffect(() => {
    return () => stopTracking();
  }, []);

  const calories = Math.floor(steps * 0.04 + distance * 60);

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '20px',
      padding: '24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(34,197,94,0.1)', color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Activity size={24} />
        </div>
        <div>
          <h3 style={{ margin: 0, color: '#f1f5f9', fontSize: '1.2rem' }}>Pedometer & GPS</h3>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Đo lường di chuyển theo thời gian thực</div>
        </div>
        
        <button
          onClick={isTracking ? stopTracking : requestPermissions}
          style={{
            marginLeft: 'auto',
            padding: '8px 16px',
            borderRadius: '99px',
            border: 'none',
            background: isTracking ? 'rgba(239,68,68,0.15)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: isTracking ? '#fca5a5' : '#fff',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: isTracking ? 'none' : '0 4px 15px rgba(34,197,94,0.3)'
          }}
        >
          {isTracking ? 'Dừng đo' : 'Bắt đầu đo'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', marginBottom: '20px', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
          <Footprints size={28} color="#38bdf8" style={{ marginBottom: '12px' }} />
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9' }}>{steps}</div>
          <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Bước chân</div>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
          <Map size={28} color="#a855f7" style={{ marginBottom: '12px' }} />
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9' }}>{distance.toFixed(2)}</div>
          <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Kilometers</div>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
          <Flame size={28} color="#f97316" style={{ marginBottom: '12px' }} />
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9' }}>{calories}</div>
          <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Kcal đốt cháy</div>
        </div>
      </div>
      
      {isTracking && (
        <div style={{ marginTop: '20px', textAlign: 'center', color: '#4ade80', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', animation: 'pulse 1.5s infinite' }}></span>
          Đang đọc dữ liệu từ cảm biến...
        </div>
      )}
      
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(74, 222, 128, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
        }
      `}</style>
    </div>
  );
}
