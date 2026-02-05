window.openGameEngine = function(projectPath) {
  const hierarchy = [
    { id: "scene", name: "Scene", icon: "📦", children: [
      { id: "cam", name: "Main Camera", icon: "📷", children: [] },
      { id: "light", name: "Directional Light", icon: "💡", children: [] },
      { id: "player", name: "Player", icon: "🎮", children: [] },
    ]},
  ];

  let selectedId = "cam";

  function getInspectorHTML() {
    const names = { scene: "Scene", cam: "Main Camera", light: "Directional Light", player: "Player" };
    const name = names[selectedId] || "Object";
    return `
      <div class="ge-inspector-section">
        <div class="ge-inspector-head">${name}</div>
        <div class="ge-inspector-row">
          <label>Position</label>
          <div class="ge-vec3">
            <input type="number" value="0" step="0.1"><input type="number" value="0" step="0.1"><input type="number" value="0" step="0.1">
          </div>
        </div>
        <div class="ge-inspector-row">
          <label>Rotation</label>
          <div class="ge-vec3">
            <input type="number" value="0" step="0.1"><input type="number" value="0" step="0.1"><input type="number" value="0" step="0.1">
          </div>
        </div>
        <div class="ge-inspector-row">
          <label>Scale</label>
          <div class="ge-vec3">
            <input type="number" value="1" step="0.1"><input type="number" value="1" step="0.1"><input type="number" value="1" step="0.1">
          </div>
        </div>
      </div>
    `;
  }

  let projectName = "NewScene";

  function getDesktopChildren() {
    const folder = typeof getDesktopFolder === "function" ? getDesktopFolder() : null;
    return folder && folder.children ? folder.children : {};
  }

  function createNewFile(type) {
    const desktop = getDesktopChildren();
    const isScene = type === "scene";
    const ext = isScene ? "scene" : "gd";
    const defaultName = isScene ? "NewScene" : "NewScript";
    const base = defaultName;
    let name = base + "." + ext;
    let n = 1;
    while (desktop[name]) {
      name = base + "_" + (n++) + "." + ext;
    }
    const content = isScene
      ? JSON.stringify({ name: projectName, objects: ["Main Camera", "Directional Light"] }, null, 2)
      : `extends Node\n\nfunc _ready():\n    pass\n`;
    desktop[name] = { type: "file", content };
    if (typeof refreshDesktop === "function") refreshDesktop();
    return name;
  }

  const defaultHTML = `<div id="game"></div>
<!-- Your game HTML here. Use id="game" as root. -->`;
  const defaultJS = `// Your game JavaScript. Runs when the game loads.
const game = document.getElementById('game');
if (game) {
  game.innerHTML = '<h1>Hello Game!</h1><button id="btn">Click me</button>';
  document.getElementById('btn').onclick = () => alert('You clicked!');
}`;
  const defaultCSS = `* { box-sizing: border-box; }
body { margin: 0; padding: 16px; font-family: sans-serif; background: #1a1b1e; color: #e4e4e7; }
#game { min-height: 200px; }`;

  let gameHTML = defaultHTML;
  let gameJS = defaultJS;
  let gameCSS = defaultCSS;
  let gameIcon = "🎮";

  var iconOptions = ["🎮", "🚀", "📦", "⭐", "🎯", "🏆", "🎨", "🐱", "🎲", "🔮", "👾", "🕹️", "🌈", "🔥", "💎", "🎪", "🎭", "🧩", "🃏", "⚔️"];

  const contentHTML = `
    <div class="ge-app">
      <div class="ge-toolbar">
        <div class="ge-toolbar-left">
          <button type="button" class="ge-btn ge-btn-play" title="Play">▶ Play</button>
          <button type="button" class="ge-btn ge-btn-stop" title="Stop">⏹ Stop</button>
          <span class="ge-toolbar-sep"></span>
          <button type="button" class="ge-btn ge-btn-build" title="Build .mnx">⚙️ Build .mnx</button>
        </div>
        <div class="ge-toolbar-right">
          <label class="ge-project-name-label">Icon:</label>
          <div class="ge-icon-picker" id="ge-icon-picker">
            <button type="button" class="ge-icon-current" id="ge-icon-current" title="Game icon">${gameIcon}</button>
            <div class="ge-icon-dropdown" id="ge-icon-dropdown" hidden>
              ${iconOptions.map(function (ico) {
                return "<button type=\"button\" class=\"ge-icon-option" + (ico === gameIcon ? " selected" : "") + "\" data-icon=\"" + ico + "\">" + ico + "</button>";
              }).join("")}
            </div>
          </div>
          <label class="ge-project-name-label">Project:</label>
          <input type="text" class="ge-project-name-input" value="${projectName}" placeholder="Project name" title="Change project name">
          <span class="ge-toolbar-title">Monxit Engine</span>
        </div>
      </div>
      <div class="ge-main">
        <div class="ge-panel ge-hierarchy">
          <div class="ge-panel-head">Code</div>
          <div class="ge-code-tabs">
            <button type="button" class="ge-code-tab active" data-tab="html">HTML</button>
            <button type="button" class="ge-code-tab" data-tab="js">JavaScript</button>
            <button type="button" class="ge-code-tab" data-tab="css">CSS</button>
          </div>
          <div class="ge-code-panels">
            <textarea class="ge-code-editor active" id="ge-html-editor" spellcheck="false" placeholder="HTML..."></textarea>
            <textarea class="ge-code-editor" id="ge-js-editor" spellcheck="false" placeholder="JavaScript..."></textarea>
            <textarea class="ge-code-editor" id="ge-css-editor" spellcheck="false" placeholder="CSS..."></textarea>
          </div>
        </div>
        <div class="ge-panel ge-viewport">
          <div class="ge-panel-head ge-viewport-head">
            <span class="ge-viewport-title">Preview</span>
            <span class="ge-viewport-hint">Click Play to run your game</span>
          </div>
          <div class="ge-viewport-inner" id="ge-viewport-inner">
            <div class="ge-viewport-placeholder" id="ge-viewport-placeholder">
              <div class="ge-viewport-grid"></div>
              <div class="ge-viewport-label">Click ▶ Play to run</div>
            </div>
            <iframe class="ge-game-iframe" id="ge-game-iframe" hidden></iframe>
          </div>
        </div>
        <div class="ge-panel ge-inspector">
          <div class="ge-panel-head">Inspector</div>
          <div class="ge-inspector-body">${getInspectorHTML()}</div>
        </div>
      </div>
      <div class="ge-bottom">
        <div class="ge-panel ge-assets">
          <div class="ge-panel-head">Project Files</div>
          <div class="ge-assets-list" id="ge-assets-list"></div>
        </div>
      </div>
    </div>
  `;

  function runGame() {
    const htmlEl = win.querySelector("#ge-html-editor");
    const jsEl = win.querySelector("#ge-js-editor");
    const cssEl = win.querySelector("#ge-css-editor");
    const iframe = win.querySelector("#ge-game-iframe");
    const placeholder = win.querySelector("#ge-viewport-placeholder");
    if (!iframe || !placeholder) return;
    const html = (htmlEl && htmlEl.value) || defaultHTML;
    const js = (jsEl && jsEl.value) || defaultJS;
    const css = (cssEl && cssEl.value) || defaultCSS;
    const endScript = "</scr" + "ipt>";
    const doc = "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><style>" + css + "</style></head><body>" + html + "<script>" + js + endScript + "</body></html>";
    iframe.srcdoc = doc;
    iframe.hidden = false;
    placeholder.hidden = true;
  }

  function stopGame() {
    const iframe = win.querySelector("#ge-game-iframe");
    const placeholder = win.querySelector("#ge-viewport-placeholder");
    if (iframe) { iframe.srcdoc = ""; iframe.hidden = true; }
    if (placeholder) placeholder.hidden = false;
  }

  const win = document.createElement("div");
  win.className = "window ge-engine-window";
  win.style.width = "960px";
  win.style.height = "640px";
  const pos = window.getNextWindowPosition ? window.getNextWindowPosition() : { x: 120, y: 60 };
  win.style.left = pos.x + "px";
  win.style.top = pos.y + "px";

  win.innerHTML = `
    <div class="titlebar">
      <span class="titlebar-title">Monxit Engine</span>
      <div class="window-controls">
        <button type="button" class="window-btn min" aria-label="Minimize">
          <svg viewBox="0 0 12 12"><rect y="5" width="12" height="1"/></svg>
        </button>
        <button type="button" class="window-btn max" aria-label="Maximize">
          <svg viewBox="0 0 12 12"><rect x="1" y="1" width="10" height="10" stroke="currentColor" stroke-width="1" fill="none"/></svg>
        </button>
        <button type="button" class="window-btn close" aria-label="Close">
          <svg viewBox="0 0 12 12"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1"/></svg>
        </button>
      </div>
    </div>
    <div class="content ge-engine-content">${contentHTML}</div>
  `;

  document.getElementById("desktop").appendChild(win);

  win.querySelector("#ge-html-editor").value = gameHTML;
  win.querySelector("#ge-js-editor").value = gameJS;
  win.querySelector("#ge-css-editor").value = gameCSS;

  if (typeof updateTaskbarApps === "function") updateTaskbarApps();

  function refreshAssetsList() {
    const list = win.querySelector("#ge-assets-list");
    if (!list) return;
    list.innerHTML = Object.keys(getDesktopChildren())
      .map((name) => {
        const isScene = name.endsWith(".scene");
        const isScript = name.endsWith(".gd") || name.endsWith(".js");
        const icon = isScene ? "📦" : isScript ? "📜" : "📄";
        return `<div class="ge-asset-item"><span class="ge-asset-icon">${icon}</span><span>${name}</span></div>`;
      })
      .join("");
  }
  refreshAssetsList();


  win.querySelector(".ge-btn-play").addEventListener("click", () => {
    runGame();
  });

  win.querySelector(".ge-btn-stop").addEventListener("click", () => {
    stopGame();
  });

  // Code tabs
  win.querySelectorAll(".ge-code-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const t = tab.dataset.tab;
      win.querySelectorAll(".ge-code-tab").forEach((x) => x.classList.remove("active"));
      win.querySelectorAll(".ge-code-editor").forEach((x) => x.classList.remove("active"));
      tab.classList.add("active");
      const editor = win.querySelector("#ge-" + t + "-editor");
      if (editor) editor.classList.add("active");
    });
  });

  const projectNameInput = win.querySelector(".ge-project-name-input");
  if (projectNameInput) {
    projectNameInput.addEventListener("change", () => {
      projectName = projectNameInput.value.trim() || "NewScene";
    });
    projectNameInput.addEventListener("input", () => {
      projectName = projectNameInput.value.trim() || "NewScene";
    });
  }

  const iconCurrent = win.querySelector("#ge-icon-current");
  const iconDropdown = win.querySelector("#ge-icon-dropdown");
  if (iconCurrent && iconDropdown) {
    iconCurrent.addEventListener("click", function (e) {
      e.stopPropagation();
      iconDropdown.hidden = !iconDropdown.hidden;
    });
    win.querySelectorAll(".ge-icon-option").forEach(function (btn) {
      btn.addEventListener("click", function () {
        gameIcon = btn.dataset.icon || "🎮";
        iconCurrent.textContent = gameIcon;
        iconDropdown.hidden = true;
        win.querySelectorAll(".ge-icon-option").forEach(function (b) {
          b.classList.toggle("selected", b.dataset.icon === gameIcon);
        });
      });
    });
    document.addEventListener("click", function () {
      iconDropdown.hidden = true;
    });
    iconDropdown.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  }

  win.querySelector(".ge-btn-build").addEventListener("click", () => {
    const nameForBuild = (projectNameInput && projectNameInput.value.trim()) || projectName;
    const htmlEl = win.querySelector("#ge-html-editor");
    const jsEl = win.querySelector("#ge-js-editor");
    const cssEl = win.querySelector("#ge-css-editor");
    const html = (htmlEl && htmlEl.value) || defaultHTML;
    const js = (jsEl && jsEl.value) || defaultJS;
    const css = (cssEl && cssEl.value) || defaultCSS;
    const iconToSave = (iconCurrent && iconCurrent.textContent) || gameIcon;
    if (typeof buildMnxFile === "function") {
      buildMnxFile(null, nameForBuild, { html: html, js: js, css: css, icon: iconToSave });
      refreshAssetsList();
      win.querySelector(".ge-toolbar-title").textContent = "Monxit Engine — Built " + nameForBuild + ".mnx";
    }
  });

  const bar = win.querySelector(".titlebar");
  bar.onmousedown = function(e) {
    if (e.target.closest(".window-controls")) return;
    const offsetX = e.clientX - win.offsetLeft;
    const offsetY = e.clientY - win.offsetTop;
    document.onmousemove = function(moveE) {
      if (win.classList.contains("maximized")) return;
      win.style.left = (moveE.clientX - offsetX) + "px";
      win.style.top = (moveE.clientY - offsetY) + "px";
    };
    document.onmouseup = function() {
      document.onmousemove = null;
      document.onmouseup = null;
    };
  };
  bar.ondblclick = function(e) {
    if (e.target.closest(".window-controls")) return;
    win.classList.toggle("maximized");
    if (win.classList.contains("maximized")) {
      win.style.left = "";
      win.style.top = "";
    } else {
      const pos = window.getNextWindowPosition ? window.getNextWindowPosition() : { x: 120, y: 60 };
      win.style.left = pos.x + "px";
      win.style.top = pos.y + "px";
    }
  };
  win.querySelector(".window-btn.min").onclick = () => {
    win.style.display = "none";
    if (typeof updateTaskbarApps === "function") updateTaskbarApps();
  };
  win.querySelector(".window-btn.max").onclick = () => {
    win.classList.toggle("maximized");
    if (win.classList.contains("maximized")) { win.style.left = ""; win.style.top = ""; }
    else {
      const pos = window.getNextWindowPosition ? window.getNextWindowPosition() : { x: 120, y: 60 };
      win.style.left = pos.x + "px";
      win.style.top = pos.y + "px";
    }
    if (typeof updateTaskbarApps === "function") updateTaskbarApps();
  };
  win.querySelector(".window-btn.close").onclick = () => {
    win.remove();
    if (typeof updateTaskbarApps === "function") updateTaskbarApps();
  };
};
