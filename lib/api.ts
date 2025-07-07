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
export const getAstroData = async (dateOfBirth: string, location: string) => {
  try {
    const response = await fetch(`https://api.astroapp.com/v1/natal-chart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ASTROAPP_API_KEY}`,
      },
      body: JSON.stringify({
        date_of_birth: dateOfBirth,
        location: location,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch astro data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching astro data:', error);
    // Return mock data for development
    return {
      sun_sign: 'Aries',
      moon_sign: 'Cancer',
      rising_sign: 'Libra',
      planets: {
        sun: { sign: 'Aries', degree: 15, house: 1 },
        moon: { sign: 'Cancer', degree: 8, house: 4 },
        mercury: { sign: 'Pisces', degree: 28, house: 12 },
        venus: { sign: 'Aquarius', degree: 22, house: 11 },
        mars: { sign: 'Taurus', degree: 5, house: 2 },
        jupiter: { sign: 'Sagittarius', degree: 18, house: 9 },
        saturn: { sign: 'Capricorn', degree: 12, house: 10 },
        uranus: { sign: 'Aquarius', degree: 8, house: 11 },
        neptune: { sign: 'Pisces', degree: 25, house: 12 },
        pluto: { sign: 'Capricorn', degree: 20, house: 10 },
      },
      houses: Array.from({ length: 12 }, (_, i) => ({
        house: i + 1,
        sign: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][i],
        degree: Math.floor(Math.random() * 30),
      })),
    };
  }
};

// Stability AI for symbolic backgrounds
export const generateSymbolicBackground = async (symbol: string, style: string = 'mystical') => {
  try {
    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STABILITY_API_KEY}`,
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: `${symbol} ${style} mystical background, grayscale, minimalist, sacred geometry, ethereal, spiritual`,
            weight: 1,
          },
        ],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 30,
        style_preset: 'cinematic',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate symbolic background');
    }

    const result = await response.json();
    return result.artifacts[0].base64;
  } catch (error) {
    console.error('Error generating symbolic background:', error);
    // Return placeholder for development
    return null;
  }
};

// OpenAI for AI predictions and summaries
export const generateAIPrediction = async (question: string, astroData: any, symbolicData: any) => {
  try {
    const prompt = `
You are FutureSeer, a mystical AI oracle that combines ancient wisdom with modern insights.

Question: "${question}"

Astrological Context:
- Sun Sign: ${astroData.sun_sign}
- Moon Sign: ${astroData.moon_sign}
- Rising Sign: ${astroData.rising_sign}

Symbolic Elements: ${JSON.stringify(symbolicData)}

Please provide:
1. A mystical yet grounded interpretation (2-3 sentences)
2. Key themes and patterns to watch for
3. Timing insights based on astrological cycles
4. Practical guidance for the querent

Keep the tone sacred, wise, and empowering. Avoid negative predictions, focus on growth and potential.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are FutureSeer, a mystical AI oracle that provides wise, empowering guidance combining ancient wisdom with modern insights.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating AI prediction:', error);
    return 'The stars whisper of great potential ahead. Trust in your journey and remain open to the signs around you.';
  }
};

// PostHog analytics
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    posthog.capture(eventName, properties);
  }
};

export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    posthog.identify(userId, properties);
  }
};

// Symbolic data mapping
export const getSymbolicData = (question: string, astroData: any) => {
  const keywords = question.toLowerCase().split(' ');
  const symbolicElements: {
    elements: string[];
    numbers: number[];
    colors: string[];
    directions: string[];
    animals: string[];
    crystals: string[];
  } = {
    elements: [],
    numbers: [],
    colors: [],
    directions: [],
    animals: [],
    crystals: [],
  };

  // Element mapping based on astrological signs
  const elementMap = {
    fire: ['aries', 'leo', 'sagittarius'],
    earth: ['taurus', 'virgo', 'capricorn'],
    air: ['gemini', 'libra', 'aquarius'],
    water: ['cancer', 'scorpio', 'pisces'],
  };

  // Add elements based on user's signs
  Object.entries(elementMap).forEach(([element, signs]) => {
    if (signs.includes(astroData.sun_sign.toLowerCase())) {
      symbolicElements.elements.push(element);
    }
  });

  // Number mapping based on question keywords
  const numberKeywords = {
    '1': ['first', 'one', 'single', 'beginning'],
    '2': ['two', 'second', 'pair', 'balance'],
    '3': ['three', 'third', 'trinity', 'growth'],
    '4': ['four', 'fourth', 'foundation', 'stability'],
    '5': ['five', 'fifth', 'change', 'freedom'],
    '6': ['six', 'sixth', 'harmony', 'love'],
    '7': ['seven', 'seventh', 'spiritual', 'mystery'],
    '8': ['eight', 'eighth', 'power', 'abundance'],
    '9': ['nine', 'ninth', 'completion', 'wisdom'],
  };

  Object.entries(numberKeywords).forEach(([number, words]) => {
    if (words.some(word => keywords.includes(word))) {
      symbolicElements.numbers.push(parseInt(number));
    }
  });

  // Color mapping
  const colorMap = {
    red: ['passion', 'energy', 'action', 'courage'],
    blue: ['peace', 'wisdom', 'communication', 'trust'],
    green: ['growth', 'nature', 'healing', 'prosperity'],
    yellow: ['joy', 'intellect', 'optimism', 'clarity'],
    purple: ['spirituality', 'mystery', 'royalty', 'transformation'],
    orange: ['creativity', 'enthusiasm', 'adventure', 'confidence'],
  };

  Object.entries(colorMap).forEach(([color, words]) => {
    if (words.some(word => keywords.includes(word))) {
      symbolicElements.colors.push(color);
    }
  });

  return symbolicElements;
};

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