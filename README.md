# Developer Changelog

A Next.js application that automatically generates concise daily stand-up summaries from your GitHub commits using local LLMs. 

## Overview
This tool is designed to help developers quickly recall what they worked on during previous days. By authenticating with GitHub, it pulls your recent commits across any repository or branch and passes them to a local instance of Ollama to generate a readable summary of your work.

## Features
- **GitHub OAuth Integration**: Securely authenticates and fetches your repositories.
- **Commit Syncing**: Select a repository, optionally specify dates (e.g., Last 24 Hours, Last 7 Days), and sync commits reliably directly to a local SQLite database.
- **Automated Webhooks**: Automatically sync and summarize your code in the background! Just point a GitHub Webhook at `/api/webhooks/github` to trigger syncs on every `git push`.
- **AI Summarization**: Supports any AI LLM! Keep your code local using **Ollama** or plug in an **OpenAI-Compatible Custom API Key** (OpenAI, Groq, Together, DeepSeek) to summarize technical commits into plain English.
- **Privacy First**: Designed for local setups and isolated dashboard views to ensure your project internals stay private during screen-shares.

## Prerequisites
- Node.js 18 or higher
- A GitHub OAuth app (for authentication credentials)
- Ollama installed locally (or accessible via your network) with an active model, e.g., llama3.2

## Getting Started

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Set up your environment variables. Copy `.env.example` to `.env.local` and add your GitHub credentials and NextAuth secret.
```bash
cp .env.example .env.local
```

3. Initialize the database and run Prisma migrations:
```bash
npx prisma generate
npx prisma db push
```

4. Start the development server:
```bash
npm run dev
```

5. Open http://localhost:3000 in your browser to start using the app.

## Configuration
Inside the application, navigate to the Settings page to configure your Ollama endpoint and preferred model. By default, the application will attempt to connect to standard local Ollama settings (http://localhost:11434 with llama3.2). Cloud provider integration (OpenAI) is planned for a future release.

## Tech Stack
- Frontend: Next.js (App Router), React, Tailwind CSS
- Database: SQLite with Prisma ORM
- Authentication: NextAuth.js (GitHub Provider)
- Integrations: GitHub API, Ollama API
