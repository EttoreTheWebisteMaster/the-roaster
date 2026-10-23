<h1 align="center">The Roaster</h1>

<p align="center">
  An AI stand-up comedian that chats with you, gets to know you, and then roasts you.
</p>

<p align="center">
  <a href="https://the-roaster.vercel.app/"><strong>Try it live</strong></a> ·
  <a href="https://www.ettoreserra.it/projects/the-roaster">Case study</a> ·
  <a href="https://www.ettoreserra.it">Portfolio</a>
</p>

<p align="center">
  <img src="https://www.ettoreserra.it/img/projects/the-roaster/roaster.png" alt="The Roaster on stage" width="720" />
</p>

---

## Overview

Most AI assistants smile and agree with everything. The Roaster talks back.

He's a tall, bald comedian dressed in black, standing under a spotlight in a comedy club. He opens with small talk, the way a comic does crowd work: where you're from, what you do. Then he builds tension, and when you contradict yourself, get defensive or start trash-talking, he lands a short, sharp punchline.

The project is an experiment in **AI personality design**: getting a language model to have comedic timing, not just jokes.

| | |
|---|---|
| **Date** | October 2025 |
| **Role** | UX/UI Designer, Developer |
| **Deliverable** | Website |

## How it works

### The personality
The Roaster runs on Gemini 2.5 Flash with a detailed system prompt that works as a script for his behavior:

- **Escalation phases**: *hook* (friendly questions, no roasting) → *tease* (light jabs) → *pressure* (spotting contradictions) → *strike* (one punchline + one taunt) → *battle* (only if you escalate) → *reset*.
- **Triggers** for a roast: embarrassing admissions, contradictions, over-explaining, ALL-CAPS aggression.
- **Hard length limits**: max 25 words per message, punchlines of 7 words or fewer, so replies read like stand-up, not paragraphs.
- **Opening line**: a separate endpoint generates a short bait question to start the conversation, so every session opens differently.

### The stage
- A full-screen illustrated comedian whose pose follows the conversation: **lights off** while idle, **thinking** (two alternating frames) while the model responds, **talking** when the reply arrives
- A looping comedy-club soundtrack that starts on first click
- A chat input styled as an audience heckle ("Roast me...")
- Images are preloaded so pose changes don't flicker

<p align="center">
  <img src="https://www.ettoreserra.it/img/projects/the-roaster/chat.png" alt="Chat with The Roaster" width="720" />
</p>

## Tech stack

| Area | Tools |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/) |
| AI | [Google Gemini](https://ai.google.dev/) (`gemini-2.5-flash`) via [`@google/genai`](https://www.npmjs.com/package/@google/genai) |
| UI | [Tailwind CSS 4](https://tailwindcss.com/), [Headless UI](https://headlessui.com/), [Heroicons](https://heroicons.com/) |
| Hosting | [Vercel](https://vercel.com/) |

## Project structure

```
src/app/
  page.tsx                # Stage, chat UI, pose animation, soundtrack
  layout.tsx
  api/
    chat/init/route.ts    # GET  → generates the opening line
    chat/route.ts         # POST → sends message + history, returns the reply
    response/route.ts     # POST → single-shot roast (earlier version, not used by the UI)
public/
  img/                    # The Roaster poses (lights off, thinking, talking)
  audio/soundtrack.mp3
```

## Getting started

### Prerequisites
- Node.js 18.18+
- A [Gemini API key](https://aistudio.google.com/apikey)

### Setup

```bash
git clone https://github.com/EttoreTheWebisteMaster/the-roaster.git
cd the-roaster
npm install
```

Create a `.env.local` file:

```bash
GEMINI_API_KEY=your-key-here
```

The `@google/genai` client reads `GEMINI_API_KEY` from the environment automatically.

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click anywhere to start the soundtrack.

### Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | Lint with ESLint |

## API

| Endpoint | Method | Body | Response |
|---|---|---|---|
| `/api/chat/init` | `GET` | — | `{ firstMessage }` |
| `/api/chat` | `POST` | `{ message, history?: { role: "user" \| "model", text }[] }` | `{ reply }` |

The conversation history lives on the client and is sent with each request, so the server is stateless.

## Author

**Ettore Serra** — Developer & designer

- Portfolio: [ettoreserra.it](https://www.ettoreserra.it)
- GitHub: [@EttoreTheWebisteMaster](https://github.com/EttoreTheWebisteMaster/)
- LinkedIn: [ettore-serra-developer](https://www.linkedin.com/in/ettore-serra-developer/)
- Instagram: [@ett.re](https://www.instagram.com/ett.re/)
