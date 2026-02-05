window.saveTextFile = function(btn) {
  const wrap = btn.closest(".txt-editor-wrap");
  if (!wrap) return;
  const path = wrap.dataset.folderPath;
  const fileName = wrap.dataset.fileName;
  const ta = wrap.querySelector("textarea");
  if (!ta) return;
  const folder = path ? getFolderByPath(path) : getDesktopFolder();
  if (!folder || !folder.children || !folder.children[fileName]) return;
  folder.children[fileName].content = ta.value;
  if (typeof persistFilesystem === "function") persistFilesystem();
  const status = wrap.querySelector(".txt-save-status");
  if (status) {
    status.textContent = "Saved";
    status.className = "txt-save-status saved";
    setTimeout(function() { status.textContent = ""; }, 2000);
  }
};

window.openFile = function(name, folderPath) {
  const folder = folderPath != null
    ? getFolderByPath(folderPath)
    : getDesktopFolder();
  if (!folder || !folder.children || !folder.children[name]) return;

  const file = folder.children[name];

  if (name.endsWith(".txt")) {
    const folderPathForSave = folderPath != null ? folderPath : (typeof getDesktopPath === "function" ? getDesktopPath() : "");
    const pathAttr = (folderPathForSave || "").replace(/"/g, "&quot;");
    const nameAttr = (name || "").replace(/"/g, "&quot;");
    var raw = file.content || "";
    var safe = raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    createWindow(name, "<div class=\"txt-editor-wrap\" data-folder-path=\"" + pathAttr + "\" data-file-name=\"" + nameAttr + "\"><div class=\"txt-editor-toolbar\"><button type=\"button\" class=\"txt-save-btn\" onclick=\"saveTextFile(this)\">Save</button><span class=\"txt-save-status\" id=\"txt-save-status\"></span></div><textarea class=\"txt-editor-area\" spellcheck=\"false\">" + safe + "</textarea></div>");
    return;
  }

  if (name.endsWith(".mnx")) {
    openMnxApp(name, file);
    return;
  }

  if (name.endsWith(".scene") || name.endsWith(".gd")) {
    openGameEngine(name);
    return;
  }

  createWindow(name, `<pre style="padding:12px;font-size:12px;white-space:pre-wrap;word-break:break-all">${(file.content || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>`);
};

window.openMnxApp = function(fileName, file) {
  let data = { name: "App", source: fileName, version: "1.0.0" };
  try {
    if (typeof file.content === "string") {
      data = JSON.parse(file.content);
    } else {
      data = file.content;
    }
  } catch (_) {
    data.name = file.content || "App";
  }

  const appName = data.name || fileName.replace(".mnx", "");
  const appIcon = data.icon != null ? data.icon : "🚀";
  const hasGame = data.html != null || data.js != null;

  if (hasGame) {
    const html = data.html || "<div id=\"game\"></div>";
    const js = data.js || "";
    const css = data.css || "";
    const endScript = "</scr" + "ipt>";
    const doc = "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><style>" + css + "</style></head><body>" + html + "<script>" + js + endScript + "</body></html>";

    const win = document.createElement("div");
    win.className = "window mnx-game-window";
    const pos = window.getNextWindowPosition ? window.getNextWindowPosition() : { x: 120, y: 60 };
    win.style.left = pos.x + "px";
    win.style.top = pos.y + "px";
    win.style.width = "800px";
    win.style.height = "600px";

    win.innerHTML = `
      <div class="titlebar">
        <span class="titlebar-icon">${appIcon}</span>
        <span class="titlebar-title">${appName}</span>
        <div class="window-controls">
          <button type="button" class="window-btn min" aria-label="Minimize"><svg viewBox="0 0 12 12"><rect y="5" width="12" height="1"/></svg></button>
          <button type="button" class="window-btn max" aria-label="Maximize"><svg viewBox="0 0 12 12"><rect x="1" y="1" width="10" height="10" stroke="currentColor" stroke-width="1" fill="none"/></svg></button>
          <button type="button" class="window-btn close" aria-label="Close"><svg viewBox="0 0 12 12"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1"/></svg></button>
        </div>
      </div>
      <div class="content mnx-game-content">
        <iframe class="mnx-game-iframe" id="mnx-game-iframe" sandbox="allow-scripts allow-same-origin"></iframe>
      </div>
    `;

    document.getElementById("desktop").appendChild(win);

    const iframe = win.querySelector("#mnx-game-iframe");
    if (iframe) iframe.srcdoc = doc;

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
    win.querySelector(".window-btn.min").onclick = () => { win.style.display = "none"; if (typeof updateTaskbarApps === "function") updateTaskbarApps(); };
    win.querySelector(".window-btn.max").onclick = () => {
      win.classList.toggle("maximized");
      if (win.classList.contains("maximized")) { win.style.left = ""; win.style.top = ""; win.style.width = ""; win.style.height = ""; }
      else { win.style.left = pos.x + "px"; win.style.top = pos.y + "px"; win.style.width = "800px"; win.style.height = "600px"; }
      if (typeof updateTaskbarApps === "function") updateTaskbarApps();
    };
    win.querySelector(".window-btn.close").onclick = () => { win.remove(); if (typeof updateTaskbarApps === "function") updateTaskbarApps(); };

    if (typeof updateTaskbarApps === "function") updateTaskbarApps();
    return;
  }

  const contentHTML = `
    <div class="mnx-launcher">
      <div class="mnx-launcher-header">
        <span class="mnx-launcher-icon">🚀</span>
        <h2 class="mnx-launcher-title">${appName}</h2>
      </div>
      <div class="mnx-launcher-info">
        <p><strong>Source</strong> ${data.source || "—"}</p>
        <p><strong>Version</strong> ${data.version || "1.0.0"}</p>
        ${data.buildDate ? `<p><strong>Built</strong> ${new Date(data.buildDate).toLocaleString()}</p>` : ""}
      </div>
      <div class="mnx-launcher-actions">
        <button type="button" class="mnx-launcher-btn" id="mnx-launch-btn">Launch</button>
      </div>
      <div class="mnx-launcher-status" id="mnx-launcher-status" hidden></div>
    </div>
  `;

  const win = document.createElement("div");
  win.className = "window";
  const pos = window.getNextWindowPosition ? window.getNextWindowPosition() : { x: 200, y: 80 };
  win.style.left = pos.x + "px";
  win.style.top = pos.y + "px";
  win.style.width = "400px";

  win.innerHTML = `
    <div class="titlebar">
      <span class="titlebar-title">${appName}</span>
      <div class="window-controls">
        <button type="button" class="window-btn min" aria-label="Minimize"><svg viewBox="0 0 12 12"><rect y="5" width="12" height="1"/></svg></button>
        <button type="button" class="window-btn max" aria-label="Maximize"><svg viewBox="0 0 12 12"><rect x="1" y="1" width="10" height="10" stroke="currentColor" stroke-width="1" fill="none"/></svg></button>
        <button type="button" class="window-btn close" aria-label="Close"><svg viewBox="0 0 12 12"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1"/></svg></button>
      </div>
    </div>
    <div class="content">${contentHTML}</div>
  `;

  document.getElementById("desktop").appendChild(win);

  const statusEl = win.querySelector("#mnx-launcher-status");
  win.querySelector("#mnx-launch-btn").onclick = () => {
    statusEl.hidden = false;
    statusEl.textContent = `Running ${appName}...`;
    statusEl.className = "mnx-launcher-status mnx-launcher-status-running";
    setTimeout(() => {
      statusEl.textContent = `${appName} is running.`;
    }, 800);
  };

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
  win.querySelector(".window-btn.min").onclick = () => { win.style.display = "none"; if (typeof updateTaskbarApps === "function") updateTaskbarApps(); };
  win.querySelector(".window-btn.max").onclick = () => {
    win.classList.toggle("maximized");
    if (win.classList.contains("maximized")) { win.style.left = ""; win.style.top = ""; }
    else { win.style.left = pos.x + "px"; win.style.top = pos.y + "px"; }
    if (typeof updateTaskbarApps === "function") updateTaskbarApps();
  };
  win.querySelector(".window-btn.close").onclick = () => { win.remove(); if (typeof updateTaskbarApps === "function") updateTaskbarApps(); };

  if (typeof updateTaskbarApps === "function") updateTaskbarApps();
};
