<script lang="ts">
  import { page } from '$app/stores';
  import { derived } from 'svelte/store';
  import { history, type AnswerRecord } from '$lib/stores/results';
  import { fade } from 'svelte/transition';

  let lightbox: string | null = null;

  // Index of the history entry derived from the route parameter
  const idx = derived(page, ($p) => parseInt($p.params.idx));
  // The history entry selected for review
  const entry = derived([history, idx], ([$history, id]) => $history[id]);

  function copy(rec: AnswerRecord) {
    const html = `<p>${rec.question.question}</p>` +
      (rec.question.images ? rec.question.images.map((src) => `<img src="${src}">`).join('') : '');
    const text = rec.question.question;
    const item = new ClipboardItem({
      'text/plain': new Blob([text], { type: 'text/plain' }),
      'text/html': new Blob([html], { type: 'text/html' })
    });
    navigator.clipboard.write([item]);
  }
</script>

<main>
  <h1>Exam Review</h1>
  {#if $entry}
    {#each $entry.records as rec, i (rec.question.id)}
      <article class="review-card" transition:fade>
        <h2>Question {i + 1}</h2>
        <button type="button" class="copy-btn" on:click={() => copy(rec)}>
          Copy
        </button>
        <p>{rec.question.question}</p>
        {#if rec.question.images}
          <div class="images">
            {#each rec.question.images as img}
              <button
                type="button"
                class="img-thumb"
                on:click={() => (lightbox = img)}
              >
                <img src={img} alt="" transition:fade />
              </button>
            {/each}
          </div>
        {/if}
        {#if rec.question.options}
          <div class="options">
            {#each Object.entries(rec.question.options) as [key, text]}
              <button
                type="button"
                class="option-btn"
                class:correct={
                  Array.isArray(rec.question.answer)
                    ? rec.question.answer.includes(key)
                    : rec.question.answer === key
                }
                class:wrong={
                  (Array.isArray(rec.answer)
                    ? rec.answer.includes(key)
                    : rec.answer === key) &&
                  !(Array.isArray(rec.question.answer)
                    ? rec.question.answer.includes(key)
                    : rec.question.answer === key)
                }
                disabled
              >
                {key}. {text}
              </button>
            {/each}
          </div>
        {:else}
          <p>Correct answer: {rec.question.answer}</p>
          <p>Your answer: {rec.answer}</p>
        {/if}
      </article>
    {/each}
  {:else}
    <p>Exam not found.</p>
  {/if}
  {#if lightbox}
    <button
      type="button"
      class="lightbox"
      on:click={() => (lightbox = null)}
      transition:fade
    >
      <img src={lightbox} alt="enlarged" />
    </button>
  {/if}
</main>



