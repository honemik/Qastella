<script lang="ts">
  import { lastResult } from '$lib/stores/results';
</script>

<main>
  <h1>Exam Review</h1>
  {#if $lastResult}
    {#each $lastResult.records as rec (rec.question.id)}
      <div class="question">
        <p>{rec.question.question}</p>
        {#if rec.question.options}
          <ul>
            {#each Object.entries(rec.question.options) as [key, text]}
              <li
                class={
                  rec.question.answer == key
                    ? 'correct'
                    : rec.answer == key && !rec.correct
                    ? 'wrong'
                    : ''
                }
              >
                {key}. {text}
              </li>
            {/each}
          </ul>
        {:else}
          <p>Correct answer: {rec.question.answer}</p>
          <p>Your answer: {rec.answer}</p>
        {/if}
      </div>
    {/each}
  {:else}
    <p>No results.</p>
  {/if}
</main>


