'use client';

import { BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function LearnPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[var(--background)]">
      <div className="max-w-md w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
          <BookOpen size={32} className="text-emerald-400" />
        </div>
        
        <h1 className="text-2xl font-black text-white mb-2">Chess Academy</h1>
        <p className="text-sm text-[var(--text-muted)] mb-8">
          Interactive lessons and opening explorer are currently under construction.
        </p>

        <Link href="/analysis" className="w-full py-3 rounded-lg font-bold text-sm text-white bg-[var(--surface-hover)] border border-[var(--border)] hover:border-emerald-500/30 transition">
          Go to Analysis Board
        </Link>
      </div>
    </div>
  );
}
