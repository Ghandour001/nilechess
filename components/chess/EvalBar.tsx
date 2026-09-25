import React from 'react';

interface EvalBarProps {
  score: string | null; // e.g. "+1.2", "-0.8", "M3", "-M2"
  orientation: 'white' | 'black';
}

export default function EvalBar({ score, orientation }: EvalBarProps) {
  let percentage = 50;
  
  if (score) {
    if (score.startsWith('M')) {
      percentage = score.startsWith('-') ? 0 : 100;
    } else {
      const num = parseFloat(score);
      // Rough mapping: +10 is 100%, -10 is 0%.
      // Formula: 50 + (score / 10) * 50
      // Clip between 5 and 95 so it doesn't totally disappear unless mate
      percentage = 50 + (num / 10) * 50;
      percentage = Math.max(5, Math.min(95, percentage));
    }
  }

  // If orientation is black, flip the bar visually
  if (orientation === 'black') {
    percentage = 100 - percentage;
  }

  return (
    <div className="w-8 h-full bg-[#1a252f] rounded border border-[var(--border)] overflow-hidden flex flex-col relative">
      <div 
        className="w-full bg-[#DDE3E9] transition-all duration-700 ease-in-out" 
        style={{ height: `${percentage}%` }}
      />
      <div 
        className="w-full bg-[#2c3e50] flex-1 transition-all duration-700 ease-in-out"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-between py-1">
        <span className={`text-[9px] font-bold ${percentage > 50 ? 'text-[#2c3e50]' : 'text-[#DDE3E9]'}`}>
          {score && !score.startsWith('-') && !score.startsWith('M') ? score : (score?.startsWith('M') && !score.startsWith('-M') ? score : '')}
        </span>
        <span className={`text-[9px] font-bold ${percentage < 50 ? 'text-[#DDE3E9]' : 'text-[#2c3e50]'}`}>
          {score && score.startsWith('-') ? score.replace('-', '') : ''}
        </span>
      </div>
    </div>
  );
}
