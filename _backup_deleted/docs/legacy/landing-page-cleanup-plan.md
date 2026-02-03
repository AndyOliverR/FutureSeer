# Landing Page Cleanup Plan
**Objective:** Fix code quality issues, remove dead code, optimize performance, and improve production readiness

## Overview

This plan addresses 5 major categories of issues identified in the landing page audit:
1. Delete dead code files
2. Remove unused imports
3. Clean up empty code blocks
4. Fix CSS preload warning
5. Make console logs conditional (development only)

---

## Phase 1: Delete Dead Code Files

### Files to Delete:
1. `app/tools/vedic/page-old.tsx` (4,159 lines)
2. `app/tools/western-astrology/page-old.tsx` (2,335 lines)
3. `app/tools/numerology/page-old.tsx` (size TBD)

### Impact:
- Reduces codebase by ~6,500+ lines
- Faster build times
- Cleaner codebase
- No functional impact (these are old backup files)

### Steps:
1. Verify files are not referenced anywhere
2. Delete each file
3. Verify build still works

---

## Phase 2: Remove Unused Imports

### Files to Fix:

#### `components/feature-blocks.tsx`
- **Issue:** `useRef` imported but never used (line 3)
- **Fix:** Remove `useRef` from import statement
- **Change:** `import { useEffect, useState, useRef } from "react"` → `import { useEffect, useState } from "react"`

#### `components/how-it-works.tsx`
- **Issue:** `Share2` imported but not used (line 2)
- **Fix:** Remove `Share2` from import statement
- **Change:** Remove `Share2` from lucide-react imports

### Impact:
- Slightly smaller bundle size
- Cleaner code
- No functional impact

---

## Phase 3: Clean Up Empty Code Blocks

### File: `lib/universalDataAggregator.ts`

**Issue:** File contains hundreds of empty lines (lines 1-300+ are mostly empty)

**Current State:**
- Lines 1-96: Empty lines and comments
- Lines 97-129: More empty lines
- Lines 130-169: Actual imports
- Lines 170-300+: More empty lines and placeholder comments

**Fix Strategy:**
1. Remove all empty lines between imports
2. Remove placeholder comment blocks that serve no purpose
3. Keep only functional code and meaningful comments
4. Consolidate imports at the top

**Expected Result:**
- Reduce file from ~22,000 lines to actual functional code
- Improve readability
- Faster file parsing

**Steps:**
1. Read the entire file to understand structure
2. Identify actual functional code vs. empty lines
3. Remove empty lines and consolidate
4. Verify file still works correctly

---

## Phase 4: Fix CSS Preload Warning

### Issue:
Browser warning: "The resource http://localhost:3000/_next/static/css/app/layout.css was preloaded using link preload but not used within a few seconds"

### Root Cause:
Next.js automatically preloads CSS, but the warning suggests the CSS isn't being used immediately or the preload isn't necessary.

### Potential Solutions:

#### Option 1: Next.js Configuration
- Check `next.config.js` for CSS optimization settings
- May need to adjust CSS handling

#### Option 2: Remove Unnecessary Preload
- If CSS is loaded normally, preload may be redundant
- Next.js handles this automatically, so manual intervention may not be needed

#### Option 3: Ensure CSS is Used
- Verify CSS is actually being applied
- Check for unused CSS rules

### Investigation Steps:
1. Check `next.config.js` for CSS-related settings
2. Verify CSS is being loaded correctly
3. Check if warning is a false positive (Next.js dev mode quirk)
4. If needed, adjust Next.js configuration

### Expected Fix:
- Either suppress the warning if it's harmless
- Or optimize CSS loading if there's a real issue

---

## Phase 5: Make Console Logs Conditional

### Issue:
675+ console.log/error/warn statements throughout codebase that should only run in development

### Strategy:
Create a utility function for conditional logging, then replace console statements

### Implementation:

#### Step 1: Create Logger Utility
**File:** `lib/logger.ts`
```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) console.log(...args);
  },
  error: (...args: any[]) => {
    if (isDevelopment) console.error(...args);
  },
  warn: (...args: any[]) => {
    if (isDevelopment) console.warn(...args);
  },
  info: (...args: any[]) => {
    if (isDevelopment) console.info(...args);
  },
};
```

#### Step 2: Replace Console Statements
**Priority Files (Landing Page Related):**
- `components/feature-blocks.tsx`
- `components/how-it-works.tsx`
- `components/hero-section.tsx`
- `app/page.tsx`
- `app/layout.tsx` (already has some commented out)

**Approach:**
- For landing page components: Replace with logger utility
- For API routes: Keep error logging but make info logs conditional
- For critical errors: Keep console.error (but can still make conditional)

#### Step 3: Files to Update
**High Priority (Landing Page):**
1. `components/feature-blocks.tsx`
2. `components/how-it-works.tsx`
3. `components/hero-section.tsx`
4. `app/page.tsx`

**Medium Priority (Related Components):**
5. `components/CompetitivePricingMessaging.tsx`
6. `components/FeedbackImprovement.tsx`
7. `components/AccreditationSection.tsx`
8. `components/faq-section.tsx`
9. `components/enhanced-footer.tsx`

**Note:** Other files (like `app/tools/vedic/page.tsx`) have many logs but are not landing page specific, so they can be handled separately.

---

## Implementation Order

### Priority 1 (Quick Wins):
1. ✅ Delete dead code files (3 files)
2. ✅ Remove unused imports (2 files)
3. ✅ Create logger utility

### Priority 2 (Medium Effort):
4. ✅ Replace console logs in landing page components (9 files)
5. ✅ Clean up `lib/universalDataAggregator.ts`

### Priority 3 (Investigation Needed):
6. ⚠️ Fix CSS preload warning (requires investigation)

---

## Files to Modify

### Delete:
- `app/tools/vedic/page-old.tsx`
- `app/tools/western-astrology/page-old.tsx`
- `app/tools/numerology/page-old.tsx`

### Modify:
- `components/feature-blocks.tsx` - Remove useRef import
- `components/how-it-works.tsx` - Remove Share2 import
- `lib/universalDataAggregator.ts` - Remove empty lines
- `lib/logger.ts` - Create new file
- `components/feature-blocks.tsx` - Replace console.log (if any)
- `components/how-it-works.tsx` - Replace console.log (if any)
- `components/hero-section.tsx` - Replace console.log (if any)
- `app/page.tsx` - Replace console.log (if any)
- `components/enhanced-footer.tsx` - Replace console.error with logger
- `next.config.js` or `app/layout.tsx` - Fix CSS preload (investigation needed)

---

## Testing Checklist

After each phase:
- [ ] Verify app builds successfully
- [ ] Verify landing page renders correctly
- [ ] Check browser console for errors
- [ ] Verify no functionality is broken
- [ ] Check bundle size (should decrease)

---

## Expected Outcomes

### Code Quality:
- ✅ No unused imports
- ✅ No dead code files
- ✅ Clean, readable code
- ✅ Conditional logging

### Performance:
- ✅ Smaller bundle size (~6,500 lines removed)
- ✅ Faster build times
- ✅ No console noise in production
- ✅ CSS loading optimized (if fixable)

### Maintainability:
- ✅ Cleaner codebase
- ✅ Easier to navigate
- ✅ Better developer experience

---

## Risk Assessment

### Low Risk:
- Deleting `-old.tsx` files (backup files, not used)
- Removing unused imports (no functional impact)
- Creating logger utility (additive change)

### Medium Risk:
- Cleaning up `universalDataAggregator.ts` (need to verify it's not used)
- Replacing console logs (need to ensure no critical logs are removed)

### Investigation Needed:
- CSS preload warning (may be harmless Next.js quirk)

---

## Notes

1. **Dead Code Files:** These are clearly backup files (`-old.tsx` suffix) and safe to delete
2. **Console Logs:** Some console.error statements may be intentional for production debugging - review case by case
3. **CSS Preload:** This warning may be a Next.js development mode quirk and may not need fixing
4. **Universal Data Aggregator:** File appears to have placeholder code - verify if it's actually used before major cleanup

---

## Success Criteria

- [ ] All dead code files deleted
- [ ] All unused imports removed
- [ ] Empty code blocks cleaned up
- [ ] Console logs conditional (development only)
- [ ] CSS preload warning resolved or documented as harmless
- [ ] Landing page still functions correctly
- [ ] No new errors introduced
- [ ] Bundle size reduced
