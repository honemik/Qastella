<script lang="ts">
  import { questions } from '$lib/stores/questions';

  let answers: Record<number, string> = {};
  let finished = false;
  let score = 0;

  function submit() {
    score = 0;
    $questions.forEach((q) => {
      if (answers[q.id] && answers[q.id] === q.answer) {
        score += 1;
      }
    });
    finished = true;
  }
</script>

<h1>Mock Exam</h1>
{#if $questions.length === 0}
<p>No questions available. <a href="/import">Import a file</a>.</p>
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

{#if finished}
<p>Score: {score} / {$questions.length}</p>
{/if}

<style>
.question {
  margin-bottom: 1em;
}
label {
  display: block;
}
</style>
