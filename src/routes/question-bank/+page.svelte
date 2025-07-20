<script lang="ts">
  import { questions, type Question, saveQuestionBank } from '$lib/stores/questions';
  import { writable, derived } from 'svelte/store';
  import { fade } from 'svelte/transition';

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
    editing.answer =
      editing.type === 'multiple' ? correct : correct[0];
    questions.update((list) => {
      const idx = list.findIndex((q) => q.id === editing!.id);
      if (idx >= 0) {
        const copy = [...list];
        copy[idx] = editing!;
        return copy;
      }
      return [...list, editing!];
    });
    console.debug('Saved question', editing.id);
    await saveQuestionBank();
    dlg?.close();
    editing = null;
  }

  /**
   * Delete a question by id.
   */
  async function remove(id: number) {
    questions.update(list => list.filter(q => q.id !== id));
    await saveQuestionBank();
  }
</script>

<main>
  <h1>Question Bank</h1>
  {#if $questions.length === 0}
    <p>No questions loaded. <a href="/import-questionbank">Import a file</a>.</p>
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
          <th>Images</th>
          <th>Subject</th>
          <th>Source</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each $filtered as q (q.id)}
          <tr transition:fade>
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
      <input bind:value={editing.question} />
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


