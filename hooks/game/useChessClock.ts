import { useState, useEffect, useCallback, useRef } from 'react';

export type PlayerColor = 'white' | 'black';

export interface ChessClockState {
  whiteTime: number; // in milliseconds
  blackTime: number;
  activeColor: PlayerColor | null; // null if paused
}

export function useChessClock(
  initialMinutes: number,
  incrementSeconds: number,
  onTimeout?: (color: PlayerColor) => void
) {
  const initialTimeMs = initialMinutes * 60 * 1000;
  const incrementMs = incrementSeconds * 1000;

  const [clock, setClock] = useState<ChessClockState>({
    whiteTime: initialTimeMs,
    blackTime: initialTimeMs,
    activeColor: null,
  });

  // Track the exact timestamp when the turn started
  const lastTickRef = useRef<number>(0);
  const timesRef = useRef({ white: initialTimeMs, black: initialTimeMs });
  const warningPlayed = useRef({ white: false, black: false });

  const updateDisplay = useCallback(() => {
    if (!clock.activeColor) return;

    const now = Date.now();
    const elapsed = now - lastTickRef.current;
    
    // Calculate exact remaining time for active player
    const remaining = timesRef.current[clock.activeColor] - elapsed;

    if (remaining <= 0) {
      timesRef.current[clock.activeColor] = 0;
      setClock(prev => ({
        ...prev,
        [prev.activeColor === 'white' ? 'whiteTime' : 'blackTime']: 0,
        activeColor: null,
      }));
      onTimeout?.(clock.activeColor);
      return;
    }
    
    // Low time warning (e.g., 10 seconds)
    if (remaining <= 10000 && !warningPlayed.current[clock.activeColor]) {
      warningPlayed.current[clock.activeColor] = true;
      import('@/lib/audio/ChessAudio').then(({ chessAudio }) => chessAudio.warning());
    }

    setClock(prev => ({
      ...prev,
      [prev.activeColor === 'white' ? 'whiteTime' : 'blackTime']: remaining
    }));
  }, [clock.activeColor, onTimeout]);

  // Tick loop
  useEffect(() => {
    if (!clock.activeColor) return;

    // Use a fast interval for display updates
    const intervalId = setInterval(updateDisplay, 50); // 20fps display update

    return () => clearInterval(intervalId);
  }, [clock.activeColor, updateDisplay]);

  const start = useCallback((color: PlayerColor = 'white') => {
    lastTickRef.current = Date.now();
    setClock(prev => ({ ...prev, activeColor: color }));
  }, []);

  const pause = useCallback(() => {
    if (!clock.activeColor) return;
    const now = Date.now();
    const elapsed = now - lastTickRef.current;
    timesRef.current[clock.activeColor] = Math.max(0, timesRef.current[clock.activeColor] - elapsed);

    setClock(prev => ({
      ...prev,
      whiteTime: timesRef.current.white,
      blackTime: timesRef.current.black,
      activeColor: null,
    }));
  }, [clock.activeColor]);

  const switchTurn = useCallback((nextColor: PlayerColor) => {
    if (clock.activeColor) {
      const now = Date.now();
      const elapsed = now - lastTickRef.current;
      
      // Stop current color, subtract elapsed, add increment
      const newRemaining = Math.max(0, timesRef.current[clock.activeColor] - elapsed) + incrementMs;
      timesRef.current[clock.activeColor] = newRemaining;
      
      if (newRemaining > 10000) {
        warningPlayed.current[clock.activeColor] = false;
      }

      setClock(prev => ({
        ...prev,
        [prev.activeColor === 'white' ? 'whiteTime' : 'blackTime']: newRemaining,
        activeColor: nextColor
      }));
      
      lastTickRef.current = now;
    } else {
      // Start the clock if not active
      lastTickRef.current = Date.now();
      setClock(prev => ({ ...prev, activeColor: nextColor }));
    }
  }, [clock.activeColor, incrementMs]);

  const reset = useCallback(() => {
    timesRef.current = { white: initialTimeMs, black: initialTimeMs };
    warningPlayed.current = { white: false, black: false };
    setClock({
      whiteTime: initialTimeMs,
      blackTime: initialTimeMs,
      activeColor: null,
    });
  }, [initialTimeMs]);

  return { clock, start, pause, switchTurn, reset };
}

// Utility to format milliseconds as mm:ss or mm:ss.d
export function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, ms) / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);

  // If less than 10 seconds, optionally show tenths (often desired in chess)
  if (totalSeconds < 10 && totalSeconds > 0) {
    const tenths = Math.floor((ms % 1000) / 100);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${tenths}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
