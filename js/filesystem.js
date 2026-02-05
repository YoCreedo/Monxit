window.fs = {
  "/": {
    type: "folder",
    children: {}
  },
  "C:": {
    type: "folder",
    children: {
      "monxit:": {
        type: "folder",
        children: {
          "system.dll": { type: "file", content: "System Library" },
          "kernel.exe": { type: "file", content: "Kernel Process" },
          "drivers": {
            type: "folder",
            children: {
              "display.drv": { type: "file", content: "Display Driver" },
              "network.drv": { type: "file", content: "Network Driver" }
            }
          },
          "config": {
            type: "folder",
            children: {
              "boot.ini": { type: "file", content: "[boot loader]\ntimeout=30\ndefault=MonxitOS" },
              "system.cfg": { type: "file", content: "system configuration" }
            }
          }
        }
      },
      "users": {
        type: "folder",
        children: {
          "user": {
            type: "folder",
            children: {
              "Documents": { type: "folder", children: { "MyDocument.txt": { type: "file", content: "My Document" } } },
              "Desktop": {
                type: "folder",
                children: {
                  "readme.txt": { type: "file", content: "Welcome to Monxit OS 🚀" },
                  "game.mnx": {
                    type: "file",
                    content: JSON.stringify({ name: "Monxit Launcher", source: "game.mnx", buildDate: new Date().toISOString(), version: "1.0.0" }, null, 2)
                  }
                }
              },
              "Downloads": { type: "folder", children: {} }
            }
          }
        }
      },
      "Program Files": {
        type: "folder",
        children: {
          "Monxit Engine": {
            type: "folder",
            children: { "engine.exe": { type: "file", content: "Monxit Engine" } }
          }
        }
      }
    }
  }
};

window.currentUser = null;

window.getDesktopPath = function() {
  if (!currentUser) return null;
  return "C:/users/" + currentUser + "/Desktop";
};

window.getDesktopFolder = function() {
  if (!currentUser) return null;
  const path = "C:/users/" + currentUser + "/Desktop";
  const folder = getFolderByPath(path);
  return folder || null;
};

window.ensureUserExists = function(username) {
  const users = fs["C:"].children["users"].children;
  if (users[username]) return;
  users[username] = {
    type: "folder",
    children: {
      Documents: { type: "folder", children: {} },
      Desktop: { type: "folder", children: {} },
      Downloads: { type: "folder", children: {} }
    }
  };
}

window.getFolderByPath = function(path) {
  if (path === "/" || path === "") return fs["/"];
  if (path === "C:") return fs["C:"];
  const parts = path.split("/").filter(p => p);
  let current = fs;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (current[part] && current[part].type === "folder") {
      if (i === parts.length - 1) return current[part];
      current = current[part].children || current[part];
    } else {
      return null;
    }
  }
  return current;
};

window.getPathString = function(path) {
  if (path === "/" || path === "") return "This PC \\ Desktop";
  if (path.startsWith("C:")) return path.replace(/\//g, "\\");
  return path;
};

