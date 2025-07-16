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

export interface QuestionSet {
  source?: string;
  subject?: string;
  questions: Omit<Question, 'source' | 'subject'>[];
}

export const questions = writable<Question[]>([]);

function groupQuestions(list: Question[]): QuestionSet[] {
  const map = new Map<
    string | undefined,
    Map<string | undefined, Omit<Question, 'source' | 'subject'>[]>
  >();
  for (const q of list) {
    const subj = q.subject;
    const src = q.source;
    if (!map.has(subj)) {
      map.set(subj, new Map());
    }
    const srcMap = map.get(subj)!;
    if (!srcMap.has(src)) {
      srcMap.set(src, []);
    }
    const { source: _s, subject: _b, ...rest } = q;
    srcMap.get(src)!.push(rest);
  }
  const sets: QuestionSet[] = [];
  for (const [subject, srcMap] of map.entries()) {
    for (const [source, qs] of srcMap.entries()) {
      sets.push({ subject, source, questions: qs });
    }
  }
  return sets;
}

export function flattenQuestionSets(sets: QuestionSet[]): Question[] {
  return sets.flatMap((set) =>
    set.questions.map((q) => ({ ...q, source: set.source, subject: set.subject }))
  );
}

export async function saveQuestionBank() {
  const list = get(questions);
  const dir = get(dataDir);
  const questionSets = groupQuestions(list);
  await invoke('save_questions', { dir, question_sets: questionSets });
}

export async function loadQuestionBank() {
  const dir = get(dataDir);
  const data = await invoke('load_questions', { dir });
  const sets = (data as QuestionSet[]) ?? [];
  questions.set(flattenQuestionSets(sets));
}

export function getQuestionSets() {
  return groupQuestions(get(questions));
}

