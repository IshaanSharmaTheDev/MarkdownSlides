/**
 * parser.js — Slide parser for MarkdownSlides
 * Splits raw markdown into individual slide objects,
 * extracts metadata from YAML-like frontmatter blocks,
 * and normalises separator variants (--- / *** / ___).
 */

const SlideParser = (() => {
  'use strict';

  const SEPARATOR_RE = /^(-{3,}|\*{3,}|_{3,})\s*$/m;
  const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n/;

  /**
   * Parse a raw markdown string into an array of slide objects.
   * Each slide: { index, raw, html, meta, notes }
   */
  function parse(raw) {
    const globalMeta = extractGlobalMeta(raw);
    const cleanedRaw = raw.replace(FRONTMATTER_RE, '');
    const parts = splitSlides(cleanedRaw);
    return parts.map((part, i) => buildSlide(part, i, globalMeta));
  }

  function extractGlobalMeta(raw) {
    const match = raw.match(FRONTMATTER_RE);
    if (!match) return {};
    return parseYamlLike(match[1]);
  }

  function splitSlides(raw) {
    return raw.split(SEPARATOR_RE)
      .filter(s => !SEPARATOR_RE.test(s.trim()))
      .map(s => s.trim())
      .filter(Boolean);
  }

  function buildSlide(raw, index, globalMeta) {
    const { content, notes } = extractNotes(raw);
    const { body, meta } = extractSlideMeta(content);
    return {
      index,
      raw: body,
      notes,
      meta: Object.assign({}, globalMeta, meta),
      get html() { return renderSlideMarkdown(body); },
    };
  }

  function extractNotes(raw) {
    const NOTE_RE = /\n?<!--\s*notes?\s*\n([\s\S]*?)\n?-->/i;
    const match = raw.match(NOTE_RE);
    if (!match) return { content: raw, notes: '' };
    return {
      content: raw.replace(NOTE_RE, '').trim(),
      notes: match[1].trim(),
    };
  }

  function extractSlideMeta(raw) {
    const META_RE = /^\{([^}]+)\}\n/;
    const match = raw.match(META_RE);
    if (!match) return { body: raw, meta: {} };
    return {
      body: raw.replace(META_RE, '').trim(),
      meta: parseInlineMeta(match[1]),
    };
  }

  function parseInlineMeta(str) {
    const meta = {};
    str.split(',').forEach(pair => {
      const [k, v] = pair.split(':').map(s => s.trim());
      if (k && v !== undefined) meta[k] = v;
    });
    return meta;
  }

  function parseYamlLike(str) {
    const obj = {};
    str.split('\n').forEach(line => {
      const [k, ...rest] = line.split(':');
      if (k && rest.length) obj[k.trim()] = rest.join(':').trim();
    });
    return obj;
  }

  function renderSlideMarkdown(md) {
    if (typeof marked !== 'undefined') {
      return marked.parse(md, {
        breaks: true,
        gfm: true,
        highlight: (code, lang) => highlightCode(code, lang),
      });
    }
    return md;
  }

  function highlightCode(code, lang) {
    // Basic syntax coloring without external libs
    if (!lang) return escapeHtml(code);
    return escapeHtml(code)
      .replace(/(\/\/[^\n]*)/g, '<span class="hl-comment">$1</span>')
      .replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|from|new|this|async|await)\b/g,
        '<span class="hl-kw">$1</span>')
      .replace(/("([^"]*)")/g, '<span class="hl-str">$1</span>')
      .replace(/('([^']*)')/g, '<span class="hl-str">$1</span>')
      .replace(/\b(\d+)\b/g, '<span class="hl-num">$1</span>');
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  return { parse };
})();
