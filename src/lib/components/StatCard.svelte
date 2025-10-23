<script lang="ts">
  export let label: string;
  export let value: string | number;
  export let caption: string | null = null;
</script>

<article class="stat-card" role="presentation">
  <p class="stat-label">{label}</p>
  <p class="stat-value">{value}</p>
  {#if caption}
    <p class="stat-caption">{caption}</p>
  {/if}
</article>

<style>
  .stat-card {
    flex: 1 1 160px;
    background: var(--surface, var(--primary));
    color: var(--surface-text, var(--nav-text));
    padding: 1rem 1.25rem;
    border-radius: 0.75rem;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .stat-card:hover,
  .stat-card:focus-within {
    transform: translateY(-2px);
    box-shadow: 0 16px 34px rgba(15, 23, 42, 0.12);
  }

  .stat-label {
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    opacity: 0.85;
  }

  .stat-value {
    font-size: clamp(1.75rem, 2vw + 1rem, 2.25rem);
    font-weight: 700;
  }

  .stat-caption {
    margin-top: 0.25rem;
    font-size: 0.9rem;
    opacity: 0.8;
  }
</style>
