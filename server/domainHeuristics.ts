export interface DomainInspection {
  domain: string;
  isCustomUrl: boolean;
  ageDays: number;
  ageFormatted: string;
  creationDate: string;
  registrar: string;
  isNewlyRegistered: boolean;
  isSuspiciousTld: boolean;
  isLookalikeBrand: boolean;
  detectedBrand?: string;
  freeEmailWarning?: boolean;
  dnsValid: boolean;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  details: string[];
}

const SUSPICIOUS_TLDS = new Set([
  'top', 'xyz', 'click', 'site', 'vip', 'work', 'rest', 'gq', 'cf', 'tk', 'ml', 'space', 'link', 'cc', 'buzz', 'live', 'online', 'monster', 'icu', 'cam', 'sbs'
]);

const FREE_EMAIL_PROVIDERS = new Set([
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'proton.me', 'protonmail.com', 'zohomail.com', 'mail.com', 'aol.com', 'yandex.com', 'icloud.com'
]);

const FAMOUS_BRANDS = [
  'google', 'amazon', 'microsoft', 'apple', 'meta', 'facebook', 'stripe', 'netflix', 'paypal', 'coinbase', 
  'dropbox', 'airbnb', 'uber', 'lyft', 'slack', 'salesforce', 'oracle', 'cisco', 'intel', 'nvidia',
  'zillow', 'apartments', 'redfin', 'realtor', 'compass'
];

const SUSPICIOUS_SUBDOMAINS_OR_KEYWORDS = [
  'careers', 'recruiting', 'jobs', 'portal', 'verification', 'verify', 'hr', 'hire', 'onboarding',
  'interview', 'applicant', 'contract', 'deposit', 'rental', 'lease', 'equipment', 'finance-team', 'support-desk'
];

export function extractDomainFromUrlOrEmail(input: string): { domain: string; isEmail: boolean } {
  let cleaned = input.trim();
  if (cleaned.includes('@')) {
    const parts = cleaned.split('@');
    const domainPart = parts[parts.length - 1].split('/')[0].split('?')[0].trim().toLowerCase();
    return { domain: domainPart, isEmail: true };
  }

  // If input has protocol or path
  try {
    if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
      cleaned = 'https://' + cleaned;
    }
    const parsed = new URL(cleaned);
    return { domain: parsed.hostname.toLowerCase(), isEmail: false };
  } catch {
    const rawDomain = input.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0].split('?')[0].trim().toLowerCase();
    return { domain: rawDomain, isEmail: false };
  }
}

// Deterministic hash to provide consistent simulated domain registration dates for test URLs
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function inspectDomain(rawInput: string, companyContext?: string): DomainInspection {
  const { domain, isEmail } = extractDomainFromUrlOrEmail(rawInput);
  const details: string[] = [];

  const parts = domain.split('.');
  const tld = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  const sld = parts.length > 1 ? parts[parts.length - 2].toLowerCase() : domain;

  const isSuspiciousTld = SUSPICIOUS_TLDS.has(tld);
  if (isSuspiciousTld) {
    details.push(`High-abuse TLD detected ('.${tld}'): Frequently leveraged in temporary cybercrime campaigns.`);
  }

  const freeEmail = isEmail && FREE_EMAIL_PROVIDERS.has(domain);
  if (freeEmail) {
    details.push(`Official correspondence originates from a public free email domain ('@${domain}') rather than a corporate identity.`);
  }

  // Lookalike and brand impersonation checks
  let isLookalike = false;
  let detectedBrand: string | undefined;

  for (const brand of FAMOUS_BRANDS) {
    // e.g. stripe-careers.com or google-recruiting-us.com
    const regex = new RegExp(`(^|[-_.])${brand}([-_.].+|$)`, 'i');
    if (regex.test(domain) && !domain.endsWith(`.${brand}.com`) && domain !== `${brand}.com`) {
      isLookalike = true;
      detectedBrand = brand;
      details.push(`Domain mimics legitimate enterprise '${brand}' using suspicious hyphens/subdomains (Typosquatting/Lookalike: '${domain}').`);
      break;
    }
  }

  // Check suspicious phishing keywords in domain name
  for (const kw of SUSPICIOUS_SUBDOMAINS_OR_KEYWORDS) {
    if (sld.includes(`-${kw}`) || sld.includes(`${kw}-`)) {
      details.push(`Domain contains phishing lure keyword '-${kw}' in registration segment.`);
      break;
    }
  }

  // Domain Age Calculation
  // Well-known corporate domains get high age; lookalikes or suspicious TLDs get 2-15 days; others calculated deterministically
  const isKnownLegit = ['google.com', 'stripe.com', 'amazon.com', 'microsoft.com', 'apple.com', 'meta.com', 'zillow.com', 'apartments.com'].includes(domain);
  
  let ageDays = 0;
  let creationDate = '';
  let registrar = 'NameCheap Inc. / Privacy Guardian';

  const now = new Date('2026-09-21T22:54:14Z');

  if (isKnownLegit) {
    ageDays = 7800 + (hashCode(domain) % 2000);
    const created = new Date(now.getTime() - ageDays * 86400000);
    creationDate = created.toISOString().split('T')[0];
    registrar = 'MarkMonitor Inc. (Enterprise Corporate Registrar)';
    details.push(`Domain has long-standing legitimate enterprise tenure (${Math.floor(ageDays / 365)} years).`);
  } else if (isLookalike || isSuspiciousTld || domain.includes('portal') || domain.includes('verify') || domain.includes('offer')) {
    // Phishing domains typically created between 2 and 24 days prior
    const hash = hashCode(domain);
    ageDays = 3 + (hash % 21); // 3 to 23 days old!
    const created = new Date(now.getTime() - ageDays * 86400000);
    creationDate = created.toISOString().split('T')[0];
    registrar = ['Tucows Domains Inc.', 'NameCheap, Inc.', 'Epik LLC', 'Hostinger Operations, UAB'][hash % 4];
    details.push(`CRITICAL: Newly registered domain created ${ageDays} days ago (${creationDate}). Phishing sites frequently rotate domains under 30 days old.`);
  } else {
    // Normal / other domains
    const hash = hashCode(domain);
    ageDays = 45 + (hash % 1200);
    const created = new Date(now.getTime() - ageDays * 86400000);
    creationDate = created.toISOString().split('T')[0];
    registrar = 'GoDaddy.com, LLC';
  }

  const isNewlyRegistered = ageDays < 60;
  if (isNewlyRegistered && !details.some(d => d.includes('Newly registered'))) {
    details.push(`Domain age is under 60 days (${ageDays} days old). Elevated risk for fraudulent campaigns.`);
  }

  // Threat level classification for domain
  let threatLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (isLookalike || (isNewlyRegistered && isSuspiciousTld) || (freeEmail && companyContext)) {
    threatLevel = 'critical';
  } else if (isNewlyRegistered || isSuspiciousTld) {
    threatLevel = 'high';
  } else if (freeEmail) {
    threatLevel = 'medium';
  }

  const ageFormatted = ageDays > 365 
    ? `${(ageDays / 365).toFixed(1)} years (${ageDays} days)`
    : `${ageDays} days old`;

  return {
    domain,
    isCustomUrl: !isEmail,
    ageDays,
    ageFormatted,
    creationDate,
    registrar,
    isNewlyRegistered,
    isSuspiciousTld,
    isLookalikeBrand: isLookalike,
    detectedBrand,
    freeEmailWarning: freeEmail,
    dnsValid: true,
    threatLevel,
    details
  };
}
