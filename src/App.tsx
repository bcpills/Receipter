import React, { useState, useEffect } from 'react';
import { ReceiptData, ReceiptTemplate } from './types';
import { INITIAL_RECEIPT, createBlankReceipt } from './utils/presets';
import { ReceiptPreview } from './components/ReceiptPreview';
import { ReceiptForm } from './components/ReceiptForm';
import { ReceiptHistoryModal } from './components/ReceiptHistoryModal';
import { ImageExportModal } from './components/ImageExportModal';
import {
  exportReceiptAsPDF,
  generateReceiptImageData,
  ReceiptImageData,
  shareReceiptImage,
} from './utils/exportHelpers';
import {
  Receipt,
  Download,
  FileDown,
  Image as ImageIcon,
  History,
  Save,
  Share2,
  Printer,
  Sparkles,
  Eye,
  Edit3,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  RotateCcw,
  Camera,
} from 'lucide-react';

const STORAGE_KEY_CURRENT = 'receipt_maker_current_v3';
const STORAGE_KEY_HISTORY = 'receipt_maker_history_v3';

export default function App() {
  // Load receipt from localStorage or blank default
  const [receipt, setReceipt] = useState<ReceiptData>(() => {
    try {
      // Clear legacy sample if exists
      localStorage.removeItem('receipt_maker_current_v1');
      localStorage.removeItem('receipt_maker_current_v2');
      const saved = localStorage.getItem(STORAGE_KEY_CURRENT);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.companyName !== 'Apex Artisan Coffee & Goods') {
          // If the template was previously defaulted to 'thermal', upgrade to 'modern'
          if (parsed.template === 'thermal') {
            parsed.template = 'modern';
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading current receipt', e);
    }
    return createBlankReceipt();
  });

  // History state - start empty without fake demo receipts
  const [history, setHistory] = useState<ReceiptData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((item) => item.companyName !== 'Apex Artisan Coffee & Goods');
        }
      }
    } catch (e) {
      console.error('Error reading history', e);
    }
    return [];
  });

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isRenderingTemplate, setIsRenderingTemplate] = useState(false);
  const [exportImageData, setExportImageData] = useState<ReceiptImageData | null>(null);
  const [isImageExportModalOpen, setIsImageExportModalOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Auto-save current draft to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(receipt));
    } catch (e) {
      console.error('Failed to auto-save receipt', e);
    }
  }, [receipt]);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save history', e);
    }
  }, [history]);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Generate new random receipt number
  const handleGenerateNewNumber = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const dateYear = new Date().getFullYear();
    const newNumber = `REC-${dateYear}-${randomDigits}`;
    setReceipt((prev) => ({
      ...prev,
      receiptNumber: newNumber,
      barcodeValue: `${dateYear}${randomDigits}${Math.floor(100 + Math.random() * 900)}`,
    }));
    showToast(`Generated new receipt #${newNumber}`);
  };

  // Save to history log
  const handleSaveToHistory = (customReceipt = receipt) => {
    setHistory((prev) => {
      const existingIdx = prev.findIndex((item) => item.id === customReceipt.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = { ...customReceipt, createdAt: Date.now() };
        return updated;
      }
      return [{ ...customReceipt, createdAt: Date.now() }, ...prev];
    });
    showToast('Saved to history log!');
  };

  // Export as Image (Open photo save modal for Camera Roll / Files)
  const handleExportImage = async (tryShare = false) => {
    setIsExporting(true);
    showToast('Rendering high-res receipt picture...', 'info');

    // Auto save to history on export
    handleSaveToHistory();

    try {
      const imgData = await generateReceiptImageData('receipt-print-area', receipt);
      setExportImageData(imgData);
      setIsImageExportModalOpen(true);
      setIsExporting(false);

      if (tryShare) {
        await shareReceiptImage(imgData.file, receipt);
      }
    } catch (err: any) {
      setIsExporting(false);
      console.error('Failed to export image:', err);
      showToast(err?.message || 'Failed to render picture', 'info');
    }
  };

  // Switch template from within the modal
  const handleChangeTemplateInModal = async (newTemplate: ReceiptTemplate) => {
    if (receipt.template === newTemplate) return;
    setIsRenderingTemplate(true);
    const updatedReceipt: ReceiptData = {
      ...receipt,
      template: newTemplate,
    };
    setReceipt(updatedReceipt);

    // Allow DOM to re-render with the new template
    setTimeout(async () => {
      try {
        const imgData = await generateReceiptImageData('receipt-print-area', updatedReceipt);
        setExportImageData(imgData);
      } catch (e) {
        console.error('Failed to regenerate receipt image for new template', e);
      } finally {
        setIsRenderingTemplate(false);
      }
    }, 120);
  };

  // Export as PDF
  const handleExportPDF = async () => {
    setIsExporting(true);
    showToast('Rendering PDF document...', 'info');

    // Auto save to history on export
    handleSaveToHistory();

    const res = await exportReceiptAsPDF('receipt-print-area', receipt);
    setIsExporting(false);

    if (res.success) {
      showToast(res.message || 'PDF downloaded successfully!');
    } else {
      showToast(res.error || 'Failed to export PDF', 'info');
    }
  };

  // Browser print
  const handlePrint = () => {
    window.print();
  };

  // Start fresh blank receipt
  const handleCreateNew = () => {
    const blank = createBlankReceipt();
    setReceipt(blank);
    showToast('Started a blank receipt');
  };

  // Clear all form inputs to blank
  const handleClearForm = () => {
    const blank = createBlankReceipt();
    setReceipt(blank);
    showToast('Form cleared to blank');
  };

  // Duplicate history item
  const handleDuplicateReceipt = (source: ReceiptData) => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const duplicated: ReceiptData = {
      ...source,
      id: 'rcpt_' + Date.now(),
      receiptNumber: `REC-${new Date().getFullYear()}-${randomDigits}`,
      date: source.date || '',
      time: source.time || '',
      createdAt: Date.now(),
    };
    setReceipt(duplicated);
    handleSaveToHistory(duplicated);
    showToast(`Duplicated as new receipt #${duplicated.receiptNumber}`);
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 flex flex-col font-sans antialiased">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                Receipt Maker
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Professional PDF & image receipts with logo, templates & presets
              </p>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearForm}
              title="Clear all fields to a blank form"
              className="text-xs font-semibold text-slate-700 hover:text-red-600 bg-slate-100 hover:bg-red-50 border border-slate-200 px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-600" />
              <span>Clear</span>
            </button>

            <button
              type="button"
              onClick={handleCreateNew}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors hidden md:flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              New
            </button>

            <button
              type="button"
              onClick={() => handleSaveToHistory()}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors hidden sm:flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Save
            </button>

            {/* History Log Button */}
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border border-slate-200 px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 relative"
            >
              <History className="w-4 h-4 text-indigo-600" />
              <span>History</span>
              {history.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {history.length}
                </span>
              )}
            </button>

            {/* Picture on phone / image export */}
            <button
              type="button"
              onClick={() => handleExportImage(false)}
              disabled={isExporting}
              className="text-xs font-semibold text-slate-800 hover:text-indigo-700 bg-white hover:bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <Camera className="w-4 h-4 text-indigo-600" />
              <span>Save to Photos</span>
            </button>

            {/* PDF export */}
            <button
              type="button"
              onClick={handleExportPDF}
              disabled={isExporting}
              className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-xs shadow-indigo-600/20"
            >
              <FileDown className="w-4 h-4" />
              <span>PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden bg-white border-b border-slate-200 p-2 flex gap-2">
        <button
          type="button"
          onClick={() => setMobileTab('edit')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${
            mobileTab === 'edit'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          Customize Receipt
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${
            mobileTab === 'preview'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          Live Preview & Export
        </button>
      </div>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Customization Form */}
          <div
            className={`lg:col-span-7 space-y-6 ${
              mobileTab === 'preview' ? 'hidden lg:block' : 'block'
            }`}
          >
            <ReceiptForm
              receipt={receipt}
              onChangeReceipt={setReceipt}
              onGenerateNewNumber={handleGenerateNewNumber}
            />
          </div>

          {/* Right Column: Live Receipt Preview & Actions */}
          <div
            className={`lg:col-span-5 lg:sticky lg:top-20 space-y-4 ${
              mobileTab === 'edit' ? 'hidden lg:block' : 'block'
            }`}
          >
            {/* Action Bar over Preview */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Live Preview
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Share / Save to photos for phones */}
                <button
                  type="button"
                  onClick={() => handleExportImage(true)}
                  title="Share or Save to Camera Roll / Photos"
                  className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  title="Print receipt"
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Printer className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleExportImage(false)}
                  className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5 text-indigo-600" />
                  Save to Photos
                </button>

                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF
                </button>
              </div>
            </div>

            {/* Receipt Preview Canvas Container */}
            <div className="p-4 sm:p-6 bg-slate-200/70 rounded-2xl border border-slate-300/70 flex justify-center items-center overflow-x-auto min-h-[460px]">
              <ReceiptPreview receipt={receipt} />
            </div>

            {/* Helpful Export Tips */}
            <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-xl border border-slate-200 text-xs text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Phone & Print Ready
              </p>
              <p className="text-[11px] leading-relaxed">
                Tap <strong>Save to Photos</strong> to add the receipt to your phone&apos;s Camera Roll or download the PNG file.
                Receipts are automatically logged in your <strong>History</strong>.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Camera Roll / Photo Export Modal */}
      <ImageExportModal
        isOpen={isImageExportModalOpen}
        onClose={() => setIsImageExportModalOpen(false)}
        imageData={exportImageData}
        receipt={receipt}
        onShowToast={showToast}
        onChangeTemplate={handleChangeTemplateInModal}
        isRendering={isRenderingTemplate}
      />

      {/* History Log Modal */}
      <ReceiptHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onLoadReceipt={(loadedReceipt) => {
          setReceipt(loadedReceipt);
          showToast(`Loaded receipt #${loadedReceipt.receiptNumber}`);
        }}
        onDuplicateReceipt={handleDuplicateReceipt}
        onDeleteReceipt={(id) => {
          setHistory((prev) => prev.filter((r) => r.id !== id));
          showToast('Removed from history');
        }}
        onClearHistory={() => {
          setHistory([]);
          showToast('History cleared');
        }}
      />
    </div>
  );
}
