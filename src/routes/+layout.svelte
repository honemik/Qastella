<script lang="ts">
  import { onMount } from 'svelte';
  import { initSettings } from '$lib/stores/settings';
  import { loadQuestionBank, saveQuestionBank } from '$lib/stores/questions';
  import { loadHistory, saveHistory } from '$lib/stores/results';
  import { getCurrentWindow, type CloseRequestedEvent } from '@tauri-apps/api/window';

  onMount(() => {
    (async () => {
      await initSettings();
      await Promise.all([loadQuestionBank(), loadHistory()]);
    })();

    const saveAll = async () => {
      await Promise.all([saveQuestionBank(), saveHistory()]);
    };

    const unloadHandler = () => {
      // fire and forget when the browser reloads
      saveQuestionBank();
      saveHistory();
    };
    window.addEventListener('beforeunload', unloadHandler);

    const win = getCurrentWindow();
    let unlisten: () => void;
    win.onCloseRequested(async (e: CloseRequestedEvent) => {
      e.preventDefault();
      await saveAll();
      if (unlisten) unlisten();
      // destroy avoids firing another close request
      await win.destroy();
    }).then((fn) => {
      unlisten = fn;
    });

    return () => {
      window.removeEventListener('beforeunload', unloadHandler);
      if (unlisten) unlisten();
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
