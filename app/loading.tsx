export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070d2d] via-[#0b1230] to-[#050914] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-amber-500/30 rounded-full animate-spin border-t-amber-400" />
          <div className="absolute inset-0 w-12 h-12 border-2 border-transparent rounded-full animate-spin border-b-amber-300/50" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
        <p className="text-amber-400/70 text-sm font-medium animate-pulse">
          Aligning the stars...
        </p>
      </div>
    </div>
  );
}
