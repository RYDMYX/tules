// screen.js — LCD Device Layer

(function () {

  /* ==========================
     CSS (Device Only)
  ========================== */
  const css = `
  #screen {
    background: #fff;
    border-radius: 10%;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);

    display: flex;
    align-items: center;
    justify-content: center;

    overflow: hidden;
    margin: 0;
    position: relative;
    height: 100%;

    aspect-ratio: 158 / 138;
  }

  
  `;

  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  /* ==========================
     CREATE DEVICE
  ========================== */

  const container = document.createElement("div");
container.id = "screen";
container.style.flex = "0 0 auto";  // optional: prevent shrinking

document.getElementById("center-column").appendChild(container);

  let activeView = null;

  /* ==========================
     PUBLIC API
  ========================== */

  window.__SCREEN__ = {

    show(viewFactory) {
      container.innerHTML = "";
      activeView = viewFactory();
      container.appendChild(activeView.root);
    },

    wheel(delta) {
      if (activeView?.onWheel)
        activeView.onWheel(delta);
    },

    button(action) {
      if (activeView?.onButton)
        activeView.onButton(action);
    },

    getElement() {
      return container;
    }
  };
  
  
  
  /* ==========================
   SIMPLE MODE CONTROLLER
========================== */

window.__UI__ = (function () {

  let currentMode = null;

  // Persistent view cache
  const viewInstances = {};

  function getView(mode) {
    if (viewInstances[mode]) {
      return viewInstances[mode];
    }

    if (mode === "staff" && window.createStaffView) {
      viewInstances[mode] = window.createStaffView();
    }

    if (mode === "scales" && window.createScalesView) {
      viewInstances[mode] = window.createScalesView();
    }

    if (mode === "keys" && window.createKeysView) {
      viewInstances[mode] = window.createKeysView();
    }

    return viewInstances[mode];
  }

  function setMode(mode) {
    currentMode = mode;

    const view = getView(mode);

    if (!view) return;

    __SCREEN__.getElement().innerHTML = "";
    __SCREEN__.getElement().appendChild(view.root);

    // IMPORTANT: set activeView inside screen
    __SCREEN__.show(() => view);
  }

  return {
    setMode,
    getMode: () => currentMode
  };

})();

/* ==========================
   TEST MODE SWITCH
========================== */

// Change this value to test menus
const TEST_MODE = "staff"; 
// "staff" | "scales" | "keys"

window.addEventListener("load", () => {
  __UI__.setMode(TEST_MODE);
});
})();