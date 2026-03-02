/**
 * Maps gemstone names (as used in GEMSTONE_DATABASE, Navaratna, etc.) to photo paths.
 * Save your gem images in public/gemstones/photos/ with these exact filenames (PNG or JPG).
 * Wherever gems are shown, use getGemstonePhotoPath(name) to show the image when available.
 */

/** Navaratna + GEMSTONE_DATABASE (remedies by sign). Filenames in public/gemstones/photos/. */
const GEMSTONE_PHOTO_MAP: Record<string, string> = {
  // Navaratna (9)
  Ruby: '/gemstones/photos/ruby.png',
  'Ruby (Manik)': '/gemstones/photos/ruby.png',
  Pearl: '/gemstones/photos/pearl.png',
  'Pearl (Moti)': '/gemstones/photos/pearl.png',
  'Red Coral': '/gemstones/photos/red-coral.png',
  'Red Coral (Moonga)': '/gemstones/photos/red-coral.png',
  Emerald: '/gemstones/photos/emerald.png',
  'Emerald (Panna)': '/gemstones/photos/emerald.png',
  'Yellow Sapphire': '/gemstones/photos/yellow-sapphire.png',
  'Yellow Sapphire (Pukhraj)': '/gemstones/photos/yellow-sapphire.png',
  Diamond: '/gemstones/photos/diamond.png',
  'Diamond or White Sapphire': '/gemstones/photos/diamond.png',
  'Blue Sapphire': '/gemstones/photos/blue-sapphire.png',
  'Blue Sapphire (Neelam)': '/gemstones/photos/blue-sapphire.png',
  Hessonite: '/gemstones/photos/hessonite.png',
  'Hessonite (Gomed)': '/gemstones/photos/hessonite.png',
  "Hessonite Garnet": '/gemstones/photos/hessonite.png',
  "Cat's Eye": '/gemstones/photos/cats-eye.png',
  "Cat's Eye (Lehsunia)": '/gemstones/photos/cats-eye.png',
  // Remedies by sign (GEMSTONE_DATABASE)
  Bloodstone: '/gemstones/photos/bloodstone.png',
  'Rose Quartz': '/gemstones/photos/rose-quartz.png',
  Citrine: '/gemstones/photos/citrine.png',
  Moonstone: '/gemstones/photos/moonstone.png',
  Amber: '/gemstones/photos/amber.png',
  Peridot: '/gemstones/photos/peridot.png',
  'Green Aventurine': '/gemstones/photos/green-aventurine.png',
  Opal: '/gemstones/photos/opal.png',
  'Pink Tourmaline': '/gemstones/photos/pink-tourmaline.png',
  Obsidian: '/gemstones/photos/obsidian.png',
  'Lapis Lazuli': '/gemstones/photos/lapis-lazuli.png',
  Onyx: '/gemstones/photos/onyx.png',
  Amethyst: '/gemstones/photos/amethyst.png',
  Aquamarine: '/gemstones/photos/aquamarine.png',
}

/**
 * Returns the photo path for a gemstone by name, or undefined if no image is configured.
 * Use in img src; hide or show placeholder when undefined.
 */
export function getGemstonePhotoPath(gemName: string): string | undefined {
  if (!gemName || typeof gemName !== 'string') return undefined
  const trimmed = gemName.trim()
  return GEMSTONE_PHOTO_MAP[trimmed] ?? undefined
}
