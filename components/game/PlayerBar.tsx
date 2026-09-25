import React from 'react';

interface PlayerBarProps {
  name: string;
  rating?: number;
  isBottom: boolean;
  clockTime: string;
  isActive: boolean;
  avatarUrl?: string;
}

export default function PlayerBar({ name, rating, isBottom, clockTime, isActive, avatarUrl }: PlayerBarProps) {
  return (
    <div className={`flex items-center justify-between w-full h-full bg-[var(--surface)] px-4 rounded-lg shadow-sm border ${isActive ? 'border-[var(--accent-light)]' : 'border-[var(--border)]'}`}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-[var(--surface-hover)] border border-[var(--border)] overflow-hidden flex items-center justify-center shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[#2C3E50]" /> // Default placeholder
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white leading-tight">{name}</span>
          {rating && <span className="text-xs text-[var(--text-muted)] leading-tight">{rating}</span>}
        </div>
      </div>

      <div className={`font-mono text-xl font-bold px-3 py-1 rounded ${isActive ? 'bg-[var(--surface-hover)] text-[var(--accent-light)]' : 'bg-transparent text-[var(--foreground)] opacity-70'}`}>
        {clockTime}
      </div>
    </div>
  );
}
