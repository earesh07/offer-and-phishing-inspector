import { PaymentRedFlag, HighlightSegment } from '../src/types.js';

interface FlagRule {
  id: string;
  category: PaymentRedFlag['category'];
  severity: PaymentRedFlag['severity'];
  title: string;
  explanation: string;
  regexPatterns: RegExp[];
}

const RED_FLAG_RULES: FlagRule[] = [
  {
    id: 'equipment-check-overpayment',
    category: 'equipment_check',
    severity: 'critical',
    title: 'Equipment Check / Advance Check Trap',
    explanation: 'Scammers issue counterfeit or stolen checks, instructing victims to deposit the check and buy equipment from a "certified vendor" before the bank bounces the check (Federal Trade Commission Warning).',
    regexPatterns: [
      /(?:send|issued?|mail(?:ed)?|provide)\s+(?:you\s+)?(?:a\s+)?(?:check|cheque|cashier'?s\s+check)\s+(?:of|for|worth)\s+[\$£€]?\d+/i,
      /(?:purchase|order|buy)\s+(?:your\s+)?(?:home\s+office\s+)?(?:equipment|materials|macbook|laptop|software)\s+from\s+(?:our|an?)\s+(?:approved|accredited|authorized|vendor|supplier)/i,
      /(?:deposit|clear)\s+(?:the\s+)?check\s+and\s+(?:forward|wire|transfer|send)\s+(?:the\s+)?(?:remaining|balance|rest)/i,
      /check\s+for\s+home\s+office\s+setup/i,
      /(?:e-check|mobile\s+deposit\s+photo|front\s+and\s+back\s+picture\s+of\s+check)/i
    ]
  },
  {
    id: 'deposit-before-viewing',
    category: 'deposit_before_tour',
    severity: 'critical',
    title: 'Rental Deposit Trap (Sight-Unseen)',
    explanation: 'Landlord impostors claim they cannot meet in person (e.g. missionary trip, abroad, illness) and demand holding deposits, first month rent, or security funds before an in-person physical tour.',
    regexPatterns: [
      /(?:cannot|unable\s+to|can'?t)\s+meet\s+(?:you\s+)?(?:in\s+person|personally|face\s+to\s+face)/i,
      /(?:out\s+of\s+(?:the\s+)?country|missionary\s+trip|transferred\s+abroad|in\s+the\s+uk|in\s+spain|currently\s+traveling)/i,
      /(?:keys?\s+(?:will\s+be|are)\s+(?:couriered|shipped|mailed|sent)\s+(?:via|by)\s+(?:fedex|dhl|ups|courier))/i,
      /(?:wire|send|transfer)\s+(?:a\s+)?(?:holding|security|reservation)\s+deposit\s+before\s+(?:viewing|inspecting|tour)/i,
      /lockbox\s+code\s+will\s+be\s+sent\s+after\s+payment/i
    ]
  },
  {
    id: 'irreversible-payment-method',
    category: 'wire_crypto',
    severity: 'critical',
    title: 'Irreversible Payment Channel Demand',
    explanation: 'Legitimate employers and verified leasing agents never ask for onboarding, equipment, or deposits through Zelle, CashApp, Bitcoin, or Western Union.',
    regexPatterns: [
      /(?:zelle|cash\s*app|venmo|bitcoin|btc|usdt|crypto|cryptocurrency|western\s+union|moneygram)/i,
      /(?:pay|send|wire)\s+funds?\s+via\s+(?:zelle|cashapp|crypto)/i,
      /(?:apple\s+gift\s+card|steam\s+card|google\s+play\s+card|target\s+gift\s+card)/i
    ]
  },
  {
    id: 'advance-fee-onboarding',
    category: 'advance_fee',
    severity: 'high',
    title: 'Pay-to-Work / Background Check Fee',
    explanation: 'Authentic employers pay for candidate background checks, drug screening, and onboarding software. Requesting candidate payment upfront is a major violation.',
    regexPatterns: [
      /(?:pay|reimburse|purchase)\s+(?:for\s+)?(?:your\s+)?(?:background\s+check|screening\s+fee|credit\s+report\s+link|police\s+clearance)/i,
      /(?:licensing|license|software|training)\s+(?:kit|materials?|fee)\s+(?:of|costs?)\s+[\$£€]?\d+/i,
      /application\s+(?:processing\s+)?fee\s+(?:is\s+required|must\s+be\s+paid)/i
    ]
  },
  {
    id: 'chat-only-interview',
    category: 'suspicious_compensation',
    severity: 'high',
    title: 'Text-Only / Anonymous Chat Interview',
    explanation: 'Conducting an entire hiring process solely via Telegram, WhatsApp, or Signal without a live face-to-face video or phone interview is the #1 vector for employment phishing.',
    regexPatterns: [
      /(?:download|connect\s+on|contact\s+via|add\s+on)\s+telegram/i,
      /(?:interview\s+(?:will\s+be|conducted)\s+(?:via|on)\s+telegram)/i,
      /(?:whatsapp|signal|wire\s+app)\s+(?:interview|questionnaire|hr\s+chat)/i,
      /(?:text-only|text\s+based)\s+interview/i
    ]
  },
  {
    id: 'inflated-compensation-ratio',
    category: 'suspicious_compensation',
    severity: 'medium',
    title: 'Disproportionate Salary-to-Skill Ratio',
    explanation: 'Unusually high pay (e.g. $65–$120/hour) for entry-level tasks like "Data Entry", "Virtual Assistant", or "Envelope Typing" is deliberately crafted to bypass critical skepticism.',
    regexPatterns: [
      /(?:data\s+entry|typing|virtual\s+assistant|clerical)\s*[:\-–]?\s*[\$£€]?(?:[6-9]\d|1\d\d)\s*(?:\/|\s*per\s*)hr/i,
      /(?:earn|pay\s+rate\s+is)\s+[\$£€]?(?:[6-9]\d|1\d\d)\s*(?:\/|\s*per\s*)hour/i,
      /no\s+experience\s+(?:required|needed).{1,50}[\$£€]?(?:[6-9]\d|1\d\d)\s*(?:\/|\s*per\s*)hr/i
    ]
  }
];

export function detectPaymentRedFlags(text: string): { flags: PaymentRedFlag[]; highlights: HighlightSegment[] } {
  const flags: PaymentRedFlag[] = [];
  const foundSpans: { start: number; end: number; rule: FlagRule; snippet: string }[] = [];

  for (const rule of RED_FLAG_RULES) {
    for (const pattern of rule.regexPatterns) {
      // Global match or exec
      const regex = new RegExp(pattern.source, 'gi');
      let match: RegExpExecArray | null;
      while ((match = regex.exec(text)) !== null) {
        const start = match.index;
        const end = match.index + match[0].length;
        const snippet = match[0];

        // Check if overlapping already captured span
        const overlaps = foundSpans.some(s => (start >= s.start && start < s.end) || (end > s.start && end <= s.end));
        if (!overlaps) {
          foundSpans.push({ start, end, rule, snippet });
          
          if (!flags.some(f => f.id === rule.id)) {
            flags.push({
              id: `${rule.id}-${flags.length}`,
              category: rule.category,
              severity: rule.severity,
              title: rule.title,
              snippet: snippet.length > 90 ? snippet.substring(0, 90) + '...' : snippet,
              explanation: rule.explanation
            });
          }
        }
      }
    }
  }

  // Sort spans by start index
  foundSpans.sort((a, b) => a.start - b.start);

  // Build highlight segments
  const highlights: HighlightSegment[] = [];
  let currentIndex = 0;

  for (const span of foundSpans) {
    if (span.start > currentIndex) {
      highlights.push({
        text: text.substring(currentIndex, span.start),
        isFlagged: false
      });
    }
    highlights.push({
      text: text.substring(span.start, span.end),
      isFlagged: true,
      flagId: span.rule.id,
      severity: span.rule.severity,
      category: span.rule.category
    });
    currentIndex = span.end;
  }

  if (currentIndex < text.length) {
    highlights.push({
      text: text.substring(currentIndex),
      isFlagged: false
    });
  }

  return { flags, highlights };
}
