// Run from the Paige folder while the local Paige server and Ollama are running:
// node .\local\run-through.mjs
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(join(root, 'app.js'), 'utf8');
const reportLines = [];
function report(line = '') { console.log(line); reportLines.push(line); }
const origin = 'http://127.0.0.1:8000';
const nodes = new Map();
let lastResult;
async function diagnosticFetch(url, options) {
  if (String(url).endsWith('/api/chat') && options?.body) {
    options = { ...options, body: JSON.stringify({ ...JSON.parse(options.body), diagnostics: true }) };
    const response = await fetch(url, options);
    lastResult = await response.clone().json();
    return response;
  }
  return fetch(url, options);
}
function node() {
  return {
    value: '', style: {}, dataset: {}, classList: { add() {} }, options: [],
    addEventListener() {}, append() {}, setAttribute() {}, replaceChildren() {},
    scrollTop: 0, scrollHeight: 0
  };
}
const context = {
  location: { hostname: '127.0.0.1', origin }, window: {}, navigator: {},
  document: {
    querySelector(selector) { if (!nodes.has(selector)) nodes.set(selector, node()); return nodes.get(selector); },
    createElement: node
  },
  localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
  requestAnimationFrame(callback) { callback(); }, setTimeout() {},
  fetch: diagnosticFetch, Date, Number, String, Array, JSON, Option: class {}, console
};
vm.createContext(context);
vm.runInContext(source, context, { filename: 'app.js' });
const opening = vm.runInContext('OPENING', context);

async function exchange(history, visitor) {
  history.push({ role: 'user', content: visitor });
  context.testHistory = history;
  lastResult = undefined;
  const reply = await vm.runInContext('requestAI(testHistory)', context);
  history.push({ role: 'assistant', content: reply });
  report(`\nYOU: ${visitor}\nPAIGE: ${reply}\n`);
  if (lastResult?.diagnostics) {
    const d = lastResult.diagnostics;
    report(`Server V${d.version}; model questions: ${d.originalQuestionCount}; shown questions: ${d.finalQuestionCount}; editing: ${d.editing || 'older server'}.`);
    if (d.revised || d.revisionFailed) report(`ORIGINAL DRAFT: ${lastResult.rawText}\n`);
    if (d.finalQuestionCount > 1) report('REVIEW  Multiple questions in the model reply; no automatic rewrite was applied.');
  } else {
    report('REVIEW  Server supplied no diagnostics. Restart the updated local server.');
  }
  return reply;
}

try {
  const check = await fetch(origin + '/');
  if (!check.ok) throw new Error(`Local Paige page returned ${check.status}.`);
  report('Paige local model run-through. These are fictional test messages; no personal chat history is read.');
  const history = [{ role: 'assistant', content: opening }];
  const replies = [];
  replies.push(await exchange(history, 'Hi, am I early? I can come back if you need more time.'));
  replies.push(await exchange(history, "Actually, I'd rather talk. Something odd happened at work today."));
  replies.push(await exchange(history, "Can we sit quietly for a bit? You can say a little, but please don't ask me anything."));
  replies.push(await exchange(history, "Changing the subject: I made a D&D wizard named Millie, and she's very particular about being called Millicent."));
  replies.push(await exchange(history, "Let's leave D&D there. I went for a walk on the beach this morning, and the sea was beautifully calm."));
  report('\nNew scene: test whether Paige treats private narration as unheard.');
  const privateHistory = [{ role: 'assistant', content: opening }];
  const privateReply = await exchange(privateHistory, 'I say, "It has been one of those days." In my private thoughts, I worry about a broken printer at work, but I do not say that aloud.');
  const questionCounts = [...replies, privateReply].map(text => (text.match(/\?/g) || []).length);
  const workDialogue = [...replies[1].matchAll(/["“]([^"”]+)["”]/g)].map(match => match[1]).join(' ');
  report(`Question marks per reply: ${questionCounts.join(', ')} (expected: no more than 1; the quiet reply should have 0).`);
  const signals = [
    ['Early arrival acknowledged', /\b(?:early|ahead|half hour|before I expected)\b/i.test(replies[0])],
    ['Arrival avoided starting treatment', !/\b(?:massage table|treatment room|wash my hands|getting started|get started)\b/i.test(replies[0])],
    ['Work topic followed without an intake callback', !/\b(?:massage|pressure|appointment|tea|cuppa)\b/i.test(replies[1])],
    ['Work response has more than a brief interjection', workDialogue.trim().split(/\s+/).length >= 8],
    ['Quiet request received no question', questionCounts[2] === 0],
    ['Quiet reply avoided a new prop or subject', !/\b(?:crystal|quartz|pendant|tarot|diffuser|something weird|carry something)\b/i.test(replies[2])],
    ['Wizard topic acknowledged (including an indirect spell reference)', /\b(?:Millie|Millicent|wizard|D&D|fireball|spell)\b/i.test(replies[3])],
    ['Wizard was not claimed as Paige’s companion', !/\b(?:my (?:wizard|familiar|companion)|with me for|found her|her as a .*familiar|where Millicent had|she(?:’s|'s| is) in the library)\b/i.test(replies[3])],
    ['Beach subject change followed', /\b(?:beach|sea|ocean|waves|shore|walk)\b/i.test(replies[4]) && !/\b(?:Millie|Millicent|wizard|D&D|spell)\b/i.test(replies[4])],
    ['Private scene avoided invented visitor body language', !/\b(?:tension in your shoulders|you (?:step|walk) inside|your (?:tense shoulders|worried expression|tired eyes))\b/i.test(privateReply)],
    ['Private scene avoided intake or treatment assumptions', !/\b(?:before we start|tea|cuppa|first time|massage table|pressure|treatment)\b/i.test(privateReply)],
    ['Unspoken printer thought stayed private', !/\bprinter\b/i.test(privateReply)],
    ['At most one question per reply', questionCounts.every(count => count <= 1)]
  ];
  report('\nQuick checks (these are clues, not a full judgement of the writing):');
  for (const [label, okay] of signals) report(`${okay ? 'OK' : 'REVIEW'}  ${label}`);
  await writeFile(join(root, 'paige-run-through.txt'), reportLines.join('\n') + '\n', 'utf8');
  console.log('\nSaved paige-run-through.txt in the main Paige folder.');
} catch (error) {
  console.error('Run-through stopped:', error.message);
  console.error('Start Ollama and `node .\\local\\server.mjs` in another PowerShell window, then try again.');
  process.exitCode = 1;
}
