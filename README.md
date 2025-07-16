# Tauri + SvelteKit + TypeScript

This template should help get you started developing with Tauri, SvelteKit and TypeScript in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer).

## Importing Questions

1. Open the **Import Question Bank** page in the app.
2. Choose a JSON file that stores questions grouped by subject and source year.
3. The imported questions will be merged with any existing ones.

Example file:

```json
{
  "subjects": {
    "生理學": {
      "110年醫學四": [
        {
          "id": 1,
          "type": "single",
          "question": "Example?",
          "options": { "A": "Yes", "B": "No" },
          "answer": "A"
        }
      ]
    }
  }
}
```
