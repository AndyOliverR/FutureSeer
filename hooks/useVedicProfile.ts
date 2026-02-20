'use client'

import { useMemo } from 'react'
import type { ComprehensiveMysticalProfile } from '@/contexts/MysticalProfileContext'

export interface VedicDerived {
  dasaData: unknown[] | null
  enhancedOverview: string
  enhancedPlanets: Record<string, string>
  enhancedHouses: Record<number, string>
  enhancedDasha: string
  enhancedTransits: string
  enhancedRemedies: Record<string, string>
  enhancedPanchanga: string
  vedicReading: {
    interpretations: Record<string, unknown>
    remedies: Array<{ name?: string; type?: string; description?: string; practice?: string; instructions?: string; timing?: string }>
  } | null
  vedicAstroNumerologyReport: unknown
  hasLoadedInterpretations: boolean
  interpretationSource: 'fallback' | 'cache' | 'api'
  isLoadingVedicAstroNumerology: boolean
  isGeneratingInterpretations: boolean
}

const DEFAULT_EMPTY = {
  enhancedOverview: '',
  enhancedPlanets: {} as Record<string, string>,
  enhancedHouses: {} as Record<number, string>,
  enhancedDasha: '',
  enhancedTransits: '',
  enhancedRemedies: {} as Record<string, string>,
  enhancedPanchanga: '',
  hasLoadedInterpretations: false,
  interpretationSource: 'fallback' as const,
  isLoadingVedicAstroNumerology: true,
  isGeneratingInterpretations: false
}

export function useVedicProfile(profile: ComprehensiveMysticalProfile | null, hasVedicData: boolean): VedicDerived {
  return useMemo((): VedicDerived => {
    if (!profile || !hasVedicData) {
      return {
        dasaData: null,
        vedicReading: null,
        vedicAstroNumerologyReport: null,
        ...DEFAULT_EMPTY,
        isLoadingVedicAstroNumerology: !profile,
        isGeneratingInterpretations: false
      }
    }

    const vedic = profile.vedic as { dasha?: unknown[]; currentDasha?: unknown } | undefined
    const interp = profile.interpretations as Record<string, unknown> | undefined

    let dasaData: unknown[] | null = null
    if (vedic?.dasha != null) {
      dasaData = Array.isArray(vedic.dasha) ? vedic.dasha : [vedic.dasha]
    } else if (vedic?.currentDasha != null && !Array.isArray(vedic.currentDasha)) {
      dasaData = [vedic.currentDasha]
    }

    let enhancedOverview = ''
    let enhancedDasha = ''
    const enhancedRemedies: Record<string, string> = {}

    if (interp) {
      const comp = (interp.personality as Record<string, unknown>)?.overview ?? interp.comprehensive
      if (typeof comp === 'string' && comp) enhancedOverview = comp
      const dashaObj = interp.dasha as Record<string, unknown> | undefined
      if (dashaObj && typeof dashaObj.overview === 'string') enhancedDasha = dashaObj.overview
      const remediesObj = interp.remedies as Record<string, unknown> | undefined
      if (remediesObj) {
        const parts: string[] = []
        if (typeof remediesObj.overview === 'string') parts.push(remediesObj.overview)
        const mantras = remediesObj.mantras as string[] | undefined
        if (Array.isArray(mantras) && mantras.length) parts.push('Mantras: ' + mantras.join(', '))
        const gemstones = remediesObj.gemstones as string[] | undefined
        if (Array.isArray(gemstones) && gemstones.length) parts.push('Gemstones: ' + gemstones.join(', '))
        const practices = remediesObj.practices as string[] | undefined
        if (Array.isArray(practices) && practices.length) parts.push('Practices: ' + practices.join(', '))
        if (parts.length) enhancedRemedies.overview = parts.join('\n\n')
      }
    }

    const astroNum = (profile as Record<string, unknown>).vedicAstroNumerology
    const vedicAstroNumerologyReport =
      astroNum != null && typeof astroNum === 'object' && astroNum !== null && 'data' in astroNum
        ? (astroNum as { data: unknown }).data
        : astroNum ?? null

    let vedicReading: VedicDerived['vedicReading'] = null
    if (interp) {
      const remediesObj = interp.remedies as Record<string, unknown> | undefined
      const practices = (remediesObj?.practices as string[] | undefined)
      const mantras = (remediesObj?.mantras as string[] | undefined)
      const gemstones = (remediesObj?.gemstones as string[] | undefined)
      const overview = typeof remediesObj?.overview === 'string' ? remediesObj.overview : undefined
      const remedyItems: { name?: string; type?: string; description?: string; practice?: string; instructions?: string; timing?: string }[] = []
      if (overview) remedyItems.push({ name: 'Remedies overview', type: 'Guidance', description: overview, practice: overview })
      if (Array.isArray(mantras) && mantras.length) mantras.forEach((m) => remedyItems.push({ name: 'Mantra', type: 'Mantra', description: m, practice: m }))
      if (Array.isArray(gemstones) && gemstones.length) gemstones.forEach((g) => remedyItems.push({ name: 'Gemstone', type: 'Gemstone', description: g, practice: g }))
      if (Array.isArray(practices) && practices.length) practices.forEach((p) => remedyItems.push({ name: 'Practice', type: 'Practice', description: p, practice: p }))
      vedicReading = {
        interpretations: interp,
        remedies: remedyItems
      }
    }

    return {
      dasaData,
      enhancedOverview,
      enhancedPlanets: {},
      enhancedHouses: {},
      enhancedDasha,
      enhancedTransits: '',
      enhancedRemedies,
      enhancedPanchanga: '',
      vedicReading,
      vedicAstroNumerologyReport,
      hasLoadedInterpretations: true,
      interpretationSource: 'api',
      isLoadingVedicAstroNumerology: false,
      isGeneratingInterpretations: false
    }
  }, [profile, hasVedicData])
}
