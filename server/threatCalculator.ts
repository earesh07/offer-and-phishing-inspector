import { DomainInspection } from './domainHeuristics.js';
import { PaymentRedFlag } from '../src/types.js';
import { ScamThreatIndex } from '../src/types.js';

export function calculateScamThreatIndex(
  domainAnalysis: DomainInspection,
  paymentFlags: PaymentRedFlag[],
  fullText: string,
  rawUrl?: string
): ScamThreatIndex {
  let domainScore = 0;
  let paymentScore = 0;
  let communicationScore = 0;
  let contractAnomaliesScore = 0;

  const passedChecks: string[] = [];
  const warningFlags: string[] = [];
  const criticalRedFlags: string[] = [];
  const recommendations: string[] = [];

  // --- 1. Domain & Infrastructure (Weight: 30%) ---
  if (domainAnalysis.isLookalikeBrand) {
    domainScore += 95;
    criticalRedFlags.push(`Deceptive typosquatting/lookalike domain '${domainAnalysis.domain}' impersonating ${domainAnalysis.detectedBrand?.toUpperCase() || 'a trusted brand'}`);
  } else if (domainAnalysis.isNewlyRegistered && domainAnalysis.isSuspiciousTld) {
    domainScore += 90;
    criticalRedFlags.push(`Freshly minted domain under ${domainAnalysis.ageDays} days on high-risk cybercrime TLD ('.${domainAnalysis.domain.split('.').pop()}')`);
  } else if (domainAnalysis.isNewlyRegistered) {
    domainScore += 70;
    warningFlags.push(`Domain is only ${domainAnalysis.ageDays} days old (legitimate corporate portals generally possess years of registration tenure)`);
  } else if (domainAnalysis.ageDays > 1000) {
    passedChecks.push(`Domain has mature registration tenure (${domainAnalysis.ageFormatted})`);
  }

  if (domainAnalysis.freeEmailWarning) {
    domainScore = Math.max(domainScore, 65);
    warningFlags.push(`Recruiter or landlord communicates through free public email (@${domainAnalysis.domain}) instead of authenticated corporate email infrastructure.`);
  } else if (!domainAnalysis.freeEmailWarning && domainAnalysis.ageDays > 500) {
    passedChecks.push('Corporate custom email domain verified');
  }

  // --- 2. Payment & Equipment Demand (Weight: 35%) ---
  const criticalPaymentFlags = paymentFlags.filter(f => f.severity === 'critical');
  const highPaymentFlags = paymentFlags.filter(f => f.severity === 'high');
  const mediumPaymentFlags = paymentFlags.filter(f => f.severity === 'medium');

  if (criticalPaymentFlags.length > 0) {
    paymentScore = Math.min(100, 75 + criticalPaymentFlags.length * 15);
    criticalPaymentFlags.forEach(f => criticalRedFlags.push(f.title + ': ' + f.explanation));
  } else if (highPaymentFlags.length > 0) {
    paymentScore = Math.min(80, 50 + highPaymentFlags.length * 15);
    highPaymentFlags.forEach(f => warningFlags.push(f.title + ': ' + f.explanation));
  } else if (mediumPaymentFlags.length > 0) {
    paymentScore = 30;
    mediumPaymentFlags.forEach(f => warningFlags.push(f.title + ': ' + f.explanation));
  } else {
    passedChecks.push('No advance equipment purchase, wire transfer, or holding deposit demands detected');
  }

  // --- 3. Communication Channel Integrity (Weight: 20%) ---
  const lower = fullText.toLowerCase();
  const hasTelegram = lower.includes('telegram');
  const hasWhatsApp = lower.includes('whatsapp');
  const hasSignal = lower.includes('signal') && !lower.includes('traffic signal');
  const hasTextInterview = lower.includes('text interview') || lower.includes('text-only interview') || lower.includes('questionnaire on chat');

  if (hasTelegram || hasWhatsApp || hasSignal || hasTextInterview) {
    communicationScore = 85;
    criticalRedFlags.push('Interview or onboarding conducted via unverified instant messaging (Telegram/WhatsApp/Signal) without live enterprise video or corporate office meeting.');
  } else {
    passedChecks.push('Standard interview and correspondence protocols observed (no anonymous Telegram/WhatsApp recruiting funnel)');
  }

  // --- 4. Contract, Urgency & Salary Anomalies (Weight: 15%) ---
  const hasUrgency = /immediate(?:ly)?\s+start|within\s+24\s+hours|limited\s+time\s+offer|respond\s+today|urgent/i.test(fullText);
  const hasPoorGrammar = /kindly\s+(?:confirm|revert|send|do\s+the\s+needful)/i.test(fullText);
  const hasCheckReimburse = /reimburse\s+you|forward\s+funds|deposit\s+check/i.test(fullText);

  if (hasUrgency) {
    contractAnomaliesScore += 35;
    warningFlags.push('Manufactured artificial urgency designed to pressure hasty compliance before scrutiny');
  }
  if (hasPoorGrammar) {
    contractAnomaliesScore += 25;
    warningFlags.push('Linguistic indicators typical of offshore phishing templates (e.g. repeated "kindly revert", unnatural syntax)');
  }
  if (hasCheckReimburse) {
    contractAnomaliesScore += 40;
  }
  contractAnomaliesScore = Math.min(100, contractAnomaliesScore);

  if (contractAnomaliesScore < 30) {
    passedChecks.push('Contract language and onboarding timetable adhere to standard corporate norms');
  }

  // --- Compute Weighted Overall Scam Threat Index (0–100%) ---
  const weightedScore = Math.round(
    domainScore * 0.30 +
    paymentScore * 0.35 +
    communicationScore * 0.20 +
    contractAnomaliesScore * 0.15
  );

  // If there are critical payment demands or brand typosquatting, floor the score at 75%
  let finalScore = weightedScore;
  if (criticalRedFlags.length >= 2) {
    finalScore = Math.max(finalScore, 85);
  } else if (criticalRedFlags.length === 1) {
    finalScore = Math.max(finalScore, 70);
  } else if (warningFlags.length === 0 && criticalRedFlags.length === 0) {
    finalScore = Math.min(finalScore, 18);
  }

  // Clamp 0 to 100
  finalScore = Math.min(100, Math.max(0, finalScore));

  // Determine Risk Tier
  let tier: ScamThreatIndex['tier'];
  let verdict: string;
  let summary: string;

  if (finalScore >= 85) {
    tier = 'CRITICAL_SCAM';
    verdict = 'EXTREME SCAM DANGER: FRAUDULENT PREDATORY SCHEME DETECTED';
    summary = 'This offer or listing exhibits confirmed criminal fraud signatures: counterfeit check/equipment traps, fake brand typosquatting, or untraceable payment demands. Cease all communication immediately.';
  } else if (finalScore >= 60) {
    tier = 'HIGH_RISK';
    verdict = 'HIGH RISK: SEVERAL SEVERE PHISHING SIGNALS IDENTIFIED';
    summary = 'Multiple elevated danger indicators were detected, such as unverified domain age, anonymous chat interviews, or upfront financial friction. Do not provide banking or ID details.';
  } else if (finalScore >= 30) {
    tier = 'MODERATE_RISK';
    verdict = 'MODERATE CAUTION: ANOMALIES REQUIRE INDEPENDENT VERIFICATION';
    summary = 'While no fatal scam traps were triggered, unverified email infrastructure or contract inconsistencies warrant independent verification via the employer’s official switchboard or portal.';
  } else if (finalScore >= 15) {
    tier = 'LOW_RISK';
    verdict = 'LOW RISK: MINOR OR NEGLIGIBLE INCONSISTENCIES';
    summary = 'Analysis reveals mostly standard indicators. Always maintain standard cybersecurity hygiene when clicking external links.';
  } else {
    tier = 'SAFE';
    verdict = 'VERIFIED SAFE / BENIGN PROFILE';
    summary = 'Domain exhibits established tenure, no payment demands were detected, and communication protocols align with standard corporate practices.';
  }

  // Safety Recommendations
  if (finalScore >= 60) {
    recommendations.push('NEVER cash or deposit a check sent by a prospective employer to purchase equipment.');
    recommendations.push('NEVER wire funds, send Zelle, or buy gift cards for "equipment vendors", "holding deposits", or "background checks".');
    recommendations.push('Independently search the company\'s official website (do not click links in the message) and check their official Careers portal.');
    recommendations.push('File a cyber fraud report with the FBI Internet Crime Complaint Center (IC3.gov) or the FTC (ReportFraud.ftc.gov).');
  } else if (finalScore >= 30) {
    recommendations.push('Call the company\'s primary corporate switchboard listed on LinkedIn or SEC filings to verify the recruiter exists.');
    recommendations.push('Request an official live enterprise video meeting (Zoom, Google Meet, Microsoft Teams) with HR before signing paperwork.');
  } else {
    recommendations.push('Standard safe practice: Always double-check that payroll direct deposit forms are submitted only through secure enterprise HR portals (Workday, ADP, BambooHR).');
  }

  return {
    score: finalScore,
    tier,
    verdict,
    summary,
    breakdown: {
      domainScore,
      paymentScore,
      communicationScore,
      contractAnomaliesScore
    },
    passedChecks,
    warningFlags,
    criticalRedFlags,
    recommendations
  };
}
