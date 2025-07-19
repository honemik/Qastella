<script lang="ts">
  import { derived } from 'svelte/store';
  import { questions } from '$lib/stores/questions';
  import { history } from '$lib/stores/results';
  import { goto } from '$app/navigation';

  const attemptCount = derived(history, ($h) =>
    $h.reduce((sum, r) => sum + r.records.length, 0)
  );
  const correctTotal = derived(history, ($h) =>
    $h.reduce(
      (sum, r) => sum + r.records.filter((rec) => rec.correct).length,
      0
    )
  );
  const accuracy = derived([correctTotal, attemptCount], ([$c, $a]) =>
    $a === 0 ? 0 : Math.round(($c / $a) * 100)
  );
  const recentScores = derived(history, ($h) =>
    $h
      .slice(-10)
      .map((res) =>
        Math.round(
          (res.records.filter((r) => r.correct).length / res.records.length) *
            100
        )
      )
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
    {#if $recentScores.length > 0}
      <div class="graph-row">
        <span>Recent Scores</span>
        <div class="trend">
          {#each $recentScores as s}
            <div class="trend-bar" style="height: {s}%" title={`${s}%`}></div>
          {/each}
        </div>
      </div>
    {/if}
  </section>
  <nav class="quick">
    <button class="nav-btn" type="button" on:click={() => goto('/exam-config')}>Start Mock Exam</button>
    <button class="nav-btn" type="button" on:click={() => goto('/import-questionbank')}>Import Question Bank</button>
    <button class="nav-btn" type="button" on:click={() => goto('/question-bank')}>Manage Bank</button>
  </nav>
</main>


