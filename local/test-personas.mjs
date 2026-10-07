// Dependency-free integration checks. No real model or saved personal chats are read.
import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
const calls=[];
const mock=http.createServer(async(req,res)=>{let text='';for await(const chunk of req)text+=chunk;calls.push(JSON.parse(text));res.setHeader('Content-Type','application/json');res.end(JSON.stringify({message:{content:'I’m listening. You can leave it messy.'}}));});
await new Promise(resolve=>mock.listen(18189,'127.0.0.1',resolve));
const server=spawn(process.execPath,['local/server.mjs'],{env:{...process.env,PAIGE_PORT:'18188',PAIGE_OLLAMA_URL:'http://127.0.0.1:18189/api/chat'},stdio:['ignore','pipe','pipe']});
const storage=new Map([['paige.settings',JSON.stringify({memory:'PAIGE_ONLY_MEMORY',includeMemory:true})]]);
function node(){return{value:'',style:{},dataset:{},children:[],attributes:{},options:[],classList:{add(){}},setAttribute(k,v){this.attributes[k]=v},addEventListener(){},append(...items){this.children.push(...items)},replaceChildren(...items){this.children=items},showModal(){this.open=true},close(){this.open=false},focus(){},remove(){},scrollIntoView(){}};}
async function client(){const nodes=new Map();const context={location:{hostname:'127.0.0.1',origin:'http://127.0.0.1:18188'},window:{},navigator:{},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},document:{querySelector(s){if(!nodes.has(s))nodes.set(s,node());return nodes.get(s)},createElement:node},requestAnimationFrame:fn=>fn(),setTimeout:()=>{},fetch,Date,Number,String,Array,JSON,Option:class{},console};vm.createContext(context);for(const file of ['personas.js','scenarios.js','app.js'])vm.runInContext(await readFile(file,'utf8'),context,{filename:file});return{nodes,run:code=>vm.runInContext(code,context)};}
try{
 await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',code=>reject(new Error('Server exited '+code)));});
 let c=await client();
 assert.equal(c.run('SCENARIOS.length'),18);
 c.run("startScenario('studio')");await c.run("send('PAIGE_ONLY_TURN')");assert.match(calls.at(-1).messages[0].content,/PAIGE_ONLY_MEMORY/);
 c.run("startScenario('saige')");assert.equal(c.nodes.get('#characterName').textContent,'Saige');assert.equal(c.nodes.get('#saigeNotice').hidden,false);
 c.run('fillSettings()');assert.equal(c.nodes.get('#memory').value,'');assert.equal(c.nodes.get('#includeMemory').checked,false);assert.equal(c.nodes.get('#systemPrompt').readOnly,true);
 c.nodes.get('#memory').value='SAIGE_ONLY_MEMORY';c.nodes.get('#includeMemory').checked=true;c.run('settings=readForm();save()');
 await c.run("send('I just want to vent. No advice or questions please.')");
 let payload=calls.at(-1);assert.match(payload.messages[0].content,/You are Saige/);assert.match(payload.messages[0].content,/SAIGE_ONLY_MEMORY/);assert.doesNotMatch(JSON.stringify(payload),/PAIGE_ONLY_(?:MEMORY|TURN)/);assert.ok(payload.options.temperature<=0.7);
 assert.match(c.nodes.get('#chat').children.at(-1).innerHTML,/Saige/);
 c=await client();assert.equal(c.run('characterName()'),'Saige');
 const paigeId=c.run("savedChats.find(c=>c.scenario==='studio').id");c.run(`resumeChat(${JSON.stringify(paigeId)})`);assert.match(c.run('JSON.stringify(messages)'),/PAIGE_ONLY_TURN/);c.run('fillSettings()');assert.equal(c.nodes.get('#memory').value,'PAIGE_ONLY_MEMORY');assert.equal(c.nodes.get('#systemPrompt').readOnly,false);assert.doesNotMatch(c.run('systemMessage()'),/SAIGE_ONLY_MEMORY/);
 const saigeId=c.run("savedChats.find(c=>c.scenario==='saige').id");c.run(`resumeChat(${JSON.stringify(saigeId)})`);assert.doesNotMatch(c.run('JSON.stringify(messages)'),/PAIGE_ONLY_TURN/);
 await c.run('continueAnswer()');assert.doesNotMatch(calls.at(-1).messages.at(-1).content,/scene|Paige/);
 c.run("startScenario('cafe')");assert.equal(c.nodes.get('#saigeNotice').hidden,true);assert.match(c.run('systemMessage()'),/barista/);
 let response=await fetch('http://127.0.0.1:18188/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({persona:'saige',system:'OVERRIDE_WITH_PAIGE_FLIRT',temperature:1.4,messages:[{role:'user',content:'Test'}],diagnostics:true})});let result=await response.json();assert.equal(result.diagnostics.persona,'saige');assert.equal(result.diagnostics.version,'0.18.0');payload=calls.at(-1);assert.doesNotMatch(payload.messages[0].content,/OVERRIDE_WITH_PAIGE_FLIRT/);assert.equal(payload.options.temperature,0.7);
 response=await fetch('http://127.0.0.1:18188/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({persona:'paige',system:'PAIGE_CUSTOM_PROMPT',messages:[{role:'user',content:'Test'}]})});assert.equal(response.status,200);assert.equal(calls.at(-1).messages[0].content,'PAIGE_CUSTOM_PROMPT');
 for(const path of ['/','/personas.js','/scenarios.js','/app.js','/styles.css'])assert.equal((await fetch('http://127.0.0.1:18188'+path)).status,200);
 console.log('PASS: 18 menu options, names and notice, persona routing, separate memory, settings preservation, saved-chat switching, reload, continuation, Paige custom prompt, static routes and server-owned Saige prompt. Mock Ollama used; visual layout and real model behaviour are not tested.');
}finally{server.kill();await new Promise(resolve=>mock.close(resolve));}
