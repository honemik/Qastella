<script lang="ts">
  import { questions, type Question, type QuestionSet } from '$lib/stores/questions';
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
          const added: Question[] = [];
          for (const set of sets) {
            for (const q of set.questions) {
              added.push({
                id: q.id ?? nextId++,
                type: q.type ?? 'single',
                question: q.question,
                options: q.options,
                answer: q.answer,
                source: set.source,
                subject: set.subject,
              });
            }
          }
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
    const flat: Question[] = [];
    data.forEach((set) => {
      set.questions.forEach((q) => {
        flat.push({ ...q, source: set.source, subject: set.subject });
      });
    });
    questions.set(flat);
  }
</script>

<h1>Import Question Bank</h1>
<input type="file" accept="application/json" on:change={handleFile} />
<button on:click={loadSample}>Load Sample Questions</button>
<p>Load a JSON file with the following structure:</p>
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
