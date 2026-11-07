'use client';

import { useState, useEffect } from 'react';
import { ThreatFeedEvent } from '../lib/types/threat';
import { MOCK_THREAT_FEED } from '../lib/mocks/feedData';

export function useThreatFeed() {
  const [feed, setFeed] = useState<ThreatFeedEvent[]>(MOCK_THREAT_FEED);
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);

  // Periodic simulated live event injection
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      const simulatedTargets = [
        {
          url: `https://secure-banking-alert-${Math.floor(Math.random() * 9000 + 1000)}.online/auth`,
          targetBrand: 'State Bank of India',
          threatType: 'credential_harvesting' as const,
          verdict: 'malicious' as const,
          trustScore: 3,
          asn: 'AS44050',
          ip: '194.135.33.220',
          originCountry: 'RU',
          tags: ['Live-Feed', 'SMS-Lure', 'Telegram-Bot'],
        },
        {
          url: `https://uidai-aadhaar-portal-service-${Math.floor(Math.random() * 900 + 100)}.in`,
          targetBrand: 'UIDAI (Aadhaar)',
          threatType: 'typosquat' as const,
          verdict: 'malicious' as const,
          trustScore: 8,
          asn: 'AS13335',
          ip: '104.21.90.14',
          originCountry: 'US',
          tags: ['Lookalike-Cert', 'crt.sh-Hit'],
        },
      ];

      const chosen = simulatedTargets[Math.floor(Math.random() * simulatedTargets.length)];
      const newEvent: ThreatFeedEvent = {
        id: `evt-live-${Date.now()}`,
        url: chosen.url,
        detectedAt: new Date().toISOString(),
        targetBrand: chosen.targetBrand,
        verdict: chosen.verdict,
        trustScore: chosen.trustScore,
        threatType: chosen.threatType,
        originCountry: chosen.originCountry,
        asn: chosen.asn,
        ip: chosen.ip,
        tags: chosen.tags,
      };

      setFeed((prev) => [newEvent, ...prev.slice(0, 24)]);
    }, 12000);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  const filteredFeed = feed.filter((item) => {
    if (filterBrand !== 'all' && item.targetBrand !== filterBrand) return false;
    if (filterSeverity !== 'all' && item.verdict !== filterSeverity) return false;
    return true;
  });

  const exportStix = () => {
    const stixBundle = {
      type: 'bundle',
      id: `bundle--${Date.now()}`,
      spec_version: '2.1',
      objects: filteredFeed.map((item) => ({
        type: 'indicator',
        spec_version: '2.1',
        id: `indicator--${item.id}`,
        created: item.detectedAt,
        name: `Malicious URL targeting ${item.targetBrand || 'Unknown'}`,
        description: `TrustLens flagged target with score ${item.trustScore}/100 [${item.threatType}]`,
        pattern: `[url:value = '${item.url}']`,
        pattern_type: 'stix',
        valid_from: item.detectedAt,
        confidence: 95,
      })),
    };

    const blob = new Blob([JSON.stringify(stixBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trustlens-stix-bundle-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    feed: filteredFeed,
    filterBrand,
    setFilterBrand,
    filterSeverity,
    setFilterSeverity,
    isLiveStreaming,
    setIsLiveStreaming,
    exportStix,
  };
}

