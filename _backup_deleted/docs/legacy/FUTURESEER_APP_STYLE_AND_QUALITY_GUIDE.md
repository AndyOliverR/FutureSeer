# FutureSeer App-Wide Style and Quality Guide

## Executive Summary

This comprehensive guide serves as the single source of truth for maintaining consistency, quality, and performance across all FutureSeer tool pages and components. Use this document to ensure new features align with established patterns and quality standards.

### How to Use This Guide

- **For New Features**: Reference relevant sections before implementation
- **For Code Reviews**: Use checklists to verify compliance
- **For Bug Fixes**: Check patterns and best practices
- **For Refactoring**: Use as a reference for standardization

### Quick Reference Links

- [Visual Design System](#visual-design-system)
- [Component Patterns](#component-patterns)
- [Performance Standards](#performance-standards)
- [Code Quality Standards](#code-quality-standards)
- [API & Data Patterns](#api--data-patterns)
- [Quick Reference Tables](#quick-reference-tables)
- [Best Practices Checklist](#best-practices-checklist)

---

## Visual Design System

### Background Standards

#### Starfield Background (Primary Standard)

**Class**: `starfield-ultra-sharp`

**Purpose**: Provides consistent starry space background matching the landing page across all tool pages.

**Usage**: Applied to main container div of all tool pages.

```tsx
<div className="starfield-ultra-sharp min-h-screen p-4 overflow-hidden">
  {/* Page content */}
</div>
```

**CSS Properties**:
- Background color: `#141932` (medium-dark navy blue)
- Background image: `var(--starfield-image)` (8K UHD starfield)
- Image rendering: Optimized for crisp, sharp stars on high-DPI displays
- Background attachment: `scroll` (better performance than `fixed`)
- Filter: Enhanced contrast, brightness, and saturation for vibrant appearance

**Important Notes**:
- **NEVER** use `background-attachment: fixed` (performance issue)
- **ALWAYS** use `starfield-ultra-sharp` for tool pages (not `starfield-background` or variants)
- Landing page uses special handling with `data-page="landing"` attribute

**Do's**:
```tsx
// ✅ Correct
<div className="starfield-ultra-sharp min-h-screen p-4">
```

**Don'ts**:
```tsx
// ❌ Wrong - inconsistent background
<div className="bg-slate-950 min-h-screen">

// ❌ Wrong - wrong class name
<div className="starfield-background min-h-screen">
```

---

### Typography Standards

#### Font Size Scale

| Element | Tailwind Class | Size (rem) | Size (px) | Usage |
|---------|---------------|------------|-----------|-------|
| Main Page Title | `text-5xl` | 3rem | 48px | H1 page titles |
| Section Heading | `text-3xl` | 1.875rem | 30px | H2 section titles |
| Subsection Heading | `text-2xl` | 1.5rem | 24px | H3 subsections |
| Card Title | `text-xl` | 1.25rem | 20px | H4 card headers |
| Body Text | `text-base` | 1rem | 16px | Default body text |
| Small Text | `text-sm` | 0.875rem | 14px | Secondary info, labels |
| Extra Small | `text-xs` | 0.75rem | 12px | Tab labels, fine print |

#### Font Weights

| Weight | Class | Usage |
|--------|-------|-------|
| Bold | `font-bold` | Main headings (h1, h2) |
| Semibold | `font-semibold` | Subheadings, emphasized text |
| Medium | `font-medium` | Buttons, important labels |
| Regular | Default (400) | Body text, paragraphs |

#### Font Colors (Critical for Readability)

**⚠️ CRITICAL**: All text on dark backgrounds must use light colors for readability.

| Text Type | Tailwind Classes | Usage |
|-----------|-----------------|-------|
| Primary Headings | `gold-glow` | Main page and section titles with glow effect |
| Main Text | `text-white` or `text-slate-200` | Primary body content |
| Secondary Text | `text-slate-300` | Labels, descriptions, metadata |
| Muted Text | `text-slate-400` | Fine print, timestamps, subtle info |
| Accent Text | `text-amber-300`, `text-amber-400`, `text-yellow-300` | Highlighted or important text |
| Status Colors | `text-green-400`, `text-red-400`, `text-blue-400` | Success, error, info messages |

**Gold Glow Effect**:

```tsx
<h1 className="text-5xl font-bold gold-glow mb-4">Page Title</h1>
<h2 className="text-3xl font-bold gold-glow mb-4">Section Title</h2>
```

**Do's**:
```tsx
// ✅ Correct - light text on dark background
<p className="text-slate-200">Readable text</p>
<h3 className="text-xl font-semibold text-white">Card Title</h3>
```

**Don'ts**:
```tsx
// ❌ Wrong - dark text on dark background (unreadable)
<p className="text-slate-900">Unreadable text</p>
<p className="text-black">Completely invisible</p>
<p className="text-soft">Too dark, barely visible</p>
```

**Responsive Typography**:
- Mobile uses `clamp()` for fluid scaling (defined in `globals.css`)
- Minimum touch target: 44x44px (WCAG 2.1 AA compliance)

---

### Color Palette (Gamification Style)

#### Primary Colors

**Amber/Gold** (Primary accent throughout app):
- `amber-500` - Primary amber (#f59e0b)
- `amber-400` - Light amber (#fbbf24)
- `amber-300` - Lighter amber (#fcd34d)
- `yellow-400` - Bright yellow (#facc15)
- `yellow-300` - Light yellow (#fde047)

**Usage**:
- Primary buttons: `bg-amber-500 hover:bg-amber-600`
- Accent borders: `border-amber-400/30`
- Text accents: `text-amber-300`, `text-amber-400`

#### Status Colors

| Status | Tailwind Classes | Usage |
|--------|-----------------|-------|
| Success | `green-400`, `emerald-400` | Positive actions, confirmations |
| Error | `red-400`, `red-500` | Errors, destructive actions |
| Warning | `yellow-400` | Warnings, cautions |
| Info | `blue-400`, `cyan-400` | Informational messages |

#### Pastel Accents (for Cards)

**Purpose**: Provide subtle, gamified color coding for different content types.

**Available Pastels**:
- Yellow: `border-yellow-400/20`, `hover:border-yellow-400/30`
- Blue: `border-blue-400/20`, `hover:border-blue-400/30`
- Purple: `border-purple-400/20`, `hover:border-purple-400/30`
- Pink: `border-pink-400/20`, `hover:border-pink-400/30`
- Green: `border-green-400/20`, `hover:border-green-400/30`

**Opacity Guidelines**:
- Base border: `/20` (20% opacity)
- Hover state: `/30` (30% opacity)
- Background overlay: `/10` or `/20` (10-20% opacity)

#### Glass Card Colors

**Standard Glass Card**:
- Background: `glass-card` utility class (defined in CSS)
- Border: `border-white/10` (10% opacity white)
- Hover: `hover:border-amber-400/30` or pastel variant

**Background Color Variable**:
- Main background: `#141932` (medium-dark navy blue)
- Glass panel: `rgba(15, 23, 42, 0.65)` (defined in CSS)

---

### Spacing System

#### Consistent Spacing Scale

| Size | Tailwind Class | Value | Usage |
|------|---------------|-------|-------|
| XS | `p-1`, `m-1` | 0.25rem (4px) | Tight spacing |
| SM | `p-2`, `m-2` | 0.5rem (8px) | Small gaps |
| MD | `p-4`, `m-4` | 1rem (16px) | Page padding, medium gaps |
| LG | `p-6`, `m-6` | 1.5rem (24px) | Card padding, section spacing |
| XL | `p-8`, `m-8` | 2rem (32px) | Large card padding |
| 2XL | `p-12`, `m-12` | 3rem (48px) | Extra large sections |

#### Common Spacing Patterns

**Page Container**:
```tsx
<div className="starfield-ultra-sharp min-h-screen p-4 overflow-hidden">
```

**Section Spacing**:
```tsx
<div className="space-y-6"> {/* Vertical spacing between sections */}
```

**Card Padding**:
```tsx
<CardContent className="p-6"> {/* Standard card padding */}
<CardContent className="p-8"> {/* Large card padding */}
```

**Section Margins**:
```tsx
<h2 className="text-3xl font-bold gold-glow mb-4"> {/* Small margin */}
<div className="mb-8"> {/* Large margin for section separation */}
```

---

### Border Radius Standards

| Element | Tailwind Class | Value | Usage |
|---------|---------------|-------|-------|
| Cards | `rounded-2xl` | 1rem (16px) | Standard card corners |
| Large Cards | `rounded-3xl` | 1.5rem (24px) | Large cards, tab containers |
| Buttons | `rounded-xl` | 0.75rem (12px) | Button corners |
| Tab Triggers | `rounded-xl` | 0.75rem (12px) | Individual tab buttons |
| Small Elements | `rounded-lg` | 0.5rem (8px) | Badges, small cards |

**Examples**:
```tsx
<Card className="glass-card border-white/10 rounded-2xl">
<Button className="rounded-xl">
<TabsList className="glass-card border-white/10 rounded-3xl p-1">
```

---

### Shadow and Glow Effects

#### Card Glow
```css
.card-glow {
  transition: all 0.3s ease;
  border-color: rgba(148, 163, 184, 0.3);
}

.card-glow:hover {
  border-color: rgba(251, 191, 36, 0.4);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(251, 191, 36, 0.1),
    0 0 20px rgba(251, 191, 36, 0.1);
  transform: translateY(-2px);
}
```

#### Gold Glow Text
```css
.gold-glow {
  color: #fbbf24;
  text-shadow: 
    0 0 10px rgba(251, 191, 36, 0.5),
    0 0 20px rgba(251, 191, 36, 0.3),
    0 0 30px rgba(251, 191, 36, 0.2);
}
```

**Usage**:
- Apply `gold-glow` class to main headings
- Apply `card-glow` class to interactive cards
- Use subtle hover effects with `transition-all duration-300`

---

## Component Patterns

### Glass Card Pattern

**Standard Glass Card**:
```tsx
<Card className="glass-card border-white/10 rounded-2xl text-white">
  <CardHeader className="text-white">
    <CardTitle className="text-xl font-semibold text-white">Title</CardTitle>
  </CardHeader>
  <CardContent className="text-white">
    <p className="text-slate-200">Content here</p>
  </CardContent>
</Card>
```

**Pastel Accent Card** (Gamification style):
```tsx
<Card className="glass-card border-yellow-400/20 hover:border-yellow-400/30 transition-all duration-300 rounded-3xl text-white">
  <CardContent className="p-6 text-center text-white">
    {/* Content */}
  </CardContent>
</Card>
```

**Key Points**:
- **ALWAYS** include `text-white` on Card component
- **ALWAYS** include `text-white` on CardHeader and CardContent
- Use pastel borders for visual variety (`/20` opacity base, `/30` on hover)
- Add `transition-all duration-300` for smooth hover effects

---

### Tab Navigation Pattern

**Standard Tab Container**:
```tsx
<Tabs defaultValue="introduction" className="w-full">
  <TabsList className="grid w-full grid-cols-6 glass-card border-white/10 rounded-3xl p-1">
    <TabsTrigger 
      value="introduction"
      className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300 rounded-xl px-3 py-2 text-xs text-slate-200"
    >
      Introduction
    </TabsTrigger>
    {/* More tabs... */}
  </TabsList>
  
  <TabsContent value="introduction" className="space-y-6 mt-6">
    {/* Tab content */}
  </TabsContent>
</Tabs>
```

**Tab Trigger Classes**:
- Base: `text-slate-200` (inactive state)
- Active: `data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300`
- Size: `text-xs` for labels, `px-3 py-2` for padding
- Radius: `rounded-xl`

**Tab Grid Sizing**:
- Adjust `grid-cols-{number}` based on tab count
- Use responsive grid if needed: `grid-cols-2 md:grid-cols-4 lg:grid-cols-6`

---

### Button Styles

#### Primary Button (Standard)
```tsx
<Button className="bg-amber-500 hover:bg-amber-600 text-white">
  Click Me
</Button>
```

#### Gradient Button (Common pattern)
```tsx
<Button className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white">
  Generate Analysis
</Button>
```

#### Glass Button (Alternative)
```tsx
<Button variant="glass">
  Glass Button
</Button>
```

#### Button with Loading State
```tsx
<Button
  onClick={handleAction}
  disabled={isLoading}
  className="bg-amber-500 hover:bg-amber-600 text-white"
>
  {isLoading ? (
    <>
      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      Loading...
    </>
  ) : (
    <>
      <Icon className="w-4 h-4 mr-2" />
      Action
    </>
  )}
</Button>
```

**Button Guidelines**:
- Primary actions: Amber/gold gradient or solid amber
- Secondary actions: Outline variant or ghost
- Loading states: Always show spinner with descriptive text
- Disabled states: Use `disabled:opacity-50 disabled:cursor-not-allowed`
- Minimum size: 44x44px for accessibility

---

### Loading States

#### Standard Loading Spinner
```tsx
{isLoading && (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
    <p className="ml-3 text-slate-200">Loading...</p>
  </div>
)}
```

#### Loading Card
```tsx
{isLoading && (
  <Card className="glass-card border-white/10 rounded-2xl text-white">
    <CardContent className="p-12 text-center">
      <Loader2 className="w-12 h-12 animate-spin text-amber-400 mx-auto mb-4" />
      <p className="text-slate-200">Loading your analysis...</p>
    </CardContent>
  </Card>
)}
```

**Guidelines**:
- Always show loading indicator during async operations
- Use descriptive text ("Loading...", "Generating report...")
- Use amber color for spinners (`text-amber-400`)
- Provide visual feedback immediately

---

### Error States

#### Standard Error Display
```tsx
{error && (
  <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
    <AlertCircle className="w-5 h-5 text-red-400 inline mr-2" />
    <p className="text-red-300 inline">{error}</p>
  </div>
)}
```

#### Error Alert Component
```tsx
{error && (
  <Alert variant="destructive" className="bg-red-500/10 border-red-500/50">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription className="text-red-300">{error}</AlertDescription>
  </Alert>
)}
```

**Guidelines**:
- Use red color scheme (`red-400`, `red-500`) for errors
- Provide clear, user-friendly error messages
- Include retry options when appropriate
- Use appropriate opacity backgrounds (`/10`, `/20`)

---

### Empty States

#### Standard Empty State
```tsx
{!data && !isLoading && (
  <Card className="glass-card border-white/10 rounded-2xl text-white">
    <CardContent className="p-12 text-center">
      <Info className="w-12 h-12 text-slate-300 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">No Data Available</h3>
      <p className="text-slate-200 mb-4">Please complete your profile to view this information.</p>
      <Button onClick={handleAction} className="bg-amber-500 hover:bg-amber-600 text-white">
        Get Started
      </Button>
    </CardContent>
  </Card>
)}
```

**Guidelines**:
- Show helpful message explaining why state is empty
- Provide actionable next steps
- Use appropriate icons for context
- Maintain glass card styling

---

### Section Headers

**Standard Pattern**:
```tsx
<div className="mb-8">
  <h2 className="text-3xl font-bold gold-glow mb-4">🌟 Section Title</h2>
  <p className="text-slate-200 leading-relaxed">
    Section description or subtitle
  </p>
</div>
```

**Variations**:
- With icon: Add emoji or icon before title
- Without description: Remove paragraph if not needed
- Centered: Add `text-center` to container

---

## Performance Standards

### Caching Strategies

#### Firebase Caching (API Routes)

**Pattern**:
```typescript
// Check cache first
const cacheKey = `reports/${userId}/${reportType}`
const cached = await getFirestoreDoc(cacheKey)

if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
  return cached.data
}

// Generate new data
const newData = await generateData()

// Store in cache
await setFirestoreDoc(cacheKey, {
  data: newData,
  timestamp: Date.now()
})

return newData
```

**Cache TTL Guidelines**:
- Reports: 24 hours (86400000 ms)
- User profiles: Until profile updated
- Static data: Can be longer (7-30 days)

**Key Points**:
- Always check cache before expensive operations
- Include timestamp in cached data
- Reset cache when source data changes (user profile, etc.)
- Use helper functions from `lib/firebase.ts` for Firestore operations

#### In-Memory Caching

**Pattern**:
```typescript
const cache = new Map<string, { data: any, timestamp: number }>()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

function getCached(key: string) {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  return null
}

function setCached(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() })
}
```

**Usage Guidelines**:
- Use for frequently accessed computed values
- Clear cache on relevant data updates
- Consider memory limits for large datasets

#### localStorage Caching (Client-Side)

**Pattern**:
```typescript
function getCachedData(key: string) {
  try {
    const cached = localStorage.getItem(key)
    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp < CACHE_TTL) {
        return data
      }
    }
  } catch (error) {
    console.warn('Cache read error:', error)
  }
  return null
}

function setCachedData(key: string, data: any) {
  try {
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }))
  } catch (error) {
    console.warn('Cache write error:', error)
  }
}
```

**Guidelines**:
- Use for user-specific client-side data
- Handle errors gracefully (quota exceeded, etc.)
- Clear on logout or profile changes

---

### Memoization Guidelines

#### When to Use `useMemo`

**Use for**:
- Expensive calculations (array filtering, mapping, sorting)
- Derived values from props/state
- Preventing unnecessary re-computations
- Stabilizing object/array references for `useEffect` dependencies

**Example**:
```tsx
const expensiveCalculation = useMemo(() => {
  return largeArray
    .filter(item => item.category === category)
    .map(item => transformItem(item))
    .sort((a, b) => a.order - b.order)
}, [largeArray, category])

// Stabilize array for useEffect dependency
const planets = useMemo(() => {
  return chartData?.planets || []
}, [chartData?.planets])
```

#### When to Use `useCallback`

**Use for**:
- Functions passed to child components as props
- Event handlers in dependencies of `useEffect`
- Preventing unnecessary child re-renders

**Example**:
```tsx
const handleClick = useCallback(() => {
  // Handler logic
}, [dependency1, dependency2])

useEffect(() => {
  window.addEventListener('click', handleClick)
  return () => window.removeEventListener('click', handleClick)
}, [handleClick])
```

**Don't Over-Memoize**:
- Simple calculations (add, subtract, string concat)
- Primitive values
- Functions with no dependencies
- When performance gain is negligible

---

### API Call Optimization

#### State Lifting Pattern

**Problem**: Components re-fetching data on every mount/remount.

**Solution**: Lift state to parent component and pass as props.

```tsx
// Parent component
const [report, setReport] = useState(null)
const [isLoading, setIsLoading] = useState(false)

useEffect(() => {
  if (!report && !isLoading) {
    fetchReport().then(setReport)
  }
}, [report, isLoading])

// Child component receives cached data
<ChildComponent cachedReport={report} isLoadingReport={isLoading} />
```

**Guidelines**:
- Fetch data once at parent level
- Pass cached data as props to children
- Reset cache when source data changes
- Check for existing data before fetching

#### Debouncing and Throttling

**For user input**:
```typescript
import { debounce } from 'lodash'

const debouncedSearch = useMemo(
  () => debounce((query: string) => {
    performSearch(query)
  }, 300),
  []
)
```

**Guidelines**:
- Debounce search inputs (300-500ms)
- Throttle scroll events (100-200ms)
- Clean up timers on unmount

---

### Console Logging Standards

#### Development vs Production

**Pattern**:
```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('Debug information')
  console.warn('Warning message')
}

// For errors that should always log
console.error('Critical error:', error)
```

**Guidelines**:
- Guard non-critical logs with `NODE_ENV === 'development'`
- Always log errors (use `console.error`)
- Remove or guard verbose debugging logs
- Use descriptive log messages with context

**Do's**:
```typescript
// ✅ Correct - guarded debug log
if (process.env.NODE_ENV === 'development') {
  console.log('Cache hit for user:', userId)
}

// ✅ Correct - error always logged
console.error('Failed to fetch data:', error)
```

**Don'ts**:
```typescript
// ❌ Wrong - spam in production
console.log('Rendering component')
console.log('State updated:', state)

// ❌ Wrong - using console.log for errors
console.log('Error:', error) // Should use console.error
```

---

### Code Splitting and Lazy Loading

**Route-based code splitting** (automatic in Next.js):
- Pages are automatically code-split
- Consider additional splitting for large components

**Component lazy loading**:
```tsx
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />,
  ssr: false // If component doesn't need SSR
})
```

**Guidelines**:
- Use dynamic imports for large, infrequently used components
- Provide loading states for lazy-loaded components
- Consider SSR requirements before disabling

---

### Bundle Size Management

**Guidelines**:
- Monitor bundle size with `npm run build`
- Use tree-shaking (import only what you need)
- Avoid importing entire libraries when only one function is needed
- Consider alternatives for heavy dependencies

**Example**:
```typescript
// ❌ Wrong - imports entire library
import _ from 'lodash'
const result = _.debounce(fn, 300)

// ✅ Correct - imports only needed function
import debounce from 'lodash/debounce'
const result = debounce(fn, 300)
```

---

## Code Quality Standards

### TypeScript Usage

#### Strict Typing

**Always define types**:
```typescript
interface UserProfile {
  birthDate: string
  birthTime?: string
  birthPlace: string
  displayName: string
}

function processProfile(profile: UserProfile): ProcessedProfile {
  // Implementation
}
```

**Use TypeScript utilities**:
```typescript
type PartialProfile = Partial<UserProfile>
type ProfileKeys = keyof UserProfile
type OptionalProfile = Pick<UserProfile, 'birthDate' | 'displayName'>
```

**Guidelines**:
- Avoid `any` type (use `unknown` if type is truly unknown)
- Use interfaces for object shapes
- Use type aliases for unions and intersections
- Leverage TypeScript's type inference when appropriate

---

### Error Handling Patterns

#### API Route Error Handling

```typescript
try {
  const result = await performOperation()
  return NextResponse.json({ success: true, data: result })
} catch (error: any) {
  console.error('Operation failed:', error)
  return NextResponse.json(
    { success: false, error: error.message || 'Operation failed' },
    { status: 500 }
  )
}
```

#### Component Error Handling

```tsx
try {
  const data = await fetchData()
  setData(data)
} catch (error: any) {
  console.error('Failed to fetch data:', error)
  setError(error.message || 'Failed to load data. Please try again.')
}
```

#### User-Friendly Error Messages

**Guidelines**:
- Never expose internal errors to users
- Provide actionable error messages
- Include retry options when appropriate
- Log technical details server-side only

**Examples**:
```typescript
// ❌ Wrong - technical error exposed
throw new Error('ECONNREFUSED: Cannot connect to database')

// ✅ Correct - user-friendly message
throw new Error('Unable to connect to server. Please check your connection and try again.')
```

---

### Code Organization

#### File Structure

```
app/
  tools/
    tool-name/
      page.tsx          # Main page component
components/
  tool-name/
    ComponentName.tsx   # Tool-specific components
hooks/
  use-tool-name.tsx     # Tool-specific hooks
lib/
  toolNameUtils.ts      # Tool-specific utilities
```

#### Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase starting with `use` (`useAuth.tsx`)
- **Utilities**: camelCase (`calculateChart.ts`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_CACHE_AGE`)
- **Types/Interfaces**: PascalCase (`UserProfile`, `ChartData`)

#### Component Structure Template

```tsx
"use client"

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'

// Types
interface ComponentProps {
  userId?: string
  // ... other props
}

export default function ComponentName({ userId }: ComponentProps) {
  // 1. Hooks
  const { user, userProfile } = useAuth()
  
  // 2. State
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 3. Memoized values
  const processedData = useMemo(() => {
    // Expensive computation
  }, [dependencies])
  
  // 4. Effects
  useEffect(() => {
    // Side effects
  }, [dependencies])
  
  // 5. Event handlers
  const handleAction = () => {
    // Handler logic
  }
  
  // 6. Early returns
  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorDisplay error={error} />
  if (!user) return <SignInPrompt />
  
  // 7. Render
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Component content */}
    </motion.div>
  )
}
```

---

### Hook Patterns

#### Custom Data Fetching Hook

```tsx
export function useToolData(userId: string | undefined, toolName: string) {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
      return
    }
    
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)
        const result = await fetchToolData(userId, toolName)
        setData(result)
      } catch (err: any) {
        setError(err.message || 'Failed to load data')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [userId, toolName])
  
  const refetch = () => {
    // Trigger refetch
  }
  
  return { data, isLoading, error, refetch }
}
```

**Guidelines**:
- Return consistent interface: `{ data, isLoading, error, refetch? }`
- Handle loading and error states
- Clean up on unmount
- Provide refetch capability when needed

---

## Aesthetics & Consistency

### Gamification Vibe

**Key Elements**:
- Pastel colors with opacity (`/20`, `/30`)
- Glass morphism cards (`glass-card`)
- Gold glow effects (`gold-glow`)
- Smooth transitions (`transition-all duration-300`)
- Subtle hover effects

**Visual Style**:
- Modern, clean, mystical aesthetic
- Playful but professional
- Consistent spacing and alignment
- Clear visual hierarchy

---

### Animation Guidelines

#### Framer Motion Patterns

**Page/Component Entry**:
```tsx
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
```

**Staggered Children**:
```tsx
<motion.div
  variants={{
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }}
>
```

**Guidelines**:
- Use subtle animations (0.3-0.6s duration)
- Avoid excessive motion (accessibility)
- Use for page transitions and list items
- Provide `reduce-motion` support when possible

---

### Responsive Design Patterns

#### Mobile-First Approach

```tsx
// Mobile-first classes
<div className="
  text-sm           // Mobile base size
  md:text-base      // Tablet and up
  lg:text-lg        // Desktop
">
```

#### Breakpoints

| Breakpoint | Tailwind Class | Min Width |
|------------|---------------|-----------|
| sm | `sm:` | 640px |
| md | `md:` | 768px |
| lg | `lg:` | 1024px |
| xl | `xl:` | 1280px |
| 2xl | `2xl:` | 1536px |

**Common Patterns**:
```tsx
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Responsive text
<h1 className="text-3xl md:text-4xl lg:text-5xl">

// Responsive padding
<div className="p-4 md:p-6 lg:p-8">
```

---

### Accessibility Standards

#### WCAG 2.1 AA Compliance

**Color Contrast**:
- Text: Minimum 4.5:1 contrast ratio
- Large text (18px+): Minimum 3:1 contrast ratio
- Use tools to verify: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

**Keyboard Navigation**:
- All interactive elements must be keyboard accessible
- Visible focus indicators
- Logical tab order

**Screen Readers**:
- Use semantic HTML (`<button>`, `<nav>`, `<main>`)
- Provide alt text for images
- Use ARIA labels when needed
- Test with screen readers

**Touch Targets**:
- Minimum 44x44px for touch targets
- Adequate spacing between interactive elements

**Guidelines**:
- Test keyboard navigation
- Test with screen readers
- Verify color contrast ratios
- Ensure all content is accessible

---

## API & Data Patterns

### Firebase Integration

#### Admin SDK vs Client SDK

**Server-Side (API Routes)**:
```typescript
import { getFirebaseDB, getFirestoreDoc, setFirestoreDoc } from '@/lib/firebase'

// Use helper functions that handle SDK differences
const db = getFirebaseDB()
const data = await getFirestoreDoc(`collection/${docId}`)
await setFirestoreDoc(`collection/${docId}`, data)
```

**Client-Side (Components)**:
```typescript
import { getFirebaseDB } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const db = getFirebaseDB()
const docRef = doc(db, 'collection', docId)
const docSnap = await getDoc(docRef)
```

**Key Points**:
- **NEVER** use client SDK functions (`doc`, `getDoc`, `setDoc`) with Admin SDK instance
- Use helper functions from `lib/firebase.ts` in API routes
- Helper functions automatically detect SDK type and use appropriate methods

---

### API Route Structure

**Standard Pattern**:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getFirestoreDoc, setFirestoreDoc } from '@/lib/firebase'

export async function POST(request: NextRequest) {
  try {
    // 1. Validate request
    const body = await request.json()
    const { userId, ...otherParams } = body
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }
    
    // 2. Check cache
    const cacheKey = `reports/${userId}/${reportType}`
    const cached = await getFirestoreDoc(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({ data: cached.data })
    }
    
    // 3. Generate data
    const data = await generateData(body)
    
    // 4. Cache result
    await setFirestoreDoc(cacheKey, {
      data,
      timestamp: Date.now()
    })
    
    // 5. Return response
    return NextResponse.json({ data })
    
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**Response Format**:
```typescript
// Success
{ data: {...} }

// Error
{ error: "Error message" }

// With metadata
{
  data: {...},
  timestamp: number,
  cached: boolean
}
```

---

### Error Handling in API Routes

**Pattern**:
```typescript
try {
  // Operation
} catch (error: any) {
  // Log error (always)
  console.error('Operation failed:', error)
  
  // Guard cache errors in development only
  if (process.env.NODE_ENV === 'development') {
    console.warn('Cache error details:', error)
  }
  
  // Return user-friendly error
  return NextResponse.json(
    { error: 'Failed to process request. Please try again.' },
    { status: 500 }
  )
}
```

**Guidelines**:
- Always log errors with `console.error`
- Guard verbose logs with `NODE_ENV === 'development'`
- Return generic user-facing error messages
- Include appropriate HTTP status codes

---

### Caching TTL Guidelines

| Data Type | TTL | Reason |
|-----------|-----|--------|
| User reports | 24 hours | Balance freshness and performance |
| User profiles | Until updated | Data changes infrequently |
| Static reference data | 7-30 days | Rarely changes |
| Transit data | 1 hour | Changes daily |
| Chart calculations | 24 hours | Based on fixed birth data |

**Best Practices**:
- Reset cache when source data changes (user profile update)
- Use shorter TTL for time-sensitive data
- Use longer TTL for static or expensive-to-compute data
- Document TTL decisions in code comments

---

## Quick Reference Tables

### Typography Cheat Sheet

| Use Case | Classes |
|----------|---------|
| Page Title | `text-5xl font-bold gold-glow` |
| Section Title | `text-3xl font-bold gold-glow` |
| Card Title | `text-xl font-semibold text-white` |
| Body Text | `text-base text-slate-200` |
| Label | `text-sm text-slate-300` |
| Fine Print | `text-xs text-slate-400` |

### Color Palette Quick Reference

| Purpose | Classes |
|---------|---------|
| Primary Button | `bg-amber-500 hover:bg-amber-600 text-white` |
| Gradient Button | `bg-gradient-to-r from-amber-600 to-yellow-600` |
| Glass Card | `glass-card border-white/10` |
| Pastel Border | `border-{color}-400/20 hover:border-{color}-400/30` |
| Error | `text-red-400 bg-red-500/10 border-red-500/50` |
| Success | `text-green-400 bg-green-500/10 border-green-500/50` |

### Component Code Templates

#### Standard Tool Page Structure
```tsx
"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function ToolPage() {
  const { user, userProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('introduction')
  
  const hasCompleteDetails = userProfile?.birthDate && userProfile?.birthPlace
  
  if (!user) {
    return <SignInPrompt />
  }
  
  return (
    <div className="starfield-ultra-sharp min-h-screen p-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold gold-glow mb-4">Tool Name</h1>
          <p className="text-slate-200 leading-relaxed text-lg">Description</p>
        </motion.div>
        
        {/* Tabs */}
        <Tabs value={activeTab} className="w-full">
          <TabsList className="grid w-full grid-cols-{N} glass-card border-white/10 rounded-3xl p-1">
            {/* Tab triggers */}
          </TabsList>
          
          {/* Tab content */}
        </Tabs>
      </div>
    </div>
  )
}
```

---

## Best Practices Checklist

### Pre-Commit Checklist

- [ ] All text uses light colors (`text-white`, `text-slate-200`, etc.)
- [ ] No dark text on dark backgrounds
- [ ] Background uses `starfield-ultra-sharp` class
- [ ] Glass cards include `text-white` on Card, CardHeader, CardContent
- [ ] Loading states implemented for async operations
- [ ] Error handling implemented with user-friendly messages
- [ ] Console logs guarded with `NODE_ENV === 'development'` (except errors)
- [ ] TypeScript types defined (no `any` types)
- [ ] Memoization used for expensive calculations
- [ ] Cache checks implemented before expensive operations
- [ ] Mobile responsive (test on small screens)
- [ ] Accessibility: keyboard navigation works, contrast ratios met

### Code Review Guidelines

**Visual Consistency**:
- [ ] Matches gamification color palette
- [ ] Consistent spacing and padding
- [ ] Glass card styling applied correctly
- [ ] Typography scale followed
- [ ] Hover states present on interactive elements

**Performance**:
- [ ] Memoization used appropriately
- [ ] Cache implemented for expensive operations
- [ ] No unnecessary re-renders
- [ ] Bundle size impact considered
- [ ] API calls optimized (no redundant fetches)

**Code Quality**:
- [ ] TypeScript types complete
- [ ] Error handling comprehensive
- [ ] Code organized logically
- [ ] Comments added for complex logic
- [ ] No console.log spam in production

### Performance Checklist

- [ ] Expensive calculations memoized
- [ ] Cache implemented for API responses
- [ ] State lifted to prevent redundant fetches
- [ ] Console logs guarded for production
- [ ] Images optimized
- [ ] Lazy loading used for heavy components
- [ ] Bundle size impact considered

### Aesthetics Checklist

- [ ] Consistent starfield background
- [ ] All text readable (light colors)
- [ ] Glass cards styled correctly
- [ ] Pastel accents applied consistently
- [ ] Smooth transitions on hover
- [ ] Gold glow on main headings
- [ ] Spacing consistent throughout
- [ ] Mobile responsive design

---

## Maintenance Notes

### When to Update This Guide

- New component patterns emerge
- Color palette changes
- Performance patterns evolve
- Accessibility standards update
- New tools introduce unique requirements

### Contributing to This Guide

1. Document new patterns as they're established
2. Update examples when patterns change
3. Keep quick reference tables current
4. Add to checklists based on common issues

---

## Related Documentation

- [Western Astrology Style Guide](./WESTERN_ASTROLOGY_STYLE_GUIDE.md) - Tool-specific example
- [Starfield Optimization Guide](./STARFIELD_OPTIMIZATION_GUIDE.md) - Background details
- [Firebase Database Fix](./FIREBASE_DATABASE_FIX.md) - Firebase patterns
- [Tool Integration Guide](./TOOL_INTEGRATION_GUIDE.md) - Tool-specific patterns

---

**Last Updated**: 2024
**Version**: 1.0
**Maintained By**: Development Team

