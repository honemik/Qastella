<script lang="ts">
  import { dataDir, darkMode } from '$lib/stores/settings';
  import {
    getQuestionBank,
    resetQuestionBank,
    questions,
    flattenBank,
    isValidQuestionBank
  } from '$lib/stores/questions';
  import { history } from '$lib/stores/results';
  import { invoke } from '@tauri-apps/api/core';

  /**
   * Download the current question bank as a JSON file.
   */
  function exportQuestions() {
    const data = JSON.stringify(getQuestionBank(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'question_bank.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  /**
   * Download the exam history list as a JSON file.
   */
  function exportHistory() {
    const data = JSON.stringify($history, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'history.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  /**
   * Clear all questions from the local bank.
   */
  async function resetBank() {
    if (confirm('This will delete all questions. Continue?')) {
      await resetQuestionBank();
    }
  }

  /**
   * Reload the question bank from disk if the stored data is valid.
   */
  async function reloadBank() {
    try {
      const dir = $dataDir || null;
      const raw = (await invoke('load_questions', { dir })) as unknown;
      if (!isValidQuestionBank(raw)) {
        alert('Question bank file is invalid. No changes were loaded.');
        return;
      }
      questions.set(flattenBank(raw));
    } catch (e) {
      console.error('Failed to reload question bank', e);
    }
  }
</script>

<main>
  <h1>Settings</h1>
  <label>
    Data Directory <input bind:value={$dataDir} />
  </label>
  <button on:click={exportQuestions}>Export Question Bank</button>
  <button on:click={exportHistory}>Export History</button>
  <button on:click={reloadBank}>Reload Question Bank</button>
  <button on:click={resetBank}>Reset Question Bank</button>
  <label>
    Dark Mode <input type="checkbox" bind:checked={$darkMode} />
  </label>
</main>

