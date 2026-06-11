/**
 * app.js — Main application bootstrap and event wiring
 */

(function () {
  'use strict';

  const DEFAULT_CONTENT = `# Welcome to MarkdownSlides
### Build beautiful presentations with Markdown

---

## Features

- ✅ Live Markdown preview
- ✅ Multiple themes
- ✅ Fullscreen presentation mode
- ✅ Export to HTML & PDF
- ✅ Autosave to localStorage
- ✅ Keyboard navigation

---

## Code Support

\`\`\`js
function greet(name) {
  return \`Hello, \${name}!\`;
}
console.log(greet('World'));
\`\`\`

---

{layout: cover, background: #1a1a2e, color: #fff}
# The End

Press **Esc** to exit presentation mode

<!-- notes
Remind audience about Q&A.
-->
`;

  let slides = [];
  let currentSlide = 0;
  let filename = 'untitled.md';
  let currentTheme = 'default';
  let currentFont = 'sans';

  function init() {
    const settings = SlideStorage.loadSettings();
    currentTheme = settings.theme || 'default';
    currentFont = settings.font || 'sans';

    const themeSelect = document.getElementById('theme-select');
    const fontSelect = document.getElementById('font-select');
    if (themeSelect) themeSelect.value = currentTheme;
    if (fontSelect) fontSelect.value = currentFont;

    const draft = SlideStorage.loadCurrentDraft();
    const initialContent = draft ? draft.content : DEFAULT_CONTENT;
    if (draft && draft.filename) filename = draft.filename;
    updateFilenameDisplay();

    SlideEditor.init(document.getElementById('editor'), onEditorChange);
    SlideEditor.setValue(initialContent);

    bindToolbar();
    bindThemeFont();
    bindFileOps();
    bindPresentation();
    bindHelp();
    bindSlideNav();

    // Autosave every 30 seconds
    setInterval(() => {
      SlideStorage.saveCurrentDraft(SlideEditor.getValue(), filename);
    }, 30000);
  }

  function onEditorChange(content) {
    slides = SlideParser.parse(content);
    if (currentSlide >= slides.length) currentSlide = Math.max(0, slides.length - 1);
    renderPreview();
    updateSlideCounter();
    SlideStorage.saveCurrentDraft(content, filename);
  }

  function renderPreview() {
    const container = document.getElementById('slide-preview');
    const thumbContainer = document.getElementById('slide-thumbnails');
    if (!slides.length) {
      if (container) container.innerHTML = '<p class="empty-state">Start typing to see your slides...</p>';
      return;
    }
    SlideRenderer.renderSlide(slides[currentSlide], container, {
      theme: currentTheme,
      font: currentFont,
      animate: true,
    });
    SlideRenderer.buildThumbnails(slides, thumbContainer, currentSlide, goToSlide);
    SlideRenderer.scrollToThumbnail(thumbContainer, currentSlide);
  }

  function goToSlide(index) {
    if (index < 0 || index >= slides.length) return;
    currentSlide = index;
    renderPreview();
    updateSlideCounter();
  }

  function updateSlideCounter() {
    const el = document.getElementById('slide-counter');
    if (el) el.textContent = `Slide ${currentSlide + 1} / ${Math.max(1, slides.length)}`;
  }

  function updateFilenameDisplay() {
    const el = document.getElementById('filename-display');
    if (el) el.textContent = filename;
  }

  function bindToolbar() {
    document.querySelectorAll('.tool-btn[data-insert]').forEach(btn => {
      btn.addEventListener('click', () => {
        SlideEditor.insertAtCursor(btn.dataset.insert);
      });
    });
    document.getElementById('btn-add-slide').addEventListener('click', () => {
      SlideEditor.insertAtCursor('\n\n---\n\n# New Slide\n\nContent here...\n');
    });
  }

  function bindThemeFont() {
    document.getElementById('theme-select').addEventListener('change', e => {
      currentTheme = e.target.value;
      SlideStorage.saveSettings({ theme: currentTheme, font: currentFont });
      renderPreview();
    });
    document.getElementById('font-select').addEventListener('change', e => {
      currentFont = e.target.value;
      SlideStorage.saveSettings({ theme: currentTheme, font: currentFont });
      renderPreview();
    });
  }

  function bindFileOps() {
    document.getElementById('btn-new').addEventListener('click', () => {
      if (!confirm('Start a new presentation? Unsaved changes will be lost.')) return;
      filename = 'untitled.md';
      updateFilenameDisplay();
      SlideEditor.setValue(DEFAULT_CONTENT);
    });

    document.getElementById('btn-open').addEventListener('click', () => {
      document.getElementById('file-input').click();
    });

    document.getElementById('file-input').addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      filename = file.name;
      updateFilenameDisplay();
      const reader = new FileReader();
      reader.onload = ev => SlideEditor.setValue(ev.target.result);
      reader.readAsText(file);
      e.target.value = '';
    });

    document.getElementById('btn-save').addEventListener('click', () => {
      SlideExporter.exportMarkdown(SlideEditor.getValue(), filename);
      SlideStorage.saveToHistory(SlideEditor.getValue(), filename);
    });

    document.getElementById('btn-export-html').addEventListener('click', () => {
      SlideExporter.exportHTML(slides, { title: filename.replace('.md', ''), theme: currentTheme, font: currentFont });
    });

    document.getElementById('btn-export-pdf').addEventListener('click', () => {
      SlideExporter.exportPDF(slides, { title: filename.replace('.md', ''), theme: currentTheme });
    });
  }

  function bindPresentation() {
    document.getElementById('btn-present').addEventListener('click', startPresentation);

    document.getElementById('present-prev').addEventListener('click', () => PresentationMode.prev());
    document.getElementById('present-next').addEventListener('click', () => PresentationMode.next());
    document.getElementById('present-exit').addEventListener('click', () => PresentationMode.stop());
  }

  function startPresentation() {
    if (!slides.length) { alert('No slides to present!'); return; }
    PresentationMode.start(slides, currentSlide, { theme: currentTheme, font: currentFont });
  }

  function bindHelp() {
    const modal = document.getElementById('help-modal');
    document.getElementById('btn-help').addEventListener('click', () => modal.classList.toggle('hidden'));
    document.getElementById('help-close').addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });
  }

  function bindSlideNav() {
    document.getElementById('btn-prev').addEventListener('click', () => goToSlide(currentSlide - 1));
    document.getElementById('btn-next').addEventListener('click', () => goToSlide(currentSlide + 1));
  }

  document.addEventListener('keydown', e => {
    if (PresentationMode.isActive()) return;
    if (e.ctrlKey && e.key === 's') { e.preventDefault(); SlideExporter.exportMarkdown(SlideEditor.getValue(), filename); }
    if (e.ctrlKey && e.key === 'p') { e.preventDefault(); startPresentation(); }
    if ((e.key === 'F5')) { e.preventDefault(); startPresentation(); }
    if (e.ctrlKey && e.key === 'n' && !e.shiftKey) { e.preventDefault(); SlideEditor.insertAtCursor('\n\n---\n\n# New Slide\n\n'); }
  });

  document.addEventListener('DOMContentLoaded', init);
})();
