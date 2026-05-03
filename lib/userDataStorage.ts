import { log } from './consoleLogger';
import {
  userRootDocDelete,
  userRootDocGet,
  userRootDocSet,
  userRootDocUpdate,
} from '@/lib/userSubcollectionFirestore';

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
  type: 'tarot' | 'numerology' | 'palmistry' | 'runes' | 'iching' | 'lenormand' | 'pendulum' | 'face-reading' | 'dream-symbols' | 'angel-numbers' | 'bazi' | 'kabbalistic-numerology' | 'thirteen-signs-zodiac' | 'vastu' | 'geomancy' | 'horary-astrology' | 'kp-astrology' | 'medical-astrology' | 'synastry' | 'western-astrology';
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
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    log.success('UserDataStorage initialized successfully');
  }

  // Check if user has existing Vedic data
  async hasVedicData(userId: string): Promise<boolean> {
    await this.initialize();
    
    try {
      log.info('Checking Vedic data existence for user', { userId }, 'user-data-storage');
      
      const userData = await userRootDocGet(userId);
      
      log.info('Document exists check for hasVedicData', { 
        exists: !!userData,
        userId 
      }, 'user-data-storage');
      
      if (!userData) {
        log.warn('User document does not exist in hasVedicData', { userId }, 'user-data-storage');
        return false;
      }
      
      
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
      const userData = await userRootDocGet(userId);
      if (!userData) return false;
      
      const divinationData = userData?.divinationData || [];
      return (divinationData as UserDivinationData[]).some((item: UserDivinationData) => item.type === type);
    } catch (error) {
      log.error('Error checking divination data existence:', error);
      return false;
    }
  }

  // Get existing divination data
  async getDivinationData(userId: string, type: UserDivinationData['type']): Promise<UserDivinationData | null> {
    await this.initialize();
    
    try {
      const userData = await userRootDocGet(userId);
      if (!userData) return null;
      
      const divinationData = userData?.divinationData || [];
      return (divinationData as UserDivinationData[]).find((item: UserDivinationData) => item.type === type) || null;
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

      const userData = (await userRootDocGet(userId)) || {};
      const existingDivinationData = (userData.divinationData as UserDivinationData[] | undefined) || [];

      // Update or add new divination data
      const updatedDivinationData = existingDivinationData.filter(
        (item: UserDivinationData) => item.type !== type
      );
      updatedDivinationData.push(divinationData);

      await userRootDocSet(userId, {
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
      const userData = await userRootDocGet(userId);
      if (!userData) return null;
      
      return {
        userId,
        vedicData: userData.vedicData as UserVedicData | undefined,
        divinationData: (userData.divinationData as UserDivinationData[] | undefined) || [],
        preferences: (userData.preferences as UserProfileData['preferences'] | undefined) || {
          theme: 'dark',
          notifications: true,
          language: 'en',
        },
        createdAt:
          typeof userData.createdAt === 'string'
            ? userData.createdAt
            : new Date().toISOString(),
        lastUpdated:
          typeof userData.lastUpdated === 'string'
            ? userData.lastUpdated
            : new Date().toISOString(),
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
      await userRootDocSet(userId, {
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
      await userRootDocDelete(userId);
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
      const existing = await userRootDocGet(userId);
      
      if (existing) {
        if (vedicData === null) {
          await userRootDocUpdate(userId, {
            vedicData: null,
            lastUpdated: new Date().toISOString()
          });
          log.success(`Vedic data cleared for user ${userId}`);
        } else {
          await userRootDocUpdate(userId, {
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
          await userRootDocSet(userId, {
            userId,
            vedicData: {
              ...vedicData,
              storedAt: new Date().toISOString()
            },
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          }, { merge: false });
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
      const userData = await userRootDocGet(userId);
      
      if (userData) {
        return (userData.vedicData as VedicReportSchema | null | undefined) || null;
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
      const userData = await userRootDocGet(userId);
      
      if (userData) {
        const currentVedicData = (userData.vedicData as Record<string, unknown> | undefined) || {};
        
        await userRootDocUpdate(userId, {
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
