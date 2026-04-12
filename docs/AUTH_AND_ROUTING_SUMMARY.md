# Auth and Routing Flow Map (Summary)

The full, file-level map lives in **[AUTH_AND_ROUTING_FLOW.md](AUTH_AND_ROUTING_FLOW.md)**. Below is a compact reference for route transitions and where navigation is triggered.

---

## 1. Architecture (current)

- **Auth**: [hooks/use-auth.tsx](../hooks/use-auth.tsx) (Firebase `onAuthStateChanged` + `getUserProfile(uid)`). **Edge hint (Next.js 16)**: [proxy.ts](../proxy.ts) runs at the edge to redirect likely-unauthenticated visitors away from protected paths when the `fs_auth` cookie is missing (set client-side after sign-in). Do not add a separate `middleware.ts` — Next.js 16 allows only `proxy.ts`. This is **not** cryptographic proof of identity; APIs must still verify the Firebase ID token. Per-page `useEffect` + `router.push` remain the definitive client guards.
- **Returning vs new**: [lib/firebase.ts](../lib/firebase.ts) `isReturningUser(user)` = `lastSignInTime - creationTime > 60000` ms.

```mermaid
flowchart LR
  subgraph auth [Auth]
    Firebase[Firebase Auth]
    AuthProvider[use-auth]
    Firebase --> AuthProvider
  end
  subgraph routes [Routes]
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

## 2. Traced flows

| Flow | Trigger | Route transitions | Navigation source |
|------|--------|-------------------|-------------------|
| **Login** | Sign-in page Google | Success → `getSafeAuthRedirectAfterSignIn(redirect) ?? (returning ? getReturningUserWithReportsDestination() : "/profile")` | [app/signin/page.tsx](../app/signin/page.tsx) `handleGoogleSignIn`: `router.push(destination)` |
| **Login** | Sign-in page Email | Same as Google | [app/signin/page.tsx](../app/signin/page.tsx) `handleSubmit`: `router.push(destination)` |
| **Signup** | Sign-up page Google | Success → `redirectTo ?? (returning ? getReturningUserWithReportsDestination() : "/profile")` | [app/signup/page.tsx](../app/signup/page.tsx) `handleGoogleSignIn`: `router.push(...)` |
| **Signup** | Sign-up page Email | Success → `/profile` | [app/signup/page.tsx](../app/signup/page.tsx) after SignupFlow: `router.push("/profile")` |
| **Profile completion** | Profile-setup "Complete" | Save + optional AstroApp → `/profile` | [app/profile-setup/page.tsx](../app/profile-setup/page.tsx) `handleComplete`: `router.push('/profile')` |
| **Profile edit** | Profile "Save" | No route change | Stays on `/profile` |
| **Profile edit** | Profile "Generate mystical profile" OK | → `RETURNING_USER_WITH_REPORTS_DESTINATION` (currently `/mystical-profile` in [lib/authRouting.ts](../lib/authRouting.ts)) | [app/profile/page.tsx](../app/profile/page.tsx) `router.push(RETURNING_USER_WITH_REPORTS_DESTINATION)` on success |
| **Logout** | Profile or UserMenuDropdown "Sign out" | Full reload → `/` | [lib/firebase.ts](../lib/firebase.ts) `signOutUser`: `window.location.href = '/'` |

---

## 3. Route transitions by user type

| User type | Path |
|-----------|------|
| **Returning** (Google) | Sign-in or sign-up → `/mystical-profile` by default (`getReturningUserWithReportsDestination()`); optional safe `?redirect=` (see [lib/safeAuthRedirect.ts](../lib/safeAuthRedirect.ts)). If reports exist (`mysticalProfileGenerated`), profile-setup and similar flows redirect to `RETURNING_USER_WITH_REPORTS_DESTINATION` (currently `/mystical-profile`). |
| **New** (Google) | Sign-in or sign-up → `/profile` by default; user may complete details on `/profile` or `/profile-setup` per product flow. |
| **New** (Email) | Sign-up (SignupFlow) → `/profile`. |
| **Edited** | `/profile` → Save → stay on `/profile`; or Generate mystical profile success → `/mystical-profile` (same constant as above). |

---

## 4. Where navigation is triggered

- **router.push**: Sign-in page (Google/email + allowlisted `?redirect=` via [lib/safeAuthRedirect.ts](../lib/safeAuthRedirect.ts)), sign-up page, profile-setup (guard + on complete), profile (guard + after generate), hero/how-it-works/sticky-cta, useSubscribe, tool pages, toolRouting, CompatibilityTab. (There is no top-level `app/dashboard/page.tsx`; admin overview is `/admin/dashboard`.)
- **Guards (useEffect)**: [profile-setup](../app/profile-setup/page.tsx) `if (!user) router.push('/signin')`; if `mysticalProfileGenerated` → canonical default; [profile](../app/profile/page.tsx) `if (!authLoading && !user) router.push("/signin")` (+ return `null` when `!user`). [proxy.ts](../proxy.ts) sends unauthenticated visitors on protected prefixes to `/signin?redirect=<pathname>`.
- **Full reload**: [lib/firebase.ts](../lib/firebase.ts) `signOutUser`: `window.location.href = '/'` after Firebase signOut and clearing local/cache.

---

## 5. Relation to goal

For **deterministic auth → profile generation → cached reports → controlled API calls → clean deploy**:

- **Auth** is fixed per above (returning vs new, guards, redirect param).
- **Profile generation** is triggered from `/profile` (Generate mystical profile) and post–profile-setup (AstroApp); outcomes and caching live in profile/API layer.
- **Returning users with reports** are sent to `RETURNING_USER_WITH_REPORTS_DESTINATION` ([lib/authRouting.ts](../lib/authRouting.ts), currently `/mystical-profile`) from profile-setup and related guards when `userProfile.mysticalProfileGenerated === true`.
- **Cached reports / API** and **deploy pipeline** are outside this auth/routing map; the full doc is the single place to look for "who goes where after login/signup/profile/logout."
