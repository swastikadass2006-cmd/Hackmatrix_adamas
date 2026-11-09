export interface RecentInvestigation {
  id: string;
  targetUrl: string;
  classification: string;
  timestamp: string;
}

const STORAGE_KEY = 'trustlens_recent_investigations';

export function getRecentInvestigations(): RecentInvestigation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRecentInvestigation(item: Omit<RecentInvestigation, 'timestamp'>) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getRecentInvestigations();
    const updated = [
      { ...item, timestamp: new Date().toISOString() },
      ...existing.filter((i) => i.targetUrl !== item.targetUrl),
    ].slice(0, 8); // Keep latest 8
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('trustlens_investigations_updated'));
  } catch {
    // Graceful fallback
  }
}

