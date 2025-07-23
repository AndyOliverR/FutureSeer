// Local storage utilities for when Firebase is unavailable

export interface LocalAskHistory {
  id: string;
  uid: string;
  question: string;
  aiSummary: string;
  scientificData?: any;
  symbolicData?: any;
  remedies?: any[];
  timestamp: number;
}

export interface LocalNote {
  id: string;
  uid: string;
  title: string;
  content: string;
  color?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEYS = {
  ASK_HISTORY: 'futureseer_ask_history',
  NOTES: 'futureseer_notes',
  USER_PROFILE: 'futureseer_user_profile',
} as const;

// Ask History
export const saveLocalAskHistory = (data: Omit<LocalAskHistory, 'id'>): string => {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.ASK_HISTORY) || '[]');
    const newEntry = {
      ...data,
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    existing.push(newEntry);
    localStorage.setItem(STORAGE_KEYS.ASK_HISTORY, JSON.stringify(existing));
    console.log('Saved ask history to local storage:', newEntry.id);
    return newEntry.id;
  } catch (error) {
    console.error('Error saving to local storage:', error);
    return 'local-save-failed';
  }
};

export const getLocalAskHistory = (): LocalAskHistory[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ASK_HISTORY) || '[]');
  } catch (error) {
    console.error('Error reading from local storage:', error);
    return [];
  }
};

// Notes
export const saveLocalNote = (data: Omit<LocalNote, 'id'>): string => {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES) || '[]');
    const newEntry = {
      ...data,
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    existing.push(newEntry);
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(existing));
    console.log('Saved note to local storage:', newEntry.id);
    return newEntry.id;
  } catch (error) {
    console.error('Error saving note to local storage:', error);
    return 'local-save-failed';
  }
};

export const getLocalNotes = (): LocalNote[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES) || '[]');
  } catch (error) {
    console.error('Error reading notes from local storage:', error);
    return [];
  }
};

export const updateLocalNote = (id: string, updates: Partial<LocalNote>): boolean => {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES) || '[]');
    const index = existing.findIndex((note: LocalNote) => note.id === id);
    if (index !== -1) {
      existing[index] = { ...existing[index], ...updates, updatedAt: Date.now() };
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(existing));
      console.log('Updated note in local storage:', id);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating note in local storage:', error);
    return false;
  }
};

export const deleteLocalNote = (id: string): boolean => {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES) || '[]');
    const filtered = existing.filter((note: LocalNote) => note.id !== id);
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(filtered));
    console.log('Deleted note from local storage:', id);
    return true;
  } catch (error) {
    console.error('Error deleting note from local storage:', error);
    return false;
  }
};

// User Profile
export const saveLocalUserProfile = (profile: any): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    console.log('Saved user profile to local storage');
  } catch (error) {
    console.error('Error saving user profile to local storage:', error);
  }
};

export const getLocalUserProfile = (): any => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_PROFILE) || 'null');
  } catch (error) {
    console.error('Error reading user profile from local storage:', error);
    return null;
  }
};

// Clear all local data
export const clearLocalData = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('Cleared all local data');
  } catch (error) {
    console.error('Error clearing local data:', error);
  }
};

// Get storage usage info
export const getStorageInfo = () => {
  try {
    const askHistory = getLocalAskHistory();
    const notes = getLocalNotes();
    const profile = getLocalUserProfile();
    
    return {
      askHistoryCount: askHistory.length,
      notesCount: notes.length,
      hasProfile: !!profile,
      totalSize: new Blob([
        JSON.stringify(askHistory),
        JSON.stringify(notes),
        JSON.stringify(profile)
      ]).size
    };
  } catch (error) {
    console.error('Error getting storage info:', error);
    return { askHistoryCount: 0, notesCount: 0, hasProfile: false, totalSize: 0 };
  }
}; 