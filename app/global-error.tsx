'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#070d2d] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="text-6xl">🔮</div>
          <h2 className="text-2xl font-serif text-amber-400">
            The cosmic connection was interrupted
          </h2>
          <p className="text-gray-400 text-sm">
            Something went wrong. Please refresh the page.
          </p>
          <button
            onClick={reset}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Refresh
          </button>
        </div>
      </body>
    </html>
  );
}
