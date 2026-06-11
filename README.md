# MarkdownSlides

A browser-based Markdown presentation builder. Write slides in Markdown, preview them live, and present full-screen — no installs, no build tools, just open and go.

## Features

- **Live split-pane editor** — write Markdown on the left, see rendered slides on the right
- **Slide separator** — use `---` to split your content into individual slides
- **5 built-in themes** — Default, Dark, Solarized, Moon, Sky
- **Font choices** — Sans, Serif, Monospace
- **Fullscreen presentation mode** — keyboard + touch navigation, progress bar
- **Slide thumbnails** — visual strip below the preview
- **Syntax highlighting** — code blocks with basic coloring for JS/HTML/CSS
- **Export to HTML** — self-contained single-file export with navigation
- **Export to PDF** — opens a print dialog with print-ready layout
- **Autosave** — saves your work to localStorage automatically every 30s
- **Presentation history** — keeps the last 10 saved files
- **Draggable divider** — resize editor and preview panes
- **Toolbar shortcuts** — insert bold, italic, code, lists, links, images with one click
- **Keyboard shortcuts** — Ctrl+S save, Ctrl+P present, F5 fullscreen, Tab indents
- **Speaker notes** — add `<!-- notes ... -->` comments, they show in preview
- **Per-slide metadata** — override background color/image and layout per slide with `{key: value}` syntax
- **Global frontmatter** — YAML-like frontmatter block at the top for global settings

## File Structure

```
MarkdownSlides/
├── index.html           # App shell and layout
├── styles/
│   ├── main.css         # Core layout, editor, preview, presentation overlay
│   ├── themes.css       # Theme color palettes and font families
│   └── highlight.css    # Code syntax highlight classes
└── src/
    ├── parser.js        # Markdown → slide objects, frontmatter, speaker notes
    ├── renderer.js      # DOM rendering, thumbnails, theme/font application
    ├── editor.js        # Textarea editor, keyboard shortcuts, divider resize
    ├── presentation.js  # Fullscreen mode, keyboard/touch navigation, progress bar
    ├── storage.js       # localStorage autosave, history, settings
    ├── export.js        # HTML and PDF export
    └── app.js           # App bootstrap, event wiring, state management
```

## How to Use

1. Clone or download and open `index.html` in a browser
2. Write your presentation in the editor — use `---` on its own line to separate slides
3. Choose a theme and font from the top bar
4. Click **▶ Present** (or press F5) to go fullscreen
5. Navigate with arrow keys or swipe on touch devices
6. Press **Esc** to exit
7. Use **Export HTML** to get a portable single-file version

## Markdown Syntax

| Syntax | Result |
|--------|--------|
| `# Heading` | Slide title |
| `**bold**` / `*italic*` | Formatting |
| `- item` | Bullet list |
| `` `code` `` | Inline code |
| ` ```js ... ``` ` | Code block with highlight |
| `---` | Slide separator |
| `![alt](url)` | Image |
| `[text](url)` | Link |
| `> quote` | Blockquote |

## Per-Slide Metadata

Add a metadata line at the top of a slide to override its appearance:

```
{layout: cover, background: #1a1a2e, color: #ffffff}
# Title Slide
```

Supported keys: `layout` (center / top / split / cover), `background` (hex or image URL), `color`

## Speaker Notes

```markdown
# My Slide

Content here

<!-- notes
These notes are visible in preview but hidden during presentation.
-->
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Ctrl+S | Save / download .md |
| Ctrl+P | Start presentation |
| F5 | Fullscreen presentation |
| Ctrl+N | Add new slide |
| Ctrl+B | Bold selected text |
| Ctrl+I | Italic selected text |
| Tab | Insert 2 spaces |
| ← / → (present) | Navigate slides |
| Esc | Exit presentation |

## Tech Stack

Vanilla JavaScript (ES5/ES6), HTML5, CSS3, localStorage API. No frameworks, no npm, no build step. Uses [marked.js](https://marked.js.org/) for Markdown parsing.

## License

MIT
