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
  <a href="/">Dashboard</a>
  <a href="/exam-config">Mock Exam</a>
  <a href="/import-questionbank">Import Question Bank</a>
  <a href="/question-bank">Question Bank</a>
  <a href="/history">History</a>
  <a href="/settings">Settings</a>
</nav>

<slot />

<style>
.main-nav {
  padding: 1rem;
  background-color: #f5f5f5;
  display: flex;
  gap: 1rem;
}
.main-nav a {
  text-decoration: none;
  color: inherit;
}
</style>
