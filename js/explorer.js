let currentExplorerPath = "C:";
let explorerHistory = ["C:"];
let explorerHistoryIndex = 0;

window.getFileIcon = function(name) {
  if (name.endsWith(".txt")) return "📄";
  if (name.endsWith(".mnx")) return "🚀";
  if (name.endsWith(".scene")) return "📦";
  if (name.endsWith(".gd") || name.endsWith(".js")) return "📜";
  if (name.endsWith(".dll") || name.endsWith(".exe") || name.endsWith(".drv")) return "⚙️";
  if (name.endsWith(".ini") || name.endsWith(".cfg")) return "⚙️";
  return "📄";
};

window.openExplorer = function(path) {
  if (!path) path = currentExplorerPath || "C:";
  currentExplorerPath = path;
  
  const folder = getFolderByPath(path);
  if (!folder) {
    path = "C:";
    currentExplorerPath = "C:";
  }
  
  const pathDisplay = getPathString(path);
  let items = "";
  
  const desktopPath = typeof getDesktopPath === "function" ? getDesktopPath() : null;

  if (path === "/") {
    items = `
      <div class="explorer-item" data-path="C:" onclick="navigateTo('C:')">
        <span class="icon">💿</span>
        <span>Local Disk (C:)</span>
      </div>
    `;
    if (desktopPath) {
      items += `
        <div class="explorer-item" data-path="${desktopPath}" onclick="navigateTo('${desktopPath}')">
          <span class="icon">🖥️</span>
          <span>Desktop</span>
        </div>
      `;
      const desktopFolder = getFolderByPath(desktopPath);
      if (desktopFolder && desktopFolder.children) {
        for (let name in desktopFolder.children) {
          const item = desktopFolder.children[name];
          const isFolder = item.type === "folder";
          items += `
            <div class="explorer-item" onclick="openFileFromPath('${desktopPath}', '${name}')">
              <span class="icon">${isFolder ? "📁" : getFileIcon(name)}</span>
              <span>${name}</span>
            </div>
          `;
        }
      }
    }
  } else {
    // Navigate folder structure
    const currentFolder = getFolderByPath(path);
    if (currentFolder && currentFolder.children) {
      for (let name in currentFolder.children) {
        const item = currentFolder.children[name];
        const isFolder = item.type === "folder";
        const itemPath = path === "C:" ? `C:/${name}` : `${path}/${name}`;
        items += `
          <div class="explorer-item" ${isFolder ? `data-path="${itemPath}" onclick="navigateTo('${itemPath}')"` : `onclick="openFileFromPath('${path}', '${name}')"`}>
            <span class="icon">${isFolder ? "📁" : getFileIcon(name)}</span>
            <span>${name}</span>
          </div>
        `;
      }
    }
    
    // Add "Up" navigation if not at root
    if (path !== "C:" && path !== "/") {
      const parentPath = path.includes("/") ? path.substring(0, path.lastIndexOf("/")) : "C:";
      items = `
        <div class="explorer-item explorer-up" data-path="${parentPath}" onclick="navigateTo('${parentPath}')">
          <span class="icon">⬆️</span>
          <span>..</span>
        </div>
      ` + items;
    }
    
    // Add "This PC" navigation option
    if (path !== "/" && path !== "C:") {
      items = `
        <div class="explorer-item" data-path="/" onclick="navigateTo('/')">
          <span class="icon">💻</span>
          <span>This PC</span>
        </div>
      ` + items;
    }
  }
  
  const canGoBack = explorerHistoryIndex > 0;
  const canGoForward = explorerHistoryIndex < explorerHistory.length - 1;
  
  const contentHTML = `
    <div class="explorer-toolbar">
      <button type="button" class="explorer-btn explorer-btn-back" onclick="explorerGoBack()" title="Back" ${!canGoBack ? "disabled" : ""}>←</button>
      <button type="button" class="explorer-btn explorer-btn-forward" onclick="explorerGoForward()" title="Forward" ${!canGoForward ? "disabled" : ""}>→</button>
      <button type="button" class="explorer-btn explorer-btn-up" onclick="explorerGoUp()" title="Up">↑</button>
      <input type="text" class="explorer-address" value="${pathDisplay}" id="explorer-address-${Date.now()}" readonly>
    </div>
    <div class="explorer-content">${items || "<div class=\"explorer-item\"><span>This folder is empty</span></div>"}</div>
  `;
  
  // Check if explorer window already exists
  const existingExplorer = document.querySelector(".explorer-window");
  if (existingExplorer) {
    existingExplorer.querySelector(".explorer-content").innerHTML = items || "<div class=\"explorer-item\"><span>This folder is empty</span></div>";
    existingExplorer.querySelector(".explorer-address").value = pathDisplay;
    existingExplorer.querySelector(".titlebar-title").textContent = "File Explorer";
    existingExplorer.dataset.explorerPath = path;
    if (typeof updateTaskbarApps === "function") updateTaskbarApps();
    return;
  }
  
  const win = document.createElement("div");
  win.className = "window explorer-window";
  win.style.width = "800px";
  win.style.height = "500px";
  const pos = window.getNextWindowPosition ? window.getNextWindowPosition() : { x: 200, y: 80 };
  win.style.left = pos.x + "px";
  win.style.top = pos.y + "px";
  
  win.innerHTML = `
    <div class="titlebar">
      <span class="titlebar-title">File Explorer</span>
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
    <div class="content">${contentHTML}</div>
  `;
  
  document.getElementById("desktop").appendChild(win);
  setupWindowControls(win);
  updateTaskbarApps();
};

window.navigateTo = function(path) {
  explorerHistory = explorerHistory.slice(0, explorerHistoryIndex + 1);
  explorerHistory.push(path);
  explorerHistoryIndex = explorerHistory.length - 1;
  currentExplorerPath = path;
  openExplorer(path);
};

window.explorerGoBack = function() {
  if (explorerHistoryIndex > 0) {
    explorerHistoryIndex--;
    currentExplorerPath = explorerHistory[explorerHistoryIndex];
    openExplorer(currentExplorerPath);
  }
};

window.explorerGoForward = function() {
  if (explorerHistoryIndex < explorerHistory.length - 1) {
    explorerHistoryIndex++;
    currentExplorerPath = explorerHistory[explorerHistoryIndex];
    openExplorer(currentExplorerPath);
  }
};

window.explorerGoUp = function() {
  const current = currentExplorerPath || "C:";
  if (current === "/" || current === "C:") return;
  const parentPath = current.includes("/") ? current.substring(0, current.lastIndexOf("/")) : "C:";
  navigateTo(parentPath);
};

window.openFileFromPath = function(folderPath, fileName) {
  const folder = getFolderByPath(folderPath);
  if (!folder || !folder.children || !folder.children[fileName]) return;
  const file = folder.children[fileName];
  if (file.type === "folder") {
    navigateTo(folderPath === "C:" ? `C:/${fileName}` : `${folderPath}/${fileName}`);
  } else {
    openFile(fileName, folderPath);
    if (typeof updateTaskbarApps === "function") updateTaskbarApps();
  }
};

function setupWindowControls(win) {
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
      const pos = window.getNextWindowPosition ? window.getNextWindowPosition() : { x: 200, y: 80 };
      win.style.left = pos.x + "px";
      win.style.top = pos.y + "px";
    }
  };
  win.querySelector(".window-btn.min").onclick = function() {
    win.style.display = "none";
    updateTaskbarApps();
  };
  win.querySelector(".window-btn.max").onclick = function() {
    win.classList.toggle("maximized");
    if (win.classList.contains("maximized")) {
      win.style.left = "";
      win.style.top = "";
    } else {
      const pos = window.getNextWindowPosition ? window.getNextWindowPosition() : { x: 200, y: 80 };
      win.style.left = pos.x + "px";
      win.style.top = pos.y + "px";
    }
  };
  win.querySelector(".window-btn.close").onclick = function() {
    win.remove();
    updateTaskbarApps();
  };
}
