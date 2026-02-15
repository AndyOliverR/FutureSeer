// Chart Storage System for Permanent Chart Storage
import { devLog } from '@/lib/devLogger';

export interface BirthData {
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  displayName?: string;
}

export interface StoredChart {
  chartUrl: string;
  source: 'astroapp-api' | 'professional-generator' | 'futureseer-generator';
  generatedAt: string;
  userId: string;
  chartType: 'north-indian' | 'south-indian' | 'nakshatra-wheel';
  birthData?: BirthData; // Store birth data for validation
  metadata?: any;
}

export class ChartStorageManager {
  private static instance: ChartStorageManager;
  private charts: Map<string, StoredChart> = new Map();

  private constructor() {
    // Simple in-memory storage manager for permanent chart storage
    // In production, this could be replaced with database storage
  }

  public static getInstance(): ChartStorageManager {
    if (!ChartStorageManager.instance) {
      ChartStorageManager.instance = new ChartStorageManager();
    }
    return ChartStorageManager.instance;
  }

  /**
   * Store a chart permanently with birth data validation
   */
  public async storeChart(
    userId: string,
    chartType: 'north-indian' | 'south-indian' | 'nakshatra-wheel',
    chartUrl: string,
    source: 'astroapp-api' | 'professional-generator' | 'futureseer-generator',
    birthData?: BirthData,
    metadata?: any
  ): Promise<void> {
    try {
      const storedChart: StoredChart = {
        chartUrl,
        source,
        generatedAt: new Date().toISOString(),
        userId,
        chartType,
        birthData,
        metadata
      };

      // Create unique key for this chart
      const chartKey = `${userId}-${chartType}`;
      
      // Store in memory
      this.charts.set(chartKey, storedChart);
      
      devLog.debug(`📦 Chart cached in memory: ${chartType} for user ${userId}`);
      devLog.debug(`✅ Chart stored permanently: ${chartType} for user ${userId} from ${source}`);
      if (birthData) {
        devLog.debug(`📋 Birth data stored: DOB=${birthData.birthDate}, TOB=${birthData.birthTime}, POB=${birthData.birthPlace}`);
      }
      devLog.debug(`📊 Total stored charts: ${this.charts.size}`);
    } catch (error) {
      devLog.error(`❌ Failed to store chart ${chartType} for user ${userId}:`, error, 'chartStorage');
    }
  }

  /**
   * Retrieve a stored chart with birth data validation
   */
  public async getStoredChart(
    userId: string,
    chartType: 'north-indian' | 'south-indian' | 'nakshatra-wheel',
    currentBirthData?: BirthData
  ): Promise<StoredChart | null> {
    try {
      // Create unique key for this chart
      const chartKey = `${userId}-${chartType}`;
      
      // Retrieve from memory
      const storedChart = this.charts.get(chartKey);
      
      if (!storedChart) {
        devLog.debug(`📭 No stored chart found: ${chartType} for user ${userId}`);
        return null;
      }
      
      // Validate birth data if provided
      if (currentBirthData && storedChart.birthData) {
        const birthDataMatches = this.validateBirthData(storedChart.birthData, currentBirthData);
        if (!birthDataMatches) {
          devLog.debug(`🔄 Birth data changed for user ${userId}, chart ${chartType} needs regeneration`);
          devLog.debug(`📋 Old birth data: DOB=${storedChart.birthData.birthDate}, TOB=${storedChart.birthData.birthTime}, POB=${storedChart.birthData.birthPlace}`);
          devLog.debug(`📋 New birth data: DOB=${currentBirthData.birthDate}, TOB=${currentBirthData.birthTime}, POB=${currentBirthData.birthPlace}`);
          return null;
        }
      }
      
      devLog.debug(`✅ Retrieved stored chart: ${chartType} for user ${userId} (generated: ${storedChart.generatedAt})`);
      return storedChart;
    } catch (error) {
      devLog.error(`❌ Failed to retrieve chart ${chartType} for user ${userId}:`, error, 'chartStorage');
      return null;
    }
  }

  /**
   * Validate if birth data matches between stored and current data
   */
  private validateBirthData(storedBirthData: BirthData, currentBirthData: BirthData): boolean {
    return (
      storedBirthData.birthDate === currentBirthData.birthDate &&
      storedBirthData.birthTime === currentBirthData.birthTime &&
      storedBirthData.birthPlace === currentBirthData.birthPlace
    );
  }

  /**
   * Check if a chart exists and is still valid (permanent storage with birth data validation)
   */
  public async hasValidChart(
    userId: string,
    chartType: 'north-indian' | 'south-indian' | 'nakshatra-wheel',
    currentBirthData?: BirthData
  ): Promise<boolean> {
    try {
      const storedChart = await this.getStoredChart(userId, chartType, currentBirthData);
      if (!storedChart) {
        return false;
      }

      // For permanent storage, we only check birth data validation
      // Charts are valid forever unless birth data changes
      if (currentBirthData && storedChart.birthData) {
        const birthDataMatches = this.validateBirthData(storedChart.birthData, currentBirthData);
        if (!birthDataMatches) {
          devLog.debug(`🔄 Birth data changed for user ${userId}, chart ${chartType} needs regeneration`);
          return false;
        }
      }

      devLog.debug(`✅ Valid permanent chart found: ${chartType} for user ${userId}`);
      return true;
    } catch (error) {
      devLog.error(`❌ Failed to check chart validity ${chartType} for user ${userId}:`, error, 'chartStorage');
      return false;
    }
  }

  /**
   * Clear stored charts for a user
   */
  public async clearUserCharts(userId: string): Promise<void> {
    try {
      // Remove all charts for this user
      const keysToDelete = Array.from(this.charts.keys()).filter(key => key.startsWith(`${userId}-`));
      
      keysToDelete.forEach(key => {
        this.charts.delete(key);
        devLog.debug(`🗑️ Removed chart from memory cache: ${key}`);
      });

      devLog.debug(`🗑️ Cleared ${keysToDelete.length} charts for user ${userId}`);
      devLog.debug(`📊 Remaining stored charts: ${this.charts.size}`);
    } catch (error) {
      devLog.error(`❌ Failed to clear charts for user ${userId}:`, error, 'chartStorage');
    }
  }

  /**
   * Get all stored charts for a user
   */
  public async getAllUserCharts(userId: string): Promise<StoredChart[]> {
    try {
      const charts: StoredChart[] = [];
      const chartTypes: ('north-indian' | 'south-indian' | 'nakshatra-wheel')[] = 
        ['north-indian', 'south-indian', 'nakshatra-wheel'];

      for (const chartType of chartTypes) {
        const chart = await this.getStoredChart(userId, chartType);
        if (chart) {
          charts.push(chart);
        }
      }

      devLog.debug(`📊 Retrieved ${charts.length} stored charts for user ${userId}`);
      return charts;
    } catch (error) {
      devLog.error(`❌ Failed to get all charts for user ${userId}:`, error, 'chartStorage');
      return [];
    }
  }

  /**
   * Get storage statistics
   */
  public getStorageStats(): { totalCharts: number; users: string[] } {
    const totalCharts = this.charts.size;
    const users = Array.from(new Set(Array.from(this.charts.values()).map(chart => chart.userId)));
    
    return {
      totalCharts,
      users
    };
  }
}

// Export singleton instance
export const chartStorageManager = ChartStorageManager.getInstance();

// Export functions for backward compatibility with frontend
export const getPermanentChart = (userId: string, chartType: string) => {
  return chartStorageManager.getStoredChart(userId, chartType as any);
};

export const storePermanentChart = (userId: string, chartType: string, data: any) => {
  return chartStorageManager.storeChart(userId, chartType as any, data, 'futureseer-generator');
};

export const getCurrentChart = (userId: string, chartType: string) => {
  return chartStorageManager.getStoredChart(userId, chartType as any);
};

export const storeCurrentChart = (userId: string, chartType: string, data: any, birthData?: BirthData, metadata?: any, options?: any) => {
  return chartStorageManager.storeChart(userId, chartType as any, data, 'futureseer-generator', birthData, metadata);
};

export const hasPermanentChart = (userId: string, chartType: string) => {
  return chartStorageManager.hasValidChart(userId, chartType as any);
};

export const hasCurrentChart = (userId: string, chartType: string) => {
  return chartStorageManager.hasValidChart(userId, chartType as any);
};

export const storeChart = (userId: string, chartType: string, data: any, source?: string, metadata?: any) => {
  return chartStorageManager.storeChart(userId, chartType as any, data, (source || 'futureseer-generator') as 'astroapp-api' | 'professional-generator' | 'futureseer-generator', metadata);
};

export const getStoredChart = (userId: string, chartType: string) => {
  return chartStorageManager.getStoredChart(userId, chartType as any);
};

// Export ChartStorage class for backward compatibility
export const ChartStorage = ChartStorageManager;