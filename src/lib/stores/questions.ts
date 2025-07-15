import { writable, get } from 'svelte/store';
import { invoke } from '@tauri-apps/api/core';

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
  await invoke('save_questions', { questions: list });
}
