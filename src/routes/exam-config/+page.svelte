<script lang="ts">
  import { questions } from '$lib/stores/questions';
  import { goto } from '$app/navigation';
  import { writable } from 'svelte/store';

  const count = writable(10);

  function start() {
    goto('/mock-exam');
  }
</script>

<h1>Mock Exam Setup</h1>
<p>Total questions available: {$questions.length}</p>
<label>
  Question count:
  <input type="number" min="1" max={$questions.length} bind:value={$count} />
</label>
<button on:click={start}>Start</button>
