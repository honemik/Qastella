<script lang="ts">
  import {
    questions,
    type Question,
    type QuestionBank,
    flattenBank
  } from '$lib/stores/questions';
  import { invoke } from '@tauri-apps/api/core';

  function handleFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(reader.result as string) as QuestionBank;
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
      } catch (e) {
        console.error('Failed to parse', e);
      }
    };
    reader.readAsText(file);
  }

  async function loadSample() {
    const data = (await invoke('sample_questions')) as QuestionBank;
    questions.set(flattenBank(data));
  }
</script>

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

<a href="/question-bank">View Questions</a>

<style>
pre {
  background-color: #eee;
  padding: 1em;
}
</style>
