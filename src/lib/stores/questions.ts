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
  let bank = (await invoke('load_questions', { dir })) as QuestionBank;
  if (!bank || Object.keys(bank.subjects).length === 0) {
    bank = (await invoke('sample_questions')) as QuestionBank;
  }
  const list = flattenBank(bank);
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

