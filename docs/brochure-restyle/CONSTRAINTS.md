# Brochure restyle — engineering constraints (internal)

> Companions: `SEND-TO-BUSINESS.md` (Thai, for the requester) ·
> `DESIGNER-BRIEF.md` (Thai, for the design team — asset sizes, file-name matrix, safe areas,
> colour rules) · `spike/RESULTS.md` (the date-range rasterisation spike).
> **This file is internal — do not send it outside the team.**

Written 2026-11-04 from the live code on `origin/prod`. The three brochures the business wants
restyled are the three routes in `src/app/brochure/routes.ts`:

| Brochure | Route | Component tree | Price shown |
|---|---|---|---|
| Normal ("prochure") | `prochure/:wholeCode/:promoType` | `brochure-normal-page` → `brochure-page` → `brochure-card` | 3 tiers (standard/silver/gold) + main `price` |
| Marketing / special | `marketing/:promoType/:isBkk/:isNew/:wholeType/:token/:idPromotion` | `brochure-special-page` → `brochure-page` → `brochure-special-card` | single `priceGold` + quota text |
| Flash sale | `flash-sale/:zone/:idPromotion` | `brochure-flash-sale-page` → `brochure-flash-sale` → `brochure-flash-sale-card` | `flashPrice` over `price.png` |

Only `src/app/brochure/**` is live. `src/app/components/brochure-card/*`,
`src/app/components/brochure-component/*` and `src/app/pages/brochure-project/*` are older copies of
the same components — do not restyle those, and do not use them to estimate.

---

## 1. Hard constraints (these shape what a design can be)

**1.1 The PDF is a screenshot, not a document.**
`src/app/lib/brochure/pdf.ts` exports with `jspdf-html2canvas` + `html2canvas` (A4 portrait,
`compress: true`; the JPG path uses `scale: 1`). Consequences:
- text in the PDF is pixels — not selectable, not searchable, and not print-shop quality;
- anything html2canvas cannot rasterise silently disappears or renders wrong. In practice that rules
  out: `filter` / `backdrop-filter` (blur, glass), `mix-blend-mode`, `background-clip: text`
  (gradient text), `clip-path`, CSS masks, SVG filters, modern color functions (`oklch`, `color-mix`),
  and makes soft/layered `box-shadow` unreliable;
- the `@media print` block in `brochure-page.component.scss` does nothing on export — it only
  affects Ctrl+P.
→ **Acceptance has to be judged on the exported file, not on the browser screen.**

**1.2 Every page exists twice in the DOM.**
The page templates render the visible preview *and* a hidden full-document copy
(`.not-show { width: 210mm }` in `src/app/brochure/pages/base-brochure.scss`) with `isStatic=true`,
which the exporter screenshots. The static page is `width: 420mm; height: 593.7mm` (2× A4) and is
styled by a completely separate class set (`static-*` vs `res-*`, with ~6 breakpoints on the `res-`
side). So every visual change is authored twice and verified twice. This is the single biggest
multiplier on any restyle estimate.

**1.3 Layout geometry is fixed.**
- 12 items per page, injected per route via `BROCHURE_PAGE_TOKEN` (`pageSize: 12`) and chunked by
  `transformItemList` in `src/app/brochure/libs/libs.ts`;
- the page grid is `grid-template-rows: repeat(4, 1fr)` → 3 × 4;
- each card is locked to `aspect-ratio: 1` and an internal `repeat(3, 1fr)` × `repeat(3, 1fr)` grid
  (name spans the top row, photo spans 2 columns, prices the right column).
Changing items per page changes pagination *and* the proportions of the header/footer artwork.

**1.4 Header, footer and the flash-sale furniture are bitmaps, not CSS.**
`headerUrl()` / `footerUrl()` on `brochure-page`, and for flash sale `/image/FS/price.png`,
`/image/FS/number/{n}.png`, plus the background from `head.linkimg`. Restyling those areas means
**new image files from the business/design side**, sized for the 420 mm static render — not frontend
work. The flash-sale price number is absolutely positioned over `price.png` with hardcoded
`translate: 0 65%` (screen) / `0 75%` (static); new artwork means re-tuning those magic numbers.

**1.5 Product photos are whatever is in the picture store.**
`imageUrl()` = `https://file.drugnetcenter.com/drugpos/GoodPictures/{goodCode}.jpg`.
One file per good code, `.jpg` (so **no transparency** — no cut-out products on a colored panel),
mixed aspect ratios, mixed resolutions, mixed backgrounds, and **no fallback in the template** when a
code has no file (broken image). The exporter also fetches every image and inlines it as base64
before rasterising, so image count directly costs export time and CORS is a live failure mode.

**1.6 The data per item is fixed.**
`TItem` (`src/app/brochure/types/brochure.type.ts`) is: `goodCode`, `goodName`, `barCode`,
`price` / `priceGold` / `priceSilver` / `priceStandard`, `quotaAmou` / `quotaAmouTxt`. Flash sale
items are `goodName`, `barCode`, `flashPrice`. The head gives `fromDate`, `toDate`, `wholeName`,
`wholeType`, `zone`, `promotionType`, `isNewCustomer`.
Anything else an AI mockup likes to add — % discount, was-price, savings, unit size, pack size,
category badge, "best seller", star ratings, product blurb — **has no data source**. It needs the
brochure API (`https://api.drugnetcenter.com/ItemService2`, source not in this workspace), i.e. a
different team and a separate estimate.

**1.7 The entry contract is fixed.** Brochure URLs are opened by the calling system with those route
params. A new design cannot require a new input (e.g. "choose a theme") without changing the caller.

**1.8 Fonts.** `src/styles.scss` pulls Kanit + Prompt from Google Fonts and sets Bootstrap's
`$font-family-sans-serif` to Kanit. A brand font that is not on Google Fonts has to be self-hosted and
pre-loaded, or it silently falls back in the raster export.

**1.9 Long Thai product names have no rule today.** No truncation, no line clamp, font size stepped
per breakpoint. Any tighter design will overflow on the long names. The restyle must define a rule
(max lines + ellipsis, or a minimum font size) — a design decision we need from them.

**1.10 Bootstrap 5 is the base.** Page chrome uses Bootstrap classes; brand colors live as CSS
custom properties in `:root` (`--color-yellow`, `--color-red`, `--brand-purple-*`, `--brand-green-*`,
`--a4-width-150/300`). Zone drives card color (`zoneToColor`: BKK → purple, UPC → green).

**1.11 No deploy pipeline in this repo.** Merging changes nothing until someone builds and deploys
the app (workspace `CLAUDE.md` §6). Date promises must account for that hand-off.

**1.12 Nothing in the current design survives a black-and-white printer well.**
The exported PDF/JPG is routinely printed, and branch printers are mono. Measured on today's
palette (sRGB, WCAG contrast + CIE L\* as a stand-in for what a mono printer produces):

| Element | Colors | Contrast | Grey L\* |
|---|---|---|---|
| Card header, purple (BKK) + white text | `#a33bf8` | 4.63:1 | 49.1 |
| Card header, green (UPC) + white text | `#00a59b` | **3.06:1** | 61.0 |
| Tier label `standard` + white text | `#f54040` | **3.69:1** | 55.5 |
| Tier label `silver` + white text | `#58595b` | 7.01:1 | 37.8 |
| Tier label `gold` + white text | `#9d5b1f` | 5.32:1 | 45.3 |
| Price, red on yellow panel | `#e50020` on `#fffbc7` | 4.57:1 | 48.0 |
| Quota banner, red + white text | `#e50020` | 4.82:1 | 48.0 |

Two separate problems:
- **Already failing in color.** The green card header (3.06:1) and the `standard` tier label
  (3.69:1) are below WCAG AA 4.5:1 for white text today. A restyle is the moment to fix that, not
  inherit it.
- **The color coding collapses in mono.** The three tiers land at L\* 55.5 / 45.3 / 37.8 — three
  mid-greys, and the semantic order even inverts (`standard` prints *lightest*, `silver` darkest).
  The two zone colors land at 49.1 and 61.0, barely 12 L\* apart, so "is this a Bangkok or an
  upcountry brochure" stops being readable at a glance. Only the literal words
  `standard` / `silver` / `gold` still carry the meaning.

So the new design has to carry meaning by something other than hue alone (label text, border weight,
shape, fill density), and a **grayscale proof is an acceptance step**, not an afterthought. Ask
design for each reference image in grayscale as well; if they won't, we impose a rule — white text
only on fills at or below roughly L\* 45, and no two color-coded states within ~15 L\* of each other.

**1.13 The promotion date range is computed text — the draft wants it drawn as a graphic.**
Today `BrochurePageComponent.date()` builds the string from `head.fromDate` / `head.toDate`: splits
the ISO date, shifts +7 h, maps the month to a Thai name, converts to the Buddhist year (`+543`), and
produces e.g. `1 พฤศจิกายน 2569 - 30 พฤศจิกายน 2569`. If either date is missing,
`getDefaultDate()` fabricates a whole-current-month range (with leap-year handling). It renders as
plain text in the `.date` / `.date-static` chip.

The only graphic numeral that exists in the system is the Flash Sale day badge:
`dayImg()` = `Math.min(head.day, 9)` → `/image/FS/number/{n}.png`. **One digit, clamped at 9, nine
fixed files.** That is not a mechanism that can render an arbitrary date range, so the draft's
graphic date range is an open question with four answers, cheapest first:

| Option | What it costs | Stays data-driven? |
|---|---|---|
| (a) It's just a display typeface — get the font file from design, self-host it, keep rendering text | hours | yes |
| (b) Outlined / shadowed numerals as **HTML text** (`-webkit-text-stroke` or layered `text-shadow`) | hours, CSS only — **measured working**, see below | yes |
| (c) Inline SVG text with gradient or SVG-only effects | works **only** with the font base64-embedded in the SVG; adds a build step | yes |
| (d) Per-glyph PNG set: 10 digits + 12 Thai month words + separator, cut at static scale, plus a compositor for widths/baseline/kerning | days, and every later style tweak re-cuts the whole set | yes |
| (e) A designer draws the date image per campaign | a design task per promotion, forever | **no** |

**Spiked 2026-11-04 — full method and numbers in `spike/RESULTS.md`, page in
`spike/svg-date-spike.html`.** Eight treatments were put through html2canvas 1.4.1 with the
exporter's own options. The finding that matters:

> **Inline SVG text does not inherit the page's webfont.** html2canvas serialises inline SVG and
> rasterises it in isolation, where the Google Fonts stylesheet is unreachable — so SVG text fell
> back to the default serif and lost the 700 weight in the export, while *looking perfectly correct
> on screen*. The SVG effects themselves (stroke, `paint-order`, `linearGradient`, `feDropShadow`)
> all survived; only the font broke. Embedding the font as base64 `@font-face` inside the SVG fixes
> it exactly.

So the order to try is **(a), then (b), then (c)** — and (b) is the quiet win: outlined and shadowed
HTML text rasterises correctly *with* Kanit, which means the common "graphic numerals" look needs no
SVG and no artwork at all, just CSS on `.date` / `.date-static`. Note that stroke widths and shadow
offsets have to be tuned on the 420 mm static path as well as the screen path (§1.2).

Never ship inline SVG text relying on the page's webfont: the preview passes and every exported file
is wrong, which is the worst failure mode available here.

**(e) is the duration risk and we should push back on it.**

The date would stop following the data: edit a promotion's period in the source system and the
brochure keeps showing the old range until someone redraws the artwork — wrong information on a
customer-facing document, a designer in the loop for every period change, and no possible artwork
for the `getDefaultDate()` fallback. If they insist on (e), we need a stated rule for what the
brochure shows when artwork for a period is missing.

Also note the date chip is currently black on white (21:1) and the only element that prints cleanly
in mono. A colored graphic plate in its place walks straight into §1.12.

---

## 2. Cost bands for whatever they ask for

| Band | What falls in it |
|---|---|
| Cheap — CSS only | colors, radii, padding/gaps, font weight & size, border treatment, tier label colors, price-block colors, date/label chip styling. Done in `:root` tokens + the card/page SCSS (×2 for `res`/`static`). Fixing the two failing contrast pairs (§1.12) belongs here. |
| Medium | rearranging the card interior, changing items per page, name truncation rules, normalising the photo box (fixed frame + `object-fit`), per-zone theming, a mono-safe palette pass with a grayscale proof. Each touches pagination or both render paths. |
| Cheap — CSS only (spiked ✅) | an outlined / shadowed "graphic" date range as HTML text (§1.13 option b). Measured working through the exporter; no SVG, no artwork. |
| Needs a build step | inline SVG date range with a gradient or SVG-only effect (§1.13 option c) — only with the font base64-embedded in the SVG. |
| Needs assets from them | every header/footer/decorative element, flash-sale price plate, number plates, background; a display font file, or a full per-glyph numeral + Thai month set if the date range is really drawn (§1.13). PNG at static scale, with a stated size. |
| Needs an API project | any new field on the card (§1.6). |
| Not available with today's export | glass/blur, gradient text, soft layered shadows, masked/clipped photos, selectable text in the PDF, CMYK/bleed print-shop output. |

A different output route (real vector PDF, or server-side rendering) is a project in its own right —
worth quoting separately if they want print-shop quality.

---

## 3. What we need back from them (the spec request)

1. **One final reference image per brochure** (3 total), marked final — not a stream of regenerations.
2. For each image, which parts they will **supply as artwork** (PNG) vs which parts we build in code.
3. For every number/text on the image that is not in §1.6, **where the value comes from**.
4. Items per page: keep 12, or change (and accept the pagination/artwork consequence).
5. Where the output is used: screen only / exported JPG for LINE / printed in-house / print shop.
   If print shop → paper size, CMYK and bleed requirements (this changes §1.1 entirely).
6. **Will it be printed on a black-and-white printer?** If yes (§1.12): a grayscale proof of each
   reference image, and confirmation that zone and price tier are told apart by something other than
   hue. If no, we need that in writing, because the current palette does not survive mono.
7. **The graphic date range (§1.13):** is it a decorative typeface — then send the font file — or
   drawn artwork? If drawn, they need to accept that the dates stop following the data and say what
   the brochure shows when artwork for a period does not exist.
8. Agreement that sign-off is on the **exported PDF/JPG**, not the browser preview — and, if mono
   printing is in scope, on a mono print of it.

## 4. Note on this branch

This worktree sits on `claude/brochure-styling-requirements-65c50f`, based on a March-2025 commit
that predates `src/app/brochure/**`. Real restyle work branches off `prod`.
