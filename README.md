# MarkdownSlides

I got tired of using PowerPoint for everything. This is a browser-based presentation tool where you just write markdown and it turns into slides automatically. No accounts, no cloud, no installs — just open the HTML file and start typing.

Built this over a weekend because I needed to make a project demo and didn't want to sit there dragging boxes around in PowerPoint for an hour.

## What it does

- Write slides in markdown, see them render live on the right
- `---` separates slides
- Supports code blocks with syntax highlighting
- Fullscreen presentation mode (press `F` or click the button)
- Keyboard navigation (`←` `→` arrows)
- Export to PDF from the browser print dialog
- Works 100% offline — no internet needed after download

## How to use it

Just download the repo and open `index.html` in your browser. That's literally it.

```
git clone https://github.com/AadhhyaSharma/MarkdownSlides
cd MarkdownSlides
# open index.html in your browser
```

No npm, no pip, no setup. One file, runs anywhere.

## Slide syntax

```markdown
# My Presentation

First slide content here

---

## Second Slide

- bullet point
- another point

---

## Code Slide

\`\`\`python
print("hello world")
\`\`\`
```

## Why not just use Reveal.js or Marp?

Those are great tools honestly. But I wanted to understand how a slide engine actually works under the hood, so I built one from scratch. It's about 400 lines of vanilla JS and I learned a lot doing it.

## Tech

Pure HTML/CSS/JS. Zero dependencies, zero build step. Marked.js for markdown parsing, Highlight.js for code blocks — both bundled inline so it works offline.

---

Made this for personal use, figured someone else might find it useful too. Issues and PRs welcome.
