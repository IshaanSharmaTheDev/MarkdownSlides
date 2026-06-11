/**
 * presentation.js — Full-screen presentation mode controller
 * Handles slide navigation, keyboard/touch events, progress bar,
 * and speaker notes overlay.
 */

const PresentationMode = (() => {
  'use strict';

  let _slides = [];
  let _current = 0;
  let _opts = {};
  let _touchStartX = 0;
  let _active = false;

  function start(slides, startIndex, opts) {
    _slides = slides;
    _current = startIndex || 0;
    _opts = opts || {};
    _active = true;

    const overlay = document.getElementById('present-overlay');
    overlay.classList.remove('hidden');

    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }

    document.addEventListener('keydown', handleKey);
    overlay.addEventListener('touchstart', handleTouchStart, { passive: true });
    overlay.addEventListener('touchend', handleTouchEnd, { passive: true });

    renderCurrentSlide();
  }

  function stop() {
    _active = false;
    const overlay = document.getElementById('present-overlay');
    overlay.classList.add('hidden');

    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    document.removeEventListener('keydown', handleKey);
  }

  function renderCurrentSlide() {
    if (!_slides.length) return;
    const slide = _slides[_current];
    const container = document.getElementById('present-slide');
    const counter = document.getElementById('present-counter');
    const bar = document.getElementById('progress-bar');

    if (container) {
      SlideRenderer.renderSlide(slide, container, _opts);
    }
    if (counter) {
      counter.textContent = `${_current + 1} / ${_slides.length}`;
    }
    if (bar) {
      const pct = _slides.length > 1
        ? (_current / (_slides.length - 1)) * 100
        : 100;
      bar.style.width = `${pct}%`;
    }
  }

  function goTo(index) {
    if (index < 0 || index >= _slides.length) return;
    _current = index;
    renderCurrentSlide();
  }

  function next() { goTo(_current + 1); }
  function prev() { goTo(_current - 1); }

  function handleKey(e) {
    if (!_active) return;
    const map = {
      ArrowRight: next, ArrowDown: next, Space: next, PageDown: next,
      ArrowLeft: prev, ArrowUp: prev, PageUp: prev,
      Home: () => goTo(0),
      End: () => goTo(_slides.length - 1),
      Escape: stop, KeyF: () => goTo(0),
    };
    const fn = map[e.code] || map[e.key];
    if (fn) { e.preventDefault(); fn(); }
  }

  function handleTouchStart(e) {
    _touchStartX = e.changedTouches[0].screenX;
  }

  function handleTouchEnd(e) {
    const dx = e.changedTouches[0].screenX - _touchStartX;
    if (Math.abs(dx) > 50) {
      dx < 0 ? next() : prev();
    }
  }

  function getCurrentIndex() { return _current; }
  function isActive() { return _active; }

  return { start, stop, next, prev, goTo, getCurrentIndex, isActive };
})();
