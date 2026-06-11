/**
 * editor.js — Textarea editor with live sync, toolbar, and resize
 */

const SlideEditor = (() => {
  'use strict';

  let _textarea = null;
  let _onChangeCb = null;
  let _debounceTimer = null;
  const DEBOUNCE_MS = 300;

  function init(textareaEl, onChangeFn) {
    _textarea = textareaEl;
    _onChangeCb = onChangeFn;

    _textarea.addEventListener('input', handleInput);
    _textarea.addEventListener('keydown', handleKeydown);
    initDividerResize();
  }

  function handleInput() {
    updateStatusBar();
    clearTimeout(_debounceTimer);
    _debounceTimer = setTimeout(() => {
      if (_onChangeCb) _onChangeCb(_textarea.value);
    }, DEBOUNCE_MS);
  }

  function handleKeydown(e) {
    // Tab → insert 2 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      insertAtCursor('  ');
      return;
    }
    // Ctrl+B → bold
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      wrapSelection('**', '**');
      return;
    }
    // Ctrl+I → italic
    if (e.ctrlKey && e.key === 'i') {
      e.preventDefault();
      wrapSelection('*', '*');
      return;
    }
    // Ctrl+` → inline code
    if (e.ctrlKey && e.key === '`') {
      e.preventDefault();
      wrapSelection('`', '`');
      return;
    }
    // Enter after list item — continue list
    if (e.key === 'Enter') {
      const lineStart = getLineStart();
      const listMatch = lineStart.match(/^(\s*)([-*+]|\d+\.)\s/);
      if (listMatch) {
        e.preventDefault();
        const prefix = listMatch[0];
        // If line is empty (just the prefix), break out
        if (_textarea.value.substring(getLineStartIndex(), _textarea.selectionStart).trim() === '') {
          deleteCurrentLine();
          insertAtCursor('\n');
        } else {
          insertAtCursor('\n' + prefix);
        }
      }
    }
  }

  function insertAtCursor(text) {
    const start = _textarea.selectionStart;
    const end = _textarea.selectionEnd;
    const val = _textarea.value;
    _textarea.value = val.slice(0, start) + text + val.slice(end);
    _textarea.selectionStart = _textarea.selectionEnd = start + text.length;
    _textarea.dispatchEvent(new Event('input'));
  }

  function wrapSelection(before, after) {
    const start = _textarea.selectionStart;
    const end = _textarea.selectionEnd;
    const val = _textarea.value;
    const selected = val.slice(start, end) || 'text';
    const replacement = before + selected + after;
    _textarea.value = val.slice(0, start) + replacement + val.slice(end);
    _textarea.selectionStart = start + before.length;
    _textarea.selectionEnd = start + before.length + selected.length;
    _textarea.dispatchEvent(new Event('input'));
  }

  function getLineStart() {
    const val = _textarea.value;
    const pos = _textarea.selectionStart;
    const lineStart = val.lastIndexOf('\n', pos - 1) + 1;
    return val.slice(lineStart, pos);
  }

  function getLineStartIndex() {
    const val = _textarea.value;
    const pos = _textarea.selectionStart;
    return val.lastIndexOf('\n', pos - 1) + 1;
  }

  function deleteCurrentLine() {
    const val = _textarea.value;
    const pos = _textarea.selectionStart;
    const lineStart = val.lastIndexOf('\n', pos - 1) + 1;
    _textarea.value = val.slice(0, lineStart) + val.slice(pos);
    _textarea.selectionStart = _textarea.selectionEnd = lineStart;
  }

  function updateStatusBar() {
    const val = _textarea.value;
    const chars = val.length;
    const words = val.trim() ? val.trim().split(/\s+/).length : 0;
    const lines = val.split('\n').length;
    const charEl = document.getElementById('char-count');
    const wordEl = document.getElementById('word-count');
    const lineEl = document.getElementById('line-count');
    if (charEl) charEl.textContent = `${chars} chars`;
    if (wordEl) wordEl.textContent = `${words} words`;
    if (lineEl) lineEl.textContent = `${lines} lines`;
  }

  function setValue(text) {
    _textarea.value = text;
    updateStatusBar();
    if (_onChangeCb) _onChangeCb(text);
  }

  function getValue() {
    return _textarea ? _textarea.value : '';
  }

  function initDividerResize() {
    const divider = document.getElementById('divider');
    const editorPane = document.getElementById('editor-pane');
    const previewPane = document.getElementById('preview-pane');
    if (!divider || !editorPane || !previewPane) return;

    let dragging = false;
    divider.addEventListener('mousedown', e => {
      dragging = true;
      document.body.style.cursor = 'col-resize';
      e.preventDefault();
    });
    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      const workspace = editorPane.parentElement;
      const rect = workspace.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      const clamped = Math.max(0.2, Math.min(0.8, ratio));
      editorPane.style.flex = `0 0 ${clamped * 100}%`;
      previewPane.style.flex = `0 0 ${(1 - clamped) * 100 - 0.5}%`;
    });
    document.addEventListener('mouseup', () => {
      dragging = false;
      document.body.style.cursor = '';
    });
  }

  return { init, insertAtCursor, wrapSelection, setValue, getValue };
})();
