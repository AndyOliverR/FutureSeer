/** Panchanga timing suitability bands — not outcome predictions. */
export type ActionBand = 'observe' | 'neutral' | 'favorable';

export function scoreToActionBand(score: number): ActionBand {
  if (score >= 80) return 'favorable';
  if (score >= 60) return 'neutral';
  return 'observe';
}

export function actionBandLabel(band: ActionBand): string {
  switch (band) {
    case 'favorable':
      return 'Favorable window';
    case 'neutral':
      return 'Small step';
    case 'observe':
      return 'Observe';
  }
}

export function actionBandHint(band: ActionBand): string {
  switch (band) {
    case 'favorable':
      return 'Timing supports this action today if you choose to move.';
    case 'neutral':
      return 'Proceed with care — reduce friction, not force.';
    case 'observe':
      return 'Wait or prepare; avoid high-stakes moves in this lane today.';
  }
}

export function actionBandScoreColor(band: ActionBand): string {
  switch (band) {
    case 'favorable':
      return 'text-green-600';
    case 'neutral':
      return 'text-amber-600';
    case 'observe':
      return 'text-red-600';
  }
}
