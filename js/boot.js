function updateClock() {
  const el = document.getElementById("taskbar-clock");
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function initStartMenu() {
  const startBtn = document.getElementById("taskbar-start-btn") || document.querySelector(".taskbar-start-btn");
  const startMenu = document.getElementById("start-menu");
  if (!startBtn || !startMenu) return;

  startBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isHidden = startMenu.hidden;
    startMenu.hidden = !isHidden;
  });

  document.addEventListener("click", () => {
    startMenu.hidden = true;
  });
  startMenu.addEventListener("click", (e) => e.stopPropagation());

  startMenu.querySelector("[data-action='explorer']")?.addEventListener("click", () => {
    openExplorer();
    startMenu.hidden = true;
  });
  startMenu.querySelector("[data-action='gameengine']")?.addEventListener("click", () => {
    openGameEngine();
    startMenu.hidden = true;
  });
  startMenu.querySelector("[data-action='browser']")?.addEventListener("click", () => {
    openBrowser();
    startMenu.hidden = true;
  });
}

function initTaskbarPinned() {
  const container = document.getElementById("taskbar-pinned");
  if (!container) return;

  const pinned = [
    { action: "explorer", icon: "📁", title: "File Explorer" },
    { action: "gameengine", icon: "🎮", title: "Monxit Engine" },
    { action: "browser", icon: "🌐", title: "Browser" }
  ];

  pinned.forEach(function (item) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "taskbar-pinned-btn";
    btn.title = item.title;
    btn.textContent = item.icon;
    btn.dataset.action = item.action;
    btn.addEventListener("click", function () {
      if (item.action === "explorer" && typeof openExplorer === "function") openExplorer();
      if (item.action === "gameengine" && typeof openGameEngine === "function") openGameEngine();
      if (item.action === "browser" && typeof openBrowser === "function") openBrowser();
    });
    container.appendChild(btn);
  });
}

function showDesktop() {
  const loginScreen = document.getElementById("login-screen");
  const desktop = document.getElementById("desktop");
  if (loginScreen) loginScreen.classList.add("hidden");
  if (desktop) desktop.classList.remove("desktop-hidden");
  initDesktop();
  initContextMenu();
  initStartMenu();
  initTaskbarPinned();
  updateClock();
  setInterval(updateClock, 1000);
}

function initLoginScreen() {
  const form = document.getElementById("login-form");
  const createBtn = document.getElementById("login-create-user");
  const input = document.getElementById("login-username");

  // Load saved filesystem and trash
  if (typeof loadStoredFilesystem === "function") {
    const stored = loadStoredFilesystem();
    if (stored && stored["C:"] && stored["C:"].children && stored["C:"].children["users"]) {
      window.fs["C:"].children["users"] = stored["C:"].children["users"];
    }
  }
  if (typeof loadTrash === "function") loadTrash();

  // Pre-fill last signed-in user so they can just click Sign in to see their files
  if (typeof loadStoredUser === "function") {
    const lastUser = loadStoredUser();
    if (lastUser && input) input.value = lastUser;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = (input.value || "").trim().replace(/[^a-zA-Z0-9_-]/g, "_") || "user";
    if (!fs["C:"].children["users"].children[username]) {
      ensureUserExists(username);
    }
    window.currentUser = username;
    if (typeof saveUser === "function") saveUser(username);
    if (typeof persistFilesystem === "function") persistFilesystem();
    showDesktop();
  });

  createBtn.addEventListener("click", () => {
    const username = (input.value || "").trim().replace(/[^a-zA-Z0-9_-]/g, "_") || "user";
    if (!username) return;
    ensureUserExists(username);
    window.currentUser = username;
    if (typeof saveUser === "function") saveUser(username);
    if (typeof persistFilesystem === "function") persistFilesystem();
    showDesktop();
  });
}

window.addEventListener("DOMContentLoaded", () => {
  initLoginScreen();
});
