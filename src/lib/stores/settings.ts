import { writable } from 'svelte/store';
import { invoke } from '@tauri-apps/api/core';

export const HISTORY_RETENTION_DEFAULT = 250;
export const HISTORY_RETENTION_MIN = 25;
export const HISTORY_RETENTION_MAX = 2000;
const HISTORY_RETENTION_KEY = 'historyRetention';

/** Clamp the retention value to a sensible range. */
export function clampHistoryRetention(value: number): number {
  if (!Number.isFinite(value)) return HISTORY_RETENTION_DEFAULT;
  if (value < HISTORY_RETENTION_MIN) return HISTORY_RETENTION_MIN;
  if (value > HISTORY_RETENTION_MAX) return HISTORY_RETENTION_MAX;
  return Math.floor(value);
}

// Directory used for reading and writing data files
export const dataDir = writable('');
// Dark mode toggle
export const darkMode = writable(false);
// Number of history entries to retain on disk
export const historyRetention = writable<number>(HISTORY_RETENTION_DEFAULT);

// Persist store values to localStorage and update document styles
darkMode.subscribe((v) => {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', v);
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('darkMode', v ? '1' : '0');
  }
});

/**
 * Initialise the data directory setting. The default path is provided by the
 * backend and the value is persisted via localStorage.
 */
export async function initSettings() {
  const dir = (await invoke('default_data_dir')) as string;
  console.debug('Default data dir', dir);
  const savedDir = typeof localStorage !== 'undefined' ? localStorage.getItem('dataDir') : null;
  dataDir.set(savedDir || dir);
  console.debug('Using data dir', savedDir || dir);
  dataDir.subscribe((v) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('dataDir', v);
    }
    console.debug('Data dir changed to', v);
  });

  if (typeof localStorage !== 'undefined') {
    const dark = localStorage.getItem('darkMode') === '1';
    darkMode.set(dark);
  }

  if (typeof localStorage !== 'undefined') {
    const storedRetention = localStorage.getItem(HISTORY_RETENTION_KEY);
    const parsed = storedRetention !== null ? Number.parseInt(storedRetention, 10) : NaN;
    const initial = clampHistoryRetention(Number.isNaN(parsed) ? HISTORY_RETENTION_DEFAULT : parsed);
    historyRetention.set(initial);
    historyRetention.subscribe((value) => {
      const clamped = clampHistoryRetention(value);
      if (value !== clamped) {
        historyRetention.set(clamped);
        return;
      }
      localStorage.setItem(HISTORY_RETENTION_KEY, String(clamped));
    });
  }
}
