# Production Audit Cleanup Report

**Date**: February 3, 2026  
**Scope**: Safe, non-destructive cleanup; all items moved to `_backup_deleted/` (no permanent deletes).

---

## 1. What Was Moved

### 1.1 `_tmp_*` files (32 files)

- **From**: Repo root  
- **To**: `_backup_deleted/_tmp_<name>` (e.g. `_backup_deleted/_tmp_13512_7345e0a7dddedf88cf8c0488c4df0539`)  
- **Reason**: Editor/artifact debris; 0 KB; no imports or build references. Safe to archive.

### 1.2 Root artifact files (typos and logs)

- **From**: Repo root  
- **To**: `_backup_deleted/root-artifacts/`  
- **Files**:  
  - `et --hard HEAD`  
  - `h origin main`  
  - `tash`  
  - `tatus`  
  - `tatus --porcelain`  
  - `tat -an ? findstr ?3000` (or equivalent name on disk)  
  - `firebase-debug.log`  
- **Reason**: Command-typo outputs or debug logs; not part of app or build.

### 1.3 Root-level markdown (sprawl)

- **From**: Repo root  
- **To**: `_backup_deleted/docs/root/`  
- **Files**:  
  - AUDIT_FINAL_REPORT.md, AUDIT_PROGRESS.md, AUDIT_SUMMARY.md  
  - COMMUNITY_GUIDELINES.md, FUTURESEER_QUALITY_STANDARDS.md  
  - HISTORY_PAGE_REFACTOR_SUMMARY.md  
  - ICON_DIRECTORY_STRUCTURE.md, ICON_DOWNLOAD_GUIDE.md, ICON_IMPLEMENTATION_SUMMARY.md  
  - LANDING_PAGE_AUDIT_REPORT.md, MISSING_ICONS_SOLUTION.md  
  - REFERRAL_CODE_FIX_SUMMARY.md, STEP_BY_STEP_ICON_DOWNLOAD.md  
  - TAROT_TOOL_IMPLEMENTATION_STATUS.md, TAROT_TOOL_REDESIGN_PLAN.md  
  - WESTERN_ASTROLOGY_AUDIT_REPORT.md  
- **Reason**: Not protected; not referenced from README; legacy audits and redundant icon guides.

### 1.4 docs/ legacy markdown

- **From**: `docs/`  
- **To**: `_backup_deleted/docs/legacy/`  
- **Files**: All `docs/*.md` except `MULTI_SYSTEM_PREDICTION.md` (28 files), including ADMIN.md, AUTHENTICATION_FIX_GUIDE.md, TOOL_INTEGRATION_GUIDE.md, VERCEL_DEPLOYMENT_GUIDE.md, etc.  
- **Reason**: Only `docs/MULTI_SYSTEM_PREDICTION.md` is linked from README; rest archived as legacy/guides.

### 1.5 Duplicate Firebase service key

- **From**: Repo root  
- **To**: `_backup_deleted/futureseer-7abcd5-firebase-adminsdk-fbsvc-75b6b3cfeb.json`  
- **Reason**: Canonical key is `firebaseadminscripts/serviceAccountKey.json` (used by scripts); root copy was duplicate.

---

## 2. Why Each Was Considered Unused / Safe to Move

| Category           | Rationale                                                                 |
|--------------------|---------------------------------------------------------------------------|
| `_tmp_*`           | Editor/artifact debris; no references in code or config.                |
| Root artifacts    | Typo/log files; not referenced by build or runtime.                       |
| Root MD sprawl     | Not in protected list; not linked from README or active docs.            |
| docs/ legacy       | Not linked from README; MULTI_SYSTEM_PREDICTION.md kept in place.         |
| Firebase key copy | Duplicate of firebaseadminscripts/serviceAccountKey.json; scripts use latter. |

---

## 3. Risk Areas

1. **Firebase key in backup**  
   - The file `_backup_deleted/futureseer-7abcd5-firebase-adminsdk-fbsvc-75b6b3cfeb.json` contains secrets.  
   - It is listed in `.gitignore` so it is **not committed** when `_backup_deleted/` is tracked.  
   - Do not remove that ignore rule; if you stop tracking `_backup_deleted/`, ensure this file is never committed elsewhere.

2. **Scripts not in package.json**  
   - The following scripts are **not** referenced by `package.json`; they were **not** moved (report-only):  
     - `scripts/fix-birthtime.js`  
     - `scripts/generate-og-image.js`  
     - `scripts/generate-starfield-8k.js`  
     - `scripts/resize-vedarasa-label.js`  
     - `scripts/run-with-baseline-env.js`  
     - `scripts/smoke-test.js`  
     - `scripts/test-seer.js`  
     - `scripts/verify-calculations-nov2025.js`  
   - Treat as optional/one-off; archive to `_backup_deleted/` only after explicit confirmation they are unused.

---

## 4. What Stayed in Place

- **Protected**: #FutureSeer Finale.md, .env.local, package.json, pnpm-lock.yaml, next.config.mjs, firebase.json, firestore.rules, firestore.indexes.json, vercel.json, tsconfig.json  
- **Actively referenced**: README.md, docs/MULTI_SYSTEM_PREDICTION.md, env-template.txt  
- **In use**: services/, utils/, hooks/, firebaseadminscripts/serviceAccountKey.json, scripts/setup-user-modes.js, jest.config.js, jest.setup.js, tests/auth.test.js  
- **Ignored (unchanged)**: .next/, node_modules/, .swc/

---

## 5. .gitignore Changes

- **Removed**: `/_backup_deleted/` (folder no longer ignored so backup moves are traceable).  
- **Added**: `_backup_deleted/futureseer-7abcd5-firebase-adminsdk-fbsvc-75b6b3cfeb.json` so the Firebase key in backup is never committed.

---

## 6. Final Check

- **Cleanup moves**: No source or config imports reference the moved files; protected files were not moved.  
- **Build**: `pnpm build` was run. The build currently fails due to a **pre-existing** error (unrelated to this cleanup):  
  - `Module not found: Can't resolve '@/lib/firebaseAdmin'` in `app/api/palmistry/comprehensive/route.ts`.  
- Fix that missing module separately; the cleanup did not introduce new broken imports.
