import React, { useState, useEffect } from 'react';
import { Chrome, Download, Globe, ShieldAlert, ShieldCheck, AlertTriangle, Code, Play, RefreshCw, ExternalLink, Check, Copy } from 'lucide-react';
import { UrlInspectionResult } from '../types.js';

export const ExtensionHub: React.FC = () => {
  const [simulatedUrl, setSimulatedUrl] = useState('https://careers-stripe-verify.com/offer/auth/download-letter.php');
  const [inspectionResult, setInspectionResult] = useState<UrlInspectionResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [activeTabCode, setActiveTabCode] = useState<'manifest.json' | 'popup.html' | 'popup.js' | 'background.js' | 'content.js'>('manifest.json');
  const [extensionFiles, setExtensionFiles] = useState<Record<string, string>>({});
  const [copiedCode, setCopiedCode] = useState(false);

  // Run initial scan on simulated URL
  const runUrlInspection = async (urlToTest: string) => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/inspect-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToTest })
      });
      const data = await res.json();
      setInspectionResult(data);
    } catch (err) {
      console.error('Inspection error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    runUrlInspection(simulatedUrl);
    // Fetch extension files for the code viewer
    fetch('/api/extension/files')
      .then(res => res.json())
      .then(data => setExtensionFiles(data))
      .catch(err => console.error('Failed to load extension files:', err));
  }, []);

  const handleDownloadZip = async () => {
    setDownloadingZip(true);
    try {
      const response = await fetch('/api/extension/download');
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'offer-phishing-inspector-extension.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (err) {
      alert('Failed to download extension package. Please try again.');
    } finally {
      setDownloadingZip(false);
    }
  };

  const copyCurrentFileCode = () => {
    if (extensionFiles[activeTabCode]) {
      navigator.clipboard.writeText(extensionFiles[activeTabCode]);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const presetSimulatedUrls = [
    { label: 'Stripe Lookalike Phishing', url: 'https://careers-stripe-verify.com/offer/auth/download-letter.php' },
    { label: 'Fake Apex Portal (.xyz)', url: 'https://careers-apexsolutions-portal.xyz/offer/confirm.php' },
    { label: 'Luxury Condo Wire Trap', url: 'https://luxury-condo-rentals-direct.top/listings/unit402.html' },
    { label: 'Official Google Careers', url: 'https://careers.google.com/jobs/results/901824' }
  ];

  return (
    <div id="extension-hub-view" className="space-y-6">
      {/* Extension Introduction & Download Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#1a273b] via-[#202124] to-[#192b20] border border-[#4285F4]/30 p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#4285F4]/15 text-[#8ab4f8] border border-[#4285F4]/30 mb-3">
              <Chrome className="w-3.5 h-3.5" />
              Manifest V3 Real-Time Browser Extension
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#e8eaed] tracking-tight">
              Real-Time URL Analysis & Anti-Phishing Extension
            </h2>
            <p className="text-xs sm:text-sm text-[#bdc1c6] mt-2 leading-relaxed">
              Equip Chrome, Brave, Edge, or Arc with real-time URL inspection. As you browse job boards, LinkedIn postings, or rental listings, the extension analyzes domain age, inspects typosquatting, identifies payment demand traps, and flags high-risk URLs before you enter credentials or transfer money.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              id="download-zip-btn"
              type="button"
              onClick={handleDownloadZip}
              disabled={downloadingZip}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-[#4285F4] hover:bg-[#1a73e8] active:scale-95 disabled:opacity-50 transition-all shadow-lg shadow-[#4285F4]/20"
            >
              {downloadingZip ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Packaging Zip Archive...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Extension (.zip)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Browser Extension Simulator */}
      <div className="rounded-2xl bg-[#202124]/90 border border-[#3c4043] p-5 md:p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-[#3c4043] mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#4285F4]/15 border border-[#4285F4]/30 text-[#8ab4f8]">
              <Play className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#e8eaed] uppercase tracking-wider">
                Live Interactive Browser Extension Simulator
              </h3>
              <p className="text-xs text-[#9aa0a6]">
                Experience how the extension evaluates web pages in real-time
              </p>
            </div>
          </div>

          {/* Quick Preset Buttons for URL Simulator */}
          <div className="hidden sm:flex items-center gap-1.5">
            {presetSimulatedUrls.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSimulatedUrl(preset.url);
                  runUrlInspection(preset.url);
                }}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                  simulatedUrl === preset.url
                    ? 'bg-[#4285F4]/20 text-[#8ab4f8] border-[#4285F4]/40 font-bold'
                    : 'bg-[#18191c] text-[#9aa0a6] border-[#3c4043] hover:bg-[#303134] hover:text-[#e8eaed]'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mock Browser Frame */}
        <div className="rounded-xl border border-[#3c4043] bg-[#18191c] overflow-hidden shadow-2xl">
          {/* Browser Chrome Header (Tabs + Controls) */}
          <div className="bg-[#202124] px-3 py-2 border-b border-[#3c4043] flex items-center justify-between gap-3">
            {/* Window Controls (Google theme dots: Red, Yellow, Green) */}
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#EA4335]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FBBC04]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#34A853]" />
            </div>

            {/* Address Omnibar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                runUrlInspection(simulatedUrl);
              }}
              className="flex-1 max-w-2xl flex items-center bg-[#18191c] border border-[#3c4043] rounded-lg px-3 py-1.5 text-xs text-[#e8eaed] font-mono focus-within:border-[#4285F4]"
            >
              <Globe className="w-3.5 h-3.5 text-[#9aa0a6] mr-2 shrink-0" />
              <input
                type="text"
                value={simulatedUrl}
                onChange={(e) => setSimulatedUrl(e.target.value)}
                placeholder="Enter URL to test extension inspection..."
                className="w-full bg-transparent text-[#e8eaed] text-xs focus:outline-none"
              />
              <button
                type="submit"
                disabled={isScanning}
                className="text-xs text-[#8ab4f8] hover:text-[#4285F4] ml-2"
                title="Refresh inspection"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              </button>
            </form>

            {/* Extension Toolbar Action Badge */}
            <div className="flex items-center gap-2">
              <div className="relative group cursor-pointer">
                <div className="p-1.5 rounded-md bg-[#303134] hover:bg-[#3c4043] text-[#e8eaed] border border-[#3c4043] flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4 text-[#8ab4f8]" />
                  {inspectionResult && (
                    <span
                      className={`text-[10px] font-black px-1 rounded ${
                        inspectionResult.threatScore >= 60
                          ? 'bg-[#EA4335] text-white'
                          : inspectionResult.threatScore >= 30
                          ? 'bg-[#FBBC04] text-black'
                          : 'bg-[#34A853] text-white'
                      }`}
                    >
                      {inspectionResult.threatScore}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Browser Viewport with Active Inspection HUD */}
          <div className="p-6 bg-gradient-to-b from-[#18191c] to-[#202124] min-h-[340px] flex items-center justify-center">
            {/* Simulated Extension Popup Box */}
            <div className="w-full max-w-sm rounded-xl bg-[#202124] border border-[#3c4043] p-4 shadow-2xl space-y-4">
              {/* Extension Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#3c4043]">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-[#4285F4]/20 border border-[#4285F4]/30 flex items-center justify-center text-[#8ab4f8]">
                    <ShieldAlert className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-[#e8eaed]">Offer & Phishing Inspector</span>
                </div>
                <span
                  className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    inspectionResult?.riskTier === 'CRITICAL_SCAM'
                      ? 'bg-[#EA4335]/20 text-[#f28b82] border border-[#EA4335]/30'
                      : inspectionResult?.riskTier === 'HIGH_RISK'
                      ? 'bg-[#EA4335]/20 text-[#f28b82] border border-[#EA4335]/30'
                      : inspectionResult?.riskTier === 'MODERATE_RISK'
                      ? 'bg-[#FBBC04]/20 text-[#fdd663] border border-[#FBBC04]/30'
                      : 'bg-[#34A853]/20 text-[#81c995] border border-[#34A853]/30'
                  }`}
                >
                  {inspectionResult?.riskTier || 'SCANNING...'}
                </span>
              </div>

              {/* URL Box */}
              <div className="p-2 rounded-lg bg-[#18191c] border border-[#3c4043] text-[11px] font-mono text-[#9aa0a6] break-all">
                {simulatedUrl}
              </div>

              {/* Threat Score Big Display */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#18191c] border border-[#3c4043]">
                <div>
                  <div
                    className={`text-3xl font-black font-mono leading-none ${
                      (inspectionResult?.threatScore || 0) >= 60
                        ? 'text-[#f28b82]'
                        : (inspectionResult?.threatScore || 0) >= 30
                        ? 'text-[#fdd663]'
                        : 'text-[#81c995]'
                    }`}
                  >
                    {inspectionResult ? `${inspectionResult.threatScore}%` : '--'}
                  </div>
                  <div className="text-[10px] text-[#9aa0a6] uppercase font-semibold mt-1">
                    Scam Threat Index
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-[#e8eaed]">
                    {inspectionResult?.riskTier === 'CRITICAL_SCAM' ? 'DANGER: PHISHING' : inspectionResult?.riskTier === 'SAFE' ? 'VERIFIED SECURE' : 'CAUTION ADVISED'}
                  </div>
                  <div className="text-[10px] text-[#9aa0a6] mt-0.5">
                    Domain: {inspectionResult?.domain || '--'}
                  </div>
                </div>
              </div>

              {/* Domain Age & Quick Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-[#18191c] border border-[#3c4043]">
                  <div className="text-[10px] text-[#9aa0a6] uppercase">Domain Age</div>
                  <div className={`font-mono font-bold mt-0.5 ${(inspectionResult?.domainAgeDays || 0) < 60 ? 'text-[#f28b82]' : 'text-[#81c995]'}`}>
                    {inspectionResult?.ageDescription || '--'}
                  </div>
                </div>
                <div className="p-2 rounded bg-[#18191c] border border-[#3c4043]">
                  <div className="text-[10px] text-[#9aa0a6] uppercase">Status</div>
                  <div className="font-bold text-[#e8eaed] mt-0.5">
                    {inspectionResult?.isNewlyRegistered ? 'Newly Registered' : 'Established'}
                  </div>
                </div>
              </div>

              {/* Flags List */}
              {inspectionResult && inspectionResult.flags.length > 0 && (
                <div className="space-y-1">
                  {inspectionResult.flags.map((flag, idx) => (
                    <div
                      key={idx}
                      className="p-1.5 rounded text-[11px] bg-[#EA4335]/15 border border-[#EA4335]/30 text-[#f28b82] flex items-start gap-1.5"
                    >
                      <AlertTriangle className="w-3 h-3 text-[#EA4335] shrink-0 mt-0.5" />
                      <span>{flag}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Safety Advice */}
              {inspectionResult && inspectionResult.safetyTips.length > 0 && (
                <div className="text-[11px] text-[#bdc1c6] leading-relaxed bg-[#18191c] p-2 rounded border border-[#3c4043]">
                  <span className="font-bold text-[#8ab4f8]">Safety Tip: </span>
                  {inspectionResult.safetyTips[0]}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Installation Instructions & Code Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step-by-Step Installation Guide (Decorated with Google's 4 colors) */}
        <div className="rounded-2xl bg-[#202124]/90 border border-[#3c4043] p-5 md:p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-[#e8eaed] uppercase tracking-wider flex items-center gap-2">
            <Chrome className="w-4 h-4 text-[#4285F4]" />
            How to Install the Extension in Your Browser
          </h3>

          <div className="space-y-3 text-xs text-[#bdc1c6]">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#18191c] border border-[#3c4043]">
              <span className="w-5 h-5 rounded-full bg-[#4285F4]/20 text-[#8ab4f8] font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <div>
                <span className="font-bold text-[#e8eaed] block mb-0.5">Download and Unpack Zip</span>
                Click the &ldquo;Download Extension (.zip)&rdquo; button above and extract the zip archive to any folder on your computer.
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#18191c] border border-[#3c4043]">
              <span className="w-5 h-5 rounded-full bg-[#EA4335]/20 text-[#f28b82] font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <div>
                <span className="font-bold text-[#e8eaed] block mb-0.5">Open Browser Extensions Page</span>
                Open Chrome, Brave, Edge, or Arc and type in the address bar:
                <div className="mt-1 font-mono bg-[#303134] px-2 py-1 rounded text-[#8ab4f8]">
                  chrome://extensions
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#18191c] border border-[#3c4043]">
              <span className="w-5 h-5 rounded-full bg-[#FBBC04]/20 text-[#fdd663] font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <div>
                <span className="font-bold text-[#e8eaed] block mb-0.5">Toggle Developer Mode</span>
                Enable the <span className="font-semibold text-[#e8eaed]">&ldquo;Developer mode&rdquo;</span> switch in the top-right corner.
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#18191c] border border-[#3c4043]">
              <span className="w-5 h-5 rounded-full bg-[#34A853]/20 text-[#81c995] font-bold flex items-center justify-center shrink-0">
                4
              </span>
              <div>
                <span className="font-bold text-[#e8eaed] block mb-0.5">Load Unpacked</span>
                Click the <span className="font-semibold text-[#e8eaed]">&ldquo;Load unpacked&rdquo;</span> button, select the extracted folder, and pin the inspector shield icon to your toolbar!
              </div>
            </div>
          </div>
        </div>

        {/* Source Code Viewer */}
        <div className="rounded-2xl bg-[#202124]/90 border border-[#3c4043] p-5 md:p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-[#3c4043] mb-3">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-[#8ab4f8]" />
              <h3 className="text-sm font-bold text-[#e8eaed] uppercase tracking-wider">
                Extension Source Files (Manifest V3)
              </h3>
            </div>

            <button
              type="button"
              onClick={copyCurrentFileCode}
              className="text-xs text-[#9aa0a6] hover:text-[#e8eaed] flex items-center gap-1"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-[#81c995]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* File Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 text-xs">
            {(['manifest.json', 'popup.html', 'popup.js', 'background.js', 'content.js'] as const).map((filename) => (
              <button
                key={filename}
                type="button"
                onClick={() => setActiveTabCode(filename)}
                className={`px-2.5 py-1 rounded-md font-mono transition-all ${
                  activeTabCode === filename
                    ? 'bg-[#303134] text-[#8ab4f8] font-bold border border-[#4285F4]/40'
                    : 'text-[#9aa0a6] hover:text-[#e8eaed]'
                }`}
              >
                {filename}
              </button>
            ))}
          </div>

          {/* Code Text Area */}
          <div className="flex-1 bg-[#18191c] p-3 rounded-xl border border-[#3c4043] font-mono text-[11px] text-[#bdc1c6] overflow-y-auto max-h-72 leading-relaxed whitespace-pre">
            {extensionFiles[activeTabCode] || '// Loading code...'}
          </div>
        </div>
      </div>
    </div>
  );
};
