window.windowRegistry = new Map();

window.updateTaskbarApps = function() {
  const taskbarApps = document.getElementById("taskbar-apps");
  if (!taskbarApps) return;
  
  const windows = Array.from(document.querySelectorAll(".window")).filter(w => w.style.display !== "none");
  
  // Clear existing apps
  taskbarApps.innerHTML = "";
  
  windows.forEach((win, index) => {
    const title = win.querySelector(".titlebar-title")?.textContent || "Window";
    const appId = `app-${index}-${Date.now()}`;
    win.dataset.appId = appId;
    
    const appBtn = document.createElement("button");
    appBtn.className = "taskbar-app";
    appBtn.dataset.appId = appId;
    appBtn.dataset.windowIndex = index;
    appBtn.type = "button";
    
    // Get icon based on window type
    let icon = "📄";
    if (win.classList.contains("explorer-window")) icon = "📁";
    else if (win.classList.contains("ge-engine-window")) icon = "🎮";
    else if (title.includes(".txt")) icon = "📄";
    else if (title.includes(".mnx")) icon = "🚀";
    
    appBtn.innerHTML = `<span class="taskbar-app-icon">${icon}</span><span class="taskbar-app-title">${title}</span>`;
    
    appBtn.onclick = function() {
      // Toggle window visibility
      if (win.style.display === "none") {
        win.style.display = "";
        win.style.zIndex = "1000";
        // Bring to front
        Array.from(document.querySelectorAll(".window")).forEach(w => {
          if (w !== win) w.style.zIndex = "1";
        });
      } else {
        // Minimize
        win.style.display = "none";
      }
      updateTaskbarApps();
    };
    
    // Make draggable
    appBtn.draggable = true;
    appBtn.addEventListener("dragstart", (e) => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", appId);
      appBtn.classList.add("dragging");
    });
    
    appBtn.addEventListener("dragend", () => {
      appBtn.classList.remove("dragging");
    });
    
    appBtn.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (appBtn !== e.target.closest(".taskbar-app")) {
        appBtn.classList.add("drag-over");
      }
    });
    
    appBtn.addEventListener("dragleave", () => {
      appBtn.classList.remove("drag-over");
    });
    
    appBtn.addEventListener("drop", (e) => {
      e.preventDefault();
      appBtn.classList.remove("drag-over");
      const draggedId = e.dataTransfer.getData("text/plain");
      const draggedBtn = document.querySelector(`[data-app-id="${draggedId}"]`);
      if (draggedBtn && draggedBtn !== appBtn) {
        const apps = Array.from(taskbarApps.children);
        const draggedIndex = apps.indexOf(draggedBtn);
        const targetIndex = apps.indexOf(appBtn);
        
        if (draggedIndex < targetIndex) {
          taskbarApps.insertBefore(draggedBtn, appBtn.nextSibling);
        } else {
          taskbarApps.insertBefore(draggedBtn, appBtn);
        }
      }
    });
    
    taskbarApps.appendChild(appBtn);
    windowRegistry.set(appId, win);
  });
};

// Update taskbar when windows are created/closed
const originalCreateWindow = window.createWindow;
window.createWindow = function(title, contentHTML) {
  const win = originalCreateWindow(title, contentHTML);
  updateTaskbarApps();
  
  // Update taskbar when window is closed
  const closeBtn = win.querySelector(".window-btn.close");
  if (closeBtn) {
    const originalClose = closeBtn.onclick;
    closeBtn.onclick = function() {
      originalClose();
      updateTaskbarApps();
    };
  }
  
  // Update taskbar when window is minimized
  const minBtn = win.querySelector(".window-btn.min");
  if (minBtn) {
    const originalMin = minBtn.onclick;
    minBtn.onclick = function() {
      originalMin();
      updateTaskbarApps();
    };
  }
  
  return win;
};
