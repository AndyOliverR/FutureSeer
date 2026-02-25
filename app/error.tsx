'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Route error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070d2d] via-[#0b1230] to-[#050914] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-6xl">🔮</div>
        <h2 className="text-2xl font-serif text-amber-400">
          The stars have momentarily misaligned
        </h2>
        <p className="text-gray-400 text-sm">
          Something unexpected happened. Please try again.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
