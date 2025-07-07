export function CosmicLogo() {
  return (
    <div className="relative">
      <h1
        className="text-6xl md:text-8xl font-thin text-transparent bg-clip-text bg-gradient-to-r from-gold via-yellow-300 to-gold animate-shimmer bg-size-200"
        style={{
          textShadow:
            "0 0 8px rgba(255, 255, 255, 0.4), 0 0 16px rgba(249, 201, 34, 0.3), 0 0 32px rgba(249, 201, 34, 0.1)",
          filter: "drop-shadow(0 0 12px rgba(249, 201, 34, 0.2))",
        }}
      >
        FutureSeer
      </h1>
      {/* Subtle divine glow */}
      <div
        className="absolute inset-0 text-6xl md:text-8xl font-thin text-white opacity-10 blur-sm pointer-events-none"
        style={{
          animation: "pulse-divine 8s ease-in-out infinite",
        }}
      >
        FutureSeer
      </div>
    </div>
  )
}
