# Qastella 模擬考古

Qastella is a desktop application for managing question banks and running mock exams offline. It is built with [Tauri](https://tauri.app/) for the desktop shell and [SvelteKit](https://kit.svelte.dev/) for the user interface.

## Features

- Manage a collection of questions grouped by subject and source year
- Run mock exams with randomised questions
- Review previous exam attempts and track history
- Export or import question banks in JSON format
- Attach any number of images to a question and keep them in the JSON export
- Optional dark mode toggle

## Installation

1. Install [pnpm](https://pnpm.io/) and the Rust toolchain.
2. Install JavaScript dependencies:
   ```bash
   pnpm install
   ```
3. Start the application in development mode:
   ```bash
   pnpm tauri dev
   ```
4. Build a distributable package with:
   ```bash
   pnpm tauri build
   ```
5. Run `pnpm check` to perform type checking.

The project uses SvelteKit with `adapter-static` and Tauri 2. Most of the application logic lives in the `src` and `src-tauri` folders.

## User Guide

### Importing Questions

- Navigate to **Import Question Bank**.
- Choose a JSON file using the structure shown below or load the built‑in sample.

### Managing Your Bank

- The **Question Bank** page lists all questions.
- Edit or delete entries and click **Save Bank** to persist changes.

### Adding Questions

- Use the **Add Question** page to paste text and images when creating new questions.
- Uploaded images are embedded directly into the JSON export.

### Taking a Mock Exam

- Visit **Mock Exam** to configure how many questions to answer.
- Answer each question and press **Submit** to see your score.

### Reviewing History

- The **History** page shows previous exam attempts.
- Click an attempt to view answers or delete unwanted records.

### Settings

- Change the data directory where question banks and history are saved.
- Export all questions and history as a backup.
- Toggle dark mode.
- Reset the question bank to an empty state.

## Question Bank Format

A question bank is stored as JSON where questions are grouped by subject and source. Each question object supports optional images and text options.

```json
{
  "subjects": {
    "Biology": {
      "2024": [
        {
          "id": 1,
          "type": "single",
          "question": "1+1=?",
          "options": { "A": "1", "B": "2" },
          "answer": "B",
          "images": ["data:image/png;base64,..."]
        }
      ]
    }
  }
}
```

The application will automatically convert between this format and the flat list used internally.
