<script lang="ts">
  import {
    questions,
    type Question,
    type QuestionBank,
    flattenBank,
    saveQuestionBank
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
        const raw = JSON.parse(reader.result as string) as QuestionBank;
        if (!raw || typeof raw !== 'object' || !raw.subjects) {
          throw new Error('Invalid question bank format');
        }
        questions.update((existing) => {
          let nextId = Math.max(0, ...existing.map((q) => q.id)) + 1;
          const flat = flattenBank(raw);
          const added: Question[] = flat.map((q) => ({
            ...q,
            id: q.id ?? nextId++,
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
  "生理學":{
    "110年醫學四":[
      {"id":1,"type":"single","question":"...","options":{"A":"..."},"answer":"A"}
    ]
  }
}}`}</pre>
</main>


