/**
 * Swiss Ephemeris (WASM) natal planet longitudes for Western tropical charts.
 * Uses bundled `swisseph-wasm` + Moshier built-in ephemeris (SEFLG_MOSEPH) so no `.se1` files are required on the server.
 * House cusps are still computed by `calculateTropicalHouses` (in-app Placidus); metadata labels this hybrid.
 */

import { devLog } from '@/lib/devLogger'

const norm360 = (x: number) => ((x % 360) + 360) % 360

export type SwissPlanetBody = {
  longitude: number
  latitude: number
  distance: number
  speed: number
}

export type SwissPlanetsRecord = {
  sun: SwissPlanetBody
  moon: SwissPlanetBody
  mercury: SwissPlanetBody
  venus: SwissPlanetBody
  mars: SwissPlanetBody
  jupiter: SwissPlanetBody
  saturn: SwissPlanetBody
  uranus: SwissPlanetBody
  neptune: SwissPlanetBody
  pluto: SwissPlanetBody
  chiron: SwissPlanetBody
  northNode: SwissPlanetBody
  southNode: SwissPlanetBody
  lilith: SwissPlanetBody
}

type SwissWasm = InstanceType<Awaited<typeof import('swisseph-wasm')>['default']>

let wasmSingleton: SwissWasm | null | undefined

async function getSwissWasm(): Promise<SwissWasm | null> {
  if (wasmSingleton !== undefined) return wasmSingleton
  // In local/dev server runtimes, swisseph-wasm asset fetch can 404 (`/_next/static/media/...data`).
  // We intentionally skip WASM here and let callers use the Astronomia fallback path.
  if (process.env.NODE_ENV !== 'production') {
    wasmSingleton = null
    return null
  }
  try {
    const mod = await import('swisseph-wasm')
    const swe = new mod.default()
    await swe.initSwissEph()
    wasmSingleton = swe
    return swe
  } catch (e) {
    devLog.warn('swisseph-wasm init failed', e, 'swissNatalChart')
    wasmSingleton = null
    return null
  }
}

function bodyFromCalc(res: Float64Array): SwissPlanetBody {
  return {
    longitude: norm360(res[0]),
    latitude: res[1],
    distance: res[2],
    speed: res[3],
  }
}

/**
 * Computes tropical planet longitudes (incl. true node, mean Lilith, Chiron) via Swiss Ephemeris WASM.
 * Returns null if WASM fails (caller should use Astronomia fallback).
 */
export async function computeSwissNatalPlanets(birthUtc: Date): Promise<{
  planets: SwissPlanetsRecord
  julianDayUt: number
  flag: number
  engine: string
} | null> {
  const swe = await getSwissWasm()
  if (!swe) return null

  try {
    const y = birthUtc.getUTCFullYear()
    const mo = birthUtc.getUTCMonth() + 1
    const day = birthUtc.getUTCDate()
    const ut =
      birthUtc.getUTCHours() +
      birthUtc.getUTCMinutes() / 60 +
      birthUtc.getUTCSeconds() / 3600 +
      birthUtc.getUTCMilliseconds() / 3600000

    const jd = swe.julday(y, mo, day, ut)
    const flag = swe.SEFLG_MOSEPH | swe.SEFLG_SPEED

    const calc = (ipl: number) => bodyFromCalc(swe.calc_ut(jd, ipl, flag))

    const north = calc(swe.SE_TRUE_NODE)
    const southLon = norm360(north.longitude + 180)
    const south: SwissPlanetBody = {
      longitude: southLon,
      latitude: 0,
      distance: north.distance,
      speed: north.speed,
    }

    const planets: SwissPlanetsRecord = {
      sun: calc(swe.SE_SUN),
      moon: calc(swe.SE_MOON),
      mercury: calc(swe.SE_MERCURY),
      venus: calc(swe.SE_VENUS),
      mars: calc(swe.SE_MARS),
      jupiter: calc(swe.SE_JUPITER),
      saturn: calc(swe.SE_SATURN),
      uranus: calc(swe.SE_URANUS),
      neptune: calc(swe.SE_NEPTUNE),
      pluto: calc(swe.SE_PLUTO),
      chiron: calc(swe.SE_CHIRON),
      northNode: north,
      southNode: south,
      lilith: calc(swe.SE_MEAN_APOG),
    }

    return {
      planets,
      julianDayUt: jd,
      flag,
      engine: 'Swiss Ephemeris (WASM, Moshier; tropical longitudes)',
    }
  } catch (e) {
    devLog.warn('computeSwissNatalPlanets failed', e, 'swissNatalChart')
    return null
  }
}
