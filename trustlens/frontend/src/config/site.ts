export const siteConfig = {
  name: 'TrustLens',
  tagline: 'Explainable Cyber Threat Intelligence & Digital Trust Verification',
  description:
    'Real-time multi-signal analysis verifying X.509 certificate chains, detecting Fermat-factorable keys, flagging CCADB CA distrusts, and catching brand phishing clones.',
  version: '2.4.0-enterprise',
  navItems: [
    { label: 'Scanner', href: '/' },
    { label: 'Live Intel Feed', href: '/feed' },
    { label: 'Campaigns', href: '/campaigns' },
    { label: 'SOC Watchlist', href: '/org/watchlist' },
    { label: 'Methodology', href: '/about' },
    { label: 'API Reference', href: '/api-docs' },
  ],
  links: {
    github: 'https://github.com/trustlens-cyber/trustlens',
    docs: '/api-docs',
    status: 'https://status.trustlens.internal',
  },
};

