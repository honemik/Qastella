# Tauri + SvelteKit + TypeScript

This template should help get you started developing with Tauri, SvelteKit and TypeScript in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer).

## Importing Questions

1. Open the **Import Question Bank** page in the app.
2. Choose a JSON file with one or more question sets.
3. Each set can optionally specify `source` and `subject` and contains a `questions` array.
4. The imported questions will be added to the existing bank.

Example file:

```json
[
  {
    "source": "110年醫學四",
    "subject": "生理學",
    "questions": [
      {
        "id": 1,
        "type": "single",
        "question": "Example?",
        "options": { "A": "Yes", "B": "No" },
        "answer": "A"
      }
    ]
  }
]
```
