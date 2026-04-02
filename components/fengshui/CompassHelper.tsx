'use client';

import { useState, useEffect } from 'react';
import { Compass, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  degreesTo16Zone,
  degreesTo32Pada,
  degreesTo4Cardinal,
  degreesTo45FieldLabel,
  VASTU_16_ZONE_THEMES,
  type VastuCompassMode,
} from '@/lib/vastuDirections';
import { VASTU_45_REFERENCE_URL } from '@/lib/vastu45Fields';
import { VastuCompassDial } from '@/components/vastu/VastuCompassDial';
import { useIsMobileLayout } from '@/hooks/useIsMobileLayout';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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

export type CompassMode = VastuCompassMode;

function degreesToDirection(degrees: number, mode: CompassMode): string {
  if (mode === '4') return degreesTo4Cardinal(degrees);
  if (mode === '16') return degreesTo16Zone(degrees);
  if (mode === '32') return degreesTo32Pada(degrees);
  if (mode === '45') return degreesTo45FieldLabel(degrees);
  return degreesToDirection8(degrees);
}

interface CompassHelperProps {
  /** Called when user taps the use-direction button with the current direction label. */
  onUseDirection?: (direction: string, context?: { headingDeg?: number }) => void;
  /** Optional class name for the container. */
  className?: string;
  /** Precision: 4 / 8 / 16 / 32 / 45. */
  mode?: CompassMode;
  /** Override button label, e.g. "Use as main door location". */
  buttonLabel?: string;
}

export default function CompassHelper({ onUseDirection, className = '', mode = '8', buttonLabel }: CompassHelperProps) {
  const [status, setStatus] = useState<'idle' | 'requesting' | 'active' | 'unsupported' | 'denied'>('idle');
  const [heading, setHeading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [themeOpen, setThemeOpen] = useState(false);
  const isMobileLayout = useIsMobileLayout();

  const direction = heading != null ? degreesToDirection(heading, mode) : null;
  const themeHint =
    mode === '16' && heading != null
      ? VASTU_16_ZONE_THEMES[degreesTo16Zone(heading) as keyof typeof VASTU_16_ZONE_THEMES]
      : null;

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

  const dialVariant = isMobileLayout ? 'm3' : 'web';
  const hasLiveHeading = status === 'active' && heading != null;
  const dialHeading = hasLiveHeading ? heading : null;

  const modeHelp =
    mode === '4'
      ? 'Four cardinals (90° each).'
      : mode === '16'
        ? '16 Vastu zones (22.5° each).'
        : mode === '32'
          ? '32 entrance padas (11.25° each).'
          : mode === '45'
            ? '45 fields (8° each), names from a published quick-reference table — not universal across schools.'
            : 'Eight cardinal / intercardinal directions (45° each).';

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
        home or room faces. {modeHelp} The dial below is always shown as a <strong>reference (North up)</strong>; it
        rotates with live heading when the compass works (best on phone/tablet over HTTPS).
      </p>

      <div className="space-y-3 mb-4">
        <VastuCompassDial
          headingDeg={dialHeading}
          mode={mode}
          variant={dialVariant}
          size={isMobileLayout ? 200 : 240}
        />
        <p className="text-xs text-slate-600">
          {hasLiveHeading && heading != null ? (
            <>
              <span className="font-medium text-amber-900">Live</span> — rose rotates with device heading. Heading:{' '}
              <span className="tabular-nums">{heading.toFixed(1)}°</span>
            </>
          ) : (
            <>
              <span className="font-medium text-amber-900">Reference (North up)</span> — enable the compass for live
              rotation. Many desktop browsers cannot access the magnetometer; use a phone or enter direction manually.
            </>
          )}
        </p>
      </div>

      {status === 'idle' && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setStatus('requesting')}
          className="border-amber-300 text-amber-900 hover:bg-amber-100 mb-3"
        >
          Enable compass
        </Button>
      )}

      {status === 'requesting' && (
        <div className="flex items-center gap-2 text-slate-700 mb-3">
          <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
          <span className="text-sm">Requesting compass access…</span>
        </div>
      )}

      {status === 'active' && direction && heading != null && (
        <div className="space-y-3">
          <div className="text-lg font-semibold text-amber-900">
            Current direction: <span className="text-amber-700">{direction}</span>
          </div>
          {mode === '45' && (
            <p className="text-xs text-slate-600 leading-relaxed">
              Different schools use different mandala grids. This 45-field rotation follows the quick-reference ordering
              described at{' '}
              <a href={VASTU_45_REFERENCE_URL} target="_blank" rel="noopener noreferrer" className="text-amber-800 underline">
                Anant Vastu
              </a>
              . It is a compass teaching aid, not a substitute for on-site assessment.
            </p>
          )}
          {mode === '16' && themeHint && (
            <Collapsible open={themeOpen} onOpenChange={setThemeOpen}>
              <CollapsibleTrigger className="flex items-center gap-1 text-sm text-amber-800 font-medium hover:underline">
                {themeOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Traditional association (16 zones)
              </CollapsibleTrigger>
              <CollapsibleContent className="text-sm text-slate-700 pt-2">{themeHint}</CollapsibleContent>
            </Collapsible>
          )}
          {onUseDirection && (
            <Button
              type="button"
              size="sm"
              onClick={() => onUseDirection(direction, { headingDeg: heading ?? undefined })}
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
