// Run from the Paige folder while the local Paige server and Ollama are running:
// node .\local\run-through.mjs
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(join(root, 'app.js'), 'utf8');
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
  console.log(`\nYOU: ${visitor}\nPAIGE: ${reply}\n`);
  return reply;
}

try {
  const check = await fetch(origin + '/');
  if (!check.ok) throw new Error(`Local Paige page returned ${check.status}.`);
  console.log('Paige local model run-through. These are fictional test messages; no personal chat history is read.');
  const history = [{ role: 'assistant', content: opening }];
  const replies = [];
  replies.push(await exchange(history, 'Hi, am I early? I can come back if you need more time.'));
  replies.push(await exchange(history, "Actually, I'd rather talk. Something odd happened at work today."));
  replies.push(await exchange(history, "Can we sit quietly for a bit? You can say a little, but please don't ask me anything."));
  replies.push(await exchange(history, "Changing the subject: I made a D&D wizard named Millie, and she's very particular about being called Millicent."));
  console.log('\nNew scene: test whether Paige treats private narration as unheard.');
  const privateHistory = [{ role: 'assistant', content: opening }];
  const privateReply = await exchange(privateHistory, 'I say, "It has been one of those days." In my private thoughts, I worry about a broken printer at work, but I do not say that aloud.');
  const questionCounts = [...replies, privateReply].map(text => (text.match(/\?/g) || []).length);
  console.log(`Question marks per reply: ${questionCounts.join(', ')} (expected: no more than 1; the quiet reply should have 0).`);
  const signals = [
    ['Early arrival acknowledged', /\b(?:early|ahead|half hour|before I expected)\b/i.test(replies[0])],
    ['Work topic followed without an intake callback', !/\b(?:massage|pressure|appointment|tea|cuppa)\b/i.test(replies[1])],
    ['Quiet request received no question', questionCounts[2] === 0],
    ['D&D topic followed', /\b(?:Millie|Millicent|wizard|D&D)\b/i.test(replies[3])],
    ['Unspoken printer thought stayed private', !/\bprinter\b/i.test(privateReply)],
    ['At most one question per reply', questionCounts.every(count => count <= 1)]
  ];
  console.log('\nQuick checks (these are clues, not a full judgement of the writing):');
  for (const [label, okay] of signals) console.log(`${okay ? 'OK' : 'REVIEW'}  ${label}`);
} catch (error) {
  console.error('Run-through stopped:', error.message);
  console.error('Start Ollama and `node .\\local\\server.mjs` in another PowerShell window, then try again.');
  process.exitCode = 1;
}
