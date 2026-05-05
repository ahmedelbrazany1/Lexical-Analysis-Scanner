<div align="center">

# SET224 Lexical Scanner Visualizer

### Interactive learning platform for lexical analysis in compiler design

[![Live Website](https://img.shields.io/badge/Live%20Website-set224.ecus.dev-0ea5e9?style=for-the-badge&logo=googlechrome&logoColor=white)](https://set224.ecus.dev)
[![React](https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

## Project Idea

This project is an educational visualizer for **Compiler Design (SET224)**.  
It demonstrates lexical analysis (scanner phase) step by step with animated tokenization, source highlighting, and live execution logs.

The goal is to make scanner behavior easier to understand through visual interaction instead of static theory.

## Website

- Official URL: **https://set224.ecus.dev**
- Direct link: [Go to Website](https://set224.ecus.dev)

## What This Visualizer Does

- Scans C++-like source code character by character.
- Detects and emits tokens incrementally.
- Highlights the active character during scanning.
- Maps execution to `scanner.cpp` logic lines in real time.
- Displays live console messages that explain each operation.

## Supported Token Types

- `KEYWORD`
- `IDENTIFIER`
- `NUMBER`
- `SYMBOL`
- `MESSAGE` (string literal)
- `UNKNOWN`

## UI and Controls Highlights

- Modern glass-style interface with terminal-inspired panels.
- `Run` to auto-play scan steps.
- `Step` for manual one-step execution.
- `Pause` to stop execution at current step.
- `Reset` to clear generated steps and restart flow.
- `Clear` to wipe editor content.
- Speed slider from `0.5x` to `3.0x`.
- Real-time token stream with color-coded categories.
- Progress bar and live scan logs.

## Team

- Supervisor: **Dr. Hossam Reda**

### Team Members

- Abdelaziz Amir `192300477`
- Mohammed Amr `192300311`
- Ahmed Elbrazany `192300475`
- Abdallah Mousa `192300370`
- Ahmed Abdelaziz `192300312`
- Youssef Mohamed `192200179`

## Run Locally

### Prerequisites

- Node.js 18 or newer
- npm (or Bun)

### Using npm

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:5173
```

### Additional Scripts

```bash
npm run build       # Production build
npm run build:dev   # Development-mode build
npm run preview     # Preview production build locally
npm run lint        # Run ESLint
npm run test        # Run tests once
npm run test:watch  # Run tests in watch mode
```

### Using Bun (Optional)

```bash
bun install
bun run dev
```

## Project Structure (Key Files)

```text
src/pages/Index.tsx      # Landing page
src/pages/Compiler.tsx   # Main scanner visualizer UI
src/lib/scanner.ts       # Scanner logic + step generation
```

## Screenshots Placeholder

Add screenshots in:

```text
docs/images/
```

### Home Page
![Home](https://raw.githubusercontent.com/ahmedelbrazany1/Lexical-Analysis-Scanner/main/docs/images/showcase_home.png)

### Compiler Page
![Searching](https://raw.githubusercontent.com/ahmedelbrazany1/Lexical-Analysis-Scanner/main/docs/images/showcase_test.png)

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui + Radix UI
- TanStack Query
- Vitest + Testing Library
