  <script lang="ts">
    import { goto } from '$app/navigation';
    import { questions } from '$lib/stores/questions';
    import { lastResult, attemptCount, correctTotal, type AnswerRecord } from '$lib/stores/results';

  let answers: Record<number, string> = {};

  function submit() {
      const records: AnswerRecord[] = [];
      let correct = 0;
      $questions.forEach((q) => {
        const ans = answers[q.id];
        const ok = ans === q.answer;
        if (ok) correct += 1;
        records.push({ question: q, answer: ans, correct: ok });
      });
      lastResult.set({ records, elapsed: 0 });
      attemptCount.update((n) => n + $questions.length);
      correctTotal.update((n) => n + correct);
      goto('/exam-result');
    }
  </script>

  <h1>Mock Exam</h1>
  {#if $questions.length === 0}
  <p>No questions available. <a href="/import-exam">Import a file</a>.</p>
  {:else}
  <form on:submit|preventDefault={submit}>
  {#each $questions as q (q.id)}
  <div class="question">
    <p>{q.question}</p>
    {#if q.options}
      {#each Object.entries(q.options) as [key, text]}
        <label>
          <input type="radio" name="q-{q.id}" value={key} bind:group={answers[q.id]} />
          {key}. {text}
        </label>
      {/each}
    {/if}
  </div>
  {/each}
  <button type="submit">Submit</button>
</form>
{/if}

<style>
.question {
  margin-bottom: 1em;
}
label {
  display: block;
}
</style>
