<script lang="ts">
  import { questions, type Question, saveQuestionBank } from '$lib/stores/questions';
import { writable, derived, type Readable } from 'svelte/store';
import { fade } from 'svelte/transition';

const keyword = writable('');
const subjectFilters = writable<string[]>([]);
const sourceFilters = writable<string[]>([]);

const debouncedKeyword: Readable<string> = derived(keyword, ($kw, set) => {
  const handle = setTimeout(() => set($kw.toLowerCase()), 200);
  return () => clearTimeout(handle);
}, '');

const subjects = derived(
  questions,
  qs => Array.from(new Set(qs.map(q => q.subject).filter(Boolean))) as string[]
);
const sources = derived(
  questions,
  qs => Array.from(new Set(qs.map(q => q.source).filter(Boolean))) as string[]
);

const filtered = derived(
  [questions, debouncedKeyword, subjectFilters, sourceFilters],
  ([$qs, $kw, $sub, $src]) => {
    const hasFilters = $kw || $sub.length || $src.length;
    if (!hasFilters) return [] as Question[];
    return $qs.filter(
      (q) =>
        (!$kw || q.question.toLowerCase().includes($kw)) &&
        ($sub.length === 0 || (q.subject && $sub.includes(q.subject))) &&
        ($src.length === 0 || (q.source && $src.includes(q.source)))
    );
  }
);

  let editing: Question | null = null;
  let correct: string[] = [];
  let dlg: HTMLDialogElement | null = null;
  let lightbox: string | null = null;

  $: if (editing && editing.type === 'single' && correct.length > 1) {
    correct = [correct[0]];
  }

  /**
   * Open the edit dialog for an existing question.
   */
  function openEdit(q: Question) {
    editing = { ...q };
    correct = Array.isArray(q.answer) ? [...q.answer] : [q.answer as string];
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
    correct = correct.filter((c) => c !== key);
  }

  function toggleCorrect(key: string) {
    if (!editing) return;
    if (editing.type === 'single') {
      correct = [key];
    } else {
      correct = correct.includes(key)
        ? correct.filter((c) => c !== key)
        : [...correct, key];
    }
  }

  /**
   * Append selected image files to the current question.
   */
  function addImages(event: Event) {
    if (!editing) return;
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    const readers = files.map(
      (f) =>
        new Promise<string>((resolve) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result as string);
          r.readAsDataURL(f);
        })
    );
    Promise.all(readers).then((data) => {
      editing = { ...editing!, images: [...(editing!.images ?? []), ...data] };
    });
  }

  /**
   * Paste handler to allow images to be pasted directly into the edit dialog.
   */
  function handlePaste(e: ClipboardEvent) {
    if (!editing) return;
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const it of items) {
      if (it.type.startsWith('image/')) {
        const f = it.getAsFile();
        if (f) {
          const r = new FileReader();
          r.onload = () => {
            editing = {
              ...editing!,
              images: [...(editing!.images ?? []), r.result as string]
            };
          };
          r.readAsDataURL(f);
        }
      }
    }
  }

  /** Remove an image by index from the current question. */
  function removeImage(i: number) {
    if (!editing || !editing.images) return;
    const imgs = [...editing.images];
    imgs.splice(i, 1);
    editing = { ...editing, images: imgs };
  }

  /**
   * Save the current edit to the question list.
   */
  async function save() {
    if (!editing) return;
    editing.answer = editing.type === 'multiple' ? correct : correct[0];
    questions.update((list) => {
      const idx = list.findIndex((q) => q.id === editing!.id);
      if (idx >= 0) {
        const copy = [...list];
        copy[idx] = editing!;
        return copy;
      }
      return [...list, editing!];
    });
    await saveQuestionBank();
    console.debug('Saved question', editing.id);
    dlg?.close();
    editing = null;
  }

  /**
   * Delete a question by id and persist the change immediately.
   */
  async function remove(id: number) {
    questions.update(list => list.filter(q => q.id !== id));
    await saveQuestionBank();
  }
</script>

<main class="bank-page">
  <h1>Question Bank</h1>
  {#if $questions.length === 0}
    <div class="empty-state">
      <h2>Your question bank is empty</h2>
      <p>Start by importing questions or add one manually.</p>
      <div class="actions">
        <a href="/import-questionbank">Import Questions</a>
        <a href="/add-question">Add Question</a>
      </div>
    </div>
  {:else}
    <div class="filters">
      <input placeholder="Keyword" bind:value={$keyword} />
      <div class="filter-group subjects">
        {#each $subjects as s}
          <label>
            <input type="checkbox" bind:group={$subjectFilters} value={s} />
            {s}
          </label>
        {/each}
      </div>
      <div class="filter-group sources">
        {#each $sources as s}
          <label>
            <input type="checkbox" bind:group={$sourceFilters} value={s} />
            {s}
          </label>
        {/each}
      </div>
    </div>
    {#if $filtered.length}
      <table class="bank">
        <colgroup>
          <col class="question" />
          <col class="options" />
          <col class="answer" />
          <col class="images" />
          <col class="subject" />
          <col class="source" />
          <col class="actions" />
        </colgroup>
        <thead>
          <tr>
            <th>Question</th>
            <th>Options</th>
            <th>Answer</th>
            <th>Images</th>
            <th>Subject</th>
            <th>Source</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {#each $filtered as q (q.id)}
            <tr>
              <td>{q.question}</td>
              <td>
                {q.options
                  ? Object.entries(q.options)
                      .map(([k, v]) => `${k}:${v}`)
                      .join(', ')
                  : ''}
              </td>
              <td>{Array.isArray(q.answer) ? q.answer.join(', ') : q.answer}</td>
              <td>{q.images?.length ?? 0}</td>
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
      <button class="save-bank" on:click={saveQuestionBank}>Save Bank</button>
    {:else}
      <div class="no-questions">
        <p>No questions displayed.</p>
      </div>
    {/if}
  {/if}
</main>

<dialog bind:this={dlg} on:paste={handlePaste}>
  {#if editing}
    <h2>Edit Question {editing.id}</h2>
    <label>
      Type
      <select bind:value={editing.type}>
        <option value="single">Single Choice</option>
        <option value="multiple">Multiple Choice</option>
      </select>
    </label>
    <label>
      Question
      <textarea rows="5" bind:value={editing.question}></textarea>
    </label>
    {#if editing.options}
      {#each Object.entries(editing.options) as [key, val]}
        <div class="option-row">
          <span>{key}: <input bind:value={editing.options![key]} /></span>
          <label class="option-check {editing.type === 'single' ? 'radio' : 'checkbox'}">
            <input
              type={editing.type === 'single' ? 'radio' : 'checkbox'}
              name="correctEdit"
              checked={correct.includes(key)}
              on:change={() => toggleCorrect(key)}
            />
            <span class="mark"></span>
          </label>
          <button type="button" on:click={() => removeOption(key)}>x</button>
        </div>
      {/each}
    {/if}
    <button type="button" on:click={addOption}>Add Option</button>
    {#if editing.images?.length}
      <div class="images thumbs">
        {#each editing.images as img, i (i)}
          <div class="img-wrapper" transition:fade>
            <button type="button" class="thumb" on:click={() => (lightbox = img)}>
              <img src={img} alt="question image {i}" />
            </button>
            <button type="button" class="remove" on:click={() => removeImage(i)}>x</button>
          </div>
        {/each}
      </div>
    {/if}
    <label>
      Add Images
      <input type="file" accept="image/*" multiple on:change={addImages} />
    </label>
    <label>Source <input bind:value={editing.source} /></label>
    <label>Subject <input bind:value={editing.subject} /></label>
    <button on:click={save}>Save</button>
    <button on:click={() => { dlg?.close(); editing = null; }}>Cancel</button>
    {#if lightbox}
      <button
        type="button"
        class="lightbox"
        on:click={() => (lightbox = null)}
      >
        <img src={lightbox} alt="enlarged" />
      </button>
    {/if}
  {/if}

</dialog>

<style>
  textarea {
    width: 100%;
    margin-bottom: 0.5rem;
  }
  td {
    white-space: pre-wrap;
  }
  .bank-page {
    max-width: none;
    width: 100%;
  }
  .bank-page > h1,
  .bank-page > .filters,
  .bank-page > .save-bank {
    max-width: 800px;
    margin: 0 auto;
  }
  .bank-page > .filters {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .filter-group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .no-questions {
    text-align: center;
    margin-top: 1rem;
  }
  .empty-state {
    text-align: center;
    margin-top: 2rem;
  }
  .empty-state .actions {
    margin-top: 1rem;
    display: flex;
    justify-content: center;
    gap: 1rem;
  }
  .empty-state .actions a {
    text-decoration: none;
    padding: 0.6em 1.25em;
    border-radius: 50px;
    background: var(--button-bg);
    color: var(--nav-text);
    box-shadow: 0 0 8px rgb(0 0 0 / 5%);
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: all 0.5s ease;
  }
  .empty-state .actions a:hover {
    background: var(--primary);
    color: #fff;
    box-shadow: 0 7px 29px var(--shadow);
    transform: scale(1.05);
  }
  .empty-state .actions a:active {
    transform: translateY(4px);
    box-shadow: none;
    transition: 100ms;
  }
  table.bank {
    width: 70vw;
    margin: 0 auto;
    border-collapse: collapse;
  }
  table.bank col.question {
    width: 37%;
  }
  table.bank col.options {
    width: 37%;
  }
  table.bank col.answer {
    width: 8%;
  }
  table.bank col.images {
    width: 5%;
  }
  table.bank col.subject {
    width: 6%;
  }
  table.bank col.source {
    width: 5%;
  }
  table.bank col.actions {
    width: 1%;
    white-space: nowrap;
  }
</style>


