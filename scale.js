// scale.js
(function(){

  // ===== CSS =====
  const keyCss = `
#scale-select-wrapper {
  position: relative;
  z-index: 9999;
  padding: 0px 0px;
  border-radius: 0px;
  align-items: center;
  width:60%;
  height: auto;
}

#global-scale-selector {
  border: none;
  color: #000;
  background: #d9d9d9;
  font-size: 1.5rem;
  outline: none;
  display: inline-block;
  width:100%;
  height: 100%;
}
`;
  const style = document.createElement("style");
  style.textContent = keyCss;
  document.head.appendChild(style);

  // ===== DOM =====
  const wrapper = document.createElement("div");
wrapper.id = "scale-select-wrapper";
wrapper.style.flex = "0 0 auto"; // prevents shrinking if you want fixed width
document.getElementById("left-column").appendChild(wrapper);

  wrapper.innerHTML = `
    <select id="global-scale-selector">
      <option value="diatonic">Diatonic</option>
      <option value="chromatic">Chromatic</option>
      <option value="pentatonic">Pentatonic</option>
      <option value="blues">Blues</option>
    </select>
  `;


  const selector = document.getElementById("global-scale-selector");

  // ===== State =====
  let currentScale = selector.value;

  // ===== Notify listeners =====
  function notify(scale){
    if (window.rulerSetScale) window.rulerSetScale(scale);
    if (window.pianoSetKey) window.pianoSetKey(scale);
    if (window.staffSetKey) window.staffSetKey(scale);
    if (window.keySetKey) window.keySetKey(scale);
  }

  // ===== Event listener =====
  selector.addEventListener("change", e => {
    currentScale = e.target.value;
    notify(currentScale);
  });

  // ===== Initial broadcast =====
  notify(currentScale);

})();