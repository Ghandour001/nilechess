'use client';

import { Settings, Monitor, Volume2, LayoutGrid, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [boardTheme, setBoardTheme] = useState('Classic');
  const [pieceTheme, setPieceTheme] = useState('Staunton');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [animations, setAnimations] = useState(true);
  const [coordinates, setCoordinates] = useState('Inside');

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('nilechess-settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setBoardTheme(parsed.boardTheme || 'Classic');
      setPieceTheme(parsed.pieceTheme || 'Staunton');
      setSoundEnabled(parsed.soundEnabled ?? true);
      setAnimations(parsed.animations ?? true);
      setCoordinates(parsed.coordinates || 'Inside');
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('nilechess-settings', JSON.stringify({
      boardTheme, pieceTheme, soundEnabled, animations, coordinates
    }));
  }, [boardTheme, pieceTheme, soundEnabled, animations, coordinates]);

  return (
    <div className="flex-1 flex justify-center p-4 sm:p-8 bg-[var(--background)]">
      <div className="max-w-2xl w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xl h-fit">
        
        <div className="flex items-center gap-3 border-b border-[var(--border)] pb-6 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] flex items-center justify-center">
            <Settings size={20} className="text-[var(--accent-light)]" />
          </div>
          <h1 className="text-2xl font-black text-white">Settings</h1>
        </div>

        <div className="space-y-8">
          
          {/* Display & Board */}
          <section>
            <h2 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4 flex items-center gap-2">
              <LayoutGrid size={16} /> Board & Pieces
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-white block mb-2">Board Theme</label>
                <select 
                  className="w-full bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-zinc-300 outline-none focus:border-[var(--accent-light)]"
                  value={boardTheme}
                  onChange={e => setBoardTheme(e.target.value)}
                >
                  <option>Classic</option>
                  <option>Midnight</option>
                  <option>Blue</option>
                  <option>Wood</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-white block mb-2">Piece Set</label>
                <select 
                  className="w-full bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-zinc-300 outline-none focus:border-[var(--accent-light)]"
                  value={pieceTheme}
                  onChange={e => setPieceTheme(e.target.value)}
                >
                  <option>Staunton</option>
                  <option>Alpha</option>
                  <option>Minimalist</option>
                </select>
              </div>
            </div>
          </section>

          {/* Preferences */}
          <section>
            <h2 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Monitor size={16} /> Preferences
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-alt)]">
                <div>
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    <Volume2 size={16} className="text-emerald-400" /> Sound Effects
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-1">Play sounds for moves, captures, and game events.</div>
                </div>
                <button 
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${soundEnabled ? 'bg-emerald-500' : 'bg-[var(--surface-hover)]'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${soundEnabled ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-alt)]">
                <div>
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    <Zap size={16} className="text-amber-400" /> Animations
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-1">Animate piece movements.</div>
                </div>
                <button 
                  onClick={() => setAnimations(!animations)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${animations ? 'bg-emerald-500' : 'bg-[var(--surface-hover)]'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${animations ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-alt)]">
                <div>
                  <div className="text-sm font-semibold text-white">Board Coordinates</div>
                  <div className="text-xs text-[var(--text-muted)] mt-1">Show ranks and files on the board.</div>
                </div>
                <select 
                  className="bg-[var(--surface-hover)] border border-[var(--border)] rounded text-xs text-white p-1.5 outline-none"
                  value={coordinates}
                  onChange={e => setCoordinates(e.target.value)}
                >
                  <option>Inside</option>
                  <option>Outside</option>
                  <option>Hidden</option>
                </select>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
