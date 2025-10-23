import { derived, writable, get } from 'svelte/store';
import type { Question } from './questions';
import { invoke } from '@tauri-apps/api/core';
import {
  clampHistoryRetention,
  dataDir,
  historyRetention,
  HISTORY_RETENTION_DEFAULT
} from './settings';

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

export interface LastAttemptSummary {
  timestamp: string;
  elapsed: number;
  correct: number;
  total: number;
  accuracy: number;
}

export interface HistoryStats {
  sessionCount: number;
  answeredCount: number;
  correctCount: number;
  accuracy: number;
  recentScores: number[];
  lastAttempt: LastAttemptSummary | null;
}

const RECENT_SCORE_WINDOW = 10;

function trimHistory(list: TimedExamResult[], limit: number) {
  if (list.length <= limit) return list;
  return list.slice(list.length - limit);
}

export const historyStats = derived(history, ($history): HistoryStats => {
  const sessionCount = $history.length;
  let answeredCount = 0;
  let correctCount = 0;
  const recentScores: number[] = [];
  let lastAttempt: LastAttemptSummary | null = null;
  const start = Math.max(0, sessionCount - RECENT_SCORE_WINDOW);

  for (let i = 0; i < sessionCount; i += 1) {
    const attempt = $history[i];
    const total = attempt.records.length;
    let correctForAttempt = 0;
    for (const record of attempt.records) {
      answeredCount += 1;
      if (record.correct) {
        correctCount += 1;
        correctForAttempt += 1;
      }
    }
    if (i >= start) {
      const denom = Math.max(total, 1);
      recentScores.push(Math.round((correctForAttempt / denom) * 100));
    }
    if (i === sessionCount - 1) {
      const denom = Math.max(total, 1);
      lastAttempt = {
        timestamp: attempt.timestamp,
        elapsed: attempt.elapsed,
        correct: correctForAttempt,
        total,
        accuracy: Math.round((correctForAttempt / denom) * 100)
      };
    }
  }

  const accuracy = answeredCount === 0 ? 0 : Math.round((correctCount / answeredCount) * 100);

  return {
    sessionCount,
    answeredCount,
    correctCount,
    accuracy,
    recentScores,
    lastAttempt
  } satisfies HistoryStats;
});

/**
 * Read the exam history from disk using the configured data directory.
 */
export async function loadHistory() {
  const dir = get(dataDir) || null;
  console.debug('Loading history from', dir ?? '(default)');
  const data = await invoke('load_history', { dir });
  const list = (data as TimedExamResult[]) ?? [];
  const limit = clampHistoryRetention(get(historyRetention) || HISTORY_RETENTION_DEFAULT);
  const trimmed = trimHistory(list, limit);
  console.debug('Loaded', list.length, 'history entries (retaining', trimmed.length, ')');
  history.set(trimmed);
  if (trimmed.length !== list.length) {
    console.debug('History list trimmed to respect retention limit of', limit);
    await saveHistory();
  }
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
export async function addResultToHistory(res: ExamResult): Promise<number> {
  let index = 0;
  history.update((list) => {
    const limit = clampHistoryRetention(get(historyRetention) || HISTORY_RETENTION_DEFAULT);
    const next = [...list, { ...res, timestamp: new Date().toISOString() }];
    const trimmed = trimHistory(next, limit);
    index = trimmed.length - 1;
    if (next.length !== trimmed.length) {
      console.debug('History exceeded limit of', limit, '- pruning oldest entries');
    }
    return trimmed;
  });
  console.debug('Added result to history. Saving...');
  await saveHistory();
  return index;
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

historyRetention.subscribe((value) => {
  const limit = clampHistoryRetention(value || HISTORY_RETENTION_DEFAULT);
  let trimmed = false;
  history.update((list) => {
    const next = trimHistory(list, limit);
    trimmed = trimmed || next.length !== list.length;
    return next;
  });
  if (trimmed) {
    console.debug('History trimmed after retention change to', limit);
    void saveHistory();
  }
});


