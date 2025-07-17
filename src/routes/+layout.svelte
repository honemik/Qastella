<script lang="ts">
  import { onMount } from 'svelte';
  import { initSettings } from '$lib/stores/settings';
  import { loadQuestionBank, saveQuestionBank } from '$lib/stores/questions';
  import { loadHistory, saveHistory } from '$lib/stores/results';

  // Initial load of persistent data and save handlers
  onMount(() => {
    (async () => {
      await initSettings();
      await Promise.all([loadQuestionBank(), loadHistory()]);
    })();

    // Helper to persist questions and history together
    const saveAll = async () => {
      await Promise.all([saveQuestionBank(), saveHistory()]);
    };

    // Persist data before the window unloads (e.g. refresh or close)
    const unloadHandler = () => {
      // fire and forget when the browser reloads
      saveQuestionBank();
      saveHistory();
    };
    window.addEventListener('beforeunload', unloadHandler);

    return () => {
      window.removeEventListener('beforeunload', unloadHandler);
    };
  });
</script>

<nav class="main-nav">
  <a class="brand" href="/">Qastella</a>
  <div class="links">
    <a href="/exam-config">Mock Exam</a>
    <a href="/import-questionbank">Import Question Bank</a>
    <a href="/question-bank">Question Bank</a>
    <a href="/history">History</a>
    <a href="/add-question">Add Question</a>
    <a href="/settings">Settings</a>
  </div>
</nav>

<slot />

<nav class="bottom-nav">
  <a href="/exam-config" aria-label="Mock Exam">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  </a>
  <a href="/import-questionbank" aria-label="Import Bank">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 5v14m-7-7 7 7 7-7" />
    </svg>
  </a>
  <a href="/question-bank" aria-label="Question Bank">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M4 5h6v14H6a2 2 0 0 1-2-2V5Zm16 0h-6v14h4a2 2 0 0 0 2-2V5Z" />
    </svg>
  </a>
  <a href="/history" aria-label="History">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  </a>
  <a href="/add-question" aria-label="Add Question">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  </a>
  <a href="/settings" aria-label="Settings">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1 1 0 0 0 .24 1.09l-.71.71a1 1 0 0 0-.24 1.09l.54 1.87a2 2 0 0 1-1.9 2.53h-1.5a1 1 0 0 0-.95.68l-.39 1.2a2 2 0 0 1-3.8 0l-.39-1.2a1 1 0 0 0-.95-.68H8.67a2 2 0 0 1-1.9-2.53l.54-1.87a1 1 0 0 0-.24-1.09l-.71-.71a1 1 0 0 0 0-1.41l.71-.71a1 1 0 0 0 .24-1.09l-.54-1.87a2 2 0 0 1 1.9-2.53h1.5a1 1 0 0 0 .95-.68l.39-1.2a2 2 0 0 1 3.8 0l.39 1.2a1 1 0 0 0 .95.68h1.5a2 2 0 0 1 1.9 2.53l-.54 1.87a1 1 0 0 0 .24 1.09l.71.71a1 1 0 0 0 0 1.41Z" />
    </svg>
  </a>
</nav>


