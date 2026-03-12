// sruler.js — staff-aligned version
(function() {

function init() {

  if (!window.__STAFF_CONTEXT__) {
    requestAnimationFrame(init);
    return;
  }

  const { svg, SVG_NS, W, half, getNoteY } = window.__STAFF_CONTEXT__;

  /* =============================
     CONFIG
  ============================= */
  const CENTER_X = W - 40;
  const TICK = 16;

  const LETTERS = ["C","D","E","F","G","A","B"];
  const DIATONIC_SCALE = [
    { interval: 0, solfege: "d" },
    { interval: 2, solfege: "r" },
    { interval: 4, solfege: "m" },
    { interval: 5, solfege: "f" },
    { interval: 7, solfege: "s" },
    { interval: 9, solfege: "l" },
    { interval: 11, solfege: "t" }
  ];

function normalizeKey(k){

  if (!k) return null;

  const map = {
    "Cb":"C",
    "C#":"C",
    "Db":"D",
    "D#":"E",
    "Eb":"E",
    "E#":"F",
    "Fb":"F",
    "F#":"G",
    "Gb":"G",
    "G#":"A",
    "Ab":"A",
    "A#":"B",
    "Bb":"B",
    "B#":"B"
  };

  return map[k] || k[0];
}

  let rulerRoot = "C"; // tonic
  let dragging = false;
  let startY = 0;
  let startOffset = 0;
  let offset = 0;

  /* =============================
     SVG GROUPS
  ============================= */
  const gTicks = document.createElementNS(SVG_NS, "g");
  const gLabels = document.createElementNS(SVG_NS, "g");
  svg.appendChild(gTicks);
  svg.appendChild(gLabels);

  /* =============================
     DRAW FUNCTION
  ============================= */
  function draw() {

  gTicks.innerHTML = "";
  gLabels.innerHTML = "";

  // We'll render a range around the tonic
  const RANGE = 40; // steps above/below tonic

  // full chromatic notes to use for interval calculation
  const NOTES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];


  

  // find the tonic index in NOTES
  const rootIndex = NOTES.indexOf(rulerRoot);

  for (let step = -RANGE; step <= RANGE; step++) {

    // compute chromatic note index
    const noteIndex = (rootIndex + step + 12*10) % 12;
    const noteName = NOTES[noteIndex]; // e.g., "F#"

    // compute staff letter for Y-position
    // use natural letter from noteName (ignore accidental for staff line)
    const noteLetter = noteName[0]; // C,D,E,F,G,A,B

    // compute octave shift
    const octaveShift = 4 + Math.floor((rootIndex + step) / 12);

    // compute Y from staff.js
    const y = getNoteY(noteLetter, octaveShift) - offset * half;

    // --- Tick ---
    const line = document.createElementNS(SVG_NS,"line");
    line.setAttribute("x1", CENTER_X);
    line.setAttribute("x2", CENTER_X + TICK);
    line.setAttribute("y1", y);
    line.setAttribute("y2", y);
    line.setAttribute("stroke", "#111");
    line.setAttribute("stroke-width", 1);
    gTicks.appendChild(line);

    // --- Solfege label ---
    const interval = (noteIndex - rootIndex + 12) % 12;
    const degree = DIATONIC_SCALE.find(d => d.interval === interval);
    if (!degree) continue;

    const label = document.createElementNS(SVG_NS,"text");
    label.setAttribute("x", CENTER_X + TICK + 6);
    label.setAttribute("y", y + 4);
    label.setAttribute("font-size", "10");
    label.setAttribute("fill", "#111");
    label.textContent = degree.solfege;
    gLabels.appendChild(label);
  }
}

  /* =============================
     SNAP
  ============================= */
  function snap() {
    offset = Math.round(offset);
  }

  /* =============================
     DRAG FUNCTIONS
  ============================= */
  function startDrag(y) {
    dragging = true;
    startY = y;
    startOffset = offset;
  }

  function moveDrag(y) {
    if (!dragging) return;
    const dy = y - startY;
    offset = startOffset - dy / half;
    draw();
  }

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    snap();
    draw();
  }

  /* =============================
     MOUSE & TOUCH EVENTS
  ============================= */
 /* svg.addEventListener("mousedown", e => startDrag(e.clientY));
  window.addEventListener("mousemove", e => moveDrag(e.clientY));
  window.addEventListener("mouseup", endDrag);

  svg.addEventListener("touchstart", e => startDrag(e.touches[0].clientY), { passive: true });
  window.addEventListener("touchmove", e => {
  e.preventDefault();
  moveDrag(e.touches[0].clientY);
}, { passive: false });
  window.addEventListener("touchend", endDrag); */
  /* =============================
     PUBLIC API
  ============================= */
  window.srulerSetTonic = function(newTonic) {

  newTonic = normalizeKey(newTonic);

  if (!LETTERS.includes(newTonic)) return;

  rulerRoot = newTonic;
  draw();
}

if (window.__KEY_STATE__) {

  window.__KEY_STATE__.subscribe((newKey, source) => {

    if (source === "sruler") return;

    newKey = normalizeKey(newKey);

    if (!LETTERS.includes(newKey)) return;

    rulerRoot = newKey;
    draw();

  });

}

window.__STAFF_RULER__ = {
  redraw: draw
};

  /* =============================
     INITIAL DRAW
  ============================= */
  draw();
}

init();

})();