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
  <a class="brand nav-btn" href="/">Qastella</a>
  <div class="nav-buttons">
    <a class="nav-btn" href="/exam-config">Mock Exam</a>
    <a class="nav-btn" href="/import-questionbank">Import Question Bank</a>
    <a class="nav-btn" href="/question-bank">Question Bank</a>
    <a class="nav-btn" href="/history">History</a>
    <a class="nav-btn" href="/add-question">Add Question</a>
    <a class="nav-btn" href="/settings">Settings</a>
  </div>
</nav>


<slot />


