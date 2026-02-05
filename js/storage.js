/**
 * Client-side persistence using localStorage (no database).
 * Saves the current user and the entire filesystem so when you sign back in
 * on the same browser, all your files, games, and txt files are still there.
 */

const STORAGE_KEY_FS = "monxit_fs";
const STORAGE_KEY_USER = "monxit_user";
const STORAGE_KEY_TRASH = "monxit_trash";

window.monxitTrash = [];

window.loadTrash = function() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRASH);
    if (!raw) return;
    window.monxitTrash = JSON.parse(raw) || [];
  } catch (_) {
    window.monxitTrash = [];
  }
};

window.persistTrash = function() {
  try {
    localStorage.setItem(STORAGE_KEY_TRASH, JSON.stringify(window.monxitTrash || []));
  } catch (_) {}
};

window.loadStoredUser = function() {
  try {
    return localStorage.getItem(STORAGE_KEY_USER);
  } catch (_) {
    return null;
  }
};

window.saveUser = function(username) {
  try {
    localStorage.setItem(STORAGE_KEY_USER, username || "");
  } catch (_) {}
};

window.loadStoredFilesystem = function() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FS);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
};

window.persistFilesystem = function() {
  try {
    localStorage.setItem(STORAGE_KEY_FS, JSON.stringify(window.fs));
  } catch (e) {
    console.warn("Monxit: could not save files", e);
  }
};
