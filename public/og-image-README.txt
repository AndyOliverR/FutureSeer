OG Image Generation
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
