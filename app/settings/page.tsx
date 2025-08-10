"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "react-i18next"
import { useSettings } from "@/hooks/useSettings"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, User, LogOut, Trash2, CheckCircle, XCircle, Moon, Sun, Bell, Globe, Mic, Mail } from "lucide-react"

export default function SettingsPage() {
  const { t } = useTranslation('common')
  const {
    settings,
    loading,
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

  // Format date from YYYY-MM-DD to DD/MM/YYYY
  const formatBirthDate = (dateString: string) => {
    if (!dateString) return "-"
    try {
      const [year, month, day] = dateString.split('-')
      return `${day}/${month}/${year}`
    } catch {
      return dateString
    }
  }

  // Format time from 24-hour to 12-hour format
  const formatBirthTime = (timeString: string) => {
    if (!timeString) return "-"
    try {
      const [hours, minutes] = timeString.split(':')
      const hour24 = parseInt(hours)
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
      const ampm = hour24 >= 12 ? 'PM' : 'AM'
      return `${hour12}:${minutes} ${ampm}`
    } catch {
      return timeString
    }
  }

  // Format birth place to show City, State/Region, Country
  const formatBirthPlace = (placeString: string) => {
    if (!placeString) return "-"
    
    // Check if it's already in proper format (City, State, Country - 3 parts)
    const parts = placeString.split(',').map(part => part.trim())
    if (parts.length >= 3) {
      return placeString // Already has City, State, Country
    }
    
    // If it has 2 parts (City, Country), try to enhance with state/region
    if (parts.length === 2) {
      const [city, country] = parts
      const normalizedCity = city.toLowerCase().trim()
      
      // Enhanced location mapping for 2-part locations (City, Country)
      const enhancementMappings: { [key: string]: string } = {
        // India - Add states to City, India format
        'mysore': 'Mysore, Karnataka, India',
        'bangalore': 'Bangalore, Karnataka, India',
        'bengaluru': 'Bengaluru, Karnataka, India',
        'mumbai': 'Mumbai, Maharashtra, India',
        'delhi': 'Delhi, Delhi, India',
        'chennai': 'Chennai, Tamil Nadu, India',
        'kolkata': 'Kolkata, West Bengal, India',
        'hyderabad': 'Hyderabad, Telangana, India',
        'pune': 'Pune, Maharashtra, India',
        'jaipur': 'Jaipur, Rajasthan, India',
        'lucknow': 'Lucknow, Uttar Pradesh, India',
        'kanpur': 'Kanpur, Uttar Pradesh, India',
        'nagpur': 'Nagpur, Maharashtra, India',
        'indore': 'Indore, Madhya Pradesh, India',
        'thane': 'Thane, Maharashtra, India',
        'bhopal': 'Bhopal, Madhya Pradesh, India',
        'visakhapatnam': 'Visakhapatnam, Andhra Pradesh, India',
        'pimpri': 'Pimpri-Chinchwad, Maharashtra, India',
        'patna': 'Patna, Bihar, India',
        'vadodara': 'Vadodara, Gujarat, India',
        'ghaziabad': 'Ghaziabad, Uttar Pradesh, India',
        'ludhiana': 'Ludhiana, Punjab, India',
        'agra': 'Agra, Uttar Pradesh, India',
        'nashik': 'Nashik, Maharashtra, India',
        'faridabad': 'Faridabad, Haryana, India',
        'meerut': 'Meerut, Uttar Pradesh, India',
        'rajkot': 'Rajkot, Gujarat, India',
        'kalyan': 'Kalyan-Dombivali, Maharashtra, India',
        'vasai': 'Vasai-Virar, Maharashtra, India',
        'varanasi': 'Varanasi, Uttar Pradesh, India',
        'srinagar': 'Srinagar, Jammu and Kashmir, India',
        'aurangabad': 'Aurangabad, Maharashtra, India',
        'dhanbad': 'Dhanbad, Jharkhand, India',
        'amritsar': 'Amritsar, Punjab, India',
        'navi mumbai': 'Navi Mumbai, Maharashtra, India',
        'allahabad': 'Allahabad, Uttar Pradesh, India',
        'prayagraj': 'Prayagraj, Uttar Pradesh, India',
        'howrah': 'Howrah, West Bengal, India',
        'ranchi': 'Ranchi, Jharkhand, India',
        'gwalior': 'Gwalior, Madhya Pradesh, India',
        'jabalpur': 'Jabalpur, Madhya Pradesh, India',
        'coimbatore': 'Coimbatore, Tamil Nadu, India',
        'vijayawada': 'Vijayawada, Andhra Pradesh, India',
        'jodhpur': 'Jodhpur, Rajasthan, India',
        'madurai': 'Madurai, Tamil Nadu, India',
        'raipur': 'Raipur, Chhattisgarh, India',
        'kota': 'Kota, Rajasthan, India',
        'chandigarh': 'Chandigarh, Chandigarh, India',
        'guwahati': 'Guwahati, Assam, India'
      }
      
      // Try to enhance if it's India and we know the state
      if (country.toLowerCase().includes('india')) {
        const enhanced = enhancementMappings[normalizedCity]
        if (enhanced) {
          return enhanced
        }
      }
      
      // If no enhancement found, return original
      return placeString
    }
    
    // Enhanced location mapping for better geographical context
    const locationMappings: { [key: string]: string } = {
      // India - Major cities with states
      'mysore': 'Mysore, Karnataka, India',
      'bangalore': 'Bangalore, Karnataka, India',
      'bengaluru': 'Bengaluru, Karnataka, India',
      'mumbai': 'Mumbai, Maharashtra, India',
      'delhi': 'Delhi, Delhi, India',
      'chennai': 'Chennai, Tamil Nadu, India',
      'kolkata': 'Kolkata, West Bengal, India',
      'hyderabad': 'Hyderabad, Telangana, India',
      'pune': 'Pune, Maharashtra, India',
      'jaipur': 'Jaipur, Rajasthan, India',
      'lucknow': 'Lucknow, Uttar Pradesh, India',
      'kanpur': 'Kanpur, Uttar Pradesh, India',
      'nagpur': 'Nagpur, Maharashtra, India',
      'indore': 'Indore, Madhya Pradesh, India',
      'thane': 'Thane, Maharashtra, India',
      'bhopal': 'Bhopal, Madhya Pradesh, India',
      'visakhapatnam': 'Visakhapatnam, Andhra Pradesh, India',
      'pimpri': 'Pimpri-Chinchwad, Maharashtra, India',
      'patna': 'Patna, Bihar, India',
      'vadodara': 'Vadodara, Gujarat, India',
      'ghaziabad': 'Ghaziabad, Uttar Pradesh, India',
      'ludhiana': 'Ludhiana, Punjab, India',
      'agra': 'Agra, Uttar Pradesh, India',
      'nashik': 'Nashik, Maharashtra, India',
      'faridabad': 'Faridabad, Haryana, India',
      'meerut': 'Meerut, Uttar Pradesh, India',
      'rajkot': 'Rajkot, Gujarat, India',
      'kalyan': 'Kalyan-Dombivali, Maharashtra, India',
      'vasai': 'Vasai-Virar, Maharashtra, India',
      'varanasi': 'Varanasi, Uttar Pradesh, India',
      'srinagar': 'Srinagar, Jammu and Kashmir, India',
      'aurangabad': 'Aurangabad, Maharashtra, India',
      'dhanbad': 'Dhanbad, Jharkhand, India',
      'amritsar': 'Amritsar, Punjab, India',
      'navi mumbai': 'Navi Mumbai, Maharashtra, India',
      'allahabad': 'Allahabad, Uttar Pradesh, India',
      'prayagraj': 'Prayagraj, Uttar Pradesh, India',
      'howrah': 'Howrah, West Bengal, India',
      'ranchi': 'Ranchi, Jharkhand, India',
      'gwalior': 'Gwalior, Madhya Pradesh, India',
      'jabalpur': 'Jabalpur, Madhya Pradesh, India',
      'coimbatore': 'Coimbatore, Tamil Nadu, India',
      'vijayawada': 'Vijayawada, Andhra Pradesh, India',
      'jodhpur': 'Jodhpur, Rajasthan, India',
      'madurai': 'Madurai, Tamil Nadu, India',
      'raipur': 'Raipur, Chhattisgarh, India',
      'kota': 'Kota, Rajasthan, India',
      'chandigarh': 'Chandigarh, Chandigarh, India',
      'guwahati': 'Guwahati, Assam, India',
      
      // USA - Major cities
      'new york': 'New York, New York, USA',
      'los angeles': 'Los Angeles, California, USA',
      'chicago': 'Chicago, Illinois, USA',
      'houston': 'Houston, Texas, USA',
      'phoenix': 'Phoenix, Arizona, USA',
      'philadelphia': 'Philadelphia, Pennsylvania, USA',
      'san antonio': 'San Antonio, Texas, USA',
      'san diego': 'San Diego, California, USA',
      'dallas': 'Dallas, Texas, USA',
      'san jose': 'San Jose, California, USA',
      'austin': 'Austin, Texas, USA',
      'jacksonville': 'Jacksonville, Florida, USA',
      'san francisco': 'San Francisco, California, USA',
      'columbus': 'Columbus, Ohio, USA',
      'fort worth': 'Fort Worth, Texas, USA',
      'charlotte': 'Charlotte, North Carolina, USA',
      'seattle': 'Seattle, Washington, USA',
      'denver': 'Denver, Colorado, USA',
      'boston': 'Boston, Massachusetts, USA',
      'el paso': 'El Paso, Texas, USA',
      'detroit': 'Detroit, Michigan, USA',
      'nashville': 'Nashville, Tennessee, USA',
      'portland': 'Portland, Oregon, USA',
      'memphis': 'Memphis, Tennessee, USA',
      'oklahoma city': 'Oklahoma City, Oklahoma, USA',
      'las vegas': 'Las Vegas, Nevada, USA',
      'louisville': 'Louisville, Kentucky, USA',
      'baltimore': 'Baltimore, Maryland, USA',
      'milwaukee': 'Milwaukee, Wisconsin, USA',
      'albuquerque': 'Albuquerque, New Mexico, USA',
      'tucson': 'Tucson, Arizona, USA',
      'fresno': 'Fresno, California, USA',
      'sacramento': 'Sacramento, California, USA',
      'kansas city': 'Kansas City, Missouri, USA',
      'mesa': 'Mesa, Arizona, USA',
      'atlanta': 'Atlanta, Georgia, USA',
      'omaha': 'Omaha, Nebraska, USA',
      'colorado springs': 'Colorado Springs, Colorado, USA',
      'raleigh': 'Raleigh, North Carolina, USA',
      'miami': 'Miami, Florida, USA',
      'virginia beach': 'Virginia Beach, Virginia, USA',
      'oakland': 'Oakland, California, USA',
      'minneapolis': 'Minneapolis, Minnesota, USA',
      'tulsa': 'Tulsa, Oklahoma, USA',
      'arlington': 'Arlington, Texas, USA',
      'new orleans': 'New Orleans, Louisiana, USA',
      'wichita': 'Wichita, Kansas, USA',
      
      // UK - Major cities
      'london': 'London, England, United Kingdom',
      'birmingham': 'Birmingham, England, United Kingdom',
      'manchester': 'Manchester, England, United Kingdom',
      'glasgow': 'Glasgow, Scotland, United Kingdom',
      'liverpool': 'Liverpool, England, United Kingdom',
      'leeds': 'Leeds, England, United Kingdom',
      'sheffield': 'Sheffield, England, United Kingdom',
      'edinburgh': 'Edinburgh, Scotland, United Kingdom',
      'bristol': 'Bristol, England, United Kingdom',
      'cardiff': 'Cardiff, Wales, United Kingdom',
      'belfast': 'Belfast, Northern Ireland, United Kingdom',
      'newcastle': 'Newcastle, England, United Kingdom',
      'nottingham': 'Nottingham, England, United Kingdom',
      'leicester': 'Leicester, England, United Kingdom',
      'coventry': 'Coventry, England, United Kingdom',
      'bradford': 'Bradford, England, United Kingdom',
      'stoke': 'Stoke-on-Trent, England, United Kingdom',
      'wolverhampton': 'Wolverhampton, England, United Kingdom',
      'plymouth': 'Plymouth, England, United Kingdom',
      'southampton': 'Southampton, England, United Kingdom',
      'reading': 'Reading, England, United Kingdom',
      'derby': 'Derby, England, United Kingdom',
      'luton': 'Luton, England, United Kingdom',
      'aberdeen': 'Aberdeen, Scotland, United Kingdom',
      'portsmouth': 'Portsmouth, England, United Kingdom',
      'york': 'York, England, United Kingdom',
      'peterborough': 'Peterborough, England, United Kingdom',
      'dundee': 'Dundee, Scotland, United Kingdom',
      'lancaster': 'Lancaster, England, United Kingdom',
      'oxford': 'Oxford, England, United Kingdom',
      'cambridge': 'Cambridge, England, United Kingdom',
      
      // Canada - Major cities
      'toronto': 'Toronto, Ontario, Canada',
      'montreal': 'Montreal, Quebec, Canada',
      'vancouver': 'Vancouver, British Columbia, Canada',
      'calgary': 'Calgary, Alberta, Canada',
      'edmonton': 'Edmonton, Alberta, Canada',
      'ottawa': 'Ottawa, Ontario, Canada',
      'winnipeg': 'Winnipeg, Manitoba, Canada',
      'quebec city': 'Quebec City, Quebec, Canada',
      'hamilton': 'Hamilton, Ontario, Canada',
      'kitchener': 'Kitchener, Ontario, Canada',
      'london ontario': 'London, Ontario, Canada',
      'victoria': 'Victoria, British Columbia, Canada',
      'halifax': 'Halifax, Nova Scotia, Canada',
      'oshawa': 'Oshawa, Ontario, Canada',
      'windsor': 'Windsor, Ontario, Canada',
      'saskatoon': 'Saskatoon, Saskatchewan, Canada',
      'regina': 'Regina, Saskatchewan, Canada',
      'st catharines': 'St. Catharines, Ontario, Canada',
      'barrie': 'Barrie, Ontario, Canada',
      'kelowna': 'Kelowna, British Columbia, Canada',
      'abbotsford': 'Abbotsford, British Columbia, Canada',
      'kingston': 'Kingston, Ontario, Canada',
      'sudbury': 'Sudbury, Ontario, Canada',
      'sherbrooke': 'Sherbrooke, Quebec, Canada',
      'saguenay': 'Saguenay, Quebec, Canada',
      'lévis': 'Lévis, Quebec, Canada',
      'trois-rivières': 'Trois-Rivières, Quebec, Canada',
      'guelph': 'Guelph, Ontario, Canada',
      'cambridge ontario': 'Cambridge, Ontario, Canada',
      'whitby': 'Whitby, Ontario, Canada',
      'saanich': 'Saanich, British Columbia, Canada',
      
      // Australia - Major cities
      'sydney': 'Sydney, New South Wales, Australia',
      'melbourne': 'Melbourne, Victoria, Australia',
      'brisbane': 'Brisbane, Queensland, Australia',
      'perth': 'Perth, Western Australia, Australia',
      'adelaide': 'Adelaide, South Australia, Australia',
      'gold coast': 'Gold Coast, Queensland, Australia',
      'newcastle australia': 'Newcastle, New South Wales, Australia',
      'canberra': 'Canberra, Australian Capital Territory, Australia',
      'sunshine coast': 'Sunshine Coast, Queensland, Australia',
      'wollongong': 'Wollongong, New South Wales, Australia',
      'hobart': 'Hobart, Tasmania, Australia',
      'geelong': 'Geelong, Victoria, Australia',
      'townsville': 'Townsville, Queensland, Australia',
      'cairns': 'Cairns, Queensland, Australia',
      'toowoomba': 'Toowoomba, Queensland, Australia',
      'darwin': 'Darwin, Northern Territory, Australia',
      'ballarat': 'Ballarat, Victoria, Australia',
      'bendigo': 'Bendigo, Victoria, Australia',
      'albury': 'Albury, New South Wales, Australia',
      'launceston': 'Launceston, Tasmania, Australia',
      'mackay': 'Mackay, Queensland, Australia',
      'rockhampton': 'Rockhampton, Queensland, Australia',
      'bundaberg': 'Bundaberg, Queensland, Australia',
      'bunbury': 'Bunbury, Western Australia, Australia',
      'coffs harbour': 'Coffs Harbour, New South Wales, Australia',
      'wagga wagga': 'Wagga Wagga, New South Wales, Australia',
      'hervey bay': 'Hervey Bay, Queensland, Australia',
      'mildura': 'Mildura, Victoria, Australia',
      'shepparton': 'Shepparton, Victoria, Australia',
      'port macquarie': 'Port Macquarie, New South Wales, Australia'
    }
    
    // Try to find a match (case insensitive)
    const normalizedInput = placeString.toLowerCase().trim()
    const mappedLocation = locationMappings[normalizedInput]
    
    if (mappedLocation) {
      return mappedLocation
    }
    
    // If no mapping found, try to enhance with common patterns
    if (placeString.toLowerCase().includes('india')) {
      return placeString // Already includes India
    } else if (/^[a-zA-Z\s]+$/.test(placeString) && !placeString.includes(',')) {
      // Single word/phrase that looks like a city name
      return `${placeString}, India` // Default to India for single names
    }
    
    // Return as is if no enhancement possible
    return placeString
  }

  return (
    <div className="min-h-screen bg-fixed bg-center bg-no-repeat overflow-hidden" style={{ 
      backgroundImage: "url('/assets/bg/starfield.avif')",
      backgroundSize: "cover",
      imageRendering: "crisp-edges",
      WebkitImageRendering: "crisp-edges",
      mozImageRendering: "crisp-edges"
    }}>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-transparent to-slate-950/40" />
      <div className="relative z-10 p-4 max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 pt-8"
        >
          <Link href="/dashboard" className="text-amber-200 hover:text-amber-300 mb-4 inline-block transition-all duration-300">
            ← {t('navigation.backToDashboard')}
          </Link>
          <h1 className="text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 mb-4">{t('navigation.settings')}</h1>
          <p className="text-slate-300 font-serif leading-relaxed">{t('settings.managePreferences')}</p>
        </motion.div>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-2xl text-green-300 text-center font-serif flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" /> {success}
              <button onClick={clearMessages} className="ml-2 text-green-200 hover:text-green-100">✕</button>
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-300 text-center font-serif flex items-center justify-center gap-2"
            >
              <XCircle className="w-5 h-5" /> {error}
              <button onClick={clearMessages} className="ml-2 text-red-200 hover:text-red-100">✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile Card */}
        <Card className="backdrop-blur-md bg-slate-900/40 border border-slate-700/50 mb-8 card-glow rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-200 font-serif text-xl">
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
                  <label className="block text-slate-300 font-serif mb-1">Display Name</label>
                  <Input
                    value={profileData.displayName}
                    onChange={e => setProfileData({ ...profileData, displayName: e.target.value })}
                    className="input-glow"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-serif mb-1">Birth Date</label>
                    <Input
                      type="date"
                      value={profileData.birthDate}
                      onChange={e => setProfileData({ ...profileData, birthDate: e.target.value })}
                      className="input-glow"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-serif mb-1">Birth Time</label>
                    <Input
                      type="time"
                      value={profileData.birthTime}
                      onChange={e => setProfileData({ ...profileData, birthTime: e.target.value })}
                      className="input-glow"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-slate-300 font-serif mb-1">Birth Place</label>
                    <Input
                      value={profileData.birthPlace}
                      onChange={e => setProfileData({ ...profileData, birthPlace: e.target.value })}
                      className="input-glow"
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-4">
                  <Button type="submit" className="bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-900 button-glow rounded-xl">Save</Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditingProfile(false)} className="border-slate-600 text-slate-300 rounded-xl">Cancel</Button>
                </div>
              </form>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-slate-300 font-serif">Name:</span>
                  <span className="text-amber-100 font-serif">{userProfile?.displayName || "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-300 font-serif">Birth Date:</span>
                  <span className="text-amber-100 font-serif">{formatBirthDate(userProfile?.birthDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-300 font-serif">Birth Time:</span>
                  <span className="text-amber-100 font-serif">{formatBirthTime(userProfile?.birthTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-300 font-serif">Birth Place:</span>
                  <span className="text-amber-100 font-serif">{formatBirthPlace(userProfile?.birthPlace)}</span>
                </div>
                <Button onClick={() => setIsEditingProfile(true)} className="mt-4 bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-900 button-glow rounded-xl">Edit Profile</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preferences Card */}
        <Card className="backdrop-blur-md bg-slate-900/40 border border-slate-700/50 mb-8 card-glow rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-200 font-serif text-xl">
              <Moon className="w-6 h-6" /> {t('settings.preferences')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sun className="w-5 h-5 text-yellow-300" />
                  <span className="text-slate-300 font-serif">Theme Preference</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'light', label: 'Light', icon: '☀️' },
                    { value: 'dark', label: 'Dark', icon: '🌙' },
                    { value: 'system', label: 'System', icon: '⚙️' }
                  ].map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => updateSetting('theme', theme.value)}
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl font-serif text-sm transition-all duration-300 ${
                        settings.theme === theme.value
                          ? 'bg-gradient-to-r from-amber-600/30 to-yellow-500/30 border border-amber-400/50 text-amber-200 shadow-amber-400/20 shadow-lg'
                          : 'bg-slate-800/40 border border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500/60'
                      }`}
                    >
                      <span className="text-base">{theme.icon}</span>
                      <span>{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-300" />
                  <span className="text-slate-300 font-serif">Notifications</span>
                </div>
                <Switch checked={settings.notifications} onCheckedChange={v => updateSetting('notifications', v)} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-yellow-200" />
                  <span className="text-slate-300 font-serif">Email Updates</span>
                </div>
                <Switch checked={settings.emailUpdates} onCheckedChange={v => updateSetting('emailUpdates', v)} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic className="w-5 h-5 text-blue-300" />
                  <span className="text-slate-300 font-serif">Voice Guidance</span>
                </div>
                <Switch checked={settings.voiceGuidance} onCheckedChange={v => updateSetting('voiceGuidance', v)} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-green-300" />
                  <span className="text-slate-300 font-serif">Language</span>
                </div>
                <select
                  value={settings.language}
                  onChange={e => updateSetting('language', e.target.value)}
                  className="bg-slate-800/50 border border-slate-600 rounded-xl px-3 py-2 text-amber-100 font-serif focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
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

        {/* Trial/Subscription Status */}
        <Card className="backdrop-blur-md bg-slate-900/40 border border-slate-700/50 mb-8 card-glow rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-200 font-serif text-xl">
              <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900">Trial</Badge>
              Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trialStatus ? (
              <div className="flex items-center gap-4">
                {trialStatus.isActive ? (
                  <span className="text-green-400 font-serif">Active ({trialStatus.daysLeft} days left)</span>
                ) : (
                  <span className="text-red-400 font-serif">Expired</span>
                )}
                <span className="text-slate-400 font-serif">Upgrade coming soon</span>
              </div>
            ) : (
              <span className="text-slate-400 font-serif">No trial info</span>
            )}
          </CardContent>
        </Card>

        {/* Account Management */}
        <Card className="backdrop-blur-md bg-slate-900/40 border border-slate-700/50 mb-8 card-glow rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-200 font-serif text-xl">
              <LogOut className="w-6 h-6" /> Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <button className="flex items-center gap-2 text-slate-300 hover:text-slate-100 transition-colors duration-300 font-serif cursor-pointer">
                <LogOut className="w-5 h-5" /> Sign Out
              </button>
              <button 
                className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors duration-300 font-serif cursor-pointer"
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
                    className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300 text-center font-serif"
                  >
                    <div className="mb-2">Are you sure you want to delete your account? This action cannot be undone.</div>
                    <div className="flex gap-4 justify-center mt-4">
                      <Button variant="outline" className="border-slate-600 text-slate-300" onClick={() => setShowDelete(false)}>Cancel</Button>
                      <Button variant="destructive" className="bg-red-600 text-white" disabled>Delete (Coming Soon)</Button>
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
