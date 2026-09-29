# Paige — PWS V0.11

An iPhone-friendly character chat app hosted on GitHub Pages. Paige is an adult massage therapist with a warm, quirky voice and a lightly flirtatious tone when welcomed.

## Features

- Chat with a short opening scene and Paige's portrait in the header and replies
- Regenerate and Continue controls, plus copy and text export
- Editable character prompt and optional user-written memory
- Conversation history saved locally in this browser
- Installable web app with an offline shell
- AI requests sent to a Cloudflare Worker, which holds the OpenAI API key as a server-side secret

## Live site

https://imalumberjacklikemydad.github.io/Paige/

The site and Worker are separate deployments. Publishing this repository updates the GitHub Pages frontend; it does not automatically replace the Worker running on Cloudflare.

## Privacy and deployment

Never put an OpenAI API key in frontend settings, JavaScript or this repository. Add it as the `OPENAI_API_KEY` secret in Cloudflare. Chat history and memory live in this browser's local storage; changing devices or clearing site data may remove them. Export a conversation before clearing browser data.

The Worker endpoint is reachable from the public site and should be treated as a private prototype. Origin checks alone do not authenticate callers or cap API spending; add appropriate access and usage limits before inviting others to use it.

## Current behaviour

Paige's default prompt now prioritizes the latest visitor turn, follows topic changes and avoids reviving old conversational hooks. It is also tuned for scene narration alongside dialogue, fresh conversational follow-ups and less repetition. It retains a grounded, candid voice, unhurried chemistry and careful scene awareness: Paige responds to spoken dialogue and observable actions, not private visitor narration. Existing untouched default prompts migrate automatically; custom prompts remain intact. Existing untouched default prompts are migrated automatically. A prompt you edited yourself remains yours. The frontend sends the conversation context and character instructions in the `message` field expected by the currently deployed Worker.
