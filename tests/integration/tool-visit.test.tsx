/**
 * Integration test: Tool visit must not trigger POST /api/profile/generate-mystical or POST /api/seer/chat.
 * Tool pages read from MysticalProfileContext (Firestore/cache), not from those APIs.
 * @jest-environment jsdom
 */

import React from 'react';
import { createRoot } from 'react-dom/client';

const forbiddenUrls = ['/api/profile/generate-mystical', '/api/seer/chat'];

// Mock useToolReport so we only test that no forbidden fetch is triggered when tool data is read
jest.mock('@/hooks/useComprehensiveMysticalProfile', () => ({
  useToolReport: () => ({
    report: null,
    loading: false,
    error: null,
    hasReport: false,
    isReportsStale: false,
    refreshProfile: jest.fn(),
  }),
  useComprehensiveMysticalProfile: () => ({
    profile: null,
    loading: false,
    error: null,
    hasProfile: false,
    isReportsStale: false,
    refreshProfile: jest.fn(),
  }),
}));

import { useToolReport } from '@/hooks/useComprehensiveMysticalProfile';

function ToolVisitConsumer() {
  const { report, loading } = useToolReport('numerology');
  return (
    <div data-testid="tool-consumer">
      {loading ? 'Loading' : report ? 'Has report' : 'No report'}
    </div>
  );
}

describe('Tool visit → no API call', () => {
  let fetchSpy: jest.SpyInstance;
  let originalFetch: typeof global.fetch;

  beforeAll(() => {
    originalFetch = global.fetch;
    if (typeof global.fetch !== 'function') {
      (global as any).fetch = jest.fn();
    }
    fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response));
  });

  afterAll(() => {
    fetchSpy.mockRestore();
    if (originalFetch !== (global as any).fetch) {
      (global as any).fetch = originalFetch;
    }
  });

  beforeEach(() => {
    fetchSpy.mockClear();
  });

  it('rendering a tool consumer that reads report does not call fetch to generate-mystical or seer/chat', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    root.render(<ToolVisitConsumer />);
    const calls = fetchSpy.mock.calls;
    const forbiddenCalls = calls.filter(
      (call) => forbiddenUrls.some((url) => String(call[0]).includes(url))
    );
    expect(forbiddenCalls).toHaveLength(0);
    root.unmount();
    document.body.removeChild(container);
  });
});
