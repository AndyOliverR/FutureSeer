'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Check, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfileCameraModalProps {
  open: boolean;
  facingMode: 'user' | 'environment';
  title: string;
  onClose: () => void;
  onCapture: (file: File, previewUrl: string) => void;
}

export function ProfileCameraModal({
  open,
  facingMode,
  title,
  onClose,
  onCapture,
}: ProfileCameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const close = useCallback(() => {
    stopStream();
    setPreviewUrl(null);
    setError(null);
    onClose();
  }, [onClose, stopStream]);

  useEffect(() => {
    if (!open) {
      stopStream();
      return;
    }

    let cancelled = false;
    setPreviewUrl(null);
    setStarting(true);
    setError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setStarting(false);
      setError('Camera is not available in this browser. Use Upload instead.');
      return;
    }

    void navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Could not open the camera. Allow camera access or use Upload instead.');
        }
      })
      .finally(() => {
        if (!cancelled) setStarting(false);
      });

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [open, facingMode, stopStream]);

  const capture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    setPreviewUrl(canvas.toDataURL('image/jpeg', 0.88));
  }, []);

  const usePhoto = useCallback(() => {
    if (!previewUrl) return;
    void fetch(previewUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], `profile-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file, previewUrl);
        close();
      })
      .catch(() => {
        setError('Could not process the photo. Please try again.');
      });
  }, [previewUrl, onCapture, close]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-amber-500/30 bg-slate-950 p-4 shadow-2xl">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-200">{title}</h3>
          <button
            type="button"
            onClick={close}
            className="rounded-full p-1.5 text-slate-300 hover:bg-white/10"
            aria-label="Close camera"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error ? <p className="mb-3 text-sm text-red-300">{error}</p> : null}

        <div className="relative overflow-hidden rounded-xl bg-black">
          {!previewUrl ? (
            <video ref={videoRef} className="h-64 w-full object-cover" autoPlay playsInline muted />
          ) : (
            <img src={previewUrl} alt="Captured preview" className="h-64 w-full object-cover" />
          )}
          {starting ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm text-amber-100">
              Opening camera…
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {!previewUrl ? (
            <Button type="button" size="sm" onClick={capture} disabled={starting || Boolean(error)}>
              <Camera className="mr-2 h-4 w-4" />
              Capture
            </Button>
          ) : (
            <>
              <Button type="button" size="sm" variant="outline" onClick={() => setPreviewUrl(null)}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Retake
              </Button>
              <Button type="button" size="sm" onClick={usePhoto}>
                <Check className="mr-2 h-4 w-4" />
                Use photo
              </Button>
            </>
          )}
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}

/** Visually hidden but still clickable — works on Android where display:none inputs fail. */
export const profilePhotoInputClassName =
  'absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [-webkit-clip-path:inset(50%)] [clip-path:inset(50%)]';
