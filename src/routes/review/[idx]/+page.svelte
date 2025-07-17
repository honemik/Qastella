<script lang="ts">
  import { page } from '$app/stores';
  import { derived } from 'svelte/store';
  import { history } from '$lib/stores/results';
  import { fade } from 'svelte/transition';

  let lightbox: string | null = null;

  // Index of the history entry derived from the route parameter
  const idx = derived(page, ($p) => parseInt($p.params.idx));
  // The history entry selected for review
  const entry = derived([history, idx], ([$history, id]) => $history[id]);
</script>

<main>
  <h1>Exam Review</h1>
  {#if $entry}
    {#each $entry.records as rec (rec.question.id)}
      <div class="question" transition:fade>
        <p>{rec.question.question}</p>
        {#if rec.question.images}
          <div class="images">
            {#each rec.question.images as img}
              <img src={img} alt="" transition:fade on:click={() => (lightbox = img)} />
            {/each}
          </div>
        {/if}
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
    <p>Exam not found.</p>
  {/if}
  {#if lightbox}
    <div class="lightbox" on:click={() => (lightbox = null)} transition:fade>
      <img src={lightbox} alt="enlarged" />
    </div>
  {/if}
</main>



