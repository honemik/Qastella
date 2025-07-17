  <script lang="ts">
    import { goto } from '$app/navigation';
    import { examQuestions } from '$lib/stores/exam';
    import { lastResult, attemptCount, correctTotal, type AnswerRecord, addResultToHistory } from '$lib/stores/results';
    import type { Question } from '$lib/stores/questions';
    import { fade } from 'svelte/transition';

  // Stores selected answers keyed by question id
  let answers: Record<number, string[]> = {};

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
  function submit() {
      const records: AnswerRecord[] = [];
      let correct = 0;
      $examQuestions.forEach((q) => {
        const ans = answers[q.id] ?? [];
        let ok = false;
        if (Array.isArray(q.answer)) {
          ok =
            Array.isArray(ans) &&
            q.answer.length === ans.length &&
            q.answer.every((a) => ans.includes(a));
        } else {
          ok = ans[0] === q.answer;
        }
        if (ok) correct += 1;
        records.push({ question: q, answer: Array.isArray(q.answer) ? ans : ans[0], correct: ok });
      });
      lastResult.set({ records, elapsed: 0 });
      addResultToHistory({ records, elapsed: 0 });
      attemptCount.update((n) => n + $examQuestions.length);
      correctTotal.update((n) => n + correct);
      goto('/exam-result');
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




