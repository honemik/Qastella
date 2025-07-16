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

export const questions = writable<Question[]>([]);

export async function saveQuestionBank() {
  const list = get(questions);
  const dir = get(dataDir);
  await invoke('save_questions', { dir, questions: list });
}

export async function loadQuestionBank() {
  const dir = get(dataDir);
  const data = await invoke('load_questions', { dir });
  questions.set((data as Question[]) ?? []);
}

