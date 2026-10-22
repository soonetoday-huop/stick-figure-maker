import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const script = fs.readFileSync('script.txt', 'utf8').trim();

if (!script) {
throw new Error('script.txt is empty. Please add your story script.');
}

if (!fs.existsSync('public/voice.mp3')) {
throw new Error('Voice file not found: public/voice.mp3');
}

const probe = execFileSync(
'ffprobe',
[
'-v', 'error',
'-show_entries', 'format=duration',
'-of', 'json',
'public/voice.mp3'
],
{ encoding: 'utf8' }
);

const audioData = JSON.parse(probe);
const audioDuration = Number(audioData.format.duration);

if (!Number.isFinite(audioDuration) || audioDuration <= 0) {
throw new Error('Could not determine the voice duration.');
}

// Video settings
const fps = 30;
const frames = Math.ceil(audioDuration * fps);

// Split the story into readable narration chunks.
const sentences =
script.replace(/\s+/g, ' ').match(/[^.!?।؟]+[.!?।؟]?/g) || [script];

let chunks = [];
let current = '';

for (const sentence of sentences) {
const part = sentence.trim();

if (!part) continue;

if ((current + ' ' + part).trim().length > 165 && current) {
chunks.push(current.trim());
current = '';
}

current += (current ? ' ' : '') + part;
}

if (current.trim()) {
chunks.push(current.trim());
}

// Split any unusually long chunks at word boundaries.
chunks = chunks.flatMap((chunk) => {
if (chunk.length <= 165) return [chunk];

const result = [];
let part = '';

for (const word of chunk.split(/\s+/)) {
if (part && (part + ' ' + word).length > 165) {
result.push(part);
part = '';
}

part += (part ? ' ' : '') + word;

}

if (part) result.push(part);
return result;
});

if (chunks.length > frames) {
throw new Error('The script contains too many chunks for the audio duration.');
}

// Distribute scene duration approximately by word count.
const weights = chunks.map((chunk) =>
Math.max(1, chunk.split(/\s+/).length)
);

const totalWeight = weights.reduce((sum, value) => sum + value, 0);

let cursor = 0;

const scenes = chunks.map((text, index) => {
const remainingFrames = frames - cursor;
const remainingScenes = chunks.length - index - 1;

let duration;

if (index === chunks.length - 1) {
duration = remainingFrames;
} else {
duration = Math.round(
frames * weights[index] / totalWeight
);

duration = Math.max(
  1,
  Math.min(duration, remainingFrames - remainingScenes)
);

}

const scene = {
text,
start: cursor,
duration,
variant: index % 6
};

cursor += duration;
return scene;
});

fs.mkdirSync('src', { recursive: true });

fs.writeFileSync(
'src/data.json',
JSON.stringify({ fps, frames, scenes }, null, 2)
);

console.log("Voice duration: ${audioDuration.toFixed(2)} seconds");
console.log("Video duration: ${(frames / fps).toFixed(2)} seconds");
console.log("FPS: ${fps}");
console.log("Scenes prepared: ${scenes.length}");
console.log('Created src/data.json successfully.');
