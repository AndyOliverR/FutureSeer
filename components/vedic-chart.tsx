export function VedicChart() {
  return (
    <svg width="400" height="400" viewBox="0 0 400 400" className="text-gray-500">
      {/* Outer square */}
      <rect x="50" y="50" width="300" height="300" fill="none" stroke="currentColor" strokeWidth="2" />

      {/* Inner divisions - 12 houses */}
      <line x1="50" y1="150" x2="350" y2="150" stroke="currentColor" strokeWidth="1" />
      <line x1="50" y1="250" x2="350" y2="250" stroke="currentColor" strokeWidth="1" />
      <line x1="150" y1="50" x2="150" y2="350" stroke="currentColor" strokeWidth="1" />
      <line x1="250" y1="50" x2="250" y2="350" stroke="currentColor" strokeWidth="1" />

      {/* Diagonal lines */}
      <line x1="50" y1="50" x2="350" y2="350" stroke="currentColor" strokeWidth="1" />
      <line x1="350" y1="50" x2="50" y2="350" stroke="currentColor" strokeWidth="1" />

      {/* Center circle */}
      <circle cx="200" cy="200" r="30" fill="none" stroke="currentColor" strokeWidth="1" />

      {/* House numbers */}
      {[
        { x: 100, y: 100, num: "12" },
        { x: 200, y: 80, num: "1" },
        { x: 300, y: 100, num: "2" },
        { x: 320, y: 200, num: "3" },
        { x: 300, y: 300, num: "4" },
        { x: 200, y: 320, num: "5" },
        { x: 100, y: 300, num: "6" },
        { x: 80, y: 200, num: "7" },
      ].map((house, i) => (
        <text key={i} x={house.x} y={house.y} textAnchor="middle" className="text-xs fill-current">
          {house.num}
        </text>
      ))}
    </svg>
  )
}
