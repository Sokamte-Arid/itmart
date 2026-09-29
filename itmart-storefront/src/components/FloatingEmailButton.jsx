'use client';

import { Mail } from 'lucide-react';
import { buildEmailContactLink } from '@/lib/contact';

export default function FloatingEmailButton({ label }) {
  return (
    <a
      href={buildEmailContactLink()}
      aria-label={label}
      title={label}
      className="fixed bottom-5 right-5 z-30 flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white pl-3.5 pr-4 py-3 rounded-full shadow-lg transition-colors"
    >
      <Mail size={18} />
      <span className="text-sm font-medium hidden sm:inline">{label}</span>
    </a>
  );
}
