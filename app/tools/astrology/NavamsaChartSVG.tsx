import React from "react"

// Professional Vedic Navamsa Chart with enhanced visual quality
export function NavamsaChartSVG({ planets }: { planets: Array<{ planet: string, sign: string, house: number }> }) {
  // North Indian diamond style chart (houses 1-12) - Professional styling
  const houseLabels = [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6]
  
  // Map house number to planets
  const housePlanets: Record<number, string[]> = {}
  planets.forEach(p => {
    if (!housePlanets[p.house]) housePlanets[p.house] = []
    housePlanets[p.house].push(p.planet)
  })

  // Professional Vedic symbols
  const vedicSymbols: { [key: string]: string } = {
    'Sun': '☉', 'Moon': '☽', 'Mars': '♂', 'Mercury': '☿', 
    'Jupiter': '♃', 'Venus': '♀', 'Saturn': '♄', 'Rahu': '☊', 'Ketu': '☋'
  }

  return (
    <svg viewBox="0 0 300 300" width={280} height={280} className="professional-vedic-chart">
      <defs>
        {/* Professional gradients and filters */}
        <linearGradient id="navamsa-gold-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{stopColor: '#7dd3fc', stopOpacity: 1}} />
          <stop offset="50%" style={{stopColor: '#3b82f6', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: '#1d4ed8', stopOpacity: 1}} />
        </linearGradient>
        
        <filter id="navamsa-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        <filter id="navamsa-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.4)"/>
        </filter>
      </defs>
      
      {/* Professional outer diamond */}
      <polygon 
        points="150,15 285,150 150,285 15,150" 
        fill="#ffffff" 
        stroke="url(#navamsa-gold-gradient)" 
        strokeWidth={4} 
        filter="url(#navamsa-shadow)"
      />
      
      {/* Professional inner lines */}
      <line x1="150" y1="15" x2="150" y2="285" stroke="#3b82f6" strokeWidth={2.5} opacity={0.9} />
      <line x1="15" y1="150" x2="285" y2="150" stroke="#3b82f6" strokeWidth={2.5} opacity={0.9} />
      <line x1="50" y1="50" x2="250" y2="250" stroke="#3b82f6" strokeWidth={2.5} opacity={0.9} />
      <line x1="250" y1="50" x2="50" y2="250" stroke="#3b82f6" strokeWidth={2.5} opacity={0.9} />
      
      {/* House numbers and planets with professional styling */}
      {houseLabels.map((house, i) => {
        const positions = [
          [150, 40], [220, 85], [260, 150], [220, 215], [150, 260], [80, 215],
          [40, 150], [80, 85], [115, 120], [185, 120], [185, 180], [115, 180]
        ]
        const [x, y] = positions[i]
        return (
          <g key={house}>
            {/* House number with professional styling */}
            <text 
              x={x} 
              y={y} 
              textAnchor="middle" 
              fontSize={18} 
              fill="#1e40af" 
              fontWeight="700"
              fontFamily="'Inter', 'SF Pro Display', 'Arial', sans-serif"
              style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
              filter="url(#navamsa-glow)"
            >
              {house}
            </text>
            
            {/* Planets in this house with professional styling */}
            {housePlanets[house] && housePlanets[house].map((pl, j) => (
              <text 
                key={j}
                x={x} 
                y={y + 20 + j * 16} 
                textAnchor="middle" 
                fontSize={14} 
                fill="#0f172a"
                fontWeight="500"
                fontFamily="'Inter', 'SF Pro Display', 'Arial', sans-serif"
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
              >
                {vedicSymbols[pl] || pl}
              </text>
            ))}
          </g>
        )
      })}
    </svg>
  )
} 