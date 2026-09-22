import { getGeminiClient } from './gemini.js';
import { inspectDomain } from './domainHeuristics.js';
import { detectPaymentRedFlags } from './paymentRedFlags.js';
import { calculateScamThreatIndex } from './threatCalculator.js';
import { ForensicScanResult, UrlInspectionResult } from '../src/types.js';

// Resilient Gemini query with transient error retry and secondary model fallback
async function queryGeminiForensics(
  ai: ReturnType<typeof getGeminiClient>,
  prompt: string,
  systemInstruction: string
): Promise<string | null> {
  if (!ai) return null;

  // Primary model is gemini-3.8-flash, with gemini-3.6-flash as high-availability fallback
  const candidateModels = ['gemini-3.8-flash', 'gemini-3.6-flash'];

  for (const model of candidateModels) {
    // Up to 2 attempts per model for transient 503 high-demand or 429 rate limit spikes
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.1,
            systemInstruction,
          },
        });

        const responseText = response.text?.trim();
        if (responseText) {
          return responseText;
        }
      } catch (err: any) {
        const errMsg = String(err?.message || err);
        const isTransient =
          errMsg.includes('503') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('high demand') ||
          errMsg.includes('429') ||
          errMsg.includes('RESOURCE_EXHAUSTED');

        if (isTransient && attempt === 1) {
          // Brief pause before retry attempt
          await new Promise((resolve) => setTimeout(resolve, 400));
          continue;
        }
        // Try next candidate model
        break;
      }
    }
  }

  return null;
}

export async function runForensicScan(text: string, rawUrl?: string, senderEmail?: string): Promise<ForensicScanResult> {
  const targetDomainInput = rawUrl || senderEmail || '';
  const domainAnalysis = inspectDomain(targetDomainInput, text);
  const { flags: paymentFlags, highlights } = detectPaymentRedFlags(text);
  const heuristicThreat = calculateScamThreatIndex(domainAnalysis, paymentFlags, text, rawUrl);

  const timestamp = new Date().toISOString();
  let aiAnalysisUsed = false;
  let finalThreat = heuristicThreat;
  let claimedEntity = {
    companyOrLandlord: 'Unspecified Entity',
    jobTitleOrListing: 'Position / Property',
    offeredRateOrRent: 'Not specified',
    interviewChannel: 'Email / Document'
  };

  // Baseline heuristic entity extraction (always active to guarantee parsed entity metadata)
  const companyMatch = text.match(/(?:at|for|with|company:?)\s+([A-Z][A-Za-z0-9\s&,.-]{2,30}?)(?:\s+Inc|\s+LLC|\s+Corp|\s+Ltd|\.|\n|,)/i);
  const rateMatch = text.match(/[\$£€]\s*[\d,]+(?:\.\d\d)?(?:\s*(?:\/|\s*per\s*)(?:hr|hour|yr|year|month|mo|week))?/i);
  const titleMatch = text.match(/(?:position|role|title|for\s+the\s+role\s+of)\s*[:–-]?\s*([A-Z][A-Za-z\s]{3,35})/i);

  if (companyMatch) claimedEntity.companyOrLandlord = companyMatch[1].trim();
  if (rateMatch) claimedEntity.offeredRateOrRent = rateMatch[0].trim();
  if (titleMatch) claimedEntity.jobTitleOrListing = titleMatch[1].trim();
  if (/telegram/i.test(text)) claimedEntity.interviewChannel = 'Telegram Chat';
  else if (/whatsapp/i.test(text)) claimedEntity.interviewChannel = 'WhatsApp';
  else if (/zoom|google meet|teams/i.test(text)) claimedEntity.interviewChannel = 'Video Conference (Zoom/Meet)';

  // Attempt Gemini API forensic enhancement
  const ai = getGeminiClient();
  if (ai && text.trim().length > 30) {
    try {
      const prompt = `You are an elite cybercrime and employment/rental fraud forensic investigator.
Analyze this job offer letter, rental agreement, or communication for scam indicators:
---
${text.substring(0, 4000)}
---
Domain / URL context: ${rawUrl || 'None provided'}
Sender Email: ${senderEmail || 'None provided'}

Provide a strict JSON response matching this schema:
{
  "companyOrLandlord": "string (name of claimed entity or Unknown)",
  "jobTitleOrListing": "string (job title or property listing title)",
  "offeredRateOrRent": "string (e.g. $85/hr or $1,200/mo)",
  "interviewChannel": "string (e.g. Telegram, Google Meet, In-Person, Email Only)",
  "scamLikelihoodScore": "number between 0 and 100",
  "aiForensicVerdict": "string (one sentence verdict)",
  "criticalFindings": ["string", "string"],
  "countermeasures": ["string", "string"]
}`;

      const rawJson = await queryGeminiForensics(
        ai,
        prompt,
        'You are an authoritative cybersecurity forensic auditor for FTC and anti-phishing defense. Output only valid JSON.'
      );

      if (rawJson) {
        // Sanitize any markdown code fence wrappers
        const cleanedJson = rawJson.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
        const parsed = JSON.parse(cleanedJson);
        aiAnalysisUsed = true;
        
        claimedEntity = {
          companyOrLandlord: parsed.companyOrLandlord || claimedEntity.companyOrLandlord,
          jobTitleOrListing: parsed.jobTitleOrListing || claimedEntity.jobTitleOrListing,
          offeredRateOrRent: parsed.offeredRateOrRent || claimedEntity.offeredRateOrRent,
          interviewChannel: parsed.interviewChannel || claimedEntity.interviewChannel
        };

        if (Array.isArray(parsed.criticalFindings)) {
          for (const finding of parsed.criticalFindings) {
            if (!finalThreat.criticalRedFlags.includes(finding) && !finalThreat.warningFlags.includes(finding)) {
              if (parsed.scamLikelihoodScore > 60) {
                finalThreat.criticalRedFlags.push(finding);
              } else {
                finalThreat.warningFlags.push(finding);
              }
            }
          }
        }

        if (parsed.aiForensicVerdict && finalThreat.tier !== 'SAFE') {
          finalThreat.summary = `${parsed.aiForensicVerdict} ${finalThreat.summary}`;
        }

        if (typeof parsed.scamLikelihoodScore === 'number') {
          // Blend AI score with heuristic mathematical engine (60% heuristic, 40% AI)
          const blended = Math.round(finalThreat.score * 0.6 + parsed.scamLikelihoodScore * 0.4);
          finalThreat.score = Math.min(100, Math.max(0, blended));
          // Recalculate tier based on blended score
          if (finalThreat.score >= 85) finalThreat.tier = 'CRITICAL_SCAM';
          else if (finalThreat.score >= 60) finalThreat.tier = 'HIGH_RISK';
          else if (finalThreat.score >= 30) finalThreat.tier = 'MODERATE_RISK';
          else if (finalThreat.score >= 15) finalThreat.tier = 'LOW_RISK';
          else finalThreat.tier = 'SAFE';
        }
      }
    } catch {
      // Gracefully fall back to deterministic heuristic calculations without throwing
    }
  }

  return {
    threatIndex: finalThreat,
    domainAnalysis,
    paymentFlags,
    highlightSegments: highlights,
    claimedEntity,
    aiAnalysisUsed,
    scanTimestamp: timestamp
  };
}

export function inspectUrlDirectly(rawUrl: string): UrlInspectionResult {
  const domainAnalysis = inspectDomain(rawUrl);
  const flags: string[] = [];
  const safetyTips: string[] = [];
  let threatScore = 0;

  if (domainAnalysis.isLookalikeBrand) {
    threatScore += 90;
    flags.push(`Lookalike brand phishing: Domain mimics ${domainAnalysis.detectedBrand?.toUpperCase()}`);
    safetyTips.push(`Navigate to the official ${domainAnalysis.detectedBrand}.com website directly by typing it in your address bar.`);
  }

  if (domainAnalysis.isSuspiciousTld) {
    threatScore += 30;
    flags.push(`High-abuse TLD ('.${domainAnalysis.domain.split('.').pop()}') commonly used by disposable scam campaigns.`);
  }

  if (domainAnalysis.isNewlyRegistered) {
    threatScore += 45;
    flags.push(`Newly registered domain (${domainAnalysis.ageDays} days old). Low reputation.`);
    safetyTips.push('Avoid submitting personal information, SSNs, or payment credentials on domains under 90 days old.');
  } else {
    safetyTips.push('Domain registration tenure is mature and established.');
  }

  // Check path for phishing triggers
  const lowerUrl = rawUrl.toLowerCase();
  if (lowerUrl.includes('offer') || lowerUrl.includes('job') || lowerUrl.includes('career')) {
    if (threatScore > 40) {
      threatScore += 10;
      flags.push('URL mimics an employment or career page on untrusted domain.');
    }
  }
  if (lowerUrl.includes('deposit') || lowerUrl.includes('wire') || lowerUrl.includes('payment') || lowerUrl.includes('checkout')) {
    if (threatScore > 30) {
      threatScore += 15;
      flags.push('Payment or deposit link detected on non-standard financial host.');
    }
  }

  threatScore = Math.min(100, Math.max(0, threatScore));

  let riskTier: UrlInspectionResult['riskTier'] = 'SAFE';
  if (threatScore >= 80) riskTier = 'CRITICAL_SCAM';
  else if (threatScore >= 55) riskTier = 'HIGH_RISK';
  else if (threatScore >= 30) riskTier = 'MODERATE_RISK';
  else if (threatScore >= 15) riskTier = 'LOW_RISK';

  if (safetyTips.length === 0) {
    safetyTips.push('Always confirm lock icon SSL certificate matches the entity you intended to visit.');
  }

  return {
    url: rawUrl,
    domain: domainAnalysis.domain,
    threatScore,
    riskTier,
    domainAgeDays: domainAnalysis.ageDays,
    ageDescription: domainAnalysis.ageFormatted,
    isNewlyRegistered: domainAnalysis.isNewlyRegistered,
    flags,
    safetyTips,
    timestamp: new Date().toISOString()
  };
}
