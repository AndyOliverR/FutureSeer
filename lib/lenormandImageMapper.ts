/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Lenormand Card Image Mapper
 * 
 * Maps Lenormand card numbers and names to their image paths.
 * Provides fallback emoji symbols if images are not available.
 */

import { LenormandCard } from './lenormandIntelligence'

/**
 * Map card numbers to actual file names in public/lenormand/
 */
const CARD_IMAGE_FILES: Record<number, string> = {
  1: 'rider_1.png',
  2: 'clover_2.png',
  3: 'ship_3.png',
  4: 'house_4.png',
  5: 'tree_5.png',
  6: 'clouds_6.png',
  7: 'snake_7.png',
  8: 'coffin_8.png',
  9: 'bouquet_9.png',
  10: 'scythe_10.png',
  11: 'whip_11.png',
  12: 'bird_12.png',
  13: 'child_13.png',
  14: 'fox_14.png',
  15: 'bear_15.png',
  16: 'stars_16.png',
  17: 'stork_17.png',
  18: 'dog_18.png',
  19: 'tower_19.png',
  20: 'garden_20.png',
  21: 'mountain_21.png',
  22: 'crossroads_22.png',
  23: 'mice_23.png',
  24: 'heart_24.png',
  25: 'ring_25.png',
  26: 'book_26.png',
  27: 'letter_27.png',
  28: 'man_28.png',
  29: 'woman_29.png',
  30: 'lily_30.png',
  31: 'sun_31.png',
  32: 'moon_32.png',
  33: 'key_33.png',
  34: 'fish_34.png',
  35: 'anchor_35.png',
  36: 'cross_36.png'
}

// Emoji fallback for each card
const CARD_EMOJIS: Record<string, string> = {
  '1': '🏇',   // Rider
  '2': '🍀',   // Clover
  '3': '⛵',   // Ship
  '4': '🏠',   // House
  '5': '🌳',   // Tree
  '6': '☁️',   // Clouds
  '7': '🐍',   // Snake
  '8': '⚰️',   // Coffin
  '9': '💐',   // Bouquet
  '10': '⚔️',  // Scythe
  '11': '🔨',  // Whip
  '12': '🐦',  // Birds
  '13': '👶',  // Child
  '14': '🦊',  // Fox
  '15': '🐻',  // Bear
  '16': '⭐',  // Stars
  '17': '🦩',  // Stork
  '18': '🐕',  // Dog
  '19': '🏰',  // Tower
  '20': '🌷',  // Garden
  '21': '⛰️',  // Mountain
  '22': '🛤️',  // Crossroads
  '23': '🐭',  // Mice
  '24': '💖',  // Heart
  '25': '💍',  // Ring
  '26': '📖',  // Book
  '27': '✉️',  // Letter
  '28': '👨',  // Man
  '29': '👩',  // Woman
  '30': '⚜️',  // Lily
  '31': '☀️',  // Sun
  '32': '🌙',  // Moon
  '33': '🔑',  // Key
  '34': '🐠',  // Fish
  '35': '⚓',  // Anchor
  '36': '✝️'   // Cross
}

/**
 * Get image path for a Lenormand card
 * Returns the actual file path from the public/lenormand directory
 */
export function getCardImage(card: LenormandCard): string {
  // First check if card has custom image path
  if (card.image) {
    return card.image
  }

  // Get the actual file name from our mapping
  const fileName = CARD_IMAGE_FILES[card.number]
  if (fileName) {
    return `/lenormand/${fileName}`
  }

  // Fallback to constructed path (shouldn't happen with complete mapping)
  const cardNameSlug = card.name.toLowerCase().replace(/\s+/g, '')
  return `/lenormand/${cardNameSlug}_${card.number}.png`
}

/**
 * Get emoji fallback for a card
 */
export function getCardEmoji(card: LenormandCard): string {
  return CARD_EMOJIS[card.number.toString()] || '🌸'
}

/**
 * Check if card image exists (client-side only)
 */
export function checkCardImageExists(imagePath: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false)
      return
    }

    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = imagePath
  })
}

/**
 * Get card image with automatic fallback
 * Tries image, falls back to emoji
 */
export async function getCardImageWithFallback(card: LenormandCard): Promise<string> {
  const imagePath = getCardImage(card)
  const exists = await checkCardImageExists(imagePath)
  
  if (exists) {
    return imagePath
  }
  
  // Return emoji as fallback
  return getCardEmoji(card)
}

/**
 * Generate all card image paths
 * Useful for preloading
 */
export function getAllCardImagePaths(): string[] {
  // Import full deck
  const { LENORMAND_DECK } = require('./lenormandIntelligence')
  return LENORMAND_DECK.map((card: LenormandCard) => getCardImage(card))
}

/**
 * Get card image or emoji (synchronous version for immediate display)
 * Returns emoji if no image specified
 */
export function getCardDisplay(card: LenormandCard): string {
  if (card.image) {
    return card.image
  }
  return getCardEmoji(card)
}

