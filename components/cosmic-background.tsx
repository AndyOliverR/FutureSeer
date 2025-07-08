"use client"

export function CosmicBackground() {
  return (
    <div className="fixed inset-0 z-0">
      {/* Deep Space Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900"></div>

      {/* Twinkling Stars Layer 1 */}
      <div className="absolute inset-0 twinkling-stars"></div>

      {/* Twinkling Stars Layer 2 */}
      <div className="absolute inset-0 star-field"></div>
    </div>
  )
}
