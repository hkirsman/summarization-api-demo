# Summarization API Playground

A small demo for the [Chrome Summarization API](https://developer.chrome.com/docs/ai/summarizer-api): summarize text in the browser using built-in AI (Gemini Nano), with options for type, length, format, languages, and shared context.

**Based on:** [Summarization API Playground](https://chrome.dev/web-ai-demos/summarization-api-playground/) (Chrome Web AI demos).

## Features

- **Summary type:** Key Points, TL;DR, Teaser, Headline
- **Length:** Short, Medium, Long
- **Format:** Markdown or plain text
- **Expected input languages:** English, Spanish, Japanese, Estonian (optional)
- **Output language:** Auto-detect, English, Spanish, Japanese, Estonian
- **Shared context:** Optional text to guide the summarizer (e.g. “This is a scientific article”)

## Requirements

- **Chrome 138+** (desktop). The Summarization API is built into Chrome; Gemini Nano is downloaded when you first use it.
- Enable the API if needed (e.g. via [Chrome Early Preview Program](https://developer.chrome.com/docs/ai/overview) or `chrome://flags`).
- See [Chrome’s hardware requirements](https://developer.chrome.com/docs/ai/summarizer-api#review-the-hardware-requirements) for running built-in AI (storage, RAM, etc.).

## Run locally

Open `index.html` in Chrome (e.g. drag into the browser or use a local server).

## License

Same as the original [Chrome Web AI demos](https://chrome.dev/web-ai-demos/summarization-api-playground/); this fork adds language options (including Estonian), shared context, and small UI tweaks.
