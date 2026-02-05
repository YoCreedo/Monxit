function getFileIcon(name) {
  if (name.endsWith(".txt")) return "📄";
  if (name.endsWith(".mnx")) return "🚀";
  if (name.endsWith(".scene")) return "📦";
  if (name.endsWith(".gd") || name.endsWith(".js")) return "📜";
  return "📄";
}

// Default apps shown on every user's desktop (Browser, Recycle Bin)
var DEFAULT_DESKTOP_APPS = [
  { action: "browser", label: "Browser", icon: "🌐" },
  { action: "trash", label: "Recycle Bin", icon: "🗑️" }
];

function createDefaultAppIcon(app) {
  const icon = document.createElement("div");
  icon.className = "desktop-icon desktop-default-app";
  icon.dataset.action = app.action;
  if (app.action === "trash") icon.dataset.trash = "true";
  icon.innerHTML = "<span class=\"icon-symbol\">" + app.icon + "</span><span>" + app.label + "</span>";
  icon.draggable = false;

  icon.onclick = function() {
    if (app.action === "browser" && typeof openBrowser === "function") openBrowser();
    if (app.action === "trash" && typeof openRecycleBin === "function") openRecycleBin();
  };

  if (app.action === "trash") {
    icon.addEventListener("dragover", function(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      icon.classList.add("desktop-icon-drop");
    });
    icon.addEventListener("dragleave", function() {
      icon.classList.remove("desktop-icon-drop");
    });
    icon.addEventListener("drop", function(e) {
      e.preventDefault();
      icon.classList.remove("desktop-icon-drop");
      var fileName = e.dataTransfer.getData("text/plain");
      if (fileName && typeof moveFileToTrash === "function") moveFileToTrash(fileName);
    });
  }

  return icon;
}

function createFileIcon(name, folder) {
  const isFolder = folder.children[name].type === "folder";
  const iconSymbol = isFolder ? "📁" : getFileIcon(name);

  const icon = document.createElement("div");
  icon.className = "desktop-icon desktop-file-icon";
  icon.draggable = true;
  icon.dataset.fileName = name;

  icon.innerHTML = "<span class=\"icon-symbol\">" + iconSymbol + "</span><span>" + name + "</span>";

  icon.onclick = function(e) {
    if (!icon.classList.contains("desktop-dragging")) openFile(name);
  };

  icon.addEventListener("dragstart", function(e) {
    e.dataTransfer.setData("text/plain", name);
    e.dataTransfer.effectAllowed = "move";
    icon.classList.add("desktop-dragging");
  });
  icon.addEventListener("dragend", function() {
    icon.classList.remove("desktop-dragging");
  });

  return icon;
}

function renderDesktopIcons() {
  const desktop = document.getElementById("desktop");
  if (!desktop) return;

  var existing = desktop.querySelectorAll(".desktop-icon");
  existing.forEach(function(el) { el.remove(); });

  // 1. Default apps (Browser, Recycle Bin) for all users
  DEFAULT_DESKTOP_APPS.forEach(function(app) {
    desktop.appendChild(createDefaultAppIcon(app));
  });

  var folder = typeof getDesktopFolder === "function" ? getDesktopFolder() : null;
  if (!folder || !folder.children) return;

  for (var name in folder.children) {
    desktop.appendChild(createFileIcon(name, folder));
  }
}

window.initDesktop = function() {
  renderDesktopIcons();
};

window.refreshDesktop = function() {
  renderDesktopIcons();
};

// Move file from current user's desktop to trash
window.moveFileToTrash = function(fileName) {
  var folder = typeof getDesktopFolder === "function" ? getDesktopFolder() : null;
  if (!folder || !folder.children || !folder.children[fileName]) return;

  var file = folder.children[fileName];
  if (typeof currentUser === "undefined" || !currentUser) return;

  window.monxitTrash = window.monxitTrash || [];
  window.monxitTrash.push({
    user: currentUser,
    fileName: fileName,
    content: file.content,
    type: file.type || "file"
  });

  delete folder.children[fileName];
  if (typeof refreshDesktop === "function") refreshDesktop();
  if (typeof persistFilesystem === "function") persistFilesystem();
  if (typeof persistTrash === "function") persistTrash();
};

// Recycle Bin window
window.openRecycleBin = function() {
  var trash = window.monxitTrash || [];
  var listHtml = trash.length === 0
    ? "<p class=\"trash-empty\">Recycle Bin is empty</p>"
    : trash.map(function(item, i) {
        return "<div class=\"trash-item\"><span class=\"trash-name\">" + (item.fileName || "?") + "</span><span class=\"trash-user\">" + (item.user || "") + "</span><button type=\"button\" class=\"trash-restore-btn\" data-index=\"" + i + "\">Restore</button></div>";
      }).join("");

  var contentHtml = "<div class=\"trash-window\"><div class=\"trash-toolbar\"><button type=\"button\" class=\"trash-empty-btn\">Empty Recycle Bin</button></div><div class=\"trash-list\">" + listHtml + "</div></div>";

  var win = document.createElement("div");
  win.className = "window";
  var pos = window.getNextWindowPosition ? window.getNextWindowPosition() : { x: 200, y: 80 };
  win.style.left = pos.x + "px";
  win.style.top = pos.y + "px";
  win.style.width = "420px";
  win.style.height = "400px";

  win.innerHTML = "<div class=\"titlebar\"><span class=\"titlebar-title\">Recycle Bin</span><div class=\"window-controls\"><button type=\"button\" class=\"window-btn min\" aria-label=\"Minimize\"><svg viewBox=\"0 0 12 12\"><rect y=\"5\" width=\"12\" height=\"1\"/></svg></button><button type=\"button\" class=\"window-btn max\" aria-label=\"Maximize\"><svg viewBox=\"0 0 12 12\"><rect x=\"1\" y=\"1\" width=\"10\" height=\"10\" stroke=\"currentColor\" stroke-width=\"1\" fill=\"none\"/></svg></button><button type=\"button\" class=\"window-btn close\" aria-label=\"Close\"><svg viewBox=\"0 0 12 12\"><path d=\"M1 1l10 10M11 1L1 11\" stroke=\"currentColor\" stroke-width=\"1\"/></svg></button></div></div><div class=\"content\">" + contentHtml + "</div>";

  document.getElementById("desktop").appendChild(win);

  win.querySelector(".trash-empty-btn").onclick = function() {
    window.monxitTrash = [];
    if (typeof persistTrash === "function") persistTrash();
    win.querySelector(".trash-list").innerHTML = "<p class=\"trash-empty\">Recycle Bin is empty</p>";
  };

  win.querySelector(".trash-list").addEventListener("click", function(e) {
    var btn = e.target.closest(".trash-restore-btn");
    if (!btn) return;
    var index = parseInt(btn.dataset.index, 10);
    var item = window.monxitTrash[index];
    if (!item) return;

    var users = window.fs["C:"].children["users"].children;
    var userFolder = users[item.user];
    if (!userFolder || !userFolder.children || !userFolder.children["Desktop"]) return;

    var desktop = userFolder.children["Desktop"].children;
    desktop[item.fileName] = { type: item.type || "file", content: item.content || "" };
    window.monxitTrash.splice(index, 1);
    if (typeof persistTrash === "function") persistTrash();
    if (typeof persistFilesystem === "function") persistFilesystem();
    if (typeof refreshDesktop === "function" && currentUser === item.user) refreshDesktop();

    var list = win.querySelector(".trash-list");
    var items = window.monxitTrash;
    list.innerHTML = items.length === 0
      ? "<p class=\"trash-empty\">Recycle Bin is empty</p>"
      : items.map(function(it, i) {
          return "<div class=\"trash-item\"><span class=\"trash-name\">" + (it.fileName || "?") + "</span><span class=\"trash-user\">" + (it.user || "") + "</span><button type=\"button\" class=\"trash-restore-btn\" data-index=\"" + i + "\">Restore</button></div>";
        }).join("");
  });

  var bar = win.querySelector(".titlebar");
  bar.onmousedown = function(e) {
    if (e.target.closest(".window-controls")) return;
    var offsetX = e.clientX - win.offsetLeft;
    var offsetY = e.clientY - win.offsetTop;
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
    if (win.classList.contains("maximized")) { win.style.left = ""; win.style.top = ""; }
    else { win.style.left = pos.x + "px"; win.style.top = pos.y + "px"; }
    if (typeof updateTaskbarApps === "function") updateTaskbarApps();
  };
  win.querySelector(".window-btn.close").onclick = function() {
    win.remove();
    if (typeof updateTaskbarApps === "function") updateTaskbarApps();
  };

  if (typeof updateTaskbarApps === "function") updateTaskbarApps();
};
