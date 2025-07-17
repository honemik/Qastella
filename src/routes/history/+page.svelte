<script lang="ts">
  import { history, deleteHistoryItem } from '$lib/stores/results';
  import { goto } from '$app/navigation';
</script>

<main>
  <h1>History</h1>
  {#if $history.length === 0}
    <p>No exam history.</p>
  {:else}
    <table class="history">
      <thead>
        <tr>
          <th>Date</th>
          <th>Score</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each $history as item, i}
          <tr>
            <td>{new Date(item.timestamp).toLocaleString()}</td>
            <td>
              {item.records.filter((r) => r.correct).length}/{item.records.length}
            </td>
            <td>
              <button
                class="nav-btn"
                type="button"
                on:click={() => goto(`/review/${i}`)}
              >
                Review
              </button>
              <button
                type="button"
                on:click={() => deleteHistoryItem(i)}
              >
                Delete
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</main>
