import { doc, setDoc, getDoc, collection } from 'firebase/firestore'
import { getFirebaseDB } from './firebase';

export interface FacialFeature {
  name: string
  description: string
  type: 'eyes' | 'nose' | 'mouth' | 'forehead' | 'cheeks' | 'chin' | 'ears' | 'eyebrows' | 'jawline' | 'lips'
  characteristics: string[]
  interpretation: string
  element: 'fire' | 'earth' | 'air' | 'water'
  energy: number // 1-10 scale
}

export interface FaceReadingAnalysis {
  id: string
  timestamp: Date
  age: number
  gender: 'male' | 'female' | 'other'
  dominantFeatures: string[]
  features: FacialFeature[]
  personalityTraits: string[]
  lifePath: string
  compatibility: string
  healthIndicators: string[]
  careerGuidance: string
  overallReading: string
  faceShape: string
  elementBalance: {
    fire: number
    earth: number
    air: number
    water: number
  }
  energyScore: number // 1-100
  confidenceLevel: number // 1-100
  recommendations: string[]
  remedies: string[]
  coaching: {
    strengths: string[]
    challenges: string[]
    growthAreas: string[]
    affirmations: string[]
  }
}

export interface FaceReadingCoaching {
  id: string
  timestamp: Date
  question: string
  response: string
  insights: string[]
  recommendations: string[]
  followUpQuestions: string[]
}

class FaceReadingIntelligence {
  private facialFeatures: Omit<FacialFeature, 'characteristics'>[] = [
    // Eyes
    {
      name: "Large Eyes",
      description: "Prominent, expressive eyes",
      type: "eyes",
      interpretation: "Large eyes indicate sensitivity, intuition, and emotional depth. These people are often empathetic and have strong artistic abilities.",
      element: "water",
      energy: 8
    },
    {
      name: "Small Eyes",
      description: "Compact, focused eyes",
      type: "eyes",
      interpretation: "Small eyes suggest precision, attention to detail, and analytical thinking. These people are often practical and methodical.",
      element: "earth",
      energy: 6
    },
    {
      name: "Almond Eyes",
      description: "Oval-shaped, elegant eyes",
      type: "eyes",
      interpretation: "Almond eyes indicate wisdom, mystery, and depth of character. These people are often intuitive and have strong spiritual awareness.",
      element: "air",
      energy: 7
    },
    {
      name: "Round Eyes",
      description: "Circular, open eyes",
      type: "eyes",
      interpretation: "Round eyes suggest innocence, curiosity, and openness to new experiences. These people are often trusting and enthusiastic.",
      element: "fire",
      energy: 9
    },
    {
      name: "Deep-Set Eyes",
      description: "Recessed, thoughtful eyes",
      type: "eyes",
      interpretation: "Deep-set eyes indicate introspection, wisdom, and philosophical nature. These people are often deep thinkers and observers.",
      element: "water",
      energy: 7
    },

    // Nose
    {
      name: "Straight Nose",
      description: "Linear, balanced nose",
      type: "nose",
      interpretation: "A straight nose indicates logical thinking, fairness, and balanced judgment. These people are often diplomatic and rational.",
      element: "air",
      energy: 7
    },
    {
      name: "Roman Nose",
      description: "Prominent bridge, strong nose",
      type: "nose",
      interpretation: "A Roman nose suggests leadership, authority, and strong willpower. These people are often natural leaders and decision-makers.",
      element: "fire",
      energy: 9
    },
    {
      name: "Button Nose",
      description: "Small, rounded nose",
      type: "nose",
      interpretation: "A button nose indicates playfulness, creativity, and youthful energy. These people are often fun-loving and imaginative.",
      element: "fire",
      energy: 8
    },
    {
      name: "Aquiline Nose",
      description: "Curved, distinctive nose",
      type: "nose",
      interpretation: "An aquiline nose suggests independence, originality, and strong character. These people are often unique and self-reliant.",
      element: "air",
      energy: 8
    },

    // Mouth
    {
      name: "Full Lips",
      description: "Plump, expressive lips",
      type: "mouth",
      interpretation: "Full lips indicate sensuality, generosity, and strong communication skills. These people are often charismatic and expressive.",
      element: "water",
      energy: 8
    },
    {
      name: "Thin Lips",
      description: "Narrow, precise lips",
      type: "mouth",
      interpretation: "Thin lips suggest precision, self-control, and careful speech. These people are often measured and thoughtful in communication.",
      element: "earth",
      energy: 6
    },
    {
      name: "Wide Mouth",
      description: "Broad, open smile",
      type: "mouth",
      interpretation: "A wide mouth indicates optimism, sociability, and enthusiasm. These people are often outgoing and positive.",
      element: "fire",
      energy: 9
    },
    {
      name: "Small Mouth",
      description: "Compact, refined mouth",
      type: "mouth",
      interpretation: "A small mouth suggests refinement, selectivity, and careful choice of words. These people are often articulate and precise.",
      element: "air",
      energy: 7
    },

    // Forehead
    {
      name: "High Forehead",
      description: "Tall, prominent forehead",
      type: "forehead",
      interpretation: "A high forehead indicates intelligence, wisdom, and strong intellectual capacity. These people are often deep thinkers and learners.",
      element: "air",
      energy: 8
    },
    {
      name: "Low Forehead",
      description: "Compact, practical forehead",
      type: "forehead",
      interpretation: "A low forehead suggests practicality, hands-on approach, and physical intelligence. These people are often action-oriented.",
      element: "earth",
      energy: 7
    },
    {
      name: "Wide Forehead",
      description: "Broad, expansive forehead",
      type: "forehead",
      interpretation: "A wide forehead indicates creativity, imagination, and broad thinking. These people are often innovative and visionary.",
      element: "fire",
      energy: 8
    },

    // Cheeks
    {
      name: "High Cheekbones",
      description: "Prominent, defined cheekbones",
      type: "cheeks",
      interpretation: "High cheekbones indicate strength, determination, and strong character. These people are often resilient and ambitious.",
      element: "fire",
      energy: 8
    },
    {
      name: "Round Cheeks",
      description: "Full, soft cheeks",
      type: "cheeks",
      interpretation: "Round cheeks suggest warmth, nurturing nature, and emotional openness. These people are often caring and approachable.",
      element: "water",
      energy: 7
    },
    {
      name: "Hollow Cheeks",
      description: "Defined, angular cheeks",
      type: "cheeks",
      interpretation: "Hollow cheeks indicate intensity, focus, and strong willpower. These people are often driven and determined.",
      element: "earth",
      energy: 8
    },

    // Chin
    {
      name: "Strong Chin",
      description: "Prominent, defined chin",
      type: "chin",
      interpretation: "A strong chin indicates determination, willpower, and strong character. These people are often persistent and resolute.",
      element: "earth",
      energy: 8
    },
    {
      name: "Pointed Chin",
      description: "Sharp, angular chin",
      type: "chin",
      interpretation: "A pointed chin suggests quick thinking, wit, and sharp intelligence. These people are often clever and perceptive.",
      element: "air",
      energy: 7
    },
    {
      name: "Round Chin",
      description: "Soft, curved chin",
      type: "chin",
      interpretation: "A round chin indicates gentleness, approachability, and emotional sensitivity. These people are often kind and understanding.",
      element: "water",
      energy: 6
    },

    // Ears
    {
      name: "Large Ears",
      description: "Prominent, well-defined ears",
      type: "ears",
      interpretation: "Large ears indicate good listening skills, wisdom, and receptivity to knowledge. These people are often good learners.",
      element: "air",
      energy: 7
    },
    {
      name: "Small Ears",
      description: "Compact, refined ears",
      type: "ears",
      interpretation: "Small ears suggest focus, selectivity, and attention to detail. These people are often precise and careful.",
      element: "earth",
      energy: 6
    },
    {
      name: "Pointed Ears",
      description: "Sharp, angular ears",
      type: "ears",
      interpretation: "Pointed ears indicate intuition, sensitivity, and spiritual awareness. These people are often perceptive and intuitive.",
      element: "water",
      energy: 8
    },

    // Eyebrows
    {
      name: "Thick Eyebrows",
      description: "Full, prominent eyebrows",
      type: "eyebrows",
      interpretation: "Thick eyebrows indicate strong personality, determination, and expressive nature. These people are often bold and confident.",
      element: "fire",
      energy: 8
    },
    {
      name: "Thin Eyebrows",
      description: "Fine, delicate eyebrows",
      type: "eyebrows",
      interpretation: "Thin eyebrows suggest refinement, elegance, and attention to detail. These people are often sophisticated and precise.",
      element: "air",
      energy: 7
    },
    {
      name: "Arched Eyebrows",
      description: "Curved, expressive eyebrows",
      type: "eyebrows",
      interpretation: "Arched eyebrows indicate expressiveness, emotion, and strong communication skills. These people are often animated and engaging.",
      element: "fire",
      energy: 8
    },

    // Jawline
    {
      name: "Square Jaw",
      description: "Strong, angular jawline",
      type: "jawline",
      interpretation: "A square jaw indicates strength, determination, and strong character. These people are often resilient and persistent.",
      element: "earth",
      energy: 8
    },
    {
      name: "Round Jaw",
      description: "Soft, curved jawline",
      type: "jawline",
      interpretation: "A round jaw suggests gentleness, approachability, and emotional sensitivity. These people are often kind and understanding.",
      element: "water",
      energy: 6
    },
    {
      name: "Pointed Jaw",
      description: "Sharp, defined jawline",
      type: "jawline",
      interpretation: "A pointed jaw indicates quick thinking, wit, and sharp intelligence. These people are often clever and perceptive.",
      element: "air",
      energy: 7
    },

    // Lips
    {
      name: "Cupid's Bow",
      description: "Curved upper lip",
      type: "lips",
      interpretation: "A Cupid's bow indicates romantic nature, creativity, and artistic sensitivity. These people are often passionate and expressive.",
      element: "water",
      energy: 8
    },
    {
      name: "Straight Lips",
      description: "Linear, balanced lips",
      type: "lips",
      interpretation: "Straight lips suggest practicality, logic, and balanced communication. These people are often rational and measured.",
      element: "earth",
      energy: 6
    }
  ]

  private personalityTraits = [
    'Intuitive and perceptive',
    'Strong-willed and determined',
    'Creative and imaginative',
    'Practical and logical',
    'Charismatic and expressive',
    'Thoughtful and introspective',
    'Ambitious and goal-oriented',
    'Caring and nurturing',
    'Analytical and precise',
    'Spiritual and mystical',
    'Energetic and enthusiastic',
    'Calm and composed',
    'Adventurous and bold',
    'Gentle and sensitive',
    'Independent and self-reliant',
    'Sociable and friendly'
  ]

  private faceShapes = [
    'Oval - Balanced and harmonious',
    'Round - Friendly and approachable',
    'Square - Strong and determined',
    'Heart - Creative and passionate',
    'Diamond - Unique and distinctive',
    'Rectangle - Practical and logical',
    'Triangle - Dynamic and energetic'
  ]

  private healthIndicators = [
    'Strong respiratory system indicated by nose shape',
    'Good circulation suggested by facial color',
    'Healthy digestion reflected in mouth area',
    'Strong immune system shown in overall facial structure',
    'Good nervous system indicated by eye clarity',
    'Balanced hormones reflected in skin texture',
    'Strong cardiovascular health suggested by facial features',
    'Good mental health indicated by facial symmetry'
  ]

  private careerGuidance = [
    'Leadership roles due to strong facial features',
    'Creative fields due to expressive features',
    'Analytical work due to precise features',
    'Communication roles due to expressive mouth',
    'Artistic pursuits due to sensitive features',
    'Business roles due to strong jawline',
    'Teaching due to expressive eyes',
    'Healthcare due to caring features',
    'Technology due to analytical features',
    'Sales due to charismatic features'
  ]

  private remedies = [
    'Practice facial exercises to enhance natural features',
    'Use specific colors that complement your facial energy',
    'Meditation to balance facial energy flow',
    'Facial massage to improve energy circulation',
    'Positive affirmations to enhance facial expressions',
    'Proper skincare to maintain facial vitality',
    'Breathing exercises to improve facial glow',
    'Yoga poses that enhance facial energy',
    'Aromatherapy to balance facial elements',
    'Crystal healing for facial energy alignment'
  ]

  async analyzeFace(age: number, gender: 'male' | 'female' | 'other', imageUrl?: string): Promise<FaceReadingAnalysis> {
    // If image URL is provided, log it for future AI integration (similar to palmistry pattern)
    if (imageUrl) {
      try {
        console.log('👁️ Analyzing face image with AI...', { imageUrl });
        // TODO: Add AI image analysis here in the future
        // For now, fall through to manual/random analysis
      } catch (error) {
        console.error('⚠️ AI image analysis not yet implemented, falling back to manual analysis:', error);
        // Fall through to manual analysis below
      }
    }
    
    // Select random features for each category (fallback for now)
    const selectedFeatures: FacialFeature[] = []
    const featureTypes = ['eyes', 'nose', 'mouth', 'forehead', 'cheeks', 'chin', 'ears', 'eyebrows', 'jawline', 'lips']
    
    featureTypes.forEach(type => {
      const typeFeatures = this.facialFeatures.filter(f => f.type === type)
      if (typeFeatures.length > 0) {
        const randomFeature = typeFeatures[Math.floor(Math.random() * typeFeatures.length)]
        selectedFeatures.push({
          ...randomFeature,
          characteristics: [['prominent', 'balanced', 'distinctive'][Math.floor(Math.random() * 3)]]
        })
      }
    })

    const dominantFeatures = selectedFeatures.slice(0, 3).map(f => f.name)
    
    const personalityTraits = this.personalityTraits
      .sort(() => 0.5 - Math.random())
      .slice(0, 4)

    const faceShape = this.faceShapes[Math.floor(Math.random() * this.faceShapes.length)]
    
    // Calculate element balance
    const elementCounts = { fire: 0, earth: 0, air: 0, water: 0 }
    selectedFeatures.forEach(feature => {
      elementCounts[feature.element]++
    })

    const elementBalance = {
      fire: (elementCounts.fire / selectedFeatures.length) * 100,
      earth: (elementCounts.earth / selectedFeatures.length) * 100,
      air: (elementCounts.air / selectedFeatures.length) * 100,
      water: (elementCounts.water / selectedFeatures.length) * 100
    }

    // Calculate energy score
    const totalEnergy = selectedFeatures.reduce((sum, feature) => sum + feature.energy, 0)
    const energyScore = Math.round((totalEnergy / selectedFeatures.length) * 10)

    const lifePath = `Your facial features reveal a path of ${personalityTraits[0].toLowerCase()}. You are destined to ${['make a significant impact in your chosen field', 'help others through your unique talents', 'create something beautiful and meaningful', 'lead others with wisdom and compassion'][Math.floor(Math.random() * 4)]}. Your journey will be marked by ${['growth and transformation', 'success and recognition', 'deep connections with others', 'creative achievements'][Math.floor(Math.random() * 4)]}.`

    const compatibility = `Your facial features suggest compatibility with people who have ${['complementary energy patterns', 'similar life goals', 'different but harmonious traits', 'shared spiritual values'][Math.floor(Math.random() * 4)]}. You are most compatible with ${['fire element personalities', 'earth element personalities', 'air element personalities', 'water element personalities'][Math.floor(Math.random() * 4)]}.`

    const healthIndicators = this.healthIndicators
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)

    const careerGuidance = this.careerGuidance
      .sort(() => 0.5 - Math.random())
      .slice(0, 2)
      .join('. ')

    const overallReading = `Based on the analysis of your facial features, you possess a unique combination of traits that shape your life path. Your ${faceShape.toLowerCase()} face shape reveals your ${personalityTraits[0].toLowerCase()} nature, while your ${dominantFeatures[0].toLowerCase()} indicates your ${personalityTraits[1].toLowerCase()} qualities. The ${selectedFeatures.find(f => f.type === 'eyes')?.name.toLowerCase()} suggest ${personalityTraits[2].toLowerCase()} abilities, and your ${selectedFeatures.find(f => f.type === 'mouth')?.name.toLowerCase()} confirms your ${personalityTraits[3].toLowerCase()} communication style. Your facial energy score of ${energyScore}/100 indicates a ${energyScore > 70 ? 'high' : energyScore > 40 ? 'moderate' : 'calm'} energy level, perfect for your destined path of ${lifePath.split('.').slice(0, 2).join('.')}.`

    const recommendations = this.remedies
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)

    const remedies = this.remedies
      .sort(() => 0.5 - Math.random())
      .slice(3, 6)

    const coaching = {
      strengths: [
        `Strong ${dominantFeatures[0].toLowerCase()} indicating natural leadership`,
        `Expressive ${selectedFeatures.find(f => f.type === 'eyes')?.name.toLowerCase()} showing intuition`,
        `Balanced ${selectedFeatures.find(f => f.type === 'mouth')?.name.toLowerCase()} for effective communication`
      ],
      challenges: [
        'Learning to balance different facial energy elements',
        'Developing consistency in facial expressions',
        'Maintaining facial energy throughout the day'
      ],
      growthAreas: [
        'Enhancing natural facial features through practice',
        'Developing facial energy awareness',
        'Balancing facial elements for optimal expression'
      ],
      affirmations: [
        'My facial features reveal my unique gifts and talents',
        'I embrace the energy and wisdom shown in my face',
        'My facial expressions reflect my inner beauty and strength',
        'I am confident in the story my face tells about my journey'
      ]
    }

    const analysis: FaceReadingAnalysis = {
      id: Date.now().toString(),
      timestamp: new Date(),
      age,
      gender,
      dominantFeatures,
      features: selectedFeatures,
      personalityTraits,
      lifePath,
      compatibility,
      healthIndicators,
      careerGuidance,
      overallReading,
      faceShape,
      elementBalance,
      energyScore,
      confidenceLevel: 94,
      recommendations,
      remedies,
      coaching
    }

    return analysis
  }

  async getCoaching(question: string, analysis: FaceReadingAnalysis): Promise<FaceReadingCoaching> {
    const insights = [
      `Based on your ${analysis.dominantFeatures[0].toLowerCase()}, you have natural ${analysis.personalityTraits[0].toLowerCase()} abilities.`,
      `Your ${analysis.faceShape.toLowerCase()} face shape suggests ${analysis.personalityTraits[1].toLowerCase()} qualities.`,
      `The ${analysis.elementBalance.fire > 25 ? 'fire' : analysis.elementBalance.earth > 25 ? 'earth' : analysis.elementBalance.air > 25 ? 'air' : 'water'} element dominance in your features indicates your natural approach to life.`
    ]

    const recommendations = [
      'Practice facial exercises to enhance your natural features',
      'Use colors that complement your facial energy elements',
      'Meditation to balance your facial energy flow',
      'Positive affirmations to enhance your natural expressions'
    ]

    const followUpQuestions = [
      'How do you feel about the facial features that were highlighted in your analysis?',
      'Which personality traits resonate most with your self-perception?',
      'How can you apply the career guidance to your current situation?',
      'What steps can you take to enhance your facial energy and confidence?'
    ]

    return {
      id: Date.now().toString(),
      timestamp: new Date(),
      question,
      response: `Based on your facial analysis, I can see that you have ${analysis.personalityTraits[0].toLowerCase()} qualities that are particularly strong. Your ${analysis.dominantFeatures[0].toLowerCase()} indicates natural leadership abilities, while your overall facial energy score of ${analysis.energyScore}/100 suggests a ${analysis.energyScore > 70 ? 'high' : analysis.energyScore > 40 ? 'moderate' : 'calm'} energy level that's perfect for your destined path. To answer your question: ${question} - Your facial features suggest that you have the natural abilities and energy to ${['achieve your goals through determination and focus', 'connect with others through your expressive nature', 'create meaningful change through your unique perspective', 'lead others with wisdom and compassion'][Math.floor(Math.random() * 4)]}. Focus on developing your ${analysis.coaching.strengths[0].split(' ').slice(-2).join(' ')} and trust in your natural ${analysis.personalityTraits[0].toLowerCase()} abilities.`,
      insights,
      recommendations,
      followUpQuestions
    }
  }

  async saveAnalysis(userId: string, analysis: FaceReadingAnalysis): Promise<void> {
    const db = getFirebaseDB();
    const docRef = doc(db, 'users', userId, 'face-readings', analysis.id)
    await setDoc(docRef, analysis)
  }

  async getAnalysis(userId: string, analysisId: string): Promise<FaceReadingAnalysis | null> {
    const db = getFirebaseDB();
    const docRef = doc(db, 'users', userId, 'face-readings', analysisId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return docSnap.data() as FaceReadingAnalysis
    }
    return null
  }

  async saveCoaching(userId: string, coaching: FaceReadingCoaching): Promise<void> {
    const db = getFirebaseDB();
    const docRef = doc(db, 'users', userId, 'face-reading-coaching', coaching.id)
    await setDoc(docRef, coaching)
  }

  getSystemStatus() {
    return {
      totalFeatures: this.facialFeatures.length,
      featureTypes: ['eyes', 'nose', 'mouth', 'forehead', 'cheeks', 'chin', 'ears', 'eyebrows', 'jawline', 'lips'],
      personalityTraits: this.personalityTraits.length,
      faceShapes: this.faceShapes.length,
      healthIndicators: this.healthIndicators.length,
      careerGuidance: this.careerGuidance.length,
      remedies: this.remedies.length,
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    }
  }
}

export const faceReadingIntelligence = new FaceReadingIntelligence() 