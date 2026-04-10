/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Generate OG Image for FutureSeer
 * Creates a 1200x630px SVG that can be converted to PNG
 * 
 * This script generates an SVG file. To convert to PNG:
 * - Use online converter (e.g., cloudconvert.com)
 * - Use ImageMagick: convert og-image.svg og-image.png
 * - Use any SVG to PNG tool
 */

const fs = require('fs');
const path = require('path');

// OG Image specifications
const WIDTH = 1200;
const HEIGHT = 630;
const BRAND_COLOR = '#fbbf24'; // Amber-400
const BG_COLOR = '#0a0f1f'; // App dark blue

// SVG Template
const svgTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Starfield effect -->
    <radialGradient id="starfield" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:${BG_COLOR};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
    </radialGradient>
    
    <!-- Text gradient -->
    <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#f59e0b;stop-opacity:1" />
      <stop offset="50%" style="stop-color:${BRAND_COLOR};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#fcd34d;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#starfield)"/>
  
  <!-- Stars pattern -->
  <circle cx="100" cy="100" r="2" fill="${BRAND_COLOR}" opacity="0.6"/>
  <circle cx="300" cy="80" r="1.5" fill="${BRAND_COLOR}" opacity="0.4"/>
  <circle cx="500" cy="120" r="1" fill="#ffffff" opacity="0.8"/>
  <circle cx="700" cy="90" r="2" fill="${BRAND_COLOR}" opacity="0.5"/>
  <circle cx="900" cy="110" r="1.5" fill="#ffffff" opacity="0.6"/>
  <circle cx="1050" cy="95" r="1" fill="${BRAND_COLOR}" opacity="0.7"/>
  
  <circle cx="150" cy="300" r="1" fill="#ffffff" opacity="0.5"/>
  <circle cx="350" cy="280" r="2" fill="${BRAND_COLOR}" opacity="0.6"/>
  <circle cx="550" cy="320" r="1.5" fill="#ffffff" opacity="0.7"/>
  <circle cx="750" cy="290" r="1" fill="${BRAND_COLOR}" opacity="0.4"/>
  <circle cx="950" cy="310" r="2" fill="#ffffff" opacity="0.6"/>
  <circle cx="1100" cy="295" r="1.5" fill="${BRAND_COLOR}" opacity="0.5"/>
  
  <circle cx="200" cy="500" r="2" fill="${BRAND_COLOR}" opacity="0.7"/>
  <circle cx="400" cy="480" r="1" fill="#ffffff" opacity="0.5"/>
  <circle cx="600" cy="520" r="1.5" fill="${BRAND_COLOR}" opacity="0.6"/>
  <circle cx="800" cy="490" r="2" fill="#ffffff" opacity="0.8"/>
  <circle cx="1000" cy="510" r="1" fill="${BRAND_COLOR}" opacity="0.4"/>
  <circle cx="1150" cy="495" r="1.5" fill="#ffffff" opacity="0.6"/>
  
  <!-- Mystical symbol (simplified star) -->
  <g transform="translate(600, 230)">
    <polygon points="0,-40 10,-15 40,-15 15,5 25,35 0,15 -25,35 -15,5 -40,-15 -10,-15" 
             fill="none" 
             stroke="${BRAND_COLOR}" 
             stroke-width="2" 
             opacity="0.3"/>
  </g>
  
  <!-- Dark overlay for text readability -->
  <rect width="${WIDTH}" height="200" y="215" fill="${BG_COLOR}" opacity="0.85"/>
  
  <!-- Brand name -->
  <text x="600" y="320" 
        font-family="Georgia, serif" 
        font-size="80" 
        font-weight="bold"
        fill="url(#textGradient)" 
        text-anchor="middle"
        letter-spacing="2">
    FutureSeer
  </text>
  
  <!-- Tagline -->
  <text x="600" y="365" 
        font-family="Georgia, serif" 
        font-size="28" 
        fill="${BRAND_COLOR}" 
        text-anchor="middle"
        opacity="0.9">
    AI-Powered Mystical Insights
  </text>
  
  <!-- Subtle bottom text -->
  <text x="600" y="580" 
        font-family="Arial, sans-serif" 
        font-size="16" 
        fill="${BRAND_COLOR}" 
        text-anchor="middle"
        opacity="0.6">
    Where Ancient Wisdom Meets Artificial Intelligence
  </text>
</svg>`;

// Output paths
const outputDir = path.join(__dirname, '..', 'public');
const svgPath = path.join(outputDir, 'og-image.svg');
const readmePath = path.join(outputDir, 'og-image-README.txt');

// Write SVG file
fs.writeFileSync(svgPath, svgTemplate, 'utf8');

// Write README for PNG conversion
const readme = `OG Image Generation
==================

The og-image.svg file has been generated.

To convert to PNG (1200x630px):

Option 1 - Online Converter:
  Visit: https://cloudconvert.com/svg-to-png
  Upload: og-image.svg
  Download: og-image.png
  Place in: public/og-image.png

Option 2 - ImageMagick (if installed):
  convert og-image.svg -resize 1200x630 og-image.png

Option 3 - Inkscape (if installed):
  inkscape og-image.svg --export-png=og-image.png --export-width=1200 --export-height=630

Option 4 - Sharp (Node.js):
  npm install sharp
  node -e "require('sharp')('public/og-image.svg').resize(1200, 630).png().toFile('public/og-image.png').then(() => console.log('Done!'))"

After conversion:
1. Verify og-image.png is 1200x630px
2. Verify file size is <500KB
3. Delete og-image.svg and this README if not needed
4. Test with Twitter Card Validator and Facebook Debugger
`;

fs.writeFileSync(readmePath, readme, 'utf8');

console.log('✅ OG Image SVG generated successfully!');
console.log(`   Location: ${svgPath}`);
console.log('\n📝 Next steps:');
console.log('   1. Convert og-image.svg to og-image.png (see og-image-README.txt)');
console.log('   2. Verify dimensions: 1200x630px');
console.log('   3. Update app/layout.tsx to use /og-image.png');
console.log('\n💡 For quick conversion, you can:');
console.log('   - Use an online SVG to PNG converter');
console.log('   - Or install sharp: npm install sharp');
console.log('   - Then run the conversion command from the README');
