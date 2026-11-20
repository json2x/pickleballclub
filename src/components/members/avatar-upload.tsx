'use client';

import { useState, useRef } from 'react';
import { Camera, AlertCircle } from 'lucide-react';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  onUpload: (file: File) => void;
  displayName: string;
}

export function AvatarUpload({ currentAvatarUrl, onUpload, displayName }: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB');
      return;
    }

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    // Call onUpload
    onUpload(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const displayUrl = previewUrl || currentAvatarUrl;

  return (
    <div className="flex flex-col items-center gap-3">
      <div 
        className="relative group cursor-pointer w-24 h-24 rounded-full overflow-hidden bg-surface-variant flex items-center justify-center border-2 border-outline-variant/30"
        onClick={triggerFileInput}
      >
        {displayUrl ? (
          <img 
            src={displayUrl} 
            alt={displayName} 
            className="w-full h-full object-cover transition-opacity group-hover:opacity-50"
          />
        ) : (
          <span className="text-3xl font-semibold text-on-surface-variant group-hover:opacity-50 transition-opacity">
            {getInitials(displayName)}
          </span>
        )}
        
        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
          <Camera className="h-6 w-6 text-white" />
          <span className="text-white text-xs mt-1 font-medium">Upload</span>
        </div>
      </div>
      
      <input 
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/jpeg, image/png, image/webp"
        onChange={handleFileChange}
      />
      
      {error ? (
        <div className="flex items-center gap-1 text-red-500 text-xs">
          <AlertCircle className="h-3 w-3" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="text-xs text-on-surface-variant">
          JPG, PNG, WEBP (Max 2MB)
        </div>
      )}
    </div>
  );
}
