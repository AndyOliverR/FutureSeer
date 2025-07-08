"use client"

export function CosmicBackground() {
  return (
    <>
      {/* Deep Space Gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900" />

      {/* Twinkling Stars Layer */}
      <div className="fixed inset-0 twinkling-stars" />

      {/* Additional Star Field */}
      <div className="fixed inset-0 star-field" />
    </>
  )
}
