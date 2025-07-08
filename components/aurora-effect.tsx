"use client"

export function AuroraEffect() {
  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Aurora Mist */}
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-full h-96 aurora-mist opacity-20" />

      {/* Nebula Clouds */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 nebula-cloud opacity-10" />
      <div className="absolute bottom-1/3 left-1/4 w-80 h-80 nebula-cloud-2 opacity-15" />
    </div>
  )
}
