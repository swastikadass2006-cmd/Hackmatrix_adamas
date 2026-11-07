export interface BrandRecord {
  id: string;
  name: string;
  canonicalDomain: string;
  logo: string;
  industry: 'Banking & Financial' | 'Government & Identity' | 'Enterprise Tech' | 'E-Commerce';
  country: string;
  phishingPrevalence: 'Critical' | 'High' | 'Moderate';
}

export const WATCHED_BRANDS: BrandRecord[] = [
  {
    id: 'sbi',
    name: 'State Bank of India',
    canonicalDomain: 'onlinesbi.sbi',
    logo: '/brands/sbi.svg',
    industry: 'Banking & Financial',
    country: 'IN',
    phishingPrevalence: 'Critical',
  },
  {
    id: 'hdfc',
    name: 'HDFC Bank',
    canonicalDomain: 'netbanking.hdfcbank.com',
    logo: '/brands/hdfc.svg',
    industry: 'Banking & Financial',
    country: 'IN',
    phishingPrevalence: 'Critical',
  },
  {
    id: 'uidai',
    name: 'UIDAI (Aadhaar)',
    canonicalDomain: 'myaadhaar.uidai.gov.in',
    logo: '/brands/uidai.svg',
    industry: 'Government & Identity',
    country: 'IN',
    phishingPrevalence: 'Critical',
  },
  {
    id: 'icici',
    name: 'ICICI Bank',
    canonicalDomain: 'icicibank.com',
    logo: '/brands/icici.svg',
    industry: 'Banking & Financial',
    country: 'IN',
    phishingPrevalence: 'High',
  },
  {
    id: 'incometax',
    name: 'Income Tax Dept (e-Filing)',
    canonicalDomain: 'eportal.incometax.gov.in',
    logo: '/brands/incometax.svg',
    industry: 'Government & Identity',
    country: 'IN',
    phishingPrevalence: 'High',
  },
  {
    id: 'microsoft',
    name: 'Microsoft 365',
    canonicalDomain: 'login.microsoftonline.com',
    logo: '/brands/microsoft.svg',
    industry: 'Enterprise Tech',
    country: 'US',
    phishingPrevalence: 'Critical',
  },
  {
    id: 'google',
    name: 'Google Accounts',
    canonicalDomain: 'accounts.google.com',
    logo: '/brands/google.svg',
    industry: 'Enterprise Tech',
    country: 'US',
    phishingPrevalence: 'Critical',
  },
];

