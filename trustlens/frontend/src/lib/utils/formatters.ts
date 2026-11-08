import { Severity, TrustGrade, Verdict } from '../types/scan';

export function truncateHash(hash?: string, lead = 8, trail = 8): string {
  if (!hash) return 'N/A';
  if (hash.length <= lead + trail) return hash;
  return `${hash.slice(0, lead)}...${hash.slice(-trail)}`;
}

export function truncateUrl(url: string, maxLength = 45): string {
  if (!url) return '';
  if (url.length <= maxLength) return url;
  return `${url.slice(0, maxLength)}...`;
}

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(d);
  } catch {
    return isoString;
  }
}

export function formatRelativeTime(isoString: string): string {
  try {
    const ms = Date.now() - new Date(isoString).getTime();
    const sec = Math.floor(ms / 1000);
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hrs = Math.floor(min / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  } catch {
    return isoString;
  }
}

export function getGradeFromScore(score: number): TrustGrade {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 50) return 'C';
  if (score >= 30) return 'D';
  return 'F';
}

export function getVerdictFromScore(score: number): Verdict {
  if (score >= 75) return 'safe';
  if (score >= 40) return 'suspicious';
  return 'malicious';
}

export function getSeverityColor(sev: Severity): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (sev) {
    case 'critical':
      return {
        bg: 'bg-tl-rose/10',
        text: 'text-tl-rose',
        border: 'border-tl-rose/30',
        dot: 'bg-tl-rose',
      };
    case 'high':
      return {
        bg: 'bg-tl-orange/10',
        text: 'text-tl-orange',
        border: 'border-tl-orange/30',
        dot: 'bg-tl-orange',
      };
    case 'medium':
      return {
        bg: 'bg-tl-amber/10',
        text: 'text-tl-amber',
        border: 'border-tl-amber/30',
        dot: 'bg-tl-amber',
      };
    case 'low':
    default:
      return {
        bg: 'bg-tl-emerald/10',
        text: 'text-tl-emerald',
        border: 'border-tl-emerald/30',
        dot: 'bg-tl-emerald',
      };
  }
}

export function getScoreColor(score: number): {
  text: string;
  stroke: string;
  bgGlow: string;
  badgeBg: string;
} {
  if (score >= 80) {
    return {
      text: 'text-tl-emerald',
      stroke: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.15)',
      badgeBg: 'bg-tl-emerald/10 border-tl-emerald/30 text-tl-emerald',
    };
  }
  if (score >= 50) {
    return {
      text: 'text-tl-amber',
      stroke: '#f59e0b',
      bgGlow: 'rgba(245, 158, 11, 0.15)',
      badgeBg: 'bg-tl-amber/10 border-tl-amber/30 text-tl-amber',
    };
  }
  return {
    text: 'text-tl-rose',
    stroke: '#f43f5e',
    bgGlow: 'rgba(244, 63, 94, 0.2)',
    badgeBg: 'bg-tl-rose/10 border-tl-rose/30 text-tl-rose',
  };
}

