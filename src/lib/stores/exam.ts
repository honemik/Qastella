import { writable } from 'svelte/store';
import type { Question } from './questions';

export const examQuestions = writable<Question[]>([]);

