import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PAIGE_PORT || 8000);
const model = process.env.PAIGE_MODEL || 'hf.co/TheDrummer/Rocinante-X-12B-v1-GGUF:Q4_K_M';
const ollamaURL = process.env.PAIGE_OLLAMA_URL || 'http://127.0.0.1:11434/api/chat';
const allowedFiles = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/styles.css', ['styles.css', 'text/css; charset=utf-8']],
  ['/sw.js', ['sw.js', 'text/javascript; charset=utf-8']],
  ['/manifest.webmanifest', ['manifest.webmanifest', 'application/manifest+json']],
  ['/assets/paige-avatar.webp', ['assets/paige-avatar.webp', 'image/webp']]
]);

function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(type.startsWith('application/json') ? JSON.stringify(body) : body);
}

async function readJSON(req) {
  let data = '';
  for await (const chunk of req) {
    data += chunk;
    if (data.length > 1024 * 1024) throw new Error('Request is too large.');
  }
  return JSON.parse(data);
}

const server = http.createServer(async (req, res) => {
  const path = new URL(req.url || '/', 'http://localhost').pathname;
  if (path === '/api/chat' && req.method === 'POST') {
    // The server listens on loopback; browsers on other sites cannot call this JSON endpoint.
    if (req.headers['sec-fetch-site'] === 'cross-site' || !req.headers['content-type']?.startsWith('application/json')) {
      return send(res, 403, { error: 'Only same-site JSON requests are accepted.' });
    }
    let body;
    try { body = await readJSON(req); }
    catch { return send(res, 400, { error: 'Invalid or oversized JSON request.' }); }
    const messages = (Array.isArray(body.messages) ? body.messages : [])
      .filter(m => m && ['user', 'assistant'].includes(m.role) && typeof m.content === 'string')
      .slice(-16).map(m => ({ role: m.role, content: m.content.slice(0, 8000) }));
    if (!messages.length || messages.at(-1).role !== 'user') {
      return send(res, 400, { error: 'Please send a message.' });
    }
    const system = String(body.system || '').slice(0, 12000);
    try {
      const upstream = await fetch(ollamaURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: String(body.model || model).slice(0, 200),
          stream: false,
          messages: [{ role: 'system', content: system }, ...messages],
          options: { temperature: Math.min(1.4, Math.max(0, Number(body.temperature) || 0.8)), num_ctx: 8192, num_predict: 700 }
        }),
        signal: AbortSignal.timeout(180000)
      });
      const result = await upstream.json();
      if (!upstream.ok) return send(res, 502, { error: result.error || `Ollama returned ${upstream.status}.` });
      const text = result.message?.content?.trim();
      if (!text) return send(res, 502, { error: 'Ollama returned no text.' });
      return send(res, 200, { text });
    } catch {
      return send(res, 502, { error: 'Could not reach Ollama. Check that it is running and the model has downloaded.' });
    }
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error: 'Method not allowed.' });
  const file = allowedFiles.get(path);
  if (!file) return send(res, 404, { error: 'Not found.' });
  try {
    const data = await readFile(join(root, file[0]));
    res.writeHead(200, { 'Content-Type': file[1], 'Content-Length': data.length, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    return res.end(req.method === 'HEAD' ? undefined : data);
  } catch { return send(res, 500, { error: 'Could not read site file.' }); }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Paige is ready at http://127.0.0.1:${port}/`);
  console.log(`Using Ollama model: ${model}`);
});
