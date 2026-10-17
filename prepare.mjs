import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const script=fs.readFileSync('script.txt','utf8').trim();
if(!script) throw Error('script.txt is empty');
if(!fs.existsSync('public/voice.mp3')) throw Error('Upload your voice as public/voice.mp3');
const data=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','json','public/voice.mp3'],{encoding:'utf8'}));
const duration=Number(data.format.duration);
if(!Number.isFinite(duration)||duration<=0)throw Error('Could not read voice.mp3 duration');
// Approximate text-to-audio distribution. No word-level synchronization.
const pieces=script.replace(/\s+/g,' ').match(/[^.!?।؟]+[.!?।؟]?/g)||[script];
let chunks=[],current='';
for(const p of pieces){if((current+' '+p).length>165&&current){chunks.push(current.trim());current='';}current+=' '+p;}
if(current.trim())chunks.push(current.trim());
// Split exceptionally long unpunctuated passages into smaller chunks.
chunks=chunks.flatMap(chunk=>{if(chunk.length<=165)return [chunk];const words=chunk.split(/\s+/);const result=[];let part='';for(const word of words){if(part && (part+' '+word).length>165){result.push(part);part='';}part+=(part?' ':'')+word;}if(part)result.push(part);return result;});
const words=chunks.map(s=>Math.max(1,s.split(/\s+/).length));const total=words.reduce((a,b)=>a+b,0);
const fps=24,frames=Math.ceil(duration*fps);if(chunks.length>frames)throw Error('Too many text chunks for voice duration');let cursor=0;
const scenes=chunks.map((text,i)=>{const remaining=frames-cursor;const len=i===chunks.length-1?remaining:Math.max(1,Math.min(remaining-(chunks.length-i-1),Math.round(frames*words[i]/total)));const scene={text,start:cursor,duration:len,variant:i%6};cursor+=len;return scene;});
fs.writeFileSync('src/data.json',JSON.stringify({fps,frames,scenes},null,2));
console.log(`Prepared ${scenes.length} scenes; ${duration.toFixed(1)}s, ${frames} frames`);
