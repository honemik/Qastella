<script lang="ts">
  import {
    questions,
    type Question,
    type QuestionBank,
    flattenBank,
    isValidQuestionBank,
    withQuestionBatch
  } from '$lib/stores/questions';
  import { invoke } from '@tauri-apps/api/core';
  import { addToast } from '$lib/stores/toast';

  /**
   * Import questions from user selected JSON file(s) and merge them into the
   * current question list.
   */
  async function handleFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;
    console.info('Importing', files.length, 'file(s)');

    const banks: QuestionBank[] = [];
    for (const file of Array.from(files)) {
      try {
        const text = await file.text();
        const raw = JSON.parse(text) as unknown;
        if (!isValidQuestionBank(raw)) {
          throw new Error('Invalid question bank format');
        }
        banks.push(raw as QuestionBank);
        console.info('Parsed', file.name);
      } catch (e) {
        console.error('Failed to import', file.name, e);
        addToast(`Failed to import ${file.name}`);
      }
    }

    if (banks.length === 0) {
      addToast('No valid question banks were imported');
      return;
    }

    let importedCount = 0;
    await withQuestionBatch(() => {
      questions.update((existing) => {
        let nextId = Math.max(0, ...existing.map((q) => q.id)) + 1;
        const added: Question[] = banks
          .flatMap((b) => flattenBank(b))
          .map((q) => ({
            ...q,
            id: nextId++,
            type: q.type ?? 'single'
          }));
        importedCount = added.length;
        return [...existing, ...added];
      });
    });

    console.info('Imported', importedCount, 'questions from', banks.length, 'file(s)');
    addToast(`Imported ${importedCount} questions from ${banks.length} file(s)`);
  }

  /**
   * Load the built in sample questions using a backend call.
   */
  async function loadSample() {
    try {
      console.info('Loading sample questions');
      const data = (await invoke('sample_questions')) as QuestionBank;
      let importedCount = 0;
      await withQuestionBatch(() => {
        questions.update((existing) => {
          let nextId = Math.max(0, ...existing.map((q) => q.id)) + 1;
          const added: Question[] = flattenBank(data).map((q) => ({
            ...q,
            id: nextId++,
            type: q.type ?? 'single'
          }));
          importedCount = added.length;
          return [...existing, ...added];
        });
      });
      console.info('Loaded', importedCount, 'sample questions');
      addToast(`Loaded ${importedCount} sample questions`);
    } catch (e) {
      console.error('Failed to load sample questions', e);
      addToast('Failed to load sample questions');
    }
  }
</script>

<main>
  <h1>Import Question Bank</h1>
  <input type="file" accept="application/json" multiple on:change={handleFile} />
  <button on:click={loadSample}>Load Sample Questions</button>
  <p>
    Select a JSON file with the following structure. Questions are grouped by
    subject and then by source year.
  </p>
  <pre>{@html `{"subjects":{
  "General":{
    "Sample":[
      {"id":1,"type":"single","question":"1+1=?","options":{"A":"1","B":"2"},"answer":"B"}
    ]
  }
}}`}</pre>
</main>


