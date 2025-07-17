# Qastella

Qastella is a desktop application for managing question banks and running mock exams offline. It is built with [Tauri](https://tauri.app/) for the desktop shell and [SvelteKit](https://kit.svelte.dev/) for the user interface.

## Features

- Manage a collection of questions grouped by subject and source year
- Run mock exams with randomised questions
- Review previous exam attempts and track history
- Export or import question banks in JSON format
- Attach any number of images to a question and keep them in the JSON export
- Optional dark mode toggle

## Development

1. Install [pnpm](https://pnpm.io/) and the Rust toolchain.
2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Start the application in development mode:

   ```bash
   pnpm tauri dev
   ```

4. Run `pnpm check` to perform type checking.

The project uses SvelteKit with adapter-static and Tauri 2. Most of the application logic is contained in the `src` and `src-tauri` folders.

## User Guide

1. **Import Questions** – Navigate to *Import Question Bank* and choose a JSON file using the provided example structure. You can also load a built‑in sample.
2. **Manage Bank** – The *Question Bank* page lets you edit or delete questions. Remember to click *Save Bank* to persist your changes.
3. **Add Question** – Use the *Add Question* page to quickly paste text and images when creating new questions.
4. **Start Exam** – Visit *Mock Exam* to configure the number of questions and start a practice session. After submitting you will see your score.
5. **Review History** – The *History* page lists past attempts. Click an entry to see detailed answers or delete unwanted records.
6. **Settings** – Change the data directory, export your questions and history, and toggle dark mode.
