<script lang="ts">
  import { onMount } from 'svelte';
import { initSettings } from '$lib/stores/settings';
import { loadQuestionBank, flushAutoSave } from '$lib/stores/questions';
import { loadHistory, saveHistory } from '$lib/stores/results';
import { dataDir } from '$lib/stores/settings';
import { toasts } from '$lib/stores/toast';
import { fade } from 'svelte/transition';

let navButtons: HTMLDivElement;
let navBar: HTMLElement;
let maxWidth = 0;
let isCompact = false;

function setCompact(newState: boolean) {
  if (isCompact === newState) return;
  isCompact = newState;
  navButtons.classList.toggle('compact', isCompact);
  navBar.classList.toggle('compact', isCompact);
  if (!isCompact) {
    maxWidth = Math.max(maxWidth, navBar.clientWidth);
  }
}

function adjustNav() {
  if (!navButtons || !navBar) return;
  const width = navBar.clientWidth;
  if (maxWidth === 0 || (!isCompact && width > maxWidth)) {
    maxWidth = width;
  }
  if (!isCompact && width < maxWidth * 0.6) {
    setCompact(true);
  } else if (isCompact && width > maxWidth * 0.7) {
    setCompact(false);
    maxWidth = width;
  }
}

  // Initial load of persistent data and save handlers
  onMount(() => {
    let initialised = false;
    (async () => {
      await initSettings();
      await Promise.all([loadQuestionBank(), loadHistory()]);
      initialised = true;
    })();

    const unsubDir = dataDir.subscribe(async () => {
      if (initialised) {
        await Promise.all([loadQuestionBank(), loadHistory()]);
      }
    });

    // Persist data before the window unloads (e.g. refresh or close)
    const unloadHandler = () => {
      // fire and forget when the browser reloads
      flushAutoSave();
      saveHistory();
    };
    window.addEventListener('beforeunload', unloadHandler);
    window.addEventListener('resize', adjustNav);
    requestAnimationFrame(adjustNav);

    return () => {
      window.removeEventListener('beforeunload', unloadHandler);
      window.removeEventListener('resize', adjustNav);
      unsubDir();
    };
  });
</script>

<nav class="main-nav" bind:this={navBar}>
  <a class="brand nav-btn" href="/">Qastella</a>
  <div class="nav-buttons" bind:this={navButtons}>
    <a class="nav-btn" href="/exam-config">
      <svg viewBox="0 0 24 24" class="icon" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
      </svg>
      <span class="label">Mock Exam</span>
    </a>
    <a class="nav-btn" href="/import-questionbank">
      <svg viewBox="0 0 24 24" class="icon" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/>
      </svg>
      <span class="label">Import</span>
    </a>
    <a class="nav-btn" href="/question-bank">
      <svg viewBox="0 0 24 24" class="icon" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/>
      </svg>
      <span class="label">Question Bank</span>
    </a>
    <a class="nav-btn" href="/history">
      <svg viewBox="0 0 24 24" class="icon" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span class="label">History</span>
    </a>
    <a class="nav-btn" href="/add-question">
      <svg viewBox="0 0 24 24" class="icon" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span class="label">Add Question</span>
    </a>
    <a class="nav-btn" href="/settings">
      <svg viewBox="0 0 24 24" class="icon" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"/>
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
      <span class="label">Settings</span>
    </a>
  </div>
</nav>


<slot />

<div class="toast-container">
  {#each $toasts as t (t.id)}
    <div class="toast" transition:fade>{t.message}</div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    z-index: 1000;
  }
  .toast {
    background: var(--primary);
    color: var(--nav-text);
    padding: 0.5rem 1rem;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
</style>


