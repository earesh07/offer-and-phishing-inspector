export interface DomainAnalysis {
  domain: string;
  isCustomUrl: boolean;
  ageDays: number;
  ageFormatted: string;
  creationDate: string;
  registrar: string;
  isNewlyRegistered: boolean; // < 60 days
  isSuspiciousTld: boolean;
  isLookalikeBrand: boolean;
  detectedBrand?: string;
  freeEmailWarning?: boolean;
  dnsValid: boolean;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  details: string[];
}

export interface PaymentRedFlag {
  id: string;
  category: 'equipment_check' | 'advance_fee' | 'wire_crypto' | 'gift_cards' | 'deposit_before_tour' | 'courier_fee' | 'third_party_vendor' | 'suspicious_compensation';
  severity: 'critical' | 'high' | 'medium' | 'warning';
  title: string;
  snippet: string;
  explanation: string;
}

export interface ScamThreatIndex {
  score: number; // 0 to 100
  tier: 'SAFE' | 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK' | 'CRITICAL_SCAM';
  verdict: string;
  summary: string;
  breakdown: {
    domainScore: number; // 0 - 100
    paymentScore: number; // 0 - 100
    communicationScore: number; // 0 - 100
    contractAnomaliesScore: number; // 0 - 100
  };
  passedChecks: string[];
  warningFlags: string[];
  criticalRedFlags: string[];
  recommendations: string[];
}

export interface HighlightSegment {
  text: string;
  isFlagged: boolean;
  flagId?: string;
  severity?: 'critical' | 'high' | 'medium' | 'warning';
  category?: string;
}

export interface ForensicScanResult {
  threatIndex: ScamThreatIndex;
  domainAnalysis: DomainAnalysis;
  paymentFlags: PaymentRedFlag[];
  highlightSegments: HighlightSegment[];
  claimedEntity?: {
    companyOrLandlord: string;
    jobTitleOrListing: string;
    offeredRateOrRent: string;
    interviewChannel: string;
  };
  aiAnalysisUsed: boolean;
  scanTimestamp: string;
}

export interface UrlInspectionResult {
  url: string;
  domain: string;
  threatScore: number;
  riskTier: 'SAFE' | 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK' | 'CRITICAL_SCAM';
  domainAgeDays: number;
  ageDescription: string;
  isNewlyRegistered: boolean;
  flags: string[];
  safetyTips: string[];
  timestamp: string;
}
