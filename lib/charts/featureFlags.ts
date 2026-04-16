export function isUnifiedChartsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_CHART_RENDERER_V2 === '1';
}

export function isGroqChartExperimentEnabled(): boolean {
  return process.env.NEXT_PUBLIC_GROQ_CHART_EXPERIMENT === '1';
}

export function isKpChartsV2Enabled(): boolean {
  return process.env.NEXT_PUBLIC_CHARTS_V2_KP === '1';
}

export function isNumerologyChartsV2Enabled(): boolean {
  return process.env.NEXT_PUBLIC_CHARTS_V2_NUMEROLOGY === '1';
}

export function isVastuChartsV2Enabled(): boolean {
  return process.env.NEXT_PUBLIC_CHARTS_V2_VASTU === '1';
}

export function isFengShuiChartsV2Enabled(): boolean {
  return process.env.NEXT_PUBLIC_CHARTS_V2_FENGSHUI === '1';
}

