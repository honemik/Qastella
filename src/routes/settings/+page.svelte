<script lang="ts">
  import { dataDir, darkMode } from '$lib/stores/settings';
  import { getQuestionBank, resetQuestionBank } from '$lib/stores/questions';
  import { history } from '$lib/stores/results';

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
</script>

<main>
  <h1>Settings</h1>
  <label>
    Data Directory <input bind:value={$dataDir} />
  </label>
  <button on:click={exportQuestions}>Export Question Bank</button>
  <button on:click={exportHistory}>Export History</button>
  <button on:click={resetBank}>Reset Question Bank</button>
  <label>
    Dark Mode <input type="checkbox" bind:checked={$darkMode} />
  </label>
</main>

