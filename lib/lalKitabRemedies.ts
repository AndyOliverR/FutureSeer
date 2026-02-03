// LAL KITAB REMEDY DATABASE
// Simple, practical remedies based on Lal Kitab (Red Book) system
// These are easy-to-perform daily actions that help balance planetary influences

export interface LalKitabRemedy {
  id: string
  planet: string
  title: string
  description: string
  instructions: string[]
  materials?: string[]
  timing: {
    day?: string
    time?: string
    frequency: string
  }
  cost: 'free' | 'low' | 'medium' | 'high'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  benefits: string[]
  contraindications?: string[]
}

// Planetary remedy mappings
export const LAL_KITAB_REMEDIES: Record<string, LalKitabRemedy[]> = {
  sun: [
    {
      id: 'sun_1',
      planet: 'Sun',
      title: 'Copper Coin Remedy',
      description: 'Place copper coins in running water to strengthen Sun',
      instructions: [
        'Take 7 copper coins',
        'Go to a flowing river or stream',
        'Throw coins one by one into the water',
        'Recite "Om Suryaya Namah" while throwing each coin',
        'Perform on Sunday during sunrise hours (6-8 AM)'
      ],
      materials: ['7 copper coins'],
      timing: {
        day: 'Sunday',
        time: 'Sunrise (6-8 AM)',
        frequency: 'Once a week for 7 weeks'
      },
      cost: 'low',
      difficulty: 'beginner',
      benefits: ['Strengthens Sun', 'Improves confidence', 'Enhances leadership', 'Better health']
    },
    {
      id: 'sun_2',
      planet: 'Sun',
      title: 'Wheat Donation',
      description: 'Donate wheat to strengthen Sun and improve health',
      instructions: [
        'Take 1 kg of wheat',
        'Donate to a temple or needy person on Sunday',
        'Do this during morning hours',
        'Recite "Om Suryaya Namah" 11 times before donation'
      ],
      materials: ['1 kg wheat'],
      timing: {
        day: 'Sunday',
        time: 'Morning (8-10 AM)',
        frequency: 'Every Sunday for 11 weeks'
      },
      cost: 'low',
      difficulty: 'beginner',
      benefits: ['Strengthens Sun', 'Improves health', 'Increases vitality', 'Better eyesight']
    },
    {
      id: 'sun_3',
      planet: 'Sun',
      title: 'Red Cloth Remedy',
      description: 'Keep red cloth in home to balance Sun energy',
      instructions: [
        'Take a red cloth (cotton or silk)',
        'Place it in the northeast corner of your home',
        'Keep it clean and undisturbed',
        'Replace annually if needed'
      ],
      materials: ['Red cloth (1 meter)'],
      timing: {
        day: 'Sunday',
        time: 'Any time',
        frequency: 'Permanent placement'
      },
      cost: 'low',
      difficulty: 'beginner',
      benefits: ['Balances Sun energy', 'Improves home atmosphere', 'Enhances positivity']
    }
  ],

  moon: [
    {
      id: 'moon_1',
      planet: 'Moon',
      title: 'Milk Donation',
      description: 'Donate milk to strengthen Moon and improve emotional balance',
      instructions: [
        'Take 1 liter of fresh milk',
        'Donate to a temple or feed to a white cow on Monday',
        'Perform during evening hours (6-8 PM)',
        'Recite "Om Chandramase Namah" 11 times'
      ],
      materials: ['1 liter fresh milk'],
      timing: {
        day: 'Monday',
        time: 'Evening (6-8 PM)',
        frequency: 'Every Monday for 11 weeks'
      },
      cost: 'low',
      difficulty: 'beginner',
      benefits: ['Strengthens Moon', 'Emotional balance', 'Better sleep', 'Improved relationships']
    },
    {
      id: 'moon_2',
      planet: 'Moon',
      title: 'Silver Coin Remedy',
      description: 'Throw silver coins in running water to balance Moon',
      instructions: [
        'Take 11 silver coins or silver items',
        'Go to a flowing river or stream',
        'Throw coins into the water on Monday',
        'Recite "Om Chandramase Namah" while throwing',
        'Perform during evening hours'
      ],
      materials: ['11 silver coins or small silver items'],
      timing: {
        day: 'Monday',
        time: 'Evening (6-8 PM)',
        frequency: 'Once a week for 11 weeks'
      },
      cost: 'medium',
      difficulty: 'beginner',
      benefits: ['Balances Moon', 'Emotional stability', 'Better intuition', 'Peaceful mind']
    },
    {
      id: 'moon_3',
      planet: 'Moon',
      title: 'White Cloth Remedy',
      description: 'Keep white cloth in home to enhance Moon energy',
      instructions: [
        'Take a white cloth (cotton)',
        'Place it in the northwest corner of your home',
        'Keep it clean and white',
        'Wash monthly to maintain purity'
      ],
      materials: ['White cloth (1 meter)'],
      timing: {
        day: 'Monday',
        time: 'Any time',
        frequency: 'Permanent placement'
      },
      cost: 'low',
      difficulty: 'beginner',
      benefits: ['Enhances Moon energy', 'Emotional calm', 'Better sleep quality']
    }
  ],

  mars: [
    {
      id: 'mars_1',
      planet: 'Mars',
      title: 'Red Lentil Remedy',
      description: 'Donate red lentils to balance Mars and reduce anger',
      instructions: [
        'Take 1 kg of red lentils (masoor dal)',
        'Donate to a temple or needy person on Tuesday',
        'Perform during morning hours (8-10 AM)',
        'Recite "Om Mangalaya Namah" 11 times'
      ],
      materials: ['1 kg red lentils'],
      timing: {
        day: 'Tuesday',
        time: 'Morning (8-10 AM)',
        frequency: 'Every Tuesday for 11 weeks'
      },
      cost: 'low',
      difficulty: 'beginner',
      benefits: ['Balances Mars', 'Reduces anger', 'Better courage', 'Improved energy']
    },
    {
      id: 'mars_2',
      planet: 'Mars',
      title: 'Copper Coin in Running Water',
      description: 'Throw copper coins in water to strengthen Mars',
      instructions: [
        'Take 5 copper coins',
        'Go to a flowing river or stream',
        'Throw coins into the water on Tuesday',
        'Recite "Om Mangalaya Namah" while throwing',
        'Perform during morning hours'
      ],
      materials: ['5 copper coins'],
      timing: {
        day: 'Tuesday',
        time: 'Morning (8-10 AM)',
        frequency: 'Once a week for 5 weeks'
      },
      cost: 'low',
      difficulty: 'beginner',
      benefits: ['Strengthens Mars', 'Increases energy', 'Better physical strength', 'Courage']
    },
    {
      id: 'mars_3',
      planet: 'Mars',
      title: 'Red Cloth Under Bed',
      description: 'Keep red cloth under bed to balance Mars energy',
      instructions: [
        'Take a small red cloth',
        'Place it under your bed (mattress)',
        'Keep it clean and undisturbed',
        'Replace if it gets dirty'
      ],
      materials: ['Red cloth (small piece)'],
      timing: {
        day: 'Tuesday',
        time: 'Any time',
        frequency: 'Permanent placement'
      },
      cost: 'free',
      difficulty: 'beginner',
      benefits: ['Balances Mars energy', 'Reduces aggression', 'Better sleep', 'Calmer temperament']
    }
  ],

  mercury: [
    {
      id: 'mercury_1',
      planet: 'Mercury',
      title: 'Green Gram Donation',
      description: 'Donate green gram to strengthen Mercury and improve communication',
      instructions: [
        'Take 1 kg of green gram (moong dal)',
        'Donate to a temple or needy person on Wednesday',
        'Perform during morning hours (8-10 AM)',
        'Recite "Om Budhaya Namah" 11 times'
      ],
      materials: ['1 kg green gram'],
      timing: {
        day: 'Wednesday',
        time: 'Morning (8-10 AM)',
        frequency: 'Every Wednesday for 11 weeks'
      },
      cost: 'low',
      difficulty: 'beginner',
      benefits: ['Strengthens Mercury', 'Better communication', 'Improved intelligence', 'Business success']
    },
    {
      id: 'mercury_2',
      planet: 'Mercury',
      title: 'Green Cloth Remedy',
      description: 'Keep green cloth in home to enhance Mercury energy',
      instructions: [
        'Take a green cloth (cotton)',
        'Place it in the north direction of your home',
        'Keep it clean and undisturbed',
        'Replace annually if needed'
      ],
      materials: ['Green cloth (1 meter)'],
      timing: {
        day: 'Wednesday',
        time: 'Any time',
        frequency: 'Permanent placement'
      },
      cost: 'low',
      difficulty: 'beginner',
      benefits: ['Enhances Mercury energy', 'Better communication', 'Improved learning', 'Business growth']
    }
  ],

  jupiter: [
    {
      id: 'jupiter_1',
      planet: 'Jupiter',
      title: 'Yellow Gram Donation',
      description: 'Donate yellow gram to strengthen Jupiter and improve wisdom',
      instructions: [
        'Take 1 kg of yellow gram (chana dal)',
        'Donate to a temple or feed to a yellow cow on Thursday',
        'Perform during morning hours (8-10 AM)',
        'Recite "Om Brihaspataye Namah" 11 times'
      ],
      materials: ['1 kg yellow gram'],
      timing: {
        day: 'Thursday',
        time: 'Morning (8-10 AM)',
        frequency: 'Every Thursday for 11 weeks'
      },
      cost: 'low',
      difficulty: 'beginner',
      benefits: ['Strengthens Jupiter', 'Improves wisdom', 'Better education', 'Spiritual growth']
    },
    {
      id: 'jupiter_2',
      planet: 'Jupiter',
      title: 'Yellow Cloth Remedy',
      description: 'Keep yellow cloth in home to enhance Jupiter energy',
      instructions: [
        'Take a yellow cloth (cotton or silk)',
        'Place it in the northeast corner of your home',
        'Keep it clean and undisturbed',
        'Replace annually if needed'
      ],
      materials: ['Yellow cloth (1 meter)'],
      timing: {
        day: 'Thursday',
        time: 'Any time',
        frequency: 'Permanent placement'
      },
      cost: 'low',
      difficulty: 'beginner',
      benefits: ['Enhances Jupiter energy', 'Better wisdom', 'Improved fortune', 'Spiritual progress']
    },
    {
      id: 'jupiter_3',
      planet: 'Jupiter',
      title: 'Turmeric Donation',
      description: 'Donate turmeric to strengthen Jupiter',
      instructions: [
        'Take 250 grams of turmeric powder',
        'Donate to a temple on Thursday',
        'Perform during morning hours',
        'Recite "Om Brihaspataye Namah" 11 times'
      ],
      materials: ['250 grams turmeric powder'],
      timing: {
        day: 'Thursday',
        time: 'Morning (8-10 AM)',
        frequency: 'Every Thursday for 11 weeks'
      },
      cost: 'low',
      difficulty: 'beginner',
      benefits: ['Strengthens Jupiter', 'Better fortune', 'Improved knowledge', 'Spiritual benefits']
    }
  ],

  venus: [
    {
      id: 'venus_1',
      planet: 'Venus',
      title: 'White Gram Donation',
      description: 'Donate white gram to strengthen Venus and improve relationships',
      instructions: [
        'Take 1 kg of white gram (urad dal)',
        'Donate to a temple or needy person on Friday',
        'Perform during evening hours (6-8 PM)',
        'Recite "Om Shukraya Namah" 11 times'
      ],
      materials: ['1 kg white gram'],
      timing: {
        day: 'Friday',
        time: 'Evening (6-8 PM)',
        frequency: 'Every Friday for 11 weeks'
      },
      cost: 'low',
      difficulty: 'beginner',
      benefits: ['Strengthens Venus', 'Better relationships', 'Improved love life', 'Artistic talents']
    },
    {
      id: 'venus_2',
      planet: 'Venus',
      title: 'White Cloth Remedy',
      description: 'Keep white cloth in home to enhance Venus energy',
      instructions: [
        'Take a white cloth (cotton or silk)',
        'Place it in the southeast corner of your home',
        'Keep it clean and white',
        'Wash monthly to maintain purity'
      ],
      materials: ['White cloth (1 meter)'],
      timing: {
        day: 'Friday',
        time: 'Any time',
        frequency: 'Permanent placement'
      },
      cost: 'low',
      difficulty: 'beginner',
      benefits: ['Enhances Venus energy', 'Better relationships', 'Improved love life', 'Artistic growth']
    }
  ],

  saturn: [
    {
      id: 'saturn_1',
      planet: 'Saturn',
      title: 'Mustard Oil Remedy',
      description: 'Donate mustard oil to balance Saturn and reduce delays',
      instructions: [
        'Take 1 liter of mustard oil',
        'Donate to a temple or pour under a peepal tree on Saturday',
        'Perform during evening hours (6-8 PM)',
        'Recite "Om Shanaishcharaya Namah" 11 times'
      ],
      materials: ['1 liter mustard oil'],
      timing: {
        day: 'Saturday',
        time: 'Evening (6-8 PM)',
        frequency: 'Every Saturday for 11 weeks'
      },
      cost: 'low',
      difficulty: 'beginner',
      benefits: ['Balances Saturn', 'Reduces delays', 'Better discipline', 'Improved karma']
    },
    {
      id: 'saturn_2',
      planet: 'Saturn',
      title: 'Feed Crows',
      description: 'Feed crows to strengthen Saturn and improve karma',
      instructions: [
        'Take some food (rice, bread, or grains)',
        'Feed crows on Saturday',
        'Perform during morning hours (7-9 AM)',
        'Recite "Om Shanaishcharaya Namah" while feeding',
        'Do not harm or disturb the crows'
      ],
      materials: ['Food for crows (rice, bread, grains)'],
      timing: {
        day: 'Saturday',
        time: 'Morning (7-9 AM)',
        frequency: 'Every Saturday for 11 weeks'
      },
      cost: 'free',
      difficulty: 'beginner',
      benefits: ['Strengthens Saturn', 'Improves karma', 'Reduces obstacles', 'Better discipline']
    },
    {
      id: 'saturn_3',
      planet: 'Saturn',
      title: 'Black Cloth Remedy',
      description: 'Keep black cloth in home to balance Saturn energy',
      instructions: [
        'Take a black cloth (cotton)',
        'Place it in the southwest corner of your home',
        'Keep it clean and undisturbed',
        'Replace annually if needed'
      ],
      materials: ['Black cloth (1 meter)'],
      timing: {
        day: 'Saturday',
        time: 'Any time',
        frequency: 'Permanent placement'
      },
      cost: 'low',
      difficulty: 'beginner',
      benefits: ['Balances Saturn energy', 'Reduces obstacles', 'Better discipline', 'Improved karma']
    },
    {
      id: 'saturn_4',
      planet: 'Saturn',
      title: 'Iron Item Remedy',
      description: 'Donate iron items to strengthen Saturn',
      instructions: [
        'Take an iron item (nail, key, or small tool)',
        'Donate to a temple or throw in running water on Saturday',
        'Perform during evening hours',
        'Recite "Om Shanaishcharaya Namah" 11 times'
      ],
      materials: ['Iron item (nail, key, or small tool)'],
      timing: {
        day: 'Saturday',
        time: 'Evening (6-8 PM)',
        frequency: 'Once a week for 11 weeks'
      },
      cost: 'free',
      difficulty: 'beginner',
      benefits: ['Strengthens Saturn', 'Reduces delays', 'Better discipline', 'Improved karma']
    }
  ],

  rahu: [
    {
      id: 'rahu_1',
      planet: 'Rahu',
      title: 'Blue Cloth Remedy',
      description: 'Keep blue cloth in home to balance Rahu energy',
      instructions: [
        'Take a blue cloth (cotton)',
        'Place it in the southwest corner of your home',
        'Keep it clean and undisturbed',
        'Replace annually if needed'
      ],
      materials: ['Blue cloth (1 meter)'],
      timing: {
        day: 'Saturday',
        time: 'Any time',
        frequency: 'Permanent placement'
      },
      cost: 'low',
      difficulty: 'beginner',
      benefits: ['Balances Rahu energy', 'Reduces illusions', 'Better focus', 'Improved clarity']
    },
    {
      id: 'rahu_2',
      planet: 'Rahu',
      title: 'Donate Black Gram',
      description: 'Donate black gram to strengthen Rahu',
      instructions: [
        'Take 1 kg of black gram (urad dal)',
        'Donate to a temple or needy person on Saturday',
        'Perform during evening hours (6-8 PM)',
        'Recite "Om Rahave Namah" 11 times'
      ],
      materials: ['1 kg black gram'],
      timing: {
        day: 'Saturday',
        time: 'Evening (6-8 PM)',
        frequency: 'Every Saturday for 11 weeks'
      },
      cost: 'low',
      difficulty: 'beginner',
      benefits: ['Strengthens Rahu', 'Reduces illusions', 'Better focus', 'Improved clarity']
    }
  ],

  ketu: [
    {
      id: 'ketu_1',
      planet: 'Ketu',
      title: 'Brown Cloth Remedy',
      description: 'Keep brown cloth in home to balance Ketu energy',
      instructions: [
        'Take a brown cloth (cotton)',
        'Place it in the southwest corner of your home',
        'Keep it clean and undisturbed',
        'Replace annually if needed'
      ],
      materials: ['Brown cloth (1 meter)'],
      timing: {
        day: 'Tuesday',
        time: 'Any time',
        frequency: 'Permanent placement'
      },
      cost: 'low',
      difficulty: 'beginner',
      benefits: ['Balances Ketu energy', 'Spiritual growth', 'Better detachment', 'Improved intuition']
    },
    {
      id: 'ketu_2',
      planet: 'Ketu',
      title: 'Donate Sesame Seeds',
      description: 'Donate sesame seeds to strengthen Ketu',
      instructions: [
        'Take 250 grams of sesame seeds',
        'Donate to a temple or needy person on Tuesday',
        'Perform during morning hours (8-10 AM)',
        'Recite "Om Ketave Namah" 11 times'
      ],
      materials: ['250 grams sesame seeds'],
      timing: {
        day: 'Tuesday',
        time: 'Morning (8-10 AM)',
        frequency: 'Every Tuesday for 11 weeks'
      },
      cost: 'low',
      difficulty: 'beginner',
      benefits: ['Strengthens Ketu', 'Spiritual growth', 'Better detachment', 'Improved intuition']
    }
  ]
}

// Helper function to get remedies for a specific planet
export function getLalKitabRemediesForPlanet(planet: string): LalKitabRemedy[] {
  const planetKey = planet.toLowerCase()
  return LAL_KITAB_REMEDIES[planetKey] || []
}

// Helper function to get all remedies for multiple planets
export function getLalKitabRemediesForPlanets(planets: string[]): LalKitabRemedy[] {
  const remedies: LalKitabRemedy[] = []
  planets.forEach(planet => {
    remedies.push(...getLalKitabRemediesForPlanet(planet))
  })
  return remedies
}

// Helper function to get remedies by cost
export function getLalKitabRemediesByCost(cost: 'free' | 'low' | 'medium' | 'high'): LalKitabRemedy[] {
  const allRemedies: LalKitabRemedy[] = []
  Object.values(LAL_KITAB_REMEDIES).forEach(planetRemedies => {
    allRemedies.push(...planetRemedies.filter(r => r.cost === cost))
  })
  return allRemedies
}
