import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { ArrowLeft, Download, Share2, Printer, Check, Upload } from 'lucide-react';
import { cn } from '../lib/utils';

const THEMES = [
  { id: 'business', label: 'Business', fgColor: '#0f172a', bgColor: '#f8fafc', qrColor: '#0f172a' },
  { id: 'home', label: 'Home', fgColor: '#064e3b', bgColor: '#ecfdf5', qrColor: '#064e3b' },
  { id: 'office', label: 'Office', fgColor: '#1e293b', bgColor: '#e2e8f0', qrColor: '#1e293b' },
  { id: 'restaurant', label: 'Restaurant', fgColor: '#7f1d1d', bgColor: '#fef2f2', qrColor: '#7f1d1d' },
  { id: 'event', label: 'Event', fgColor: '#4c1d95', bgColor: '#f5f3ff', qrColor: '#4c1d95' },
  { id: 'guest', label: 'Guest', fgColor: '#854d0e', bgColor: '#fefce8', qrColor: '#854d0e' },
  { id: 'services', label: 'Services', fgColor: '#1e3a8a', bgColor: '#eff6ff', qrColor: '#1e3a8a' },
];

const LANGUAGES = [
  { code: 'EN', label: 'English', defaultText: 'Scan Me' },
  { code: 'ES', label: 'Español', defaultText: 'Escanéame' },
  { code: 'FR', label: 'Français', defaultText: 'Scannez-moi' },
  { code: 'HI', label: 'हिन्दी', defaultText: 'मुझे स्कैन करें' },
  { code: 'AR', label: 'العربية', defaultText: 'امسحني' },
];

export default function QRDesigner() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [customText, setCustomText] = useState(LANGUAGES[0].defaultText);
  const [customQrColor, setCustomQrColor] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLCanvasElement>(null);

  const qrUrl = `${window.location.origin}/scan/${slug}`;
  const activeQrColor = customQrColor || selectedTheme.qrColor;

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = LANGUAGES.find(l => l.code === e.target.value) || LANGUAGES[0];
    setLanguage(lang);
    // Only update text if it hasn't been heavily customized or matches a previous default
    if (LANGUAGES.some(l => l.defaultText === customText)) {
      setCustomText(lang.defaultText);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateCompositeCanvas = (): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1280; // Extra space for text
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // Background
    ctx.fillStyle = selectedTheme.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Custom Text
    ctx.fillStyle = selectedTheme.fgColor;
    ctx.font = 'bold 80px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(customText || language.defaultText, canvas.width / 2, 180);

    // Draw QR Code
    const qrCanvas = qrRef.current;
    if (qrCanvas) {
      const qrSize = 800;
      const x = (canvas.width - qrSize) / 2;
      const y = 280;
      
      // Draw white background for QR to ensure contrast
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 40, y - 40, qrSize + 80, qrSize + 80);
      
      ctx.drawImage(qrCanvas, x, y, qrSize, qrSize);
    }

    // Footer
    ctx.fillStyle = selectedTheme.fgColor;
    ctx.font = '40px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.globalAlpha = 0.5;
    ctx.fillText('Powered by Darwaza', canvas.width / 2, canvas.height - 80);
    ctx.globalAlpha = 1.0;

    return canvas;
  };

  const handleDownload = () => {
    const canvas = generateCompositeCanvas();
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `QR_${slug}_${selectedTheme.id}.png`;
    a.click();
  };

  const handlePrint = () => {
    const canvas = generateCompositeCanvas();
    const url = canvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Code</title>
            <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fff; }
              img { max-width: 100%; max-height: 100vh; object-fit: contain; }
              @media print {
                @page { margin: 0; }
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            <img src="${url}" onload="window.print(); window.close();" />
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        // Try to share the URL first
        await navigator.share({
          title: 'Scan my QR Code',
          text: customText,
          url: qrUrl,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex justify-center">
      <div className="w-full max-w-md bg-[#0a0a0a] relative min-h-screen shadow-2xl border-x border-gray-800/50 flex flex-col">
        
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-gray-800 bg-[#121212] sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/qrs')} className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-white tracking-tight">Design QR</h2>
          </div>
          <select 
            value={language.code}
            onChange={handleLanguageChange}
            className="bg-[#1a1a1a] text-white border border-gray-700 rounded-lg px-2 py-1.5 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.code}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pb-32">
          {/* Preview Area */}
          <div className="mb-8 flex justify-center">
            <div 
              className="w-full aspect-[4/5] rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 transition-colors duration-300 relative overflow-hidden"
              style={{ backgroundColor: selectedTheme.bgColor }}
            >
              <h3 
                className="text-3xl font-bold mb-8 text-center px-4 break-words w-full"
                style={{ color: selectedTheme.fgColor }}
              >
                {customText || language.defaultText}
              </h3>
              
              <div className="bg-white p-4 rounded-2xl shadow-sm">
                <QRCodeCanvas 
                  value={qrUrl} 
                  size={200} 
                  level="H" 
                  fgColor={activeQrColor}
                  includeMargin={false} 
                  ref={qrRef}
                  imageSettings={logoUrl ? {
                    src: logoUrl,
                    height: 48,
                    width: 48,
                    excavate: true,
                  } : undefined}
                />
              </div>

              <p 
                className="absolute bottom-6 text-xs font-medium opacity-50"
                style={{ color: selectedTheme.fgColor }}
              >
                Powered by Darwaza
              </p>
            </div>
          </div>

          {/* Customization Controls */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Custom Text</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-orange-500 outline-none"
                value={customText}
                onChange={e => setCustomText(e.target.value)}
                placeholder="e.g. Scan to Enter"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-3">Design Theme</label>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
                {THEMES.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setSelectedTheme(theme);
                      setCustomQrColor(null); // Reset custom color when changing theme
                    }}
                    className={cn(
                      "flex flex-col items-center gap-2 min-w-[72px] transition-transform",
                      selectedTheme.id === theme.id ? "scale-105" : "opacity-70 hover:opacity-100"
                    )}
                  >
                    <div 
                      className={cn(
                        "w-14 h-14 rounded-full border-2 flex items-center justify-center shadow-sm",
                        selectedTheme.id === theme.id ? "border-orange-500" : "border-transparent"
                      )}
                      style={{ backgroundColor: theme.bgColor }}
                    >
                      <div className="w-6 h-6 rounded-md" style={{ backgroundColor: theme.fgColor }}></div>
                    </div>
                    <span className={cn(
                      "text-xs font-medium",
                      selectedTheme.id === theme.id ? "text-orange-500" : "text-gray-400"
                    )}>
                      {theme.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">QR Color</label>
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-gray-700 shrink-0">
                    <input 
                      type="color" 
                      value={activeQrColor} 
                      onChange={e => setCustomQrColor(e.target.value)}
                      className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                    />
                  </div>
                  {customQrColor && (
                    <button 
                      onClick={() => setCustomQrColor(null)}
                      className="text-[10px] text-gray-500 hover:text-white leading-tight"
                    >
                      Reset to Theme
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Center Logo</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center justify-center px-3 py-2.5 bg-[#1a1a1a] border border-gray-700 rounded-xl cursor-pointer hover:bg-[#222] transition-colors text-xs font-medium text-white">
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    Upload
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleLogoUpload}
                    />
                  </label>
                  {logoUrl && (
                    <button 
                      onClick={() => setLogoUrl(null)}
                      className="text-[10px] text-red-500 hover:text-red-400 leading-tight"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#121212] border-t border-gray-800 p-4 pb-safe z-20">
          <div className="max-w-md mx-auto flex gap-3">
            <button
              onClick={handlePrint}
              className="flex-1 bg-[#1a1a1a] border border-gray-700 hover:bg-[#222] text-white py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Printer className="w-5 h-5" />
              Print
            </button>
            <button
              onClick={handleShare}
              className="flex-1 bg-[#1a1a1a] border border-gray-700 hover:bg-[#222] text-white py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
            >
              {copied ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5" />}
              {copied ? 'Copied!' : 'Share'}
            </button>
            <button
              onClick={handleDownload}
              className="flex-[1.5] bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-orange-500/20"
            >
              <Download className="w-5 h-5" />
              Save Gallery
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
