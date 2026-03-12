//pianoui.js
(function(){

if(!window.piano){
  console.warn("pianoui requires piano.js");
  return;
}

const css = `
*{
  -webkit-tap-highlight-color: transparent;
}


#scrollbar-container{
display:flex;
align-items:stretch;
justify-content:space-between;
gap:0.3rem;
margin:0 0 0.2rem 0;
width:100%;
flex:0 0 12%;
padding:0 1%;
box-sizing:border-box;
}

.scroll-group{
display:flex;
align-items:stretch;
gap:0.3rem;
}

#piano-scrollbar{
height:100%;
background:#ccc;
border-radius:1rem;
flex:6;
position:relative;
cursor:pointer;
}

#piano-scroll-thumb{
height:100%;
background:#888;
border-radius:1rem;
position:absolute;
left:0;
min-width:0rem;
}

#zoom-out,#zoom-in,
#scroll-left-key,#scroll-right-key,
#scroll-left-octave,#scroll-right-octave{

flex:1;
aspect-ratio:1/1;
font-size:2rem;
cursor:pointer;

border:0.05em solid #999;
border-radius:0.3rem;
background:#eee;

display:flex;
align-items:center;
justify-content:center;
}

#piano-scrollbar,
#piano-scroll-thumb{
  user-select:none;
  -webkit-user-select:none;
  touch-action:none;
}

#piano-scroll-thumb{
  transition: background 0.15s;
}

#piano-scroll-thumb:hover{
  background:#666;
}

#piano-scroll-thumb:active{
  background:#555;
}

`;

const style=document.createElement("style");
style.textContent=css;
document.head.appendChild(style);



const pianoUnit=document.getElementById("piano-unit");

const bar=document.createElement("div");
bar.id="scrollbar-container";


const left=document.createElement("div");
left.className="scroll-group";

const lOct=document.createElement("button");
lOct.id="scroll-left-octave";
lOct.textContent="<<";

const lKey=document.createElement("button");
lKey.id="scroll-left-key";
lKey.textContent="<";

const zoomOut=document.createElement("button");
zoomOut.id="zoom-out";
zoomOut.textContent="-";

left.append(lOct,lKey,zoomOut);


const scrollTrack=document.createElement("div");
scrollTrack.id="piano-scrollbar";

const thumb=document.createElement("div");
thumb.id="piano-scroll-thumb";

scrollTrack.appendChild(thumb);


const right=document.createElement("div");
right.className="scroll-group";

const zoomIn=document.createElement("button");
zoomIn.id="zoom-in";
zoomIn.textContent="+";

const rKey=document.createElement("button");
rKey.id="scroll-right-key";
rKey.textContent=">";

const rOct=document.createElement("button");
rOct.id="scroll-right-octave";
rOct.textContent=">>";

right.append(zoomIn,rKey,rOct);

bar.append(left,scrollTrack,right);

pianoUnit.prepend(bar);



/* hook events */

zoomIn.onclick=()=>piano.zoomKeys(1.2);
zoomOut.onclick=()=>piano.zoomKeys(1/1.2);

lKey.onclick=()=>piano.scrollKeyLeft();
rKey.onclick=()=>piano.scrollKeyRight();

lOct.onclick=()=>piano.scrollOctLeft();
rOct.onclick=()=>piano.scrollOctRight();



/* attach thumb to piano core */

window.scrollBar=scrollTrack;
window.scrollThumb=thumb;

let dragging = false;
let startX = 0;
let startLeft = 0;

document.addEventListener("pointerup", ()=>{
  dragging = false;
});

thumb.addEventListener("pointerdown", e=>{
  dragging = true;
  startX = e.clientX;
  startLeft = thumb.offsetLeft;
  thumb.setPointerCapture(e.pointerId);
});

thumb.addEventListener("pointermove", e=>{
  if(!dragging) return;

  const dx = e.clientX - startX;

  const trackWidth = scrollTrack.clientWidth;
  const thumbWidth = thumb.clientWidth;

  let newLeft = startLeft + dx;

  newLeft = Math.max(0, Math.min(newLeft, trackWidth - thumbWidth));

  thumb.style.left = newLeft + "px";

  const ratio = newLeft / (trackWidth - thumbWidth);

  const maxScroll =
    piano.pianoWrapper.scrollWidth -
    piano.pianoWrapper.clientWidth;

  piano.pianoWrapper.scrollLeft = ratio * maxScroll;
});

thumb.addEventListener("pointerup", ()=>{
  dragging = false;
});

scrollTrack.addEventListener("pointerdown", e=>{
  
  e.preventDefault();

  if(e.target === thumb) return;

  const rect = scrollTrack.getBoundingClientRect();

  const clickX = e.clientX - rect.left;

  const trackWidth = scrollTrack.clientWidth;
  const thumbWidth = thumb.clientWidth;

  const ratio = clickX / trackWidth;

  const maxScroll =
    piano.pianoWrapper.scrollWidth -
    piano.pianoWrapper.clientWidth;

  piano.pianoWrapper.scrollLeft = ratio * maxScroll;

});

piano.notifyLayoutChange();

})();