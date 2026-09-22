import React, { useState } from 'react';
import { ScamThreatIndex } from '../types.js';
import { ShieldCheck, AlertTriangle, ExternalLink, Printer, CheckSquare, ArrowUpRight, Lock } from 'lucide-react';

interface SafetyRecommendationsProps {
  threatIndex: ScamThreatIndex;
}

export const SafetyRecommendations: React.FC<SafetyRecommendationsProps> = ({ threatIndex }) => {
  const { recommendations, passedChecks, criticalRedFlags, tier } = threatIndex;
  const isHighDanger = tier === 'CRITICAL_SCAM' || tier === 'HIGH_RISK';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="safety-recommendations-card" className="rounded-2xl bg-[#202124]/90 border border-[#3c4043] p-5 md:p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#3c4043] gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#4285F4]/15 border border-[#4285F4]/30 text-[#8ab4f8]">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#e8eaed] uppercase tracking-wider">
              Safety Action Protocol & Incident Response
            </h3>
            <p className="text-xs text-[#9aa0a6]">
              Mandatory candidate & renter protections against financial fraud
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#e8eaed] bg-[#303134] hover:bg-[#3c4043] transition-colors"
        >
          <Printer className="w-3.5 h-3.5 text-[#8ab4f8]" />
          <span>Export Forensic Dossier</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
        {/* Recommended Actions Checklist */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#bdc1c6] mb-3 flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5 text-[#8ab4f8]" />
            Recommended Countermeasures
          </h4>
          <ul className="space-y-2.5">
            {recommendations.map((rec, i) => (
              <li
                key={i}
                className="text-xs text-[#e8eaed] bg-[#18191c] p-3 rounded-xl border border-[#3c4043] flex items-start gap-2.5 leading-relaxed"
              >
                <span className="font-bold text-[#4285F4] shrink-0 mt-0.5">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Official Reporting Agencies & Next Steps */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#bdc1c6] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#81c995]" />
            Official Cyber Fraud Reporting Portals
          </h4>

          <div className="p-4 rounded-xl bg-[#18191c] border border-[#3c4043] space-y-3">
            <div className="flex items-start justify-between gap-3 text-xs">
              <div>
                <div className="font-bold text-[#e8eaed]">FBI Internet Crime Complaint Center (IC3)</div>
                <div className="text-[#9aa0a6] text-[11px] mt-0.5">
                  Federal repository for employment scams, advance fee fraud & wire traps.
                </div>
              </div>
              <a
                href="https://www.ic3.gov"
                target="_blank"
                rel="noreferrer noopener"
                className="shrink-0 p-1.5 rounded-lg bg-[#303134] text-[#8ab4f8] hover:text-[#4285F4] hover:bg-[#3c4043] transition-colors"
                title="Visit IC3.gov"
              >
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>

            <div className="pt-2.5 border-t border-[#3c4043] flex items-start justify-between gap-3 text-xs">
              <div>
                <div className="font-bold text-[#e8eaed]">FTC Fraud Action Center (ReportFraud.ftc.gov)</div>
                <div className="text-[#9aa0a6] text-[11px] mt-0.5">
                  Investigates counterfeit cashier check schemes and fake remote employer rings.
                </div>
              </div>
              <a
                href="https://reportfraud.ftc.gov"
                target="_blank"
                rel="noreferrer noopener"
                className="shrink-0 p-1.5 rounded-lg bg-[#303134] text-[#8ab4f8] hover:text-[#4285F4] hover:bg-[#3c4043] transition-colors"
                title="Visit ReportFraud.ftc.gov"
              >
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>

            <div className="pt-2.5 border-t border-[#3c4043] flex items-start justify-between gap-3 text-xs">
              <div>
                <div className="font-bold text-[#e8eaed]">Postal Inspection Service (USPIS)</div>
                <div className="text-[#9aa0a6] text-[11px] mt-0.5">
                  Jurisdiction over counterfeit checks sent via mail, FedEx, or courier.
                </div>
              </div>
              <a
                href="https://www.uspis.gov/report"
                target="_blank"
                rel="noreferrer noopener"
                className="shrink-0 p-1.5 rounded-lg bg-[#303134] text-[#8ab4f8] hover:text-[#4285F4] hover:bg-[#3c4043] transition-colors"
                title="Visit USPIS"
              >
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {isHighDanger && (
            <div className="p-3 rounded-xl bg-[#EA4335]/15 border border-[#EA4335]/30 text-[#f28b82] text-xs">
              <span className="font-bold block mb-0.5">⚠️ Bank Alert Reminder:</span>
              If you have already deposited a physical or mobile check, immediately contact your financial institution’s fraud division and request an immediate hold to prevent bad-check fees or account closure.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
