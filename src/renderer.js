/**
 * renderer.js — Slide DOM renderer
 * Handles rendering individual slides into the preview pane,
 * applying theme classes, font choices, slide transitions,
 * and building the thumbnail strip.
 */

const SlideRenderer = (() => {
  'use strict';

  const LAYOUT_CLASSES = ['layout-center', 'layout-top', 'layout-split', 'layout-cover'];

  function renderSlide(slide, container, opts = {}) {
    if (!container) return;
    const { theme = 'default', font = 'sans', animate = true } = opts;

    container.className = [
      'slide',
      `theme-${theme}`,
      `font-${font}`,
      getLayoutClass(slide),
      animate ? 'slide-in' : '',
    ].filter(Boolean).join(' ');

    container.innerHTML = buildSlideHTML(slide);
    applySlideBackground(slide, container);
    lazyLoadImages(container);

    // Remove animation class after it plays
    if (animate) {
      setTimeout(() => container.classList.remove('slide-in'), 400);
    }
  }

  function buildSlideHTML(slide) {
    const html = slide.html || '';
    const notesHTML = slide.notes
      ? `<aside class="slide-notes"><strong>Notes:</strong> ${escapeHtml(slide.notes)}</aside>`
      : '';
    return `<div class="slide-body">${html}</div>${notesHTML}`;
  }

  function getLayoutClass(slide) {
    const layout = slide.meta && slide.meta.layout;
    if (layout && LAYOUT_CLASSES.includes(`layout-${layout}`)) {
      return `layout-${layout}`;
    }
    return 'layout-center';
  }

  function applySlideBackground(slide, container) {
    const bg = slide.meta && slide.meta.background;
    const color = slide.meta && slide.meta.color;
    if (bg) {
      if (bg.startsWith('#') || bg.startsWith('rgb')) {
        container.style.background = bg;
      } else {
        container.style.backgroundImage = `url(${bg})`;
        container.style.backgroundSize = 'cover';
        container.style.backgroundPosition = 'center';
      }
    } else {
      container.style.background = '';
      container.style.backgroundImage = '';
    }
    if (color) container.style.color = color;
    else container.style.color = '';
  }

  function lazyLoadImages(container) {
    container.querySelectorAll('img').forEach(img => {
      img.setAttribute('loading', 'lazy');
      img.addEventListener('error', () => {
        img.style.display = 'none';
        const placeholder = document.createElement('div');
        placeholder.className = 'img-error';
        placeholder.textContent = '[Image could not be loaded]';
        img.parentNode.insertBefore(placeholder, img);
      });
    });
  }

  function buildThumbnails(slides, container, currentIndex, onClickFn) {
    container.innerHTML = '';
    slides.forEach((slide, i) => {
      const thumb = document.createElement('div');
      thumb.className = `thumbnail ${i === currentIndex ? 'active' : ''}`;
      thumb.dataset.index = i;

      const num = document.createElement('span');
      num.className = 'thumb-num';
      num.textContent = i + 1;

      const preview = document.createElement('div');
      preview.className = 'thumb-preview';
      // Render a stripped-down text preview
      const tmp = document.createElement('div');
      tmp.innerHTML = slide.html || '';
      preview.textContent = tmp.textContent.slice(0, 80) || `Slide ${i + 1}`;

      thumb.appendChild(num);
      thumb.appendChild(preview);
      thumb.addEventListener('click', () => onClickFn(i));
      container.appendChild(thumb);
    });
  }

  function scrollToThumbnail(container, index) {
    const thumb = container.querySelector(`.thumbnail[data-index="${index}"]`);
    if (thumb) thumb.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  return { renderSlide, buildThumbnails, scrollToThumbnail };
})();
