# Auth and Routing Flow Map

For a compact reference (traced flows table, route transitions by user type, navigation triggers), see [AUTH_AND_ROUTING_SUMMARY.md](AUTH_AND_ROUTING_SUMMARY.md).

## 1. Architecture overview

- **Auth provider**: [hooks/use-auth.tsx](../hooks/use-auth.tsx) wraps the app and exposes `user`, `userProfile`, `loading`, `signIn`, `signOut`, `refreshProfile`, and admin flags. It uses Firebase `onAuthStateChanged` and, on init, `getRedirectResult()` then loads profile via `getUserProfile(uid)`.
- **Proxy (edge)**: In Next.js 16, [proxy.ts](../proxy.ts) is the sole edge entry (not `middleware.ts`). It applies a lightweight `fs_auth` cookie hint and redirect to `/signin?redirect=` on protected prefixes. **Per-page** `useEffect` guards still call `router.push(...)` when the user is missing; APIs verify the Firebase ID token.
- **Returning vs new user**: [lib/firebase.ts](../lib/firebase.ts) exports `isReturningUser(user)`: `lastSignInTime - creationTime > 60000` (ms) ⇒ returning user.

```mermaid
flowchart LR
  subgraph auth [Auth layer]
    Firebase[Firebase Auth]
    AuthProvider[use-auth AuthProvider]
    Firebase --> AuthProvider
  end
  subgraph routes [Key routes]
    SignIn["/signin"]
    SignUp["/signup"]
    ProfileSetup["/profile-setup"]
    Profile["/profile"]
    MysticalProfile["/mystical-profile"]
    Tools["/tools"]
    Home["/"]
  end
  AuthProvider --> SignIn
  AuthProvider --> SignUp
  AuthProvider --> ProfileSetup
  AuthProvider --> Profile
  AuthProvider --> MysticalProfile
  AuthProvider --> Tools
```

---

## 2. Login flow

| Entry | After success | Where |
| ----- | ------------- | ----- |
| **Sign-in page** ([app/signin/page.tsx](../app/signin/page.tsx)) | | |
| Google | `getSafeAuthRedirectAfterSignIn(redirect) ?? (returning ? getReturningUserWithReportsDestination() : "/profile")` | `handleGoogleSignIn`: `isReturningUser(user)`; `router.push(destination)`. |
| Email | Same formula | `handleSubmit`: `router.push(destination)`. |
| **AuthModal** ([components/auth/AuthModal.tsx](../components/auth/AuthModal.tsx)) | | |
| Google | Returning → `/mystical-profile`, new → `/profile` | `router.push(returning ? getReturningUserWithReportsDestination() : '/profile')`. Uses `isReturningUser(user)`. |
| Email sign-in | → `/mystical-profile` (same helper) | `router.push(getReturningUserWithReportsDestination())` when returning heuristic matches. |

**Note**: The sign-in page reads `redirect` from `useSearchParams()` and validates it with [lib/safeAuthRedirect.ts](../lib/safeAuthRedirect.ts) (allowlisted paths; unknown `/community/*` → `/community/attribution`). AuthModal is **not currently imported or used** anywhere else in the app; entry points use `/signin` and `/signup` (e.g. [hero-section.tsx](../components/hero-section.tsx)).

---

## 3. Signup flow

| Entry | After success | Where |
| ----- | ------------- | ----- |
| **Sign-up page** ([app/signup/page.tsx](../app/signup/page.tsx)) | | |
| Google | `redirectTo ?? (returning ? getReturningUserWithReportsDestination() : "/profile")` | `handleGoogleSignIn`: uses `getSafeAuthRedirectAfterSignIn` for `redirectTo`. |
| Email (SignupFlow) | Always → `/profile` | After flow completes: `router.push("/profile")`. |
| **AuthModal** | | |
| Email sign-up | → `/profile` | `router.push('/profile')`. |

---

## 4. Profile completion flow (new user)

- **Route**: [app/profile-setup/page.tsx](../app/profile-setup/page.tsx).
- **Guard**: `useEffect`: if `!user` → `router.push('/signin')` (lines 112–116). No redirect when profile already exists; page can be used to complete or edit.
- **On complete**: `handleComplete` saves profile (and may call AstroApp API), then `router.push('/profile')` (line 247).

---

## 5. Profile edit flow (existing user)

- **Route**: [app/profile/page.tsx](../app/profile/page.tsx).
- **Guard**: `useEffect`: if `!authLoading && !user` → `router.push("/signin")` (lines 281–284). If `!user` after loading, render returns `null` (lines 711–713) while the effect performs the redirect.
- **Save**: `handleSave` updates profile and stays on `/profile` (no navigation).
- **Generate mystical profile**: On success → `router.push(RETURNING_USER_WITH_REPORTS_DESTINATION)` (currently `/mystical-profile`; see [lib/authRouting.ts](../lib/authRouting.ts)).

---

## 6. Logout flow

- **Triggers**: Profile page `handleSignOut` or [UserMenuDropdown](../components/UserMenuDropdown.tsx) `handleSignOut` both call `signOut()` from `useAuth()`.
- **Implementation**: [hooks/use-auth.tsx](../hooks/use-auth.tsx) `signOut` clears `userProfile` then calls `signOutUser()` from [lib/firebase.ts](../lib/firebase.ts). `signOutUser` (lines 1012–1039):
  - Calls Firebase `signOut(auth)`
  - Clears local data (`clearLocalData`, `profileCache.clear`, `clearAstroDataCache('all')`)
  - Sets `window.location.href = '/'` (full reload to home).

So logout **always** does a full page reload to `/`, not `router.push`.

---

## 7. Route transitions by user type

| User type | Typical path |
| --------- | ------------- |
| **Returning** (Google) | Sign-in or sign-up → `/mystical-profile` by default (`getReturningUserWithReportsDestination()`); allowlisted `?redirect=` or proxy-provided redirect ([lib/safeAuthRedirect.ts](../lib/safeAuthRedirect.ts)). If `userProfile.mysticalProfileGenerated`, profile-setup and similar send users to `RETURNING_USER_WITH_REPORTS_DESTINATION`. |
| **Returning** (with reports) | profile-setup → `router.replace` to [lib/authRouting.ts](../lib/authRouting.ts) `RETURNING_USER_WITH_REPORTS_DESTINATION` (currently `/mystical-profile`). |
| **New** (Google) | Sign-in or sign-up → `/profile` by default; may use `/profile-setup` for onboarding. |
| **New** (Email) | Sign-up → `/profile` after SignupFlow. |
| **Edited** (profile) | User edits on `/profile` → Save → remains on `/profile`; or "Generate mystical profile" success → `/mystical-profile` (same constant). |

**Canonical default for returning users with reports**: When profile is complete and reports exist (`userProfile.mysticalProfileGenerated === true`), the app redirects to `RETURNING_USER_WITH_REPORTS_DESTINATION` in [lib/authRouting.ts](../lib/authRouting.ts) (currently `/mystical-profile`). Profile-setup enforces this.

---

## 8. Where navigation is triggered

### 8.1 `router.push(...)` (client-side)

- **Auth**: [app/signin/page.tsx](../app/signin/page.tsx) → `getReturningUserWithReportsDestination()`, `/profile`, or allowlisted `?redirect=`. [app/signup/page.tsx](../app/signup/page.tsx) → same for Google; email → `/profile`. [AuthModal](../components/auth/AuthModal.tsx) → returning destination or `/profile`.
- **Guarded pages**: [profile-setup](../app/profile-setup/page.tsx) → `/signin` when `!user`; if `mysticalProfileGenerated` → canonical default; on complete → `/profile`. [profile](../app/profile/page.tsx) → `/signin` when `!user`; after generate success → `RETURNING_USER_WITH_REPORTS_DESTINATION` (`/mystical-profile`). [proxy.ts](../proxy.ts) treats `/mystical-profile` as protected (with `/profile`, etc.). There is no top-level [app/dashboard/page.tsx](../app/dashboard/page.tsx); admin overview is `/admin/dashboard`.
- **Marketing / global**: [hero-section](../components/hero-section.tsx) → `/signup`, `/signin`. [how-it-works](../components/how-it-works.tsx), [sticky-cta](../components/sticky-cta.tsx) → `/signup`.
- **Subscribe**: [useSubscribe](../hooks/useSubscribe.ts); when `!user` → `/signin?redirect=/subscribe` (sign-in validates `redirect` via [lib/safeAuthRedirect.ts](../lib/safeAuthRedirect.ts)).
- **Tools**: Many tool pages push `/profile-setup` or `/profile` or `/signin` when profile is missing or user wants to complete profile. Some use `router.push('/profile-setup')`, others `window.location.href = '/profile-setup'`.
- **Other**: [toolRouting](../lib/utils/toolRouting.ts) `router.push(route)`; [CompatibilityTab](../components/compatibility/CompatibilityTab.tsx) → `/subscribe?plan=...`.

### 8.2 Guards (useEffect redirects)

- **profile-setup**: `if (!user) router.push('/signin')`; if `userProfile?.mysticalProfileGenerated === true` → `router.replace` to canonical default.
- **profile**: `if (!authLoading && !user) router.push("/signin")`; and when `!user`, component returns `null` so the redirect can run.

### 8.3 Full reload (effect)

- **Logout**: [lib/firebase.ts](../lib/firebase.ts) `signOutUser` sets `window.location.href = '/'` after clearing auth and caches.

---

## 9. Notes

- **AuthModal**: Not used anywhere in the app; entry points use dedicated `/signin` and `/signup` pages.
- **Redirect param**: Sign-in (and sign-up Google paths) use `?redirect=` validated by [lib/safeAuthRedirect.ts](../lib/safeAuthRedirect.ts) so flows like `/signin?redirect=/subscribe` land on real routes; invalid paths fall back to `getReturningUserWithReportsDestination()` or `/profile`.

---

## 10. Files reference

| Purpose | File |
| ------- | ---- |
| Auth context | [hooks/use-auth.tsx](../hooks/use-auth.tsx) |
| Firebase auth + isReturningUser + signOutUser | [lib/firebase.ts](../lib/firebase.ts) (e.g. 657–661, 1012–1039) |
| Sign-in page | [app/signin/page.tsx](../app/signin/page.tsx) |
| Sign-up page | [app/signup/page.tsx](../app/signup/page.tsx) |
| Auth modal (unused) | [components/auth/AuthModal.tsx](../components/auth/AuthModal.tsx) |
| Profile setup | [app/profile-setup/page.tsx](../app/profile-setup/page.tsx) |
| Profile (view/edit) | [app/profile/page.tsx](../app/profile/page.tsx) |
| Post-login redirect allowlist | [lib/safeAuthRedirect.ts](../lib/safeAuthRedirect.ts) |
| Route protection proxy | [proxy.ts](../proxy.ts) |
| Canonical default (returning + reports) | [lib/authRouting.ts](../lib/authRouting.ts) |
| Logout from UI | [components/UserMenuDropdown.tsx](../components/UserMenuDropdown.tsx) |
