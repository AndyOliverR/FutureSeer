# Charts V2 Rollout Checklist

Use this for staged rollout of:
- `NEXT_PUBLIC_CHARTS_V2_NUMEROLOGY`
- `NEXT_PUBLIC_CHARTS_V2_KP`
- `NEXT_PUBLIC_CHARTS_V2_VASTU`
- `NEXT_PUBLIC_CHARTS_V2_FENGSHUI`

## Rollout Order
1. Numerology
2. KP
3. Vastu
4. Feng Shui

Enable only one tool flag at a time.

## Per-Tool Verification (2-3 min)

1) Flag + Visibility
- Set only target tool flag to `1`; keep other chart-v2 flags unset or `0`.
- Open tool page and verify Phase 2 preview panel appears exactly once.
- Verify layout on desktop width and mobile width.

2) Data + Geometry Sanity
- Panel labels are meaningful (no empty placeholders).
- Same user/report input yields the same point positions after refresh.
- No clipping/overlap of primary labels.

3) Legacy Surface Safety
- Existing tabs/cards still load and function.
- Viral lock/share flow still works where applicable.
- Ask-the-Seer tab still opens and sends messages.

4) Interaction Smoke
- Rapidly switch tabs; no crashes or blank states.
- Hard refresh; panel still appears under same flag.
- Resize browser; panel remains readable.

5) Console/API Health
- No new red errors in browser console.
- No new failing network requests caused by panel mount.

## Tool-Specific Notes

### Numerology
- Matrix preview shows values from profile/report.
- Existing report/remedies/tabs unchanged.

### KP
- KP overlay preview appears when analysis is available.
- Dasha/timing content remains intact.

### Vastu
- Compass preview appears.
- Entrance/rooms/remedies sections remain intact.

### Feng Shui
- Bagua preview appears with stable sector labels.
- Bagua/rooms/elements/report tabs remain functional.

## Rollback Rule
- If one tool fails checks, disable only that tool flag and redeploy.
- Keep other tool flags unchanged.
