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
  fetch, Date, Number, String, Array, JSON, Option: class {}, console
};
vm.createContext(context);
vm.runInContext(source, context, { filename: 'app.js' });
const opening = vm.runInContext('OPENING', context);

async function exchange(history, visitor) {
  history.push({ role: 'user', content: visitor });
  context.testHistory = history;
  const reply = await vm.runInContext('requestAI(testHistory)', context);
  history.push({ role: 'assistant', content: reply });
  report(`\nYOU: ${visitor}\nPAIGE: ${reply}\n`);
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
  report('\nNew scene: test whether Paige treats private narration as unheard.');
  const privateHistory = [{ role: 'assistant', content: opening }];
  const privateReply = await exchange(privateHistory, 'I say, "It has been one of those days." In my private thoughts, I worry about a broken printer at work, but I do not say that aloud.');
  const questionCounts = [...replies, privateReply].map(text => (text.match(/\?/g) || []).length);
  const workDialogue = [...replies[1].matchAll(/["“]([^"”]+)["”]/g)].map(match => match[1]).join(' ');
  report(`Question marks per reply: ${questionCounts.join(', ')} (expected: no more than 1; the quiet reply should have 0).`);
  const signals = [
    ['Early arrival acknowledged', /\b(?:early|ahead|half hour|before I expected)\b/i.test(replies[0])],
    ['Arrival avoided starting treatment', !/\b(?:massage table|treatment room|wash my hands|getting started)\b/i.test(replies[0])],
    ['Work topic followed without an intake callback', !/\b(?:massage|pressure|appointment|tea|cuppa)\b/i.test(replies[1])],
    ['Work response has more than a brief interjection', workDialogue.trim().split(/\s+/).length >= 8],
    ['Quiet request received no question', questionCounts[2] === 0],
    ['Quiet reply avoided a new prop or subject', !/\b(?:crystal|tarot|diffuser|something weird|carry something)\b/i.test(replies[2])],
    ['Millie or wizard acknowledged specifically', /\b(?:Millie|Millicent|wizard|D&D)\b/i.test(replies[3])],
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
