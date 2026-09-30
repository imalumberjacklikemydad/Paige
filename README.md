# Paige — PWS V0.16 (local trial)

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

## Run Paige locally on HOMEPC

This trial uses the existing chat interface with Ollama on your PC. It does not require an OpenAI API key or change the public Cloudflare Worker.

1. Install [Node.js LTS](https://nodejs.org/en/download) if `node --version` does not work in PowerShell. Ollama must also be running with the model `hf.co/TheDrummer/Rocinante-X-12B-v1-GGUF:Q4_K_M` already downloaded.
2. Download this branch as a ZIP from GitHub and extract it to a folder, or clone the branch. In PowerShell, change to the extracted `Paige` folder (the one containing `index.html`).
3. Run `node .\local\server.mjs` and leave that PowerShell window open.
4. Open **http://127.0.0.1:8000/** on HOMEPC. The badge should say **Local model on HOMEPC**. Start a new conversation to evaluate the shorter local character prompt. If settings were previously saved on this local address, inspect the Character section and reset it to the default local prompt if needed.

The server listens only on `127.0.0.1:8000` and sends chat requests to Ollama on the same PC. Conversation history remains in this browser's local storage. The model can be changed in Paige Settings if it is already available in Ollama; the default is Rocinante X 12B. If Ollama cannot be reached, check it is running and that the model name matches `ollama list`.

To run five fictional dialogue checks using the actual local model, keep the server and Ollama running and open another PowerShell window in this folder. Run `node .\local\run-through.mjs`. The script prints the replies and a few basic continuity checks. It does not read your saved conversations or settings. Copy the output to share it for review; responses can vary between runs.

### Use from your iPhone privately

Once the local chat works, install Tailscale on HOMEPC and iPhone, sign both into the same tailnet, and run `tailscale serve --bg 8000` on HOMEPC. Open the private HTTPS URL printed by `tailscale serve status` on the iPhone. Keep the PC and local Node server running while chatting. Use **Serve**, not Funnel: Funnel makes a service public. The iPhone and PC use separate browser storage, so existing chats will not automatically sync. Do not forward port 8000 on your router or publish Ollama's port 11434.

## Privacy and deployment

Never put an OpenAI API key in frontend settings, JavaScript or this repository. Add it as the `OPENAI_API_KEY` secret in Cloudflare. Chat history and memory live in this browser's local storage; changing devices or clearing site data may remove them. Export a conversation before clearing browser data.

The Worker endpoint is reachable from the public site and should be treated as a private prototype. Origin checks alone do not authenticate callers or cap API spending; add appropriate access and usage limits before inviting others to use it.

## Current behaviour

PWS V0.15 restores the required `message` field for the live Cloudflare Worker while retaining the structured `system` and `messages` fields. The newest visitor turn is marked as current in both request shapes, with earlier turns labelled as background.

Paige's default prompt prioritizes the latest visitor turn, follows topic changes and avoids reviving old conversational hooks. A request for quiet takes precedence over the usual conversational follow-up, allowing her to continue with a little undemanding speech and scene narration without asking another question. Each reply now has at most one question or invitation to answer, on one topic. A genuinely needed consent or comfort check uses that one question; established pressure checks are not repeated during unrelated conversation. It is also tuned for scene narration alongside dialogue, fresh conversational follow-ups and less repetition. It retains a grounded, candid voice, unhurried chemistry and careful scene awareness: Paige responds to spoken dialogue and observable actions, not private visitor narration. Existing untouched default prompts migrate automatically. A prompt you edited yourself remains yours. The frontend sends a nonempty `message` field for the currently deployed Worker and also sends `system` and `messages` for the repository Worker version. The live Worker and repository source can differ because their deployments are separate.
