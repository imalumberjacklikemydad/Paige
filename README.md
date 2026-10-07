# Paige and Saige — PWS V0.18.0 (local trial)

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

To run six fictional dialogue checks using the actual local model, keep the server and Ollama running and open another PowerShell window in this folder. Run `node .\local\run-through.mjs`. The script prints the replies and saves a UTF-8 `paige-run-through.txt` report in the main Paige folder, with a few basic continuity checks. It does not read your saved conversations or settings. Copy the output to share it for review; responses can vary between runs. The report also shows the server version and question counts. V0.16.9 removes the second model editing request because it could invent facts. Model replies are shown unchanged, with one-question behaviour instructed in the prompt and checked in the report. These checks are limited clues; they cannot establish that a response is coherent or faithful to the scene. Restart the local server after updating its files.

### Use from your iPhone privately

Once the local chat works, install Tailscale on HOMEPC and iPhone, sign both into the same tailnet, and run `tailscale serve --bg 8000` on HOMEPC. Open the private HTTPS URL printed by `tailscale serve status` on the iPhone. Keep the PC and local Node server running while chatting. Use **Serve**, not Funnel: Funnel makes a service public. The iPhone and PC use separate browser storage, so existing chats will not automatically sync. Do not forward port 8000 on your router or publish Ollama's port 11434.

## Privacy and deployment

Never put an OpenAI API key in frontend settings, JavaScript or this repository. Add it as the `OPENAI_API_KEY` secret in Cloudflare. Chat history and memory live in this browser's local storage; changing devices or clearing site data may remove them. Export a conversation before clearing browser data.

The Worker endpoint is reachable from the public site and should be treated as a private prototype. Origin checks alone do not authenticate callers or cap API spending; add appropriate access and usage limits before inviting others to use it.

## Current behaviour

PWS V0.15 restores the required `message` field for the live Cloudflare Worker while retaining the structured `system` and `messages` fields. The newest visitor turn is marked as current in both request shapes, with earlier turns labelled as background.

Paige's default prompt prioritizes the latest visitor turn, follows topic changes and avoids reviving old conversational hooks. A request for quiet takes precedence over the usual conversational follow-up, allowing her to continue with a little undemanding speech and scene narration without asking another question. Each reply now has at most one question or invitation to answer, on one topic. A genuinely needed consent or comfort check uses that one question; established pressure checks are not repeated during unrelated conversation. It is also tuned for scene narration alongside dialogue, fresh conversational follow-ups and less repetition. It retains a grounded, candid voice, unhurried chemistry and careful scene awareness: Paige responds to spoken dialogue and observable actions, not private visitor narration. Existing untouched default prompts migrate automatically. A prompt you edited yourself remains yours. The frontend sends a nonempty `message` field for the currently deployed Worker and also sends `system` and `messages` for the repository Worker version. The live Worker and repository source can differ because their deployments are separate.

### Local character profile (V0.16.8)

The local default now includes Paige’s original appearance, relaxed clothing, private practice, alternative interests, room, caring personality and attraction preferences. These remain background character facts rather than a checklist to repeat in every reply. Chemistry stays gradual and responsive to the established adult visitor. The previous untouched local default upgrades automatically; custom prompts and saved conversations are preserved.

### Conversation correction (V0.16.9)

The complete character background is retained more concisely, with examples of dialogue pacing. Current-turn rules follow the background so arrival, quiet and topic changes remain prominent. The report now flags invented visitor body language and common cases of claiming the visitor’s D&D character, and includes a further subject change. Custom prompts and saved conversations remain preserved.

### Quiet-request fix (V0.16.10)

Explicit quiet detection now recognizes “sit quietly” and “don’t ask me anything”, including curly apostrophes. The stronger quiet instructions were previously skipped for the scripted test wording. Current-turn instructions also clarify direct timing answers and prohibit stacking a reassurance question after a conversational question. The character profile and unchanged model output are retained.

### Natural question pacing (V0.16.11)

The local default now prioritizes one conversational thread rather than a strict question-mark limit. Short related pairs such as “What happened? You okay?” are allowed. Quiet requests still require no questions. Run-through counts are descriptive and cannot judge whether questions are related. Existing unchanged local defaults migrate; custom prompts are preserved.

### Scenario menu (V0.17.0)

The + button opens a menu with 16 new scenarios and the original studio arrival. Each has its own role, setting and opening message. Choosing a scenario saves the current conversation under Saved chats in the menu; select it to resume. Saved conversations and settings stay in this browser. A first visit opens the menu automatically. Non-studio scenarios override the default massage occupation and setting while retaining Paige’s appearance and personality. No model request is needed to display the menu or opening.

### Saige: Room to Talk (V0.18.0)

The + menu now includes **Saige · Room to Talk**, a separate AI conversation companion for venting and reflection. Her style keeps Paige's warmth and dry humour but removes flirtation, roleplay scenes, massage and alternative medicine. She listens before offering solutions, follows requests for no advice or questions when safe, and can help find a small practical step when invited. She is not presented as a psychologist or therapist.

Saige has a separate built-in prompt, enforced by the local server, and a calmer temperature cap of 0.7. Her chat history is saved and resumed using the same scenario menu but is never combined with Paige's messages. Written memory is separate: Settings shows Saige memory only while she is selected, and it is off by default. There is no automatic extraction of personal facts. Connection, model and reading-voice settings are shared. Existing Paige chats, custom prompts and written memory are preserved. Saige's identity is shown as an S badge; no new portrait is required.

A short notice and expandable Human support links appear in Saige chats. Instructions distinguish ordinary venting from possible danger and include Australian support contacts. These are prompt instructions, not a guarantee of a local model's clinical judgement or crisis detection. The app cannot monitor you or summon help. It supports conversations between professional appointments, not treatment. Browser storage is accessible to anyone using the same browser profile; the local model and server do not make this clinical confidentiality.

To update HOMEPC, stop the old server with Ctrl+C, download and extract the updated **local-ollama-trial** branch, then run `node .\local\server.mjs` from the new folder. Open the same **http://127.0.0.1:8000/** address and refresh. The version should read **PWS V0.18.0**. Chats stored in that browser at that address stay available. Choose +, then **Saige · Room to Talk**. Do not clear browser data to update.

For a real model check on HOMEPC, keep Ollama and the server running and use another PowerShell window in the app folder: `node .\local\saige-run-through.mjs`. It uses fictional examples, prints the responses and writes `saige-run-through.txt`. Read those replies manually before relying on this mode; checks cover venting, unwanted questions, practical support, boundaries, clinical questions and danger. No saved personal chat data is read.

Design sources checked 7 October 2026:

- Beyond Blue: [talking and listening](https://www.beyondblue.org.au/get-support/support-someone/how-to-talk-to-someone-about-their-mental-health).
- Queensland Health: [conversations with a mate about mental health](https://www.health.qld.gov.au/newsroom/features/how-to-have-a-conversation-with-a-mate-about-mental-health).
- MensLine Australia: [professional support for men](https://mensline.org.au/phone-and-online-counselling/).
- Lifeline: [crisis support and emergency contacts](https://www.lifeline.org.au/131114).

App routing, settings and storage are verified with mocked model replies. Real Ollama behaviour must be checked on HOMEPC; this release does not claim a validated therapeutic system.

Developer routing checks (no extra dependencies): `node .\local\test-personas.mjs`. These use a fake Ollama reply, not a clinical or real-model test. Browser visual verification was unavailable in the build environment.
