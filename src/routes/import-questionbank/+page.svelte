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
   * Import questions from a user selected JSON file and merge them into the
   * current question list.
   */
  function handleFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(reader.result as string) as unknown;
        if (!isValidQuestionBank(raw)) {
          throw new Error('Invalid question bank format');
        }
        const bank = raw as QuestionBank;
        questions.update((existing) => {
          let nextId = Math.max(0, ...existing.map((q) => q.id)) + 1;
          const flat = flattenBank(bank);
          const added: Question[] = flat.map((q) => ({
            ...q,
            id: nextId++,
            type: q.type ?? 'single'
          }));
          return [...existing, ...added];
        });
        saveQuestionBank();
      } catch (e) {
        console.error('Failed to import', e);
      }
    };
    reader.readAsText(file);
  }

  /**
   * Load the built in sample questions using a backend call.
   */
  async function loadSample() {
    const data = (await invoke('sample_questions')) as QuestionBank;
    questions.update((existing) => [
      ...existing,
      ...flattenBank(data)
    ]);
    saveQuestionBank();
  }
</script>

<main>
  <h1>Import Question Bank</h1>
  <input type="file" accept="application/json" on:change={handleFile} />
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


