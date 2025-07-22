import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './use-auth';
import { updateSubscriptionStatus, updateTipStatus, updateUserProfile } from '@/lib/firebase';

export interface UserSettings {
  darkMode: boolean;
  language: string;
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
    darkMode: true,
    language: 'english',
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

  const updateSetting = useCallback((key: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    // Here you would typically save to backend/localStorage
    localStorage.setItem('userSettings', JSON.stringify({ ...settings, [key]: value }));
  }, [settings]);

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