<script lang="ts">
  import { history } from '$lib/stores/results';
</script>

<h1>History</h1>
{#if $history.length === 0}
  <p>No exam history.</p>
{:else}
  <ul>
    {#each $history as item}
      <li>
        {new Date(item.timestamp).toLocaleString()} -
        {item.result.records.filter(r => r.correct).length}/{item.result.records.length}
      </li>
    {/each}
  </ul>
{/if}

