import { writable } from 'svelte/store';
import { invoke } from '@tauri-apps/api/core';

// Directory used for reading and writing data files
export const dataDir = writable('');

/**
 * Initialise the data directory setting. The default path is provided by the
 * backend and the value is persisted via localStorage.
 */
export async function initSettings() {
  const dir = (await invoke('default_data_dir')) as string;
  const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('dataDir') : null;
  dataDir.set(saved || dir);
  dataDir.subscribe((v) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('dataDir', v);
    }
  });
}
