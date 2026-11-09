export type TimerMode = 'pomodoro' | 'deepwork' | 'hyperfocus';

export interface UnifiedTimerState {
  mode: TimerMode;
  durationMinutes: number;
  remainingSeconds: number;
  endTime: number | null; // timestamp in ms when running
  isRunning: boolean;
  taskName: string;
  showMiniPopup: boolean;
}

export const TIMER_MODE_CONFIG: Record<TimerMode, { label: string; minutes: number; color: string }> = {
  pomodoro: { label: 'Pomodoro', minutes: 25, color: '#ef4444' },
  deepwork: { label: 'Deep Work', minutes: 60, color: '#3b82f6' },
  hyperfocus: { label: 'Hyperfocus', minutes: 90, color: '#a855f7' },
};

const STORAGE_KEY = 'glowup_unified_timer_v1';
const SYNC_EVENT = 'glowup-timer-sync';

const DEFAULT_STATE: UnifiedTimerState = {
  mode: 'pomodoro',
  durationMinutes: 25,
  remainingSeconds: 25 * 60,
  endTime: null,
  isRunning: false,
  taskName: '',
  showMiniPopup: true,
};

export function getTimerState(): UnifiedTimerState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as UnifiedTimerState;
    if (parsed.isRunning && parsed.endTime) {
      const diff = Math.max(0, Math.round((parsed.endTime - Date.now()) / 1000));
      if (diff <= 0) {
        return {
          ...parsed,
          remainingSeconds: 0,
          isRunning: false,
          endTime: null,
        };
      }
      return {
        ...parsed,
        remainingSeconds: diff,
      };
    }
    return parsed;
  } catch {
    return DEFAULT_STATE;
  }
}

export function setTimerState(updater: Partial<UnifiedTimerState> | ((prev: UnifiedTimerState) => UnifiedTimerState)): UnifiedTimerState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  const current = getTimerState();
  const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: next }));
  } catch {
    // ignore storage errors
  }
  return next;
}

export function startUnifiedTimer(customState?: Partial<UnifiedTimerState>) {
  const current = { ...getTimerState(), ...customState };
  const seconds = current.remainingSeconds > 0 ? current.remainingSeconds : current.durationMinutes * 60;
  return setTimerState({
    ...current,
    remainingSeconds: seconds,
    endTime: Date.now() + seconds * 1000,
    isRunning: true,
    showMiniPopup: true,
  });
}

export function pauseUnifiedTimer() {
  const current = getTimerState();
  const remaining = current.endTime
    ? Math.max(0, Math.round((current.endTime - Date.now()) / 1000))
    : current.remainingSeconds;
  return setTimerState({
    ...current,
    remainingSeconds: remaining,
    endTime: null,
    isRunning: false,
  });
}

export function resetUnifiedTimer(newMode?: TimerMode) {
  const current = getTimerState();
  const mode = newMode || current.mode;
  const mins = TIMER_MODE_CONFIG[mode].minutes;
  return setTimerState({
    ...current,
    mode,
    durationMinutes: mins,
    remainingSeconds: mins * 60,
    endTime: null,
    isRunning: false,
  });
}

export function subscribeTimerSync(callback: (state: UnifiedTimerState) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handleCustom = (e: Event) => {
    const customEvent = e as CustomEvent<UnifiedTimerState>;
    if (customEvent.detail) {
      callback(customEvent.detail);
    } else {
      callback(getTimerState());
    }
  };
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback(getTimerState());
    }
  };
  window.addEventListener(SYNC_EVENT, handleCustom);
  window.addEventListener('storage', handleStorage);
  return () => {
    window.removeEventListener(SYNC_EVENT, handleCustom);
    window.removeEventListener('storage', handleStorage);
  };
}

export function formatTimerMMSS(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
