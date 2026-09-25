import { useEffect, useRef, useState, useCallback } from 'react';

type EngineState = 'unloaded' | 'loading' | 'ready' | 'thinking';

export function useStockfish() {
  const workerRef = useRef<Worker | null>(null);
  const [engineState, setEngineState] = useState<EngineState>('unloaded');
  const [bestMove, setBestMove] = useState<string | null>(null);
  const [evalScore, setEvalScore] = useState<string | null>(null);
  const [evalDepth, setEvalDepth] = useState<number>(0);

  useEffect(() => {
    // Initialize Web Worker from the public folder
    const worker = new Worker('/engine/stockfish.js');
    workerRef.current = worker;
    setEngineState('loading');

    worker.onmessage = (e) => {
      const line = e.data;
      if (typeof line !== 'string') return;

      if (line === 'uciok') {
        setEngineState('ready');
      } else if (line.startsWith('bestmove')) {
        const move = line.split(' ')[1];
        if (move && move !== '(none)') {
          setBestMove(move);
        }
        setEngineState('ready');
      } else if (line.includes('info depth')) {
        // Parse evaluation
        const depthMatch = line.match(/depth (\d+)/);
        if (depthMatch) {
          setEvalDepth(parseInt(depthMatch[1], 10));
        }

        if (line.includes('score cp')) {
          const match = line.match(/score cp (-?\d+)/);
          if (match) {
            const score = parseInt(match[1], 10) / 100;
            // Always relative to engine playing side, so if engine is white, positive is good. 
            // We usually just surface the raw score for analysis.
            setEvalScore((score > 0 ? '+' : '') + score.toFixed(2));
          }
        } else if (line.includes('score mate')) {
          const match = line.match(/score mate (-?\d+)/);
          if (match) {
            setEvalScore(`M${match[1]}`);
          }
        }
      }
    };

    worker.postMessage('uci');
    // Enable NNUE if available in the stockfish build
    worker.postMessage('setoption name Use NNUE value true');

    return () => {
      worker.postMessage('quit');
      worker.terminate();
    };
  }, []);

  const search = useCallback((fen: string, depth: number = 15, difficulty: number = 20) => {
    if (!workerRef.current) return;
    
    // Scale skill level 0-20
    workerRef.current.postMessage(`setoption name Skill Level value ${difficulty}`);
    
    setEngineState('thinking');
    setBestMove(null);
    workerRef.current.postMessage(`position fen ${fen}`);
    workerRef.current.postMessage(`go depth ${depth}`);
  }, []);

  const stop = useCallback(() => {
    if (!workerRef.current) return;
    workerRef.current.postMessage('stop');
    setEngineState('ready');
  }, []);

  return { engineState, bestMove, evalScore, evalDepth, search, stop };
}
