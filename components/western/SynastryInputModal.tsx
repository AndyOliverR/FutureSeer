"use client";

import React, { useState } from 'react';
import { devLog } from '@/lib/devLogger';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  Heart, 
  Star,
  X,
  Save,
  Plus,
  Trash2,
  Sparkles
} from 'lucide-react';
import { BirthData } from '@/lib/universalOccultService';
import { getCoordinatesWithFallback } from '@/lib/geocoding';

interface PartnerProfile {
  id: string;
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude?: number;
  longitude?: number;
}

interface SynastryInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePartner: (partnerData: BirthData) => void;
  onGenerateSynastry: (partnerData: BirthData) => void;
  existingPartners?: PartnerProfile[];
}

export default function SynastryInputModal({
  isOpen,
  onClose,
  onSavePartner,
  onGenerateSynastry,
  existingPartners = []
}: SynastryInputModalProps) {
  const [currentPartner, setCurrentPartner] = useState<PartnerProfile>({
    id: '',
    name: '',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    latitude: undefined,
    longitude: undefined
  });

  const [isLoadingCoordinates, setIsLoadingCoordinates] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');

  const handleInputChange = (field: keyof PartnerProfile, value: string) => {
    setCurrentPartner(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePlaceChange = async (place: string) => {
    setCurrentPartner(prev => ({ ...prev, birthPlace: place }));
    
    if (place.length > 3) {
      setIsLoadingCoordinates(true);
      try {
        const coords = await getCoordinatesWithFallback(place);
        setCurrentPartner(prev => ({
          ...prev,
          latitude: coords.latitude,
          longitude: coords.longitude
        }));
      } catch (error) {
        devLog.error('Failed to get coordinates:', error, 'SynastryInputModal');
      } finally {
        setIsLoadingCoordinates(false);
      }
    }
  };

  const handleSavePartner = () => {
    if (!currentPartner.name || !currentPartner.birthDate || !currentPartner.birthPlace) {
      return;
    }

    const partnerData: BirthData = {
      birthDate: currentPartner.birthDate,
      birthTime: currentPartner.birthTime || '12:00',
      birthPlace: currentPartner.birthPlace,
      latitude: currentPartner.latitude || 40.7128,
      longitude: currentPartner.longitude || -74.0060
    };

    onSavePartner(partnerData);
    
    // Reset form
    setCurrentPartner({
      id: '',
      name: '',
      birthDate: '',
      birthTime: '',
      birthPlace: '',
      latitude: undefined,
      longitude: undefined
    });
  };

  const handleGenerateSynastry = () => {
    if (!currentPartner.name || !currentPartner.birthDate || !currentPartner.birthPlace) {
      return;
    }

    const partnerData: BirthData = {
      birthDate: currentPartner.birthDate,
      birthTime: currentPartner.birthTime || '12:00',
      birthPlace: currentPartner.birthPlace,
      latitude: currentPartner.latitude || 40.7128,
      longitude: currentPartner.longitude || -74.0060
    };

    onGenerateSynastry(partnerData);
    onClose();
  };

  const handleSelectExistingPartner = (partner: PartnerProfile) => {
    setCurrentPartner(partner);
    setSelectedPartnerId(partner.id);
  };

  const isFormValid = currentPartner.name && currentPartner.birthDate && currentPartner.birthPlace;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900/95 border border-slate-700/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-300">
            <Heart className="w-6 h-6" />
            Synastry Chart - Partner Birth Details
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Partner Input Form */}
          <div className="space-y-6">
            <Card className="backdrop-blur-md bg-slate-800/40 border border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-300">
                  <Users className="w-5 h-5" />
                  Partner Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="partner-name" className="text-slate-300">Partner Name</Label>
                  <Input
                    id="partner-name"
                    value={currentPartner.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter partner's name"
                    className="bg-slate-800/50 border-slate-600 text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="birth-date" className="text-slate-300">Birth Date</Label>
                    <Input
                      id="birth-date"
                      type="date"
                      value={currentPartner.birthDate}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      className="bg-slate-800/50 border-slate-600 text-slate-100 [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="birth-time" className="text-slate-300">Birth Time</Label>
                    <Input
                      id="birth-time"
                      type="time"
                      value={currentPartner.birthTime}
                      onChange={(e) => handleInputChange('birthTime', e.target.value)}
                      className="bg-slate-800/50 border-slate-600 text-slate-100 [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="birth-place" className="text-slate-300 flex items-center gap-2">
                    Birth Place
                    {isLoadingCoordinates && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-400"></div>
                    )}
                  </Label>
                  <Input
                    id="birth-place"
                    value={currentPartner.birthPlace}
                    onChange={(e) => handlePlaceChange(e.target.value)}
                    placeholder="City, State, Country"
                    className="bg-slate-800/50 border-slate-600 text-slate-100"
                  />
                  {currentPartner.latitude && currentPartner.longitude && (
                    <p className="text-xs text-green-400 mt-1">
                      ✓ Coordinates found: {currentPartner.latitude.toFixed(4)}, {currentPartner.longitude.toFixed(4)}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSavePartner}
                    disabled={!isFormValid}
                    className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Partner
                  </Button>
                  <Button
                    onClick={handleGenerateSynastry}
                    disabled={!isFormValid}
                    className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate Synastry
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Saved Partners */}
            {existingPartners.length > 0 && (
              <Card className="backdrop-blur-md bg-slate-800/40 border border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-300">
                    <Star className="w-5 h-5" />
                    Saved Partners
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {existingPartners.map((partner) => (
                      <motion.div
                        key={partner.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedPartnerId === partner.id
                            ? 'bg-amber-500/20 border-amber-500/50'
                            : 'bg-slate-700/30 border-slate-600/50 hover:bg-slate-700/50'
                        }`}
                        onClick={() => handleSelectExistingPartner(partner)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-200">{partner.name}</p>
                            <p className="text-sm text-slate-400">
                              {partner.birthDate} • {partner.birthPlace}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle delete partner
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Synastry Preview & Information */}
          <div className="space-y-6">
            <Card className="backdrop-blur-md bg-slate-800/40 border border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-300">
                  <Heart className="w-5 h-5" />
                  Synastry Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-slate-300 text-sm">
                  <p className="mb-3">
                    Synastry charts compare two birth charts to reveal relationship dynamics, 
                    compatibility, and areas of harmony or challenge.
                  </p>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-amber-300">What You'll See:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Planetary aspects between both charts</li>
                      <li>• Compatibility scores by category</li>
                      <li>• Relationship strengths and challenges</li>
                      <li>• Communication and emotional patterns</li>
                      <li>• Long-term relationship potential</li>
                    </ul>
                  </div>
                </div>

                {isFormValid && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50"
                  >
                    <h4 className="font-semibold text-amber-300 mb-2">Ready to Analyze:</h4>
                    <div className="space-y-1 text-sm text-slate-300">
                      <p><strong>Partner:</strong> {currentPartner.name}</p>
                      <p><strong>Birth:</strong> {currentPartner.birthDate} at {currentPartner.birthTime || '12:00'}</p>
                      <p><strong>Location:</strong> {currentPartner.birthPlace}</p>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Compatibility Tips */}
            <Card className="backdrop-blur-md bg-slate-800/40 border border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-amber-300">Synastry Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-400 text-xs">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-200">Sun-Moon aspects</p>
                    <p className="text-slate-400">Reveal emotional compatibility and life rhythm harmony</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-400 text-xs">💫</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-200">Venus-Mars aspects</p>
                    <p className="text-slate-400">Show romantic attraction and physical chemistry</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-400 text-xs">⚡</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-200">Mercury aspects</p>
                    <p className="text-slate-400">Indicate communication style and intellectual connection</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-700/50">
          <Button
            onClick={onClose}
            variant="outline"
            className="bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
