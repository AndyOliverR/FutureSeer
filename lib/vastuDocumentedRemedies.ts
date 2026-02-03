/**
 * Documented Vastu Shastra remedies - Top remedies that focus on balancing
 * the five natural elements (Earth, Water, Fire, Air, and Space) to eliminate
 * negative energy and enhance positivity without major, invasive renovations.
 */

export const VASTU_REMEDIES_INTRO =
  'Top documented remedies in Vastu Shastra focus on balancing the five natural elements (Earth, Water, Fire, Air, and Space) to eliminate negative energy and enhance positivity. These remedies are widely used to correct structural defects (Vastu Dosha) without major, invasive renovations.';

export interface TopRemedy {
  name: string;
  description: string;
}

export const TOP_10_REMEDIES: TopRemedy[] = [
  {
    name: 'Sea Salt (Sea Salt Cure)',
    description:
      'Placing small bowls of sea salt in the corners of rooms, especially the bathroom, is a top remedy for absorbing and neutralizing negative energy. It is often changed weekly.',
  },
  {
    name: 'Vastu Pyramids',
    description:
      'Copper, brass, or plastic pyramids are used to correct energy imbalances, particularly when installed above doors or in areas with high negative energy concentration.',
  },
  {
    name: 'Correct Mirror Placement',
    description:
      'Mirrors are placed on the north or east walls to enhance financial energy, but must never face the entrance, bed, or another mirror.',
  },
  {
    name: 'Camphor Crystals',
    description:
      'Burning or placing camphor in various areas of the home, particularly in the puja room or bathroom, is highly recommended for purification and removing negative vibrations.',
  },
  {
    name: 'Wind Chimes',
    description:
      'Hanging 6 or 8-rod wind chimes, especially at the entrance, brings positive, harmonic energy into the home.',
  },
  {
    name: 'Auspicious Symbols (Om, Swastik, Trishul)',
    description:
      'Placing these symbols at the main entrance acts as a protective shield and attracts positive energy.',
  },
  {
    name: 'Fish Aquariums',
    description:
      'A well-maintained, clean, and aerated aquarium in the Northeast or dining area is believed to attract positive energy and remove Vastu dosh.',
  },
  {
    name: 'Vastu-Compatible Plants',
    description:
      'Planting Tulsi (Holy Basil) in the Northeast, and keeping Money Plants or Bamboo in the North or East boosts prosperity.',
  },
  {
    name: 'Idol Placement (Ganesh/Hanuman)',
    description:
      'Placing a Ganesh or Hanuman statue facing the entrance to the house or at the entrance to correct defects.',
  },
  {
    name: 'Color Therapy',
    description:
      'Using light, positive colors like white, yellow, and green, and avoiding dark, heavy colors like black and red in certain zones (like the Northeast) to improve energy flow.',
  },
];

export interface AreaRemedies {
  entrance: string[];
  toiletBathroom: string[];
  bedroom: string[];
  kitchen: string[];
  northeastCorner: string[];
}

export const AREA_REMEDIES: AreaRemedies = {
  entrance: [
    'Place a brass or copper Swastik/Om',
    'Ensure it is well-lit',
    'Keep it clean',
  ],
  toiletBathroom: [
    'Keep doors closed',
    'Use sea salt in a bowl',
    'Or hang copper strips',
  ],
  bedroom: [
    'Place the bed in the Southwest',
    'Avoid mirrors facing the bed',
    'Do not sleep with the head towards the North',
  ],
  kitchen: [
    'Place the kitchen in the Southeast',
    'If not possible, use a yellow stone under the gas hob',
  ],
  northeastCorner: [
    'Keep this area completely free of clutter',
    'No heavy furniture',
    'No toilets or kitchens',
  ],
};

export const KEY_TIPS: string[] = [
  'Remove broken items: Promptly discard broken clocks, mirrors, and pottery.',
  'Fix leaky taps: Repair leaks immediately as they symbolize financial loss.',
  'Declutter: Keep the home free of cobwebs and unnecessary items.',
];

export interface QuickDirectionalRemedy {
  problemArea: string;
  remedy: string;
}

export const QUICK_DIRECTIONAL_TABLE: QuickDirectionalRemedy[] = [
  {
    problemArea: 'Kitchen in Northeast',
    remedy:
      'Place bronze bowls upside down on the ceiling or use a red light bulb at night to introduce "fire" energy.',
  },
  {
    problemArea: 'Toilet in Northeast',
    remedy:
      'Keep a bowl of sea salt inside (replace weekly) and keep the door closed at all times.',
  },
  {
    problemArea: 'Mirror Facing Bed',
    remedy:
      'Cover the mirror at night or relocate it to prevent energy drain and relationship issues.',
  },
  {
    problemArea: 'Leaking Taps',
    remedy:
      'Repair immediately, as they symbolize the "drainage" of wealth and health.',
  },
];

/** Additional core remedies from extended documentation */
export const CORE_ADDITIONAL_REMEDIES: TopRemedy[] = [
  {
    name: 'Sea Salt Cleansing (extended)',
    description:
      'Placing bowls of uncrushed sea salt in corners, especially in the northeast, absorbs and neutralises negative energy. Mixing it in mopping water once a week further purifies the space.',
  },
  {
    name: 'Strategic Mirror Placement',
    description:
      'Mirrors are used to "expand" missing corners or redirect energy flow. Place on north or east walls—never reflect the bed or the main door.',
  },
  {
    name: 'Water Features',
    description:
      'A small fountain or aquarium in the north or northeast direction stimulates the flow of wealth and opportunities.',
  },
  {
    name: 'Aromatic Purification',
    description:
      'Regularly burning camphor or lighting a ghee diya in the evening (ideally in the northeast) cleanses the air of negative vibrations and promotes mental peace.',
  },
  {
    name: 'Sound Therapy',
    description:
      'Hanging metal wind chimes with 6 or 8 rods near entrances or windows helps break stagnant energy and attract helpful people.',
  },
  {
    name: 'Metallic Tools',
    description:
      'Specialized items like Copper Helixes (for the southeast) or Lead Helixes (for the southwest) are used to rectify specific directional defects.',
  },
];
