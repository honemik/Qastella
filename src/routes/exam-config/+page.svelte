<script lang="ts">
  import { questions, type Question } from '$lib/stores/questions';
  import { examQuestions } from '$lib/stores/exam';
  import { goto } from '$app/navigation';
import { writable, derived, get } from 'svelte/store';

// Number of questions to include in the generated exam
const count = writable(10);
// User-selected subject and source filters
const selectedSubjects = writable<string[]>([]);
const selectedSources = writable<string[]>([]);
// Flags controlling randomisation behaviour
let shuffleQuestions = true;
let shuffleOptions = true;

  // Distinct list of subjects and sources for the selection lists
  const subjects = derived(
    questions,
    qs => Array.from(new Set(qs.map(q => q.subject).filter(Boolean))) as string[]
  );
  const sources = derived(
    questions,
    qs => Array.from(new Set(qs.map(q => q.source).filter(Boolean))) as string[]
  );

  // Questions matching the current subject/source filters
  const filtered = derived(
    [questions, selectedSubjects, selectedSources],
    ([$qs, $sub, $src]) =>
      // Include questions only when they match the active subject/source filters
      $qs.filter(
        (q) =>
          ($sub.length === 0 || (q.subject && $sub.includes(q.subject))) &&
          ($src.length === 0 || (q.source && $src.includes(q.source)))
      )
  );

  $: if ($count > $filtered.length) count.set($filtered.length);

  // Fisher-Yates shuffle used for both question order and option order
  function shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function shuffleOptionOrder(q: Question): Question {
    // Reassign option keys after shuffling so answers stay aligned
    if (!q.options) return q;
    const entries = Object.entries(q.options);
    shuffle(entries);
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const opts: Record<string, string> = {};
    let ans: string | string[] = Array.isArray(q.answer) ? [] : '';
    entries.forEach(([key, text], idx) => {
      const letter = letters[idx];
      opts[letter] = text;
      if (Array.isArray(q.answer)) {
        if (q.answer.includes(key)) (ans as string[]).push(letter);
      } else if (q.answer === key) {
        ans = letter;
      }
    });
    return { ...q, options: opts, answer: ans };
  }

  /**
   * Prepare the selected subset of questions and navigate to the exam page.
   */
  function start() {
    const cnt = get(count);
    let list = [...get(filtered)];
    if (shuffleQuestions) {
      shuffle(list);
    }
    list = list.slice(0, cnt);
    if (shuffleOptions) {
      list = list.map(shuffleOptionOrder);
    }
    examQuestions.set(list);
    goto('/mock-exam');
  }
</script>

<main>
  <h1>Mock Exam Setup</h1>
  <p>Questions after filters: {$filtered.length}</p>
  <label>
    Question count:
    <input type="number" min="1" max={$filtered.length} bind:value={$count} />
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
  <label>
    <input type="checkbox" bind:checked={shuffleQuestions} /> Randomize question order
  </label>
  <label>
    <input type="checkbox" bind:checked={shuffleOptions} /> Randomize option order
  </label>
  <button on:click={start}>Start</button>
</main>
