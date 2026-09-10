import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { ReceiptData } from '../types';

export interface ExportResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ReceiptImageData {
  dataUrl: string;
  blob: Blob;
  fileName: string;
  file: File;
}

/**
 * Capture receipt DOM element as HTMLCanvasElement
 */
async function captureReceiptCanvas(elementId: string): Promise<HTMLCanvasElement | null> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Receipt element not found');
  }

  // Force fonts to finish loading before snapshot
  if (document.fonts) {
    await document.fonts.ready;
  }

  const canvas = await html2canvas(element, {
    scale: 2.5, // High resolution for crisp phone & printing quality
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
    onclone: (clonedDoc) => {
      // Ensure cloned print container is visible with white background
      const clonedEl = clonedDoc.getElementById(elementId);
      if (clonedEl) {
        clonedEl.style.transform = 'none';
        clonedEl.style.margin = '0 auto';
      }
    },
  });

  return canvas;
}

/**
 * Generate high-res image data and blob for modal preview and saving
 */
export async function generateReceiptImageData(
  elementId: string,
  receipt: ReceiptData
): Promise<ReceiptImageData> {
  const canvas = await captureReceiptCanvas(elementId);
  if (!canvas) throw new Error('Could not capture receipt canvas');

  const fileName = `receipt-${receipt.receiptNumber || 'slip'}.png`;
  const dataUrl = canvas.toDataURL('image/png');

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error('Failed to create image blob'));
    }, 'image/png');
  });

  const file = new File([blob], fileName, { type: 'image/png' });

  return {
    dataUrl,
    blob,
    fileName,
    file,
  };
}

/**
 * Trigger native mobile share sheet to save directly to Camera Roll / Photos
 */
export async function shareReceiptImage(
  file: File,
  receipt: ReceiptData
): Promise<{ shared: boolean; error?: string }> {
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: `Receipt - ${receipt.companyName || 'Receipt'}`,
        text: `Receipt ${receipt.receiptNumber} from ${receipt.companyName || 'Receipt'}`,
        files: [file],
      });
      return { shared: true };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { shared: false };
      }
      return { shared: false, error: err?.message || 'Share cancelled' };
    }
  }
  return { shared: false, error: 'Direct sharing not supported on this browser' };
}

/**
 * Trigger direct file download
 */
export function triggerImageDownload(dataUrl: string, fileName: string) {
  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export receipt as an Image (PNG) directly to phone/computer download or Web Share
 */
export async function exportReceiptAsImage(
  elementId: string,
  receipt: ReceiptData,
  tryShareSheet = false
): Promise<ExportResult> {
  try {
    const { file, dataUrl, fileName } = await generateReceiptImageData(elementId, receipt);

    // If on a mobile device and user requested share or share is available
    if (tryShareSheet && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: `Receipt - ${receipt.companyName || 'Receipt'}`,
          text: `Receipt ${receipt.receiptNumber} from ${receipt.companyName || 'Receipt'}`,
          files: [file],
        });
        return { success: true, message: 'Shared receipt image successfully!' };
      } catch (shareErr) {
        if ((shareErr as Error).name === 'AbortError') {
          return { success: true, message: 'Share dismissed' };
        }
      }
    }

    // Direct image download
    triggerImageDownload(dataUrl, fileName);

    return { success: true, message: 'Image downloaded to your device files!' };
  } catch (err: any) {
    console.error('Failed to export image:', err);
    return { success: false, error: err?.message || 'Failed to export image' };
  }
}

/**
 * Export receipt as a PDF document
 */
export async function exportReceiptAsPDF(
  elementId: string,
  receipt: ReceiptData
): Promise<ExportResult> {
  try {
    const canvas = await captureReceiptCanvas(elementId);
    if (!canvas) throw new Error('Could not capture receipt canvas');

    const imgData = canvas.toDataURL('image/png');
    
    // Canvas dimensions in pixels
    const imgWidthPx = canvas.width;
    const imgHeightPx = canvas.height;

    // Convert to mm (1 px ≈ 0.264583 mm at 72dpi, scale adjusted)
    // We size the PDF page to perfectly wrap the receipt slip
    const mmWidth = Math.max(80, Math.round((imgWidthPx / 2.5) * 0.264583));
    const mmHeight = Math.round((imgHeightPx / 2.5) * 0.264583);

    // Create custom sized PDF to fit receipt (thermal slip or standard slip)
    const pdf = new jsPDF({
      orientation: mmHeight > mmWidth ? 'portrait' : 'portrait',
      unit: 'mm',
      format: [mmWidth + 10, mmHeight + 10], // with slight margins
    });

    const marginX = 5;
    const marginY = 5;

    pdf.addImage(imgData, 'PNG', marginX, marginY, mmWidth, mmHeight);
    
    const fileName = `receipt-${receipt.receiptNumber || 'slip'}.pdf`;
    pdf.save(fileName);

    return { success: true, message: 'PDF downloaded successfully!' };
  } catch (err: any) {
    console.error('Failed to export PDF:', err);
    return { success: false, error: err?.message || 'Failed to export PDF' };
  }
}
