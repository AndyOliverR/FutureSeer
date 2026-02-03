'use client';

import { useState, useEffect } from 'react';
import { Compass, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { degreesTo16Zone, degreesTo32Pada } from '@/lib/vastuDirections';

/** Map degrees (0–360) to 8 cardinal/intercardinal directions. */
const DEGREES_TO_DIRECTION_8: { max: number; label: string }[] = [
  { max: 22.5, label: 'North' },
  { max: 67.5, label: 'Northeast' },
  { max: 112.5, label: 'East' },
  { max: 157.5, label: 'Southeast' },
  { max: 202.5, label: 'South' },
  { max: 247.5, label: 'Southwest' },
  { max: 292.5, label: 'West' },
  { max: 337.5, label: 'Northwest' },
  { max: 360, label: 'North' },
];

function degreesToDirection8(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360;
  for (const { max, label } of DEGREES_TO_DIRECTION_8) {
    if (normalized <= max) return label;
  }
  return 'North';
}

export type CompassMode = '8' | '16' | '32';

function degreesToDirection(degrees: number, mode: CompassMode): string {
  if (mode === '16') return degreesTo16Zone(degrees);
  if (mode === '32') return degreesTo32Pada(degrees);
  return degreesToDirection8(degrees);
}

interface CompassHelperProps {
  /** Called when user taps the use-direction button with the current direction label. */
  onUseDirection?: (direction: string) => void;
  /** Optional class name for the container. */
  className?: string;
  /** 8 = cardinal/intercardinal (default). 16 = Vastu 16 zones (22.5°). 32 = Vastu 32 padas (11.25°). */
  mode?: CompassMode;
  /** Override button label, e.g. "Use as main door location". */
  buttonLabel?: string;
}

export default function CompassHelper({ onUseDirection, className = '', mode = '8', buttonLabel }: CompassHelperProps) {
  const [status, setStatus] = useState<'idle' | 'requesting' | 'active' | 'unsupported' | 'denied'>('idle');
  const [heading, setHeading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const direction = heading != null ? degreesToDirection(heading, mode) : null;

  useEffect(() => {
    if (status !== 'requesting' || typeof window === 'undefined') return;

    setError(null);
    let removed = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const handler = (e: DeviceOrientationEvent) => {
      if (removed) return;
      const value =
        (e as unknown as { webkitCompassHeading?: number }).webkitCompassHeading ??
        (e.absolute && e.alpha != null ? e.alpha : null);
      if (typeof value === 'number' && !Number.isNaN(value)) {
        setHeading(value);
        setStatus('active');
        if (timeoutId != null) clearTimeout(timeoutId);
      }
    };

    const requestPermission =
      (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission;

    const setup = async () => {
      if (requestPermission) {
        try {
          const result = await requestPermission.call(DeviceOrientationEvent);
          if (removed) return;
          if (result !== 'granted') {
            setStatus('denied');
            setError('Compass permission was denied.');
            return;
          }
        } catch (err) {
          if (removed) return;
          setStatus('denied');
          setError(err instanceof Error ? err.message : 'Permission request failed.');
          return;
        }
      }
      window.addEventListener('deviceorientation', handler, true);
      window.addEventListener('deviceorientationabsolute', handler, true);
      timeoutId = setTimeout(() => {
        if (removed) return;
        setStatus((s) => (s === 'requesting' ? 'unsupported' : s));
        setError('Compass not available on this device or browser.');
      }, 3000);
    };
    setup();

    return () => {
      removed = true;
      window.removeEventListener('deviceorientation', handler, true);
      window.removeEventListener('deviceorientationabsolute', handler, true);
      if (timeoutId != null) clearTimeout(timeoutId);
    };
  }, [status]);

  return (
    <div
      className={`rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-4 ${className}`}
    >
      <div className="flex items-center gap-2 text-amber-900 font-medium mb-2">
        <Compass className="w-5 h-5 text-amber-700" />
        Compass helper
      </div>
      <p className="text-sm text-slate-700 mb-3">
        Use your device&apos;s compass to set the facing direction of your space. Hold the device in the direction your
        home or room faces.{mode === '16' && ' (16 Vastu zones, 22.5° each.)'}{mode === '32' && ' (32 entrance padas, 11.25° each.)'}
      </p>

      {status === 'idle' && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setStatus('requesting')}
          className="border-amber-300 text-amber-900 hover:bg-amber-100"
        >
          Enable compass
        </Button>
      )}

      {status === 'requesting' && (
        <div className="flex items-center gap-2 text-slate-700">
          <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
          <span className="text-sm">Requesting compass access…</span>
        </div>
      )}

      {status === 'active' && direction && (
        <div className="space-y-2">
          <div className="text-lg font-semibold text-amber-900">
            Current direction: <span className="text-amber-700">{direction}</span>
          </div>
          {onUseDirection && (
            <Button
              type="button"
              size="sm"
              onClick={() => onUseDirection(direction)}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {buttonLabel ?? 'Use this as facing direction'}
            </Button>
          )}
        </div>
      )}

      {(status === 'unsupported' || status === 'denied') && (
        <div className="flex items-start gap-2 text-amber-800">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            {error ?? 'Compass is not available. You can still enter the facing direction manually above.'}
          </div>
        </div>
      )}
    </div>
  );
}
