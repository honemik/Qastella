<script lang="ts">
  import { derived, get } from 'svelte/store';
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
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
  let chartEl: HTMLCanvasElement | null = null;
  let chart: Chart | null = null;

  onMount(() => {
    if (chartEl) {
      const data = get(recentScores);
      chart = new Chart(chartEl, {
        type: 'line',
        data: {
          labels: data.map((_, i) => `${i + 1}`),
          datasets: [
            {
              label: 'Score %',
              data,
              borderColor: 'rgb(75, 192, 192)',
            },
          ],
        },
        options: {
          responsive: true,
          scales: { y: { beginAtZero: true, max: 100 } },
        },
      });
    }
    return () => chart?.destroy();
  });

  $: if (chart) {
    const data = get(recentScores);
    chart.data.labels = data.map((_, i) => `${i + 1}`);
    chart.data.datasets[0].data = data;
    chart.update();
  }
</script>

<main class="container dashboard">
  <h1>Qastella Dashboard</h1>
  <section class="stats">
    <div>Total Questions: {$questions.length}</div>
    <div>Attempts: {$attemptCount}</div>
    <div>Accuracy: {$accuracy}%</div>
  </section>
  <section class="graphs">
    <h2>Score Trend</h2>
    {#if $recentScores.length > 0}
      <canvas bind:this={chartEl}></canvas>
    {:else}
      <p>No history yet.</p>
    {/if}
  </section>
  <nav class="quick">
    <button class="nav-btn" type="button" on:click={() => goto('/exam-config')}>Start Mock Exam</button>
    <button class="nav-btn" type="button" on:click={() => goto('/import-questionbank')}>Import Question Bank</button>
    <button class="nav-btn" type="button" on:click={() => goto('/question-bank')}>Manage Bank</button>
  </nav>
</main>


