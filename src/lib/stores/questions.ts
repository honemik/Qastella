import { writable, get } from 'svelte/store';
import { invoke } from '@tauri-apps/api/core';
import { dataDir } from './settings';

export interface Question {
  id: number;
  type: 'single' | 'multiple' | 'short';
  question: string;
  options?: Record<string, string>;
  answer: string | string[];
  /** Optional data URLs representing images for this question */
  images?: string[];
  source?: string;
  subject?: string;
}

export interface QuestionBank {
  subjects: Record<string, Record<string, Omit<Question, 'subject' | 'source'>[]>>;
}

/**
 * Basic runtime validation for a loaded question bank. Ensures the structure
 * matches {@link QuestionBank} well enough to be processed safely.
 */
export function isValidQuestionBank(data: unknown): data is QuestionBank {
  if (!data || typeof data !== 'object') return false;
  const bank = data as Record<string, unknown>;
  if (typeof bank.subjects !== 'object' || bank.subjects === null) return false;
  for (const srcMap of Object.values(bank.subjects as Record<string, unknown>)) {
    if (typeof srcMap !== 'object' || srcMap === null) return false;
    for (const list of Object.values(srcMap as Record<string, unknown>)) {
      if (!Array.isArray(list)) return false;
      for (const q of list) {
        if (!q || typeof q !== 'object') return false;
        const qu = q as Record<string, unknown>;
        if (
          qu.id !== undefined &&
          typeof qu.id !== 'number'
        )
          return false;
        if (typeof qu.question !== 'string') return false;
        if (
          qu.options !== undefined &&
          (typeof qu.options !== 'object' || Array.isArray(qu.options))
        )
          return false;
        if (
          qu.type !== undefined &&
          qu.type !== 'single' &&
          qu.type !== 'multiple' &&
          qu.type !== 'short'
        )
          return false;
        if (
          typeof qu.answer !== 'string' &&
          !Array.isArray(qu.answer)
        )
          return false;
        if (qu.images !== undefined && !Array.isArray(qu.images)) return false;
      }
    }
  }
  return true;
}

// A reactive list containing all loaded questions
export const questions = writable<Question[]>([]);

/**
 * Convert a flat list of questions into the nested
 * {@link QuestionBank} structure grouped by subject and source.
 */
export function toBank(list: Question[]): QuestionBank {
  const bank: QuestionBank = { subjects: {} };
  for (const q of list) {
    const subj = q.subject ?? '';
    const src = q.source ?? '';
    if (!bank.subjects[subj]) bank.subjects[subj] = {};
    if (!bank.subjects[subj][src]) bank.subjects[subj][src] = [];
    const { subject: _s, source: _src, ...rest } = q;
    bank.subjects[subj][src].push(rest);
  }
  return bank;
}

/**
 * Flatten a {@link QuestionBank} back into a list of questions.
 */
export function flattenBank(bank: QuestionBank): Question[] {
  const out: Question[] = [];
  for (const [subject, srcMap] of Object.entries(bank.subjects)) {
    for (const [source, qs] of Object.entries(srcMap)) {
      for (const q of qs) {
        out.push({
          ...q,
          subject: subject || undefined,
          source: source || undefined
        });
      }
    }
  }
  return out;
}

/**
 * Persist the question bank to disk using the Tauri backend.
 */
export async function saveQuestionBank() {
  const list = get(questions);
  const dir = get(dataDir) || null;
  console.debug('Saving question bank to', dir ?? '(default)');
  const bank = toBank(list);
  await invoke('save_questions', { dir, bank });
}

/**
 * Load the question bank from disk. If no questions are present
 * a built in sample bank is loaded instead.
 */
export async function loadQuestionBank() {
  const dir = get(dataDir) || null;
  console.debug('Loading question bank from', dir ?? '(default)');
  let bank = (await invoke('load_questions', { dir })) as unknown;
  if (!isValidQuestionBank(bank) || Object.keys(bank.subjects).length === 0) {
    bank = (await invoke('sample_questions')) as QuestionBank;
  }
  const list = flattenBank(bank as QuestionBank);
  console.debug('Loaded', list.length, 'questions');
  questions.set(list);
}

/**
 * Convenience helper to get the current questions in bank form.
 */
export function getQuestionBank() {
  return toBank(get(questions));
}

/**
 * Reset the question list to an empty state and persist the change.
 */
export async function resetQuestionBank() {
  questions.set([]);
  await saveQuestionBank();
}

/**
 * Automatically persist question changes to disk with a short debounce.
 * This helps prevent data loss if the user navigates away without manually
 * saving after edits or deletions.
 */
if (typeof window !== 'undefined') {
  let initial = true;
  let saveTimer: ReturnType<typeof setTimeout> | null = null;
  questions.subscribe(() => {
    if (initial) {
      initial = false;
      return;
    }
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveQuestionBank();
      saveTimer = null;
    }, 300);
  });
}

