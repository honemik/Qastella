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

export interface TimedExamResult extends ExamResult {
  timestamp: string;
}

export const history = writable<TimedExamResult[]>([]);

export async function loadHistory() {
  const dir = get(dataDir);
  const data = await invoke('load_history', { dir });
  history.set((data as TimedExamResult[]) ?? []);
}

export async function saveHistory() {
  const dir = get(dataDir);
  const list = get(history);
  await invoke('save_history', { dir, history: list });
}

export function addResultToHistory(res: ExamResult) {
  history.update((list) => [...list, { ...res, timestamp: new Date().toISOString() }]);
  saveHistory();
}


