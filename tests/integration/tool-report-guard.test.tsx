/**
 * ToolReportGuard must not render the tool shell when the report is missing.
 * @jest-environment jsdom
 */

import React, { act } from 'react';
import { createRoot } from 'react-dom/client';

jest.mock('next/navigation', () => ({
  usePathname: () => '/tools/tarot',
}));

jest.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: { uid: 'u1' },
    userProfile: { mysticalProfileGenerated: true },
  }),
}));

jest.mock('@/hooks/useEnsureToolReport', () => ({
  useEnsureToolReport: () => ({
    ensuring: false,
    ensureError: null,
    retryEnsure: jest.fn(),
    hasReport: false,
  }),
}));

import { ToolReportGuard } from '@/components/ToolReportGuard';

describe('ToolReportGuard', () => {
  beforeAll(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  })

  it('does not render children when the report is missing', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    await act(async () => {
      root.render(
        <ToolReportGuard loading={false} error={null} toolLabel="tarot">
          <div>HOLLOW_SHELL</div>
        </ToolReportGuard>,
      );
    });
    expect(container.textContent).not.toContain('HOLLOW_SHELL');
    expect(container.textContent).toMatch(/still being generated|Preparing your|Generate this reading/i);
    await act(async () => {
      root.unmount();
    });
    document.body.removeChild(container);
  });
});
