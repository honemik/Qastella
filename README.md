# Qastella

Qastella is a desktop application for managing question banks and running mock exams offline. It is built with [Tauri](https://tauri.app/) for the desktop shell and [SvelteKit](https://kit.svelte.dev/) for the user interface.

## Features

- Import questions from a JSON file
- Create and edit questions directly in the app
- Run randomized mock exams with score tracking
- Review previous exam attempts and see overall statistics
- Export your question bank and history for backup

## Development

Qastella uses `pnpm` for managing JavaScript dependencies and the Tauri CLI for building the desktop application.

1. Install Node.js, Rust and the Tauri prerequisites from the [Tauri docs](https://tauri.app/).
2. Install JavaScript dependencies:
   ```bash
   pnpm install
   ```
3. Start the application in development mode:
   ```bash
   pnpm tauri dev
   ```
4. Run type checking with:
   ```bash
   pnpm check
   ```

## Building

To create a release build for your platform run:

```bash
pnpm tauri build
```

The generated binaries will be placed in `src-tauri/target/release/bundle`.

## Question File Format

Question banks are imported from a JSON file with the following structure:

```json
{
  "source": "110\u5e74\u91ab\u5b78\u56db",
  "subject": "\u751f\u7406\u5b78",
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
```

Each question may optionally specify `subject` or `source` to allow filtering when creating a mock exam.

## License

This project is licensed under the MIT License.
