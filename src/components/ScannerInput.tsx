import React, { useState, useRef } from 'react';
import { SAMPLE_CASES, SampleCase } from '../data/sampleCases.js';
import { Search, Upload, Link, Mail, Sparkles, Trash2, ShieldAlert, ArrowRight } from 'lucide-react';

interface ScannerInputProps {
  onScan: (text: string, url?: string, senderEmail?: string) => Promise<void>;
  isLoading: boolean;
}

export const ScannerInput: React.FC<ScannerInputProps> = ({ onScan, isLoading }) => {
  const [text, setText] = useState<string>(SAMPLE_CASES[0].text);
  const [url, setUrl] = useState<string>(SAMPLE_CASES[0].url);
  const [senderEmail, setSenderEmail] = useState<string>(SAMPLE_CASES[0].senderEmail);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(SAMPLE_CASES[0].id);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectPreset = (preset: SampleCase) => {
    setSelectedPresetId(preset.id);
    setText(preset.text);
    setUrl(preset.url);
    setSenderEmail(preset.senderEmail);
  };

  const handleClear = () => {
    setText('');
    setUrl('');
    setSenderEmail('');
    setSelectedPresetId('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !url.trim()) return;
    onScan(text, url, senderEmail);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          setText(content);
          setSelectedPresetId('');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          setText(content);
          setSelectedPresetId('');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div id="scanner-input-container" className="rounded-2xl bg-[#202124]/90 border border-[#3c4043] p-5 md:p-6 shadow-xl relative overflow-hidden">
      {/* Subtle Google Blue ambient accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#4285F4]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Sample Threat Presets Carousel */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#bdc1c6] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FBBC04]" />
            Google Threat Intelligence Presets
          </span>
          <span className="text-[11px] text-[#9aa0a6]">
            Click to load realistic scam scenarios
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SAMPLE_CASES.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className={`p-3 rounded-xl text-left border transition-all ${
                selectedPresetId === preset.id
                  ? 'bg-[#303134] border-[#4285F4] shadow-md ring-1 ring-[#4285F4]/40'
                  : 'bg-[#18191c]/70 border-[#3c4043] hover:bg-[#303134]/80 hover:border-[#5f6368]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${preset.badgeColor}`}>
                  {preset.category}
                </span>
              </div>
              <div className="text-xs font-bold text-[#e8eaed] line-clamp-1">{preset.title}</div>
              <div className="text-[11px] text-[#9aa0a6] mt-1 line-clamp-1 font-mono">
                {preset.url.replace(/^https?:\/\//, '')}
              </div>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* URL and Sender Email Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Target URL */}
          <div>
            <label htmlFor="url-input" className="block text-xs font-semibold text-[#bdc1c6] mb-1.5 flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-[#8ab4f8]" />
              Job Portal / Listing URL or Phishing Link
            </label>
            <div className="relative">
              <input
                id="url-input"
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setSelectedPresetId('');
                }}
                placeholder="https://careers-portal.xyz/offer/view.php"
                className="w-full bg-[#18191c] border border-[#3c4043] rounded-xl px-3.5 py-2.5 text-xs text-[#e8eaed] placeholder:text-[#5f6368] focus:outline-none focus:ring-2 focus:ring-[#4285F4]/50 focus:border-[#4285F4] font-mono transition-all"
              />
            </div>
          </div>

          {/* Sender Email */}
          <div>
            <label htmlFor="email-input" className="block text-xs font-semibold text-[#bdc1c6] mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#FBBC04]" />
              Sender / Recruiter Email Address (Optional)
            </label>
            <div className="relative">
              <input
                id="email-input"
                type="text"
                value={senderEmail}
                onChange={(e) => {
                  setSenderEmail(e.target.value);
                  setSelectedPresetId('');
                }}
                placeholder="recruiting-desk@gmail.com"
                className="w-full bg-[#18191c] border border-[#3c4043] rounded-xl px-3.5 py-2.5 text-xs text-[#e8eaed] placeholder:text-[#5f6368] focus:outline-none focus:ring-2 focus:ring-[#4285F4]/50 focus:border-[#4285F4] font-mono transition-all"
              />
            </div>
          </div>
        </div>

        {/* Text Area for Offer Letter, Email Body, or Lease Agreement */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="text-input" className="block text-xs font-semibold text-[#bdc1c6] flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#f28b82]" />
              Job Offer Letter, Appointment Notice, or Rental Agreement Text
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-[#9aa0a6] hover:text-[#e8eaed] flex items-center gap-1 transition-colors"
              >
                <Upload className="w-3 h-3 text-[#8ab4f8]" />
                Upload Document (.txt)
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.doc,.docx,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`relative rounded-xl transition-all ${
              isDragOver ? 'ring-2 ring-[#4285F4] border-[#4285F4]' : ''
            }`}
          >
            <textarea
              id="text-input"
              rows={8}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setSelectedPresetId('');
              }}
              placeholder="Paste email correspondence, appointment letter, equipment purchase instructions, or lease agreement here..."
              className="w-full bg-[#18191c] border border-[#3c4043] rounded-xl p-3.5 text-xs text-[#e8eaed] placeholder:text-[#5f6368] focus:outline-none focus:ring-2 focus:ring-[#4285F4]/50 focus:border-[#4285F4] leading-relaxed font-sans transition-all resize-y"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              id="scan-submit-btn"
              type="submit"
              disabled={isLoading || (!text.trim() && !url.trim())}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-[#1a73e8] hover:bg-[#1557b0] active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-lg shadow-[#1a73e8]/30"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Inspecting Threat Signatures...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Inspect Threat Index (0–100%)</span>
                </>
              )}
            </button>

            <button
              id="clear-btn"
              type="button"
              onClick={handleClear}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#9aa0a6] hover:text-[#e8eaed] hover:bg-[#303134] transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>

          <div className="text-[11px] text-[#9aa0a6] flex items-center gap-1.5">
            <span>Security checks:</span>
            <span className="text-[#8ab4f8] font-medium">Domain Age</span>
            <span className="w-1 h-1 rounded-full bg-[#EA4335]"></span>
            <span className="text-[#fdd663] font-medium">Payment Red Flags</span>
            <span className="w-1 h-1 rounded-full bg-[#34A853]"></span>
            <span className="text-[#81c995] font-medium">FTC Warning Signatures</span>
          </div>
        </div>
      </form>
    </div>
  );
};
