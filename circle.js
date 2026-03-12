(function(){

  const circleCss = `
#circle-wrapper {
  z-index: 10;
  position: relative;
  aspect-ratio: 1/1;
  width: 90%;
}

#circle-wrapper svg {
  width: 100%;
  height: 100%;
  touch-action: none;
}

.wedge {
  fill: #d9d9d9;
  stroke: #111;
  stroke-width: 2;
}

.label {
  font-family: system-ui, sans-serif;
  font-weight: 700;
  font-size: 75px;
  text-anchor: middle;
  dominant-baseline: middle;
  pointer-events: none;
  user-select: none;
}

.outer-ring {
  fill: none;
  stroke: #111;
  stroke-width: 8;
}
`;

let visualRotation = 0;
let labelGroups = [];
let circleSide = 0; 
// 0 = undecided (at C)
// 1 = sharp side (fifths)
// -1 = flat side (fourths)

const style = document.createElement("style");
style.textContent = circleCss;
document.head.appendChild(style);

const wrapper = document.createElement("div");
wrapper.id = "circle-wrapper";
wrapper.style.flex = "0 0 auto";
document.getElementById("left-column").appendChild(wrapper);

const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
svg.setAttribute("viewBox","0 0 800 800");
wrapper.appendChild(svg);

const wheelGroup = document.createElementNS("http://www.w3.org/2000/svg","g");
svg.appendChild(wheelGroup);

const cx = 400, cy = 400;
const outerRadius = 360, innerRadius = 200;
const step = (Math.PI*2)/12;

let fifthsCount = 0;
let dialIndex = 0;

let isDragging = false;
let lastAngle = null;
let lastDirection = 1;

const keyMap = {
0:"C",
1:"G",
2:"D",
3:"A",
4:"E",
5:"B",
6:"F#",
7:"C#",
8:"Ab",
9:"Eb",
10:"Bb",
11:"F"
};

const reverseKeyMap = {};
Object.entries(keyMap).forEach(([i,k])=>{
  reverseKeyMap[k]=parseInt(i);
});

function normalizeKeyForCircle(key){

  const enharmonic = {
    "D#":"Eb",
    "G#":"Ab",
    "A#":"Bb",
  };

  return enharmonic[key] || key;
}

function getKeyName(){

  const sharpSide = [
    "C","G","D","A","E","B","F#","C#","Ab","Eb","Bb","F"
  ];

  const flatSide = [
    "C","G","D","A","E","Cb","Gb","Db","Ab","Eb","Bb","F"
  ];

  if(circleSide === -1){
    return flatSide[dialIndex];
  }

  return sharpSide[dialIndex];
}

function polar(angle,r){
  return {
    x: cx + r*Math.cos(angle),
    y: cy + r*Math.sin(angle)
  };
}

function createWedge(start,end){
  const p1=polar(start,outerRadius);
  const p2=polar(end,outerRadius);
  const p3=polar(end,innerRadius);
  const p4=polar(start,innerRadius);

  return `
M ${p1.x} ${p1.y}
A ${outerRadius} ${outerRadius} 0 0 1 ${p2.x} ${p2.y}
L ${p3.x} ${p3.y}
A ${innerRadius} ${innerRadius} 0 0 0 ${p4.x} ${p4.y}
Z`;
}

function getAngle(x,y){
  const rect = svg.getBoundingClientRect();
  const px = x - rect.left;
  const py = y - rect.top;
  return Math.atan2(py - rect.height/2, px - rect.width/2);
}

function updateCenterAndBroadcast(){

  const key = getKeyName();
  centerText.textContent = key;

  if(window.__KEY_STATE__){
    window.__KEY_STATE__.setKey(key,"circle");
  }
}

function computeDialIndex(){
  dialIndex=((fifthsCount%12)+12)%12;
}

const outerCircle=document.createElementNS("http://www.w3.org/2000/svg","circle");
outerCircle.setAttribute("cx",cx);
outerCircle.setAttribute("cy",cy);
outerCircle.setAttribute("r",outerRadius);
outerCircle.setAttribute("class","outer-ring");
wheelGroup.appendChild(outerCircle);

const displayKeys=[
{primary:"C"},
{primary:"G"},
{primary:"D"},
{primary:"A"},
{primary:"E"},
{primary:"B",enharmonic:"C♭"},
{primary:"F♯",enharmonic:"G♭"},
{primary:"C♯",enharmonic:"D♭"},
{primary:"A♭"},
{primary:"E♭"},
{primary:"B♭"},
{primary:"F"}
];

displayKeys.forEach((key,i)=>{

const baseStart=-Math.PI/2-step/2;
const start=baseStart+i*step;
const end=start+step;
const mid=start+step/2;

const path=document.createElementNS("http://www.w3.org/2000/svg","path");
path.setAttribute("d",createWedge(start,end));
path.setAttribute("class","wedge");
wheelGroup.appendChild(path);

const labelPos=polar(mid,(outerRadius+innerRadius)/2);

const labelGroup=document.createElementNS("http://www.w3.org/2000/svg","g");
labelGroup.setAttribute("transform",`translate(${labelPos.x},${labelPos.y})`);

const text=document.createElementNS("http://www.w3.org/2000/svg","text");
text.setAttribute("class","label");
text.setAttribute("x",0);
text.setAttribute("y",0);

if(key.enharmonic){

const t1=document.createElementNS("http://www.w3.org/2000/svg","tspan");
t1.setAttribute("x",0);
t1.setAttribute("dy","-0.3em");
t1.textContent=key.primary;

const t2=document.createElementNS("http://www.w3.org/2000/svg","tspan");
t2.setAttribute("x",0);
t2.setAttribute("dy","0.85em");
t2.textContent=key.enharmonic;

text.appendChild(t1);
text.appendChild(t2);

}else{
text.textContent=key.primary;
}

labelGroup.appendChild(text);
wheelGroup.appendChild(labelGroup);
labelGroups.push(labelGroup);

});

const centerButton=document.createElementNS("http://www.w3.org/2000/svg","circle");
centerButton.setAttribute("cx",cx);
centerButton.setAttribute("cy",cy);
centerButton.setAttribute("r",innerRadius);
centerButton.setAttribute("fill","#ffffff");
centerButton.setAttribute("stroke","#111");
centerButton.setAttribute("stroke-width","6");
svg.appendChild(centerButton);

const centerText=document.createElementNS("http://www.w3.org/2000/svg","text");
centerText.setAttribute("x",cx);
centerText.setAttribute("y",cy);
centerText.setAttribute("text-anchor","middle");
centerText.setAttribute("dy","0.35em");
centerText.setAttribute("font-weight","700");
centerText.setAttribute("font-family","system-ui,sans-serif");
centerText.setAttribute("font-size",innerRadius*1);
centerText.textContent="C";
svg.appendChild(centerText);

updateCenterAndBroadcast();

svg.addEventListener("pointerdown",(e)=>{
svg.setPointerCapture(e.pointerId);
isDragging=true;
lastDirection=1;
lastAngle=getAngle(e.clientX,e.clientY);
});

svg.addEventListener("pointermove",(e)=>{

if(!isDragging)return;

const angle=getAngle(e.clientX,e.clientY);

let delta=angle-lastAngle;

if(delta>Math.PI)delta-=Math.PI*2;
if(delta<-Math.PI)delta+=Math.PI*2;

const deltaDeg=delta*(180/Math.PI);

lastDirection=Math.sign(deltaDeg)||lastDirection;

// lock which side of the circle we're on when leaving C
if(circleSide === 0 && dialIndex === 0){

  if(lastDirection < 0){
    circleSide = 1;   // fifths / sharps side
  }else if(lastDirection > 0){
    circleSide = -1;  // fourths / flats side
  }

}

visualRotation+=deltaDeg;

wheelGroup.setAttribute(
"transform",
`rotate(${visualRotation} 400 400)`
);

labelGroups.forEach(group=>{
group.setAttribute(
"transform",
group.getAttribute("transform").split(" rotate")[0] +
` rotate(${-visualRotation})`
);
});

lastAngle=angle;

});

svg.addEventListener("pointerup",()=>{

if(!isDragging)return;
isDragging=false;

const stepAngle=30;

const snappedSteps=Math.round(visualRotation/stepAngle);

fifthsCount=-snappedSteps;

computeDialIndex();
if(dialIndex === 0){
  circleSide = 0;
}

visualRotation=-dialIndex*stepAngle;

wheelGroup.setAttribute(
"transform",
`rotate(${visualRotation} 400 400)`
);

labelGroups.forEach(group=>{
group.setAttribute(
"transform",
group.getAttribute("transform").split(" rotate")[0] +
` rotate(${-visualRotation})`
);
});

updateCenterAndBroadcast();

});

svg.addEventListener("pointerleave",()=>{
isDragging=false;
});

if(window.__KEY_STATE__){

window.__KEY_STATE__.subscribe((newKey,source)=>{

if(source==="circle")return;

const normalizedKey = normalizeKeyForCircle(newKey);

const newIndex = reverseKeyMap[normalizedKey];
if(newIndex===undefined)return;

fifthsCount=newIndex;

computeDialIndex();

visualRotation=-dialIndex*30;

wheelGroup.setAttribute(
"transform",
`rotate(${visualRotation} 400 400)`
);

labelGroups.forEach(group=>{
group.setAttribute(
"transform",
group.getAttribute("transform").split(" rotate")[0] +
` rotate(${-visualRotation})`
);
});

centerText.textContent=normalizedKey;

});

}

})();