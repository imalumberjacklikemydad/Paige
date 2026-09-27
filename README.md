# Paige — PWS V0.3

An iPhone-first personal AI character web app, deployed with GitHub Pages.

## V0.3

- Dark purple mobile-first interface
- OpenAI-compatible endpoint configuration
- Model, API key and temperature controls
- Editable Paige system prompt
- Connection test and configuration status
- Local chat history with new-conversation confirmation
- Optional persistent memory field
- Copy, Regenerate and Continue controls
- Conversation export to text
- Loading and error states
- Installable/offline-capable PWA shell
- GitHub Pages compatible relative paths

## Run

The app is static and can be served by GitHub Pages or any static web server. Open Paige Settings and enter an endpoint, model and API key.

## Privacy / prototype note

Conversation history, Paige memory, settings and any API key are stored in the browser's localStorage on that device. This keeps the prototype simple and private to the browser profile, but browser-side API keys are not an appropriate production credential architecture.

## Next

Planned work includes stronger structured memory, conversation management, streaming responses, optional local/on-device inference where browser support permits it, and character-creation tooling.
