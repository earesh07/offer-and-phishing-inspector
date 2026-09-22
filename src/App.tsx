import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.js';
import { ThreatIndexGauge } from './components/ThreatIndexGauge.js';
import { ScannerInput } from './components/ScannerInput.js';
import { DomainInspectorCard } from './components/DomainInspectorCard.js';
import { PaymentFlagsCard } from './components/PaymentFlagsCard.js';
import { TextHighlighterCard } from './components/TextHighlighterCard.js';
import { SafetyRecommendations } from './components/SafetyRecommendations.js';
import { ExtensionHub } from './components/ExtensionHub.js';
import { ForensicScanResult } from './types.js';
import { SAMPLE_CASES } from './data/sampleCases.js';
import { AlertCircle, ShieldAlert } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<'scanner' | 'extension'>('scanner');
  const [scanResult, setScanResult] = useState<ForensicScanResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (text: string, url?: string, senderEmail?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, url, senderEmail })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to inspect document.');
      }

      const data: ForensicScanResult = await response.json();
      setScanResult(data);

      // Smooth scroll to results
      setTimeout(() => {
        const resultsEl = document.getElementById('threat-index-card');
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err: any) {
      console.error('Scan error:', err);
      setError(err.message || 'An error occurred during forensic inspection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Run initial scan on first sample on mount so application loads ready and demonstrated
  useEffect(() => {
    const defaultSample = SAMPLE_CASES[0];
    handleScan(defaultSample.text, defaultSample.url, defaultSample.senderEmail);
  }, []);

  return (
    <div className="min-h-screen bg-[#18191c] text-[#e8eaed] flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-[#4285F4]/30 selection:text-[#8ab4f8]">
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        aiEnabled={true}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-[#EA4335]/15 border border-[#EA4335]/30 text-[#f28b82] text-xs flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#EA4335]" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-[#9aa0a6] hover:text-[#e8eaed] font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {activeView === 'scanner' ? (
          <div className="space-y-6">
            {/* Input Section */}
            <ScannerInput onScan={handleScan} isLoading={isLoading} />

            {/* Results Section */}
            {scanResult && (
              <div className="space-y-6 animate-in fade-in duration-500">
                {/* Threat Index Radial Gauge & Mathematical Breakdown */}
                <ThreatIndexGauge
                  threatIndex={scanResult.threatIndex}
                  aiAnalysisUsed={scanResult.aiAnalysisUsed}
                />

                {/* Two-Column Grid: Domain Age & Payment Demands */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <DomainInspectorCard domainAnalysis={scanResult.domainAnalysis} />
                  <PaymentFlagsCard flags={scanResult.paymentFlags} />
                </div>

                {/* In-Text Forensic Document Annotator */}
                <TextHighlighterCard
                  segments={scanResult.highlightSegments}
                  claimedEntity={scanResult.claimedEntity}
                />

                {/* Safety Action Protocol & Reporting Portals */}
                <SafetyRecommendations threatIndex={scanResult.threatIndex} />
              </div>
            )}
          </div>
        ) : (
          /* Browser Extension Hub */
          <ExtensionHub />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#3c4043] bg-[#202124]/80 py-6 mt-12 text-center text-xs text-[#9aa0a6]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[#9aa0a6]">
            <ShieldAlert className="w-4 h-4 text-[#4285F4]" />
            <span className="font-semibold text-[#e8eaed]">Offer & Phishing Inspector</span>
            <span>—</span>
            <span>Real-time employment and rental security engine</span>
          </div>
          <div className="text-[#9aa0a6]">
            Complies with FTC, CISA, and IC3 consumer anti-phishing guidelines
          </div>
        </div>
      </footer>
    </div>
  );
}
