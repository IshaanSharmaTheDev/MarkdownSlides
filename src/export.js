/**
 * export.js — Export presentations to HTML and PDF
 */

const SlideExporter = (() => {
  'use strict';

  function exportHTML(slides, opts) {
    const { title = 'Presentation', theme = 'default', font = 'sans' } = opts || {};
    const slideHTML = slides.map((s, i) => `
      <section class="slide theme-${theme} font-${font}" id="slide-${i + 1}">
        <div class="slide-body">${s.html}</div>
      </section>
    `).join('\n');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: sans-serif; background: #111; }
    .slide {
      width: 100vw; height: 100vh;
      display: flex; align-items: center; justify-content: center;
      flex-direction: column; padding: 60px;
      page-break-after: always;
    }
    .slide-body { max-width: 900px; width: 100%; }
    .theme-default { background: #fff; color: #222; }
    .theme-dark { background: #1a1a2e; color: #eee; }
    .theme-solarized { background: #fdf6e3; color: #657b83; }
    .theme-moon { background: #2d2d2d; color: #cccccc; }
    .theme-sky { background: #87ceeb; color: #1a1a1a; }
    nav {
      position: fixed; bottom: 20px; left: 50%;
      transform: translateX(-50%);
      display: flex; gap: 12px; z-index: 999;
    }
    nav button {
      padding: 8px 20px; border-radius: 6px;
      border: none; cursor: pointer;
      background: rgba(0,0,0,0.6); color: #fff;
    }
    #counter { color: #fff; padding: 8px; }
    pre code { background: rgba(0,0,0,.1); padding: 2px 4px; border-radius: 3px; }
    @media print { nav { display: none; } }
  </style>
</head>
<body>
  ${slideHTML}
  <nav>
    <button onclick="prev()">◀ Prev</button>
    <span id="counter"></span>
    <button onclick="next()">Next ▶</button>
  </nav>
  <script>
    const slides = document.querySelectorAll('.slide');
    let cur = 0;
    function show(i) {
      slides.forEach((s, j) => s.style.display = j === i ? 'flex' : 'none');
      document.getElementById('counter').textContent = (i+1) + ' / ' + slides.length;
      cur = i;
    }
    function next() { if (cur < slides.length - 1) show(cur + 1); }
    function prev() { if (cur > 0) show(cur - 1); }
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prev();
    });
    show(0);
  <\/script>
</body>
</html>`;

    downloadFile(html, (title || 'presentation') + '.html', 'text/html');
  }

  function exportMarkdown(raw, filename) {
    downloadFile(raw, filename || 'presentation.md', 'text/markdown');
  }

  function exportPDF(slides, opts) {
    // Open a print-ready window
    const { title = 'Presentation', theme = 'default' } = opts || {};
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>${escapeHtml(title)}</title>
    <style>
      @media print { .no-print { display: none; } }
      body { font-family: sans-serif; }
      .slide { width: 100%; min-height: 100vh; padding: 60px; box-sizing: border-box; page-break-after: always; }
      .theme-dark { background: #1a1a2e; color: #eee; }
    </style></head><body>`);
    slides.forEach((s, i) => {
      w.document.write(`<div class="slide theme-${theme}"><div class="slide-body">${s.html}</div></div>`);
    });
    w.document.write('</body></html>');
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 500);
  }

  function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function escapeHtml(str) {
    return String(str).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  return { exportHTML, exportMarkdown, exportPDF };
})();
