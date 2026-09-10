import React from 'react';

export function ReceiptBarcode({ value }: { value: string }) {
  // Simple clean deterministic SVG barcode pattern based on string characters
  const cleanVal = (value || '1234567890').replace(/[^0-9A-Z]/gi, '');
  const bars: number[] = [];
  
  // Generate pseudo-code39 bar widths
  for (let i = 0; i < cleanVal.length; i++) {
    const code = cleanVal.charCodeAt(i);
    bars.push(code % 2 === 0 ? 2 : 1);
    bars.push(1);
    bars.push(code % 3 === 0 ? 3 : 1);
    bars.push(1);
    bars.push(code % 5 === 0 ? 2 : 1);
    bars.push(1);
  }

  let currentX = 10;
  return (
    <div className="flex flex-col items-center justify-center my-3">
      <svg className="w-56 h-12" viewBox="0 0 240 50" preserveAspectRatio="none">
        {bars.map((width, idx) => {
          const x = currentX;
          currentX += width * 2 + 1.5;
          if (idx % 2 === 0) {
            return (
              <rect
                key={idx}
                x={x}
                y="0"
                width={width * 2}
                height="40"
                fill="#111827"
              />
            );
          }
          return null;
        })}
      </svg>
      <span className="text-[11px] tracking-widest text-gray-600 font-mono mt-0.5">
        *{cleanVal}*
      </span>
    </div>
  );
}

export function ReceiptQR({ text }: { text: string }) {
  // Elegant decorative QR-like digital code grid
  return (
    <div className="flex flex-col items-center justify-center my-2">
      <div className="w-20 h-20 bg-white border border-gray-900 p-1.5 flex flex-col justify-between">
        <div className="flex justify-between">
          <div className="w-5 h-5 border-2 border-black flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-black" />
          </div>
          <div className="w-5 h-5 border-2 border-black flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-black" />
          </div>
        </div>
        <div className="grid grid-cols-5 gap-0.5 my-1 px-1">
          <div className="w-1.5 h-1.5 bg-black" />
          <div className="w-1.5 h-1.5 bg-transparent" />
          <div className="w-1.5 h-1.5 bg-black" />
          <div className="w-1.5 h-1.5 bg-black" />
          <div className="w-1.5 h-1.5 bg-transparent" />
          <div className="w-1.5 h-1.5 bg-black" />
          <div className="w-1.5 h-1.5 bg-black" />
          <div className="w-1.5 h-1.5 bg-transparent" />
          <div className="w-1.5 h-1.5 bg-black" />
          <div className="w-1.5 h-1.5 bg-black" />
        </div>
        <div className="flex justify-between">
          <div className="w-5 h-5 border-2 border-black flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-black" />
          </div>
          <div className="w-4 h-4 bg-black" />
        </div>
      </div>
      <span className="text-[9px] text-gray-500 font-mono mt-1 tracking-tight">Scan for e-Receipt</span>
    </div>
  );
}
