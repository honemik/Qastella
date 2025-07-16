<script lang="ts">
  import { questions } from '$lib/stores/questions';
  import { examQuestions } from '$lib/stores/exam';
  import { goto } from '$app/navigation';
  import { writable, derived, get } from 'svelte/store';

  const count = writable(10);
  const subject = writable('');
  const source = writable('');

  // Distinct list of subjects and sources for the selection dropdowns
  const subjects = derived(
    questions,
    qs => Array.from(new Set(qs.map(q => q.subject).filter(Boolean))) as string[]
  );
  const sources = derived(
    questions,
    qs => Array.from(new Set(qs.map(q => q.source).filter(Boolean))) as string[]
  );

  /**
   * Prepare the selected subset of questions and navigate to the exam page.
   */
  function start() {
    const subj = get(subject);
    const src = get(source);
    const cnt = get(count);
    const list = get(questions).filter(
      (q) => (!subj || q.subject === subj) && (!src || q.source === src)
    );
    const shuffled = [...list].sort(() => Math.random() - 0.5).slice(0, cnt);
    examQuestions.set(shuffled);
    goto('/mock-exam');
  }
</script>

<main>
  <h1>Mock Exam Setup</h1>
  <p>Total questions available: {$questions.length}</p>
  <label>
    Question count:
    <input type="number" min="1" max={$questions.length} bind:value={$count} />
  </label>
  <label>
    Subject:
    <select bind:value={$subject}>
      <option value="">All</option>
      {#each $subjects as s}
        <option value={s}>{s}</option>
      {/each}
    </select>
  </label>
  <label>
    Source:
    <select bind:value={$source}>
      <option value="">All</option>
      {#each $sources as s}
        <option value={s}>{s}</option>
      {/each}
    </select>
  </label>
  <button on:click={start}>Start</button>
</main>
