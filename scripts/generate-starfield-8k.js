const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 8K UHD resolution: 7680×4320 pixels
const WIDTH = 7680;
const HEIGHT = 4320;
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'assets', 'bg', 'starfieldn-8k.png');

// Create a buffer for the image data (RGBA: 4 bytes per pixel)
const imageBuffer = Buffer.alloc(WIDTH * HEIGHT * 4);

// Fill with medium-dark navy blue background (RGB: 20, 25, 50, Alpha: 255)
// Medium-dark navy blue matching starfield image
const BG_R = 20;
const BG_G = 25;
const BG_B = 50;

for (let i = 0; i < WIDTH * HEIGHT; i++) {
  const offset = i * 4;
  imageBuffer[offset] = BG_R;     // R
  imageBuffer[offset + 1] = BG_G; // G
  imageBuffer[offset + 2] = BG_B; // B
  imageBuffer[offset + 3] = 255;  // A
}

// Generate stars
const NUM_WHITE_STARS = 10000; // ~10,000 white stars (reduced for less clutter)
const NUM_ADDITIONAL_SIZE1_STARS = 10000; // Additional 10,000 size 1 white stars
const NUM_ABSOLUTE_WHITE_STARS = 5000; // 5,000 size 1 absolute white stars (brightness 255)
const NUM_SIZE3_WHITE_STARS = 2000; // 2,000 size 3 white stars (brightness 255)
const NUM_GOLDEN_STARS = 1000; // ~1,000 subtle golden twinkling stars
const seed = 12345; // Seed for reproducible randomness

function seededRandom(seed) {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

let currentSeed = seed;

function random() {
  currentSeed++;
  return seededRandom(currentSeed);
}

// Function to draw a star
function drawStar(x, y, starSize, r, g, b) {
  for (let dy = -starSize; dy <= starSize; dy++) {
    for (let dx = -starSize; dx <= starSize; dx++) {
      const px = x + dx;
      const py = y + dy;
      
      // Check bounds
      if (px >= 0 && px < WIDTH && py >= 0 && py < HEIGHT) {
        // Simple circular star shape
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= starSize) {
          const offset = (py * WIDTH + px) * 4;
          const fade = 1 - (dist / starSize); // Fade from center
          
          imageBuffer[offset] = Math.min(255, Math.floor(r * fade));     // R
          imageBuffer[offset + 1] = Math.min(255, Math.floor(g * fade)); // G
          imageBuffer[offset + 2] = Math.min(255, Math.floor(b * fade)); // B
          // Alpha stays 255
        }
      }
    }
  }
}

// Add white stars (~20,000)
for (let i = 0; i < NUM_WHITE_STARS; i++) {
  const x = Math.floor(random() * WIDTH);
  const y = Math.floor(random() * HEIGHT);
  // White stars: brightness 250-255 for bright, vibrant white appearance
  const brightness = Math.floor(random() * 6) + 250; // Stars between 250-255 brightness
  const starSize = random() < 0.7 ? 1 : 2; // Mostly size 1 (70%), some size 2 (30%) - no size 3
  
  drawStar(x, y, starSize, brightness, brightness, brightness);
}

// Add additional size 1 white stars (5,000 more)
for (let i = 0; i < NUM_ADDITIONAL_SIZE1_STARS; i++) {
  const x = Math.floor(random() * WIDTH);
  const y = Math.floor(random() * HEIGHT);
  // White stars: brightness 250-255 for bright, vibrant white appearance
  const brightness = Math.floor(random() * 6) + 250; // Stars between 250-255 brightness
  const starSize = 1; // Size 1 only
  
  drawStar(x, y, starSize, brightness, brightness, brightness);
}

// Add absolute white stars (5,000 size 1, brightness 255)
for (let i = 0; i < NUM_ABSOLUTE_WHITE_STARS; i++) {
  const x = Math.floor(random() * WIDTH);
  const y = Math.floor(random() * HEIGHT);
  // Absolute white: brightness 255 (pure white)
  const brightness = 255; // Absolute white
  const starSize = 1; // Size 1 only
  
  drawStar(x, y, starSize, brightness, brightness, brightness);
}

// Add size 3 white stars (2,000 size 3, brightness 255)
for (let i = 0; i < NUM_SIZE3_WHITE_STARS; i++) {
  const x = Math.floor(random() * WIDTH);
  const y = Math.floor(random() * HEIGHT);
  // Absolute white: brightness 255 (pure white)
  const brightness = 255; // Absolute white
  const starSize = 3; // Size 3 only
  
  drawStar(x, y, starSize, brightness, brightness, brightness);
}

// Add golden twinkling stars (~1,000 subtle golden stars)
for (let i = 0; i < NUM_GOLDEN_STARS; i++) {
  const x = Math.floor(random() * WIDTH);
  const y = Math.floor(random() * HEIGHT);
  // Golden stars: More subtle, lighter golden tones for subtle yellows
  // R stays at 255, G varies 230-245 (lighter), B varies 50-150 (more subtle)
  const g = Math.floor(random() * 16) + 230; // G: 230-245 (lighter)
  const b = Math.floor(random() * 101) + 50;  // B: 50-150 (more subtle yellow)
  // Golden stars: size 2 only (no size 3)
  const starSize = 2;
  
  drawStar(x, y, starSize, 255, g, b);
}

// Create image with sharp and save
sharp(imageBuffer, {
  raw: {
    width: WIDTH,
    height: HEIGHT,
    channels: 4
  }
})
  .png({ 
    quality: 100,
    compressionLevel: 6 
  })
  .toFile(OUTPUT_PATH)
  .then(() => {
    const stats = fs.statSync(OUTPUT_PATH);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`✅ Successfully generated enhanced 8K starfield image!`);
    console.log(`   Resolution: ${WIDTH}×${HEIGHT} pixels`);
    console.log(`   Location: ${OUTPUT_PATH}`);
    console.log(`   File size: ${fileSizeMB} MB`);
    console.log(`   Background: Medium-dark navy blue (RGB: ${BG_R}, ${BG_G}, ${BG_B})`);
    console.log(`   White stars: ${NUM_WHITE_STARS.toLocaleString()} (mixed sizes) + ${NUM_ADDITIONAL_SIZE1_STARS.toLocaleString()} (size 1) + ${NUM_ABSOLUTE_WHITE_STARS.toLocaleString()} (absolute white size 1) + ${NUM_SIZE3_WHITE_STARS.toLocaleString()} (size 3 white) = ${(NUM_WHITE_STARS + NUM_ADDITIONAL_SIZE1_STARS + NUM_ABSOLUTE_WHITE_STARS + NUM_SIZE3_WHITE_STARS).toLocaleString()} total`);
    console.log(`   Golden twinkling stars: ${NUM_GOLDEN_STARS}`);
  })
  .catch((error) => {
    console.error('❌ Error generating starfield:', error);
    process.exit(1);
  });

