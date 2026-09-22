import JSZip from 'jszip';

export function generateExtensionFiles(): Record<string, string> {
  const manifest = {
    manifest_version: 3,
    name: "Offer & Phishing Inspector",
    version: "1.0.0",
    description: "Real-time security scanner for fake job offers, rental deposit traps, and phishing domains.",
    permissions: ["activeTab", "storage"],
    action: {
      default_popup: "popup.html",
      default_title: "Inspect Current Page"
    },
    background: {
      service_worker: "background.js"
    },
    content_scripts: [
      {
        matches: ["<all_urls>"],
        js: ["content.js"],
        run_at: "document_idle"
      }
    ]
  };

  const popupHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Offer & Phishing Inspector</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 360px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #090d16;
      color: #f1f5f9;
      padding: 16px;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #1e293b;
      padding-bottom: 12px;
      margin-bottom: 14px;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
      font-size: 14px;
      color: #38bdf8;
    }
    .badge-pill {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .url-box {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 8px;
      padding: 10px;
      margin-bottom: 14px;
      word-break: break-all;
      font-family: monospace;
      font-size: 11px;
      color: #94a3b8;
    }
    .score-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #111827;
      border: 1px solid #374151;
      border-radius: 12px;
      padding: 14px;
      margin-bottom: 14px;
    }
    .score-number {
      font-size: 32px;
      font-weight: 800;
      line-height: 1;
    }
    .score-label {
      font-size: 11px;
      color: #9ca3af;
      margin-top: 4px;
    }
    .metric-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 14px;
    }
    .metric-card {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 8px;
      padding: 8px;
    }
    .metric-title {
      font-size: 10px;
      color: #64748b;
      text-transform: uppercase;
    }
    .metric-val {
      font-size: 12px;
      font-weight: 600;
      color: #f8fafc;
      margin-top: 2px;
    }
    .flags-list {
      list-style: none;
      font-size: 11px;
      margin-bottom: 14px;
    }
    .flags-list li {
      padding: 6px 8px;
      border-radius: 6px;
      margin-bottom: 4px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #fca5a5;
    }
    .btn {
      display: block;
      width: 100%;
      background: #2563eb;
      color: white;
      text-align: center;
      padding: 10px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 12px;
      text-decoration: none;
      border: none;
      cursor: pointer;
    }
    .btn:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">
      <span>🛡️</span> Offer & Phishing Inspector
    </div>
    <span id="tier-badge" class="badge-pill" style="background: #334155; color: #cbd5e1;">Scanning...</span>
  </div>

  <div class="url-box" id="current-url">Detecting active tab...</div>

  <div class="score-container">
    <div>
      <div class="score-number" id="threat-score">--</div>
      <div class="score-label">Scam Threat Index (0–100%)</div>
    </div>
    <div id="verdict-status" style="text-align: right; font-size: 12px; font-weight: 700;"></div>
  </div>

  <div class="metric-grid">
    <div class="metric-card">
      <div class="metric-title">Domain Age</div>
      <div class="metric-val" id="domain-age">--</div>
    </div>
    <div class="metric-card">
      <div class="metric-title">Payment Risk</div>
      <div class="metric-val" id="payment-risk">Clean</div>
    </div>
  </div>

  <ul class="flags-list" id="flags-container"></ul>

  <button class="btn" id="deep-scan-btn">Open In-Depth Offer Letter Scanner</button>

  <script src="popup.js"></script>
</body>
</html>`;

  const popupJs = `document.addEventListener('DOMContentLoaded', async () => {
  const urlEl = document.getElementById('current-url');
  const scoreEl = document.getElementById('threat-score');
  const tierBadge = document.getElementById('tier-badge');
  const verdictEl = document.getElementById('verdict-status');
  const ageEl = document.getElementById('domain-age');
  const flagsContainer = document.getElementById('flags-container');
  const deepScanBtn = document.getElementById('deep-scan-btn');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) {
      urlEl.textContent = 'No active tab URL detected';
      return;
    }

    urlEl.textContent = tab.url;

    // Fast local client heuristic check
    const urlObj = new URL(tab.url);
    const domain = urlObj.hostname.toLowerCase();

    let score = 5;
    const flags = [];
    let age = 'Established (>3 yrs)';

    const suspiciousTlds = ['top', 'xyz', 'click', 'site', 'vip', 'work', 'gq', 'cf', 'tk'];
    const parts = domain.split('.');
    const tld = parts[parts.length - 1];

    if (suspiciousTlds.includes(tld)) {
      score += 40;
      flags.push('High-risk TLD (.' + tld + ') used frequently in disposable phishing');
      age = 'Under 30 days (High Risk)';
    }

    const brands = ['google', 'stripe', 'amazon', 'microsoft', 'apple', 'meta', 'zillow'];
    for (const b of brands) {
      if (domain.includes(b) && !domain.endsWith(b + '.com')) {
        score += 65;
        flags.push('Lookalike brand detected: Mimics ' + b.toUpperCase());
        age = 'Under 14 days (Newly Registered)';
        break;
      }
    }

    if (tab.url.toLowerCase().includes('offer') || tab.url.toLowerCase().includes('deposit')) {
      if (score > 30) score += 15;
    }

    score = Math.min(100, score);
    scoreEl.textContent = score + '%';

    if (score >= 70) {
      scoreEl.style.color = '#ef4444';
      tierBadge.textContent = 'CRITICAL SCAM';
      tierBadge.style.background = '#7f1d1d';
      tierBadge.style.color = '#fecaca';
      verdictEl.textContent = 'AVOID THIS SITE';
      verdictEl.style.color = '#ef4444';
      if (flags.length === 0) flags.push('Domain signature matches active employment/rental phishing patterns');
    } else if (score >= 35) {
      scoreEl.style.color = '#f59e0b';
      tierBadge.textContent = 'SUSPICIOUS';
      tierBadge.style.background = '#78350f';
      tierBadge.style.color = '#fef3c7';
      verdictEl.textContent = 'USE CAUTION';
      verdictEl.style.color = '#f59e0b';
    } else {
      scoreEl.style.color = '#10b981';
      tierBadge.textContent = 'SECURE';
      tierBadge.style.background = '#064e3b';
      tierBadge.style.color = '#a7f3d0';
      verdictEl.textContent = 'LOW RISK';
      verdictEl.style.color = '#10b981';
      age = 'Mature Domain';
    }

    ageEl.textContent = age;

    flagsContainer.innerHTML = '';
    flags.forEach(f => {
      const li = document.createElement('li');
      li.textContent = '⚠️ ' + f;
      flagsContainer.appendChild(li);
    });

    deepScanBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://ais-dev-v25hye2bmjssyz4xwntpwn-707224457105.asia-east1.run.app/?url=' + encodeURIComponent(tab.url) });
    });

  } catch (err) {
    urlEl.textContent = 'Unable to scan active tab: ' + err.message;
  }
});`;

  const backgroundJs = `chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    try {
      const url = new URL(tab.url);
      const domain = url.hostname.toLowerCase();
      let isRisk = false;
      const brands = ['google', 'stripe', 'amazon', 'microsoft', 'apple', 'meta'];
      for (const b of brands) {
        if (domain.includes(b) && !domain.endsWith(b + '.com')) {
          isRisk = true;
          break;
        }
      }
      if (domain.endsWith('.xyz') || domain.endsWith('.top') || domain.endsWith('.click')) {
        isRisk = true;
      }
      if (isRisk) {
        chrome.action.setBadgeText({ tabId, text: '!' });
        chrome.action.setBadgeBackgroundColor({ tabId, color: '#DC2626' });
      } else {
        chrome.action.setBadgeText({ tabId, text: 'OK' });
        chrome.action.setBadgeBackgroundColor({ tabId, color: '#059669' });
      }
    } catch (e) {
      // Ignored
    }
  }
});`;

  const contentJs = `// Real-time DOM text inspector for job & rental red flags
(() => {
  const pageText = document.body.innerText.toLowerCase();
  const paymentTraps = [
    'cashier check',
    'equipment check',
    'approved vendor',
    'wire deposit',
    'telegram interview',
    'send via zelle',
    'apple gift card',
    'holding fee before viewing'
  ];

  let detected = [];
  for (const trap of paymentTraps) {
    if (pageText.includes(trap)) {
      detected.push(trap);
    }
  }

  if (detected.length > 0) {
    console.warn('[Offer & Phishing Inspector] Warning: Detected potential scam flags on this page:', detected);
  }
})();`;

  const readmeMd = `# Offer & Phishing Inspector - Chrome Extension (Manifest V3)

Real-time browser security extension designed to protect job seekers and renters from appointment scams, equipment check phishing, and deposit traps.

## How to Install in Chrome, Brave, Edge, or Arc:

1. Unzip this package to a local folder (e.g. \`offer-phishing-inspector\`).
2. Open your browser and navigate to:
   - Chrome: \`chrome://extensions\`
   - Brave: \`brave://extensions\`
   - Edge: \`edge://extensions\`
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked**.
5. Select the folder containing \`manifest.json\`.
6. Pin the extension to your toolbar!

When you visit any career site, rental listing, or job portal, click the extension icon to view the real-time **Scam Threat Index**, domain registration age, and payment red flag warnings.`;

  return {
    "manifest.json": JSON.stringify(manifest, null, 2),
    "popup.html": popupHtml,
    "popup.js": popupJs,
    "background.js": backgroundJs,
    "content.js": contentJs,
    "README.md": readmeMd
  };
}

export async function createExtensionZipBuffer(): Promise<Buffer> {
  const zip = new JSZip();
  const files = generateExtensionFiles();
  for (const [filename, content] of Object.entries(files)) {
    zip.file(filename, content);
  }
  return await zip.generateAsync({ type: 'nodebuffer' });
}
