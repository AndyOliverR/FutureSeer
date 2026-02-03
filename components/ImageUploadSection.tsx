'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Camera, 
  Upload, 
  Hand, 
  User, 
  X, 
  RotateCcw, 
  Check,
  AlertCircle,
  Smartphone,
  Monitor
} from 'lucide-react';

interface ImageUploadSectionProps {
  type: 'face' | 'palm';
  currentImage?: string;
  onImageChange: (file: File, previewUrl: string) => void;
  onImageRemove: () => void;
  gender?: 'male' | 'female' | 'non-binary' | '';
  isEditing?: boolean;
}

export function ImageUploadSection({
  type,
  currentImage,
  onImageChange,
  onImageRemove,
  gender,
  isEditing = false
}: ImageUploadSectionProps) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Initialize imageLoading based on whether image exists - if image exists, don't start with loading=true
  const [imageLoading, setImageLoading] = useState(() => !currentImage);
  const [imageError, setImageError] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get palm instructions based on gender
  const getPalmInstructions = () => {
    if (type !== 'palm') return '';
    
    switch (gender) {
      case 'male':
        return 'Upload your RIGHT palm for palmistry analysis (traditional practice)';
      case 'female':
        return 'Upload your LEFT palm for palmistry analysis (traditional practice)';
      case 'non-binary':
        return 'Upload both palms for comprehensive palmistry analysis';
      default:
        return 'Upload both palms for comprehensive palmistry analysis';
    }
  };

  // Get title and icon based on type
  const getTypeInfo = () => {
    if (type === 'face') {
      return {
        title: 'Face Photo',
        icon: '📸',
        description: 'For face reading and personality analysis',
        instructions: 'Upload a clear, well-lit photo of your face'
      };
    } else {
      return {
        title: 'Palm Photo',
        icon: '🤲',
        description: 'For palmistry and life path analysis',
        instructions: getPalmInstructions()
      };
    }
  };

  const typeInfo = getTypeInfo();

  // Open camera
  const openCamera = useCallback(async () => {
    try {
      setError(null);
      setIsCapturing(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: type === 'face' ? 'user' : 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraOpen(true);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Unable to access camera. Please check permissions or use file upload instead.');
    } finally {
      setIsCapturing(false);
    }
  }, [type]);

  // Close camera
  const closeCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
    setCapturedImage(null);
  }, []);

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageDataUrl);
      }
    }
  }, []);

  // Retake photo
  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
  }, []);

  // Use captured photo
  const useCapturedPhoto = useCallback(() => {
    if (capturedImage) {
      // Convert data URL to File object
      fetch(capturedImage)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `${type}-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
          onImageChange(file, capturedImage);
          closeCamera();
        })
        .catch(err => {
          console.error('Error converting captured image:', err);
          setError('Error processing captured image. Please try again.');
        });
    }
  }, [capturedImage, onImageChange, closeCamera, type]);

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size too large. Please choose an image under 10MB.');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const previewUrl = e.target?.result as string;
        onImageChange(file, previewUrl);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageChange]);

  // Handle drag and drop
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size too large. Please choose an image under 10MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const previewUrl = e.target?.result as string;
        onImageChange(file, previewUrl);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageChange]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  // Reset image loading state when currentImage changes
  useEffect(() => {
    if (currentImage) {
      setImageLoading(true);
      setImageError(false);
      
      // For data URLs, they can load instantly, so check if image is already loaded
      const img = new Image();
      img.onload = () => {
        setImageLoading(false);
        setImageError(false);
      };
      img.onerror = () => {
        setImageLoading(false);
        setImageError(true);
      };
      img.src = currentImage;
      
      // Fallback timeout - show image after 100ms even if onLoad doesn't fire
      // This handles instant-loading data URLs that might load before React updates
      const timeout = setTimeout(() => {
        setImageLoading(false);
      }, 100);
      
      return () => {
        clearTimeout(timeout);
        img.onload = null;
        img.onerror = null;
      };
    } else {
      setImageLoading(false);
      setImageError(false);
    }
  }, [currentImage]);

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-full bg-amber-400/20 border border-amber-400/30">
            {type === 'face' ? <User className="w-4 h-4 text-amber-300" /> : <Hand className="w-4 h-4 text-amber-300" />}
          </div>
          <span className="text-amber-200 font-serif text-lg">{typeInfo.title}</span>
        </div>
        
        {currentImage ? (
          <div className="text-center p-4 bg-slate-800/20 border border-slate-600/30 rounded-xl backdrop-blur-sm">
            {imageLoading && (
              <div className={`mx-auto mb-4 bg-slate-700/50 animate-pulse border-2 border-amber-400/30 ${
                type === 'face' ? 'w-32 h-32 rounded-full' : 'w-32 h-32 rounded-lg'
              }`} />
            )}
            <img
              src={currentImage}
              alt={`${type} photo`}
              className={`mx-auto mb-4 object-cover border-2 border-amber-400 shadow-lg ${
                type === 'face' ? 'w-32 h-32 rounded-full' : 'w-32 h-32 rounded-lg'
              } ${imageLoading ? 'hidden' : ''}`}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
                console.error(`Failed to load ${type} image:`, currentImage);
              }}
            />
            {!imageError ? (
              <div className="flex items-center justify-center gap-2 text-sm text-emerald-300 font-serif">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span>✅ {typeInfo.title} uploaded</span>
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              </div>
            ) : (
              <div className="text-red-300 text-sm">Failed to load image</div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-slate-800/40 border border-slate-600/50 rounded-xl text-slate-400 font-serif backdrop-blur-sm text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
              <span className="text-slate-500">Not uploaded</span>
              <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-1.5 rounded-full bg-amber-400/20 border border-amber-400/30">
          {type === 'face' ? <User className="w-4 h-4 text-amber-300" /> : <Hand className="w-4 h-4 text-amber-300" />}
        </div>
        <span className="text-amber-200 font-serif text-lg">{typeInfo.title}</span>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm backdrop-blur-sm shadow-lg shadow-red-500/10"
        >
          <div className="p-1.5 rounded-full bg-red-500/20 border border-red-400/30">
            <AlertCircle className="w-4 h-4" />
          </div>
          <span className="font-serif">{error}</span>
        </motion.div>
      )}

      {/* Current Image Display */}
      {currentImage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-6 bg-slate-800/20 border border-slate-600/30 rounded-xl backdrop-blur-sm"
        >
          <img
            src={currentImage}
            alt={`${type} photo`}
            className={`mx-auto mb-4 object-cover border-2 border-amber-400 shadow-lg ${
              type === 'face' ? 'w-32 h-32 rounded-full' : 'w-32 h-32 rounded-lg'
            }`}
          />
          <Button
            variant="outline"
            onClick={onImageRemove}
            className="group relative overflow-hidden px-6 py-3 rounded-xl bg-gradient-to-r from-slate-800/40 to-slate-700/30 border border-slate-500/50 text-slate-200 font-serif font-semibold hover:from-slate-700/40 hover:to-slate-600/30 hover:border-slate-400/60 hover:text-slate-100 transition-all duration-300 backdrop-blur-sm shadow-lg shadow-slate-500/20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <div className="relative flex items-center justify-center gap-2">
              <X className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span className="transition-transform group-hover:scale-105">Remove Photo</span>
            </div>
          </Button>
        </motion.div>
      )}

      {/* Camera Interface */}
      {isCameraOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-64 object-cover"
              autoPlay
              playsInline
              muted
            />
            {capturedImage && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <img
                  src={capturedImage}
                  alt="Captured photo"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-center gap-3">
            {!capturedImage ? (
              <Button
                onClick={capturePhoto}
                className="group relative overflow-hidden px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/30 text-amber-200 font-serif font-semibold hover:from-amber-400/30 hover:to-yellow-400/30 hover:border-amber-400/50 hover:text-amber-100 transition-all duration-300 backdrop-blur-sm shadow-lg shadow-amber-500/10"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <div className="relative flex items-center justify-center gap-2">
                  <Camera className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span className="transition-transform group-hover:scale-105">Capture Photo</span>
                </div>
              </Button>
            ) : (
              <>
                <Button
                  onClick={retakePhoto}
                  variant="outline"
                  className="group relative overflow-hidden px-6 py-3 rounded-xl bg-gradient-to-r from-slate-700/20 to-slate-600/20 border border-slate-600/40 text-slate-300 font-serif font-semibold hover:from-slate-600/30 hover:to-slate-500/30 hover:border-slate-500/60 hover:text-slate-200 transition-all duration-300 backdrop-blur-sm"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="relative flex items-center justify-center gap-2">
                    <RotateCcw className="w-4 h-4 transition-transform group-hover:scale-110" />
                    <span className="transition-transform group-hover:scale-105">Retake</span>
                  </div>
                </Button>
                <Button
                  onClick={useCapturedPhoto}
                  className="group relative overflow-hidden px-6 py-3 rounded-xl bg-gradient-to-r from-green-600/20 to-emerald-500/20 border border-green-400/30 text-green-200 font-serif font-semibold hover:from-green-500/30 hover:to-emerald-400/30 hover:border-green-400/50 hover:text-green-100 transition-all duration-300 backdrop-blur-sm shadow-lg shadow-green-500/10"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="relative flex items-center justify-center gap-2">
                    <Check className="w-4 h-4 transition-transform group-hover:scale-110" />
                    <span className="transition-transform group-hover:scale-105">Use Photo</span>
                  </div>
                </Button>
              </>
            )}
            <Button
              onClick={closeCamera}
              variant="outline"
              className="group relative overflow-hidden px-6 py-3 rounded-xl bg-gradient-to-r from-slate-700/20 to-slate-600/20 border border-slate-600/40 text-slate-300 font-serif font-semibold hover:from-slate-600/30 hover:to-slate-500/30 hover:border-slate-500/60 hover:text-slate-200 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div className="relative flex items-center justify-center gap-2">
                <X className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span className="transition-transform group-hover:scale-105">Close</span>
              </div>
            </Button>
          </div>
          
          <canvas ref={canvasRef} className="hidden" />
        </motion.div>
      )}

      {/* Upload Options */}
      {!isCameraOpen && !currentImage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Camera Button */}
          <Button
            onClick={openCamera}
            disabled={isCapturing}
            className="group relative overflow-hidden w-full px-6 py-4 rounded-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-blue-200 font-serif font-semibold hover:from-blue-500/30 hover:to-purple-500/30 hover:border-blue-400/50 hover:text-blue-100 transition-all duration-300 backdrop-blur-sm shadow-lg shadow-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <div className="relative flex items-center justify-center gap-3">
              {isCapturing ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-300" />
              ) : (
                <Camera className="w-5 h-5 transition-transform group-hover:scale-110" />
              )}
              <span className="text-lg transition-transform group-hover:scale-105">
                {isCapturing ? 'Opening Camera...' : 'Take Photo with Camera'}
              </span>
            </div>
          </Button>

          {/* File Upload */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="group border-2 border-dashed border-slate-600/50 rounded-xl p-8 text-center hover:border-amber-400/50 hover:bg-amber-400/5 transition-all duration-300 backdrop-blur-sm"
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-slate-300/60 group-hover:text-amber-300/80 transition-colors duration-300" />
            <p className="text-slate-300 mb-4 font-serif text-lg group-hover:text-amber-200 transition-colors duration-300">Or upload from your device</p>
            <p className="text-slate-400 text-sm mb-4 group-hover:text-slate-300 transition-colors duration-300">
              Drag & drop an image here, or click to browse
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id={`${type}Photo`}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="group relative overflow-hidden px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600/20 to-orange-500/20 border border-amber-400/30 text-amber-200 font-serif font-semibold hover:from-amber-500/30 hover:to-orange-400/30 hover:border-amber-400/50 hover:text-amber-100 transition-all duration-300 backdrop-blur-sm shadow-lg shadow-amber-500/10"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div className="relative flex items-center justify-center gap-2">
                <Monitor className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span className="transition-transform group-hover:scale-105">Choose from Device</span>
              </div>
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

