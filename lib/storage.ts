import { SavedAnalysis, TrackedAlert } from "@/lib/types";

const HISTORY_KEY = "exora-history-v2";
const ALERTS_KEY = "exora-alerts-v2";

function canUseStorage() {
  return typeof window !== "undefined";
}

export function loadHistory(): SavedAnalysis[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as SavedAnalysis[]) : [];
  } catch {
    return [];
  }
}

export function saveHistoryItem(item: SavedAnalysis) {
  if (!canUseStorage()) return;
  const current = loadHistory();
  const next = [item, ...current].slice(0, 20);
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

export function loadAlerts(): TrackedAlert[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(ALERTS_KEY);
    return raw ? (JSON.parse(raw) as TrackedAlert[]) : [];
  } catch {
    return [];
  }
}

export function saveAlert(alert: TrackedAlert) {
  if (!canUseStorage()) return;
  const current = loadAlerts();
  const next = [alert, ...current].slice(0, 20);
  window.localStorage.setItem(ALERTS_KEY, JSON.stringify(next));
}
