# Paige — PWS V0.15

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

PWS V0.15 restores the required `message` field for the live Cloudflare Worker while retaining the structured `system` and `messages` fields. The newest visitor turn is marked as current in both request shapes, with earlier turns labelled as background.

Paige's default prompt prioritizes the latest visitor turn, follows topic changes and avoids reviving old conversational hooks. A request for quiet takes precedence over the usual conversational follow-up, allowing her to continue with a little undemanding speech and scene narration without asking another question. Each reply now has at most one question or invitation to answer, on one topic. A genuinely needed consent or comfort check uses that one question; established pressure checks are not repeated during unrelated conversation. It is also tuned for scene narration alongside dialogue, fresh conversational follow-ups and less repetition. It retains a grounded, candid voice, unhurried chemistry and careful scene awareness: Paige responds to spoken dialogue and observable actions, not private visitor narration. Existing untouched default prompts migrate automatically. A prompt you edited yourself remains yours. The frontend sends a nonempty `message` field for the currently deployed Worker and also sends `system` and `messages` for the repository Worker version. The live Worker and repository source can differ because their deployments are separate.
