import { readFileSync } from 'fs'
import { resolve } from 'path'

/**
 * Mirrors firestore.rules userProfileAllowedKeys / protectedUserKeys.
 * After Generate or a credit debit, Admin writes extra fields onto users/{uid}.
 * hasOnly(allowed) then rejects every client profile save unless those keys
 * are listed (and protected so clients cannot change them).
 */
const SERVER_OWNED_USER_KEYS = [
  'mysticalProfileGeneratedAt',
  'allReportsReady',
  'pendingToolSlugs',
  'toolStatus',
  'lastProgressAt',
  'creditBalance',
  'billingMode',
  'freeUseConsumed',
  'creditOrderIds',
  'lastCreditPurchaseAt',
  'subscriptionActivatedAt',
  'lastBillingDate',
  'lastPaymentId',
  'subscriptionCancelledAt',
] as const

function extractRulesList(source: string, fnName: string): string[] {
  const fn = source.indexOf(`function ${fnName}()`)
  if (fn < 0) throw new Error(`Missing ${fnName} in firestore.rules`)
  const returnIdx = source.indexOf('return [', fn)
  const end = source.indexOf('];', returnIdx)
  const block = source.slice(returnIdx, end)
  return [...block.matchAll(/'([a-zA-Z][a-zA-Z0-9_]*)'/g)].map((m) => m[1])
}

function simulateValidUserUpdate(
  existing: Record<string, unknown>,
  patch: Record<string, unknown>,
  allowed: string[],
  protectedKeys: string[],
): boolean {
  const next = { ...existing, ...patch }
  const keys = Object.keys(next)
  if (next.uid !== existing.uid) return false
  if (keys.some((k) => !allowed.includes(k))) return false
  const changed = keys.filter((k) => existing[k] !== next[k])
  if (changed.some((k) => protectedKeys.includes(k))) return false
  return true
}

describe('firestore user profile rules vs Admin writes', () => {
  const rules = readFileSync(resolve(process.cwd(), 'firestore.rules'), 'utf8')
  const allowed = extractRulesList(rules, 'userProfileAllowedKeys')
  const protectedKeys = extractRulesList(rules, 'protectedUserKeys')

  it('allows documents that already have Generate and billing fields', () => {
    for (const key of SERVER_OWNED_USER_KEYS) {
      expect(allowed).toContain(key)
    }
  })

  it('protects Generate and billing fields from client writes', () => {
    for (const key of SERVER_OWNED_USER_KEYS) {
      expect(protectedKeys).toContain(key)
    }
  })

  it('still allows a birth-place save after Generate + credit debit', () => {
    const existing = {
      uid: 'user-1',
      email: 'a@example.com',
      birthPlace: 'Mumbai',
      mysticalProfileGenerated: true,
      mysticalProfileGeneratedAt: 1,
      profileDataHash: 'abc',
      allReportsReady: false,
      pendingToolSlugs: ['tarot'],
      toolStatus: { tarot: { state: 'pending' } },
      lastProgressAt: 1,
      creditBalance: 10,
      billingMode: 'payg',
      freeUseConsumed: { mainSeer: true },
      creditOrderIds: ['order_1'],
      lastCreditPurchaseAt: 1,
    }
    expect(
      simulateValidUserUpdate(existing, { birthPlace: 'Pune', updatedAt: 2 }, allowed, protectedKeys),
    ).toBe(true)
    expect(
      simulateValidUserUpdate(existing, { creditBalance: 999 }, allowed, protectedKeys),
    ).toBe(false)
    expect(
      simulateValidUserUpdate(existing, { allReportsReady: true }, allowed, protectedKeys),
    ).toBe(false)
  })

  it('rejects signup documents that mint credits or mark the catalog ready', () => {
    const createBlock = sourceCreateForbiddenKeys(rules)
    expect(createBlock).toEqual(expect.arrayContaining([...SERVER_OWNED_USER_KEYS]))
    const signup = {
      uid: 'user-1',
      email: 'a@example.com',
      creditBalance: 999,
    }
    expect(Object.keys(signup).some((k) => createBlock.includes(k))).toBe(true)
  })
})

function sourceCreateForbiddenKeys(source: string): string[] {
  const fn = source.indexOf('function validUserCreate')
  if (fn < 0) throw new Error('Missing validUserCreate in firestore.rules')
  const hasAny = source.indexOf('keys().hasAny([', fn)
  const end = source.indexOf(']) == false', hasAny)
  const block = source.slice(hasAny, end)
  return [...block.matchAll(/'([a-zA-Z][a-zA-Z0-9_]*)'/g)].map((m) => m[1])
}
