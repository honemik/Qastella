import { writable } from 'svelte/store';
import { invoke } from '@tauri-apps/api/core';

export const dataDir = writable('');

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
