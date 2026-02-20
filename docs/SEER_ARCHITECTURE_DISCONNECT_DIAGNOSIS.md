# Seer architecture disconnect — diagnosis

This doc answers the three wiring questions and pinpoints where the disconnect occurs, based on your observed behavior (generic clarify for relocation, session reset on "(b) understanding recurring patterns?", timing window on gemstone answer).

---

## 1. Does `route.ts` call only `runMainSeer()`?

**No.** There is no `runMainSeer()` in the codebase.

The route is a **long procedural flow** that:

- Runs the **intent router** (`routeIntent`) and **topic anchor** (Navaratna lock, anchored follow-ups).
- Returns **early** in many places (clarification, Lenormand, Vastu, Human Design, etc.).
- Then loads profile and **universal data**, builds **`ComprehensiveSeerEngine`**, and runs it to get `comprehensiveResponse`.
- **In parallel it still calls** `seerChatbot.processQuery(seerRequest)` to get **`legacyResponse`**.
- The final response is a **merge**: verdict/support/answer from comprehensive when present, but **`timing_window`** and other fields fall back to **`legacyResponse`** when not purpose-without-timing.

So the execution path is **hybrid**: router + ComprehensiveSeerEngine + **legacy** `seerChatbot.processQuery`. The legacy path is still in the loop and affects the response (especially timing).

---

## 2. Is there any early return before the “orchestrator”?

**Yes.** The main one that explains **generic clarify for relocation** is:

- Right after the router (around **lines 282–329**), the route does:
  - `if (shouldAskClarification(routerResult) && routerResult.clarificationQuestion)`
  - Then it returns **immediately** with `routerResult.clarificationQuestion` as the answer (the generic “I'd be happy to help. Could you clarify…”).
- So **if the router returns `intent: 'general'` with low confidence**, the route never reaches profile load, engine, or topic anchor; it returns generic clarify and exits.

So the disconnect is: **the router is not classifying “Is relocating to Canada favorable…” as relocation**, so it falls through to `general` with low confidence → **early return with generic clarify**.

**Why relocation isn’t matching**

- In `lib/seerIntentRouter.ts` (around **lines 179–182**), relocation is triggered by:
  - `/\b(foreign|visa|migration|country|abroad|settlement|relocate|relocation)\b/i`
- The user query is: **“Is relocating to Canada favorable for me long-term?”**
  - **“relocating”** does not match `\brelocate\b` or `\brelocation\b` (different word).
  - **“Canada”** is a country name; the regex only has the word **“country”**, not country names.
- So the router never sees this as relocation → it ends up as **general** with low confidence → **early return, generic clarify**.

**Conclusion:** The disconnect for Q1 is in the **router pattern**: add **“relocating”** (and optionally “relocate” stem or country-name handling) so that this query is classified as **relocation**, not general.

---

## 3. Is `sessionState` stored and sent back from the client?

**No.** The client does **not** send `sessionState` or `conversationHistory` back.

- **`AskTheSeerChatInterface.tsx`** (around **lines 404–408**) sends only:
  - `userId`, `question`, `userProfile`
- **`/api/ask-the-seer/route.ts`** (around **lines 136–145**) when calling `/api/seer/query` sends:
  - `user_id`, `query`, `context: { userProfile, chartData, comprehensiveProfile, personal_context, session_id: session_${Date.now()} }`
  - So **no `context.sessionState`**, **no `context.conversationHistory`**.

So **session state only comes from server-side memory** (`memoryRef?.getSeerSessionState()`), which is loaded from **ConversationalMemory** (Firestore). The route uses `memoryRef?.getSeerSessionState() ?? context?.sessionState`; since the client never sends `context.sessionState`, every request depends on **Firestore persistence** for the same `user_id`.

**Possible second issue: Firestore in API route**

- **`ConversationalMemory`** uses `getFirebaseDB()` and **client Firestore API** (`doc`, `getDoc`, `setDoc` from `'firebase/firestore'`).
- On the server, `getFirebaseDB()` can return **Firebase Admin** Firestore (different package: `firebase-admin/firestore`).
- Using **client** `setDoc`/`getDoc` with an **Admin** Firestore instance may be incompatible; if so, **session state might not persist or load** in the API route, so every request would look stateless even with a real user.

So you have two layers:

1. **Client never sends session state** → domain lock depends 100% on server-side memory.
2. **Server-side memory** might not be persisting/loading correctly if client SDK and Admin DB are mixed in the same code path.

---

## Where the disconnects occur (summary)

| Symptom | Root cause | Location |
|--------|------------|----------|
| “Is relocating to Canada…” → generic clarify | Router doesn’t match “relocating” or “Canada”; returns general + low confidence → early clarification return | `seerIntentRouter.ts` relocation pattern; route early return after router |
| “Will it be permanent?” → generic clarify | Same: no prior session state in request; if Firestore session isn’t persisted/loaded, topic anchor never sees `activeIntent: 'relocation'` | UI not sending `sessionState`; possible Firestore persistence in API |
| “(b) understanding recurring patterns?” → generic clarify again | Reflective path set pending clarification, but next turn has no session state (or it’s lost) → router runs again from scratch → general → generic clarify | Same as above: session state not round-tripping |
| Gemstone answer shows “75% Confidence” + “20/11/2025 – 10/12/2025” | `timing_window` is taken from **legacyResponse** when not “purpose without timing”; remedy intent is not excluded, so legacy timing is shown | `route.ts` around 1422–1426: no “remedies without timing” branch; legacy path still supplies timing_window |

---

## Concrete fixes (recommended order)

### Fix 1: Relocation trigger in router (stops generic clarify for Q1)

- **File:** `lib/seerIntentRouter.ts`
- **Change:** In the relocation block (~line 180), extend the pattern so that:
  - **“relocating”** matches (e.g. add `relocating` to the list, or use a stem like `relocat` so “relocating”/“relocation”/“relocate” all match).
  - Optionally: match “favorable” in a relocation context, or allow specific country names (e.g. “Canada”) so “Is relocating to Canada favorable…” is clearly relocation.

### Fix 2: No timing window for remedy-only answers (stops timing on gemstone)

- **File:** `app/api/seer/query/route.ts`
- **Change:** Where `timingWindow` is set (~1422–1426), add the same idea as **purpose without timing**: for **remedies** intent when the question is not timing-related, force `timing_window` to `undefined` (e.g. `isRemedyWithoutTiming`), so legacy timing is not shown for “Which gemstone…” / “Which finger?”.

### Fix 3: Session state round-trip (enables domain lock for Q2, Q6, reflective follow-up)

- **Option A (recommended):** Have the **UI** send back **sessionState** and **conversationHistory**:
  - **`AskTheSeerChatInterface`**: Keep the last response’s `sessionState` and append user/seer messages to `conversationHistory`; send both in the next request body to `/api/ask-the-seer`.
  - **`/api/ask-the-seer/route.ts`**: Forward `context.sessionState` and `context.conversationHistory` from the request body into the `/api/seer/query` `context` so the route and topic anchor see the previous intent and history even if Firestore fails.
- **Option B:** Ensure **ConversationalMemory** in the API route uses a **single** Firestore API (either always Admin in route, or always client) and that **saveAllMemory()** is called after every path that sets session state, so server-side persistence is reliable. Then verify that `loadSeerSessionState()` actually loads the state written in the previous request.

### Fix 4: (Optional) Diagnostic log

- In **`app/api/seer/query/route.ts`**, right after the router runs (e.g. after line 280), log something like:
  - `intent`, `sessionStateForRouter?.activeIntent`, and whether you’re about to return clarification.
- That will confirm in production/staging that relocation is classified and that session state is present (or not) when you expect domain lock.

---

## Answers to your three questions (copy-paste)

1. **Does route.ts call only runMainSeer()?**  
   No. It uses a procedural flow with the intent router, ComprehensiveSeerEngine, and **legacy** `seerChatbot.processQuery`. There is no single `runMainSeer()` orchestrator.

2. **Is there any early return before orchestrator?**  
   Yes. The main one that causes your issue is: **immediate return with generic clarify** when `shouldAskClarification(routerResult)` is true (router returns general with low confidence). That happens **before** profile load and engine. Relocation fails because the router doesn’t match “relocating”/“Canada” and returns general.

3. **Is sessionState stored and sent back from client?**  
   No. The UI sends only `userId`, `question`, `userProfile`. The ask-the-seer API does not send `sessionState` or `conversationHistory` to seer/query. So domain lock depends entirely on server-side memory; if that persistence is broken (e.g. client vs Admin Firestore mix), every request will look stateless.

---

Once Fix 1 and Fix 2 are in, relocation and gemstone behavior should improve. Fix 3 is what makes “Will it be permanent?” and “(b) understanding recurring patterns?” (and “Which finger?”) stay in the right domain across turns.
