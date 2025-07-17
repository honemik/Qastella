import { writable } from 'svelte/store';
import { invoke } from '@tauri-apps/api/core';

// Directory used for reading and writing data files
export const dataDir = writable('');
// Dark mode toggle
export const darkMode = writable(false);

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
  const savedDir = typeof localStorage !== 'undefined' ? localStorage.getItem('dataDir') : null;
  dataDir.set(savedDir || dir);
  dataDir.subscribe((v) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('dataDir', v);
    }
  });

  if (typeof localStorage !== 'undefined') {
    const dark = localStorage.getItem('darkMode') === '1';
    darkMode.set(dark);
  }
}
