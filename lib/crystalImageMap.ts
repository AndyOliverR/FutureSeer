/**
 * Maps crystal names (as used in CRYSTAL_DATABASE, chakra associatedCrystals, etc.) to photo paths.
 * Save crystal images in public/crystals/photos/ with the exact filenames below (e.g. clear-quartz.png).
 * Tier 1 = Energy & Healing Crystal tab; Tier 2 = chakra-associated crystals.
 */

const CRYSTAL_PHOTO_MAP: Record<string, string> = {
  // Tier 1 – CRYSTAL_DATABASE (Crystal Healing tab)
  'Clear Quartz': '/crystals/photos/clear-quartz.png',
  Amethyst: '/crystals/photos/amethyst.png',
  'Rose Quartz': '/crystals/photos/rose-quartz.png',
  Citrine: '/crystals/photos/citrine.png',
  'Black Tourmaline': '/crystals/photos/black-tourmaline.png',
  Carnelian: '/crystals/photos/carnelian.png',
  Selenite: '/crystals/photos/selenite.png',
  'Lapis Lazuli': '/crystals/photos/lapis-lazuli.png',
  Jade: '/crystals/photos/jade.png',
  "Tiger's Eye": '/crystals/photos/tigers-eye.png',
  // Tier 2 – chakra associatedCrystals
  'Red Jasper': '/crystals/photos/red-jasper.png',
  Garnet: '/crystals/photos/garnet.png',
  Hematite: '/crystals/photos/hematite.png',
  'Smoky Quartz': '/crystals/photos/smoky-quartz.png',
  'Orange Calcite': '/crystals/photos/orange-calcite.png',
  Amber: '/crystals/photos/amber.png',
  Moonstone: '/crystals/photos/moonstone.png',
  'Yellow Jasper': '/crystals/photos/yellow-jasper.png',
  Pyrite: '/crystals/photos/pyrite.png',
  'Green Aventurine': '/crystals/photos/green-aventurine.png',
  Emerald: '/crystals/photos/emerald.png',
  Rhodonite: '/crystals/photos/rhodonite.png',
  'Blue Lace Agate': '/crystals/photos/Blue%20Lace%20Agate.png',
  Aquamarine: '/crystals/photos/aquamarine.png',
  Sodalite: '/crystals/photos/sodalite.png',
  Turquoise: '/crystals/photos/turquoise.png',
  Fluorite: '/crystals/photos/fluorite.png',
  Diamond: '/crystals/photos/diamond.png',
  Labradorite: '/crystals/photos/labradorite.png',
};

/**
 * Returns the photo path for a crystal by name, or undefined if no image is configured.
 */
export function getCrystalPhotoPath(crystalName: string): string | undefined {
  if (!crystalName || typeof crystalName !== 'string') return undefined;
  const trimmed = crystalName.trim();
  return CRYSTAL_PHOTO_MAP[trimmed] ?? undefined;
}
