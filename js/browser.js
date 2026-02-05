window.openBrowser = function() {
  const defaultUrl = "https://www.google.com";
  let currentUrl = defaultUrl;

  const win = document.createElement("div");
  win.className = "window browser-window";
  const pos = window.getNextWindowPosition ? window.getNextWindowPosition() : { x: 120, y: 60 };
  win.style.left = pos.x + "px";
  win.style.top = pos.y + "px";
  win.style.width = "900px";
  win.style.height = "640px";

  win.innerHTML = `
    <div class="titlebar">
      <span class="titlebar-title">Monxit Browser</span>
      <div class="window-controls">
        <button type="button" class="window-btn min" aria-label="Minimize"><svg viewBox="0 0 12 12"><rect y="5" width="12" height="1"/></svg></button>
        <button type="button" class="window-btn max" aria-label="Maximize"><svg viewBox="0 0 12 12"><rect x="1" y="1" width="10" height="10" stroke="currentColor" stroke-width="1" fill="none"/></svg></button>
        <button type="button" class="window-btn close" aria-label="Close"><svg viewBox="0 0 12 12"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1"/></svg></button>
      </div>
    </div>
    <div class="content browser-content">
      <div class="browser-toolbar">
        <button type="button" class="browser-btn" title="Back" id="browser-back">←</button>
        <button type="button" class="browser-btn" title="Forward" id="browser-forward">→</button>
        <button type="button" class="browser-btn" title="Home (Google)" id="browser-home">⌂</button>
        <form class="browser-address-form" id="browser-address-form">
          <input type="text" class="browser-address-input" id="browser-address" placeholder="Search or enter URL" value="${defaultUrl}" autocomplete="off">
          <button type="submit" class="browser-go-btn">Go</button>
        </form>
      </div>
      <iframe class="browser-frame" id="browser-frame" src="${defaultUrl}" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
    </div>
  `;

  document.getElementById("desktop").appendChild(win);

  const iframe = win.querySelector("#browser-frame");
  const addressInput = win.querySelector("#browser-address");
  const form = win.querySelector("#browser-address-form");

  function isUrlLike(str) {
    const s = str.trim();
    if (!s) return false;
    if (/^https?:\/\//i.test(s)) return true;
    if (s.includes(" ") || s.length < 4) return false;
    return s.includes(".");
  }

  function navigateTo(inputStr) {
    const s = (inputStr || "").trim();
    let url;
    if (!s) {
      url = defaultUrl;
    } else if (isUrlLike(s)) {
      url = /^https?:\/\//i.test(s) ? s : "https://" + s;
    } else {
      url = "https://www.google.com/search?q=" + encodeURIComponent(s);
    }
    currentUrl = url;
    iframe.src = url;
    addressInput.value = url;
  }

  form.addEventListener("submit", function(e) {
    e.preventDefault();
    navigateTo(addressInput.value);
  });

  win.querySelector("#browser-back").addEventListener("click", function() {
    try { iframe.contentWindow.history.back(); } catch (_) {}
  });
  win.querySelector("#browser-forward").addEventListener("click", function() {
    try { iframe.contentWindow.history.forward(); } catch (_) {}
  });
  win.querySelector("#browser-home").addEventListener("click", function() {
    navigateTo(defaultUrl);
  });

  iframe.addEventListener("load", function() {
    try {
      const href = iframe.contentWindow.location.href;
      if (href && href !== "about:blank") addressInput.value = href;
    } catch (_) {}
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
  win.querySelector(".window-btn.min").onclick = function() {
    win.style.display = "none";
    if (typeof updateTaskbarApps === "function") updateTaskbarApps();
  };
  win.querySelector(".window-btn.max").onclick = function() {
    win.classList.toggle("maximized");
    if (win.classList.contains("maximized")) { win.style.left = ""; win.style.top = ""; win.style.width = ""; win.style.height = ""; }
    else { win.style.left = pos.x + "px"; win.style.top = pos.y + "px"; win.style.width = "900px"; win.style.height = "640px"; }
    if (typeof updateTaskbarApps === "function") updateTaskbarApps();
  };
  win.querySelector(".window-btn.close").onclick = function() {
    win.remove();
    if (typeof updateTaskbarApps === "function") updateTaskbarApps();
  };

  if (typeof updateTaskbarApps === "function") updateTaskbarApps();
};
