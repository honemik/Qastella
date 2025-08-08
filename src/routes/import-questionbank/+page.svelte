<script lang="ts">
  import {
    questions,
    type Question,
    type QuestionBank,
    flattenBank,
    saveQuestionBank,
    isValidQuestionBank
  } from '$lib/stores/questions';
  import { invoke } from '@tauri-apps/api/core';

  /**
   * Import questions from user selected JSON file(s) and merge them into the
   * current question list.
   */
  async function handleFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;

    const banks: QuestionBank[] = [];
    for (const file of Array.from(files)) {
      try {
        const text = await file.text();
        const raw = JSON.parse(text) as unknown;
        if (!isValidQuestionBank(raw)) {
          throw new Error('Invalid question bank format');
        }
        banks.push(raw as QuestionBank);
      } catch (e) {
        console.error('Failed to import', file.name, e);
      }
    }

    if (banks.length === 0) return;

    questions.update((existing) => {
      let nextId = Math.max(0, ...existing.map((q) => q.id)) + 1;
      const added: Question[] = banks
        .flatMap((b) => flattenBank(b))
        .map((q) => ({
          ...q,
          id: nextId++,
          type: q.type ?? 'single'
        }));
      return [...existing, ...added];
    });

    saveQuestionBank();
  }

  /**
   * Load the built in sample questions using a backend call.
   */
  async function loadSample() {
    const data = (await invoke('sample_questions')) as QuestionBank;
    questions.update((existing) => {
      let nextId = Math.max(0, ...existing.map((q) => q.id)) + 1;
      const added: Question[] = flattenBank(data).map((q) => ({
        ...q,
        id: nextId++,
        type: q.type ?? 'single'
      }));
      return [...existing, ...added];
    });
    saveQuestionBank();
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


