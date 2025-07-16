import { writable, get } from 'svelte/store';
import { invoke } from '@tauri-apps/api/core';
import { dataDir } from './settings';

export interface Question {
  id: number;
  type: 'single' | 'multiple' | 'short';
  question: string;
  options?: Record<string, string>;
  answer: string | string[];
  source?: string;
  subject?: string;
}

export interface QuestionBank {
  subjects: Record<string, Record<string, Omit<Question, 'subject' | 'source'>[]>>;
}

export const questions = writable<Question[]>([]);

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

export function flattenBank(bank: QuestionBank): Question[] {
  const out: Question[] = [];
  for (const [subject, srcMap] of Object.entries(bank.subjects)) {
    for (const [source, qs] of Object.entries(srcMap)) {
      for (const q of qs) {
        out.push({ ...q, subject: subject || undefined, source: source || undefined });
      }
    }
  }
  return out;
}

export async function saveQuestionBank() {
  const list = get(questions);
  const dir = get(dataDir);
  const bank = toBank(list);
  await invoke('save_questions', { dir, bank });
}

export async function loadQuestionBank() {
  const dir = get(dataDir);
  const data = await invoke('load_questions', { dir });
  const bank = (data as QuestionBank) ?? { subjects: {} };
  questions.set(flattenBank(bank));
}

export function getQuestionBank() {
  return toBank(get(questions));
}

