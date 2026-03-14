/* oscillator.js — oscillator sound source */

(function(){

let audioCtx;
let output;

const activeNotes = new Map();


const harmonicLayers = [
  { type:"triangle", weight:0.6, detune:0 },
  { type:"sine", weight:0.25, detune:0.5 },
  { type:"sine", weight:0.15, detune:-0.5 }
];


function init(ctx, out){
  audioCtx = ctx;
  output = out;
}


function play(note, velocity = 0.8){

if(activeNotes.has(note)){
  stop(note);
}

  const freq = audioEngine.noteFrequencies[note];
  if(!freq) return;

  const now = audioCtx.currentTime;

  const masterGain = audioCtx.createGain();
  const panNode = audioCtx.createStereoPanner();

  masterGain.gain.setValueAtTime(0.0001, now);

  panNode.pan.value = (Math.random() - 0.5) * 0.2;

  masterGain.connect(panNode).connect(output);

  const attack = 0.01;
  const decay = 0.12;
  const sustain = velocity * 0.35;

  masterGain.gain.exponentialRampToValueAtTime(
    Math.max(0.001, velocity * 0.6),
    now + attack
  );

  masterGain.gain.exponentialRampToValueAtTime(
    Math.max(0.001, sustain),
    now + attack + decay
  );

  const oscs = [];

  harmonicLayers.forEach(layer=>{

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = layer.type;
    osc.frequency.setValueAtTime(freq, now);

    osc.detune.value =
      layer.detune +
      (Math.random() - 0.5) * 2;

    gain.gain.value = layer.weight * velocity;

    osc.connect(gain).connect(masterGain);

    osc.start(now);

    oscs.push(osc);
  });

  activeNotes.set(note,{
    oscs,
    gainNode: masterGain,
    panNode
  });

}


function stop(note){

  const obj = activeNotes.get(note);
  if(!obj) return;

  const t = audioCtx.currentTime;

  obj.gainNode.gain.cancelScheduledValues(t);

  const current =
    Math.max(obj.gainNode.gain.value,0.001);

  obj.gainNode.gain.setValueAtTime(current,t);

  const release = 0.08;

  obj.gainNode.gain.exponentialRampToValueAtTime(
    0.0001,
    t + release
  );

  obj.oscs.forEach(osc=>{
    try{
      osc.stop(t + release);
    }catch(e){}
  });

  setTimeout(()=>{

    try{ obj.gainNode.disconnect(); }catch(e){}
    try{ obj.panNode.disconnect(); }catch(e){}

  },(release + 0.02)*1000);

  activeNotes.delete(note);

}


/* ---------- Register Source ---------- */

audioEngine.registerSource("oscillator",{
  init,
  play,
  stop
});

})();