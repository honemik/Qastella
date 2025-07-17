<script lang="ts">
  import { questions, type Question } from '$lib/stores/questions';
  import { goto } from '$app/navigation';
  import { get } from 'svelte/store';
  import { fade } from 'svelte/transition';

  let questionText = '';
  let answerValue = '';
  let options: Record<string, string> = { A: '', B: '' };
  let images: string[] = [];
  let source = '';
  let subject = '';

  function clearForm() {
    questionText = '';
    answerValue = '';
    options = { A: '', B: '' };
    images = [];
    source = '';
    subject = '';
  }

  function addOption() {
    const letters = Object.keys(options);
    const next = letters.length
      ? String.fromCharCode(Math.max(...letters.map(l => l.charCodeAt(0))) + 1)
      : 'A';
    options = { ...options, [next]: '' };
  }

  function removeOption(key: string) {
    const { [key]: _removed, ...rest } = options;
    options = rest;
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => {
        images = [...images, reader.result as string];
      };
      reader.readAsDataURL(f);
    });
  }

  function handlePaste(e: ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const it of items) {
      if (it.type.startsWith('image/')) {
        const f = it.getAsFile();
        if (f) handleFiles({ 0: f, length: 1, item: () => f } as unknown as FileList);
      }
    }
  }

  function onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    handleFiles(input.files);
    input.value = '';
  }

  function removeImage(i: number) {
    images = images.filter((_, idx) => idx !== i);
  }

  function save(ev?: Event, redirect = true) {
    const list = get(questions);
    const id = Math.max(0, ...list.map(q => q.id)) + 1;
    const q: Question = {
      id,
      type: 'single',
      question: questionText,
      options,
      answer: answerValue,
      images,
      source,
      subject
    };
    questions.set([...list, q]);
    if (redirect) {
      goto('/question-bank');
    } else {
      clearForm();
    }
  }
</script>

<main on:paste={handlePaste}>
  <h1>Add Question</h1>
  <form on:submit|preventDefault={save}>
    <label>
      Question
      <textarea rows="5" bind:value={questionText}></textarea>
    </label>

    {#if Object.keys(options).length}
      {#each Object.entries(options) as [key, val]}
        <label>
          {key}: <input bind:value={options[key]} />
          <button type="button" on:click={() => removeOption(key)}>x</button>
        </label>
      {/each}
    {/if}
    <button type="button" on:click={addOption}>Add Option</button>

    {#if images.length}
      <div class="images thumbs">
        {#each images as img, i (i)}
          <div class="img-wrapper" transition:fade>
            <img src={img} alt="question image {i}" />
            <button type="button" on:click={() => removeImage(i)}>x</button>
          </div>
        {/each}
      </div>
    {/if}
    <label>
      Add Images
      <input type="file" accept="image/*" multiple on:change={onFileChange} />
    </label>

    <label>
      Answer
      <input bind:value={answerValue} />
    </label>
    <label>Source <input bind:value={source} /></label>
    <label>Subject <input bind:value={subject} /></label>
    <button type="submit">Save</button>
    <button type="button" on:click={() => save(undefined, false)}>Save & Add Another</button>
    <button type="button" on:click={() => goto('/question-bank')}>Cancel</button>
  </form>
</main>

<style>
  textarea {
    width: 100%;
    margin-bottom: 0.5rem;
  }
</style>
