<script lang="ts">
  import { questions, type Question } from '$lib/stores/questions';
  import { writable, derived } from 'svelte/store';

  const keyword = writable('');
  const subjectFilter = writable('');
  const sourceFilter = writable('');

  const subjects = derived(questions, qs => Array.from(new Set(qs.map(q => q.subject).filter(Boolean))) as string[]);
  const sources = derived(questions, qs => Array.from(new Set(qs.map(q => q.source).filter(Boolean))) as string[]);

  const filtered = derived([
    questions,
    keyword,
    subjectFilter,
    sourceFilter
  ], ([$qs, $kw, $sub, $src]) =>
    $qs.filter(q =>
      (!$kw || q.question.includes($kw)) &&
      (!$sub || q.subject === $sub) &&
      (!$src || q.source === $src)
    )
  );

  let editing: Question | null = null;
  let answerValue: string = '';
  let dlg: HTMLDialogElement | null = null;

  function openEdit(q: Question) {
    editing = { ...q };
    answerValue = Array.isArray(q.answer) ? (q.answer as string[]).join(',') : (q.answer as string);
    dlg?.showModal();
  }

  function save() {
    if (!editing) return;
    editing.answer = answerValue;
    questions.update(list => list.map(q => q.id === editing!.id ? editing! : q));
    dlg?.close();
    editing = null;
  }

  function remove(id: number) {
    questions.update(list => list.filter(q => q.id !== id));
  }
</script>

<h1>Question Bank</h1>
{#if $questions.length === 0}
  <p>No questions loaded. <a href="/import-exam">Import a file</a>.</p>
{:else}
  <div class="filters">
    <input placeholder="Keyword" bind:value={$keyword} />
    <select bind:value={$subjectFilter}>
      <option value="">All Subjects</option>
      {#each $subjects as s}
        <option value={s}>{s}</option>
      {/each}
    </select>
    <select bind:value={$sourceFilter}>
      <option value="">All Years</option>
      {#each $sources as s}
        <option value={s}>{s}</option>
      {/each}
    </select>
  </div>
  <table>
    <thead>
      <tr>
        <th>Question</th>
        <th>Answer</th>
        <th>Source</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {#each $filtered as q}
        <tr>
          <td>{q.question.slice(0, 30)}</td>
          <td>{Array.isArray(q.answer) ? q.answer.join(', ') : q.answer}</td>
          <td>{q.source}</td>
          <td>
            <button on:click={() => openEdit(q)}>Edit</button>
            <button on:click={() => remove(q.id)}>Delete</button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}

<dialog bind:this={dlg}>
  {#if editing}
    <h2>Edit Question {editing.id}</h2>
    <label>
      Question
      <input bind:value={editing.question} />
    </label>
    {#if editing.options}
      {#each Object.entries(editing.options) as [key, val]}
        <label>{key}: <input bind:value={editing.options![key]} /></label>
      {/each}
    {/if}
    <label>
      Answer
      <input bind:value={answerValue} />
    </label>
    <label>Source <input bind:value={editing.source} /></label>
    <label>Subject <input bind:value={editing.subject} /></label>
    <button on:click={save}>Save</button>
    <button on:click={() => { dlg?.close(); editing = null; }}>Cancel</button>
  {/if}
</dialog>

<style>
.filters {
  margin-bottom: 1em;
  display: flex;
  gap: 0.5em;
}

th, td {
  padding: 0.25em 0.5em;
  border-bottom: 1px solid #ccc;
}

button {
  margin-right: 0.25em;
}
</style>
