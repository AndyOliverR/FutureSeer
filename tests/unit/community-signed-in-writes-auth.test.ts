import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Signed-in community discussion create and votes require verifyUserRequest.
 * The community page must send a Firebase Bearer token; guest discussion POST
 * stays captcha-gated without auth.
 */
describe('community signed-in writes send Firebase auth', () => {
  const pageSrc = readFileSync(
    join(process.cwd(), 'app/community/attribution/page.tsx'),
    'utf8',
  );
  const votesRouteSrc = readFileSync(
    join(process.cwd(), 'app/api/community/votes/route.ts'),
    'utf8',
  );

  it('sends a Bearer token for signed-in discussion create', () => {
    expect(pageSrc).toContain("fetchWithFirebaseAuthRequired('/api/community/discussions'");
    expect(pageSrc).toContain('guestPost: true');
    const guestBlock = pageSrc.slice(pageSrc.indexOf('handleCreateGuestDiscussion'));
    expect(guestBlock).toMatch(/await fetch\('\/api\/community\/discussions'/);
  });

  it('sends a Bearer token for vote reads and writes', () => {
    expect(pageSrc).toContain('fetchWithFirebaseAuthRequired(`/api/community/votes?userId=');
    expect(pageSrc).toContain("fetchWithFirebaseAuthRequired('/api/community/votes'");
  });

  it('renders the votes route dynamically so Authorization is available', () => {
    expect(votesRouteSrc).toContain("export const dynamic = 'force-dynamic'");
    expect(votesRouteSrc).not.toMatch(/export const dynamic = 'force-static'/);
  });
});
