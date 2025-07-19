  <script lang="ts">
    import { goto } from '$app/navigation';
    import { examQuestions } from '$lib/stores/exam';
    import { lastResult, attemptCount, correctTotal, type AnswerRecord, addResultToHistory } from '$lib/stores/results';
    import type { Question } from '$lib/stores/questions';
    import { fade } from 'svelte/transition';

  // Stores selected answers keyed by question id
  let answers: Record<number, string[]> = {};

  /**
   * Update the user's selected answer for a question. Multiple choice
   * questions allow selecting several options, while single choice
   * questions replace the previous selection.
   */
  function toggleOption(q: Question, opt: string) {
    const current = answers[q.id] ?? [];
    if (q.type === 'multiple') {
      answers = {
        ...answers,
        [q.id]: current.includes(opt)
          ? current.filter((o) => o !== opt)
          : [...current, opt]
      };
    } else {
      answers = { ...answers, [q.id]: [opt] };
    }
  }
  let lightbox: string | null = null;

  /**
   * Grade the answers and store the result before moving to the result page.
   */
  async function submit() {
      for (const q of $examQuestions) {
        const ans = answers[q.id];
        if (!ans || ans.length === 0) {
          alert('Please answer all questions before submitting.');
          return;
        }
      }
      const records: AnswerRecord[] = [];
      let correct = 0;
      $examQuestions.forEach((q) => {
        const ans = answers[q.id] ?? [];
        let ok = false;
        if (Array.isArray(q.answer)) {
          // Convert the selected answers to a Set to avoid duplicate
          // values and speed up membership checks.
          const set = new Set(ans);
          ok =
            Array.isArray(ans) &&
            q.answer.length === set.size &&
            q.answer.every((a) => set.has(a));
        } else {
          ok = ans[0] === q.answer;
        }
        if (ok) correct += 1;
        records.push({ question: q, answer: Array.isArray(q.answer) ? ans : ans[0], correct: ok });
      });
      lastResult.set({ records, elapsed: 0 });
      const index = await addResultToHistory({ records, elapsed: 0 });
      attemptCount.update((n) => n + $examQuestions.length);
      correctTotal.update((n) => n + correct);
      goto(`/review/${index}`);
    }
</script>

<main>
  <h1>Mock Exam</h1>
  {#if $examQuestions.length === 0}
    <p>
      No questions available. <a href="/import-questionbank">Import a file</a>.
    </p>
  {:else}
    <form on:submit|preventDefault={submit}>
      {#each $examQuestions as q (q.id)}
        <div class="question review-card" transition:fade>
          <p>{q.question}</p>
          {#if q.images}
            <div class="images">
              {#each q.images as img}
                <button
                  type="button"
                  class="img-thumb"
                  on:click={() => (lightbox = img)}
                >
                  <img src={img} alt="" transition:fade />
                </button>
              {/each}
            </div>
          {/if}
          {#if q.options}
            <div class="options">
              {#each Object.entries(q.options) as [key, text]}
                <button
                  type="button"
                  class="option-btn"
                  class:selected={(answers[q.id] ?? []).includes(key)}
                  on:click={() => toggleOption(q, key)}
                >
                  {key}. {text}
                </button>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
      <button type="submit">Submit</button>
    </form>
  {/if}
  {#if lightbox}
    <button
      type="button"
      class="lightbox"
      on:click={() => (lightbox = null)}
      transition:fade
    >
      <img src={lightbox} alt="enlarged" />
    </button>
  {/if}
</main>




