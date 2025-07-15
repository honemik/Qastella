<script lang="ts">
  import { questions } from '$lib/stores/questions';
</script>

<h1>Question Bank</h1>
{#if $questions.length === 0}
<p>No questions loaded. <a href="/import-exam">Import a file</a>.</p>
{:else}
  <ol>
  {#each $questions as q}
    <li>
      <p>{q.question}</p>
      {#if q.options}
        <ul>
        {#each Object.entries(q.options) as [key, text]}
          <li>{key}. {text}</li>
        {/each}
        </ul>
      {/if}
      <p><strong>Answer:</strong> {Array.isArray(q.answer) ? q.answer.join(', ') : q.answer}</p>
    </li>
  {/each}
  </ol>
{/if}
