/**
 * storage.js — LocalStorage persistence layer
 * Handles autosave, draft recovery, and multi-presentation history.
 */

const SlideStorage = (() => {
  'use strict';

  const KEY_CURRENT = 'mdslides_current';
  const KEY_HISTORY = 'mdslides_history';
  const KEY_SETTINGS = 'mdslides_settings';
  const MAX_HISTORY = 10;

  function saveCurrentDraft(content, filename) {
    try {
      localStorage.setItem(KEY_CURRENT, JSON.stringify({
        content,
        filename: filename || 'untitled.md',
        savedAt: Date.now(),
      }));
      flashAutosaveStatus();
    } catch (e) {
      console.warn('Autosave failed:', e);
    }
  }

  function loadCurrentDraft() {
    try {
      const raw = localStorage.getItem(KEY_CURRENT);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function clearCurrentDraft() {
    localStorage.removeItem(KEY_CURRENT);
  }

  function saveToHistory(content, filename) {
    try {
      const history = getHistory();
      history.unshift({
        content,
        filename: filename || 'untitled.md',
        savedAt: Date.now(),
        id: Date.now().toString(36),
      });
      localStorage.setItem(KEY_HISTORY, JSON.stringify(history.slice(0, MAX_HISTORY)));
    } catch (e) {
      console.warn('History save failed:', e);
    }
  }

  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem(KEY_HISTORY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function removeFromHistory(id) {
    const history = getHistory().filter(h => h.id !== id);
    localStorage.setItem(KEY_HISTORY, JSON.stringify(history));
  }

  function saveSettings(settings) {
    try {
      localStorage.setItem(KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {}
  }

  function loadSettings() {
    try {
      return JSON.parse(localStorage.getItem(KEY_SETTINGS) || '{}');
    } catch (e) {
      return {};
    }
  }

  function flashAutosaveStatus() {
    const el = document.getElementById('autosave-status');
    if (!el) return;
    el.style.color = '#4caf50';
    el.title = 'Saved ' + new Date().toLocaleTimeString();
    setTimeout(() => (el.style.color = ''), 1500);
  }

  function getStorageUsage() {
    let total = 0;
    for (const key of [KEY_CURRENT, KEY_HISTORY, KEY_SETTINGS]) {
      total += (localStorage.getItem(key) || '').length * 2; // UTF-16
    }
    return { bytes: total, kb: (total / 1024).toFixed(1) };
  }

  return {
    saveCurrentDraft,
    loadCurrentDraft,
    clearCurrentDraft,
    saveToHistory,
    getHistory,
    removeFromHistory,
    saveSettings,
    loadSettings,
    getStorageUsage,
  };
})();
