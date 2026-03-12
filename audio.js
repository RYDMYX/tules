/* audio.js
   Self-contained piano sound engine
   Provides: audioEngine.play(note, velocity)
             audioEngine.stop(note)
*/

(function(){

let audioCtx;
const activeNotes = new Map();

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
  noteFrequencies[note] = +(A4*Math.pow(2,n/12)).toFixed(2);
});

function ensureAudio(){
  if(!audioCtx)
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  if(audioCtx.state === "suspended")
    audioCtx.resume();
}

function play(note, velocity = 0.8){

  ensureAudio();

  const freq = noteFrequencies[note];
  if(!freq) return;

  const now = audioCtx.currentTime;

  const masterGain = audioCtx.createGain();
  const panNode = audioCtx.createStereoPanner();

  panNode.pan.value = (Math.random() - 0.5) * 0.2;

  const attack = 0.01;
  const decay = 0.12;
  const release = 0.35 + (0.15 * (1 - velocity));

  masterGain.gain.setValueAtTime(0, now);
  masterGain.gain.linearRampToValueAtTime(velocity * 0.5, now + attack);
  masterGain.gain.linearRampToValueAtTime(velocity * 0.35, now + decay);
  masterGain.gain.linearRampToValueAtTime(0, now + decay + release);

  masterGain.connect(panNode).connect(audioCtx.destination);

  const osc1 = audioCtx.createOscillator();
  osc1.type = "triangle";
  osc1.frequency.setValueAtTime(freq, now);
  osc1.detune.value = (Math.random() - 0.5) * 4;
  osc1.connect(masterGain);
  osc1.start(now);

  const osc2 = audioCtx.createOscillator();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(freq, now);
  osc2.detune.value = (Math.random() - 0.5) * 4;

  const gain2 = audioCtx.createGain();
  gain2.gain.value = velocity * 0.4;

  osc2.connect(gain2).connect(masterGain);
  osc2.start(now);

  const noteObj = { osc1, osc2, gainNode: masterGain, panNode };

  noteObj.stop = function(){
    const t = audioCtx.currentTime;

    this.gainNode.gain.cancelScheduledValues(t);
    this.gainNode.gain.linearRampToValueAtTime(0, t + 0.3);

    setTimeout(()=>{
      try{
        this.gainNode.disconnect();
        this.panNode.disconnect();
      }catch(e){}
    },400);

    try{
      this.osc1.stop(t + 0.3);
      this.osc2.stop(t + 0.3);
    }catch(e){}
  };

  activeNotes.set(note, noteObj);

  if(window.staffNoteOn) window.staffNoteOn(note);
}

function stop(note){

  const noteObj = activeNotes.get(note);
  if(!noteObj) return;

  noteObj.stop();
  activeNotes.delete(note);

  if(window.staffNoteOff) window.staffNoteOff(note);
}

window.audioEngine = {
  play,
  stop
};

})();