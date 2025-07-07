import OpenAI from 'openai';
import posthog from 'posthog-js';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Initialize PostHog
if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || '', {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.debug();
    },
  });
}

// AstroApp API functions
export async function getAstroData(birthDate: string, birthPlace: string) {
  try {
    const response = await fetch('/api/astroapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        birthDate,
        birthPlace,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch astrological data')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching astro data:', error)
    // Return fallback data
    return {
      sun_sign: 'Unknown',
      moon_sign: 'Unknown',
      rising_sign: 'Unknown',
      planets: {},
      houses: {},
    }
  }
}

// Stability AI for symbolic backgrounds
export async function generateSymbolicImage(prompt: string) {
  try {
    const response = await fetch('/api/stability', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to generate image')
    }

    const data = await response.json()
    return data.imageUrl
  } catch (error) {
    console.error('Error generating image:', error)
    return null
  }
}

// OpenAI for AI predictions and summaries
export async function generateAIPrediction(question: string, astroData: any, symbolicData: any) {
  try {
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        astroData,
        symbolicData,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to generate prediction')
    }

    const data = await response.json()
    return data.prediction
  } catch (error) {
    console.error('Error generating prediction:', error)
    return 'Unable to generate prediction at this time. Please try again later.'
  }
}

// PostHog analytics
export async function trackEvent(event: string, userId: string, properties?: any) {
  try {
    await fetch('/api/posthog', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event,
        userId,
        properties,
      }),
    })
  } catch (error) {
    console.error('Error tracking event:', error)
  }
}

export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    posthog.identify(userId, properties);
  }
};

// Symbolic data mapping
export function getSymbolicData(question: string, astroData: any) {
  // This function generates symbolic data based on the question and astrological context
  const symbols = [
    '🌙 Moon', '☀️ Sun', '⭐ Star', '🔮 Crystal', '🌸 Flower', '🌊 Water',
    '🔥 Fire', '🌍 Earth', '💎 Diamond', '🦋 Butterfly', '🐉 Dragon', '🦅 Eagle'
  ]
  
  const randomSymbols = symbols
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)
  
  return {
    primarySymbol: randomSymbols[0],
    secondarySymbols: randomSymbols.slice(1),
    elementalInfluence: ['Fire', 'Water', 'Earth', 'Air'][Math.floor(Math.random() * 4)],
    cosmicAlignment: ['Harmonious', 'Challenging', 'Transformative', 'Balanced'][Math.floor(Math.random() * 4)],
    timing: ['Immediate', 'Within a week', 'Within a month', 'Within a year'][Math.floor(Math.random() * 4)],
  }
}

// Remedy suggestions
export const getRemedies = (symbolicData: any, question: string) => {
  const remedies = [];

  // Mudras based on elements
  if (symbolicData.elements.includes('fire')) {
    remedies.push({
      type: 'mudra',
      name: 'Agni Mudra',
      description: 'Fire element mudra for energy and transformation',
      instruction: 'Join the tips of ring finger and thumb, keep other fingers straight',
    });
  }

  if (symbolicData.elements.includes('water')) {
    remedies.push({
      type: 'mudra',
      name: 'Varun Mudra',
      description: 'Water element mudra for emotional balance',
      instruction: 'Join the tips of little finger and thumb, keep other fingers straight',
    });
  }

  // Crystals based on colors
  symbolicData.colors.forEach((color: string) => {
    const crystalMap = {
      red: { name: 'Red Jasper', properties: 'Grounding and protection' },
      blue: { name: 'Lapis Lazuli', properties: 'Wisdom and communication' },
      green: { name: 'Green Aventurine', properties: 'Growth and abundance' },
      yellow: { name: 'Citrine', properties: 'Joy and manifestation' },
      purple: { name: 'Amethyst', properties: 'Spirituality and peace' },
      orange: { name: 'Carnelian', properties: 'Creativity and courage' },
    };

    if (crystalMap[color as keyof typeof crystalMap]) {
      remedies.push({
        type: 'crystal',
        name: crystalMap[color as keyof typeof crystalMap].name,
        properties: crystalMap[color as keyof typeof crystalMap].properties,
        usage: 'Carry or meditate with this crystal daily',
      });
    }
  });

  // Mantras based on numbers
  if (symbolicData.numbers.includes(7)) {
    remedies.push({
      type: 'mantra',
      name: 'Om Namah Shivaya',
      description: 'Sacred mantra for spiritual awakening',
      instruction: 'Chant 108 times daily for spiritual growth',
    });
  }

  return remedies;
};
