import { writable, derived, get } from 'svelte/store';
import { invoke } from '@tauri-apps/api/core';
import { dataDir } from './settings';
import { addToast } from './toast';

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
function isRecord(obj: unknown): obj is Record<string, unknown> {
  return typeof obj === 'object' && obj !== null;
}

function isValidQuestion(q: unknown): q is Omit<Question, 'subject' | 'source'> {
  if (!isRecord(q)) return false;
  if (q.id !== undefined && typeof q.id !== 'number') return false;
  if (typeof q.question !== 'string') return false;
  if (q.options !== undefined && (!isRecord(q.options) || Array.isArray(q.options))) return false;
  if (
    q.type !== undefined &&
    q.type !== 'single' &&
    q.type !== 'multiple' &&
    q.type !== 'short'
  )
    return false;
  if (typeof q.answer !== 'string' && !Array.isArray(q.answer)) return false;
  if (q.images !== undefined && !Array.isArray(q.images)) return false;
  return true;
}

function isValidQuestionList(list: unknown): list is Omit<Question, 'subject' | 'source'>[] {
  return Array.isArray(list) && list.every(isValidQuestion);
}

function isValidSourceMap(map: unknown): map is Record<string, Omit<Question, 'subject' | 'source'>[]> {
  return isRecord(map) && Object.values(map).every(isValidQuestionList);
}

export function isValidQuestionBank(data: unknown): data is QuestionBank {
  if (!isRecord(data)) return false;
  const subj = (data as Record<string, unknown>).subjects;
  if (!isRecord(subj)) return false;
  return Object.values(subj as Record<string, unknown>).every(isValidSourceMap);
}

// A reactive list containing all loaded questions
export const questions = writable<Question[]>([]);
export const subjectsSet = writable(new Set<string>());
export const sourcesSet = writable(new Set<string>());
export const subjects = derived(subjectsSet, (s) => Array.from(s));
export const sources = derived(sourcesSet, (s) => Array.from(s));
questions.subscribe((qs) => {
  const subj = new Set<string>();
  const src = new Set<string>();
  for (const q of qs) {
    if (q.subject) subj.add(q.subject);
    if (q.source) src.add(q.source);
  }
  subjectsSet.set(subj);
  sourcesSet.set(src);
});
// Monotonically increasing id used to assign unique ids without scanning
// the entire question list each time a new entry is created.
let nextId = 1;

/**
 * Retrieve the next available question id and increment the counter.
 */
export function nextQuestionId() {
  return nextId++;
}

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
          options: q.options ?? undefined,
          images: q.images ?? undefined,
          subject: subject || undefined,
          source: source || undefined
        });
      }
    }
  }
  return out;
}

// Prevent the auto-save subscription from scheduling saves during manual
// operations or while an explicit save is in progress. The flag is flipped
// by helpers like {@link saveQuestionBank} and {@link withQuestionBatch}.
let suppressAutoSave = false;

// Pending debounce timer for auto-saving. When non-null a save is scheduled
// to run after a short delay, coalescing rapid successive updates.
let saveTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Persist the question bank to disk using the Tauri backend.
 */
export async function saveQuestionBank() {
  // mark the subscription so that the write below doesn't trigger another
  // queued auto-save
  suppressAutoSave = true;
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  const list = get(questions);
  const dir = get(dataDir) || null;
  console.debug('Saving question bank to', dir ?? '(default)');
  const bank = toBank(list);
  try {
    await invoke('save_questions', { dir, bank });
    console.debug('Saved', list.length, 'questions');
  } catch (e) {
    console.error('Failed to save question bank', e);
    addToast('Failed to save question bank');
  } finally {
    // Always re-enable the auto-save subscription even if the backend save
    // fails so future edits continue to persist.
    suppressAutoSave = false;
  }
}

/**
 * Load the question bank from disk. If no questions are present
 * a built in sample bank is loaded instead.
 */
export async function loadQuestionBank() {
  const dir = get(dataDir) || null;
  console.debug('Loading question bank from', dir ?? '(default)');
  try {
    // Fetch the persisted bank; if none exists or it is corrupt fall back to
    // bundled sample questions so the application still has content.
    let bank = (await invoke('load_questions', { dir })) as unknown;
    if (
      !isValidQuestionBank(bank) ||
      Object.keys((bank as QuestionBank).subjects).length === 0
    ) {
      bank = (await invoke('sample_questions')) as QuestionBank;
    }
    const list = flattenBank(bank as QuestionBank);
    nextId = Math.max(0, ...list.map((q) => q.id)) + 1;
    console.debug('Loaded', list.length, 'questions');
    questions.set(list);
  } catch (e) {
    // In the event of a failure, surface a toast and continue with an empty
    // question list so the UI remains usable.
    console.error('Failed to load question bank', e);
    addToast('Failed to load question bank');
    questions.set([]);
    nextId = 1;
  }
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
  nextId = 1;
  await saveQuestionBank();
}

/**
 * Immediately persist any pending changes and cancel the debounce timer.
 */
export async function flushAutoSave() {
  // Cancel any pending debounced save and immediately persist the current
  // state. Useful before unloading the page or after large batches of edits.
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  console.debug('Flushing auto-save');
  await saveQuestionBank();
}

/**
 * Execute multiple question mutations while temporarily disabling the
 * auto-save subscription. The updated bank is saved once after `fn` completes.
 */
export async function withQuestionBatch(fn: () => void | Promise<void>) {
  // Temporarily disable the auto-save subscription so that a burst of
  // updates (e.g. imports) doesn't trigger multiple writes. The caller's
  // updates are executed inside `fn` and a single save occurs afterward.
  suppressAutoSave = true;
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  try {
    console.debug('Starting question batch');
    await fn();
    await flushAutoSave();
    console.debug('Finished question batch');
  } finally {
    suppressAutoSave = false;
  }
}

/**
 * Automatically persist question changes to disk with a short debounce.
 * This helps prevent data loss if the user navigates away without manually
 * saving after edits or deletions.
 */
if (typeof window !== 'undefined') {
  // Persist changes whenever the questions store updates. The first update
  // occurs during initial load and should not trigger a save.
  let initial = true;
  questions.subscribe(() => {
    if (initial) {
      initial = false;
      return;
    }
    // Skip auto-save while `suppressAutoSave` is true (manual save in
    // progress or a batch update).
    if (suppressAutoSave) return;
    // Debounce to combine rapid consecutive updates into a single save.
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveQuestionBank();
      saveTimer = null;
    }, 300);
  });
}

