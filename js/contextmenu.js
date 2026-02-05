window.initContextMenu = function() {
  document.addEventListener("contextmenu", e => {
    e.preventDefault();

    const old = document.querySelector(".context-menu");
    if (old) old.remove();

    const menu = document.createElement("div");
    menu.className = "context-menu";
    menu.style.left = e.pageX + "px";
    menu.style.top = e.pageY + "px";

    // Check if clicking on desktop icon
    const icon = e.target.closest(".desktop-icon");
    const isDesktop = !icon && e.target.closest("#desktop");
    
    let menuHTML = "";

    if (icon) {
      const iconText = icon.querySelector("span:last-child")?.textContent || "";
      const fileName = iconText.trim();
      const desktopFolder = typeof getDesktopFolder === "function" ? getDesktopFolder() : null;
      const file = desktopFolder && desktopFolder.children ? desktopFolder.children[fileName] : null;
      
      menuHTML = `
        <div class="context-menu-item" data-action="open" data-file="${fileName}">📂 Open</div>
        <div class="context-menu-item" data-action="rename" data-file="${fileName}">✏️ Rename</div>
        <div class="context-menu-sep"></div>
        <div class="context-menu-item" data-action="delete" data-file="${fileName}">🗑️ Delete</div>
      `;
      
      // If it's a .scene or .gd file, add Build option
      if (fileName.endsWith(".scene") || fileName.endsWith(".gd")) {
        menuHTML = `
          <div class="context-menu-item" data-action="open" data-file="${fileName}">📂 Open</div>
          <div class="context-menu-item" data-action="rename" data-file="${fileName}">✏️ Rename</div>
          <div class="context-menu-sep"></div>
          <div class="context-menu-item" data-action="build" data-file="${fileName}">⚙️ Build .mnx</div>
          <div class="context-menu-sep"></div>
          <div class="context-menu-item" data-action="delete" data-file="${fileName}">🗑️ Delete</div>
        `;
      }
    } else if (isDesktop) {
      // Right-clicking on empty desktop
      menuHTML = `
        <div class="context-menu-item" data-action="new-txt">📄 New Text File</div>
        <div class="context-menu-item" data-action="new-mnx">🚀 New Monxit App (.mnx)</div>
        <div class="context-menu-sep"></div>
        <div class="context-menu-item" data-action="explorer">📁 Open File Explorer</div>
      `;
    } else {
      // Default menu
      menuHTML = `
        <div class="context-menu-item" data-action="explorer">📁 Open File Explorer</div>
      `;
    }

    menu.innerHTML = menuHTML;
    document.body.appendChild(menu);

    // Handle menu clicks
    menu.querySelectorAll(".context-menu-item").forEach(item => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        const action = item.dataset.action;
        const fileName = item.dataset.file;

        switch(action) {
          case "open":
            if (fileName) openFile(fileName);
            break;
          case "rename":
            if (fileName) showRenameDialog(fileName);
            break;
          case "delete":
            if (fileName) showDeleteDialog(fileName);
            break;
          case "build":
            if (fileName) buildMnxFile(fileName);
            break;
          case "new-txt":
            createNewFile("txt");
            break;
          case "new-mnx":
            createNewFile("mnx");
            break;
          case "explorer":
            openExplorer();
            break;
        }
        menu.remove();
      });
    });

    // Close menu on outside click
    document.addEventListener("click", () => menu.remove(), { once: true });
  });
};

function createNewFile(ext) {
  const folder = typeof getDesktopFolder === "function" ? getDesktopFolder() : null;
  if (!folder || !folder.children) return;
  const defaults = {
    txt: { name: "NewFile", content: "" },
    mnx: { name: "NewApp", content: JSON.stringify({ name: "NewApp", source: "", version: "1.0.0" }, null, 2) }
  };
  const def = defaults[ext] || { name: "NewFile", content: "" };
  let name = def.name + "." + ext;
  let n = 1;
  while (folder.children[name]) {
    name = def.name + "_" + (n++) + "." + ext;
  }
  folder.children[name] = { type: "file", content: def.content };
  if (typeof refreshDesktop === "function") refreshDesktop();
  if (typeof persistFilesystem === "function") persistFilesystem();
  return name;
}

function showRenameDialog(oldName) {
  const dialog = document.createElement("div");
  dialog.className = "dialog-overlay";
  dialog.innerHTML = `
    <div class="dialog">
      <div class="dialog-title">Rename File</div>
      <div class="dialog-content">
        <input type="text" class="dialog-input" value="${oldName}" id="rename-input">
        <div class="dialog-hint">You can change the extension by typing a new one</div>
      </div>
      <div class="dialog-buttons">
        <button type="button" class="dialog-btn dialog-btn-cancel">Cancel</button>
        <button type="button" class="dialog-btn dialog-btn-ok">Rename</button>
      </div>
    </div>
  `;
  document.body.appendChild(dialog);

  const input = dialog.querySelector("#rename-input");
  input.select();
  input.focus();

  dialog.querySelector(".dialog-btn-cancel").onclick = () => dialog.remove();
  dialog.querySelector(".dialog-btn-ok").onclick = () => {
    const newName = input.value.trim();
    const folder = typeof getDesktopFolder === "function" ? getDesktopFolder() : null;
    if (newName && newName !== oldName && folder && folder.children && !folder.children[newName]) {
      folder.children[newName] = folder.children[oldName];
      delete folder.children[oldName];
      if (typeof refreshDesktop === "function") refreshDesktop();
      if (typeof persistFilesystem === "function") persistFilesystem();
    }
    dialog.remove();
  };
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") dialog.querySelector(".dialog-btn-ok").click();
    if (e.key === "Escape") dialog.querySelector(".dialog-btn-cancel").click();
  });
}

function showDeleteDialog(fileName) {
  const dialog = document.createElement("div");
  dialog.className = "dialog-overlay";
  dialog.innerHTML = `
    <div class="dialog">
      <div class="dialog-title">Delete File</div>
      <div class="dialog-content">
        <p>Are you sure you want to delete <strong>${fileName}</strong>?</p>
      </div>
      <div class="dialog-buttons">
        <button type="button" class="dialog-btn dialog-btn-cancel">Cancel</button>
        <button type="button" class="dialog-btn dialog-btn-danger">Delete</button>
      </div>
    </div>
  `;
  document.body.appendChild(dialog);

  dialog.querySelector(".dialog-btn-cancel").onclick = () => dialog.remove();
  dialog.querySelector(".dialog-btn-danger").onclick = () => {
    if (typeof moveFileToTrash === "function") {
      moveFileToTrash(fileName);
    } else {
      const folder = typeof getDesktopFolder === "function" ? getDesktopFolder() : null;
      if (folder && folder.children) delete folder.children[fileName];
      if (typeof refreshDesktop === "function") refreshDesktop();
      if (typeof persistFilesystem === "function") persistFilesystem();
    }
    dialog.remove();
  };
}

window.buildMnxFile = function(sourceFile, projectName, gameContent) {
  const folder = typeof getDesktopFolder === "function" ? getDesktopFolder() : null;
  if (!folder || !folder.children) return;

  const baseName = (projectName && projectName.trim()) || (sourceFile ? sourceFile.replace(/\.(scene|gd)$/, "") : "Game");
  let mnxName = baseName + ".mnx";
  let n = 1;
  while (folder.children[mnxName]) {
    mnxName = baseName + "_" + (n++) + ".mnx";
  }

  let content;
  if (gameContent && (gameContent.html != null || gameContent.js != null)) {
    content = {
      name: baseName,
      html: gameContent.html || "",
      js: gameContent.js || "",
      css: gameContent.css || "",
      icon: gameContent.icon != null ? gameContent.icon : "🎮",
      buildDate: new Date().toISOString(),
      version: "1.0.0"
    };
  } else {
    const file = sourceFile ? folder.children[sourceFile] : null;
    content = {
      name: baseName,
      source: sourceFile || "",
      buildDate: new Date().toISOString(),
      version: "1.0.0"
    };
  }

  folder.children[mnxName] = {
    type: "file",
    content: JSON.stringify(content, null, 2)
  };

  if (typeof refreshDesktop === "function") refreshDesktop();
  if (typeof persistFilesystem === "function") persistFilesystem();

  // Show success message
  const dialog = document.createElement("div");
  dialog.className = "dialog-overlay";
  dialog.innerHTML = `
    <div class="dialog">
      <div class="dialog-title">Build Complete</div>
      <div class="dialog-content">
        <p>Successfully built <strong>${mnxName}</strong></p>
        <p class="dialog-hint">The executable has been created on your desktop.</p>
      </div>
      <div class="dialog-buttons">
        <button type="button" class="dialog-btn dialog-btn-ok">OK</button>
      </div>
    </div>
  `;
  document.body.appendChild(dialog);
  dialog.querySelector(".dialog-btn-ok").onclick = () => dialog.remove();
};
