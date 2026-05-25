'use client';

import { useCallback, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  ProfileCameraModal,
  profilePhotoInputClassName,
} from '@/components/profile/ProfileCameraModal';
import { PalmHandGuidanceHint } from '@/components/profile/PalmHandGuidanceHint';
import type { UserProfile } from '@/lib/firebase';

interface ProfilePhotoCaptureButtonsProps {
  type: 'face' | 'palm';
  disabled?: boolean;
  hasPhoto: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
  buttonClassName?: string;
  gender?: UserProfile['gender'];
}

function prefersLiveCamera(): boolean {
  if (typeof navigator === 'undefined') return false;
  return Boolean(navigator.mediaDevices?.getUserMedia);
}

export function ProfilePhotoCaptureButtons({
  type,
  disabled = false,
  hasPhoto,
  onUpload,
  onRemove,
  buttonClassName,
  gender,
}: ProfilePhotoCaptureButtonsProps) {
  const cameraInputId = useId();
  const uploadInputId = useId();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  const facingMode = type === 'face' ? 'user' : 'environment';
  const title = type === 'face' ? 'Face scan' : 'Palm scan';

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (file) onUpload(file);
    },
    [onUpload],
  );

  const openCamera = useCallback(() => {
    if (prefersLiveCamera()) {
      setCameraOpen(true);
      return;
    }
    cameraInputRef.current?.click();
  }, []);

  return (
    <>
      <div className="relative flex flex-col gap-1">
        <input
          id={cameraInputId}
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture={facingMode}
          className={profilePhotoInputClassName}
          tabIndex={-1}
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
        <input
          id={uploadInputId}
          ref={uploadInputRef}
          type="file"
          accept="image/*"
          className={profilePhotoInputClassName}
          tabIndex={-1}
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={buttonClassName ?? 'text-xs'}
          disabled={disabled}
          onClick={openCamera}
        >
          Open camera
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={buttonClassName ?? 'text-xs'}
          disabled={disabled}
          onClick={() => uploadInputRef.current?.click()}
        >
          Upload
        </Button>
        {hasPhoto ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs text-red-400"
            disabled={disabled}
            onClick={onRemove}
          >
            Remove
          </Button>
        ) : null}
      </div>

      {type === 'palm' ? (
        <PalmHandGuidanceHint gender={gender} compact className="mt-1 max-w-[14rem] mx-auto" />
      ) : null}

      <ProfileCameraModal
        open={cameraOpen}
        facingMode={facingMode}
        title={title}
        onClose={() => setCameraOpen(false)}
        onCapture={(file) => onUpload(file)}
      />
    </>
  );
}
