<script lang="ts">
  import { dataDir, themeColor, darkMode } from '$lib/stores/settings';
  import { getQuestionBank } from '$lib/stores/questions';
  import { history, saveHistory } from '$lib/stores/results';

  let dir = '';
  $: dir = $dataDir;
  let color = $themeColor;
  let dark = $darkMode;

  /**
   * Persist the input data directory path to the settings store.
   */
  function updateDir() {
    dataDir.set(dir);
  }

  function updateColor() {
    themeColor.set(color);
  }

  function updateDark() {
    darkMode.set(dark);
  }

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
</script>

<main>
  <h1>Settings</h1>
  <label>
    Data Directory <input bind:value={dir} />
  </label>
  <button on:click={updateDir}>Save Path</button>
  <button on:click={exportQuestions}>Export Question Bank</button>
  <button on:click={exportHistory}>Export History</button>
  <label>
    Theme Color <input type="color" bind:value={color} on:change={updateColor} />
  </label>
  <label>
    Dark Mode <input type="checkbox" bind:checked={dark} on:change={updateDark} />
  </label>
</main>

