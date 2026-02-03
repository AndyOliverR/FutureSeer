import React, { useState } from 'react';

interface ChartGeneratorProps {
  planetaryPositions: Record<string, { longitude: number; retrograde?: boolean }>;
  houseCusps: number[];
  aspects: { planet1: string; planet2: string; type: string }[];
}

const ChartGenerator: React.FC<ChartGeneratorProps> = ({ planetaryPositions, houseCusps, aspects }) => {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setImgUrl(null);
    try {
      const data = {
        planetary_positions: planetaryPositions,
        house_cusps: houseCusps,
        aspects: aspects,
      };
      const res = await fetch('/api/astrochart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to generate chart');
      const blob = await res.blob();
      setImgUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', margin: '2rem 0' }}>
      <button onClick={handleGenerate} disabled={loading} style={{ padding: '0.5rem 1.5rem', fontSize: '1.1rem' }}>
        {loading ? 'Generating...' : 'Generate Chart'}
      </button>
      {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      {imgUrl && (
        <div style={{ marginTop: 24 }}>
          <img src={imgUrl} alt="Astrology Chart" style={{ maxWidth: 400, width: '100%', background: 'transparent' }} />
        </div>
      )}
    </div>
  );
};

export default ChartGenerator;

