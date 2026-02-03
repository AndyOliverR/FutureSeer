// Energy Healing Data Structures and Knowledge Base
// Comprehensive data for all healing methods: Chakra, Aura, Reiki, Crystal, Energy Balancing

// ============================================================================
// CHAKRA DATA - Seven Main Energy Centers
// ============================================================================

export interface ChakraData {
  name: string;
  sanskritName: string;
  color: string;
  location: string;
  element: string;
  governingAreas: string[];
  signsOfBalance: string[];
  signsOfImbalance: string[];
  associatedCrystals: string[];
  mantras: string[];
  affirmations: string[];
  frequency?: string; // Hz frequency
}

export const CHAKRA_DATA: Record<string, ChakraData> = {
  root: {
    name: 'Root Chakra',
    sanskritName: 'Muladhara',
    color: '#DC143C', // Red
    location: 'Base of spine',
    element: 'Earth',
    governingAreas: ['Survival', 'Grounding', 'Security', 'Stability', 'Physical health'],
    signsOfBalance: ['Feeling secure', 'Grounded', 'Stable', 'Confident', 'Physically healthy'],
    signsOfImbalance: ['Anxiety', 'Fear', 'Insecurity', 'Financial worries', 'Feeling disconnected'],
    associatedCrystals: ['Red Jasper', 'Garnet', 'Hematite', 'Black Tourmaline', 'Smoky Quartz'],
    mantras: ['LAM', 'I am grounded', 'I am safe'],
    affirmations: ['I am safe and secure', 'I am grounded in my body', 'I trust in life'],
    frequency: '396 Hz'
  },
  sacral: {
    name: 'Sacral Chakra',
    sanskritName: 'Svadhisthana',
    color: '#FF8C00', // Orange
    location: 'Lower abdomen',
    element: 'Water',
    governingAreas: ['Creativity', 'Sexuality', 'Emotions', 'Pleasure', 'Relationships'],
    signsOfBalance: ['Creative', 'Emotionally balanced', 'Passionate', 'Joyful', 'Open to pleasure'],
    signsOfImbalance: ['Emotional instability', 'Lack of creativity', 'Sexual issues', 'Guilt', 'Addiction'],
    associatedCrystals: ['Carnelian', 'Orange Calcite', 'Amber', 'Tiger\'s Eye', 'Moonstone'],
    mantras: ['VAM', 'I feel', 'I create'],
    affirmations: ['I am creative', 'I embrace my emotions', 'I am passionate about life'],
    frequency: '417 Hz'
  },
  solarPlexus: {
    name: 'Solar Plexus Chakra',
    sanskritName: 'Manipura',
    color: '#FFD700', // Yellow/Gold
    location: 'Upper abdomen',
    element: 'Fire',
    governingAreas: ['Personal power', 'Confidence', 'Self-esteem', 'Willpower', 'Digestion'],
    signsOfBalance: ['Confident', 'Self-assured', 'Personal power', 'Good digestion', 'Leadership'],
    signsOfImbalance: ['Low self-esteem', 'Lack of confidence', 'Digestive issues', 'Control issues', 'Anger'],
    associatedCrystals: ['Citrine', 'Yellow Jasper', 'Tiger\'s Eye', 'Pyrite', 'Amber'],
    mantras: ['RAM', 'I can', 'I will'],
    affirmations: ['I am confident', 'I have personal power', 'I am worthy'],
    frequency: '528 Hz'
  },
  heart: {
    name: 'Heart Chakra',
    sanskritName: 'Anahata',
    color: '#00FF00', // Green
    location: 'Center of chest',
    element: 'Air',
    governingAreas: ['Love', 'Compassion', 'Forgiveness', 'Relationships', 'Healing'],
    signsOfBalance: ['Loving', 'Compassionate', 'Forgiving', 'Open-hearted', 'Empathetic'],
    signsOfImbalance: ['Difficulty loving', 'Heartbreak', 'Jealousy', 'Loneliness', 'Bitterness'],
    associatedCrystals: ['Rose Quartz', 'Green Aventurine', 'Emerald', 'Jade', 'Rhodonite'],
    mantras: ['YAM', 'I love', 'I forgive'],
    affirmations: ['I am open to love', 'I forgive myself and others', 'I am compassionate'],
    frequency: '639 Hz'
  },
  throat: {
    name: 'Throat Chakra',
    sanskritName: 'Vishuddha',
    color: '#1E90FF', // Blue
    location: 'Throat',
    element: 'Ether/Space',
    governingAreas: ['Communication', 'Expression', 'Truth', 'Voice', 'Listening'],
    signsOfBalance: ['Clear communication', 'Expressive', 'Honest', 'Good listener', 'Creative expression'],
    signsOfImbalance: ['Difficulty expressing', 'Fear of speaking', 'Throat issues', 'Lying', 'Gossiping'],
    associatedCrystals: ['Blue Lace Agate', 'Aquamarine', 'Sodalite', 'Lapis Lazuli', 'Turquoise'],
    mantras: ['HAM', 'I speak', 'I express'],
    affirmations: ['I express my truth', 'I communicate clearly', 'My voice matters'],
    frequency: '741 Hz'
  },
  thirdEye: {
    name: 'Third Eye Chakra',
    sanskritName: 'Ajna',
    color: '#4B0082', // Indigo
    location: 'Forehead, between eyebrows',
    element: 'Light',
    governingAreas: ['Intuition', 'Insight', 'Imagination', 'Wisdom', 'Perception'],
    signsOfBalance: ['Intuitive', 'Insightful', 'Imaginative', 'Wise', 'Clear vision'],
    signsOfImbalance: ['Poor intuition', 'Headaches', 'Lack of clarity', 'Overthinking', 'Nightmares'],
    associatedCrystals: ['Amethyst', 'Lapis Lazuli', 'Clear Quartz', 'Sodalite', 'Fluorite'],
    mantras: ['OM', 'AUM', 'I see'],
    affirmations: ['I trust my intuition', 'I see clearly', 'I am wise'],
    frequency: '852 Hz'
  },
  crown: {
    name: 'Crown Chakra',
    sanskritName: 'Sahasrara',
    color: '#9370DB', // Violet/Purple
    location: 'Top of head',
    element: 'Thought',
    governingAreas: ['Spirituality', 'Divine connection', 'Enlightenment', 'Consciousness', 'Transcendence'],
    signsOfBalance: ['Spiritual connection', 'Enlightened', 'Open-minded', 'Connected to divine', 'Peaceful'],
    signsOfImbalance: ['Spiritual disconnection', 'Closed-minded', 'Depression', 'Confusion', 'Existential crisis'],
    associatedCrystals: ['Clear Quartz', 'Amethyst', 'Selenite', 'Diamond', 'Labradorite'],
    mantras: ['OM', 'AH', 'I am one'],
    affirmations: ['I am connected to the divine', 'I am open to guidance', 'I am at peace'],
    frequency: '963 Hz'
  }
};

// ============================================================================
// AURA LAYERS DATA
// ============================================================================

export interface AuraLayer {
  name: string;
  distance: string; // Distance from body
  colorMeanings: Record<string, string>;
  thicknessMeanings: { thin: string; medium: string; thick: string };
  clarityMeanings: { clear: string; cloudy: string; vibrant: string };
}

export const AURA_LAYERS: AuraLayer[] = [
  {
    name: 'Physical Layer',
    distance: '0-2 inches',
    colorMeanings: {
      red: 'Physical vitality, passion, anger',
      orange: 'Energy, creativity, joy',
      yellow: 'Optimism, intellect, nervousness',
      green: 'Healing, growth, balance',
      blue: 'Calm, communication, truth',
      purple: 'Spirituality, intuition, mysticism',
      white: 'Purity, clarity, protection',
      gray: 'Depression, fatigue, illness',
      black: 'Protection, blocked energy, trauma'
    },
    thicknessMeanings: {
      thin: 'Low physical energy, need for rest',
      medium: 'Balanced physical energy',
      thick: 'Strong physical vitality'
    },
    clarityMeanings: {
      clear: 'Healthy energy flow',
      cloudy: 'Energy blockages or illness',
      vibrant: 'Excellent health and vitality'
    }
  },
  {
    name: 'Etheric Layer',
    distance: '2-4 inches',
    colorMeanings: {
      blue: 'Calm, peaceful energy',
      gray: 'Low energy, fatigue',
      green: 'Healing energy',
      yellow: 'Mental activity',
      red: 'Physical energy'
    },
    thicknessMeanings: {
      thin: 'Weak etheric body',
      medium: 'Normal etheric field',
      thick: 'Strong etheric protection'
    },
    clarityMeanings: {
      clear: 'Clear energy channels',
      cloudy: 'Energy blockages',
      vibrant: 'Excellent energy flow'
    }
  },
  {
    name: 'Emotional Layer',
    distance: '4-8 inches',
    colorMeanings: {
      pink: 'Love, compassion, romance',
      red: 'Passion, anger, intense emotions',
      orange: 'Joy, creativity, enthusiasm',
      yellow: 'Happiness, optimism',
      blue: 'Peace, calm, sadness',
      green: 'Jealousy, growth, healing',
      purple: 'Spiritual emotions, mysticism',
      brown: 'Suppressed emotions',
      gray: 'Depression, emotional fatigue'
    },
    thicknessMeanings: {
      thin: 'Difficulty expressing emotions',
      medium: 'Balanced emotional expression',
      thick: 'Intense emotional energy'
    },
    clarityMeanings: {
      clear: 'Clear emotional state',
      cloudy: 'Emotional confusion',
      vibrant: 'Strong emotional energy'
    }
  },
  {
    name: 'Mental Layer',
    distance: '8-12 inches',
    colorMeanings: {
      yellow: 'Intellectual activity, learning',
      blue: 'Clear thinking, communication',
      green: 'Open-mindedness, growth',
      orange: 'Creative thinking',
      purple: 'Intuitive thoughts, wisdom',
      gray: 'Mental fatigue, confusion',
      brown: 'Rigid thinking'
    },
    thicknessMeanings: {
      thin: 'Difficulty concentrating',
      medium: 'Balanced mental activity',
      thick: 'Strong mental energy'
    },
    clarityMeanings: {
      clear: 'Clear thoughts',
      cloudy: 'Mental confusion',
      vibrant: 'Sharp mental clarity'
    }
  }
];

// ============================================================================
// REIKI SYMBOLS DATA
// ============================================================================

export interface ReikiSymbol {
  name: string;
  japaneseName: string;
  meaning: string;
  purpose: string;
  usage: string[];
  visualization: string;
  placement: string;
}

export const REIKI_SYMBOLS: ReikiSymbol[] = [
  {
    name: 'Power Symbol',
    japaneseName: 'Cho Ku Rei',
    meaning: 'Place the power of the universe here',
    purpose: 'Increase power, focus energy, protection',
    usage: ['Beginning of treatment', 'Strengthening energy', 'Protection', 'Clearing'],
    visualization: 'Spiral starting from center, going clockwise',
    placement: 'Hands, body, or symbols'
  },
  {
    name: 'Mental/Emotional Symbol',
    japaneseName: 'Sei He Ki',
    meaning: 'God and humanity become one',
    purpose: 'Mental and emotional healing, harmony',
    usage: ['Emotional healing', 'Mental clarity', 'Breaking habits', 'Relationship healing'],
    visualization: 'Circle with zigzag flowing down',
    placement: 'Head, heart, or emotional areas'
  },
  {
    name: 'Distance Symbol',
    japaneseName: 'Hon Sha Ze Sho Nen',
    meaning: 'No past, no present, no future',
    purpose: 'Distance healing, time healing, past issues',
    usage: ['Distance healing', 'Past trauma healing', 'Connecting across time'],
    visualization: 'Complex symbol with flowing lines',
    placement: 'Visualized or drawn for distance work'
  },
  {
    name: 'Master Symbol',
    japaneseName: 'Dai Ko Myo',
    meaning: 'Great bright light',
    purpose: 'Master level healing, enlightenment, spiritual connection',
    usage: ['Master level healing', 'Spiritual connection', 'Enlightenment', 'Deep healing'],
    visualization: 'Radiant symbol with flowing energy',
    placement: 'Top of head, spiritual centers'
  }
];

// ============================================================================
// CRYSTAL HEALING DATA
// ============================================================================

export interface CrystalData {
  name: string;
  color: string;
  chakraAssociation: string[];
  properties: string[];
  healingUses: string[];
  howToUse: string[];
  metaphysicalProperties: string;
}

export const CRYSTAL_DATABASE: Record<string, CrystalData> = {
  'Clear Quartz': {
    name: 'Clear Quartz',
    color: 'Clear/White',
    chakraAssociation: ['All Chakras', 'Crown'],
    properties: ['Amplification', 'Clarity', 'Focus', 'Healing'],
    healingUses: ['Amplify other crystals', 'Mental clarity', 'Energy clearing', 'Spiritual connection'],
    howToUse: ['Meditate with', 'Place on chakras', 'Carry as pocket stone', 'Use in grids'],
    metaphysicalProperties: 'Master healer, amplifies energy, brings clarity and healing'
  },
  'Amethyst': {
    name: 'Amethyst',
    color: 'Purple',
    chakraAssociation: ['Crown', 'Third Eye'],
    properties: ['Protection', 'Intuition', 'Calm', 'Spiritual growth'],
    healingUses: ['Stress relief', 'Intuition enhancement', 'Sleep aid', 'Spiritual protection'],
    howToUse: ['Place under pillow', 'Wear as jewelry', 'Meditate with', 'Place on third eye'],
    metaphysicalProperties: 'Protects from negative energy, enhances intuition, promotes calm'
  },
  'Rose Quartz': {
    name: 'Rose Quartz',
    color: 'Pink',
    chakraAssociation: ['Heart'],
    properties: ['Love', 'Compassion', 'Forgiveness', 'Relationships'],
    healingUses: ['Heart healing', 'Love attraction', 'Self-love', 'Relationship healing'],
    howToUse: ['Wear as jewelry', 'Place on heart', 'Carry close to heart', 'Use in love rituals'],
    metaphysicalProperties: 'Opens heart chakra, attracts love, promotes self-love and compassion'
  },
  'Citrine': {
    name: 'Citrine',
    color: 'Yellow/Gold',
    chakraAssociation: ['Solar Plexus'],
    properties: ['Abundance', 'Confidence', 'Joy', 'Success'],
    healingUses: ['Manifestation', 'Confidence building', 'Abundance attraction', 'Positive energy'],
    howToUse: ['Place in wealth corner', 'Carry in wallet', 'Wear as jewelry', 'Meditate with'],
    metaphysicalProperties: 'Attracts abundance, boosts confidence, brings joy and success'
  },
  'Black Tourmaline': {
    name: 'Black Tourmaline',
    color: 'Black',
    chakraAssociation: ['Root'],
    properties: ['Protection', 'Grounding', 'Negativity clearing', 'Shielding'],
    healingUses: ['Protection from negative energy', 'Grounding', 'Energy clearing', 'Shielding'],
    howToUse: ['Place at entryways', 'Carry as pocket stone', 'Wear as jewelry', 'Place near electronics'],
    metaphysicalProperties: 'Strong protection stone, grounds energy, clears negativity'
  },
  'Carnelian': {
    name: 'Carnelian',
    color: 'Orange',
    chakraAssociation: ['Sacral'],
    properties: ['Courage', 'Creativity', 'Passion', 'Vitality'],
    healingUses: ['Creative blocks', 'Courage building', 'Passion enhancement', 'Vitality boost'],
    howToUse: ['Carry as pocket stone', 'Wear as jewelry', 'Place on sacral chakra', 'Use in creative spaces'],
    metaphysicalProperties: 'Boosts creativity, increases courage, enhances passion and vitality'
  },
  'Selenite': {
    name: 'Selenite',
    color: 'White',
    chakraAssociation: ['Crown'],
    properties: ['Clearing', 'Protection', 'Peace', 'Spiritual connection'],
    healingUses: ['Energy clearing', 'Space clearing', 'Peaceful energy', 'Spiritual connection'],
    howToUse: ['Place in room for clearing', 'Wave over body', 'Meditate with', 'Place on crown'],
    metaphysicalProperties: 'Clears negative energy, brings peace, enhances spiritual connection'
  },
  'Lapis Lazuli': {
    name: 'Lapis Lazuli',
    color: 'Blue',
    chakraAssociation: ['Throat', 'Third Eye'],
    properties: ['Communication', 'Truth', 'Wisdom', 'Self-expression'],
    healingUses: ['Communication enhancement', 'Truth speaking', 'Wisdom seeking', 'Throat healing'],
    howToUse: ['Wear as necklace', 'Place on throat', 'Carry as pocket stone', 'Meditate with'],
    metaphysicalProperties: 'Enhances communication, promotes truth, brings wisdom'
  },
  'Jade': {
    name: 'Jade',
    color: 'Green',
    chakraAssociation: ['Heart'],
    properties: ['Luck', 'Prosperity', 'Harmony', 'Balance'],
    healingUses: ['Luck attraction', 'Prosperity', 'Harmony enhancement', 'Balance'],
    howToUse: ['Wear as jewelry', 'Carry as pocket stone', 'Place in wealth areas', 'Meditate with'],
    metaphysicalProperties: 'Attracts luck and prosperity, brings harmony and balance'
  },
  'Tiger\'s Eye': {
    name: 'Tiger\'s Eye',
    color: 'Brown/Gold',
    chakraAssociation: ['Solar Plexus', 'Root'],
    properties: ['Protection', 'Courage', 'Confidence', 'Grounding'],
    healingUses: ['Protection', 'Courage building', 'Confidence enhancement', 'Grounding'],
    howToUse: ['Wear as jewelry', 'Carry as pocket stone', 'Place on solar plexus', 'Use for protection'],
    metaphysicalProperties: 'Protects from negative energy, builds courage and confidence'
  }
};

// ============================================================================
// ENERGY BALANCING TECHNIQUES
// ============================================================================

export interface EnergyBalancingTechnique {
  name: string;
  description: string;
  steps: string[];
  benefits: string[];
  duration: string;
}

export const ENERGY_BALANCING_TECHNIQUES: EnergyBalancingTechnique[] = [
  {
    name: 'Grounding Meditation',
    description: 'Connect with earth energy to balance root chakra',
    steps: [
      'Sit or stand comfortably',
      'Visualize roots growing from your feet into the earth',
      'Feel earth energy flowing up through your roots',
      'Breathe deeply and feel grounded',
      'Hold for 5-10 minutes'
    ],
    benefits: ['Stability', 'Security', 'Reduced anxiety', 'Physical balance'],
    duration: '5-10 minutes'
  },
  {
    name: 'Chakra Balancing Visualization',
    description: 'Visualize and balance all seven chakras',
    steps: [
      'Close your eyes and relax',
      'Visualize each chakra from root to crown',
      'See each chakra spinning and glowing',
      'Balance any chakras that appear dim or off',
      'Visualize energy flowing smoothly between chakras'
    ],
    benefits: ['Overall balance', 'Energy flow', 'Wellness', 'Harmony'],
    duration: '10-15 minutes'
  },
  {
    name: 'Breath Work',
    description: 'Use breathing to balance energy',
    steps: [
      'Sit comfortably',
      'Inhale for 4 counts',
      'Hold for 4 counts',
      'Exhale for 4 counts',
      'Hold for 4 counts',
      'Repeat 10-15 times'
    ],
    benefits: ['Calm', 'Balance', 'Focus', 'Energy regulation'],
    duration: '5-10 minutes'
  },
  {
    name: 'Crystal Grid Balancing',
    description: 'Use crystals in a grid pattern for energy balancing',
    steps: [
      'Choose crystals for each chakra',
      'Place crystals in a circle around you',
      'Sit in the center',
      'Visualize energy flowing through the grid',
      'Meditate for 15-20 minutes'
    ],
    benefits: ['Chakra balance', 'Protection', 'Amplified energy', 'Healing'],
    duration: '15-20 minutes'
  }
];

export default {
  CHAKRA_DATA,
  AURA_LAYERS,
  REIKI_SYMBOLS,
  CRYSTAL_DATABASE,
  ENERGY_BALANCING_TECHNIQUES
};
