<script lang="ts">
  import {
    questions,
    type Question,
    type QuestionSet,
    flattenQuestionSets
  } from '$lib/stores/questions';
  import { invoke } from '@tauri-apps/api/core';

  function handleFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(reader.result as string);
        const sets: QuestionSet[] = Array.isArray(raw) ? raw : [raw];
        questions.update((existing) => {
          let nextId = Math.max(0, ...existing.map((q) => q.id)) + 1;
          const flat = flattenQuestionSets(sets);
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
    const data = (await invoke('sample_questions')) as QuestionSet[];
    questions.set(flattenQuestionSets(data));
  }
</script>

<h1>Import Question Bank</h1>
<input type="file" accept="application/json" on:change={handleFile} />
<button on:click={loadSample}>Load Sample Questions</button>
<p>Select a JSON file containing one or more question sets. Each set may include
optional <code>source</code> and <code>subject</code> fields and a
<code>questions</code> array as shown below:</p>
<pre>{@html `[
  {
    "source": "110年醫學四",
    "subject": "生理學",
    "questions": [
      { "id": 1, "type": "single", "question": "...", "options": {"A": "..."}, "answer": "A" }
    ]
  }
]`}</pre>

<a href="/question-bank">View Questions</a>

<style>
pre {
  background-color: #eee;
  padding: 1em;
}
</style>
