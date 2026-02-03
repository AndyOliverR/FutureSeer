# Western Astrology Page - Style Guide

This document serves as a reference for styling and consistency standards used in the Western Astrology tool page. Use this as a template for other tool pages.

## Background

### Starfield Background
- **Class**: `starfield-ultra-sharp`
- **Purpose**: Provides consistent starry space background matching the landing page
- **Usage**: Applied to main container div
- **CSS**: Defined in `app/globals.css` with optimized rendering for 8K displays
- **Background Color**: `#141932` (medium-dark navy blue)

```tsx
<div className="starfield-ultra-sharp min-h-screen p-4 overflow-hidden">
```

## Typography Standards

### Font Sizes
- **Main Page Title (h1)**: `text-5xl` (3rem, 48px) with `font-bold` and `gold-glow`
- **Section Headings (h2)**: `text-3xl` (1.875rem, 30px) with `font-bold` and `gold-glow`
- **Card Titles (h3/h4)**: `text-xl` (1.25rem, 20px) with `font-semibold`
- **Body Text**: `text-base` (1rem, 16px) - default size
- **Small Text/Labels**: `text-sm` (0.875rem, 14px) for secondary information
- **Extra Small**: `text-xs` (0.75rem, 12px) for tab labels and fine print

### Font Weights
- **Headings**: `font-bold` for main headings, `font-semibold` for subheadings
- **Body Text**: Default weight (400)
- **Accent Text**: `font-semibold` for emphasized content

### Font Colors
- **Primary Headings**: `gold-glow` class (glowing amber/yellow effect)
- **Main Text**: `text-white` or `text-slate-200` for readability
- **Secondary Text**: `text-slate-300` for labels and less important info
- **Muted Text**: `text-slate-400` for fine print
- **Accent Colors**: 
  - Amber/Gold: `text-amber-300`, `text-amber-400`, `text-yellow-300`
  - Blue: `text-blue-300`, `text-blue-400`
  - Purple: `text-purple-300`, `text-pink-300`

## Color Palette (Gamification Style)

### Primary Colors
- **Amber/Gold**: `amber-500`, `amber-400`, `amber-300` - Primary accent
- **Background Opacity**: `amber-500/20` for hover states

### Accent Colors
- **Success/Positive**: `green-400`, `emerald-400`
- **Info**: `blue-400`, `cyan-400`
- **Warning**: `yellow-400`
- **Error**: `red-400`
- **Purple/Violet**: `purple-400`, `pink-400`, `violet-400`

### Glass Card Colors
- **Border**: `border-white/10` (10% opacity white)
- **Hover Border**: `hover:border-amber-400/30` or pastel color variants
- **Background**: Use `glass-card` utility class

### Pastel Accents (for cards)
- Yellow: `border-yellow-400/20`, `hover:border-yellow-400/30`
- Blue: `border-blue-400/20`, `hover:border-blue-400/30`
- Purple: `border-purple-400/20`, `hover:border-purple-400/30`
- Pink: `border-pink-400/20`, `hover:border-pink-400/30`

## Component Patterns

### Glass Cards
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

### Pastel Accent Cards
```tsx
<Card className="glass-card border-yellow-400/20 hover:border-yellow-400/30 transition-all duration-300 rounded-3xl text-white">
  <CardContent className="p-6 text-center text-white">
    {/* Content */}
  </CardContent>
</Card>
```

### Tab Navigation
```tsx
<TabsList className="grid w-full grid-cols-6 glass-card border-white/10 rounded-3xl p-1">
  <TabsTrigger 
    value="tab-name"
    className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300 rounded-xl px-3 py-2 text-xs text-slate-200"
  >
    Tab Label
  </TabsTrigger>
</TabsList>
```

### Section Headers
```tsx
<h2 className="text-3xl font-bold gold-glow mb-4">🌟 Section Title</h2>
<p className="text-slate-200 leading-relaxed">
  Section description
</p>
```

## Spacing

- **Page Container**: `p-4` padding
- **Section Spacing**: `space-y-6` for vertical spacing between sections
- **Card Padding**: `p-6` or `p-8` for card content
- **Margins**: `mb-4`, `mb-8` for section separation

## Border Radius

- **Cards**: `rounded-2xl` (1rem) or `rounded-3xl` (1.5rem) for rounded corners
- **Tab Triggers**: `rounded-xl` (0.75rem)
- **Buttons**: `rounded-xl`

## Animations

- **Framer Motion**: Use for page transitions
  - Initial: `opacity: 0, y: -20`
  - Animate: `opacity: 1, y: 0`
  - Transition: `duration: 0.6`
- **Hover Effects**: `transition-all duration-300` for smooth color changes

## Performance Best Practices

1. **Memoization**: Use `useMemo` for expensive calculations and array operations
2. **Console Logs**: Guard with `process.env.NODE_ENV === 'development'`
3. **Image Optimization**: Use optimized background images
4. **Lazy Loading**: Consider for heavy components

## Code Quality

- **TypeScript**: Strict type checking
- **Error Handling**: User-friendly error messages
- **Loading States**: Always show loading indicators during async operations
- **Accessibility**: Ensure proper contrast ratios (WCAG AA minimum)

## Example Component Structure

```tsx
export default function ComponentName({ props }) {
  // Memoized calculations
  const memoizedValue = useMemo(() => {
    // Expensive calculation
  }, [dependencies])

  // State management
  const [state, setState] = useState(initialValue)

  // Effects with proper dependencies
  useEffect(() => {
    // Side effects
  }, [dependencies])

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="glass-card border-white/10 rounded-2xl text-white">
        {/* Content */}
      </Card>
    </motion.div>
  )
}
```

## Notes

- All text must be light colored for readability on dark backgrounds
- Never use black or dark gray text
- Maintain consistent spacing and padding
- Use glass-card styling for all card components
- Apply pastel accent colors consistently
- Ensure all interactive elements have hover states
