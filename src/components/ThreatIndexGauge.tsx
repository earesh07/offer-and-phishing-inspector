import React from 'react';
import { ScamThreatIndex } from '../types.js';
import { ShieldCheck, AlertTriangle, AlertOctagon, Info, Flame, CheckCircle2, XCircle, Sparkles, Cpu } from 'lucide-react';

interface ThreatIndexGaugeProps {
  threatIndex: ScamThreatIndex;
  aiAnalysisUsed?: boolean;
}

export const ThreatIndexGauge: React.FC<ThreatIndexGaugeProps> = ({ threatIndex, aiAnalysisUsed }) => {
  const { score, tier, verdict, summary, breakdown, passedChecks, criticalRedFlags, warningFlags } = threatIndex;

  // Arc calculation for SVG Speedometer Gauge (semi-circle / 180 degrees)
  const radius = 80;
  const circumference = Math.PI * radius; // 180 deg arc length
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Tier color mapping
  const getTierDetails = () => {
    switch (tier) {
      case 'CRITICAL_SCAM':
        return {
          colorText: 'text-[#f28b82]',
          colorBg: 'bg-[#EA4335]/15',
          colorBorder: 'border-[#EA4335]/40',
          gradientStroke: 'url(#gradient-critical)',
          badgeText: 'CRITICAL SCAM THREAT',
          icon: <AlertOctagon className="w-5 h-5 text-[#f28b82] animate-pulse" />
        };
      case 'HIGH_RISK':
        return {
          colorText: 'text-[#f28b82]',
          colorBg: 'bg-[#EA4335]/15',
          colorBorder: 'border-[#EA4335]/40',
          gradientStroke: 'url(#gradient-high)',
          badgeText: 'HIGH RISK PHISHING',
          icon: <Flame className="w-5 h-5 text-[#f28b82]" />
        };
      case 'MODERATE_RISK':
        return {
          colorText: 'text-[#fdd663]',
          colorBg: 'bg-[#FBBC04]/15',
          colorBorder: 'border-[#FBBC04]/40',
          gradientStroke: 'url(#gradient-moderate)',
          badgeText: 'MODERATE SUSPICION',
          icon: <AlertTriangle className="w-5 h-5 text-[#fdd663]" />
        };
      case 'LOW_RISK':
        return {
          colorText: 'text-[#8ab4f8]',
          colorBg: 'bg-[#4285F4]/15',
          colorBorder: 'border-[#4285F4]/40',
          gradientStroke: 'url(#gradient-low)',
          badgeText: 'LOW RISK PROFILE',
          icon: <ShieldCheck className="w-5 h-5 text-[#8ab4f8]" />
        };
      default:
        return {
          colorText: 'text-[#81c995]',
          colorBg: 'bg-[#34A853]/15',
          colorBorder: 'border-[#34A853]/40',
          gradientStroke: 'url(#gradient-safe)',
          badgeText: 'VERIFIED BENIGN',
          icon: <ShieldCheck className="w-5 h-5 text-[#81c995]" />
        };
    }
  };

  const tierDetails = getTierDetails();

  return (
    <div id="threat-index-card" className="rounded-2xl bg-[#202124]/95 border border-[#3c4043] p-5 md:p-6 shadow-xl relative overflow-hidden">
      {/* Background Google Quad Ambient Glow */}
      <div 
        className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20 ${
          score >= 60 ? 'bg-[#EA4335]' : score >= 30 ? 'bg-[#FBBC04]' : 'bg-[#34A853]'
        }`}
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        {/* Left: Interactive Speedometer Gauge */}
        <div className="flex flex-col items-center sm:items-start sm:flex-row sm:space-x-6">
          <div className="relative w-48 h-32 flex flex-col items-center justify-end">
            <svg className="w-48 h-28 overflow-visible" viewBox="0 0 200 110">
              <defs>
                {/* Google Quad-Color Speedometer Gradients */}
                <linearGradient id="gradient-critical" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FBBC04" />
                  <stop offset="50%" stopColor="#EA4335" />
                  <stop offset="100%" stopColor="#d93025" />
                </linearGradient>
                <linearGradient id="gradient-high" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FBBC04" />
                  <stop offset="100%" stopColor="#EA4335" />
                </linearGradient>
                <linearGradient id="gradient-moderate" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4285F4" />
                  <stop offset="100%" stopColor="#FBBC04" />
                </linearGradient>
                <linearGradient id="gradient-low" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#34A853" />
                  <stop offset="100%" stopColor="#4285F4" />
                </linearGradient>
                <linearGradient id="gradient-safe" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1e8e3e" />
                  <stop offset="100%" stopColor="#34A853" />
                </linearGradient>
              </defs>

              {/* Gauge Track */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#303134"
                strokeWidth="16"
                strokeLinecap="round"
              />

              {/* Active Progress Arc */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke={tierDetails.gradientStroke}
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Score in Center of Gauge */}
            <div className="absolute bottom-1 text-center">
              <div className={`text-4xl font-black tracking-tight ${tierDetails.colorText} font-['JetBrains_Mono']`}>
                {score}%
              </div>
              <div className="text-[11px] font-semibold text-[#9aa0a6] tracking-wide uppercase">
                Threat Index
              </div>
            </div>
          </div>

          {/* Verdict and Summary */}
          <div className="mt-4 sm:mt-0 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${tierDetails.colorBg} ${tierDetails.colorText} border ${tierDetails.colorBorder}`}>
                {tierDetails.icon}
                {tierDetails.badgeText}
              </span>

              {aiAnalysisUsed ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#4285F4]/15 text-[#8ab4f8] border border-[#4285F4]/30">
                  <Sparkles className="w-3 h-3 text-[#4285F4]" />
                  Gemini Deep Forensic Scan
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#34A853]/15 text-[#81c995] border border-[#34A853]/30">
                  <Cpu className="w-3 h-3 text-[#34A853]" />
                  Google Heuristic Engine
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#e8eaed] tracking-tight leading-snug">
              {verdict}
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-[#bdc1c6] leading-relaxed max-w-xl">
              {summary}
            </p>
          </div>
        </div>

        {/* Right: Key Stats Card with Google Palette */}
        <div className="grid grid-cols-3 gap-2 lg:gap-3 bg-[#18191c] p-3.5 rounded-xl border border-[#3c4043] min-w-[280px]">
          <div className="text-center">
            <div className="text-xs text-[#9aa0a6] uppercase font-semibold">Critical Flags</div>
            <div className="text-xl font-black text-[#f28b82] mt-0.5">{criticalRedFlags.length}</div>
            <div className="text-[10px] text-[#5f6368]">Severe threats</div>
          </div>
          <div className="text-center border-x border-[#3c4043] px-2">
            <div className="text-xs text-[#9aa0a6] uppercase font-semibold">Warnings</div>
            <div className="text-xl font-black text-[#fdd663] mt-0.5">{warningFlags.length}</div>
            <div className="text-[10px] text-[#5f6368]">Elevated risks</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-[#9aa0a6] uppercase font-semibold">Passed Checks</div>
            <div className="text-xl font-black text-[#81c995] mt-0.5">{passedChecks.length}</div>
            <div className="text-[10px] text-[#5f6368]">Verified safe</div>
          </div>
        </div>
      </div>

      {/* Four Pillar Formula Breakdown Progress Bars Colored by Google 4 Core Colors */}
      <div className="mt-6 pt-5 border-t border-[#3c4043] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1: Google Blue */}
        <div className="bg-[#18191c]/70 p-3 rounded-xl border border-[#3c4043] hover:border-[#4285F4]/50 transition-colors">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-[#e8eaed] font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4285F4]"></span>
              Domain Integrity
            </span>
            <span className={`font-mono font-bold ${breakdown.domainScore > 50 ? 'text-[#f28b82]' : 'text-[#8ab4f8]'}`}>
              {breakdown.domainScore}%
            </span>
          </div>
          <div className="w-full bg-[#303134] h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ${breakdown.domainScore > 50 ? 'bg-[#EA4335]' : 'bg-[#4285F4]'}`}
              style={{ width: `${breakdown.domainScore}%` }}
            />
          </div>
          <div className="text-[10px] text-[#9aa0a6] mt-1">Weight: 30% | Age & Brand Check</div>
        </div>

        {/* Pillar 2: Google Red */}
        <div className="bg-[#18191c]/70 p-3 rounded-xl border border-[#3c4043] hover:border-[#EA4335]/50 transition-colors">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-[#e8eaed] font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#EA4335]"></span>
              Payment & Advance Traps
            </span>
            <span className={`font-mono font-bold ${breakdown.paymentScore > 50 ? 'text-[#f28b82]' : 'text-[#e8eaed]'}`}>
              {breakdown.paymentScore}%
            </span>
          </div>
          <div className="w-full bg-[#303134] h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#EA4335] transition-all duration-700"
              style={{ width: `${breakdown.paymentScore}%` }}
            />
          </div>
          <div className="text-[10px] text-[#9aa0a6] mt-1">Weight: 35% | Checks, Wires, Zelle</div>
        </div>

        {/* Pillar 3: Google Yellow */}
        <div className="bg-[#18191c]/70 p-3 rounded-xl border border-[#3c4043] hover:border-[#FBBC04]/50 transition-colors">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-[#e8eaed] font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FBBC04]"></span>
              Communication Channels
            </span>
            <span className={`font-mono font-bold ${breakdown.communicationScore > 50 ? 'text-[#f28b82]' : 'text-[#fdd663]'}`}>
              {breakdown.communicationScore}%
            </span>
          </div>
          <div className="w-full bg-[#303134] h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FBBC04] transition-all duration-700"
              style={{ width: `${breakdown.communicationScore}%` }}
            />
          </div>
          <div className="text-[10px] text-[#9aa0a6] mt-1">Weight: 20% | Telegram / Text Chat</div>
        </div>

        {/* Pillar 4: Google Green */}
        <div className="bg-[#18191c]/70 p-3 rounded-xl border border-[#3c4043] hover:border-[#34A853]/50 transition-colors">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-[#e8eaed] font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#34A853]"></span>
              Contract Integrity
            </span>
            <span className={`font-mono font-bold ${breakdown.contractAnomaliesScore > 50 ? 'text-[#f28b82]' : 'text-[#81c995]'}`}>
              {breakdown.contractAnomaliesScore}%
            </span>
          </div>
          <div className="w-full bg-[#303134] h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ${breakdown.contractAnomaliesScore > 50 ? 'bg-[#EA4335]' : 'bg-[#34A853]'}`}
              style={{ width: `${breakdown.contractAnomaliesScore}%` }}
            />
          </div>
          <div className="text-[10px] text-[#9aa0a6] mt-1">Weight: 15% | High Pay / Urgency</div>
        </div>
      </div>
    </div>
  );
};
