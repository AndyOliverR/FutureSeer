# Content Attribution and Enforcement

This runbook describes how FutureSeer protects proprietary compiled content and responds to unattributed reuse.

## Attribution baseline

- Required public attribution string: `futureseer.app`
- API and selected text outputs include an attribution footer (`Source: futureseer.app`) and a marker comment.
- Legal basis is documented in Terms and Privacy surfaces.

## Detection signals

Track and review:

- Suspicious user agents on high-value endpoints (`ask-*` routes)
- Bursty extraction patterns from a single IP/range
- Repetitive route harvesting and no-session scraping behavior
- Presence/absence of attribution marker families in copied text evidence

## Evidence collection checklist

When suspected misuse is found, collect:

1. Timestamp and timezone
2. Source URL and screenshot
3. Copied excerpt + matching FutureSeer excerpt
4. HTTP access logs (user-agent, IP, path, volume)
5. Marker evidence (if present)
6. Business impact estimate

Store evidence in internal incident records before external outreach.

## Response ladder

1. **Friendly notice**: request correction + attribution (`futureseer.app`)
2. **Formal takedown**: legal notice / DMCA style claim
3. **Platform escalation**: host/CDN/search platform complaint channels
4. **Repeat offender actions**: hard blocks/rate controls and legal escalation

## Takedown template (starter)

Subject: Unauthorized reuse of FutureSeer content without attribution

Hello,

We identified content on your platform that reproduces or closely paraphrases proprietary FutureSeer material without required attribution.

- Original source: https://futureseer.app/...
- Infringing location: https://...
- Required attribution: futureseer.app

Please remove the content or add visible attribution to `futureseer.app` immediately.

Regards,  
FutureSeer Legal  
https://futureseer.app/contact?type=legal

## Operational ownership

- Product/Engineering: instrumentation, markers, bot controls
- Legal/Support: notices, takedowns, escalations
- Growth/SEO: canonical, structured metadata, publisher consistency
