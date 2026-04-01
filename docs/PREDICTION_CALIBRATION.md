# Prediction calibration (offline evaluation)

This document describes **how to evaluate** Markov/Bayesian and Seer outputs **without** changing traditional chart logic. Nothing here runs automatically in production.

## Goals

- Tune **confidence** and **wording** when user feedback or expert review disagrees with headline predictions.
- **Not** to replace Vedic/KP/Tarot rules with generic ML.

## Suggested process

1. **Sample**: Export or copy a small, consented set of `(question, chart slice summary, model output, user rating optional)` from support or internal testing.
2. **Rubric**: Define what “good” means (e.g. timing phrased as periods, no false medical claims, tone matches AGENTS.md).
3. **Compare**: For each row, note whether the **probabilistic layer** (`lib/predictiveAlgorithms.ts`) **helped or hurt** empathy vs the same answer without it.
4. **Adjust**: Change weights in `PredictiveSystem.combinePredictions`, `LifePathMarkovChain` behavior boosts, or **prompt** text in `lib/vedicSeerPrompts.ts` — not random drift in dasha math.

## Metrics (lightweight)

- **Calibration**: Do stated confidence bands match human “feels right” buckets (even ordinal)?
- **Resonance**: Short user survey (1–5) after Seer replies — optional, privacy-preserving.

## References

- Markov pipeline: [MULTI_SYSTEM_PREDICTION.md](MULTI_SYSTEM_PREDICTION.md)
- Implementation: `lib/predictiveAlgorithms.ts`, `lib/predictionUserSignals.ts`
