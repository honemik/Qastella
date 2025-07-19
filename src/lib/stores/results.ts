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

/**
 * Read the exam history from disk using the configured data directory.
 */
export async function loadHistory() {
  const dir = get(dataDir) || null;
  console.debug('Loading history from', dir ?? '(default)');
  const data = await invoke('load_history', { dir });
  const list = (data as TimedExamResult[]) ?? [];
  console.debug('Loaded', list.length, 'history entries');
  history.set(list);
}

/**
 * Save the current history list to disk.
 */
export async function saveHistory() {
  const dir = get(dataDir) || null;
  const list = get(history);
  console.debug('Saving history to', dir ?? '(default)');
  await invoke('save_history', { dir, history: list });
  console.debug('History saved:', list.length, 'entries');
}

/**
 * Append a result to the history store and persist the change.
 */
export async function addResultToHistory(res: ExamResult) {
  history.update((list) => [
    ...list,
    { ...res, timestamp: new Date().toISOString() }
  ]);
  console.debug('Added result to history. Saving...');
  await saveHistory();
}

/**
 * Remove a history entry by index and persist the change.
 */
export async function deleteHistoryItem(index: number) {
  history.update((list) => {
    const copy = [...list];
    copy.splice(index, 1);
    return copy;
  });
  await saveHistory();
}


