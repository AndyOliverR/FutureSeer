"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DashboardSection } from '../western/DashboardSection'
import { identifyGotra, getSankalpaFormat, isAbhijitNakshatra } from '@/lib/gotraCalculator'
import { getGotraInfo } from '@/lib/gotraData'
import { 
  Crown, 
  Users, 
  BookOpen, 
  Heart, 
  Sparkles,
  Star,
  Moon,
  Shield,
  Flame,
  Info
} from 'lucide-react'

interface GotraTabProps {
  moonNakshatra: string
  moonLongitude: number
  userProfile: any
  chartData: any
}

export function GotraTab({ moonNakshatra, moonLongitude, userProfile, chartData }: GotraTabProps) {
  // Check if Abhijit nakshatra applies
  const adjustedNakshatra = isAbhijitNakshatra(moonLongitude) ? 'Abhijit' : moonNakshatra
  
  // Identify Gotra
  const gotraResult = identifyGotra(
    adjustedNakshatra,
    userProfile?.surname || userProfile?.familyName
  )
  
  const gotraInfo = getGotraInfo(gotraResult.primaryGotra)
  const sankalpaFormat = getSankalpaFormat(gotraResult.primaryGotra)
  
  return (
    <div className="space-y-6">
      {/* Main Gotra Identification */}
      <DashboardSection
        title="Your Gotra (Lineage)"
        icon={<Crown className="w-6 h-6" />}
        badge={gotraResult.confidence}
        colorScheme="purple"
        defaultExpanded={true}
        storageKey="vedic-gotra-main"
      >
        <div className="space-y-4">
          {/* Primary Gotra Display */}
          <Card className="border-2 border-purple-300 shadow-lg rounded-3xl overflow-hidden">
            <div className="h-1 bg-purple-400" />
            <CardContent className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-400/20 rounded-full mb-4">
                <Crown className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-4xl font-bold text-purple-900 mb-2">
                {gotraResult.primaryGotra}
              </h3>
              <p className="text-purple-700 text-xl mb-3">
                Lineage of {gotraResult.sage}
              </p>
              <p className="text-purple-600 text-sm mb-4">
                {gotraResult.sanskritName}
              </p>
              <div className="flex items-center justify-center gap-3">
                <Badge variant={gotraResult.confidence === 'high' ? 'default' : 'secondary'} className="bg-purple-600 text-white">
                  {gotraResult.confidence.toUpperCase()} CONFIDENCE
                </Badge>
                <Badge variant="outline" className="border-purple-400 text-purple-700">
                  {gotraResult.method === 'nakshatra' ? '📿 Nakshatra-based' : 
                   gotraResult.method === 'surname' ? '👨‍👩‍👧‍👦 Surname-based' : 
                   '⭐ Default'}
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          {/* Description */}
          <Card className="border-2 border-purple-200 shadow-md rounded-2xl overflow-hidden">
            <div className="h-0.5 bg-purple-300" />
            <CardContent className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 p-6">
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-purple-900 mb-2">About This Lineage</h4>
                  <p className="text-slate-700 leading-relaxed">{gotraResult.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardSection>
      
      {/* Nakshatra Connection */}
      <DashboardSection
        title="Nakshatra Connection"
        icon={<Moon className="w-6 h-6" />}
        colorScheme="blue"
        defaultExpanded={true}
        storageKey="vedic-gotra-nakshatra"
      >
        <div className="space-y-4">
          <Card className="border-2 border-blue-200 shadow-md rounded-2xl overflow-hidden">
            <div className="h-0.5 bg-blue-300" />
            <CardContent className="bg-gradient-to-br from-blue-50/50 to-cyan-50/50 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Your Birth Star (Janma Nakshatra)
                  </h4>
                  <div className="bg-blue-100 rounded-xl p-4">
                    <p className="text-3xl font-bold text-blue-900 mb-1">{adjustedNakshatra}</p>
                    <p className="text-blue-700 text-sm">Moon's position at birth</p>
                    {adjustedNakshatra === 'Abhijit' && (
                      <Badge className="mt-2 bg-blue-600 text-white">
                        Special 28th Nakshatra
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Why This Gotra?
                  </h4>
                  <p className="text-slate-700 leading-relaxed text-sm">
                    According to the ancient Vedic text <span className="font-semibold italic">Kalaprakashika</span>, 
                    the 28 Nakshatras are divided into 7 groups, each governed by one of the Saptarishis (seven great sages). 
                    Your Moon Nakshatra <span className="font-semibold text-blue-900">{adjustedNakshatra}</span> falls 
                    under the {gotraResult.primaryGotra} lineage.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Show all Nakshatras in this Gotra */}
          {gotraInfo && gotraInfo.nakshatras.length > 0 && (
            <Card className="border-2 border-blue-200 shadow-md rounded-2xl overflow-hidden">
              <div className="h-0.5 bg-blue-300" />
              <CardContent className="bg-gradient-to-br from-blue-50/50 to-cyan-50/50 p-6">
                <h4 className="font-semibold text-blue-900 mb-3">All Nakshatras in {gotraResult.primaryGotra} Gotra</h4>
                <div className="flex flex-wrap gap-2">
                  {gotraInfo.nakshatras.map((nak) => (
                    <Badge 
                      key={nak} 
                      variant={nak === adjustedNakshatra ? 'default' : 'secondary'}
                      className={nak === adjustedNakshatra ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'}
                    >
                      {nak}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardSection>
      
      {/* Gotra Characteristics */}
      <DashboardSection
        title="Lineage Characteristics"
        icon={<Sparkles className="w-6 h-6" />}
        colorScheme="pink"
        defaultExpanded={true}
        storageKey="vedic-gotra-characteristics"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Personal Traits */}
          <Card className="border-2 border-pink-200 shadow-md rounded-2xl overflow-hidden">
            <div className="h-0.5 bg-pink-300" />
            <CardHeader className="bg-gradient-to-r from-pink-100 to-rose-100">
              <CardTitle className="text-pink-900 text-lg">Personal Traits</CardTitle>
            </CardHeader>
            <CardContent className="bg-gradient-to-br from-pink-50/50 to-rose-50/50 p-4">
              <ul className="space-y-2">
                {gotraResult.characteristics.map((char, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                    <Star className="w-4 h-4 text-pink-600 mt-0.5 flex-shrink-0" />
                    <span>{char}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          {/* Spiritual Qualities */}
          <Card className="border-2 border-purple-200 shadow-md rounded-2xl overflow-hidden">
            <div className="h-0.5 bg-purple-300" />
            <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100">
              <CardTitle className="text-purple-900 text-lg">Spiritual Qualities</CardTitle>
            </CardHeader>
            <CardContent className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 p-4">
              <ul className="space-y-2">
                {gotraResult.spiritualQualities.map((qual, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                    <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>{qual}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </DashboardSection>
      
      {/* Ritual Usage */}
      <DashboardSection
        title="Ritual Usage & Sankalpa"
        icon={<Flame className="w-6 h-6" />}
        colorScheme="orange"
        defaultExpanded={false}
        storageKey="vedic-gotra-ritual"
      >
        <Card className="border-2 border-orange-200 shadow-md rounded-2xl overflow-hidden">
          <div className="h-0.5 bg-orange-300" />
          <CardContent className="bg-gradient-to-br from-orange-50/50 to-amber-50/50 p-6 space-y-4">
            {/* Sankalpa Format */}
            <div>
              <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                <Flame className="w-5 h-5" />
                Sankalpa Declaration
              </h4>
              <div className="bg-orange-100 rounded-xl p-4 border-2 border-orange-300">
                <p className="text-orange-900 text-lg font-mono text-center">
                  {sankalpaFormat}
                </p>
                <p className="text-orange-700 text-xs text-center mt-2">
                  Pronounced: "{gotraResult.primaryGotra} Gotra-ha"
                </p>
              </div>
            </div>
            
            {/* When to Use */}
            <div>
              <h4 className="font-semibold text-orange-900 mb-2">When to Use Your Gotra</h4>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span><strong>During Puja/Homa:</strong> Declare your Gotra in the Sankalpa (ritual intention)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Marriage Ceremonies:</strong> For Kundli matching and compatibility verification</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Shraddha Rituals:</strong> For ancestral worship and offerings</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Thread Ceremony (Upanayana):</strong> Essential for Brahmin sacred thread rituals</span>
                </li>
              </ul>
            </div>
            
            {/* Ritual Significance */}
            <div>
              <h4 className="font-semibold text-orange-900 mb-2">Ritual Significance</h4>
              <p className="text-slate-700 text-sm leading-relaxed">
                {gotraResult.ritualUse}
              </p>
            </div>
            
            {/* Mantra */}
            {gotraResult.mantra && (
              <div>
                <h4 className="font-semibold text-orange-900 mb-2">Gotra Mantra</h4>
                <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-xl p-4 border border-orange-300">
                  <p className="text-orange-900 text-lg font-semibold text-center font-serif">
                    {gotraResult.mantra}
                  </p>
                  {gotraResult.deity && (
                    <p className="text-orange-700 text-xs text-center mt-2">
                      Associated Deity: {gotraResult.deity}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </DashboardSection>
      
      {/* Marriage Compatibility */}
      <DashboardSection
        title="Marriage & Compatibility"
        icon={<Heart className="w-6 h-6" />}
        colorScheme="pink"
        defaultExpanded={false}
        storageKey="vedic-gotra-marriage"
      >
        <Card className="border-2 border-pink-200 shadow-md rounded-2xl overflow-hidden">
          <div className="h-0.5 bg-pink-300" />
          <CardContent className="bg-gradient-to-br from-pink-50/50 to-rose-50/50 p-6 space-y-4">
            {/* Marriage Rule */}
            <div className="bg-pink-100 rounded-xl p-4 border-2 border-pink-300">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-pink-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-pink-900 mb-2">Traditional Marriage Rule</h4>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {gotraResult.marriageGuidance}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Why Gotra Matters in Marriage */}
            <div>
              <h4 className="font-semibold text-pink-900 mb-3">Why Gotra Matters in Kundli Matching</h4>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <Heart className="w-4 h-4 text-pink-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Genetic Diversity:</strong> Prevents marriage within close bloodlines</span>
                </li>
                <li className="flex items-start gap-2">
                  <Heart className="w-4 h-4 text-pink-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Spiritual Compatibility:</strong> Different lineages bring complementary energies</span>
                </li>
                <li className="flex items-start gap-2">
                  <Heart className="w-4 h-4 text-pink-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Karmic Balance:</strong> Unites different ancestral karmas for spiritual growth</span>
                </li>
                <li className="flex items-start gap-2">
                  <Heart className="w-4 h-4 text-pink-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Family Harmony:</strong> Ensures healthy family dynamics and offspring</span>
                </li>
              </ul>
            </div>
            
            {/* Gotra Compatibility Check */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-200">
              <p className="text-sm text-slate-600 italic">
                💡 <strong>Tip:</strong> When checking marriage compatibility, ensure both partners have different Gotras. 
                Use the Compatibility tab to perform comprehensive Kundli matching including Gotra verification.
              </p>
            </div>
          </CardContent>
        </Card>
      </DashboardSection>
      
      {/* Alternative Gotras (if surname provided) */}
      {gotraResult.alternativeGotras.length > 0 && (
        <DashboardSection
          title="Alternative Possibilities"
          icon={<Users className="w-6 h-6" />}
          badge={`${gotraResult.alternativeGotras.length} found`}
          colorScheme="cyan"
          defaultExpanded={false}
          storageKey="vedic-gotra-alternatives"
        >
          <Card className="border-2 border-cyan-200 shadow-md rounded-2xl overflow-hidden">
            <div className="h-0.5 bg-cyan-300" />
            <CardContent className="bg-gradient-to-br from-cyan-50/50 to-blue-50/50 p-6">
              <div className="mb-4">
                <h4 className="font-semibold text-cyan-900 mb-2">Based on Surname: {userProfile?.surname || userProfile?.familyName}</h4>
                <p className="text-sm text-slate-600 mb-3">
                  Your surname suggests these alternative Gotras. However, the Nakshatra-based method is considered more reliable in classical texts.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2 min-w-0">
                {gotraResult.alternativeGotras.map((gotra) => {
                  const altGotraInfo = getGotraInfo(gotra)
                  return (
                    <div key={gotra} className="bg-cyan-100 rounded-xl p-3 border border-cyan-300 flex-1 min-w-[140px] md:min-w-[200px]">
                      <p className="font-semibold text-cyan-900">{gotra}</p>
                      {altGotraInfo && (
                        <p className="text-xs text-cyan-700 mt-1">{altGotraInfo.sage}</p>
                      )}
                    </div>
                  )
                })}
              </div>
              
              <div className="mt-4 bg-amber-50 rounded-xl p-3 border border-amber-300">
                <p className="text-xs text-amber-800">
                  <strong>Note:</strong> If you know your family's traditional Gotra and it differs from the Nakshatra-based identification, 
                  you should use your family's Gotra, as patrilineal tradition takes precedence.
                </p>
              </div>
            </CardContent>
          </Card>
        </DashboardSection>
      )}
      
      {/* Educational Content */}
      <DashboardSection
        title="About Gotra & The Saptarishis"
        icon={<BookOpen className="w-6 h-6" />}
        colorScheme="amber"
        defaultExpanded={false}
        storageKey="vedic-gotra-education"
      >
        <div className="space-y-4">
          {/* What is Gotra */}
          <Card className="border-2 border-amber-200 shadow-md rounded-2xl overflow-hidden">
            <div className="h-0.5 bg-amber-300" />
            <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
              <CardTitle className="text-amber-900 text-lg">What is Gotra?</CardTitle>
            </CardHeader>
            <CardContent className="bg-gradient-to-br from-amber-50/50 to-yellow-50/50 p-6">
              <p className="text-slate-700 leading-relaxed mb-4">
                <strong>Gotra</strong> (गोत्र) literally means "cow pen" but refers to a clan or lineage. 
                It represents an unbroken patrilineal (father-to-son) descent from one of the ancient Vedic sages (Rishis). 
                In Hindu tradition, knowing your Gotra connects you to your spiritual ancestors and guides your participation in Vedic rituals.
              </p>
              
              <div className="bg-amber-100 rounded-xl p-4">
                <h5 className="font-semibold text-amber-900 mb-2">Key Points:</h5>
                <ul className="space-y-1 text-sm text-slate-700">
                  <li>• Passed down through the male line (father to children)</li>
                  <li>• Essential for Vedic rituals and ceremonies</li>
                  <li>• Used to prevent marriages within the same lineage</li>
                  <li>• Connects you to an ancient sage's spiritual lineage</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          
          {/* The Seven Sages */}
          <Card className="border-2 border-amber-200 shadow-md rounded-2xl overflow-hidden">
            <div className="h-0.5 bg-amber-300" />
            <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
              <CardTitle className="text-amber-900 text-lg">The Saptarishis (Seven Great Sages)</CardTitle>
            </CardHeader>
            <CardContent className="bg-gradient-to-br from-amber-50/50 to-yellow-50/50 p-6">
              <p className="text-slate-700 text-sm mb-4">
                The seven primary Gotras trace back to the Saptarishis, the seven celestial sages who are 
                considered mind-born sons of Brahma. They are also represented as the seven stars of the Big Dipper constellation.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {['Marichi', 'Vashistha', 'Angiras', 'Atri', 'Pulastya', 'Pulaha', 'Kratu'].map((sage) => (
                  <div key={sage} className="bg-amber-100 rounded-lg p-3 border border-amber-300">
                    <p className={`font-semibold ${sage === gotraResult.primaryGotra ? 'text-amber-900 text-lg' : 'text-amber-800'}`}>
                      {sage === gotraResult.primaryGotra && '⭐ '}{sage}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* How Gotra is Determined */}
          <Card className="border-2 border-amber-200 shadow-md rounded-2xl overflow-hidden">
            <div className="h-0.5 bg-amber-300" />
            <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
              <CardTitle className="text-amber-900 text-lg">How We Determine Your Gotra</CardTitle>
            </CardHeader>
            <CardContent className="bg-gradient-to-br from-amber-50/50 to-yellow-50/50 p-6">
              <div className="space-y-3 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Nakshatra Method (Primary)</p>
                    <p className="text-slate-600">
                      We use your Moon's Nakshatra at birth to determine Gotra according to the classical text 
                      <em> Kalaprakashika</em>. This method divides the 28 Nakshatras into 7 groups, each governed by one Saptarishi.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Surname Validation (Secondary)</p>
                    <p className="text-slate-600">
                      If you've provided a surname, we check it against traditional Gotra-surname mappings 
                      to offer alternative possibilities based on family tradition.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Family Tradition (Ultimate)</p>
                    <p className="text-slate-600">
                      If your family has preserved knowledge of your Gotra, that tradition supersedes all calculations. 
                      Gotra is ultimately passed through patrilineal family knowledge.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardSection>
      
      {/* Important Notes */}
      <Card className="border-2 border-slate-300 shadow-md rounded-2xl overflow-hidden">
        <div className="h-0.5 bg-slate-400" />
        <CardContent className="bg-gradient-to-br from-slate-50 to-gray-50 p-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-slate-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Important Information</h4>
              <div className="space-y-2 text-sm text-slate-700">
                <p>
                  <strong>Accuracy Note:</strong> This Gotra identification is based on classical Vedic texts and your Moon's Nakshatra. 
                  While scripturally sound, your family's traditional Gotra (if known) should always take precedence.
                </p>
                <p>
                  <strong>Regional Variations:</strong> Some communities follow different Gotra systems or have their own lineage traditions. 
                  This tool follows the Saptarishi classification from Kalaprakashika.
                </p>
                <p>
                  <strong>Privacy:</strong> Your Gotra is personal cultural information. We store it securely and never share it without your consent.
                </p>
                <p>
                  <strong>When in Doubt:</strong> If your calculated Gotra differs from your family's known Gotra, please consult 
                  with elders or a qualified Vedic priest. Family tradition is the ultimate authority.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
