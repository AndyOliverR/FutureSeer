# reCAPTCHA Triage (Support Quick Guide)

Use this guide when admin error events show `area: auth` and a `code` starting with `fs/captcha-`.
Email domain is not a gating factor here: Microsoft, Apple relay, Yahoo, custom domains, and Gmail all share the same captcha gate before credential validation.

## Code Mapping

| Code | What it means | Typical cause | Support action |
|---|---|---|---|
| `fs/captcha-no-site-key` | Client could not find public reCAPTCHA site key | `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` missing in deployment env | Escalate to engineering to set env var, redeploy, and retest `/signin` |
| `fs/captcha-server-config` | Server verify route is missing required reCAPTCHA config | `RECAPTCHA_ENTERPRISE_API_KEY`, `RECAPTCHA_ENTERPRISE_PROJECT_ID`, or `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` missing/mismatched | Escalate to engineering to validate env vars and project/site key alignment |
| `fs/captcha-missing-script` | Browser did not load Google reCAPTCHA script | Network/ad blocker/content blocker, CSP/script blocking, temporary CDN issue | Ask user to hard refresh, disable blocker for site, try incognito/another network |
| `fs/captcha-token-missing` | reCAPTCHA execute did not return a token | Script loaded but execution failed/blocked | Retry once, then collect browser + extensions + network details and escalate |
| `fs/captcha-verify-failed` | Server rejected captcha assessment | Low risk score, invalid token/action mismatch, expired token | Ask user to retry without VPN/proxy, disable blockers, try clean browser session |
| `fs/captcha-internal-error` | Verify endpoint threw unexpected server error | Transient backend/API issue | Retry after 1-2 minutes; if repeated, escalate with timestamp + event payload |

## First-Response Checklist

1. Confirm the event includes `route: /signin`, `method: email`, and the `code`.
2. Check whether failures are isolated to one user/browser or broad across users.
3. Ask user to retry with:
   - hard refresh,
   - no ad blocker/VPN,
   - private window,
   - alternate network.
4. If repeated, attach these fields to escalation:
   - `code`, `captchaReason`, `captchaStage`, `httpStatus`,
   - `browser`, `timestamp`, `environment`, `route`.
5. If Service Worker errors are present, ask user to run stale SW recovery once:
   - DevTools → Application → Service Workers → Unregister `sw.js`
   - DevTools → Application → Clear storage → Clear site data
   - Hard reload (`Ctrl+Shift+R`) and retry sign-in.
6. Check recent auth telemetry actions for captcha loader signals:
   - `captcha_script_loaded` (primary host success),
   - `captcha_script_fallback_attempt` and `captcha_script_fallback_loaded` (recaptcha.net recovery),
   - `captcha_script_fallback_failed` (both hosts unavailable),
   - `captcha_adaptive_bypass_used` (email sign-in allowed after script-unavailable retry when mode is adaptive).
7. Runtime recovery telemetry hints:
   - `runtimeRecoveryAttempted: true` in `captcha_missing_script` metadata means the app attempted script reinjection before strict failure.
   - `captchaPreflight.primaryScriptTagPresent=false` and `captchaPreflight.fallbackScriptTagPresent=false` usually means script blocked before DOM insertion/retention.
   - `captchaPreflight.primaryScriptTagPresent=true` and `hasGrecaptchaEnterprise=false` suggests load/execution race or blocked script response.
   - `captchaPreflight.recoveryWaitMs` shows how long client waited for readiness before strict fail.
   - `captchaPreflight.online=false` points to offline/transport conditions rather than domain/provider issues.
8. Service worker decommission check:
   - Web SW is intentionally decommissioned.
   - Ask user to hard reload once (`Ctrl+Shift+R`).
   - If needed, confirm `navigator.serviceWorker.getRegistrations()` returns `[]` on `/signin`.
   - If this still returns registrations immediately after deploy, wait 1-2 minutes for CDN propagation and hard reload again.

## Escalation Notes

- If OAuth sign-in works but email sign-in fails with `fs/captcha-*`, issue is likely in captcha path, not core Firebase email/password auth.
- If browser console also shows Service Worker errors like `Response body is already used` or `FetchEvent ... network error`, treat this as a combined SW+caching contributor and escalate with both captcha and SW logs.
- Strict-mode policy: if both captcha providers fail, email sign-in remains blocked by design.
- Hybrid-mode policy (`NEXT_PUBLIC_AUTH_CAPTCHA_MODE=adaptive`): captcha is still attempted first; only `fs/captcha-missing-script` after retry can bypass for email sign-in.
- Do not advise users to bypass security checks.
