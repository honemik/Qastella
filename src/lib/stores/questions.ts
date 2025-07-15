import { writable } from 'svelte/store';

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
