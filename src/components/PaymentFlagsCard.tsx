import React from 'react';
import { PaymentRedFlag } from '../types.js';
import { CreditCard, AlertOctagon, AlertTriangle, ShieldCheck, DollarSign } from 'lucide-react';

interface PaymentFlagsCardProps {
  flags: PaymentRedFlag[];
}

export const PaymentFlagsCard: React.FC<PaymentFlagsCardProps> = ({ flags }) => {
  const criticalFlags = flags.filter(f => f.severity === 'critical');
  const highFlags = flags.filter(f => f.severity === 'high');
  const otherFlags = flags.filter(f => f.severity !== 'critical' && f.severity !== 'high');

  return (
    <div id="payment-flags-card" className="rounded-2xl bg-[#202124]/90 border border-[#3c4043] p-5 md:p-6 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-[#3c4043]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#FBBC04]/15 border border-[#FBBC04]/30 text-[#FBBC04]">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#e8eaed] uppercase tracking-wider">
              Payment Demand & Advance Fee Red Flags
            </h3>
            <p className="text-xs text-[#9aa0a6]">
              FTC Red Flag Heuristics: Counterfeit Checks, Equipment Vendors, & Wire Demands
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {flags.length > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#EA4335]/15 text-[#f28b82] border border-[#EA4335]/30">
              <AlertOctagon className="w-3.5 h-3.5" />
              {flags.length} Red Flag{flags.length > 1 ? 's' : ''} Triggered
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#34A853]/15 text-[#81c995] border border-[#34A853]/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Zero Payment Demands Detected
            </span>
          )}
        </div>
      </div>

      {flags.length === 0 ? (
        <div className="py-8 text-center text-[#9aa0a6]">
          <ShieldCheck className="w-10 h-10 text-[#81c995] mx-auto mb-2 opacity-80" />
          <p className="text-sm font-medium text-[#e8eaed]">Clean Financial Profile</p>
          <p className="text-xs text-[#9aa0a6] mt-1 max-w-md mx-auto">
            No equipment check overpayment traps, advance training fees, or sight-unseen wire demands were detected in the text.
          </p>
        </div>
      ) : (
        <div className="space-y-3 mt-4">
          {flags.map((flag) => {
            const isCritical = flag.severity === 'critical';
            return (
              <div
                key={flag.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCritical
                    ? 'bg-[#EA4335]/10 border-[#EA4335]/30 text-[#e8eaed] shadow-sm'
                    : 'bg-[#FBBC04]/10 border-[#FBBC04]/30 text-[#e8eaed] shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {isCritical ? (
                      <AlertOctagon className="w-4 h-4 text-[#f28b82] shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-[#FBBC04] shrink-0" />
                    )}
                    <span className="font-bold text-xs uppercase tracking-wider text-[#e8eaed]">
                      {flag.title}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                      isCritical
                        ? 'bg-[#EA4335]/20 text-[#f28b82] border-[#EA4335]/30'
                        : 'bg-[#FBBC04]/20 text-[#fdd663] border-[#FBBC04]/30'
                    }`}
                  >
                    {flag.severity}
                  </span>
                </div>

                {/* Exact Excerpt Detected in Letter */}
                <div className="my-2.5 p-2.5 rounded-lg bg-[#18191c] border border-[#3c4043] text-xs font-mono text-[#bdc1c6]">
                  <span className="text-[10px] uppercase font-bold text-[#9aa0a6] block mb-0.5 font-sans">
                    Flagged Excerpt:
                  </span>
                  &ldquo;{flag.snippet}&rdquo;
                </div>

                {/* Explanation */}
                <p className="text-xs text-[#bdc1c6] leading-relaxed">
                  {flag.explanation}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
