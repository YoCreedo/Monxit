# Monxit OS

A browser-based desktop OS simulator with a login screen, file system, File Explorer, and a built-in game engine. Create games with HTML, CSS, and JavaScript, then build them as `.mnx` executables and run them on the desktop.

![Monxit OS](https://img.shields.io/badge/Monxit-OS-25262b?style=flat-square)

---

## Table of Contents

- [What is Monxit OS?](#what-is-monxit-os)
- [How to Run](#how-to-run)
- [Step-by-Step Guide](#step-by-step-guide)
- [File System](#file-system)
- [File Types](#file-types)
- [Game Engine](#game-engine)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)

---

## What is Monxit OS?

Monxit OS is a fake operating system that runs entirely in your browser. It includes:

- **Login / boot screen** – Sign in or create a user; your desktop lives at `C:\users\<username>\Desktop`
- **Desktop** – Icons for files and folders in a grid; right-click to create files, rename, delete, or build `.mnx`
- **Taskbar** – Start menu, open app buttons (draggable), and clock
- **File Explorer** – Navigate `C:\` with drives, `C:\monxit:\` (system), `C:\users\` (user folders), and your Desktop
- **Monxit Engine** – Code games with HTML, JS, and CSS; Play in the viewport and **Build .mnx** to save a runnable game
- **.mnx apps** – Double-click a `.mnx` file to run the game in its own window (HTML + JS + CSS run in an iframe)

No server or database: everything runs client-side. User and files can be persisted with cookies/localStorage (see [Storage](#storage) in the repo).

---

## How to Run

3. **Open** the github pages in Chrome, Firefox, Edge, or Safari.

No build step, no npm install—just open the app and go.

---

## Step-by-Step Guide

### 1. Log in

- On first load you see the **login screen**.
- Enter a **username** (e.g. `user`).
  - **Sign in** – Use an existing user (e.g. default `user`).
  - **Create new user** – Creates `C:\users\<username>\` with Desktop, Documents, Downloads.
- After login, the desktop and taskbar appear. Your files live in `C:\users\<username>\Desktop`.

### 2. Use the desktop

- **Desktop icons** – Files and folders on your Desktop; they lay out in a grid (new icons go left-to-right, then down).
- **Click an icon** – Opens the file (e.g. `.txt` in a text window, `.mnx` runs the game).
- **Right-click desktop** – New Text File, New Monxit App (.mnx), Open File Explorer.
- **Right-click a file** – Open, Rename, Delete; for `.scene`/`.gd`, also **Build .mnx**.

### 3. Use File Explorer

- **Start → File Explorer** (or right-click desktop → Open File Explorer).
- **Address bar** – Shows current path (e.g. `C:\`, `C:\users\user\Desktop`).
- **Back / Forward / Up** – Navigate history and parent folders.
- **This PC** – Shows **Local Disk (C:)** and **Desktop** (shortcut to your Desktop).
- **C:\** – `monxit:\` (system), `users\`, `Program Files\`.
- **C:\monxit:\** – System-style files (e.g. drivers, config).
- **C:\users\<username>\** – Desktop, Documents, Downloads.
- **Click a file** – Opens it (same as desktop). **Click a folder** – Opens that folder.

### 4. Use the Game Engine

- **Start → Monxit Engine**.
- **Code panel (left)** – Tabs: **HTML**, **JavaScript**, **CSS**.
  - Edit your game (e.g. HTML structure, JS logic, CSS style).
- **Preview (center)** – **Play** runs your game in the viewport; **Stop** clears it.
- **Inspector (right)** – Scene/node properties (optional for simple games).
- **Project name** – Top right; used as the app name when you build.
- **Build .mnx** – Saves the **current project name** and **HTML + JS + CSS** to a new `.mnx` file on your Desktop. That file is a runnable game.

### 5. Run a game (.mnx)

- **Double-click a `.mnx` file** on the desktop (or open it from File Explorer).
- If the `.mnx` was built from the engine (contains `html`/`js`), a **game window** opens and your game runs inside it (HTML + JS + CSS in an iframe).
- If it’s an older launcher-style `.mnx` (no html/js), you get the launcher UI with a **Launch** button instead.

### 6. Taskbar

- **Start** – Opens menu: File Explorer, Monxit Engine.
- **App buttons** – One per open window; click to focus/minimize; **drag to reorder**.
- **Clock** – System time (updates every second).

### 7. Windows

- **Title bar** – Drag to move; double-click to maximize/restore.
- **Minimize / Maximize / Close** – Standard window controls.
- New windows **cascade** (offset so they don’t stack on top of each other).

---

## File System

- **Desktop** = `C:\users\<current user>\Desktop`. All desktop icons and “save to desktop” refer to this folder.
- **C:\**  
  - **monxit:\** – System-style (e.g. drivers, config).  
  - **users\** – One folder per user; each has Desktop, Documents, Downloads.  
  - **Program Files\** – e.g. Monxit Engine.
- Paths use `\` in the UI (e.g. `C:\users\user\Desktop`). Internally they use `/` (e.g. `C:/users/user/Desktop`).

---

## File Types

| Extension | Description |
|-----------|-------------|
| `.txt`    | Text file. Opens in a window with a text area. |
| `.mnx`    | Monxit app/game. Built from the engine (HTML+JS+CSS) or legacy launcher; double-click runs it. |
| `.scene`  | Scene/project file (e.g. from engine). Open in Monxit Engine. |
| `.gd`     | Script file. Open in Monxit Engine. |

- **Right-click → Rename** – You can change the name and extension (e.g. `file.txt` → `file.js`).
- **Right-click .scene / .gd → Build .mnx** – Builds a `.mnx` from that project (legacy build). Prefer building from the engine’s **Build .mnx** for full HTML/JS/CSS games.

---

## Game Engine

- **HTML** – Structure (e.g. `<div id="game"></div>`).
- **JavaScript** – Game logic (DOM, events, canvas, etc.). Runs when the game loads.
- **CSS** – Styling.
- **Play** – Runs the current code in the Preview iframe.
- **Build .mnx** – Saves `name`, `html`, `js`, `css` (and version/build date) into a new `.mnx` on the Desktop. Opening that `.mnx` runs the game in a window.

Default template: simple HTML, a button, and a click handler—replace with your own game.

---

## Project Structure

```
MonxitOS/
├── index.html          # Entry point: login + desktop + taskbar
├── README.md           # This file
├── css/
│   ├── base.css        # Global styles, login screen
│   ├── desktop.css     # Desktop icons, taskbar, start menu
│   ├── windows.css     # Window chrome, content, .mnx launcher/game
│   ├── explorer.css    # File Explorer
│   ├── contextmenu.css # Right-click menu, dialogs
│   └── gameEngine.css  # Game engine layout, code editors
└── js/
    ├── boot.js         # Login flow, clock, start menu
    ├── filesystem.js   # Virtual C: drive, users, getFolderByPath, getDesktopFolder
    ├── storage.js      # Optional: save user + files (cookies / localStorage)
    ├── windowManager.js# createWindow, getNextWindowPosition
    ├── taskbar.js      # Taskbar app list, drag to reorder
    ├── desktop.js      # Desktop icons from getDesktopFolder()
    ├── explorer.js     # File Explorer, navigateTo, openFileFromPath
    ├── fileAssociations.js # openFile, openMnxApp (run .mnx games in iframe)
    ├── gameEngine.js   # Monxit Engine: HTML/JS/CSS editors, Play, Build .mnx
    ├── contextmenu.js  # Right-click: new file, rename, delete, build .mnx
    └── fileAssociations.js
```

---

## Tech Stack

- **HTML5** – Structure.
- **CSS3** – Layout (flexbox, grid), theming, no preprocessor.
- **Vanilla JavaScript** – No frameworks; uses `window.fs` for the virtual filesystem and global helpers (`openFile`, `getDesktopFolder`, etc.).
- **No build step** – Open `index.html` or serve the folder.
- **Optional persistence** – `storage.js` can save current user (e.g. cookie) and filesystem (e.g. localStorage) so state survives refresh.

---

## License

Use and modify as you like. If you share it, a link back or credit is appreciated.

---

**Enjoy building on Monxit OS.**
