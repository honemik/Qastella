<script lang="ts">
  import { lastResult } from '$lib/stores/results';
</script>

<h1>Wrong Note</h1>
{#if $lastResult}
  {#each $lastResult.records.filter(r => !r.correct) as rec}
    <div class="question">
      <p>{rec.question.question}</p>
      <p>Your answer: {rec.answer}</p>
      <p>Correct: {rec.question.answer}</p>
    </div>
  {/each}
{:else}
  <p>No results.</p>
{/if}
