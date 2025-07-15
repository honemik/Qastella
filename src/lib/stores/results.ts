import { writable, get } from 'svelte/store';
import type { Question } from './questions';
import { invoke } from '@tauri-apps/api/core';
import { dataDir } from './settings';

export interface AnswerRecord {
  question: Question;
  answer: string | string[];
  correct: boolean;
}

export interface ExamResult {
  records: AnswerRecord[];
  elapsed: number;
}

export const lastResult = writable<ExamResult | null>(null);
export const attemptCount = writable(0);
export const correctTotal = writable(0);

export interface HistoryEntry {
  timestamp: string;
  result: ExamResult;
}

export const history = writable<HistoryEntry[]>([]);

export async function loadHistory() {
  const dir = get(dataDir);
  const data = await invoke('load_history', { dir });
  history.set((data as HistoryEntry[]) ?? []);
}

export async function saveHistory() {
  const dir = get(dataDir);
  const list = get(history);
  await invoke('save_history', { dir, history: list });
}

export function addResultToHistory(res: ExamResult) {
  history.update((list) => [...list, { timestamp: new Date().toISOString(), result: res }]);
  saveHistory();
}


