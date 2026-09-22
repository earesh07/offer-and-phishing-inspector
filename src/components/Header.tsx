import React from 'react';
import { ShieldCheck, Chrome, FileSearch, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeView: 'scanner' | 'extension';
  setActiveView: (view: 'scanner' | 'extension') => void;
  aiEnabled: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
}) => {
  return (
    <header className="border-b border-[#3c4043]/80 bg-[#202124]/90 backdrop-blur-md sticky top-0 z-40">
      {/* Signature Google Quad-Color Accent Strip */}
      <div className="h-1 w-full grid grid-cols-4">
        <span className="bg-[#4285F4] h-full shadow-sm shadow-[#4285F4]/50"></span>
        <span className="bg-[#EA4335] h-full shadow-sm shadow-[#EA4335]/50"></span>
        <span className="bg-[#FBBC04] h-full shadow-sm shadow-[#FBBC04]/50"></span>
        <span className="bg-[#34A853] h-full shadow-sm shadow-[#34A853]/50"></span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Logo & Identity with Google 4-Color Motif */}
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-xl bg-[#303134] border border-[#3c4043] flex items-center justify-center shadow-lg shadow-black/40 overflow-hidden group">
              {/* Subtle Google quad-color corner glow */}
              <div className="absolute top-0 left-0 w-2.5 h-2.5 bg-[#4285F4] rounded-br-full opacity-80" />
              <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#EA4335] rounded-bl-full opacity-80" />
              <div className="absolute bottom-0 left-0 w-2.5 h-2.5 bg-[#FBBC04] rounded-tr-full opacity-80" />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#34A853] rounded-tl-full opacity-80" />
              <ShieldCheck className="w-5 h-5 text-[#8ab4f8] relative z-10" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-[#e8eaed] font-['Plus_Jakarta_Sans'] flex items-center gap-1">
                  <span>Offer</span>
                  <span className="text-[#8ab4f8]">&</span>
                  <span>Phishing Inspector</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#4285F4]/15 text-[#8ab4f8] border border-[#4285F4]/30">
                  Google Security Theme
                </span>
              </div>
              <p className="text-xs text-[#9aa0a6]">
                Detects fake appointments, equipment check schemes & rental wire traps
              </p>
            </div>
          </div>

          {/* Navigation & Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-xl bg-[#303134] p-1 border border-[#3c4043]">
              <button
                id="nav-scanner-btn"
                type="button"
                onClick={() => setActiveView('scanner')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeView === 'scanner'
                    ? 'bg-[#1a73e8] text-white shadow-md shadow-[#1a73e8]/30'
                    : 'text-[#9aa0a6] hover:text-[#e8eaed] hover:bg-[#3c4043]/50'
                }`}
              >
                <FileSearch className="w-3.5 h-3.5 text-[#8ab4f8]" />
                <span>Single-Page Scanner</span>
              </button>

              <button
                id="nav-extension-btn"
                type="button"
                onClick={() => setActiveView('extension')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeView === 'extension'
                    ? 'bg-[#1a73e8] text-white shadow-md shadow-[#1a73e8]/30'
                    : 'text-[#9aa0a6] hover:text-[#e8eaed] hover:bg-[#3c4043]/50'
                }`}
              >
                <Chrome className="w-3.5 h-3.5 text-[#81c995]" />
                <span>Browser Extension</span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#34A853]/25 text-[#81c995] border border-[#34A853]/30">
                  v3
                </span>
              </button>
            </div>

            {/* AI Status Indicator with Google Quad Dots */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#303134] border border-[#3c4043] text-[11px] text-[#e8eaed]">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4285F4]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#EA4335]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#FBBC04]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#34A853]"></span>
              </div>
              <span className="font-medium text-[#bdc1c6]">Gemini 3.8 Forensic Core</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
