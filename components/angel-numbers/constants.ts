// Constants for Angel Numbers tool

export const ANGEL_NUMBERS_CONSTANTS = {
  // Examples for lookup input
  LOOKUP_EXAMPLES: "111, 222, 333, 444, 555, 777, 888, 999, 1111, or time formats like 11:11",
  
  // Error messages
  ERRORS: {
    EMPTY_INPUT: "Please enter an angel number",
    INVALID_INPUT: "Please enter a valid number (e.g., 111, 222, 777, or 11:11)",
    INTERPRETATION_FAILED: "Could not interpret this number. Please try another.",
    PROFILE_INCOMPLETE: "User profile incomplete. Please add your full name and birth date.",
    DECODING_ERROR: "Decoding Error"
  },
  
  // Success messages
  MESSAGES: {
    READY_TO_DISCOVER: "Ready to Discover Your Message?",
    ENTER_NUMBER: "Enter a number you've been seeing to receive instant angelic guidance.",
    READY_FOR_GUIDANCE: "Ready for Angelic Guidance?",
    CLICK_REFRESH: "Click \"Refresh\" to receive your personalized angel number analysis based on your profile.",
    DECODING: "Decoding the angelic message..."
  },
  
  // Placeholder text
  PLACEHOLDERS: {
    LOOKUP_INPUT: "Enter number (e.g., 111, 222, 777, 11:11)"
  },
  
  // Button labels
  BUTTONS: {
    LOOKUP: "Lookup",
    CLEAR: "Clear",
    REFRESH: "Refresh",
    REFRESHING: "Refreshing...",
    CLEAR_REGENERATE: "Clear & Regenerate",
    TRY_AGAIN: "Try Again",
    GET_ANGEL_NUMBERS: "Get Angel Numbers"
  },
  
  // Section titles
  SECTIONS: {
    SIMPLE_LOOKUP: "Simple Number Lookup",
    PERSONAL_ANGEL_NUMBERS: "Your Personal Angel Numbers",
    DIVINE_GUIDANCE: "Divine Guidance",
    CURRENT_ENERGIES: "Current Energies",
    DIVINE_SYNCHRONICITIES: "Divine Synchronicities",
    MASTER_NUMBERS: "Master Numbers"
  },
  
  // Badges
  BADGES: {
    DIVINE_BLUEPRINT: "Divine Blueprint",
    ANGELIC_MESSAGES: "Angelic Messages",
    PRESENT_MOMENT: "Present Moment",
    MEANINGFUL_SIGNS: "Meaningful Signs",
    ADVANCED_SPIRITUAL: "Advanced Spiritual"
  },
  
  // Storage keys
  STORAGE_KEYS: {
    PERSONAL_NUMBERS: "angel-personal-numbers",
    GUIDANCE: "angel-guidance",
    CURRENT_NUMBERS: "angel-current-numbers",
    SYNCHRONICITIES: "angel-synchronicities",
    MASTER_NUMBERS: "angel-master-numbers"
  }
} as const

// Material 3 easing curves
export const MATERIAL3_EASING = {
  standard: [0.2, 0, 0, 1] as [number, number, number, number],
  emphasized: [0.2, 0, 0, 1.2] as [number, number, number, number],
  decelerated: [0, 0, 0.2, 1] as [number, number, number, number],
  accelerated: [0.4, 0, 1, 1] as [number, number, number, number]
}

// Animation constants
export const ANIMATION_CONFIG = {
  spring: {
    stiffness: 400,
    damping: 17
  },
  cardHover: {
    stiffness: 300,
    damping: 20
  },
  stagger: {
    delay: 0.1,
    delayChildren: 0.1
  }
} as const
