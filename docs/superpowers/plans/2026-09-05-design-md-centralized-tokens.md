# DESIGN.md Centralized Tokens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin pab1s.github.io to DESIGN.md Baseten style with manual `tokens.css` mirror, zero hex outside tokens.

**Architecture:** `DESIGN.md` stays human source at repo root. New `src/styles/tokens.css` holds all 22 colors + type + spacing + radius for light + Baseten-style dark. `global.css` imports tokens and owns base only. Every `.astro` uses `var(--…)`.

**Tech Stack:** Astro 5, plain CSS vars, Space Grotesk via Google Fonts, Pagefind, no new deps.

---

### Task 1: Track DESIGN.md + ignore brainstorm scratch

**Files:**
- Modify: `.gitignore`
- Test: `git status --short`

- [ ] **Step 1: Write the failing check**

```bash
test -f DESIGN.md && git check-ignore -v .superpowers/brainstorm/1534960-1788621676/content || echo "FAIL: .superpowers not ignored"
```

- [ ] **Step 2: Run check to verify it fails**

Run: `test -f DESIGN.md && git check-ignore -v .superpowers/brainstorm/1534960-1788621676/content || echo "FAIL: .superpowers not ignored"`
Expected: `FAIL: .superpowers not ignored`

- [ ] **Step 3: Write minimal implementation**

Append to `.gitignore`:
```
# Brainstorm visual companion scratch
.superpowers/
```

Stage docs source:
```bash
git add DESIGN.md .gitignore
```

- [ ] **Step 4: Run check to verify it passes**

Run: `git check-ignore -v .superpowers/brainstorm/1534960-1788621676/content; git status --short | head -n 20`
Expected: `.gitignore:.superpowers/` line printed, `A DESIGN.md` staged.

- [ ] **Step 5: Commit**

```bash
git add DESIGN.md .gitignore
git commit -m "chore: track DESIGN.md source, ignore .superpowers scratch"
```

---

### Task 2: Create tokens.css mirror

**Files:**
- Create: `src/styles/tokens.css`
- Test: `npm run build` still passes (tokens unused yet)

- [ ] **Step 1: Write the failing test**

```bash
test -f src/styles/tokens.css || echo "FAIL: tokens.css missing"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `test -f src/styles/tokens.css || echo "FAIL: tokens.css missing"`
Expected: `FAIL: tokens.css missing`

- [ ] **Step 3: Write minimal implementation**

Create `src/styles/tokens.css` with exact content:
```css
/* Mirror of DESIGN.md YAML frontmatter. Edit DESIGN.md first, then copy here. */
:root {
  color-scheme: light;
  --canvas: #ffffff;
  --ink: #000000;
  --near-black: #0e0e0e;
  --ink-deep: #111827;
  --body: #374151;
  --slate: #425366;
  --slate-muted: #5f758e;
  --steel: #8999ac;
  --muted: #6b7280;
  --muted-soft: #9ca3af;
  --olive-muted: #676e64;
  --neutral-300: #cccccc;
  --neutral-400: #b3b3b3;
  --hairline: #e5e7eb;
  --hairline-strong: #e6e6e6;
  --border-soft: #d1d5db;
  --surface-mint: #f5f8f4;
  --surface-soft: #f7f8f9;
  --on-primary: #ffffff;
  --primary: #000000;
  --brand-green: #19e76e;
  --brand-green-deep: #00b86b;
  --line: var(--hairline);
  --line-strong: var(--hairline-strong);
  --font-display: 'Space Grotesk', Inter, system-ui, sans-serif;
  --font-body: 'Space Grotesk', Inter, system-ui, sans-serif;
  --font-mono: 'IBM Plex Mono', Menlo, monospace;
  --font-sans: ui-sans-serif, system-ui, sans-serif;
  --display-xl: 88px;
  --display-lg: 64px;
  --r-none: 0px;
  --r-pill: 9999px;
  --r-full: 9999px;
  --sp-xxs: 4px;
  --sp-hairline-pad: 7px;
  --sp-xs: 8px;
  --sp-sm: 12px;
  --sp-sm-plus: 14px;
  --sp-md: 16px;
  --sp-md-plus: 20px;
  --sp-lg: 24px;
  --sp-lg-plus: 28px;
  --sp-xl: 32px;
  --sp-xxl: 40px;
  --sp-xxxl: 48px;
  --sp-section: 56px;
  --sp-section-lg: 64px;
}
html[data-theme="dark"] {
  color-scheme: dark;
  --canvas: #0e0e0e;
  --ink: #ffffff;
  --body: #d1d5db;
  --slate: #9ca3af;
  --slate-muted: #9ca3af;
  --steel: #6b7280;
  --muted: #9ca3af;
  --muted-soft: #6b7280;
  --hairline: rgba(255, 255, 255, 0.14);
  --hairline-strong: rgba(255, 255, 255, 0.22);
  --border-soft: rgba(255, 255, 255, 0.22);
  --surface-mint: #131a15;
  --surface-soft: #161616;
  --line: var(--hairline);
  --line-strong: var(--hairline-strong);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `test -f src/styles/tokens.css && grep -c "brand-green" src/styles/tokens.css`
Expected: file exists, count `2` (lines `--brand-green` + `--brand-green-deep`).

- [ ] **Step 5: Commit**

```bash
git add src/styles/tokens.css
git commit -m "feat: add tokens.css mirror of DESIGN.md (light + Baseten dark)"
```

---

### Task 3: Refactor global.css to tokens

**Files:**
- Modify: `src/styles/global.css:1-60`
- Test: `grep -r "#3553ff\|#fafaf5\|Chakra\|Source Serif\|VT323\|box-shadow.*var" src/styles/global.css || echo CLEAN`

- [ ] **Step 1: Write the failing test**

```bash
grep -E "#3553ff|Chakra Petch|Source Serif|VT323|--shadow-|--glow" src/styles/global.css && echo "FAIL: legacy tokens remain" || echo CLEAN
```

- [ ] **Step 2: Run test to verify it fails**

Run: `grep -E "#3553ff|Chakra Petch|Source Serif|VT323|--shadow-|--glow" src/styles/global.css && echo "FAIL: legacy tokens remain" || echo CLEAN`
Expected: `FAIL: legacy tokens remain` with matches on lines 6,11,18-21,29-34.

- [ ] **Step 3: Write minimal implementation**

Replace lines 1-60 of `src/styles/global.css` with:
```css
@import url('./tokens.css');
@import url('./animations.css');
:root {
  --canvas-elevated: var(--surface-soft);
  --ink-muted: var(--muted);
  --ink-subtle: var(--hairline);
  --accent: var(--brand-green);
  --accent-hot: var(--brand-green-deep);
  --accent-soft: var(--surface-mint);
  --accent-tint-strong: var(--brand-green);
  --paper-dot: transparent;
  --space-1: var(--sp-xxs);
  --space-2: var(--sp-xs);
  --space-3: var(--sp-sm);
  --space-4: var(--sp-md);
  --space-6: var(--sp-lg);
  --space-8: var(--sp-xl);
  --space-12: var(--sp-xxxl);
  --space-16: var(--sp-xxl);
  --space-24: var(--sp-section-lg);
  --space-32: var(--sp-section-lg);
  --container: 1280px;
  --gutter: 24px;
  --radius-sm: var(--r-none);
  --radius-md: var(--r-none);
  --shadow-sm: none;
  --shadow-md: none;
  --shadow-lg: none;
  --shadow-hard: none;
  --shadow-color: transparent;
  --glow: none;
  --glow-text: none;
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-fast: 150ms;
  --duration-base: 250ms;
  --duration-slow: 400ms;
}
html[data-theme="dark"] {
  --canvas-elevated: var(--surface-soft);
  --ink-muted: var(--muted);
}
```

Delete `.stars` opacity glow block usage by setting `.stars { display: none; }` and `.blueprint-grid { background-image: linear-gradient(to right, var(--hairline) 1px, transparent 1px), linear-gradient(to bottom, var(--hairline) 1px, transparent 1px); opacity: 1; }`. Set `body { background-image: none; font-family: var(--font-body); }`. Set `h1,h2,h3,h4 { font-family: var(--font-display); font-weight: 600; letter-spacing: -0.02em; text-transform: none; }`.

- [ ] **Step 4: Run test to verify it passes**

Run: `grep -E "#3553ff|Chakra Petch|Source Serif|VT323" src/styles/global.css || echo CLEAN; npm run build 2>&1 | tail -n 5`
Expected: `CLEAN`, build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css
git commit -m "refactor: global.css uses tokens.css, Space Grotesk, flat hairlines"
```

---

### Task 4: BaseLayout fonts + chrome cleanup

**Files:**
- Modify: `src/layouts/BaseLayout.astro:40-84,112-116`
- Test: `npm run build`

- [ ] **Step 1: Write the failing test**

```bash
grep -E "Chakra|Source Serif|VT323|fafaf5|0a0d1a" src/layouts/BaseLayout.astro && echo "FAIL: legacy fonts/colors" || echo CLEAN
```

- [ ] **Step 2: Run test to verify it fails**

Run: `grep -E "Chakra|Source Serif|VT323|fafaf5|0a0d1a" src/layouts/BaseLayout.astro && echo "FAIL: legacy fonts/colors" || echo CLEAN`
Expected: `FAIL` with matches on theme-color meta and Google Fonts URL.

- [ ] **Step 3: Write minimal implementation**

In `src/layouts/BaseLayout.astro`: change `<meta name="theme-color" content="#fafaf5" />` to `<meta name="theme-color" content="#ffffff" />`. Change inline theme script defaults `#0a0d1a`/`#fafaf5` to `#0e0e0e`/`#ffffff`. Replace Google Fonts href with `https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=IBM+Plex+Mono:wght@400;500&display=optional`. Remove `<div class="stars">` and `<div class="blueprint-grid">` lines 114-115, or leave divs but they are `display:none` via CSS. Keep `NoiseOverlay` import for now (deleted in Task 8).

- [ ] **Step 4: Run test to verify it passes**

Run: `grep -E "Chakra|Source Serif|VT323|fafaf5|0a0d1a" src/layouts/BaseLayout.astro || echo CLEAN; npm run build 2>&1 | tail -n 5`
Expected: `CLEAN`, build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "refactor: Space Grotesk fonts, white/green theme-color"
```

---

### Task 5: Announcement bar + nav + buttons

**Files:**
- Modify: `src/components/WorkshopNav.astro:151-374`
- Modify: `src/components/ThemeCycleButton.astro`
- Modify: `src/components/SiteFooter.astro:77-173`
- Test: `grep -E "var\(--accent\)|font-pixel|glow" src/components/WorkshopNav.astro || echo CLEAN`

- [ ] **Step 1: Write the failing test**

```bash
grep -E "font-pixel|--accent|glow" src/components/WorkshopNav.astro && echo "FAIL: nav not Baseten" || echo CLEAN
```

- [ ] **Step 2: Run test to verify it fails**

Run: `grep -E "font-pixel|--accent|glow" src/components/WorkshopNav.astro && echo "FAIL: nav not Baseten" || echo CLEAN`
Expected: `FAIL` with matches on `.workshop-nav-mark`, `.workshop-nav-name`, links.

- [ ] **Step 3: Write minimal implementation**

In `WorkshopNav.astro` `<style>`: `.workshop-nav { background: var(--canvas); border-bottom: 1px solid var(--hairline); }` `.workshop-nav-mark { background: var(--brand-green); box-shadow: none; }` `.workshop-nav-name { font-family: var(--font-display); font-weight: 600; letter-spacing: -0.02em; text-shadow: none; }` `.workshop-nav-link { font-family: var(--font-sans); font-size: 16px; color: var(--ink); }` `.workshop-nav-link:hover, .workshop-nav-link[aria-current="page"] { color: var(--ink); background: var(--brand-green); text-decoration: none; }` `.workshop-nav-panel { box-shadow: none; border-bottom: 1px solid var(--hairline); }` Remove all `html[data-theme="dark"] … glow` rules. Prepend announcement bar markup after `<header>`: `<div class="announcement-bar">Currently engineering ML at Santander — <a href="/projects/">see experiments</a></div>` with CSS `.announcement-bar { background: var(--brand-green); color: var(--ink); font-family: var(--font-sans); font-size: 16px; padding: 16px; text-align: center; border-radius: var(--r-none); }`.

In `ThemeCycleButton.astro`: replace border/background with `border: 1px solid var(--border-soft); background: var(--canvas); color: var(--ink); border-radius: var(--r-none);` active state `background: var(--ink); color: var(--on-primary);`.

In `SiteFooter.astro`: `.site-footer-mark { background: var(--brand-green); box-shadow: none; }` `.site-footer-name { font-family: var(--font-display); }` links hover `background: var(--brand-green); color: var(--ink);`.

- [ ] **Step 4: Run test to verify it passes**

Run: `grep -E "font-pixel|glow" src/components/WorkshopNav.astro src/components/SiteFooter.astro || echo CLEAN; npm run build 2>&1 | tail -n 5`
Expected: `CLEAN`, build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/components/WorkshopNav.astro src/components/ThemeCycleButton.astro src/components/SiteFooter.astro
git commit -m "feat: Baseten nav, announcement bar, square buttons"
```

---

### Task 6: Hero + isometric diagram (replace torus)

**Files:**
- Create: `src/components/IsometricDiagram.astro`
- Modify: `src/components/HeroSection.astro`
- Delete: `src/components/TopologicalViz.astro`
- Test: `npm run build`

- [ ] **Step 1: Write the failing test**

```bash
test -f src/components/IsometricDiagram.astro || echo "FAIL: diagram missing"; grep -q "TopologicalViz" src/components/HeroSection.astro && echo "FAIL: torus still wired" || echo CLEAN
```

- [ ] **Step 2: Run test to verify it fails**

Run: `test -f src/components/IsometricDiagram.astro || echo "FAIL: diagram missing"; grep -q "TopologicalViz" src/components/HeroSection.astro && echo "FAIL: torus still wired" || echo CLEAN`
Expected: both `FAIL` lines.

- [ ] **Step 3: Write minimal implementation**

Create `src/components/IsometricDiagram.astro`:
```astro
---
---
<svg viewBox="0 0 400 300" role="img" aria-label="Isometric inference stack diagram" class="iso-diagram">
  <g class="iso-ink" fill="none" stroke-width="1.5">
    <rect x="60" y="120" width="120" height="80" />
    <rect x="100" y="90" width="120" height="80" />
    <rect x="140" y="60" width="120" height="80" />
    <line x1="60" y1="120" x2="100" y2="90" />
    <line x1="180" y1="120" x2="220" y2="90" />
  </g>
  <g class="iso-green" fill="none" stroke-width="2">
    <rect x="100" y="90" width="120" height="80" />
    <rect x="140" y="60" width="120" height="80" />
    <line x1="140" y1="140" x2="260" y2="140" />
  </g>
  <g class="iso-label" font-family="IBM Plex Mono, monospace" font-size="11">
    <text x="60" y="220">inference</text>
    <text x="180" y="220">scale</text>
  </g>
</svg>
<style>
  .iso-diagram { width: 100%; height: auto; background: var(--canvas); border: 1px solid var(--hairline); }
  .iso-ink { stroke: var(--ink); }
  .iso-green { stroke: var(--brand-green); }
  .iso-label { fill: var(--slate); }
</style>
```

In `HeroSection.astro`: replace `import TopologicalViz` with `import IsometricDiagram from "./IsometricDiagram.astro";` replace `<TopologicalViz />` with `<IsometricDiagram />`. Update styles: `.hero-title { font-family: var(--font-display); font-size: 88px; font-weight: 600; line-height: 0.909; letter-spacing: -1.76px; }` `.hero-subtitle { font-family: var(--font-sans); font-size: 16px; color: var(--ink); }` `.hero-desc { font-family: var(--font-display); font-size: 24px; font-weight: 400; line-height: 1.333; color: var(--ink); }` `.hero-avatar { border: 1px solid var(--hairline); border-radius: var(--r-none); box-shadow: none; }` `.hero-avatar-caption { color: var(--ink); border-radius: var(--r-none); }` `.hero-section { background: var(--canvas); border: 1px solid var(--hairline); padding: 64px; }` Add highlight: wrap one hero word in `<mark class="highlight-marker">` with `.highlight-marker { background: var(--brand-green); color: var(--ink); }`.

Delete file `src/components/TopologicalViz.astro` via `git rm`.

- [ ] **Step 4: Run test to verify it passes**

Run: `test -f src/components/IsometricDiagram.astro && ! grep -q "TopologicalViz" src/components/HeroSection.astro && echo CLEAN; npm run build 2>&1 | tail -n 5`
Expected: `CLEAN`, build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/components/IsometricDiagram.astro src/components/HeroSection.astro
git rm src/components/TopologicalViz.astro
git commit -m "feat: Baseten hero-band with isometric diagram, drop torus"
```

---

### Task 7: Cards, grids, lists

**Files:**
- Modify: `src/components/ProjectCard.astro`, `src/components/SpotlightCard.astro`, `src/components/BlogPostRow.astro`, `src/components/SocialIconRow.astro`, `src/components/HomeStatusLine.astro`
- Modify: `src/pages/index.astro`, `src/pages/projects/index.astro`, `src/pages/blog/index.astro`
- Test: `npm run build`

- [ ] **Step 1: Write the failing test**

```bash
grep -E "spotlight|glow|radius-md|shadow" src/components/ProjectCard.astro src/components/SpotlightCard.astro | head -n 5 && echo "FAIL: cards not flat" || echo CLEAN
```

- [ ] **Step 2: Run test to verify it fails**

Run: `grep -E "spotlight|glow|radius-md|shadow" src/components/ProjectCard.astro src/components/SpotlightCard.astro | head -n 5 && echo "FAIL: cards not flat" || echo CLEAN`
Expected: `FAIL` with shadow/border matches.

- [ ] **Step 3: Write minimal implementation**

`ProjectCard.astro`, `SpotlightCard.astro`, `BlogPostRow.astro`: set `background: var(--canvas); border: 1px solid var(--hairline); border-radius: var(--r-none); box-shadow: none;` Title `font-family: var(--font-display); font-size: 24px; font-weight: 600;` Body `font-size: 24px; font-weight: 400;` on cards, `16px sans` on rows. Tags/chips: `background: var(--surface-soft); border-radius: var(--r-pill); padding: 7px 12px; font-family: var(--font-sans); font-size: 16px; color: var(--ink); border: none;`. Links hover: `background: var(--brand-green); color: var(--ink);`. Remove spotlight JS glow handlers (keep static).

`SocialIconRow.astro`, `HomeStatusLine.astro`: replace accent fills with `var(--ink)`, active dot `var(--brand-green)`, remove `box-shadow` pulse.

`src/pages/index.astro`: `.index-section { border-top: 1px solid var(--hairline); }` `.index-tile { background: var(--canvas); border: 1px solid var(--hairline); border-radius: var(--r-none); box-shadow: none; }` `.index-tile:hover { border-color: var(--ink); box-shadow: none; transform: none; }` `.index-section-link, .index-note-tag, .index-tile-cta { color: var(--ink); font-family: var(--font-sans); }` hover gives `background: var(--brand-green);`. `src/pages/projects/index.astro` + `src/pages/blog/index.astro`: same flat cells, pill tags, hairline dividers. Keep all existing `@media (max-width: …)` collapse rules (hero 2-col→1-col, 3-up→1-up, 640px single-col); only recolor values inside them, never delete breakpoints.

- [ ] **Step 4: Run test to verify it passes**

Run: `grep -E "box-shadow: var|glow" src/components/ProjectCard.astro src/components/SpotlightCard.astro src/components/BlogPostRow.astro || echo CLEAN; npm run build 2>&1 | tail -n 5`
Expected: `CLEAN`, build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/components/ProjectCard.astro src/components/SpotlightCard.astro src/components/BlogPostRow.astro src/components/SocialIconRow.astro src/components/HomeStatusLine.astro src/pages/index.astro src/pages/projects/index.astro src/pages/blog/index.astro
git commit -m "refactor: flat feature-blocks, pill tags, hairline grids"
```

---

### Task 8: Prose pages + deletions + final verification

**Files:**
- Modify: `src/pages/blog/[slug]/index.astro`, `src/pages/resume/index.astro`, `src/pages/search/index.astro`, `src/pages/404.astro`, `src/components/ResumeContent.astro`, `src/styles/animations.css`
- Delete: `src/components/NoiseOverlay.astro`, `src/components/AchievementSystem.astro`, `src/components/ToastNotification.astro`, `src/components/ScrollProgress.astro`
- Modify: `src/layouts/BaseLayout.astro` (remove deleted imports)
- Test: full grep + build

- [ ] **Step 1: Write the failing test**

```bash
grep -rE "#3553ff|#fafaf5|Chakra|Source Serif|VT323|box-shadow: [0-9]|glow" src/components src/pages src/layouts src/styles --include="*.astro" --include="*.css" | grep -v "tokens.css" | grep -v "DESIGN.md" | head -n 10 && echo "FAIL: legacy remains" || echo CLEAN
```

- [ ] **Step 2: Run test to verify it fails**

Run: `grep -rE "#3553ff|#fafaf5|Chakra|Source Serif|VT323|box-shadow: [0-9]|glow" src/components src/pages src/layouts src/styles --include="*.astro" --include="*.css" | grep -v "tokens.css" | grep -v "DESIGN.md" | head -n 10 && echo "FAIL: legacy remains" || echo CLEAN`
Expected: `FAIL` with ~10 matches in prose/resume/search/404/animations.

- [ ] **Step 3: Write minimal implementation**

Prose (`blog/[slug]`, `resume`, `ResumeContent`): `h2 { font-family: var(--font-display); font-size: 64px; font-weight: 600; letter-spacing: -1.92px; color: var(--ink); }` `p, li { font-family: var(--font-display); font-size: 24px; line-height: 1.333; }` `a { color: var(--ink); text-decoration-color: var(--brand-green); text-decoration-thickness: 3px; }` `blockquote { border-left: 3px solid var(--brand-green); }` `code { background: var(--surface-mint); border: 1px solid var(--hairline); color: var(--ink); }` `hr { border-top: 1px solid var(--hairline); }` Tables: `th { background: var(--surface-soft); color: var(--ink); font-family: var(--font-sans); }` `td, th { border: 1px solid var(--hairline); }`.

`search/index.astro`, `404.astro`: inputs/buttons square `border: 1px solid var(--border-soft); border-radius: var(--r-none);` primary button `background: var(--primary); color: var(--on-primary); padding: 7px 12px;` secondary `background: var(--canvas); color: var(--ink);`.

`animations.css`: delete all `glow`, `pulse`, `float` keyframes using `box-shadow`. Keep `fade-in` opacity only.

Delete via `git rm src/components/NoiseOverlay.astro src/components/AchievementSystem.astro src/components/ToastNotification.astro src/components/ScrollProgress.astro`. In `BaseLayout.astro` remove those imports + `<NoiseOverlay />`, `<AchievementSystem />`, `<ToastNotification />` tags. Add `<div class="scroll-progress"></div>` replacement CSS `.scroll-progress { height: 2px; background: var(--brand-green); }` if scroll bar wanted, or omit.

- [ ] **Step 4: Run test to verify it passes**

Run: `grep -rE "#3553ff|#fafaf5|Chakra|Source Serif|VT323|box-shadow: [0-9]|glow" src/components src/pages src/layouts src/styles --include="*.astro" --include="*.css" | grep -v "tokens.css" | head -n 10 || echo CLEAN; npm run build 2>&1 | tail -n 8`
Expected: `CLEAN`, `astro build` + `pagefind` succeed, `dist/` written.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: Baseten prose, square forms, drop overlays/toasts/progress glow"
```

---

## File map

- Created: `src/styles/tokens.css`, `src/components/IsometricDiagram.astro`
- Modified: `.gitignore`, `src/styles/global.css`, `src/styles/animations.css`, `src/layouts/BaseLayout.astro`, `src/components/WorkshopNav.astro`, `src/components/ThemeCycleButton.astro`, `src/components/HeroSection.astro`, `src/components/SiteFooter.astro`, `src/components/ProjectCard.astro`, `src/components/SpotlightCard.astro`, `src/components/BlogPostRow.astro`, `src/components/SocialIconRow.astro`, `src/components/HomeStatusLine.astro`, `src/components/ResumeContent.astro`, `src/pages/index.astro`, `src/pages/blog/index.astro`, `src/pages/blog/[slug]/index.astro`, `src/pages/projects/index.astro`, `src/pages/search/index.astro`, `src/pages/404.astro`, `DESIGN.md` (`src/pages/resume/index.astro` wrapper intentionally untouched — work done in `ResumeContent`)
- Deleted: `src/components/TopologicalViz.astro`, `src/components/NoiseOverlay.astro`, `src/components/AchievementSystem.astro`, `src/components/ToastNotification.astro`, `src/components/ScrollProgress.astro`
