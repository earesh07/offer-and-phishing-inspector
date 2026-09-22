import React from 'react';
import { DomainAnalysis } from '../types.js';
import { Globe, Calendar, AlertTriangle, ShieldCheck, ShieldAlert, Building2, Server } from 'lucide-react';

interface DomainInspectorCardProps {
  domainAnalysis: DomainAnalysis;
}

export const DomainInspectorCard: React.FC<DomainInspectorCardProps> = ({ domainAnalysis }) => {
  const {
    domain,
    ageFormatted,
    creationDate,
    registrar,
    isNewlyRegistered,
    isSuspiciousTld,
    isLookalikeBrand,
    detectedBrand,
    freeEmailWarning,
    threatLevel,
    details
  } = domainAnalysis;

  const isDanger = threatLevel === 'critical' || threatLevel === 'high';

  return (
    <div id="domain-inspector-card" className="rounded-2xl bg-[#202124]/90 border border-[#3c4043] p-5 md:p-6 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-[#3c4043]">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl border ${isDanger ? 'bg-[#EA4335]/15 border-[#EA4335]/30 text-[#f28b82]' : 'bg-[#34A853]/15 border-[#34A853]/30 text-[#81c995]'}`}>
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#e8eaed] uppercase tracking-wider">
              Domain Age & Infrastructure Inspector
            </h3>
            <p className="text-xs text-[#9aa0a6] font-mono">
              Target: {domain || 'No explicit domain parsed'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isDanger ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#EA4335]/15 text-[#f28b82] border border-[#EA4335]/30">
              <ShieldAlert className="w-3.5 h-3.5" />
              High Risk Domain
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#34A853]/15 text-[#81c995] border border-[#34A853]/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Tenured Domain
            </span>
          )}
        </div>
      </div>

      {/* Grid of Key Domain Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-4">
        {/* Domain Age */}
        <div className={`p-3.5 rounded-xl border ${isNewlyRegistered ? 'bg-[#EA4335]/10 border-[#EA4335]/30' : 'bg-[#18191c] border-[#3c4043]'}`}>
          <div className="flex items-center gap-1.5 text-xs text-[#9aa0a6] mb-1">
            <Calendar className="w-3.5 h-3.5 text-[#FBBC04]" />
            <span>Registration Age</span>
          </div>
          <div className={`text-base font-bold font-mono ${isNewlyRegistered ? 'text-[#f28b82]' : 'text-[#81c995]'}`}>
            {ageFormatted}
          </div>
          <div className="text-[11px] text-[#9aa0a6] mt-0.5">
            {isNewlyRegistered ? '🚨 Under 60 days (Phishing risk)' : '✅ Established registration history'}
          </div>
        </div>

        {/* Brand Spoofing Check */}
        <div className={`p-3.5 rounded-xl border ${isLookalikeBrand ? 'bg-[#EA4335]/10 border-[#EA4335]/30' : 'bg-[#18191c] border-[#3c4043]'}`}>
          <div className="flex items-center gap-1.5 text-xs text-[#9aa0a6] mb-1">
            <Building2 className="w-3.5 h-3.5 text-[#8ab4f8]" />
            <span>Brand Impersonation</span>
          </div>
          <div className={`text-base font-bold ${isLookalikeBrand ? 'text-[#f28b82]' : 'text-[#e8eaed]'}`}>
            {isLookalikeBrand ? `Typosquat: ${detectedBrand?.toUpperCase()}` : 'None Detected'}
          </div>
          <div className="text-[11px] text-[#9aa0a6] mt-0.5">
            {isLookalikeBrand ? '🚨 Lookalike hyphenated brand mimic' : 'No trademark typosquatting detected'}
          </div>
        </div>

        {/* TLD Reputation */}
        <div className={`p-3.5 rounded-xl border ${isSuspiciousTld ? 'bg-[#FBBC04]/10 border-[#FBBC04]/30' : 'bg-[#18191c] border-[#3c4043]'}`}>
          <div className="flex items-center gap-1.5 text-xs text-[#9aa0a6] mb-1">
            <Server className="w-3.5 h-3.5 text-[#FBBC04]" />
            <span>TLD Category</span>
          </div>
          <div className={`text-base font-bold font-mono ${isSuspiciousTld ? 'text-[#fdd663]' : 'text-[#e8eaed]'}`}>
            .{domain.split('.').pop() || 'com'}
          </div>
          <div className="text-[11px] text-[#9aa0a6] mt-0.5">
            {isSuspiciousTld ? '⚠️ High-abuse disposable TLD' : 'Standard enterprise / gTLD'}
          </div>
        </div>

        {/* Registrar & Creation Date */}
        <div className="p-3.5 rounded-xl border bg-[#18191c] border-[#3c4043]">
          <div className="flex items-center gap-1.5 text-xs text-[#9aa0a6] mb-1">
            <Calendar className="w-3.5 h-3.5 text-[#8ab4f8]" />
            <span>Created Date</span>
          </div>
          <div className="text-sm font-bold text-[#e8eaed] font-mono">
            {creationDate || 'Recent'}
          </div>
          <div className="text-[11px] text-[#9aa0a6] mt-0.5 truncate" title={registrar}>
            {registrar}
          </div>
        </div>
      </div>

      {/* Free Email Warning Notice */}
      {freeEmailWarning && (
        <div className="mb-4 p-3 rounded-xl bg-[#FBBC04]/10 border border-[#FBBC04]/30 flex items-start gap-2.5 text-xs text-[#fdd663]">
          <AlertTriangle className="w-4 h-4 text-[#FBBC04] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Public Free Webmail Warning:</span> The recruiter or landlord communicates from a public free email service (<code className="font-mono bg-[#303134] px-1 py-0.5 rounded text-[#e8eaed]">@{domain}</code>). Verified corporations and leasing agencies mandate official enterprise email domains.
          </div>
        </div>
      )}

      {/* Details List */}
      <div className="space-y-1.5 mt-2">
        <div className="text-xs font-bold text-[#bdc1c6] uppercase tracking-wider mb-2">
          Forensic Infrastructure Observations
        </div>
        {details.map((detail, idx) => (
          <div
            key={idx}
            className={`text-xs p-2.5 rounded-xl flex items-start gap-2 ${
              detail.startsWith('CRITICAL') || detail.includes('mimics') || detail.includes('Lookalike')
                ? 'bg-[#EA4335]/10 text-[#f28b82] border border-[#EA4335]/30'
                : detail.includes('High-abuse') || detail.includes('under 60 days')
                ? 'bg-[#FBBC04]/10 text-[#fdd663] border border-[#FBBC04]/30'
                : 'bg-[#18191c] text-[#bdc1c6] border border-[#3c4043]'
            }`}
          >
            <span className="font-mono font-bold text-[#8ab4f8]">[{idx + 1}]</span>
            <span>{detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
