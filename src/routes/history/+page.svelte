<script lang="ts">
  import { history } from '$lib/stores/results';
</script>

<main>
  <h1>History</h1>
  {#if $history.length === 0}
    <p>No exam history.</p>
  {:else}
    <ul>
      {#each $history as item, i}
        <li>
          <a href={`/review/${i}`}
            >{new Date(item.timestamp).toLocaleString()} -
            {item.records.filter((r) => r.correct).length}/{item.records.length}</a
          >
        </li>
      {/each}
    </ul>
  {/if}
</main>
