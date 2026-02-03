# Complete Icon Directory Structure - Quick Reference

This is a quick visual reference for where to save icons for each divination system.

## Directory Tree

```
public/icons/
│
├── astrology/
│   ├── western/              ← START HERE (Phase 1)
│   │   ├── zodiac/          (12 files: aries.svg - pisces.svg)
│   │   ├── planets/         (10 files: sun.svg - pluto.svg)
│   │   └── aspects/         (5 files: conjunction.svg, trine.svg, etc.)
│   │
│   ├── vedic/               (Phase 2)
│   │   ├── nakshatras/      (27 nakshatra symbols)
│   │   ├── planets/         (9 grahas: Sun, Moon, Mars, etc.)
│   │   └── houses/          (12 bhavas)
│   │
│   ├── hellenistic/         (Phase 2)
│   ├── kp/                  (Phase 2)
│   ├── horary/              (Phase 2)
│   ├── medical/             (Phase 2)
│   ├── financial/           (Phase 2)
│   └── mundane/             (Phase 2)
│
├── numerology/
│   ├── pythagorean/         ← START HERE (Phase 1 - for Astro Numerology)
│   │   └── numbers/         (0.svg - 9.svg, master-numbers/ 11.svg, 22.svg, 33.svg)
│   │
│   ├── chaldean/            (Phase 2)
│   │   └── numbers/         (0-9, letter mappings)
│   │
│   ├── kabbalistic/         (Phase 2)
│   │   └── hebrew-letters/  (22 Hebrew letters)
│   │
│   └── angel-numbers/       (Phase 2)
│       └── numbers/         (111.svg, 222.svg, 333.svg, etc.)
│
├── tarot/                   (Phase 2)
│   ├── major-arcana/        (22 cards: the-fool.svg, the-magician.svg, etc.)
│   └── minor-arcana/
│       ├── cups/            (14 cards: cups-01.svg, cups-king.svg, etc.)
│       ├── pentacles/       (14 cards)
│       ├── swords/          (14 cards)
│       └── wands/           (14 cards)
│
├── lenormand/               (Phase 2)
│   └── cards/               (36 cards: anchor.svg, bear.svg, bird.svg, etc.)
│
├── runes/                   (Phase 2)
│   ├── elder-futhark/       (24 runes: fehu.svg, uruz.svg, etc.)
│   └── vikings/             (if different rune set needed)
│
├── iching/                  (Phase 2)
│   └── hexagrams/           (64 hexagrams: 01.svg - 64.svg)
│
├── bazi/                    (Phase 2)
│   ├── heavenly-stems/      (10 stems: jia.svg, yi.svg, etc.)
│   ├── earthly-branches/    (12 branches: zi.svg, chou.svg, etc.)
│   └── elements/            (5 elements: wood.svg, fire.svg, earth.svg, metal.svg, water.svg)
│
├── chinese-astrology/       (Phase 2)
│   ├── ziwei-stars/         (Purple Star symbols)
│   ├── palaces/             (12 palace symbols)
│   └── zodiac-animals/      (12 animals: rat.svg, ox.svg, tiger.svg, etc.)
│
├── palmistry/               (Phase 2)
│   ├── hand-shapes/         (hand type symbols)
│   ├── lines/               (life-line.svg, heart-line.svg, etc.)
│   └── mounts/              (mount symbols)
│
├── face-reading/            (Phase 2)
│   ├── features/            (eye.svg, nose.svg, mouth.svg, etc.)
│   └── expressions/         (expression symbols)
│
├── dream-symbols/           (Phase 2)
│   └── symbols/             (common dream symbols)
│
├── synastry/                (Phase 2)
│   └── compatibility/       (compatibility symbols)
│
├── feng-shui/               (Phase 2)
│   ├── bagua/               (bagua symbols)
│   ├── elements/            (5 elements)
│   └── directions/          (direction symbols)
│
├── vastu/                   (Phase 2)
│   ├── directions/          (direction symbols)
│   └── elements/            (5 elements)
│
├── geomancy/                (Phase 2)
│   └── figures/             (16 geomantic figures: populus.svg, via.svg, etc.)
│
├── ogham/                   (Phase 2)
│   └── letters/             (20 Ogham letters: beith.svg, luis.svg, etc.)
│
├── energy-healing/          (Phase 2)
│   ├── chakras/             (7 chakras: root.svg, crown.svg, etc.)
│   ├── crystals/            (crystal symbols)
│   └── auras/               (aura symbols)
│
├── scrying/                 (Phase 2)
│   └── symbols/             (scrying symbols)
│
├── pendulum/                (Phase 2)
│   └── responses/           (yes.svg, no.svg, maybe.svg)
│
├── name-analysis/           (Phase 2)
│   └── letters/             (letter analysis symbols)
│
├── human-design/            (Phase 2)
│   ├── types/               (generator.svg, manifestor.svg, etc.)
│   ├── centers/             (9 centers)
│   └── gates/               (64 gates)
│
├── akashic-records/         (Phase 2)
│   └── symbols/             (Akashic symbols)
│
├── bibliomancy/             (Phase 2)
│   └── books/               (bible.svg, quran.svg, gita.svg, etc.)
│
└── sortilege/               (Phase 2)
    └── methods/             (combined divination symbols)
```

## Phase 1 Priority (Do This First)

Focus on these folders for Western Astrology enhancement:

1. ✅ `public/icons/astrology/western/zodiac/` - 12 zodiac sign icons
2. ✅ `public/icons/astrology/western/planets/` - 10 planetary icons  
3. ✅ `public/icons/astrology/western/aspects/` - 5 aspect icons
4. ✅ `public/icons/numerology/pythagorean/numbers/` - Number icons (0-9, master numbers)

## Phase 2 (Later - As Needed)

Download icons for other systems progressively. Each system can be enhanced independently after Phase 1 is complete.

## Quick Commands to Create All Directories

**Windows PowerShell** (run from project root):
```powershell
New-Item -ItemType Directory -Force -Path "public\icons\astrology\western\zodiac"
New-Item -ItemType Directory -Force -Path "public\icons\astrology\western\planets"
New-Item -ItemType Directory -Force -Path "public\icons\astrology\western\aspects"
New-Item -ItemType Directory -Force -Path "public\icons\numerology\pythagorean\numbers\master-numbers"
New-Item -ItemType Directory -Force -Path "public\icons\astrology\vedic\nakshatras"
New-Item -ItemType Directory -Force -Path "public\icons\astrology\vedic\planets"
New-Item -ItemType Directory -Force -Path "public\icons\astrology\vedic\houses"
New-Item -ItemType Directory -Force -Path "public\icons\tarot\major-arcana"
New-Item -ItemType Directory -Force -Path "public\icons\tarot\minor-arcana\cups"
New-Item -ItemType Directory -Force -Path "public\icons\tarot\minor-arcana\pentacles"
New-Item -ItemType Directory -Force -Path "public\icons\tarot\minor-arcana\swords"
New-Item -ItemType Directory -Force -Path "public\icons\tarot\minor-arcana\wands"
New-Item -ItemType Directory -Force -Path "public\icons\lenormand\cards"
New-Item -ItemType Directory -Force -Path "public\icons\runes\elder-futhark"
New-Item -ItemType Directory -Force -Path "public\icons\iching\hexagrams"
New-Item -ItemType Directory -Force -Path "public\icons\bazi\heavenly-stems"
New-Item -ItemType Directory -Force -Path "public\icons\bazi\earthly-branches"
New-Item -ItemType Directory -Force -Path "public\icons\bazi\elements"
New-Item -ItemType Directory -Force -Path "public\icons\chinese-astrology\ziwei-stars"
New-Item -ItemType Directory -Force -Path "public\icons\chinese-astrology\palaces"
New-Item -ItemType Directory -Force -Path "public\icons\chinese-astrology\zodiac-animals"
New-Item -ItemType Directory -Force -Path "public\icons\palmistry\hand-shapes"
New-Item -ItemType Directory -Force -Path "public\icons\palmistry\lines"
New-Item -ItemType Directory -Force -Path "public\icons\palmistry\mounts"
New-Item -ItemType Directory -Force -Path "public\icons\face-reading\features"
New-Item -ItemType Directory -Force -Path "public\icons\face-reading\expressions"
New-Item -ItemType Directory -Force -Path "public\icons\dream-symbols\symbols"
New-Item -ItemType Directory -Force -Path "public\icons\synastry\compatibility"
New-Item -ItemType Directory -Force -Path "public\icons\feng-shui\bagua"
New-Item -ItemType Directory -Force -Path "public\icons\feng-shui\elements"
New-Item -ItemType Directory -Force -Path "public\icons\feng-shui\directions"
New-Item -ItemType Directory -Force -Path "public\icons\vastu\directions"
New-Item -ItemType Directory -Force -Path "public\icons\vastu\elements"
New-Item -ItemType Directory -Force -Path "public\icons\geomancy\figures"
New-Item -ItemType Directory -Force -Path "public\icons\ogham\letters"
New-Item -ItemType Directory -Force -Path "public\icons\energy-healing\chakras"
New-Item -ItemType Directory -Force -Path "public\icons\energy-healing\crystals"
New-Item -ItemType Directory -Force -Path "public\icons\energy-healing\auras"
New-Item -ItemType Directory -Force -Path "public\icons\scrying\symbols"
New-Item -ItemType Directory -Force -Path "public\icons\pendulum\responses"
New-Item -ItemType Directory -Force -Path "public\icons\name-analysis\letters"
New-Item -ItemType Directory -Force -Path "public\icons\human-design\types"
New-Item -ItemType Directory -Force -Path "public\icons\human-design\centers"
New-Item -ItemType Directory -Force -Path "public\icons\human-design\gates"
New-Item -ItemType Directory -Force -Path "public\icons\akashic-records\symbols"
New-Item -ItemType Directory -Force -Path "public\icons\bibliomancy\books"
New-Item -ItemType Directory -Force -Path "public\icons\sortilege\methods"
New-Item -ItemType Directory -Force -Path "public\icons\numerology\chaldean\numbers"
New-Item -ItemType Directory -Force -Path "public\icons\numerology\kabbalistic\hebrew-letters"
New-Item -ItemType Directory -Force -Path "public\icons\numerology\angel-numbers\numbers"
New-Item -ItemType Directory -Force -Path "public\icons\astrology\hellenistic\planets"
New-Item -ItemType Directory -Force -Path "public\icons\astrology\hellenistic\aspects"
New-Item -ItemType Directory -Force -Path "public\icons\astrology\kp\cusps"
New-Item -ItemType Directory -Force -Path "public\icons\astrology\horary"
New-Item -ItemType Directory -Force -Path "public\icons\astrology\medical"
New-Item -ItemType Directory -Force -Path "public\icons\astrology\financial"
New-Item -ItemType Directory -Force -Path "public\icons\astrology\mundane"
```

**Linux/Mac/Unix** (run from project root):
```bash
mkdir -p public/icons/astrology/{western/{zodiac,planets,aspects},vedic/{nakshatras,planets,houses},hellenistic/{planets,aspects},kp/cusps,horary,medical,financial,mundane}
mkdir -p public/icons/numerology/{pythagorean/numbers/master-numbers,chaldean/numbers,kabbalistic/hebrew-letters,angel-numbers/numbers}
mkdir -p public/icons/tarot/{major-arcana,minor-arcana/{cups,pentacles,swords,wands}}
mkdir -p public/icons/{lenormand/cards,runes/{elder-futhark,vikings},iching/hexagrams}
mkdir -p public/icons/bazi/{heavenly-stems,earthly-branches,elements}
mkdir -p public/icons/chinese-astrology/{ziwei-stars,palaces,zodiac-animals}
mkdir -p public/icons/{palmistry/{hand-shapes,lines,mounts},face-reading/{features,expressions},dream-symbols/symbols}
mkdir -p public/icons/{synastry/compatibility,feng-shui/{bagua,elements,directions},vastu/{directions,elements}}
mkdir -p public/icons/{geomancy/figures,ogham/letters,energy-healing/{chakras,crystals,auras}}
mkdir -p public/icons/{scrying/symbols,pendulum/responses,name-analysis/letters}
mkdir -p public/icons/human-design/{types,centers,gates}
mkdir -p public/icons/{akashic-records/symbols,bibliomancy/books,sortilege/methods}
```

## Notes

- **Phase 1 directories** are required for Western Astrology enhancement
- **Phase 2 directories** can be created as needed for future enhancements
- All icon files should be in **SVG format**
- File names should be **lowercase** with hyphens for multi-word names
- Example: `aries.svg`, `the-fool.svg`, `life-path.svg`
