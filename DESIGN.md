---
version: beta
name: pab1s-personal-blog
description: "A plain, text-first personal blog in the Hacker News / Bay Area essay tradition: narrow reading measure, Newsreader serif for everything readable, IBM Plex Mono for all UI chrome, black-on-white with one electric green (#19e76e) used sparingly for highlights and link underlines. Solid hairline rules divide essay lists; a subtle dotted grid sits behind the page. No shadows, no hero art, no marketing chrome — name, bio, essay rows, footer."

colors:
  primary: "#000000"
  ink: "#000000"
  near-black: "#0e0e0e"
  ink-deep: "#111827"
  body: "#374151"
  slate: "#425366"
  slate-muted: "#5f758e"
  steel: "#8999ac"
  muted: "#6b7280"
  muted-soft: "#9ca3af"
  olive-muted: "#676e64"
  neutral-300: "#cccccc"
  neutral-400: "#b3b3b3"
  hairline: "#e5e7eb"
  hairline-strong: "#e6e6e6"
  border-soft: "#d1d5db"
  canvas: "#ffffff"
  surface-mint: "#f5f8f4"
  surface-soft: "#f7f8f9"
  on-primary: "#ffffff"
  brand-green: "#19e76e"
  brand-green-deep: "#00b86b"
  paper-dot: "rgba(0, 0, 0, 0.12)"

typography:
  hero:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: clamp(1.75rem, 4vw, 2.25rem)
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  section-head:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: clamp(1.35rem, 3vw, 1.75rem)
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: 1.05rem
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  meta:
    fontFamily: "'IBM Plex Mono', Menlo, monospace"
    fontSize: 0.8rem
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"

rounded:
  none: 0px
  pill: 9999px
  full: 9999px

spacing:
  xxs: 4px
  hairline-pad: 7px
  xs: 8px
  sm: 12px
  sm-plus: 14px
  md: 16px
  md-plus: 20px
  lg: 24px
  lg-plus: 28px
  xl: 32px
  xxl: 40px
  xxxl: 48px
  section: 56px
  section-lg: 64px
  measure: 760px
  dot-grid: 16px

components:
  top-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.meta}"
    rounded: "{rounded.none}"
    padding: 16px 24px
  nav-link:
    backgroundColor: transparent
    textColor: "{colors.muted}"
    typography: "{typography.meta}"
  theme-toggle:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: 0px
  hero-plain:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.hero}"
    rounded: "{rounded.none}"
    padding: 32px 0px 24px
  essay-row:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: 14px 4px
  section-head:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.section-head}"
    rounded: "{rounded.none}"
    padding: 0px
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.meta}"
    rounded: "{rounded.none}"
    padding: 7px 12px
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.meta}"
    rounded: "{rounded.none}"
    padding: 7px 12px
  feature-block:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: 24px
  highlight-marker:
    backgroundColor: "{colors.brand-green}"
    textColor: "{colors.near-black}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
  badge-pill:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.meta}"
    rounded: "{rounded.pill}"
    padding: 7px 12px
  prose-block:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: 0px
  site-footer:
    backgroundColor: transparent
    textColor: "{colors.muted}"
    typography: "{typography.meta}"
    rounded: "{rounded.none}"
    padding: 24px 0px
---

## Overview

A personal blog page in the plain essay tradition: one narrow reading column (`{spacing.measure}` — 760px), serif reading text, mono interface chrome, black-on-white with a single electric green (`{colors.brand-green}` — #19e76e) used sparingly. The landing is a name, a tagline, two sentences of bio, social links, then dated essay rows — no avatar, no hero art, no announcement bar, no status ticker, no lab-code kickers (`SEC_01`, `DOC_001` and friends are gone).

Solid hairline rules (`{colors.hairline}` — #e5e7eb) divide sections and list rows; the page sits on a subtle dotted grid (`{colors.paper-dot}` at `{spacing.dot-grid}` — 16px). There are no shadows anywhere and square corners everywhere except pill tags. Dark mode keeps the same contract on near-black (`{colors.near-black}` — #0e0e0e) with white ink and the same green.

**Key Characteristics:**
- Two typefaces only: Newsreader serif for everything readable (headings, body, hero), IBM Plex Mono for all chrome (nav, tags, dates, labels, code, buttons).
- Compact reading sizes: hero ~2rem, section heads ~1.5rem, body 1.05rem/1.6 — built for reading, not presenting.
- Essay rows (`{component.essay-row}`): serif title + dotted leader + mono tag, underline-on-hover. No cards on the landing.
- Green is scarce: one hero highlight, link underlines, code accents. Never a surface, never a bar.
- Dotted-grid page background, solid hairline dividers, zero shadows, zero gradients on chrome.

## Colors

### Brand & Accent
- **Brand Green** (`{colors.brand-green}` — #19e76e): hero highlight marker, link underline color, minor accents. Same value in dark mode.
- **Brand Green Deep** (`{colors.brand-green-deep}` — #00b86b): reserved for small accent moments needing contrast against the brighter green.

### Surface
- **Canvas** (`{colors.canvas}` — #ffffff): page floor. Dark: `{colors.near-black}` (#0e0e0e).
- **Surface Mint** (`{colors.surface-mint}` — #f5f8f4): code backgrounds and soft fills. Dark: #131a15.
- **Surface Soft** (`{colors.surface-soft}` — #f7f8f9): pill/tag fills. Dark: #161616.
- **Paper Dot** (`{colors.paper-dot}` — rgba(0,0,0,0.12)): dotted-grid background dots. Dark: rgba(255,255,255,0.12).

### Text
- **Ink / Primary** (`{colors.ink}` — #000000): headlines, body, primary text. Dark: #ffffff.
- **Muted** (`{colors.muted}` — #6b7280): nav links, dates, tags, footer, secondary text.
- Remaining slate/steel/neutral tones (`{colors.slate}`, `{colors.steel}`, `{colors.neutral-300}`…) are inherited tokens, used sparingly for borders and tertiary text.

### Neutral / Hairline
- **Hairline** (`{colors.hairline}` — #e5e7eb): every divider and list rule. Always `1px solid` — never dashed, never dotted.
- **Border Soft** (`{colors.border-soft}` — #d1d5db): input and secondary-button borders.

## Typography

### Font Families
Two families, no exceptions: **Newsreader** (open Plantin/Caslon-style serif with optical sizing; the stand-in for the licensed Plantin that inspired this direction) for display + body, **IBM Plex Mono** for nav, tags, dates, labels, code, and buttons. There is no third family and no system-sans role.

### Hierarchy

| Token | Size | Weight | Line Height | Use |
|---|---|---|---|---|
| `{typography.hero}` | clamp(1.75rem, 4vw, 2.25rem) | 600 | 1.1 | Landing name |
| `{typography.section-head}` | clamp(1.35rem, 3vw, 1.75rem) | 600 | 1.1 | Section titles, post titles in lists |
| `{typography.body}` | 1.05rem | 400 | 1.6 | Hero bio, paragraphs, list titles, running text |
| `{typography.meta}` | 0.8rem | 400 | 1.5 | Nav, tags, dates, table heads, buttons, footer |

### Principles
Hierarchy comes from size and weight inside one serif, never from mixing faces. Body stays near 1rem — this is a reading site, not a deck. Mono chrome stays small (≤0.8rem) and quiet. Sentence case everywhere; no uppercase display type, no letter-spacing games on headings.

## Layout

### Spacing System
Same 4px-base scale as before (`{spacing.xxs}` 4px … `{spacing.section-lg}` 64px), plus `{spacing.measure}` 760px (the single content column) and `{spacing.dot-grid}` 16px (background dot pitch).

### Grid & Container
- **One column** (`{spacing.measure}` — 760px, centered): landing, notes, posts, projects, resume, search, 404. The projects filter grid is the only multi-column element and it collapses to one column inside the measure.
- **Landing order:** plain hero (name → tagline → bio → socials) → experiments list → notes list → dossier/search list → footer. No sidebars, no hero art, no ticker.
- **Dividers, not boxes:** sections separated by `1px solid {colors.hairline}` rules; list rows separated the same way. Cards appear only on the projects page, flat with hairline borders.

### Whitespace Philosophy
Tight and even: sections breathe through list padding (14px rows) and 2–3rem section gaps, not through large panels. The dotted background gives texture so the whitespace doesn't feel empty.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Flat | No shadow, no border | Hero, headings, body |
| Hairline rule | 1px solid `{colors.hairline}` | Section and row dividers |
| Dotted field | `{colors.paper-dot}` 16px grid | Page background |
| Tint surface | `{colors.surface-mint}` / `{colors.surface-soft}` fill, no shadow | Code, pills |

Zero shadows, zero gradients on chrome. (The one `repeating-linear-gradient` in the codebase is the tiny ascii-rule accent, not elevation.)

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.none}` | 0px | Everything structural: buttons, inputs, cards, avatar, rules |
| `{rounded.pill}` | 9999px | Tag pills and filter buttons only |

Square by default; pills only for small tags. Borders are always solid — dashed and dotted border styles are out (dotted leaders inside essay rows are textspans, not borders).

### Background Geometry
Page background is a dotted grid (radial dots, 16px pitch) over canvas. No cover art, no diagrams on the landing.

## Components

### Bars & Navigation

**`top-nav`** — Slim fixed bar: wordmark left, mono links right, square theme toggle. Canvas background, hairline bottom rule. No announcement bar — there is no announcement bar in this system.

**`nav-link`** — Mono, muted; hover/active is a green underline, never a filled block.

**`theme-toggle`** — 2rem square, hairline border, sun/moon glyph in currentColor. Active state is ink background with canvas glyph (never white-on-white).

### Buttons

**`button-primary`** — Black square, white mono label, 7px × 12px. **`button-secondary`** — Canvas square with `border-soft` border. Used for search/load-more and 404 wayfinding only; the landing has no CTA buttons.

### Lists & Content

**`hero-plain`** — Name (`{typography.hero}`), mono tagline, two-sentence serif bio with one green `{component.highlight-marker}`, social links. No avatar, no art, no meta row.

**`essay-row`** — Serif title + dotted leader + mono tag/date. Hover underlines the title in green. Used for experiments, notes, and dossier/search links alike.

**`section-head`** — Serif section title + plain “All →” link with green-underline hover.

**`prose-block`** — Post body: Newsreader 1.05rem/1.65, serif h2 at section-head size, green 3px link underlines, mint code, hairline tables and rules.

**`highlight-marker`** — Inline green background, near-black text, 0 4px padding. One per hero, occasionally in headings. The only inline green fill allowed.

**`badge-pill`** — Mono pill for tags and filters. The only rounded element.

**`site-footer`** — One hairline-top row: wordmark + tagline left, socials + status right, all mono muted.

## Do's and Don'ts

### Do
- Keep two typefaces: Newsreader for reading, IBM Plex Mono for chrome.
- Keep the measure at 760px and the dotted 16px background.
- Keep borders `1px solid` hairline; keep corners square except pills.
- Keep green scarce: highlight, underlines, tiny accents.
- Write headings in sentence case.
- Add new pages as essay lists first; reach for cards only when filtering demands it.

### Don't
- Don't reintroduce a third typeface, an announcement bar, hero art, avatars-as-chrome, or lab-code kickers.
- Don't use dashed/dotted border styles, shadows, or gradients on chrome.
- Don't paint green surfaces or add a second accent color.
- Don't widen the measure or blow body type back up to deck sizes.
- Don't set display type without the serif — grotesks are out of this system.

## Responsive Behavior

| Name | Width | Key Changes |
|---|---|---|
| Mobile | < 640px | Single column (already single); tags hide in rows; hero tightens; nav collapses to menu button |
| Tablet | 640–900px | Measure holds; projects filter wraps |
| Desktop | > 900px | 760px centered column; nothing stretches |

Touch targets keep 44px minimum on nav/menu/buttons. Rows collapse by hiding the tag, never by shrinking type.

## Iteration Guide

1. New surfaces start flat with a hairline rule, not a box.
2. New text starts as `{typography.body}` or `{typography.meta}` — no new sizes without a reading reason.
3. Green needs a reason: highlight, underline, or status. Otherwise ink or muted.
4. One component, one purpose; lists over grids; rows over cards.
5. Keep `DESIGN.md` and `tokens.css` in sync by hand — same names, same values, committed together.

## Known Gaps

- Departure Mono (the mono that inspired the chrome role alongside Plantin) has no verified free CDN package, so the mono role stays IBM Plex Mono.
- `IsometricDiagram.astro` and `HomeStatusLine.astro` still exist unwired; delete them once the no-art, no-ticker direction is confirmed.
- `ProjectCard`/`SpotlightCard` pills and the projects filter grid predate the essay-list direction; the landing no longer uses them.
- Print styles still assume shadows-free flat output; dotted background is suppressed in print via white background override.
- `tokens.css` keeps `display-xl/lg` and spacing aliases from the previous system for compat; new code should use the compact hero/section-head/body/meta tokens.
