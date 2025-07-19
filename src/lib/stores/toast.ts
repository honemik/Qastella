import { writable } from 'svelte/store';

export interface Toast {
  id: number;
  message: string;
}

export const toasts = writable<Toast[]>([]);

export function addToast(message: string, duration = 3000) {
  const id = Date.now() + Math.random();
  toasts.update((list) => [...list, { id, message }]);
  setTimeout(() => {
    toasts.update((list) => list.filter((t) => t.id !== id));
  }, duration);
}
