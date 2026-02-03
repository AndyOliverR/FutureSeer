# Starfield Image Creation Guide

## Image Specifications

### Dimensions
- **Minimum**: 15000x15000px
- **Recommended**: 20000x20000px (for extra coverage on ultra-wide displays)
- **Aspect Ratio**: Square (1:1) or slightly wider (e.g., 16:9) depending on your preference

### Format
- **Preferred**: AVIF (best compression, modern browsers)
- **Alternative**: WebP (wider browser support)
- **Fallback**: PNG (if AVIF/WebP not available)

### Content Requirements
- **Background**: Deep black/dark space color (RGB: 0, 0, 0 or close to #000000)
- **Stars**: White or light-colored (RGB: 255, 255, 255 or slightly off-white)
- **Star Characteristics**:
  - Small, sharp points (not blurry)
  - Evenly distributed across the image
  - Various sizes (mostly small, some medium)
  - No visible patterns or clusters
  - Seamless edges (for tiling if needed)

### File Size
- **Target**: <10MB (optimized)
- **Maximum**: 15MB (acceptable for web)
- Use compression tools to optimize after creation

### File Naming
- `starfield-large.avif` (if AVIF format)
- `starfield-large.webp` (if WebP format)
- Place in: `public/assets/bg/` directory

## Image Creation Tools & Methods

### Option 1: AI Image Generation (Recommended)
**Tools**: Midjourney, DALL-E, Stable Diffusion, Leonardo.ai

**Prompt Examples**:
```
"vast starfield, white stars on deep black space, high resolution, seamless pattern, 15000x15000 pixels, evenly distributed stars, sharp and clear, no blur, space background"
```

**Steps**:
1. Generate image with AI tool
2. Upscale to 15000x15000px+ using AI upscaler (e.g., Topaz Gigapixel, Upscayl, or online upscalers)
3. Optimize file size while maintaining quality
4. Convert to AVIF/WebP format

### Option 2: Photoshop/GIMP (Procedural)
**Steps**:
1. Create new document: 15000x15000px, RGB, 8-bit
2. Fill background with black (#000000)
3. Add noise: Filter > Noise > Add Noise (Amount: 400%, Gaussian, Monochromatic)
4. Apply threshold: Image > Adjustments > Threshold (adjust to get desired star density)
5. Optional: Add more layers with different noise/threshold for varied star sizes
6. Export as PNG, then convert to AVIF/WebP

### Option 3: Online Generators
**Tools**:
- Starfield Generator websites
- Space Background Creator tools
- Procedural texture generators

**Steps**:
1. Use generator to create starfield
2. Export at maximum resolution
3. Upscale if needed
4. Optimize and convert format

### Option 4: Upscale Existing Image
**If you have a smaller starfield image**:
1. Use AI upscaler (Topaz Gigapixel, Real-ESRGAN, Upscayl)
2. Upscale to 15000x15000px+
3. Ensure stars remain sharp (not blurry)
4. Optimize file size

## Optimization Tools

### Image Compression
- **Squoosh** (https://squoosh.app/) - Online, supports AVIF/WebP
- **ImageOptim** - Mac app
- **TinyPNG** - Online PNG/WebP optimizer
- **Sharp CLI** - Command-line tool for batch processing

### Format Conversion
- **Squoosh** - Convert to AVIF/WebP
- **FFmpeg** - Command-line: `ffmpeg -i input.png -c:v libaom-av1 -crf 30 output.avif`
- **ImageMagick** - Command-line conversion

## Testing Checklist

After creating the image:
- [ ] Image dimensions are 15000x15000px or larger
- [ ] File size is optimized (<10MB preferred)
- [ ] Stars are sharp and clear (not pixelated or blurry)
- [ ] Background is deep black (no gray areas)
- [ ] Stars are evenly distributed
- [ ] Image covers full viewport without white spaces
- [ ] Format is AVIF or WebP
- [ ] File is placed in `public/assets/bg/` directory

## Implementation Notes

Once the image is created and placed in `public/assets/bg/`, update `app/page.tsx` to reference the new file:

```tsx
className="... bg-[url('/assets/bg/starfield-large.avif')] ..."
```

The code is already configured to use `bg-cover` which will scale the large image to cover the entire viewport, eliminating white spaces.

