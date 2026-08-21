/**
 * Planetary guidance UI states: generated report, partial report, signed-out.
 * @jest-environment jsdom
 */

import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { PlanetaryGuidanceView } from '@/components/remedies/PlanetaryGuidanceExperience';
import { PlanetaryGuidanceExperience } from '@/components/remedies/PlanetaryGuidanceExperience';
import { buildPlanetaryGuidance } from '@/lib/vedic/planetaryGuidance';

jest.mock('@/hooks/useIsMobileLayout', () => ({
  useIsMobileLayout: () => false,
}));

jest.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: { uid: 'user-1' },
    userProfile: null,
    loading: false,
  }),
}));

jest.mock('@/hooks/useComprehensiveMysticalProfile', () => ({
  useToolReport: (slug: string) => {
    if (slug === 'vedic') {
      return {
        report: {
          ascendant: { signName: 'Cancer' },
          currentDasha: { planet: 'Saturn' },
          planets: [{ name: 'Saturn', signName: 'Capricorn', house: 7 }],
        },
        loading: false,
        error: null,
        hasReport: true,
      };
    }
    return { report: null, loading: false, error: null, hasReport: false };
  },
}));

const chart = {
  ascendant: { signName: 'Cancer' },
  currentDasha: { planet: 'Saturn' },
  planets: [
    { name: 'Saturn', signName: 'Capricorn', house: 7 },
    { name: 'Rahu', signName: 'Gemini', house: 12 },
  ],
};

describe('PlanetaryGuidanceView', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    flushSync(() => {
      root.unmount();
    });
    document.body.removeChild(container);
  });

  it('shows a sign-in fallback when signed out', () => {
    const guidance = buildPlanetaryGuidance(null, null);
    flushSync(() => {
      root.render(
        <PlanetaryGuidanceView
          viewState="signed_out"
          guidance={guidance}
          selectedPlanet="Sun"
          onSelectPlanet={() => undefined}
          isMobileLayout={false}
        />,
      );
    });
    expect(container.textContent).toMatch(/Sign in/i);
    expect(container.querySelector('[data-testid="planetary-guidance-fallback"]')).not.toBeNull();
  });

  it('shows a generate-profile CTA when there is no Vedic report', () => {
    const guidance = buildPlanetaryGuidance(null, null);
    flushSync(() => {
      root.render(
        <PlanetaryGuidanceView
          viewState="no_profile"
          guidance={guidance}
          selectedPlanet="Sun"
          onSelectPlanet={() => undefined}
          isMobileLayout={false}
        />,
      );
    });
    expect(container.textContent).toMatch(/Generate your mystical profile/i);
    expect(container.textContent).toMatch(/Open profile/i);
  });

  it('renders personalized nine-graha guidance from a generated report', () => {
    const guidance = buildPlanetaryGuidance(chart, null);
    flushSync(() => {
      root.render(
        <PlanetaryGuidanceView
          viewState="personalized"
          guidance={guidance}
          selectedPlanet="Saturn"
          onSelectPlanet={() => undefined}
          isMobileLayout={false}
        />,
      );
    });
    expect(container.querySelector('[data-testid="planetary-guidance-personalized"]')).not.toBeNull();
    expect(container.textContent).toMatch(/Work With Your Planets/);
    expect(container.textContent).toMatch(/Saturn/);
    expect(container.textContent).toMatch(/Rahu/);
    expect(container.textContent).toMatch(/Ketu/);
    expect(container.textContent).toMatch(/What this planet wants/i);
    expect(container.textContent).toMatch(/When it is ignored/i);
    expect(container.textContent).toMatch(/Keep one promise on time/i);
    expect(container.textContent).toMatch(/Ask the Vedic Seer about Saturn/);
  });

  it('shows a partial-data notice when Navaratna is missing', () => {
    const guidance = buildPlanetaryGuidance(chart, null);
    flushSync(() => {
      root.render(
        <PlanetaryGuidanceView
          viewState="partial"
          guidance={guidance}
          selectedPlanet="Saturn"
          onSelectPlanet={() => undefined}
          isMobileLayout={false}
        />,
      );
    });
    expect(container.querySelector('[data-testid="planetary-guidance-partial"]')).not.toBeNull();
    expect(container.textContent).toMatch(/will not infer a stone/i);
  });
});

describe('PlanetaryGuidanceExperience', () => {
  it('does not call generate-mystical or seer APIs when opening planets', () => {
    const originalFetch = global.fetch;
    if (typeof global.fetch !== 'function') {
      (global as unknown as { fetch: typeof fetch }).fetch = jest.fn() as unknown as typeof fetch;
    }
    const fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response),
    );
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    flushSync(() => {
      root.render(<PlanetaryGuidanceExperience />);
    });
    const forbidden = fetchSpy.mock.calls.filter((call) =>
      ['/api/profile/generate-mystical', '/api/seer/chat', '/api/ask-vedic-seer'].some((url) =>
        String(call[0]).includes(url),
      ),
    );
    expect(forbidden).toHaveLength(0);
    flushSync(() => {
      root.unmount();
    });
    document.body.removeChild(container);
    fetchSpy.mockRestore();
    if (originalFetch !== global.fetch) {
      global.fetch = originalFetch;
    }
  });
});
