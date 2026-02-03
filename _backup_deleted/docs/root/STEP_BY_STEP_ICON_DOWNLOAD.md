# Step-by-Step Icon Download Instructions

Follow these exact steps to download and save icons for FutureSeer.

---

## 🎯 STEP 1: Create the Folders First

Before downloading anything, create the folders where you'll save the icons.

### Option A: Using Windows File Explorer

1. Open File Explorer
2. Navigate to: `C:\FutureSeer\public\`
3. Right-click in the `public` folder → **New** → **Folder**
4. Name it: `icons`
5. Double-click into the `icons` folder
6. Create these folders inside `icons`:

   **Inside `icons` folder, create:**
   - Folder: `astrology`
   - Folder: `numerology`

   **Inside `icons\astrology` folder, create:**
   - Folder: `western`

   **Inside `icons\astrology\western` folder, create:**
   - Folder: `zodiac`
   - Folder: `planets`
   - Folder: `aspects`

   **Inside `icons\numerology` folder, create:**
   - Folder: `pythagorean`

   **Inside `icons\numerology\pythagorean` folder, create:**
   - Folder: `numbers`

   **Inside `icons\numerology\pythagorean\numbers` folder, create:**
   - Folder: `master-numbers`

### Option B: Using PowerShell (Faster)

1. Open PowerShell in your project folder (`C:\FutureSeer`)
2. Copy and paste these commands one by one (press Enter after each):

```powershell
New-Item -ItemType Directory -Force -Path "public\icons\astrology\western\zodiac"
New-Item -ItemType Directory -Force -Path "public\icons\astrology\western\planets"
New-Item -ItemType Directory -Force -Path "public\icons\astrology\western\aspects"
New-Item -ItemType Directory -Force -Path "public\icons\numerology\pythagorean\numbers\master-numbers"
```

**✅ After this step, you should have these folders:**
- `C:\FutureSeer\public\icons\astrology\western\zodiac\` (empty)
- `C:\FutureSeer\public\icons\astrology\western\planets\` (empty)
- `C:\FutureSeer\public\icons\astrology\western\aspects\` (empty)
- `C:\FutureSeer\public\icons\numerology\pythagorean\numbers\master-numbers\` (empty)

---

## 📥 STEP 2: Download Zodiac Sign Icons (12 files)

### Where to Download:
**Website**: https://github.com/krakkenkodex/astrology_icons

### Exact Steps:

1. **Open your web browser**
2. **Go to**: https://github.com/krakkenkodex/astrology_icons
3. **Click the green "Code" button** (top right area)
4. **Click "Download ZIP"** from the dropdown menu
5. **Wait for download to complete** (file will be in your Downloads folder)
6. **Find the downloaded file**: `astrology_icons-master.zip` (or similar name)
7. **Right-click the ZIP file** → **Extract All...**
8. **Choose extraction location** (your Desktop is fine for now)
9. **Open the extracted folder** → You should see 12 SVG files:
   - Aries.svg
   - Taurus.svg
   - Gemini.svg
   - Cancer.svg
   - Leo.svg
   - Virgo.svg
   - Libra.svg
   - Scorpio.svg
   - Sagittarius.svg
   - Capricorn.svg
   - Aquarius.svg
   - Pisces.svg

10. **Rename each file to lowercase**:
    - Right-click `Aries.svg` → Rename → type `aries.svg` (all lowercase)
    - Repeat for all 12 files: `taurus.svg`, `gemini.svg`, `cancer.svg`, `leo.svg`, `virgo.svg`, `libra.svg`, `scorpio.svg`, `sagittarius.svg`, `capricorn.svg`, `aquarius.svg`, `pisces.svg`

11. **Copy all 12 renamed files**:
    - Select all 12 files (Ctrl+A)
    - Copy them (Ctrl+C)

12. **Paste into the correct folder**:
    - Navigate to: `C:\FutureSeer\public\icons\astrology\western\zodiac\`
    - Paste the files (Ctrl+V)

**✅ Check**: You should now have 12 files in `C:\FutureSeer\public\icons\astrology\western\zodiac\`

---

## 🌍 STEP 3: Download Planetary Icons (10 files)

### Where to Download:
**Primary Website**: https://www.reshot.com/free-svg-icons/astrology/

### Exact Steps for Each Planet:

#### For SUN Icon:
1. Go to: https://www.reshot.com/free-svg-icons/astrology/
2. **Search for**: "sun" (use the search bar)
3. **Browse results** and click on a sun icon you like
4. **Click the "Download" button** (usually green/blue button)
5. **Select "SVG" format** if given options
6. **Save the file** as `sun.svg` to: `C:\FutureSeer\public\icons\astrology\western\planets\`

#### Repeat for MOON:
1. **Search for**: "moon"
2. Download and save as `moon.svg` to the same folder

#### Repeat for each planet:
- **Mercury**: Search "mercury planet" → Save as `mercury.svg`
- **Venus**: Search "venus planet" → Save as `venus.svg`
- **Mars**: Search "mars planet" → Save as `mars.svg`
- **Jupiter**: Search "jupiter planet" → Save as `jupiter.svg`
- **Saturn**: Search "saturn planet" → Save as `saturn.svg`
- **Uranus**: Search "uranus planet" → Save as `uranus.svg`
- **Neptune**: Search "neptune planet" → Save as `neptune.svg`
- **Pluto**: Search "pluto planet" → Save as `pluto.svg`

**⚠️ If Reshot doesn't have good icons, try these alternatives:**

**Alternative Source - Flaticon**:
1. Go to: https://www.flaticon.com/free-icons/astrology
2. Search for each planet
3. **Make sure to filter by "Free"** (free icons)
4. Click on icon → Download → Select SVG format
5. Save with lowercase name to the planets folder

**✅ Check**: You should now have 10 files in `C:\FutureSeer\public\icons\astrology\western\planets\`

---

## 📊 STEP 4: Download Aspect Icons (5 files)

### Option A: Use Tabler Icons (Recommended)

**Website**: https://tabler.io/icons

1. Go to: https://tabler.io/icons
2. **Search for geometry/angle symbols**:
   - Search "angle" or "geometry" or "circle" for conjunction
   - Search "triangle" for trine
   - Search "square" for square
   - Search "opposite" or "line" for opposition
   - Search "hexagon" or "angle" for sextile
3. Click on each icon you like
4. Click "Download SVG"
5. Save to: `C:\FutureSeer\public\icons\astrology\western\aspects\`
6. **Rename files to**:
   - `conjunction.svg`
   - `sextile.svg`
   - `square.svg`
   - `trine.svg`
   - `opposition.svg`

### Option B: Create Simple Custom SVGs (If Tabler doesn't work)

You can create simple SVG files using these symbols:

1. **Open Notepad** (or any text editor)
2. **For conjunction.svg**, paste this:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <circle cx="9" cy="12" r="3"/>
  <circle cx="15" cy="12" r="3"/>
</svg>
```
3. **Save as** `conjunction.svg` to: `C:\FutureSeer\public\icons\astrology\western\aspects\`

4. **For trine.svg** (triangle):
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <polygon points="12,2 22,20 2,20"/>
</svg>
```
5. **Save as** `trine.svg`

6. **For square.svg**:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <rect x="4" y="4" width="16" height="16"/>
</svg>
```
7. **Save as** `square.svg`

8. **For sextile.svg** (hexagon):
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <polygon points="12,2 19,6 19,18 12,22 5,18 5,6"/>
</svg>
```
9. **Save as** `sextile.svg`

10. **For opposition.svg** (opposite lines):
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <circle cx="6" cy="12" r="3"/>
  <line x1="12" y1="12" x2="18" y2="12" stroke-width="2"/>
  <circle cx="18" cy="12" r="3"/>
</svg>
```
11. **Save as** `opposition.svg`

**✅ Check**: You should now have 5 files in `C:\FutureSeer\public\icons\astrology\western\aspects\`

---

## 🔢 STEP 5: Download Numerology Number Icons

### Where to Download:
**Website**: https://tabler.io/icons

### Exact Steps:

1. Go to: https://tabler.io/icons
2. **Search for each number**:
   - Search "number 0" or just "0"
   - Click on a number icon you like
   - Click "Download SVG"
   - **Rename to** `0.svg`
   - **Save to**: `C:\FutureSeer\public\icons\numerology\pythagorean\numbers\`
3. **Repeat for numbers 1 through 9**:
   - Search "number 1" → Save as `1.svg`
   - Search "number 2" → Save as `2.svg`
   - ... and so on until `9.svg`

### For Master Numbers (11, 22, 33):

You have two options:

**Option A**: Create combined number SVGs
- Use any simple text-based SVG or combine two number icons
- Save as: `11.svg`, `22.svg`, `33.svg`
- **Save to**: `C:\FutureSeer\public\icons\numerology\pythagorean\numbers\master-numbers\`

**Option B**: Skip for now (we can use fallback icons in code)

**✅ Check**: You should now have at least 10 files (0-9) in `C:\FutureSeer\public\icons\numerology\pythagorean\numbers\`

---

## ✅ FINAL VERIFICATION

After all downloads, verify your folder structure looks like this:

```
C:\FutureSeer\public\icons\
├── astrology\
│   └── western\
│       ├── zodiac\           ← Should have 12 files (aries.svg, taurus.svg, etc.)
│       ├── planets\          ← Should have 10 files (sun.svg, moon.svg, etc.)
│       └── aspects\          ← Should have 5 files (conjunction.svg, trine.svg, etc.)
└── numerology\
    └── pythagorean\
        └── numbers\
            ├── 0.svg through 9.svg  ← Should have 10 files
            └── master-numbers\      ← Optional: 11.svg, 22.svg, 33.svg
```

### Quick Checklist:

- [ ] `public/icons/astrology/western/zodiac/` contains 12 SVG files (all lowercase names)
- [ ] `public/icons/astrology/western/planets/` contains 10 SVG files (sun.svg, moon.svg, etc.)
- [ ] `public/icons/astrology/western/aspects/` contains 5 SVG files
- [ ] `public/icons/numerology/pythagorean/numbers/` contains at least 10 SVG files (0.svg - 9.svg)
- [ ] All file names are lowercase
- [ ] All files are SVG format (you can check by looking at the file extension)

---

## 🎉 When You're Done

Once you've downloaded and saved all the icons in the correct folders:

1. **Tell me**: "I've completed the icon downloads"
2. I'll then implement the code to use these icons
3. The icons will be integrated into the Western Astrology and Astro Numerology pages

---

## ❓ Troubleshooting

**Q: I can't find a good icon on Reshot/Flaticon**
- Try the alternative sources listed in each step
- Or use the simple custom SVG code I provided for aspects

**Q: The file won't download as SVG**
- Make sure you're selecting "SVG" format when downloading
- Some sites default to PNG - change the format before downloading

**Q: I don't know how to rename files to lowercase**
- Right-click the file → Rename
- Type the new name in all lowercase
- Press Enter

**Q: I'm not sure if I saved files in the right place**
- Double-check the folder path matches exactly what's shown above
- The path should start from `C:\FutureSeer\public\icons\...`

---

## 📝 Quick Reference: Exact Folder Paths

Copy these paths to make sure you're saving in the right place:

- **Zodiac icons**: `C:\FutureSeer\public\icons\astrology\western\zodiac\`
- **Planet icons**: `C:\FutureSeer\public\icons\astrology\western\planets\`
- **Aspect icons**: `C:\FutureSeer\public\icons\astrology\western\aspects\`
- **Number icons**: `C:\FutureSeer\public\icons\numerology\pythagorean\numbers\`
- **Master numbers**: `C:\FutureSeer\public\icons\numerology\pythagorean\numbers\master-numbers\`
