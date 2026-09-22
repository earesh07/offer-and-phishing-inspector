export interface SampleCase {
  id: string;
  title: string;
  category: 'Job Offer' | 'Rental Lease' | 'URL Phishing' | 'Legitimate Offer';
  badge: string;
  badgeColor: string;
  url: string;
  senderEmail: string;
  text: string;
}

export const SAMPLE_CASES: SampleCase[] = [
  {
    id: 'equipment-check-scam',
    title: 'Remote Data Entry Equipment Check Trap',
    category: 'Job Offer',
    badge: 'Equipment Check Phishing',
    badgeColor: 'bg-[#EA4335]/15 text-[#f28b82] border-[#EA4335]/30',
    url: 'https://careers-apexsolutions-portal.xyz/offer/confirm.php?ref=4921',
    senderEmail: 'hr-recruiting.apex@gmail.com',
    text: `CONFIDENTIAL APPOINTMENT OFFER LETTER
Apex Global Cloud Solutions LLC
Date: September 18, 2026

Dear Candidate,

Following your successful text-based interview conducted via Telegram chat with our Senior Hiring Coordinator, we are thrilled to formally offer you the remote position of Senior Data Entry & Administrative Specialist.

Compensation & Working Hours:
- Pay Rate: $85.00 per hour, paid bi-weekly via direct deposit
- Schedule: Flexible remote hours (20-30 hours per week)
- Benefits: Full comprehensive medical, dental, 401(k), and home equipment stipend

Mandatory Home Office Setup & Equipment Check:
To ensure compliance with Apex security protocols, you must acquire the following enterprise setup:
1. Apple MacBook Pro M3 (16GB RAM)
2. High-speed encrypted laser scanner and biometric badge reader
3. Enterprise Data Entry Cryptographic Portal Software License ($450)

You will NOT pay for this out of pocket. Our finance department has issued and mailed you a cashier's check of $4,850.00 to cover these expenses. Once you receive and deposit the check into your bank account, you must immediately purchase equipment from our accredited vendor via Zelle or wire transfer, and wire back the remaining balance within 24 hours.

Kindly confirm your acceptance by signing below and reverting today.

Sincerely,
Dr. Robert Vance, Head of Global Talent
Apex Solutions LLC`
  },
  {
    id: 'rental-deposit-trap',
    title: 'Apartment Sight-Unseen Deposit Trap',
    category: 'Rental Lease',
    badge: 'Rental Wire Trap',
    badgeColor: 'bg-[#FBBC04]/15 text-[#fdd663] border-[#FBBC04]/30',
    url: 'https://luxury-condo-rentals-direct.top/listings/unit402.html',
    senderEmail: 'reverend.johnson.properties@yahoo.com',
    text: `Subject: Urgent - Beautiful 2-Bedroom Luxury Condo (Sight-Unseen Holding Deposit)

Hello,

Thank you for your interest in our fully furnished 2-bedroom, 2-bathroom luxury downtown apartment located at 742 Evergreen Terrace. The monthly rent is only $1,100 including all utilities, high-speed fiber internet, and two designated parking spaces.

I am the lawful owner of the property. I am currently out of the country on a 2-year missionary trip in South America with my family, so I am unable to meet you in person for an in-person physical tour. I had bad experiences in the past where prospective tenants scheduled tours and never showed up.

Therefore, the keys will be couriered via FedEx express delivery along with the signed lease agreement as soon as you secure the property. To reserve the apartment and take down the listing, you must wire a holding deposit of $1,100 (first month rent plus security deposit) via CashApp or Bitcoin before viewing. Once payment is confirmed, the lockbox code and keys will be released immediately.

Kindly send your photo ID and transfer confirmation so we can proceed with dispatching the keys.

Blessings,
Rev. Thomas Johnson, Owner & Landlord`
  },
  {
    id: 'typosquat-phishing-url',
    title: 'Stripe Lookalike Phishing Portal',
    category: 'URL Phishing',
    badge: 'Brand Typosquatting',
    badgeColor: 'bg-[#4285F4]/15 text-[#8ab4f8] border-[#4285F4]/30',
    url: 'https://careers-stripe-verify.com/offer/auth/download-letter.php?id=98712',
    senderEmail: 'careers-verification@stripe-recruitment-team.net',
    text: `STRIPE TALENT ACQUISITION - CANDIDATE ONBOARDING PORTAL

Congratulations on being selected for the Systems Reliability Specialist role at Stripe Inc. 

Due to elevated cybersecurity protocols, all prospective new hires must log into our external verification portal at https://careers-stripe-verify.com to authorize their identity verification.

Please note: A one-time refundable background check screening fee of $75.00 is required through our authorized payment partner link using cryptocurrency or credit card. Your interview was conducted on Telegram with HR ID #STRIPE-9021. Respond within 12 hours or your offer will be revoked.`
  },
  {
    id: 'legitimate-offer',
    title: 'Legitimate Enterprise Tech Offer',
    category: 'Legitimate Offer',
    badge: 'Verified Authentic Baseline',
    badgeColor: 'bg-[#34A853]/15 text-[#81c995] border-[#34A853]/30',
    url: 'https://careers.google.com/jobs/results/901824-software-engineer/',
    senderEmail: 'recruiting-team@google.com',
    text: `Google LLC
1600 Amphitheatre Parkway, Mountain View, CA 94043
Official Offer of Employment

Dear Alex,

On behalf of Google LLC, we are pleased to offer you the position of Software Engineer III (L4) on the Cloud Infrastructure Team, reporting to the Engineering Director.

Summary of Terms:
- Base Salary: $168,000 per annum, paid bi-weekly according to standard payroll schedule
- Annual Bonus Target: 15% based on personal and company performance metrics
- Equity: $120,000 in Restricted Stock Units (RSUs) vesting over 4 years
- Start Date: November 9, 2026
- Location: Sunnyvale, CA (Hybrid: 3 days in office / 2 days remote)

Equipment and Technology Provisioning:
Google will directly provide your enterprise-managed laptop (Pixelbook Go or MacBook Pro), monitors, and developer workstation. Hardware will be shipped directly from Google corporate logistics at zero expense to you. You will never be asked to purchase company equipment or wire funds to any third-party supplier.

Onboarding documents and background check authorizations will be completed securely through Google's internal Workday portal (workday.google.com). Please review the formal electronic agreement via DocuSign by October 5, 2026.

Welcome to Google!

Sincerely,
Global People Operations
Google LLC`
  }
];
