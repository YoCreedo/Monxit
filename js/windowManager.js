window.getNextWindowPosition = function() {
  const existingWindows = document.querySelectorAll(".window:not(.maximized)");
  const offset = 30; // Cascade offset
  const baseX = 200;
  const baseY = 80;
  
  if (existingWindows.length === 0) {
    return { x: baseX, y: baseY };
  }
  
  // Find the rightmost and bottommost window
  let maxX = baseX;
  let maxY = baseY;
  
  existingWindows.forEach(w => {
    const rect = w.getBoundingClientRect();
    const x = parseInt(w.style.left) || rect.left;
    const y = parseInt(w.style.top) || rect.top;
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  });
  
  // Cascade: offset by 30px each time
  const newX = maxX + offset;
  const newY = maxY + offset;
  
  // Keep windows on screen (viewport width - window width - padding)
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const windowWidth = 720; // Default window width
  const windowHeight = 480; // Default window height
  const taskbarHeight = 48;
  const padding = 20;
  
  let finalX = newX;
  let finalY = newY;
  
  // If window would go off right edge, wrap to left with more vertical offset
  if (finalX + windowWidth > viewportWidth - padding) {
    finalX = baseX;
    finalY = maxY + offset;
  }
  
  // If window would go off bottom, reset to top
  if (finalY + windowHeight > viewportHeight - taskbarHeight - padding) {
    finalY = baseY;
  }
  
  return { x: finalX, y: finalY };
};

window.createWindow = function(title, contentHTML) {
  const win = document.createElement("div");
  win.className = "window";
  const pos = window.getNextWindowPosition();
  win.style.left = pos.x + "px";
  win.style.top = pos.y + "px";

  win.innerHTML = `
    <div class="titlebar">
      <span class="titlebar-title">${title}</span>
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
      const pos = window.getNextWindowPosition();
      win.style.left = pos.x + "px";
      win.style.top = pos.y + "px";
    }
  };

  win.querySelector(".window-btn.min").onclick = function() {
    win.style.display = "none";
    if (typeof updateTaskbarApps === "function") updateTaskbarApps();
  };

  win.querySelector(".window-btn.max").onclick = function() {
    win.classList.toggle("maximized");
    if (win.classList.contains("maximized")) {
      win.style.left = "";
      win.style.top = "";
    } else {
      const pos = window.getNextWindowPosition();
      win.style.left = pos.x + "px";
      win.style.top = pos.y + "px";
    }
  };

  win.querySelector(".window-btn.close").onclick = function() {
    win.remove();
    if (typeof updateTaskbarApps === "function") updateTaskbarApps();
  };
  
  if (typeof updateTaskbarApps === "function") updateTaskbarApps();
};
