# FutureSeer design principles

Short, actionable statements derived from [AGENTS.md](../AGENTS.md) and the dual design system. Use them to resolve UI and product trade-offs; revise when major flows or tools change (see [principles.design](https://principles.design/) for why this format works).

## Principles

1. **Tradition before novelty**  
   Each divination system follows its own established rules. We do not mix methodologies between tools or take shortcuts with interpretations.

2. **Two skins, one product**  
   Desktop (≥768px) uses Devotionist Web; mobile width (&lt;768px) and Capacitor native use Material 3. Layout and component families must match the active design system—never M3 chrome on web layouts or glass/serif Devotionist patterns on mobile layouts.

3. **Grounded AI**  
   Ask the Seer and tool experts answer from the user’s stored profile and tool reports, not generic mysticism. Domain boundaries hold: each tool expert stays in its lane.

4. **Persistence is a promise**  
   Generated reports live in Firestore under the user. Returning users must see prior work; changes must not corrupt or silently drop stored readings.
   We explain storage and portability in plain language so users know how to access, export, or delete their data.

5. **Clarity over spectacle**  
   Long operations (e.g. full mystical profile generation) set honest expectations about duration and what is / isn’t guaranteed. Prefer understandable states over vague cosmic copy.

6. **Inclusive by default**  
   Critical flows—onboarding, tool access, chat, errors—meet POUR (Perceivable, Operable, Understandable, Robust): labels, focus, live regions, and alerts where users need them.

7. **Evolve explicitly**  
   When we add tools, change generation, or shift routing, update these principles and [AUTH_AND_ROUTING_FLOW.md](./AUTH_AND_ROUTING_FLOW.md) so docs and behavior stay aligned.

## Related

- Dual design implementation: [components/PlatformClassProvider.tsx](../components/PlatformClassProvider.tsx), [hooks/useIsMobileLayout.ts](../hooks/useIsMobileLayout.ts)  
- Metrics and HEART: [HEART_AND_METRICS.md](./HEART_AND_METRICS.md)  
- Roadmap prioritization: [ROADMAP_PRIORITIZATION.md](./ROADMAP_PRIORITIZATION.md)
