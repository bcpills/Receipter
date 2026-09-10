import React, { useRef, useState } from 'react';
import { ImagePlus, Trash2, Smartphone, Check, Sparkles } from 'lucide-react';
import { SAMPLE_LOGOS } from '../utils/presets';

interface LogoUploaderProps {
  logoUrl?: string;
  onLogoChange: (url: string | undefined) => void;
}

export const LogoUploader: React.FC<LogoUploaderProps> = ({ logoUrl, onLogoChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  // Resize image from phone camera/library to efficient thumbnail for localStorage & crisp rendering
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WEBP, or SVG)');
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        // Max dimension 400px to maintain crispness while avoiding gigantic base64 strings
        const maxDimension = 400;
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.9);
          onLogoChange(compressedDataUrl);
        } else {
          onLogoChange(src);
        }
        setLoading(false);
      };
      img.onerror = () => {
        onLogoChange(src);
        setLoading(false);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Company Logo
        </label>
        {logoUrl && (
          <button
            type="button"
            onClick={() => onLogoChange(undefined)}
            className="text-[11px] text-red-600 hover:text-red-700 flex items-center gap-1 font-medium transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Remove Logo
          </button>
        )}
      </div>

      {/* Hidden file input for phone library / computer */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Active Logo or Upload Box */}
      {logoUrl ? (
        <div className="flex items-center gap-3.5 p-3 bg-white border border-slate-200 rounded-xl">
          <div className="w-16 h-16 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden p-1 shrink-0">
            <img
              src={logoUrl}
              alt="Logo Preview"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Logo Selected
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Ready for templates & receipt export
            </p>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-md transition-colors"
              >
                Change Photo
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/50'
              : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/60 bg-white'
          }`}
        >
          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
            {loading ? (
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Smartphone className="w-5 h-5" />
            )}
          </div>
          <p className="text-xs font-semibold text-slate-800">
            Select Photo from Phone Library
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Tap to open camera roll or photo library (PNG, JPG)
          </p>
        </div>
      )}

      {/* Preset sample logos */}
      <div>
        <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1.5 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" /> Or pick a sample logo:
        </span>
        <div className="grid grid-cols-4 gap-2">
          {SAMPLE_LOGOS.map((sample) => {
            const isCurrent = logoUrl === sample.url;
            return (
              <button
                key={sample.name}
                type="button"
                onClick={() => onLogoChange(sample.url)}
                className={`flex flex-col items-center p-2 rounded-lg border text-center transition-all ${
                  isCurrent
                    ? 'border-indigo-600 bg-indigo-50/80 ring-1 ring-indigo-500'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <img
                  src={sample.url}
                  alt={sample.name}
                  className="w-7 h-7 object-contain mb-1"
                  referrerPolicy="no-referrer"
                />
                <span className="text-[9px] font-medium text-slate-700 truncate w-full">
                  {sample.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
