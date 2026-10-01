import { readFileSync } from 'fs';
import { resolve } from 'path';
import { isFirstOnboardingFreeGrant } from '@/lib/onboardingGenerationGrant';

describe('isFirstOnboardingFreeGrant', () => {
  it('grants the first full generate when no server lock exists', () => {
    expect(isFirstOnboardingFreeGrant(false, null)).toBe(true);
    expect(isFirstOnboardingFreeGrant(undefined, undefined)).toBe(true);
  });

  it('does not grant when the server already marked the profile generated', () => {
    expect(isFirstOnboardingFreeGrant(true, null)).toBe(false);
  });

  it('does not grant when a committed lock exists even if the client cleared the flag', () => {
    expect(isFirstOnboardingFreeGrant(false, { status: 'completed', phase: 'completed' })).toBe(false);
    expect(isFirstOnboardingFreeGrant(false, { status: 'running', phase: 'catalog' })).toBe(false);
    expect(isFirstOnboardingFreeGrant(false, { status: 'failed', freeOnboardingConsumed: true })).toBe(false);
  });

  it('still grants a retry after natal failure before any commit', () => {
    expect(isFirstOnboardingFreeGrant(false, { status: 'failed', phase: 'failed' })).toBe(true);
  });
});

describe('firestore rules protect the onboarding grant fields', () => {
  const rules = readFileSync(resolve(process.cwd(), 'firestore.rules'), 'utf8');

  function protectedKeys(): string[] {
    const fn = rules.indexOf('function protectedUserKeys()');
    const returnIdx = rules.indexOf('return [', fn);
    const end = rules.indexOf('];', returnIdx);
    return [...rules.slice(returnIdx, end).matchAll(/'([a-zA-Z][a-zA-Z0-9_]*)'/g)].map((m) => m[1]);
  }

  it('rejects client changes to mysticalProfileGenerated and profileDataHash', () => {
    const keys = protectedKeys();
    expect(keys).toContain('mysticalProfileGenerated');
    expect(keys).toContain('profileDataHash');
  });
});
