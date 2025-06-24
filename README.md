# Ullama Chat App

A modern, multi-model AI chat application built with Next.js, React, and Tailwind CSS. This project provides a beautiful chat interface for interacting with local Ollama models, supporting multiple conversations, markdown rendering, and model selection.

## Features
- Chat with local Ollama models (Llama 3, Gemma, Mistral, Code Llama, Phi 3, etc.)
- Multiple conversations with dynamic topic naming
- Markdown and code rendering in responses
- Responsive, modern UI with dark mode support
- Model selection per conversation

## Getting Started

### 1. Clone the Repository
```bash
git clone git@github.com:utshabeb/ullama.git
cd ullama
```

### 2. Install Dependencies
```bash
yarn install
# or
npm install
```

### 3. Start Ollama (if not already running)
Make sure you have [Ollama](https://ollama.com/) installed and running locally. You can start a model with:
```bash
ollama run llama3
```

### 4. Run the Development Server
```bash
yarn dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to use the app.

## Changing the Default Model Selection

The default model for new conversations is set in `src/app/page.tsx`:
```js
const [lastChosenModel, setLastChosenModel] = useState('llama3.2:latest');
```
To change the default, update the string (e.g., to `'mistral'`, `'gemma'`, etc.).

You can also edit the `<select>` options in the sidebar to add or remove available models.

---

## Project Structure
- `src/app/page.tsx` — Main chat UI and logic
- `src/app/layout.tsx` — App layout and metadata
- `src/app/api/ollama/route.ts` — API route for communicating with Ollama
- `public/` — Static assets
- `tailwind.config.ts` — Tailwind CSS configuration

## License
MIT
