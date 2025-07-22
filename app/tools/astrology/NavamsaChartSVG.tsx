import React from "react"

export function NavamsaChartSVG({ planets }: { planets: Array<{ planet: string, sign: string, house: number }> }) {
  // North Indian diamond style chart (houses 1-12)
  // For now, use mock positions for planets in houses
  // TODO: Use real data from astroData
  const houseLabels = [
    7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6
  ]
  // Map house number to planets
  const housePlanets: Record<number, string[]> = {}
  planets.forEach(p => {
    if (!housePlanets[p.house]) housePlanets[p.house] = []
    housePlanets[p.house].push(p.planet)
  })
  return (
    <svg viewBox="0 0 300 300" width={240} height={240}>
      {/* Outer diamond */}
      <polygon points="150,10 290,150 150,290 10,150" fill="#1a1333" stroke="#ffd700" strokeWidth={3} />
      {/* Inner lines */}
      <line x1="150" y1="10" x2="150" y2="290" stroke="#ffd700" strokeWidth={2} />
      <line x1="10" y1="150" x2="290" y2="150" stroke="#ffd700" strokeWidth={2} />
      <line x1="45" y1="45" x2="255" y2="255" stroke="#ffd700" strokeWidth={2} />
      <line x1="255" y1="45" x2="45" y2="255" stroke="#ffd700" strokeWidth={2} />
      {/* House numbers and planets */}
      {houseLabels.map((house, i) => {
        // Calculate positions for house numbers
        const positions = [
          [150, 35], [220, 80], [265, 150], [220, 220], [150, 265], [80, 220],
          [35, 150], [80, 80], [115, 115], [185, 115], [185, 185], [115, 185]
        ]
        const [x, y] = positions[i]
        return (
          <g key={house}>
            <text x={x} y={y} textAnchor="middle" fontSize={16} fill="#ffd700" fontWeight="bold">{house}</text>
            {/* Planets in this house */}
            {housePlanets[house] && housePlanets[house].map((pl, j) => (
              <text x={x} y={y + 16 + j * 14} textAnchor="middle" fontSize={13} fill="#fffbe6">{pl}</text>
            ))}
          </g>
        )
      })}
    </svg>
  )
} 