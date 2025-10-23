<script lang="ts">
  import { derived } from 'svelte/store';
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
  import { questions } from '$lib/stores/questions';
  import { historyStats } from '$lib/stores/results';
  import { goto } from '$app/navigation';
  import StatCard from '$lib/components/StatCard.svelte';

  const totalQuestions = derived(questions, ($questions) => $questions.length);

  let chartEl: HTMLCanvasElement | null = null;
  let chart: Chart | null = null;
  let lastChartData: number[] = [];

  function formatDuration(seconds: number) {
    if (!Number.isFinite(seconds) || seconds <= 0) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const parts = [];
    if (mins > 0) parts.push(`${mins} min${mins === 1 ? '' : 's'}`);
    parts.push(`${secs.toString().padStart(2, '0')} s`);
    return parts.join(' ');
  }

  function formatTimestamp(timestamp: string) {
    try {
      const date = new Date(timestamp);
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
    } catch (error) {
      console.warn('Unable to format timestamp', timestamp, error);
      return timestamp;
    }
  }

  function arraysEqual(a: number[], b: number[]) {
    if (a.length !== b.length) return false;
    return a.every((value, index) => value === b[index]);
  }

  onMount(() => {
    if (chartEl) {
      const data = $historyStats.recentScores;
      chart = new Chart(chartEl, {
        type: 'line',
        data: {
          labels: data.map((_, i) => `${i + 1}`),
          datasets: [
            {
              label: 'Score %',
              data,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.3,
            },
          ],
        },
        options: {
          responsive: true,
          animation: false,
          scales: { y: { beginAtZero: true, max: 100 } },
        },
      });
      lastChartData = data.slice();
    }
    return () => chart?.destroy();
  });

  $: if (chart) {
    const data = $historyStats.recentScores;
    if (!arraysEqual(data, lastChartData)) {
      chart.data.labels = data.map((_, i) => `${i + 1}`);
      chart.data.datasets[0].data = data;
      chart.update();
      lastChartData = data.slice();
    }
  }
</script>

<main class="container dashboard">
  <h1>Qastella Dashboard</h1>
  <section class="stats" aria-label="Performance summary">
    <StatCard
      label="Total Questions"
      value={$totalQuestions.toLocaleString()}
      caption={$totalQuestions === 1 ? 'Ready to quiz' : 'Questions in your bank'}
    />
    <StatCard
      label="Sessions Completed"
      value={$historyStats.sessionCount.toLocaleString()}
      caption={$historyStats.sessionCount === 1
        ? 'Single practice session finished'
        : 'Completed practice sessions'}
    />
    <StatCard
      label="Questions Answered"
      value={$historyStats.answeredCount.toLocaleString()}
      caption={$historyStats.answeredCount === 1
        ? 'One answer logged'
        : 'Total answers recorded'}
    />
    <StatCard
      label="Overall Accuracy"
      value={`${$historyStats.accuracy}%`}
      caption={$historyStats.answeredCount === 0
        ? 'Answer questions to build history'
        : 'Across all stored answers'}
    />
  </section>

  {#if $historyStats.lastAttempt}
    <section class="recent" aria-label="Most recent attempt">
      <h2>Last practice session</h2>
      <div class="recent-summary">
        <p class="recent-score">{$historyStats.lastAttempt.accuracy}% accuracy</p>
        <dl>
          <div>
            <dt>Completed</dt>
            <dd>{formatTimestamp($historyStats.lastAttempt.timestamp)}</dd>
          </div>
          <div>
            <dt>Correct</dt>
            <dd>{$historyStats.lastAttempt.correct} / {$historyStats.lastAttempt.total}</dd>
          </div>
          <div>
            <dt>Time spent</dt>
            <dd>{formatDuration($historyStats.lastAttempt.elapsed)}</dd>
          </div>
        </dl>
      </div>
    </section>
  {/if}

  <section class="graphs" aria-label="Score trend">
    <h2>Score Trend</h2>
    {#if $historyStats.recentScores.length > 0}
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


