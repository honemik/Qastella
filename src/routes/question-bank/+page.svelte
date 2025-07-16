<script lang="ts">
  import { questions, type Question, saveQuestionBank } from '$lib/stores/questions';
  import { writable, derived, get } from 'svelte/store';

  const keyword = writable('');
  const subjectFilter = writable('');
  const sourceFilter = writable('');

  const subjects = derived(questions, qs => Array.from(new Set(qs.map(q => q.subject).filter(Boolean))) as string[]);
  const sources = derived(questions, qs => Array.from(new Set(qs.map(q => q.source).filter(Boolean))) as string[]);

  const filtered = derived(
    [questions, keyword, subjectFilter, sourceFilter],
    ([$qs, $kw, $sub, $src]) =>
      $qs.filter(
        (q) =>
          (!$kw || q.question.includes($kw)) &&
          (!$sub || q.subject === $sub) &&
          (!$src || q.source === $src)
      )
  );

  let editing: Question | null = null;
  let answerValue: string = '';
  let dlg: HTMLDialogElement | null = null;

  /**
   * Open the edit dialog for an existing question.
   */
  function openEdit(q: Question) {
    editing = { ...q };
    answerValue = Array.isArray(q.answer) ? (q.answer as string[]).join(',') : (q.answer as string);
    dlg?.showModal();
  }

  /**
   * Create a new blank question and open the editor dialog.
   */
  function newQuestion() {
    const id = Math.max(0, ...get(questions).map((q) => q.id)) + 1;
    editing = {
      id,
      type: 'single',
      question: '',
      options: { A: '', B: '' },
      answer: '',
      source: '',
      subject: ''
    };
    answerValue = '';
    dlg?.showModal();
  }

  /**
   * Append an additional option field to the current question being edited.
   */
  function addOption() {
    if (!editing) return;
    const opts = { ...(editing.options ?? {}) };
    const letters = Object.keys(opts);
    const next = letters.length
      ? String.fromCharCode(Math.max(...letters.map(l => l.charCodeAt(0))) + 1)
      : 'A';
    opts[next] = '';
    editing = { ...editing, options: opts };
  }

  /**
   * Remove an option from the current question.
   */
  function removeOption(key: string) {
    if (!editing || !editing.options) return;
    const opts = { ...editing.options };
    delete opts[key];
    editing = { ...editing, options: opts };
  }

  /**
   * Save the current edit to the question list.
   */
  function save() {
    if (!editing) return;
    editing.answer = answerValue;
    questions.update((list) => {
      const idx = list.findIndex((q) => q.id === editing!.id);
      if (idx >= 0) {
        const copy = [...list];
        copy[idx] = editing!;
        return copy;
      }
      return [...list, editing!];
    });
    dlg?.close();
    editing = null;
  }

  /**
   * Delete a question by id.
   */
  function remove(id: number) {
    questions.update(list => list.filter(q => q.id !== id));
  }
</script>

<h1>Question Bank</h1>
{#if $questions.length === 0}
  <p>No questions loaded. <a href="/import-questionbank">Import a file</a>.</p>
  <button on:click={newQuestion}>New Question</button>
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
        <th>Options</th>
        <th>Answer</th>
        <th>Subject</th>
        <th>Source</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {#each $filtered as q}
        <tr>
          <td>{q.question.slice(0, 30)}</td>
          <td>{q.options ? Object.entries(q.options).map(([k,v]) => `${k}:${v}`).join(', ') : ''}</td>
          <td>{Array.isArray(q.answer) ? q.answer.join(', ') : q.answer}</td>
          <td>{q.subject}</td>
          <td>{q.source}</td>
          <td>
            <button on:click={() => openEdit(q)}>Edit</button>
            <button on:click={() => remove(q.id)}>Delete</button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
  <button type="button" on:click={newQuestion}>New Question</button>
  <button class="save-bank" on:click={saveQuestionBank}>Save Bank</button>
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
        <label>
          {key}: <input bind:value={editing.options![key]} />
          <button type="button" on:click={() => removeOption(key)}>x</button>
        </label>
      {/each}
    {/if}
    <button type="button" on:click={addOption}>Add Option</button>
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

.save-bank {
  margin-top: 1em;
}
</style>
