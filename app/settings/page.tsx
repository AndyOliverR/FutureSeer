"use client"

import { useState, useMemo } from "react"
import { devLog } from '@/lib/devLogger';
import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "react-i18next"
import { useSettings } from "@/hooks/useSettings"
import { useAuth } from "@/hooks/use-auth"
import { useIsMobileLayout } from "@/hooks/useIsMobileLayout"
import { updateUserProfile, type UserProfile } from "@/lib/firebase"
import { formatBirthDate, formatBirthTime, formatBirthPlace } from "@/lib/formatUtils"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { User, LogOut, Trash2, CheckCircle, XCircle, Moon, Sun, Bell, Globe, Mic, Mail, Heart, Users, Sparkles } from "lucide-react"
import { Label } from "@/components/ui/label"
import { BirthTimeDualFormatSelect } from "@/components/BirthTimeDualFormatSelect"

export default function SettingsPage() {
  const { t } = useTranslation('common')
  const { user, refreshProfile, signOut } = useAuth()
  const {
    settings,
    error,
    success,
    isEditingProfile,
    profileData,
    userProfile,
    trialStatus,
    updateSetting,
    updateProfile,
    clearMessages,
    setIsEditingProfile,
    setProfileData,
  } = useSettings()

  const [showDelete, setShowDelete] = useState(false)
  const [birthTimeUnknown, setBirthTimeUnknown] = useState(false)

  // Memoized formatting functions for performance
  const formattedBirthDate = useMemo(
    () => formatBirthDate(userProfile?.birthDate),
    [userProfile?.birthDate]
  )

  const formattedBirthTime = useMemo(
    () => formatBirthTime(userProfile?.birthTime),
    [userProfile?.birthTime]
  )

  const formattedBirthPlace = useMemo(
    () => formatBirthPlace(userProfile?.birthPlace ?? ''),
    [userProfile?.birthPlace]
  )

  const isMobileLayout = useIsMobileLayout()

  const {
    cardClass,
    sectionTitleClass,
    pageTitleClass,
    pageSubtitleClass,
    alertSuccessClass,
    alertErrorClass,
    btnPrimaryClass,
    btnOutlineClass,
    prefRowTileClass,
    notifRowTileClass,
    interestChipClass,
    labelAccentClass,
    sublabelClass,
    themeSelectedClass,
    themeUnselectedClass,
    notifTitleClass,
    notifDescClass,
  } = useMemo(() => {
    const m = isMobileLayout
    return {
      cardClass: m
        ? "bg-[var(--m3-surface-container-high)] border border-[var(--m3-outline-variant)] shadow-sm mb-6 rounded-2xl"
        : "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 mb-8 rounded-2xl",
      sectionTitleClass: m
        ? "flex items-center gap-2 text-amber-400 font-sans text-lg font-medium tracking-normal"
        : "flex items-center gap-2 text-amber-400 font-serif text-xl font-bold",
      pageTitleClass: m
        ? "text-3xl font-medium font-sans text-amber-400 mb-4 tracking-normal normal-case"
        : "text-3xl md:text-4xl font-bold font-serif text-amber-400 mb-4",
      pageSubtitleClass: m
        ? "text-base text-[var(--m3-on-surface-variant)] leading-relaxed"
        : "text-base text-white/80 leading-relaxed",
      alertSuccessClass: m
        ? "mb-6 p-4 bg-[var(--m3-surface-container-high)] border border-[var(--m3-outline-variant)] rounded-2xl text-amber-400 text-center text-sm flex items-center justify-center gap-2"
        : "mb-6 p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 rounded-2xl text-amber-400 text-center text-sm flex items-center justify-center gap-2",
      alertErrorClass: m
        ? "mb-6 p-4 bg-[var(--m3-surface-container-high)] border border-red-500/40 rounded-2xl text-red-400 text-center text-sm flex items-center justify-center gap-2"
        : "mb-6 p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-red-500/30 rounded-2xl text-red-400 text-center text-sm flex items-center justify-center gap-2",
      btnPrimaryClass: m
        ? "bg-[var(--m3-primary)] text-[var(--m3-on-primary)] hover:opacity-90 font-semibold text-sm rounded-xl border-0"
        : "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 text-amber-400 font-semibold text-sm transition-all duration-300 rounded-xl",
      btnOutlineClass: m
        ? "border border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container)] text-[var(--m3-on-surface)] hover:bg-[var(--m3-surface-container-high)] text-sm rounded-xl"
        : "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 text-white/80 hover:text-amber-400 text-sm transition-all duration-300 rounded-xl",
      prefRowTileClass: m
        ? "rounded-2xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline-variant)] p-3"
        : "",
      notifRowTileClass: m
        ? "flex items-center justify-between p-3 rounded-2xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline-variant)]"
        : "flex items-center justify-between p-3 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 rounded-lg",
      interestChipClass: m
        ? "flex items-center space-x-2 p-3 rounded-xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline-variant)] cursor-pointer"
        : "flex items-center space-x-2 p-3 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 rounded-lg hover:border-amber-500/50 transition-all duration-300 cursor-pointer",
      labelAccentClass: m
        ? "text-[var(--m3-on-surface)] text-base font-semibold"
        : "text-amber-400 text-base font-semibold",
      sublabelClass: m ? "text-[var(--m3-on-surface-variant)]" : "text-white/80",
      themeSelectedClass: m
        ? "bg-[var(--m3-surface-container-highest)] border-2 border-[var(--m3-primary)] text-amber-400"
        : "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-amber-500/50 text-amber-400",
      themeUnselectedClass: m
        ? "bg-[var(--m3-surface-container)] border-2 border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)] hover:border-[var(--m3-primary)]/40 hover:text-amber-400/90"
        : "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-amber-500/30 text-white/80 hover:border-amber-500/50 hover:text-amber-400",
      notifTitleClass: m ? "text-[var(--m3-on-surface)] text-sm font-medium" : "text-white/80 text-sm font-medium",
      notifDescClass: m ? "text-[var(--m3-on-surface-variant)] text-xs" : "text-white/60 text-xs",
    }
  }, [isMobileLayout])

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut()
      // Redirect will be handled by auth state change
    } catch (error) {
      devLog.error('Failed to sign out:', error, 'page')
    }
  }

  return (
    <div className="starfield-ultra-sharp min-h-screen overflow-hidden">
      <div className={cn("pt-20 pb-4 max-w-3xl mx-auto", isMobileLayout ? "px-5" : "px-4")}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 pt-8"
        >
          <h1 className={pageTitleClass}>{t('navigation.settings')}</h1>
          <p className={pageSubtitleClass}>{t('settings.managePreferences')}</p>
        </motion.div>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={alertSuccessClass}
            >
              <CheckCircle className="w-5 h-5" /> {success}
              <button onClick={clearMessages} className="ml-2 text-white/80 hover:text-amber-400 transition-colors">✕</button>
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={alertErrorClass}
            >
              <XCircle className="w-5 h-5" /> {error}
              <button onClick={clearMessages} className="ml-2 text-red-400/80 hover:text-red-400 transition-colors">✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile Card */}
        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className={sectionTitleClass}>
              <User className="w-6 h-6" /> Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditingProfile ? (
              <form
                className="space-y-4"
                onSubmit={e => {
                  e.preventDefault()
                  updateProfile(profileData)
                }}
              >
                <div>
                  <label className={cn("block text-sm font-semibold mb-1", sublabelClass)}>Display Name</label>
                  <Input
                    value={profileData.displayName}
                    onChange={e => setProfileData({ ...profileData, displayName: e.target.value })}
                    className="bg-[var(--m3-surface-container-low)] border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)] placeholder:text-[var(--m3-on-surface-variant)] focus:border-[var(--m3-primary)] focus:shadow-[0_0_0_3px_var(--m3-primary-container)] m3-input-focus backdrop-blur-sm m3-transition-standard"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={cn("block text-sm font-semibold mb-1", sublabelClass)}>Birth Date</label>
                    <Input
                      type="date"
                      value={profileData.birthDate}
                      onChange={e => setProfileData({ ...profileData, birthDate: e.target.value })}
                      className="bg-[var(--m3-surface-container-low)] border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)] focus:border-[var(--m3-primary)] focus:shadow-[0_0_0_3px_var(--m3-primary-container)] m3-input-focus backdrop-blur-sm m3-transition-standard [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className={cn("block text-sm font-semibold mb-1", sublabelClass)}>Birth Time</label>
                    <BirthTimeDualFormatSelect
                      value={profileData.birthTime || "12:00"}
                      onChange={(next) => setProfileData({ ...profileData, birthTime: next })}
                      showUnknownCheckbox
                      unknownTime={birthTimeUnknown}
                      onUnknownTimeChange={setBirthTimeUnknown}
                      selectClassName="flex-1 min-w-0 min-h-12 bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)] rounded-xl px-3 text-[var(--m3-on-surface)] [color-scheme:dark]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={cn("block text-sm font-semibold mb-1", sublabelClass)}>Birth Place</label>
                    <Input
                      value={profileData.birthPlace}
                      onChange={e => setProfileData({ ...profileData, birthPlace: e.target.value })}
                      className="bg-[var(--m3-surface-container-low)] border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)] placeholder:text-[var(--m3-on-surface-variant)] focus:border-[var(--m3-primary)] focus:shadow-[0_0_0_3px_var(--m3-primary-container)] m3-input-focus backdrop-blur-sm m3-transition-standard"
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-4">
                  <Button type="submit" className={btnPrimaryClass}>Save</Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditingProfile(false)} className={btnOutlineClass}>Cancel</Button>
                </div>
              </form>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm", sublabelClass)}>Name:</span>
                  <span className="text-amber-400 text-sm font-semibold">{userProfile?.displayName || "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm", sublabelClass)}>Birth Date:</span>
                  <span className="text-amber-400 text-sm font-semibold">{formattedBirthDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm", sublabelClass)}>Birth Time:</span>
                  <span className="text-amber-400 text-sm font-semibold">{formattedBirthTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm", sublabelClass)}>Birth Place:</span>
                  <span className="text-amber-400 text-sm font-semibold">{formattedBirthPlace}</span>
                </div>
                <Button onClick={() => setIsEditingProfile(true)} className={cn("mt-4", btnPrimaryClass)}>Edit Profile</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preferences Card */}
        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className={sectionTitleClass}>
              <Moon className="w-6 h-6" /> {t('settings.preferences')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={isMobileLayout ? "space-y-3" : "space-y-4"}>
              <div className={cn("space-y-3", prefRowTileClass)}>
                <div className="flex items-center gap-2">
                  <Sun className="w-5 h-5 text-amber-400" />
                  <span className={labelAccentClass}>Theme Preference</span>
                </div>
                <RadioGroup
                  value={settings.theme}
                  onValueChange={(value) => updateSetting('theme', value as 'light' | 'dark' | 'system')}
                  className="grid grid-cols-3 gap-2"
                >
                  {[
                    { value: 'light', label: 'Light', icon: '☀️' },
                    { value: 'dark', label: 'Dark', icon: '🌙' },
                    { value: 'system', label: 'System', icon: '⚙️' }
                  ].map((theme) => {
                    const isSelected = settings.theme === theme.value;
                    return (
                      <div key={theme.value} className="relative">
                        <RadioGroupItem
                          value={theme.value}
                          id={`theme-${theme.value}`}
                          className="peer sr-only"
                          aria-label={`${theme.label} theme`}
                        />
                        <label
                          htmlFor={`theme-${theme.value}`}
                          className={`flex items-center justify-center gap-2 px-2 py-3 md:px-8 rounded-full text-sm font-medium cursor-pointer border-2 min-h-[48px] w-full min-w-0 md:min-w-[120px] transition-all duration-300 ${
                            isSelected ? themeSelectedClass : themeUnselectedClass
                          } peer-focus-visible:ring-2 peer-focus-visible:ring-amber-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-slate-950`}
                        >
                          <span className="text-base">{theme.icon}</span>
                          <span>{theme.label}</span>
                        </label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>
              <div className={cn("flex items-center justify-between", prefRowTileClass)}>
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-400" />
                  <span className={labelAccentClass}>Notifications</span>
                </div>
                <Switch
                  checked={userProfile?.notificationsEnabled ?? settings.notifications}
                  onCheckedChange={async (v) => {
                    if (user?.uid) {
                      try {
                        await updateUserProfile(user.uid, { notificationsEnabled: v });
                        await refreshProfile();
                      } catch (e) {
                        devLog.error('Failed to update notifications preference:', e, 'page');
                      }
                    }
                    updateSetting('notifications', v);
                  }}
                />
              </div>
              <div className={cn("flex items-center justify-between", prefRowTileClass)}>
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-amber-400" />
                  <span className={labelAccentClass}>Email Updates</span>
                </div>
                <Switch
                  checked={userProfile?.emailUpdates ?? settings.emailUpdates}
                  onCheckedChange={async (v) => {
                    if (user?.uid) {
                      try {
                        await updateUserProfile(user.uid, { emailUpdates: v });
                        await refreshProfile();
                      } catch (e) {
                        devLog.error('Failed to update email updates preference:', e, 'page');
                      }
                    }
                    updateSetting('emailUpdates', v);
                  }}
                />
              </div>
              <div className={cn("flex items-center justify-between", prefRowTileClass)}>
                <div className="flex items-center gap-2">
                  <Mic className="w-5 h-5 text-amber-400" />
                  <span className={labelAccentClass}>Voice Guidance</span>
                </div>
                <Switch checked={settings.voiceGuidance} onCheckedChange={v => updateSetting('voiceGuidance', v)} />
              </div>
              <div className={cn("flex items-center justify-between", prefRowTileClass)}>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-amber-400" />
                  <span className={labelAccentClass}>Language</span>
                </div>
                <select
                  value={settings.language}
                  onChange={e => updateSetting('language', e.target.value)}
                  className="bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)] rounded-xl px-3 py-2 text-[var(--m3-on-surface)] m3-body-medium focus:outline-none focus:border-[var(--m3-primary)] focus:shadow-[0_0_0_3px_var(--m3-primary-container)] m3-input-focus m3-transition-standard"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="es">Español (Spanish)</option>
                  <option value="fr">Français (French)</option>
                  <option value="zh">中文 (Chinese)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Context Section */}
        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className={sectionTitleClass}>
              <Heart className="w-6 h-6" /> Personal Context
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={isMobileLayout ? "space-y-3" : "space-y-6"}>
              {/* Relationship Status */}
              <div className={cn("space-y-2", prefRowTileClass)}>
                <Label htmlFor="relationshipStatus" className={cn("text-base font-semibold flex items-center gap-2", labelAccentClass)}>
                  <Heart className="w-4 h-4 text-amber-400" />
                  Relationship Status
                </Label>
                <select
                  id="relationshipStatus"
                  value={userProfile?.relationshipStatus || ""}
                  onChange={async (e) => {
                    if (user?.uid) {
                      const val = e.target.value;
                      const relationshipStatus: UserProfile['relationshipStatus'] = (val === 'single' || val === 'in-relationship' || val === 'married' || val === 'divorced' || val === 'widowed' || val === 'prefer-not-to-say') ? val : undefined;
                      try {
                        await updateUserProfile(user.uid, { relationshipStatus });
                        await refreshProfile();
                      } catch (error) {
                        devLog.error('Failed to update relationship status:', error, 'page');
                      }
                    }
                  }}
                  className="bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)] focus:border-[var(--m3-primary)] focus:shadow-[0_0_0_3px_var(--m3-primary-container)] rounded-lg px-4 py-2 backdrop-blur-sm m3-input-focus m3-transition-standard w-full"
                >
                  <option value="">Prefer not to say</option>
                  <option value="single">Single</option>
                  <option value="in-relationship">In Relationship</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
              </div>

              {/* Children */}
              <div className={cn("space-y-2", prefRowTileClass)}>
                <Label htmlFor="hasChildren" className={cn("text-base font-semibold flex items-center gap-2", labelAccentClass)}>
                  <Users className="w-4 h-4 text-amber-400" />
                  Do you have children?
                </Label>
                <select
                  id="hasChildren"
                  value={userProfile?.hasChildren === undefined ? "" : userProfile?.hasChildren ? "yes" : "no"}
                  onChange={async (e) => {
                    if (user?.uid) {
                      try {
                        const value = e.target.value === "" ? undefined : e.target.value === "yes";
                        await updateUserProfile(user.uid, { 
                          hasChildren: value,
                          numberOfChildren: value ? userProfile?.numberOfChildren : undefined
                        });
                        await refreshProfile();
                      } catch (error) {
                        devLog.error('Failed to update children information:', error, 'page');
                      }
                    }
                  }}
                  className="bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)] focus:border-[var(--m3-primary)] focus:shadow-[0_0_0_3px_var(--m3-primary-container)] rounded-lg px-4 py-2 backdrop-blur-sm m3-input-focus m3-transition-standard w-full"
                >
                  <option value="">Prefer not to say</option>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
                {userProfile?.hasChildren && (
                  <div className="space-y-2 mt-3">
                    <Label htmlFor="numberOfChildren" className={cn("text-sm font-semibold", sublabelClass)}>Number of children</Label>
                    <Input
                      id="numberOfChildren"
                      type="number"
                      min="1"
                      max="20"
                      value={userProfile?.numberOfChildren || ""}
                      onChange={async (e) => {
                        if (user?.uid) {
                          try {
                            await updateUserProfile(user.uid, { 
                              numberOfChildren: e.target.value ? parseInt(e.target.value) : undefined 
                            });
                            await refreshProfile();
                          } catch (error) {
                            devLog.error('Failed to update number of children:', error, 'page');
                          }
                        }
                      }}
                      className="bg-[var(--m3-surface-container-low)] border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)] placeholder:text-[var(--m3-on-surface-variant)] focus:border-[var(--m3-primary)] focus:shadow-[0_0_0_3px_var(--m3-primary-container)] m3-input-focus backdrop-blur-sm m3-transition-standard"
                      placeholder="Enter number"
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Divination Tool Interests Section */}
        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className={sectionTitleClass}>
              <Sparkles className="w-6 h-6" /> Divination Tool Interests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                'Vedic Astrology', 'Western Astrology', 'Tarot', 'Numerology', 
                'Palmistry', 'Face Reading', 'I Ching', 'Runes', 
                'Dream Analysis', 'Vastu', 'Feng Shui', 'Crystal Healing'
              ].map((tool) => (
                <label key={tool} className={cn(interestChipClass, !isMobileLayout && "hover:border-amber-500/50 transition-all duration-300")}>
                  <input
                    type="checkbox"
                    checked={userProfile?.divinationInterests?.includes(tool) || false}
                    onChange={async (e) => {
                      if (user?.uid) {
                        try {
                          const currentInterests = userProfile?.divinationInterests || [];
                          const newInterests = e.target.checked 
                            ? [...currentInterests, tool]
                            : currentInterests.filter(t => t !== tool);
                          await updateUserProfile(user.uid, { divinationInterests: newInterests });
                          await refreshProfile();
                        } catch (error) {
                          devLog.error('Failed to update divination interests:', error, 'page');
                        }
                      }
                    }}
                    className="rounded border-amber-500/30 bg-slate-800 text-amber-400 focus:ring-amber-400 focus:ring-offset-0"
                  />
                  <span className={cn("text-xs", sublabelClass)}>{tool}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences Section */}
        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className={sectionTitleClass}>
              <Bell className="w-6 h-6" /> Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { key: 'dailyInsights', label: 'Daily Astrological Insights', description: 'Daily personalized insights based on your chart' },
                { key: 'weeklyPredictions', label: 'Weekly Predictions', description: 'Weekly forecasts and upcoming transits' },
                { key: 'monthlyHoroscope', label: 'Monthly Horoscope', description: 'Monthly overview and major themes' },
                { key: 'communityUpdates', label: 'Community Updates', description: 'Updates about community features and discussions' },
                { key: 'newFeatures', label: 'New Features', description: 'Announcements about new tools and features' }
              ].map((pref) => (
                <div key={pref.key} className={notifRowTileClass}>
                  <div className="flex-1 min-w-0 pr-2">
                    <div className={notifTitleClass}>{pref.label}</div>
                    <div className={notifDescClass}>{pref.description}</div>
                  </div>
                  <Switch
                    checked={userProfile?.notificationPreferences?.[pref.key as keyof NonNullable<UserProfile['notificationPreferences']>] ?? 
                      (pref.key === 'communityUpdates' ? false : true)}
                    onCheckedChange={async (checked) => {
                      if (user?.uid) {
                        const current = userProfile?.notificationPreferences;
                        const defaults = { dailyInsights: true, weeklyPredictions: true, monthlyHoroscope: true, communityUpdates: false, newFeatures: true };
                        try {
                          await updateUserProfile(user.uid, { 
                            notificationPreferences: {
                              ...defaults,
                              ...current,
                              [pref.key]: checked
                            } as UserProfile['notificationPreferences']
                          });
                          await refreshProfile();
                        } catch (error) {
                          devLog.error('Failed to update notification preferences:', error, 'page');
                        }
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trial/Subscription Status */}
        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className={sectionTitleClass}>
              <Badge className="bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs">Trial</Badge>
              Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trialStatus ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                {trialStatus.isActive ? (
                  <span className={cn("text-sm", sublabelClass)}>Active ({trialStatus.daysLeft} days left)</span>
                ) : (
                  <span className="text-red-400 text-sm">Expired</span>
                )}
                <span className={cn("text-sm", sublabelClass)}>Upgrade coming soon</span>
              </div>
            ) : (
              <span className={cn("text-sm", sublabelClass)}>No trial info</span>
            )}
          </CardContent>
        </Card>

        {/* Account Management */}
        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className={sectionTitleClass}>
              <LogOut className="w-6 h-6" /> Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn("flex flex-col", isMobileLayout ? "gap-3" : "gap-4")}>
              <button 
                onClick={handleSignOut}
                className={cn(
                  "flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors text-sm font-medium cursor-pointer"
                )}
              >
                <LogOut className="w-5 h-5" /> Sign Out
              </button>
              <button 
                className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors text-sm font-medium cursor-pointer"
                onClick={() => setShowDelete(true)}
              >
                <Trash2 className="w-5 h-5" /> Delete Account
              </button>
              <AnimatePresence>
                {showDelete && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={cn(
                      "mt-4 p-4 border border-red-500/30 rounded-2xl text-red-400 text-center text-sm",
                      isMobileLayout
                        ? "bg-[var(--m3-surface-container-high)]"
                        : "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
                    )}
                  >
                    <div className="mb-2">Are you sure you want to delete your account? This action cannot be undone.</div>
                    <div className="flex gap-4 justify-center mt-4">
                      <Button variant="outline" className={btnOutlineClass} onClick={() => setShowDelete(false)}>Cancel</Button>
                      <Button variant="destructive" className={cn(isMobileLayout ? "border border-red-500/40 bg-[var(--m3-surface-container)] text-red-400 text-sm rounded-xl" : "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-red-500/30 hover:border-red-500/50 text-red-400 text-sm transition-all duration-300")} disabled>Delete (Coming Soon)</Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
