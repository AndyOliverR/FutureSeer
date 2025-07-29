"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  Star, 
  Shield, 
  MessageCircle, 
  Calendar, 
  MapPin, 
  Award,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  Globe,
  BookOpen,
  Heart,
  Sparkles,
  Filter,
  Search
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/components/ui/use-toast'

interface Expert {
  id: string
  name: string
  avatar: string
  specialties: string[]
  experience: number
  rating: number
  reviews: number
  location: string
  languages: string[]
  availability: string
  hourlyRate: number
  isVerified: boolean
  isOnline: boolean
  description: string
  certifications: string[]
  lastActive: string
}

interface ExpertApplication {
  name: string
  email: string
  specialties: string[]
  experience: string
  certifications: string
  description: string
  socialLinks: {
    website?: string
    linkedin?: string
    instagram?: string
  }
  availability: string
  hourlyRate: number
}

export default function CommunityPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [experts, setExperts] = useState<Expert[]>([])
  const [filteredExperts, setFilteredExperts] = useState<Expert[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('all')
  const [showApplication, setShowApplication] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [application, setApplication] = useState<ExpertApplication>({
    name: '',
    email: '',
    specialties: [],
    experience: '',
    certifications: '',
    description: '',
    socialLinks: {},
    availability: '',
    hourlyRate: 0
  })

  const specialties = [
    'Vedic Astrology', 'Western Astrology', 'Numerology', 'Tarot Reading',
    'Palmistry', 'Face Reading', 'I Ching', 'Runes', 'Dream Analysis',
    'Crystal Healing', 'Meditation', 'Spiritual Counseling', 'Energy Healing'
  ]

  // Mock experts data
  useEffect(() => {
    const mockExperts: Expert[] = [
      {
        id: '1',
        name: 'Dr. Maya Sharma',
        avatar: '/placeholder-user.jpg',
        specialties: ['Vedic Astrology', 'Numerology'],
        experience: 15,
        rating: 4.9,
        reviews: 127,
        location: 'Mumbai, India',
        languages: ['English', 'Hindi', 'Sanskrit'],
        availability: 'Mon-Fri, 9 AM - 6 PM IST',
        hourlyRate: 2500,
        isVerified: true,
        isOnline: true,
        description: 'Renowned Vedic astrologer with 15+ years of experience. Specializes in birth chart analysis and life path guidance.',
        certifications: ['PhD in Astrology', 'Certified Vedic Astrologer'],
        lastActive: '2 minutes ago'
      },
      {
        id: '2',
        name: 'Sarah Chen',
        avatar: '/placeholder-user.jpg',
        specialties: ['Tarot Reading', 'Energy Healing'],
        experience: 8,
        rating: 4.8,
        reviews: 89,
        location: 'San Francisco, CA',
        languages: ['English', 'Mandarin'],
        availability: 'Tue-Sat, 10 AM - 8 PM PST',
        hourlyRate: 180,
        isVerified: true,
        isOnline: false,
        description: 'Intuitive tarot reader and energy healer. Helps clients find clarity and balance through spiritual guidance.',
        certifications: ['Certified Tarot Reader', 'Reiki Master'],
        lastActive: '1 hour ago'
      },
      {
        id: '3',
        name: 'Ravi Patel',
        avatar: '/placeholder-user.jpg',
        specialties: ['Palmistry', 'Face Reading'],
        experience: 12,
        rating: 4.7,
        reviews: 156,
        location: 'Delhi, India',
        languages: ['English', 'Hindi', 'Gujarati'],
        availability: 'Daily, 11 AM - 9 PM IST',
        hourlyRate: 2000,
        isVerified: true,
        isOnline: true,
        description: 'Expert palmist and face reader with deep knowledge of ancient Indian wisdom traditions.',
        certifications: ['Master Palmist', 'Face Reading Specialist'],
        lastActive: '5 minutes ago'
      }
    ]
    
    setExperts(mockExperts)
    setFilteredExperts(mockExperts)
  }, [])

  // Filter experts based on search and specialty
  useEffect(() => {
    let filtered = experts

    if (searchTerm) {
      filtered = filtered.filter(expert =>
        expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expert.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
        expert.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(expert =>
        expert.specialties.includes(selectedSpecialty)
      )
    }

    setFilteredExperts(filtered)
  }, [experts, searchTerm, selectedSpecialty])

  const handleSpecialtyToggle = (specialty: string) => {
    setApplication(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }))
  }

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Here you would submit the application to your backend
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: 'Application Submitted! 🌟',
        description: 'Thank you for your interest. We\'ll review your application and get back to you within 3-5 business days.',
      })
      
      setShowApplication(false)
      setApplication({
        name: '',
        email: '',
        specialties: [],
        experience: '',
        certifications: '',
        description: '',
        socialLinks: {},
        availability: '',
        hourlyRate: 0
      })
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: 'Could not submit your application. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 pt-8"
        >
          <h1 className="text-5xl font-bold gold-glow mb-4">🌟 Mystical Community</h1>
          <p className="text-soft leading-relaxed text-lg mb-4">
            Connect with certified mystics, astrologers, and spiritual guides
          </p>
          
          {/* Community Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
            <div className="glass-card rounded-xl p-4 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-amber-400" />
              <div className="text-2xl font-bold text-white">150+</div>
              <div className="text-soft text-sm">Active Members</div>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <Star className="w-8 h-8 mx-auto mb-2 text-amber-400" />
              <div className="text-2xl font-bold text-white">25</div>
              <div className="text-soft text-sm">Verified Experts</div>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 text-amber-400" />
              <div className="text-2xl font-bold text-white">500+</div>
              <div className="text-soft text-sm">Sessions Completed</div>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <Heart className="w-8 h-8 mx-auto mb-2 text-amber-400" />
              <div className="text-2xl font-bold text-white">4.8</div>
              <div className="text-soft text-sm">Average Rating</div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-card rounded-3xl p-6 mb-8 border border-white/10"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-soft/50 w-4 h-4" />
              <Input
                placeholder="Search experts by name, specialty, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 bg-white/5 border-white/20 text-soft"
              />
            </div>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="bg-white/5 border border-white/20 rounded-xl p-3 text-soft"
            >
              <option value="all">All Specialties</option>
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
            <Button
              onClick={() => setShowApplication(true)}
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Become an Expert
            </Button>
          </div>
        </motion.div>

        {/* Experts Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredExperts.map((expert, index) => (
            <motion.div
              key={expert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
            >
              <Card className="glass-card border-white/10 hover:border-amber-400/30 transition-all duration-300">
                <CardContent className="p-6">
                  {/* Expert Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={expert.avatar}
                          alt={expert.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        {expert.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white flex items-center gap-2">
                          {expert.name}
                          {expert.isVerified && (
                            <CheckCircle className="w-4 h-4 text-blue-400" />
                          )}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-soft">
                          <Star className="w-3 h-3 text-amber-400" />
                          <span>{expert.rating}</span>
                          <span>({expert.reviews} reviews)</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-amber-500 text-amber-400">
                      ${expert.hourlyRate}/hr
                    </Badge>
                  </div>

                  {/* Specialties */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {expert.specialties.map((specialty) => (
                        <Badge key={specialty} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-soft text-sm mb-4 line-clamp-3">
                    {expert.description}
                  </p>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-soft">
                      <MapPin className="w-3 h-3" />
                      {expert.location}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-soft">
                      <Clock className="w-3 h-3" />
                      {expert.availability}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-soft">
                      <BookOpen className="w-3 h-3" />
                      {expert.experience} years experience
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-soft"
                    >
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Message
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
                    >
                      Book Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* No Results */}
        {filteredExperts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl gold-glow mb-2">No Experts Found</h3>
            <p className="text-soft">Try adjusting your search criteria</p>
          </motion.div>
        )}

        {/* Expert Application Modal */}
        <AnimatePresence>
          {showApplication && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="text-center mb-6">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-amber-400" />
                  <h2 className="text-2xl font-semibold text-white mb-2">Become a Verified Expert</h2>
                  <p className="text-soft">Join our community of certified mystics and spiritual guides</p>
                </div>

                <form onSubmit={handleApplicationSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-soft text-sm mb-2 block">Full Name *</label>
                      <Input
                        value={application.name}
                        onChange={(e) => setApplication(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Your full name"
                        className="bg-white/5 border-white/20 text-soft"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-soft text-sm mb-2 block">Email *</label>
                      <Input
                        type="email"
                        value={application.email}
                        onChange={(e) => setApplication(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your.email@example.com"
                        className="bg-white/5 border-white/20 text-soft"
                        required
                      />
                    </div>
                  </div>

                  {/* Specialties */}
                  <div>
                    <label className="text-soft text-sm mb-3 block">Areas of Expertise *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {specialties.map((specialty) => (
                        <Button
                          key={specialty}
                          type="button"
                          variant={application.specialties.includes(specialty) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSpecialtyToggle(specialty)}
                          className="justify-start"
                        >
                          {application.specialties.includes(specialty) && <CheckCircle className="w-3 h-3 mr-1" />}
                          {specialty}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="text-soft text-sm mb-2 block">Experience & Background *</label>
                    <Textarea
                      value={application.experience}
                      onChange={(e) => setApplication(prev => ({ ...prev, experience: e.target.value }))}
                      placeholder="Describe your experience, training, and background in your field..."
                      rows={4}
                      className="bg-white/5 border-white/20 text-soft"
                      required
                    />
                  </div>

                  {/* Certifications */}
                  <div>
                    <label className="text-soft text-sm mb-2 block">Certifications & Qualifications</label>
                    <Textarea
                      value={application.certifications}
                      onChange={(e) => setApplication(prev => ({ ...prev, certifications: e.target.value }))}
                      placeholder="List your certifications, degrees, or qualifications..."
                      rows={3}
                      className="bg-white/5 border-white/20 text-soft"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-soft text-sm mb-2 block">About Your Practice *</label>
                    <Textarea
                      value={application.description}
                      onChange={(e) => setApplication(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your approach, philosophy, and how you help clients..."
                      rows={4}
                      className="bg-white/5 border-white/20 text-soft"
                      required
                    />
                  </div>

                  {/* Availability & Rate */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-soft text-sm mb-2 block">Availability *</label>
                      <Input
                        value={application.availability}
                        onChange={(e) => setApplication(prev => ({ ...prev, availability: e.target.value }))}
                        placeholder="e.g., Mon-Fri, 9 AM - 6 PM"
                        className="bg-white/5 border-white/20 text-soft"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-soft text-sm mb-2 block">Hourly Rate (USD) *</label>
                      <Input
                        type="number"
                        value={application.hourlyRate}
                        onChange={(e) => setApplication(prev => ({ ...prev, hourlyRate: parseInt(e.target.value) || 0 }))}
                        placeholder="50"
                        className="bg-white/5 border-white/20 text-soft"
                        required
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowApplication(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
                    >
                      {isLoading ? (
                        <>
                          <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Award className="w-4 h-4 mr-2" />
                          Submit Application
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 