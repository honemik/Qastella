<script lang="ts">
  import { derived } from 'svelte/store';
  import { questions } from '$lib/stores/questions';
  import { lastResult, attemptCount, correctTotal } from '$lib/stores/results';

  const accuracy = derived([correctTotal, attemptCount], ([$c, $a]) =>
    $a === 0 ? 0 : Math.round(($c / $a) * 100)
  );
</script>

<main class="container">
  <h1>Qastella Dashboard</h1>
  <section class="stats">
    <p>Total Questions: {$questions.length}</p>
    <p>Attempts: {$attemptCount}</p>
    <p>Accuracy: {$accuracy}%</p>
  </section>
  {#if $lastResult}
    <section class="recent">
      <h2>Last Result</h2>
      <p>
        Score:
        {$lastResult.records.filter((r) => r.correct).length} /
        {$lastResult.records.length}
      </p>
      <a href="/exam-result">View details</a>
    </section>
  {/if}
  <nav class="quick">
    <a href="/exam-config">Start Mock Exam</a>
    <a href="/import-questionbank">Import Question Bank</a>
    <a href="/question-bank">Manage Bank</a>
  </nav>
</main>

<style>
.container {
  padding: 2rem;
  text-align: center;
}
nav a {
  margin: 0 1rem;
  font-size: 1.2rem;
}
.quick a {
  margin: 0 1rem;
}
</style>
