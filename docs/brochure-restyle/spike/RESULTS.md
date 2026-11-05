# Spike: can a graphic date range survive the exporter?

Run 2026-11-04 against `svg-date-spike.html` in Chromium, using the exporter's own library and
options — html2canvas **1.4.1** (the version in `prod` `package.json`, alongside
`jspdf-html2canvas@1.6.0`) called as `html2canvas(node, { useCORS: true, scale: 1 })`, exactly as
`export2Img` does in `src/app/lib/brochure/pdf.ts`. Subject string is the real computed range,
`1 พฤศจิกายน 2569 - 30 พฤศจิกายน 2569`, in Kanit 700.

Reproduce: `python -m http.server 5055` in this folder, open `svg-date-spike.html`, read the table
at the bottom of the page or `window.__spike`.

## Result

| # | Treatment | Font in the raster | Effect | Usable |
|---|---|---|---|---|
| A | HTML text (what ships today) | **Kanit 700 kept** | — | ✅ control |
| B | HTML text + `-webkit-text-stroke` outline | **Kanit 700 kept** | outline kept | ✅ |
| C | HTML text + layered `text-shadow` outline | **Kanit 700 kept** | outline kept | ✅ |
| D | inline SVG `<text>`, Kanit from the page's stylesheet | **lost → serif fallback, bold lost** | — | ❌ |
| E | inline SVG `<text>` + `stroke` / `paint-order` | **lost** | stroke kept | ❌ |
| F | inline SVG `<text>` + `linearGradient` fill | **lost** | gradient kept | ❌ |
| G | inline SVG `<text>` + `feDropShadow` | **lost** | shadow kept | ❌ |
| H | inline SVG + `@font-face` with the font base64-embedded in the SVG | **Kanit 700 kept** | — | ✅ |

**The headline: inline SVG does not inherit the page's webfont.** html2canvas serialises inline SVG
and rasterises it as an isolated image, and that isolated document cannot reach the Google Fonts
stylesheet — so D–G all fell back to the browser's default serif and lost the 700 weight, while the
SVG *effects* (stroke, gradient, drop shadow) all survived fine. The font is the thing that breaks,
not the decoration.

Embedding the font inside the SVG (H) fixes it completely — that raster is pixel-identical to the
live DOM.

### A measurement trap worth recording

The first pass of this spike scored variants by comparing the rasterised ink width against the live
text width, and **passed D–G at 1.02–1.03×**. The serif fallback happens to set this Thai string to
almost exactly Kanit's width. It is only visibly wrong — different glyph shapes, regular instead of
bold. Ink *density* (ink pixels ÷ bounding box) catches it: D sits at 0.70× the control and F at
0.64×. Any future check of this kind needs the density measure plus an eye on the image; width alone
will lie. The page now reports both, and marks the outlined variants "check by eye" because an
outline inflates the bounding box and drags density down on its own.

## Recommendation

1. **If the "graphic" date is outlined or shadowed numerals — use HTML text, not SVG.**
   `-webkit-text-stroke` (B) or a layered `text-shadow` (C) both render correctly through the
   exporter, keep Kanit, keep the date computed from `fromDate`/`toDate`, and are a CSS-only change
   in `.date` / `.date-static`. Hours of work, no new dependency, no new asset. **Try this first.**
2. **If it genuinely needs a gradient fill or an SVG-only effect** — inline SVG is fine *provided*
   the font is embedded as base64 `@font-face` inside the SVG (H). Costs: a build step to generate
   the embedded face, and the font bytes ride along in the export.
3. **Never** ship inline SVG text that relies on the page's webfont. It looks right on screen and
   wrong in every exported file — the worst possible failure mode, because the preview passes.

## Caveats

- The embedded face in H was the **Thai subset only** (13.2 KB woff2 from
  `fonts.gstatic.com/s/kanit/v17/nKKU-Go6G5tXcr4uPhWzVaF5NQ.woff2`), which is why the digits in that
  row still render serif. A real implementation embeds the Latin subset too, or the whole face.
- Tested at `scale: 1`; the real export rasterises the hidden 420 mm static node at a much larger
  font size. The font-resolution mechanism is the same, but the stroke widths and shadow offsets in
  B/C will need tuning against the static path, not just the screen path.
- This exercised html2canvas directly. The full `jspdf-html2canvas` path then places that canvas
  into a PDF page, so the font question is already settled at the html2canvas step — but confirm
  once on a real brochure export before committing to a treatment.
