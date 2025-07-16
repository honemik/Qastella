<script lang="ts">
  import { lastResult } from '$lib/stores/results';
</script>

<main>
  <h1>Exam Result</h1>
  {#if $lastResult}
    <p>
      Score: {$lastResult.records.filter((r) => r.correct).length} /
      {$lastResult.records.length}
    </p>
    <a href="/review">Review Exam</a>
  {:else}
    <p>No result available.</p>
  {/if}
</main>
