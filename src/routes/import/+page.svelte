<script lang="ts">
  import { questions, type Question } from '$lib/stores/questions';

  function handleFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (Array.isArray(data.questions)) {
          const list: Question[] = data.questions.map((q: any, i: number) => ({
            id: q.id ?? i + 1,
            type: q.type ?? 'single',
            question: q.question,
            options: q.options,
            answer: q.answer,
            source: data.source,
            subject: data.subject,
          }));
          questions.set(list);
        }
      } catch (e) {
        console.error('Failed to parse', e);
      }
    };
    reader.readAsText(file);
  }
</script>

<h1>Import Questions</h1>
<input type="file" accept="application/json" on:change={handleFile} />
<p>Load a JSON file with the following structure:</p>
<pre>{@html `{
  "source": "110年醫學四",
  "subject": "生理學",
  "questions": [
    { "id": 1, "type": "single", "question": "...", "options": {"A":"..."}, "answer": "A" }
  ]
}`}</pre>

<a href="/questions">View Questions</a>

<style>
pre {
  background-color: #eee;
  padding: 1em;
}
</style>
