<script lang="ts">
  import { onMount } from 'svelte';
  import { initSettings } from '$lib/stores/settings';
  import { loadQuestionBank, saveQuestionBank } from '$lib/stores/questions';
  import { loadHistory, saveHistory } from '$lib/stores/results';
  import { appWindow } from '@tauri-apps/api/window';

  onMount(() => {
    (async () => {
      await initSettings();
      await Promise.all([loadQuestionBank(), loadHistory()]);
    })();

    const saveAll = () => {
      saveQuestionBank();
      saveHistory();
    };

    window.addEventListener('beforeunload', saveAll);
    let unlistenPromise = appWindow.listen('tauri://close-requested', async () => {
      saveAll();
      await appWindow.close();
    });

    return () => {
      window.removeEventListener('beforeunload', saveAll);
      unlistenPromise.then((unlisten) => unlisten());
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
