/**
 * Dependency audit via npm's bulk advisory API.
 *
 * Why: npm retired `/-/npm/v1/security/audits{,/quick}` (HTTP 410).
 * pnpm 10 (our packageManager) still calls those endpoints, so
 * `pnpm audit` fails in CI. This script reads package versions from
 * `pnpm-lock.yaml` and POSTs them to `/-/npm/v1/security/advisories/bulk`.
 *
 * Usage: node scripts/audit-deps-bulk.mjs [low|moderate|high|critical]
 * Default severity gate: high
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import https from 'node:https'

const BULK_ENDPOINT = 'https://registry.npmjs.org/-/npm/v1/security/advisories/bulk'
const SEVERITY_ORDER = ['low', 'moderate', 'high', 'critical']

const level = process.argv[2] || 'high'
const threshold = SEVERITY_ORDER.indexOf(level)
if (threshold === -1) {
  console.error(`Unknown severity: ${level}. Use: low, moderate, high, or critical`)
  process.exit(1)
}
const severityGate = new Set(SEVERITY_ORDER.slice(threshold))

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const lockfilePath = join(root, 'pnpm-lock.yaml')

let lockfileText
try {
  lockfileText = readFileSync(lockfilePath, 'utf8')
} catch (err) {
  console.error('Failed to read pnpm-lock.yaml:', err instanceof Error ? err.message : err)
  process.exit(1)
}

/**
 * Collect name -> versions from lockfile `packages:` keys.
 * Keys look like `next@16.2.6(...)` or `@scope/pkg@1.2.3(...)`.
 * @param {string} text
 * @returns {Record<string, string[]>}
 */
function collectDepsFromLockfile(text) {
  /** @type {Record<string, string[]>} */
  const deps = {}
  const packagesIdx = text.indexOf('\npackages:')
  if (packagesIdx === -1 && !text.startsWith('packages:')) {
    console.error('pnpm-lock.yaml has no packages: section')
    process.exit(1)
  }
  const section = packagesIdx === -1 ? text : text.slice(packagesIdx)
  // Lines like: "  next@16.2.6(react@19.2.1):" or "  '@scope/name@1.2.3':"
  const keyRe = /^ {2}(?:'([^']+)'|([^:\s]+)):/gm
  let match
  while ((match = keyRe.exec(section)) !== null) {
    const raw = match[1] || match[2]
    if (!raw || raw === 'packages') continue
    const noPeers = raw.split('(')[0]
    const at = noPeers.lastIndexOf('@')
    if (at <= 0) continue
    const name = noPeers.slice(0, at)
    const version = noPeers.slice(at + 1)
    if (!name || !version || version.includes('/')) continue
    if (!deps[name]) deps[name] = []
    if (!deps[name].includes(version)) deps[name].push(version)
  }
  return deps
}

const deps = collectDepsFromLockfile(lockfileText)
const packageCount = Object.keys(deps).length
if (packageCount === 0) {
  console.error('No packages parsed from pnpm-lock.yaml')
  process.exit(1)
}
console.log(`Auditing ${packageCount} packages via npm bulk advisory API (gate: ${level}+)…`)

const body = JSON.stringify(deps)

await new Promise((resolve) => {
  const req = https.request(
    BULK_ENDPOINT,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        Accept: 'application/json',
      },
    },
    (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        if (res.statusCode !== 200) {
          console.error(`Registry returned ${res.statusCode}: ${data}`)
          process.exit(1)
        }

        let advisories
        try {
          advisories = JSON.parse(data)
        } catch {
          console.error('Invalid JSON from advisory endpoint:', data.slice(0, 500))
          process.exit(1)
        }

        const affected = Object.keys(advisories || {})
        if (affected.length === 0) {
          console.log('No vulnerabilities found.')
          process.exit(0)
        }

        let gated = 0
        for (const pkg of affected) {
          const listForPkg = Array.isArray(advisories[pkg]) ? advisories[pkg] : []
          for (const advisory of listForPkg) {
            const sev = String(advisory.severity || 'low').toLowerCase()
            console.log(
              `${sev.padEnd(9)} ${pkg} ${advisory.vulnerable_versions || ''} — ${advisory.title || advisory.id || 'advisory'}`,
            )
            if (severityGate.has(sev)) gated += 1
          }
        }

        if (gated > 0) {
          console.error(`\n${gated} advisory(ies) at or above "${level}" severity.`)
          process.exit(1)
        }
        console.log(`\nNo advisories at or above "${level}" severity.`)
        resolve(undefined)
      })
    },
  )

  req.on('error', (err) => {
    console.error('Request failed:', err.message)
    process.exit(1)
  })

  req.write(body)
  req.end()
})
