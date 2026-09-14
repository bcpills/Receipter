import React, { useState } from 'react';
import { ReceiptData, ReceiptTemplate } from '../types';
import { ReceiptImageData, shareReceiptImage, triggerImageDownload } from '../utils/exportHelpers';
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  Smartphone,
  Sparkles,
  Info,
  Camera,
  Loader2,
} from 'lucide-react';

interface ImageExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageData: ReceiptImageData | null;
  receipt: ReceiptData;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
  onChangeTemplate?: (template: ReceiptTemplate) => void;
  isRendering?: boolean;
}

const TEMPLATE_PILLS: { id: ReceiptTemplate; label: string; highlight?: boolean }[] = [
  { id: 'modern', label: 'Modern Studio (Full Graphics)', highlight: true },
  { id: 'boutique', label: 'Artisan Boutique' },
  { id: 'corporate', label: 'Corporate Invoice' },
  { id: 'minimal', label: 'Swiss Minimal' },
  { id: 'thermal', label: 'Thermal Register Slip' },
];

export function ImageExportModal({
  isOpen,
  onClose,
  imageData,
  receipt,
  onShowToast,
  onChangeTemplate,
  isRendering = false,
}: ImageExportModalProps) {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  if (!isOpen || !imageData) return null;

  // Save to Camera Roll via native mobile share sheet
  const handleSaveToPhotos = async () => {
    setIsSharing(true);
    try {
      const res = await shareReceiptImage(imageData.file, receipt);
      if (res.shared) {
        onShowToast('Tap "Save Image" in the menu to add to Camera Roll');
      } else if (res.error) {
        // Share not supported in this environment (e.g. iframe or desktop)
        onShowToast('Tip: Touch & hold the image below and choose "Save to Photos"');
      }
    } catch {
      onShowToast('Tip: Touch & hold the image below to save to Photos');
    } finally {
      setIsSharing(false);
    }
  };

  // Direct download to Files / Downloads
  const handleDownloadFile = () => {
    triggerImageDownload(imageData.dataUrl, imageData.fileName);
    onShowToast(`Downloaded ${imageData.fileName} to Files / Downloads`);
  };

  // Copy picture to clipboard
  const handleCopyImage = async () => {
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': imageData.blob,
          }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        onShowToast('Receipt picture copied to clipboard!');
      } else {
        onShowToast('Copying images is not supported on this browser');
      }
    } catch (err) {
      console.warn('Clipboard write failed:', err);
      onShowToast('Could not copy picture directly to clipboard');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Save to Camera Roll / Photos
              </h3>
              <p className="text-[11px] text-slate-500">
                Receipt #{receipt.receiptNumber || 'Slip'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Template Switcher within Modal */}
          {onChangeTemplate && (
            <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 sm:p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Receipt Style & Formatting:
                </span>
                {isRendering && (
                  <span className="text-[10px] text-indigo-600 font-medium flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Updating...
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TEMPLATE_PILLS.map((tmpl) => {
                  const active = receipt.template === tmpl.id;
                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => onChangeTemplate(tmpl.id)}
                      disabled={isRendering}
                      className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all flex items-center gap-1 ${
                        active
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      {tmpl.label}
                      {tmpl.highlight && !active && (
                        <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-bold">
                          Best
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Important Camera Roll Guide Box */}
          <div className="bg-amber-50 border border-amber-200/90 rounded-xl p-3 sm:p-3.5 text-amber-900 text-xs">
            <div className="flex items-start gap-2.5">
              <Smartphone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-amber-950 text-xs">
                  How to save directly into your Camera Roll:
                </p>
                <div className="pt-0.5 space-y-1 text-[11px]">
                  <div className="flex items-start gap-1.5 font-medium">
                    <span className="bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0">
                      Method 1
                    </span>
                    <span>
                      <strong>Touch & hold (press & hold)</strong> the receipt picture below, then tap <strong>&quot;Save to Photos&quot;</strong>.
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5 font-medium">
                    <span className="bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0">
                      Method 2
                    </span>
                    <span>
                      Tap <strong>&quot;Save to Photos&quot;</strong> below to open your phone&apos;s share menu, then select <strong>&quot;Save Image&quot;</strong>.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            {/* Save to Photos / Share Sheet */}
            <button
              type="button"
              onClick={handleSaveToPhotos}
              disabled={isSharing || isRendering}
              className="w-full px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Save to Photos</span>
            </button>

            {/* Download to Files app */}
            <button
              type="button"
              onClick={handleDownloadFile}
              disabled={isRendering}
              className="w-full px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Save to Files</span>
            </button>

            {/* Copy image to clipboard */}
            <button
              type="button"
              onClick={handleCopyImage}
              disabled={isRendering}
              className="w-full px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>Copy Picture</span>
                </>
              )}
            </button>
          </div>

          {/* Rendered Receipt Picture Area */}
          <div className="pt-2">
            <div className="text-center pb-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                👆 Press and hold the picture below to Save to Photos
              </span>
            </div>

            <div className="bg-slate-100 p-3 sm:p-4 rounded-xl border border-slate-200 flex items-center justify-center overflow-x-auto min-h-[220px] max-h-[50vh] relative">
              {isRendering ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  <span className="text-xs font-medium">Rendering high-res picture...</span>
                </div>
              ) : (
                <img
                  src={imageData.dataUrl}
                  alt={`Receipt ${receipt.receiptNumber}`}
                  className="max-h-[46vh] max-w-full w-auto object-contain rounded-md shadow-md select-auto cursor-pointer"
                  style={{
                    WebkitTouchCallout: 'default',
                    touchAction: 'manipulation',
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Info className="w-3 h-3 text-slate-400" /> Saved automatically to History
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-4 py-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
