# Glow Effects Usage Guide

This guide explains how to use the new glow effect classes in your FutureSeer app.

## Available Glow Effect Classes

### 1. **`.hover-glow`** - Basic Hover Glow
- **Use for:** Simple containers, divs, or any element that needs a subtle glow on hover
- **Effect:** Golden glow with shadow
- **Example:**
```jsx
<div className="p-4 bg-slate-800 rounded-lg hover-glow">
  Content here
</div>
```

### 2. **`.card-glow`** - Card Glow Effect
- **Use for:** Cards, panels, and content containers
- **Effect:** Enhanced glow with border color change and slight lift
- **Example:**
```jsx
<div className="p-6 bg-slate-900/40 border border-slate-700/50 rounded-xl card-glow">
  Card content
</div>
```

### 3. **`.button-glow`** - Button Glow Effect
- **Use for:** Buttons, clickable elements, and interactive components
- **Effect:** Glow with shimmer animation and slight lift
- **Example:**
```jsx
<button className="px-4 py-2 bg-amber-600 text-white rounded-lg button-glow">
  Click me
</button>
```

### 4. **`.input-glow`** - Input Field Glow
- **Use for:** Input fields, textareas, and form elements
- **Effect:** Glow on focus and hover
- **Example:**
```jsx
<input 
  type="text" 
  className="px-4 py-2 bg-slate-800 border border-amber-400/30 rounded-lg input-glow"
  placeholder="Enter text..."
/>
```

### 5. **`.status-glow`** - Status Panel Glow
- **Use for:** Status panels, modals, and overlay elements
- **Effect:** Enhanced glow for prominent UI elements
- **Example:**
```jsx
<div className="bg-slate-900/95 border border-amber-400/30 rounded-xl p-4 status-glow">
  Status content
</div>
```

### 6. **`.glow-effect`** - Advanced Glow Effect
- **Use for:** Premium elements that need extra visual impact
- **Effect:** Gradient border glow with opacity animation
- **Example:**
```jsx
<div className="p-4 bg-slate-800 rounded-lg glow-effect">
  Premium content
</div>
```

## Implementation Examples

### Landing Page Buttons
```jsx
<button className="px-8 py-4 bg-gradient-to-r from-amber-600 to-yellow-500 text-white rounded-xl button-glow">
  Begin Your Journey
</button>
```

### Navigation Cards
```jsx
<div className="p-6 bg-slate-900/40 border border-slate-700/50 rounded-xl card-glow">
  <h3 className="text-amber-300 font-serif">Card Title</h3>
  <p className="text-slate-300">Card description</p>
</div>
```

### Form Inputs
```jsx
<input 
  type="email" 
  className="w-full px-4 py-3 bg-slate-900/60 border border-amber-400/30 rounded-xl input-glow"
  placeholder="Enter your email"
/>
```

### Modal/Overlay Elements
```jsx
<div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md border border-amber-400/30 rounded-xl p-6 status-glow">
  <h2 className="text-amber-200 font-serif">Modal Title</h2>
  <p className="text-slate-300">Modal content</p>
</div>
```

## Customization

You can customize the glow effects by modifying the CSS variables in `app/globals.css`:

```css
/* Change glow color */
.hover-glow:hover {
  box-shadow: 
    0 0 20px rgba(59, 130, 246, 0.3),  /* Blue glow */
    0 0 40px rgba(59, 130, 246, 0.1),
    0 0 60px rgba(59, 130, 246, 0.05);
}

/* Change glow intensity */
.card-glow:hover {
  box-shadow: 
    0 0 30px rgba(251, 191, 36, 0.4),  /* Stronger glow */
    0 0 60px rgba(251, 191, 36, 0.2),
    0 8px 32px rgba(0, 0, 0, 0.3);
}
```

## Best Practices

1. **Use sparingly:** Don't apply glow effects to every element
2. **Consistent hierarchy:** Use stronger effects for more important elements
3. **Performance:** Glow effects are GPU-accelerated and performant
4. **Accessibility:** Ensure sufficient contrast for users with visual impairments
5. **Mobile:** Glow effects work well on touch devices

## Current Usage in FutureSeer

- **Service Status Panel:** Uses `status-glow` and `card-glow`
- **Ask Page Inputs:** Uses `input-glow`
- **Ask Page Button:** Uses `button-glow`
- **Ask Page Cards:** Uses `card-glow`
- **Action Buttons:** Uses `button-glow`

## Adding to New Components

When creating new components, consider which glow effect fits best:

```jsx
// For a new tool card
<div className="p-6 bg-slate-900/40 border border-slate-700/50 rounded-xl card-glow">
  <h3 className="text-amber-300 font-serif">New Tool</h3>
  <button className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg button-glow">
    Use Tool
  </button>
</div>
```

This creates a consistent, polished look throughout your app! 