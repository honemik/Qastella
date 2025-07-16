<script lang="ts">
  import { onMount } from 'svelte';
  import { initSettings } from '$lib/stores/settings';
  import { loadQuestionBank, saveQuestionBank } from '$lib/stores/questions';
  import { loadHistory, saveHistory } from '$lib/stores/results';
  import { getCurrentWindow } from '@tauri-apps/api/window';

  onMount(() => {
    (async () => {
      await initSettings();
      await Promise.all([loadQuestionBank(), loadHistory()]);
    })();

    const saveAll = () => {
      saveQuestionBank();
      saveHistory();
    };

    const win = getCurrentWindow();
    window.addEventListener('beforeunload', saveAll);
    win.listen('tauri://close-requested', () => {
      saveAll();
      win.close();
    });

    return () => {
      window.removeEventListener('beforeunload', saveAll);
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
