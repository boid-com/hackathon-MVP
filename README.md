Synk.build – Hackathon MVP

What the project is

Synk.build is an AI-assisted starter tool for “vibe coders.” It helps anyone turn a rough app idea into a structured product spec in minutes. The MVP simulates a virtual Product Manager who interviews the user, clarifies the idea, exposes missing details, and outputs a clean specification document with user stories. The output is intended to be used directly inside vibe-coding tools or as a starting point for Synk.build’s future node-based app builder.

Why it was built

Good ideas stall because early-stage creators get stuck defining scope, user flows, and data structures. This tool removes that friction. The goal is to give creators a fast path from concept to clarity, so they spend less time guessing and more time building. The hackathon MVP focuses on just the Product Manager experience so the core interaction loop can be validated quickly.

How to run it
	1.	Clone the repo
	2.	Install dependencies (npm install or bun install)
	3.	Add your OpenAI / VertexAI key to .env
	4.	Start the dev server (npm run dev or equivalent)
	5.	Open the local URL to begin the interactive PM session

The project is frontend-only for now. Everything runs in the browser and communicates with the LLM endpoint you configure.

What works today
	•	Simple landing UI
	•	User enters an app idea
	•	Virtual PM expands the idea into a short spec
	•	User can refine or change details
	•	PM then walks through:
	•	Requirements
	•	Core features
	•	User stories
	•	Basic UI flow
	•	Final spec is generated as a downloadable document
	•	Entire flow takes about three minutes from start to finish

What you’d add with more time
	•	Persistent sessions and saved project history
	•	A richer PM loop with branching flows for complex apps
	•	Lightweight mockup generation to visualize screens
	•	Automatic generation of ERD-style data models
	•	Integration with the full Synk.build node system
	•	Export to TypeScript / JSON schemas
	•	Multi-agent reasoning (PM + architect + UX designer)
	•	A public share link for each generated spec
	•	Account system and cloud sync
	•	More polished UI aligned fully with Synk’s solarpunk aesthetic


# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1EOkbjLQIjYO9AxrvxgXqB4M4QMu3o5oN

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
