import { getFirebaseDB } from './firebase';
import { log } from './consoleLogger';

export interface UserVedicData {
  birthDate: string;
  birthTime: string;
  birthPlace: {
    latitude: number;
    longitude: number;
    timezone: number;
  };
  planetaryPositions: any[];
  chartImage: string | null;
  interpretations: any;
  createdAt: string;
  lastUpdated: string;
}

// Import VedicReportSchema for proper typing
import { VedicReportSchema } from '@/types/vedicReport';

export interface UserDivinationData {
  type: 'tarot' | 'numerology' | 'palmistry' | 'runes' | 'iching' | 'lenormand' | 'pendulum' | 'face-reading' | 'dream-symbols' | 'angel-numbers' | 'bazi' | 'kabbalistic-numerology' | 'thirteen-signs-zodiac' | 'vastu' | 'geomancy' | 'horary-astrology' | 'kp-astrology' | 'medical-astrology' | 'mundane-astrology' | 'financial-astrology' | 'synastry' | 'western-astrology';
  data: any;
  createdAt: string;
  lastUpdated: string;
}

export interface UserProfileData {
  userId: string;
  vedicData?: UserVedicData;
  divinationData: UserDivinationData[];
  preferences: {
    theme: 'dark' | 'light';
    notifications: boolean;
    language: string;
  };
  createdAt: string;
  lastUpdated: string;
}

class UserDataStorage {
  private db: any;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      this.db = getFirebaseDB();
      
      // Debug: Check what type of object we got
      log.info('Firebase DB initialization debug', {
        dbType: typeof this.db,
        dbConstructor: this.db?.constructor?.name,
        hasDoc: typeof this.db?.doc === 'function',
        hasCollection: typeof this.db?.collection === 'function',
        isFirestore: this.db?.constructor?.name === 'FirebaseFirestore'
      }, 'user-data-storage');
      
      this.isInitialized = true;
      log.success('UserDataStorage initialized successfully');
    } catch (error) {
      log.error('Failed to initialize UserDataStorage:', error);
      throw error;
    }
  }

  // Check if user has existing Vedic data
  async hasVedicData(userId: string): Promise<boolean> {
    await this.initialize();
    
    try {
      log.info('Checking Vedic data existence for user', { userId }, 'user-data-storage');
      
      const userDocRef = this.db.collection('users').doc(userId);
      const userDoc = await userDocRef.get();
      
      log.info('Document exists check for hasVedicData', { 
        exists: userDoc.exists,
        userId 
      }, 'user-data-storage');
      
      if (!userDoc.exists) {
        log.warn('User document does not exist in hasVedicData', { userId }, 'user-data-storage');
        return false;
      }
      
      const userData = userDoc.data();
      
      log.info('User data check for hasVedicData', { 
        hasVedicData: !!userData?.vedicData,
        dataKeys: userData ? Object.keys(userData) : null,
        vedicDataKeys: userData?.vedicData ? Object.keys(userData.vedicData) : null,
        vedicDataValue: userData?.vedicData
      }, 'user-data-storage');
      
      const hasData = !!(userData?.vedicData);
      log.info('hasVedicData result', { hasData, userId }, 'user-data-storage');
      
      return hasData;
    } catch (error) {
      log.error('Error checking Vedic data existence', error, 'user-data-storage');
      return false;
    }
  }



  // Check if user has existing divination data
  async hasDivinationData(userId: string, type: UserDivinationData['type']): Promise<boolean> {
    await this.initialize();
    
    try {
      const userDocRef = this.db.collection('users').doc(userId);
      const userDoc = await userDocRef.get();
      if (!userDoc.exists) return false;
      
      const userData = userDoc.data();
      const divinationData = userData?.divinationData || [];
      return divinationData.some((item: UserDivinationData) => item.type === type);
    } catch (error) {
      log.error('Error checking divination data existence:', error);
      return false;
    }
  }

  // Get existing divination data
  async getDivinationData(userId: string, type: UserDivinationData['type']): Promise<UserDivinationData | null> {
    await this.initialize();
    
    try {
      const userDocRef = this.db.collection('users').doc(userId);
      const userDoc = await userDocRef.get();
      if (!userDoc.exists) return null;
      
      const userData = userDoc.data();
      const divinationData = userData?.divinationData || [];
      return divinationData.find((item: UserDivinationData) => item.type === type) || null;
    } catch (error) {
      log.error('Error fetching divination data:', error);
      return null;
    }
  }

  // Store divination data permanently
  async storeDivinationData(userId: string, type: UserDivinationData['type'], data: any): Promise<void> {
    await this.initialize();
    
    try {
      const now = new Date().toISOString();
      const divinationData: UserDivinationData = {
        type,
        data,
        createdAt: now,
        lastUpdated: now
      };

      // Get existing divination data
      const userDocRef = this.db.collection('users').doc(userId);
      const userDoc = await userDocRef.get();
      const userData = userDoc.exists ? userDoc.data() : {};
      const existingDivinationData = userData.divinationData || [];

      // Update or add new divination data
      const updatedDivinationData = existingDivinationData.filter(
        (item: UserDivinationData) => item.type !== type
      );
      updatedDivinationData.push(divinationData);

      await userDocRef.set( {
        divinationData: updatedDivinationData,
        lastUpdated: now
      }, { merge: true });

      log.success(`${type} data stored permanently for user ${userId}`);
    } catch (error) {
      log.error('Error storing divination data:', error);
      throw error;
    }
  }

  // Get user profile data
  async getUserProfile(userId: string): Promise<UserProfileData | null> {
    await this.initialize();
    
    try {
      const userDocRef = this.db.collection('users').doc(userId);
      const userDoc = await userDocRef.get();
      if (!userDoc.exists) return null;
      
      const userData = userDoc.data();
      return {
        userId,
        vedicData: userData?.vedicData,
        divinationData: userData?.divinationData || [],
        preferences: userData?.preferences || {
          theme: 'dark',
          notifications: true,
          language: 'en'
        },
        createdAt: userData?.createdAt || new Date().toISOString(),
        lastUpdated: userData?.lastUpdated || new Date().toISOString()
      };
    } catch (error) {
      log.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Update user preferences
  async updateUserPreferences(userId: string, preferences: Partial<UserProfileData['preferences']>): Promise<void> {
    await this.initialize();
    
    try {
      const userDocRef = this.db.collection('users').doc(userId);
      await userDocRef.set( {
        preferences,
        lastUpdated: new Date().toISOString()
      }, { merge: true });

      log.success(`User preferences updated for user ${userId}`);
    } catch (error) {
      log.error('Error updating user preferences:', error);
      throw error;
    }
  }

  // Delete user data
  async deleteUserData(userId: string): Promise<void> {
    await this.initialize();
    
    try {
      const userDocRef = this.db.collection('users').doc(userId);
      await userDocRef.delete();
      log.success(`User data deleted for user ${userId}`);
    } catch (error) {
      log.error('Error deleting user data:', error);
      throw error;
    }
  }

  // Vedic Data Storage Methods
  async storeVedicData(userId: string, vedicData: VedicReportSchema | null): Promise<void> {
    await this.initialize();
    
    try {
      const userDocRef = this.db.collection('users').doc(userId);
      const userDoc = await userDocRef.get();
      
      if (userDoc.exists) {
        if (vedicData === null) {
          // Clear the vedic data
          await userDocRef.update({
            vedicData: null,
            lastUpdated: new Date().toISOString()
          });
          log.success(`Vedic data cleared for user ${userId}`);
        } else {
          await userDocRef.update({
            vedicData: {
              ...vedicData,
              storedAt: new Date().toISOString()
            },
            lastUpdated: new Date().toISOString()
          });
          log.success(`Vedic data stored for user ${userId}`);
        }
      } else {
        if (vedicData !== null) {
          await userDocRef.set({
            userId,
            vedicData: {
              ...vedicData,
              storedAt: new Date().toISOString()
            },
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          });
          log.success(`Vedic data stored for user ${userId}`);
        }
      }
    } catch (error) {
      log.error('Error storing Vedic data:', error);
      throw error;
    }
  }

  async getVedicData(userId: string): Promise<VedicReportSchema | null> {
    await this.initialize();
    
    try {
      const userDocRef = this.db.collection('users').doc(userId);
      const userDoc = await userDocRef.get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        return userData.vedicData || null;
      }
      
      return null;
    } catch (error) {
      log.error('Error retrieving Vedic data:', error);
      throw error;
    }
  }

  async updateVedicData(userId: string, updates: Partial<VedicReportSchema>): Promise<void> {
    await this.initialize();
    
    try {
      const userDocRef = this.db.collection('users').doc(userId);
      const userDoc = await userDocRef.get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        const currentVedicData = userData.vedicData || {};
        
        await userDocRef.update({
          vedicData: {
            ...currentVedicData,
            ...updates,
            lastUpdated: new Date().toISOString()
          },
          lastUpdated: new Date().toISOString()
        });
        
        log.success(`Vedic data updated for user ${userId}`);
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      log.error('Error updating Vedic data:', error);
      throw error;
    }
  }
}

export const userDataStorage = new UserDataStorage();
