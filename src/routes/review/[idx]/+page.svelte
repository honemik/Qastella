<script lang="ts">
  import { page } from '$app/stores';
  import { derived } from 'svelte/store';
  import { history, type HistoryEntry } from '$lib/stores/results';

  const idx = derived(page, ($p) => parseInt($p.params.idx));
  const entry = derived([history, idx], ([$history, id]) => $history[id]);
</script>

<h1>Exam Review</h1>
{#if $entry}
  {#each $entry.result.records as rec (rec.question.id)}
    <div class="question">
      <p>{rec.question.question}</p>
      {#if rec.question.options}
        <ul>
          {#each Object.entries(rec.question.options) as [key, text]}
            <li class={rec.question.answer == key ? 'correct' : rec.answer == key && !rec.correct ? 'wrong' : ''}>
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
  <p>Exam not found.</p>
{/if}

<style>
.correct { color: green; }
.wrong { color: red; }
.question { margin-bottom: 1em; }
</style>
