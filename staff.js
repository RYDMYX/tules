// staff.js — self-contained, SAFE version with MANUAL mapping control    
window.createStaffView = function () {
    
  /* =======================    
     CSS (UNCHANGED GEOMETRY)    
  ======================= */    
  const css = `    

@font-face {
  font-family: "Bravura";
  src: url("./Bravura.otf") format("opentype");
}

.music-font {
  font-family: "Bravura";}


  `;    
  const style = document.createElement("style");    
  style.textContent = css;    
  document.head.appendChild(style);    
    
  /* =======================    
     HTML    
  ======================= */    
  const container = document.createElement("div");
container.className = "staff-view";
container.style.width = "100%";
container.style.height = "100%";
    
  /* =======================    
     SVG SETUP    
  ======================= */    
  const SVG_NS = "http://www.w3.org/2000/svg";    
  const W = 230, H = 230;    
    
  const svg = document.createElementNS(SVG_NS, "svg");
svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
svg.setAttribute("width", "100%");
svg.setAttribute("height", "100%");
svg.setAttribute("style", "font-family: 'Bravura';");
container.appendChild(svg);    
    
  const staticGroup = document.createElementNS(SVG_NS, "g");    
const keySigGroup = document.createElementNS(SVG_NS, "g");    
const notesGroup = document.createElementNS(SVG_NS, "g");    
    
svg.appendChild(staticGroup);    
svg.appendChild(keySigGroup);    
svg.appendChild(notesGroup);    

    
  /* =======================    
     LAYOUT (UNCHANGED)    
  ======================= */    
  const leftMargin = 48;    
  const rightMargin = W - 20;    
  const lineSpacing = 16;    
  const half = lineSpacing / 2;    
    
  const totalHeight = 4*lineSpacing + 2*lineSpacing + 4*lineSpacing;    
  const topMargin = (H - totalHeight) / 2;    
    
  const trebleTop = topMargin;    
  const trebleBottom = trebleTop + 4 * lineSpacing;    
  const bassTop = trebleBottom + 2 * lineSpacing;    
  const bassBottom = bassTop + 4 * lineSpacing;    
    
  const noteX = W / 2 + 30;    
    
  /* =======================    
     FIXED STAFF SLOTS    
  ======================= */    
  const STAFF_SLOT_INDEX = {    
    C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6    
  };    
    
  const REF_STEP = 4 * 7 + STAFF_SLOT_INDEX.E; // E4 reference    
    
  /* =======================    
     PIANO IDENTITY (FIXED)    
  ======================= */    
  const PIANO_IDS = {    
    C:  "a",    
    CSH:"b",    
    D:  "c",    
    DSH:"d",    
    E:  "e",    
    F:  "f",    
    FSH:"g",    
    G:  "h",    
    GSH:"i",    
    A:  "j",    
    ASH:"k",    
    B:  "l"    
  };    
    
  /* =======================    
     KEY → MANUAL MAPPING    
     YOU EDIT THESE TABLES    
  ======================= */    
const KEY_MAP = {    
    
  C: {    
    a:{slot:"C",acc:""},   b:{slot:"C",acc:"#"},    
    c:{slot:"D",acc:""},   d:{slot:"D",acc:"#"},    
    e:{slot:"E",acc:""},    
    f:{slot:"F",acc:""},   g:{slot:"F",acc:"#"},    
    h:{slot:"G",acc:""},   i:{slot:"G",acc:"#"},    
    j:{slot:"A",acc:""},   k:{slot:"A",acc:"#"},    
    l:{slot:"B",acc:""}    
  },    
    
  G: {    
    a:{slot:"C",acc:""},   b:{slot:"C",acc:"#"},    
    c:{slot:"D",acc:""},   d:{slot:"D",acc:"#"},    
    e:{slot:"E",acc:""},    
    f:{slot:"F",acc:"n"},  g:{slot:"F",acc:""},    
    h:{slot:"G",acc:""},   i:{slot:"G",acc:"#"},    
    j:{slot:"A",acc:""},   k:{slot:"A",acc:"#"},    
    l:{slot:"B",acc:""}    
  },    
    
  D: {    
    a:{slot:"C",acc:"n"},    
    b:{slot:"C",acc:""},    
    c:{slot:"D",acc:""},   d:{slot:"D",acc:"#"},    
    e:{slot:"E",acc:""},    
    f:{slot:"F",acc:"n"},  g:{slot:"F",acc:""},    
    h:{slot:"G",acc:""},   i:{slot:"G",acc:"#"},    
    j:{slot:"A",acc:""},   k:{slot:"A",acc:"#"},    
    l:{slot:"B",acc:""}    
  },    
    
  A: {    
    a:{slot:"C",acc:"n"},    
    b:{slot:"C",acc:""},    
    c:{slot:"D",acc:""},    
    d:{slot:"D",acc:"#"},    
    e:{slot:"E",acc:""},    
    f:{slot:"F",acc:"n"},  g:{slot:"F",acc:""},    
    h:{slot:"G",acc:"n"},   i:{slot:"G",acc:""},    
    j:{slot:"A",acc:""},   k:{slot:"A",acc:"#"},    
    l:{slot:"B",acc:""}    
  },    
    
  E: {    
    a:{slot:"C",acc:"n"},    
    b:{slot:"C",acc:""},    
    c:{slot:"D",acc:"n"},    
    d:{slot:"D",acc:""},    
    e:{slot:"E",acc:""},    
    f:{slot:"F",acc:"n"},  
    g:{slot:"F",acc:""},    
    h:{slot:"G",acc:"n"},  
    i:{slot:"G",acc:""},    
    j:{slot:"A",acc:""},  
    k:{slot:"A",acc:"#"},    
    l:{slot:"B",acc:""}    
  },    
    
  B: {    
    a:{slot:"C",acc:"n"},    
    b:{slot:"C",acc:""},    
    c:{slot:"D",acc:"n"},    
    d:{slot:"D",acc:""},    
    e:{slot:"E",acc:""},  // E#    
    f:{slot:"E",acc:"n"},  // F → E#    
    g:{slot:"F",acc:""},    
    h:{slot:"G",acc:"n"},    
    i:{slot:"G",acc:""},    
    j:{slot:"A",acc:"n"},    
    k:{slot:"A",acc:""},    
    l:{slot:"B",acc:""}    
  },    
    
  "F#": {    
    a:{slot:"C",acc:"n"},    
    b:{slot:"C",acc:""},    
    c:{slot:"D",acc:"n"},    
    d:{slot:"D",acc:""},    
    e:{slot:"E",acc:"n"},      
    f:{slot:"E",acc:""},   // F → E#    
    g:{slot:"F",acc:""},    
    h:{slot:"G",acc:"n"},    
    i:{slot:"G",acc:""},    
    j:{slot:"A",acc:"n"},    
    k:{slot:"A",acc:""},    
    l:{slot:"B",acc:""}    
  },    
    
  "C#": {    
    a:{slot:"B",acc:"", octaveShift:-1},   
    b:{slot:"C",acc:""},    
    c:{slot:"D",acc:"n"},    
    d:{slot:"D",acc:""},    
    e:{slot:"E",acc:"n"},      
    f:{slot:"E",acc:""},   // F → E#    
    g:{slot:"F",acc:""},    
    h:{slot:"G",acc:"n"},    
    i:{slot:"G",acc:""},    
    j:{slot:"A",acc:"n"},    
    k:{slot:"A",acc:""},    
    l:{slot:"B",acc:"n"}    
  },    
    
  F: {    
    a:{slot:"C",acc:""},    
    b:{slot:"D",acc:"b"},    
    c:{slot:"D",acc:""},    
    d:{slot:"E",acc:"b"},    
    e:{slot:"E",acc:""},    
    f:{slot:"F",acc:""},    
    g:{slot:"G",acc:"b"},    
    h:{slot:"G",acc:""},    
    i:{slot:"A",acc:"b"},    
    j:{slot:"A",acc:""},    
    k:{slot:"B",acc:""},    
    l:{slot:"B",acc:"n"}    
  },    
    
  Bb: {    
    a:{slot:"C",acc:""},    
    b:{slot:"D",acc:"b"},    
    c:{slot:"D",acc:""},    
    d:{slot:"E",acc:""},    
    e:{slot:"E",acc:"n"},    
    f:{slot:"F",acc:""},    
    g:{slot:"G",acc:"b"},    
    h:{slot:"G",acc:""},    
    i:{slot:"A",acc:"b"},    
    j:{slot:"A",acc:""},    
    k:{slot:"B",acc:""},    
    l:{slot:"B",acc:"n"}
  },    
    
  Eb: {    
    a:{slot:"C",acc:""},    
    b:{slot:"D",acc:"b"},    
    c:{slot:"D",acc:""},    
    d:{slot:"E",acc:""},    
    e:{slot:"E",acc:"n"},    
    f:{slot:"F",acc:""},    
    g:{slot:"G",acc:"b"},    
    h:{slot:"G",acc:""},    
    i:{slot:"A",acc:""},    
    j:{slot:"A",acc:"n"},    
    k:{slot:"B",acc:""},    
    l:{slot:"B",acc:"n"}
  },    
    
  Ab: {    
    a:{slot:"C",acc:""},    
    b:{slot:"D",acc:""},    
    c:{slot:"D",acc:"n"},    
    d:{slot:"E",acc:""},    
    e:{slot:"E",acc:"n"},    
    f:{slot:"F",acc:""},    
    g:{slot:"G",acc:"b"},    
    h:{slot:"G",acc:""},    
    i:{slot:"A",acc:""},    
    j:{slot:"A",acc:"n"},    
    k:{slot:"B",acc:""},    
    l:{slot:"B",acc:"n"}
  },    
    
  Db: {    
    a:{slot:"C",acc:""},    
    b:{slot:"D",acc:""},    
    c:{slot:"D",acc:"n"},    
    d:{slot:"E",acc:""},    
    e:{slot:"E",acc:"n"},    
    f:{slot:"F",acc:""},    
    g:{slot:"G",acc:""},    
    h:{slot:"G",acc:"n"},    
    i:{slot:"A",acc:""},    
    j:{slot:"A",acc:"n"},    
    k:{slot:"B",acc:""},    
    l:{slot:"B",acc:"n"}
  },    
    
  Gb: {    
    a:{slot:"C",acc:"n"},    
    b:{slot:"D",acc:""},    
    c:{slot:"D",acc:"n"},    
    d:{slot:"E",acc:""},    
    e:{slot:"E",acc:"n"},    
    f:{slot:"F",acc:""},    
    g:{slot:"G",acc:""},    
    h:{slot:"G",acc:"n"},    
    i:{slot:"A",acc:""},    
    j:{slot:"A",acc:"n"},    
    k:{slot:"B",acc:""},    
    l:{slot:"C",acc:"",octaveShift:+1}
  },    
    
  Cb: {    
    a:{slot:"C",acc:"n"},    
    b:{slot:"D",acc:""},    
    c:{slot:"D",acc:"n"},    
    d:{slot:"E",acc:""},    
    e:{slot:"F",acc:""},    
    f:{slot:"F",acc:"n"},    
    g:{slot:"G",acc:""},    
    h:{slot:"G",acc:"n"},    
    i:{slot:"A",acc:""},    
    j:{slot:"A",acc:"n"},    
    k:{slot:"B",acc:""},    
    l:{slot:"C",acc:"",octaveShift:+1}
  }    
    
};    
    
const activeNotes = new Map();     
// key = pianoId + octave, value = { pianoId, octave }    
    
  let currentKey = "C";    
  
  function normalizeKey(key){

  const enharmonic = {
    "D#":"Eb",
    "G#":"Ab",
    "A#":"Bb",

  };

  return enharmonic[key] || key;
}
    
const KEY_SIGNATURES = {    
  C:  { type:null, count:0 },    
    
  G:  { type:"sharp", count:1 },    
  D:  { type:"sharp", count:2 },    
  A:  { type:"sharp", count:3 },    
  E:  { type:"sharp", count:4 },    
  B:  { type:"sharp", count:5 },    
  "F#":{ type:"sharp", count:6 },    
  "C#":{ type:"sharp", count:7 },    
    
  F:  { type:"flat", count:1 },    
  Bb: { type:"flat", count:2 },    
  Eb: { type:"flat", count:3 },    
  Ab: { type:"flat", count:4 },    
  Db: { type:"flat", count:5 },    
  Gb: { type:"flat", count:6 },    
  Cb: { type:"flat", count:7 }    
};    
    
// relative to staff top line    
const TREBLE_SHARP_Y = [ 0.5, 25, -7, 16, 40, 8, 32 ];    
const TREBLE_FLAT_Y  = [ 32, 8, 40, 16, 48, 25, 57 ];    
    
const BASS_SHARP_Y = [ 16, 40, 8, 32, 56, 24, 48 ];    
const BASS_FLAT_Y  = [ 48, 24, 56, 32, 64, 40, 72 ];    
    
  /* =======================    
     STATIC DRAW    
  ======================= */    
  function drawLines(topY) {    
    for (let i=0;i<5;i++) {    
      const y = topY + i*lineSpacing;    
      const l = document.createElementNS(SVG_NS,"line");    
      l.setAttribute("x1", leftMargin-36);    
      l.setAttribute("x2", rightMargin);    
      l.setAttribute("y1", y);    
      l.setAttribute("y2", y);    
      l.setAttribute("stroke","#000");    
      staticGroup.appendChild(l);    
    }    
  }    
    
function drawKeySignature() {    
  keySigGroup.innerHTML = "";    
    
  const ks = KEY_SIGNATURES[currentKey];    
  if (!ks || !ks.type) return;    
    
  const symbol = ks.type === "sharp" ? "♯" : "♭";    
    
  // ===== MANUAL POSITION KNOBS =====    
  const trebleX = leftMargin + 8;    
  const bassX   = leftMargin + 8;    
    
  const trebleBaseY = trebleTop;    
  const bassBaseY   = bassTop;    
    
  const spacing = 6; // horizontal spacing between accidentals    
  // =================================    
    
  const trebleY = ks.type === "sharp" ? TREBLE_SHARP_Y : TREBLE_FLAT_Y;    
  const bassY   = ks.type === "sharp" ? BASS_SHARP_Y   : BASS_FLAT_Y;    
    
  for (let i = 0; i < ks.count; i++) {    
    
    // ---- TREBLE ----    
    const t = document.createElementNS(SVG_NS,"text");    
    t.setAttribute("x", trebleX + i * spacing);    
    t.setAttribute("y", trebleBaseY + trebleY[i]);    
    t.setAttribute("font-size", 25);    
    t.textContent = symbol;    
t.setAttribute("class", "music-font");
    keySigGroup.appendChild(t);    
    
    // ---- BASS ----    
    const b = document.createElementNS(SVG_NS,"text");    
    b.setAttribute("x", bassX + i * spacing);    
    b.setAttribute("y", bassBaseY + bassY[i]);    
    b.setAttribute("font-size", 25);    
    b.textContent = symbol;    
b.setAttribute("class", "music-font");
    keySigGroup.appendChild(b);    
  }    
}    
    
  function drawStatic() {    
  staticGroup.innerHTML = "";    
  keySigGroup.innerHTML = "";    
    
  drawLines(trebleTop);    
  drawLines(bassTop);    
    
    const treble = document.createElementNS(SVG_NS,"text");    
    treble.setAttribute("x", leftMargin-34);    
    treble.setAttribute("y", trebleBottom-15);    
    treble.setAttribute("font-size", 60);    
    treble.textContent = "\u{1D11E}"; //𝄞  
treble.setAttribute("class", "music-font");
    staticGroup.appendChild(treble);    
    
    const bass = document.createElementNS(SVG_NS,"text");    
    bass.setAttribute("x", leftMargin-34);    
    bass.setAttribute("y", bassBottom-48);    
    bass.setAttribute("font-size", 60);    
    bass.textContent   = "\u{1D122}"; //𝄢     
bass.setAttribute("class", "music-font");
    staticGroup.appendChild(bass);    
    
drawKeySignature();    
    
  }    
    
  /* =======================    
     NOTE DRAW    
  ======================= */    
  function ledger(y) {    
    const l = document.createElementNS(SVG_NS,"line");    
    l.setAttribute("x1", noteX-18);    
    l.setAttribute("x2", noteX+18);    
    l.setAttribute("y1", y);    
    l.setAttribute("y2", y);    
    l.setAttribute("stroke","#000");    
    notesGroup.appendChild(l);    
  }    
    
  function renderNote(pianoId, octave=4) {    
    
    const keyTable = KEY_MAP[currentKey];    
    if (!keyTable || !keyTable[pianoId]) return;    
    
    const { slot, acc, octaveShift = 0 } = keyTable[pianoId];
const realOctave = octave + octaveShift;
const step = realOctave*7 + STAFF_SLOT_INDEX[slot] - REF_STEP; 
    const y = trebleBottom - step * half;    
    
    if (y < trebleTop)    
      for (let yy=trebleTop-lineSpacing; yy>=y; yy-=lineSpacing) ledger(yy);    
      
    // ===== MIDDLE GAP LEDGERS =====
if (y > trebleBottom && y < bassTop) {
  for (let yy = trebleBottom + lineSpacing; yy <= y; yy += lineSpacing) {
    ledger(yy);
  }
}  
      
    if (y > bassBottom)    
      for (let yy=bassBottom+lineSpacing; yy<=y; yy+=lineSpacing) ledger(yy);    
    
    const head = document.createElementNS(SVG_NS,"ellipse");    
    head.setAttribute("cx",noteX);    
    head.setAttribute("cy",y);    
    head.setAttribute("rx",9);    
    head.setAttribute("ry",6);    
    head.setAttribute("transform",`rotate(-20 ${noteX} ${y})`);    
    head.setAttribute("fill","#000");    
    notesGroup.appendChild(head);    
    
// ===== STEM =====    
const stem = document.createElementNS(SVG_NS, "line");    
    
// simple rule: above middle line → stem down, else stem up    
const middleLineY = trebleTop + 2 * lineSpacing;    
const stemUp = y > middleLineY;    
    
if (stemUp) {    
  stem.setAttribute("x1", noteX + 8);    
  stem.setAttribute("x2", noteX + 8);    
  stem.setAttribute("y1", y);    
  stem.setAttribute("y2", y - 2.5 * lineSpacing);    
} else {    
  stem.setAttribute("x1", noteX - 8);    
  stem.setAttribute("x2", noteX - 8);    
  stem.setAttribute("y1", y);    
  stem.setAttribute("y2", y + 2.5 * lineSpacing);    
}    
    
stem.setAttribute("stroke", "#000");    
stem.setAttribute("stroke-width", "1.2");    
notesGroup.appendChild(stem);    
    
    if (acc !== "") {    
  const t = document.createElementNS(SVG_NS,"text");    
  t.setAttribute("x",noteX-16);    
  t.setAttribute("y",y+2);    
  t.setAttribute("font-size",25);    
  t.textContent =
  acc === "##" ? "\u{1D12A}" : // 𝄪 
  acc === "#"  ? "\u{266F}"  : // ♯
  acc === "b"  ? "\u{266D}"  : // ♭
  acc === "n"  ? "\u{266E}"  : "" ; // ♮;
t.setAttribute("class", "music-font");
  notesGroup.appendChild(t);    
}    
  }    
    
function redrawAllNotes() {    
  notesGroup.innerHTML = "";    
  for (const n of activeNotes.values()) {    
    renderNote(n.pianoId, n.octave);    
  }    
}    
    
  /* =======================    
     API    
  ======================= */    
  // BACKWARD-COMPATIBILITY BRIDGE    
// Accept original piano.js calls like "C#4", "F3", etc.    
    
function noteNameToPianoId(name) {    
  const m = /^([A-G])([#b]?)(\d+)$/.exec(name);    
  if (!m) return null;    
    
  const letter = m[1];    
  const acc = m[2];    
  const octave = +m[3];    
    
  const key = letter + (acc === "#" ? "SH" : acc === "b" ? "FL" : "");    
    
  const map = {    
    C: "a", CSH: "b",    
    D: "c", DSH: "d",    
    E: "e",    
    F: "f", FSH: "g",    
    G: "h", GSH: "i",    
    A: "j", ASH: "k",    
    B: "l"    
  };    
    
  return { id: map[key], octave };    
}    
    
// RESTORE ORIGINAL API    
window.staffNoteOn = function(noteName) {    
  const r = noteNameToPianoId(noteName);    
  if (!r) return;    
    
  const key = r.id + r.octave;    
  activeNotes.set(key, { pianoId: r.id, octave: r.octave });    
  redrawAllNotes();    
};    
    
window.staffNoteOff = function(noteName) {    
  const r = noteNameToPianoId(noteName);    
  if (!r) return;    
    
  const key = r.id + r.octave;    
  activeNotes.delete(key);    
  redrawAllNotes();    
};    
  window.staffSetKey = k => {

  if (window.__KEY_STATE__)
    window.__KEY_STATE__.setKey(k, "staff");

  currentKey = normalizeKey(k);
  notesGroup.innerHTML = "";
  drawStatic();

  if (window.__STAFF_RULER__)
    window.__STAFF_RULER__.redraw();
};

// ===== Listen to central key controller =====
if (window.__KEY_STATE__) {
  window.__KEY_STATE__.subscribe((newKey, source) => {

  if (source === "staff") return;

  currentKey = normalizeKey(newKey);

  notesGroup.innerHTML = "";
  drawStatic();

  if (window.__STAFF_RULER__)
    window.__STAFF_RULER__.redraw();

});
}

window.__STAFF_CONTEXT__ = {

  svg,
  SVG_NS,
  W,
  trebleBottom,
  half,
  currentKey: () => currentKey,

  getNoteY(slot, octave) {
    const REF_STEP = 4 * 7 + STAFF_SLOT_INDEX.E;
    const step = octave*7 + STAFF_SLOT_INDEX[slot] - REF_STEP;
    return trebleBottom - step * half;
  }

};
    
  
drawStatic();

return {
  root: container,
  onWheel(delta) {
    // later we’ll change key or octave here
  },
  onButton(action) {
    // later menu interaction
  }
};

};