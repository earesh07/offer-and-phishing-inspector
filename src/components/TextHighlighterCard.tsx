import React, { useState } from 'react';
import { HighlightSegment } from '../types.js';
import { FileText, Eye, AlertCircle, Copy, Check } from 'lucide-react';

interface TextHighlighterCardProps {
  segments: HighlightSegment[];
  claimedEntity?: {
    companyOrLandlord: string;
    jobTitleOrListing: string;
    offeredRateOrRent: string;
    interviewChannel: string;
  };
}

export const TextHighlighterCard: React.FC<TextHighlighterCardProps> = ({
  segments,
  claimedEntity,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const rawText = segments.map((s) => s.text).join('');
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const flaggedCount = segments.filter((s) => s.isFlagged).length;

  return (
    <div id="text-highlighter-card" className="rounded-2xl bg-[#202124]/90 border border-[#3c4043] p-5 md:p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#3c4043] gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#4285F4]/15 border border-[#4285F4]/30 text-[#8ab4f8]">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#e8eaed] uppercase tracking-wider">
              Forensic Document Parsing & In-Text Highlight Annotations
            </h3>
            <p className="text-xs text-[#9aa0a6]">
              {flaggedCount} suspicious phrase{flaggedCount === 1 ? '' : 's'} highlighted directly in the document
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#e8eaed] bg-[#303134] hover:bg-[#3c4043] transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#81c995]" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy Text'}</span>
        </button>
      </div>

      {/* Claimed Entity Metadata Ribbon */}
      {claimedEntity && (
        <div className="my-4 grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#18191c] p-3 rounded-xl border border-[#3c4043] text-xs">
          <div>
            <div className="text-[10px] text-[#9aa0a6] uppercase font-semibold">Claimed Entity</div>
            <div className="font-bold text-[#8ab4f8] truncate mt-0.5" title={claimedEntity.companyOrLandlord}>
              {claimedEntity.companyOrLandlord}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-[#9aa0a6] uppercase font-semibold">Role / Listing</div>
            <div className="font-bold text-[#e8eaed] truncate mt-0.5" title={claimedEntity.jobTitleOrListing}>
              {claimedEntity.jobTitleOrListing}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-[#9aa0a6] uppercase font-semibold">Compensation / Rent</div>
            <div className="font-bold text-[#81c995] truncate mt-0.5" title={claimedEntity.offeredRateOrRent}>
              {claimedEntity.offeredRateOrRent}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-[#9aa0a6] uppercase font-semibold">Interview Channel</div>
            <div className={`font-bold truncate mt-0.5 ${claimedEntity.interviewChannel.includes('Telegram') ? 'text-[#f28b82]' : 'text-[#fdd663]'}`} title={claimedEntity.interviewChannel}>
              {claimedEntity.interviewChannel}
            </div>
          </div>
        </div>
      )}

      {/* Forensic Annotated Text Box */}
      <div className="mt-3 p-4 rounded-xl bg-[#18191c] border border-[#3c4043] font-mono text-xs leading-relaxed text-[#e8eaed] max-h-96 overflow-y-auto whitespace-pre-wrap selection:bg-[#4285F4]/30">
        {segments.map((segment, index) => {
          if (!segment.isFlagged) {
            return <span key={index}>{segment.text}</span>;
          }

          const isCritical = segment.severity === 'critical';

          return (
            <mark
              key={index}
              className={`inline rounded px-1.5 py-0.5 mx-0.5 font-semibold transition-all relative group cursor-help ${
                isCritical
                  ? 'bg-[#EA4335]/25 text-[#f28b82] border-b-2 border-[#EA4335]'
                  : 'bg-[#FBBC04]/25 text-[#fdd663] border-b-2 border-[#FBBC04]'
              }`}
              title={`Detected Red Flag (${segment.severity || 'warning'})`}
            >
              {segment.text}
              <span className="ml-1 inline-flex items-center text-[10px] align-baseline uppercase font-extrabold text-[#f28b82] opacity-90">
                [!]
              </span>
            </mark>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-[#9aa0a6]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#EA4335]/40 border border-[#EA4335]" />
          <span>Critical Advance Payment / Fake Check Trap</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#FBBC04]/40 border border-[#FBBC04]" />
          <span>Suspicious Channel / High-Risk Condition</span>
        </div>
      </div>
    </div>
  );
};
