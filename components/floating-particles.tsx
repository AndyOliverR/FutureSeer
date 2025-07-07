"use client"

export function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${100 + Math.random() * 20}%`,
            width: "1px",
            height: "1px",
            background: "rgba(249, 201, 34, 0.3)",
            animation: `sacred-float-minimal 60s linear infinite`,
            animationDelay: `${i * 12}s`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  )
}
