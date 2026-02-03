# Swiss Ephemeris Data Files

This directory contains the ephemeris data files required for Swiss Ephemeris calculations.

## Required Files

Download the following files from [Astrodienst](https://www.astro.com/swisseph/swephinfo_e.htm):

- `sepl_18.se1` - Planetary positions (1800-2100)
- `seplm_18.se1` - Lunar positions (1800-2100)
- `seas_18.se1` - Asteroids (1800-2100)
- `sefstars.txt` - Fixed stars
- `seorbel.txt` - Orbital elements

## Installation

1. Download the files from Astrodienst
2. Place them in this directory (`public/ephe/`)
3. The WASM build will automatically use these files

## File Sizes

- `sepl_18.se1`: ~2.5 MB
- `seplm_18.se1`: ~1.5 MB
- `seas_18.se1`: ~0.5 MB
- `sefstars.txt`: ~0.1 MB
- `seorbel.txt`: ~0.1 MB

Total: ~4.7 MB

## Alternative: Minimal Setup

For a minimal setup, you can use only:
- `sepl_18.se1` (planetary positions)
- `sefstars.txt` (fixed stars)

This reduces the total size to ~2.6 MB.

## Usage

The unified astrology service will automatically detect and use these files when available.
