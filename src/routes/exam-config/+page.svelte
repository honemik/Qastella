<script lang="ts">
  import { questions } from '$lib/stores/questions';
  import { examQuestions } from '$lib/stores/exam';
  import { goto } from '$app/navigation';
import { writable, derived, get } from 'svelte/store';

const count = writable(10);
const selectedSubjects = writable<string[]>([]);
const selectedSources = writable<string[]>([]);

  // Distinct list of subjects and sources for the selection lists
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
    const subj = get(selectedSubjects);
    const src = get(selectedSources);
    const cnt = get(count);
    const list = get(questions).filter(
      (q) =>
        (subj.length === 0 || (q.subject && subj.includes(q.subject))) &&
        (src.length === 0 || (q.source && src.includes(q.source)))
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
  <fieldset>
    <legend>Subjects</legend>
    {#each $subjects as s}
      <label>
        <input type="checkbox" bind:group={$selectedSubjects} value={s} />
        {s}
      </label>
    {/each}
  </fieldset>
  <fieldset>
    <legend>Sources</legend>
    {#each $sources as s}
      <label>
        <input type="checkbox" bind:group={$selectedSources} value={s} />
        {s}
      </label>
    {/each}
  </fieldset>
  <button on:click={start}>Start</button>
</main>
