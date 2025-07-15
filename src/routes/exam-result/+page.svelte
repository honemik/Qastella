<script lang="ts">
  import { lastResult } from '$lib/stores/results';
</script>

<h1>Exam Result</h1>
{#if $lastResult}
  <p>Score: {$lastResult.records.filter(r => r.correct).length} / {$lastResult.records.length}</p>
  <ul>
    {#each $lastResult.records as rec}
      <li>
        {rec.question.question} - {rec.correct ? '✔' : '✖'} (your answer: {rec.answer})
      </li>
    {/each}
  </ul>
  <a href="/review">Review Wrong Answers</a>
{:else}
  <p>No result available.</p>
{/if}
