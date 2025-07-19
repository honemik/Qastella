<script lang="ts">
  import { derived } from 'svelte/store';
  import { questions } from '$lib/stores/questions';
  import { attemptCount, correctTotal } from '$lib/stores/results';
  import { goto } from '$app/navigation';

  const accuracy = derived([correctTotal, attemptCount], ([$c, $a]) =>
    $a === 0 ? 0 : Math.round(($c / $a) * 100)
  );
</script>

<main class="container dashboard">
  <h1>Qastella Dashboard</h1>
  <section class="stats">
    <div>Total Questions: {$questions.length}</div>
    <div>Attempts: {$attemptCount}</div>
    <div>Accuracy: {$accuracy}%</div>
  </section>
  <section class="graphs">
    <h2>Statistics</h2>
    <div class="graph-row">
      <span>Accuracy</span>
      <progress value={$accuracy} max="100">{$accuracy}%</progress>
    </div>
    <div class="graph-row">
      <span>Attempts</span>
      <progress value={$attemptCount} max="{$questions.length}"></progress>
    </div>
  </section>
  <nav class="quick">
    <button class="nav-btn" type="button" on:click={() => goto('/exam-config')}>Start Mock Exam</button>
    <button class="nav-btn" type="button" on:click={() => goto('/import-questionbank')}>Import Question Bank</button>
    <button class="nav-btn" type="button" on:click={() => goto('/question-bank')}>Manage Bank</button>
  </nav>
</main>


