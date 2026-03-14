/* audio.js — engine bridge, mixer, note table */

(function(){

let audioCtx;

const sources = {};
let currentSource = null;

const noteSourceMap = new Map();

let masterGain;
let limiter;


/* ---------- Note Frequencies ---------- */

const keyOrder = [
"A0","A#0","B0","C1","C#1","D1","D#1","E1","F1","F#1","G1","G#1",
"A1","A#1","B1","C2","C#2","D2","D#2","E2","F2","F#2","G2","G#2",
"A2","A#2","B2","C3","C#3","D3","D#3","E3","F3","F#3","G3","G#3",
"A3","A#3","B3","C4","C#4","D4","D#4","E4","F4","F#4","G4","G#4",
"A4","A#4","B4","C5","C#5","D5","D#5","E5","F5","F#5","G5","G#5",
"A5","A#5","B5","C6","C#6","D6","D#6","E6","F6","F#6","G6","G#6",
"A6","A#6","B6","C7","C#7","D7","D#7","E7","F7","F#7","G7","G#7",
"A7","A#7","B7","C8"
];

const noteFrequencies = {};
const A4 = 440;

keyOrder.forEach((note,i)=>{
  const n = i - 48;
  noteFrequencies[note] = +(A4 * Math.pow(2,n/12)).toFixed(4);
});


/* ---------- Audio Context ---------- */

function ensureAudio(){

  if(!audioCtx){

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    masterGain = audioCtx.createGain();
    masterGain.gain.value = 3;

    limiter = audioCtx.createDynamicsCompressor();
    limiter.threshold.value = -3;
    limiter.knee.value = 0;
    limiter.ratio.value = 20;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.25;

    masterGain.connect(limiter).connect(audioCtx.destination);
  }

  if(audioCtx.state === "suspended"){
    audioCtx.resume();
  }
}


function getContext(){
  ensureAudio();
  return audioCtx;
}

function getOutput(){
  ensureAudio();
  return masterGain;
}


/* ---------- Source Registration ---------- */

function registerSource(name, source){

  sources[name] = source;

  if(source.init){
    source.init(getContext(), getOutput());
  }
}


/* ---------- Select Source ---------- */

function setSource(name){

  const src = sources[name];

  if(!src){
    console.error("Audio source not found:", name);
    return;
  }

  currentSource = src;
}


/* ---------- Play ---------- */

function play(note, velocity = 0.8){

  ensureAudio();

  if(!currentSource) return;

  if(noteSourceMap.has(note)){
    stop(note);
  }

  currentSource.play(note, velocity);

  noteSourceMap.set(note, currentSource);

  if(window.staffNoteOn){
    window.staffNoteOn(note);
  }
}


/* ---------- Stop ---------- */

function stop(note){

  const src = noteSourceMap.get(note);

  if(!src) return;

  src.stop(note);

  noteSourceMap.delete(note);

  if(window.staffNoteOff){
    window.staffNoteOff(note);
  }
}


/* ---------- Public API ---------- */

window.audioEngine = {

  play,
  stop,
  setSource,
  registerSource,
  getContext,
  getOutput,

  noteFrequencies

};

})();