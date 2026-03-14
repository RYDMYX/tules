/* samples.js — sample piano with pitch regions */

(function(){

let audioCtx;
let output;

const buffers = {};
const activeNotes = new Map();


// ---------- Sample Regions ----------
// root sample → notes it covers

const regions = {

"C0": ["C0","C#0","D0","D#0","E0"],
"F0": ["F0","F#0","G0","G#0"],
"A0": ["A0","A#0","B0"],

"C1": ["C1","C#1","D1","D#1","E1"],
"F1": ["F1","F#1","G1","G#1"],
"A1": ["A1","A#1","B1"],

"C2": ["C2","C#2","D2","D#2","E2"],
"F2": ["F2","F#2","G2","G#2"],
"A2": ["A2","A#2","B2"],

"C3": ["C3","C#3","D3","D#3","E3"],
"F3": ["F3","F#3","G3","G#3"],
"A3": ["A3","A#3","B3"],

"C4": ["C4","C#4","D4","D#4","E4"],
"F4": ["F4","F#4","G4","G#4"],
"A4": ["A4","A#4","B4"],

"C5": ["C5","C#5","D5","D#5","E5"],
"F5": ["F5","F#5","G5","G#5"],
"A5": ["A5","A#5","B5"],

"C6": ["C6","C#6","D6","D#6","E6"],
"F6": ["F6","F#6","G6","G#6"],
"A6": ["A6","A#6","B6"],

"C7": ["C7","C#7","D7","D#7","E7"],
"F7": ["F7","F#7","G7","G#7"],
"A7": ["A7","A#7","B7"],

"C8": ["C8"]

};


// convert region map to quick lookup
const noteToSample = {};

for(const root in regions){

  regions[root].forEach(n=>{
    noteToSample[n] = root;
  });

}


// ---------- Sample Files ----------

const sampleFiles = {

"C0":"samples/C0.mp3",
"F0":"samples/F0.mp3",
"A0":"samples/A0.mp3",

"C1":"samples/C1.mp3",
"F1":"samples/F1.mp3",
"A1":"samples/A1.mp3",

"C2":"samples/C2.mp3",
"F2":"samples/F2.mp3",
"A2":"samples/A2.mp3",

"C3":"samples/C3.mp3",
"F3":"samples/F3.mp3",
"A3":"samples/A3.mp3",

"C4":"samples/C4.mp3",
"F4":"samples/F4.mp3",
"A4":"samples/A4.mp3",

"C5":"samples/C5.mp3",
"F5":"samples/F5.mp3",
"A5":"samples/A5.mp3",

"C6":"samples/C6.mp3",
"F6":"samples/F6.mp3",
"A6":"samples/A6.mp3",

"C7":"samples/C7.mp3",
"F7":"samples/F7.mp3",
"A7":"samples/A7.mp3",

"C8":"samples/C8.mp3"

};


// ---------- INIT ----------

function init(ctx, out){

  audioCtx = ctx;
  output = out;

  loadSamples();

}


// ---------- LOAD SAMPLES ----------

async function loadSamples(){

  for(const note in sampleFiles){

    const url = sampleFiles[note];

    try{

      const res = await fetch(url);
      const arr = await res.arrayBuffer();

      const buffer = await audioCtx.decodeAudioData(arr);

      buffers[note] = buffer;

    }catch(e){
      console.error("Sample failed:", url);
    }

  }

}


// ---------- PLAY ----------

function play(note, velocity = 0.8){

  const root = noteToSample[note];

  if(!root) return;

  const buffer = buffers[root];

  if(!buffer) return;

  const now = audioCtx.currentTime;

  const source = audioCtx.createBufferSource();
  const gain = audioCtx.createGain();
  const panNode = audioCtx.createStereoPanner();

  source.buffer = buffer;

  const targetFreq = audioEngine.noteFrequencies[note];
  const rootFreq = audioEngine.noteFrequencies[root];

  source.playbackRate.value = targetFreq / rootFreq;

  gain.gain.setValueAtTime(0.0001, now);

  panNode.pan.value = (Math.random()-0.5)*0.15;

  source.connect(gain).connect(panNode).connect(output);


  // envelope
  const attack = 0.005;
  const decay = 0.15;
  const sustain = velocity * 0.7;

  gain.gain.exponentialRampToValueAtTime(
    Math.max(0.001, velocity),
    now + attack
  );

  gain.gain.exponentialRampToValueAtTime(
    Math.max(0.001, sustain),
    now + attack + decay
  );

  source.start(now);

  activeNotes.set(note,{
    source,
    gain,
    panNode
  });

}


// ---------- STOP ----------

function stop(note){

  const obj = activeNotes.get(note);
  if(!obj) return;

  const t = audioCtx.currentTime;

  obj.gain.gain.cancelScheduledValues(t);

  const cur = Math.max(obj.gain.gain.value,0.001);

  obj.gain.gain.setValueAtTime(cur,t);

  const release = 0.25;

  obj.gain.gain.exponentialRampToValueAtTime(
    0.0001,
    t + release
  );

  try{
    obj.source.stop(t + release);
  }catch(e){}

  setTimeout(()=>{

    try{ obj.gain.disconnect(); }catch(e){}
    try{ obj.panNode.disconnect(); }catch(e){}

  },(release+0.05)*1000);

  activeNotes.delete(note);

}


// ---------- REGISTER ----------

audioEngine.registerSource("samples",{

  init,
  play,
  stop

});

})();