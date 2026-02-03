import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './use-auth';
import { updateSubscriptionStatus, updateTipStatus, updateUserProfile } from '@/lib/firebase';
import i18n from 'i18next';

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'hi' | 'es' | 'fr' | 'zh';
  voiceGuidance: boolean;
  notifications: boolean;
  emailUpdates: boolean;
}

export function useSettings() {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Settings state
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'dark',
    language: 'en',
    voiceGuidance: false,
    notifications: true,
    emailUpdates: true,
  });

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: userProfile?.displayName || '',
    birthDate: userProfile?.birthDate || '',
    birthTime: userProfile?.birthTime || '',
    birthPlace: userProfile?.birthPlace || '',
  });

  // Sync profileData with userProfile when it changes
  useEffect(() => {
    if (userProfile) {
      setProfileData({
        displayName: userProfile.displayName || '',
        birthDate: userProfile.birthDate || '',
        birthTime: userProfile.birthTime || '',
        birthPlace: userProfile.birthPlace || '',
      });
    }
  }, [userProfile]);

  // Sync notification settings from Firestore to local state when userProfile loads
  useEffect(() => {
    if (userProfile) {
      setSettings(prev => ({
        ...prev,
        ...(userProfile.notificationsEnabled !== undefined && { notifications: userProfile.notificationsEnabled }),
        ...(userProfile.emailUpdates !== undefined && { emailUpdates: userProfile.emailUpdates }),
      }));
    }
  }, [userProfile?.notificationsEnabled, userProfile?.emailUpdates]);

  // Apply theme to document
  const applyTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    
    if (theme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', systemPrefersDark);
      root.classList.toggle('light', !systemPrefersDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
      root.classList.toggle('light', theme === 'light');
    }
  }, []);

  const updateSetting = useCallback((key: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Apply theme changes immediately
    if (key === 'theme') {
      applyTheme(value);
    }
    
    // Apply language changes immediately
    if (key === 'language') {
      i18n.changeLanguage(value);
    }
    
    // Save to localStorage
    localStorage.setItem('userSettings', JSON.stringify({ ...settings, [key]: value }));
  }, [settings, applyTheme]);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        applyTheme(parsed.theme || 'dark');
      } catch (error) {
        console.error('Failed to load settings from localStorage:', error);
      }
    } else {
      // Apply default theme
      applyTheme('dark');
    }
  }, [applyTheme]);

  // Listen for system theme changes when theme is set to 'system'
  useEffect(() => {
    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.theme, applyTheme]);

  const updateProfile = useCallback(async (data: Partial<typeof profileData>) => {
    if (!user?.uid) return;
    
    setLoading(true);
    setError(null);
    try {
      // Update the user profile in Firebase
      await updateUserProfile(user.uid, data);
      setProfileData(prev => ({ ...prev, ...data }));
      setSuccess('Profile updated successfully!');
      setIsEditingProfile(false);
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('Copied to clipboard!');
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  }, []);

  const generateInviteCode = useCallback(() => {
    if (!user?.uid) return '';
    return `FUTURESEER-${user.uid.slice(0, 8).toUpperCase()}`;
  }, [user]);

  const getTrialStatus = useCallback(() => {
    if (!userProfile) return null;
    
    const now = Date.now();
    const trialEndTime = userProfile.trialEndTime || 0;
    const isExpired = now > trialEndTime;
    const timeLeft = Math.max(0, trialEndTime - now);
    
    return {
      isExpired,
      timeLeft,
      isActive: !isExpired,
      daysLeft: Math.ceil(timeLeft / (1000 * 60 * 60 * 24)),
      hoursLeft: Math.ceil(timeLeft / (1000 * 60 * 60)),
    };
  }, [userProfile]);

  const formatTrialTime = useCallback((timeLeft: number) => {
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }, []);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return {
    // State
    settings,
    loading,
    error,
    success,
    isEditingProfile,
    profileData,
    
    // User data
    userProfile,
    trialStatus: getTrialStatus(),
    
    // Actions
    updateSetting,
    updateProfile,
    copyToClipboard,
    generateInviteCode,
    formatTrialTime,
    clearMessages,
    
    // Profile editing
    setIsEditingProfile,
    setProfileData,
  };
} 