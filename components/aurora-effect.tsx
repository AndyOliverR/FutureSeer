"use client"

export function AuroraEffect() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {/* Aurora Mist */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 aurora-mist"></div>

      {/* Nebula Clouds */}
      <div className="absolute top-1/3 right-1/4 w-80 h-80 nebula-cloud"></div>
      <div className="absolute bottom-1/3 left-1/3 w-72 h-72 nebula-cloud-2"></div>
    </div>
  )
}
