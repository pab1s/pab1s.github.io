# Design: DESIGN.md Centralized Tokens + Baseten Full Reskin

Date: 2026-09-05
Branch: `feature/design-md-centralized-tokens` (off `origin/main` @ `28d97b2`)
Approach: 2 — Pure manual mirror, single PR (no generator, no check script)
Source: `DESIGN.md` (Baseten-design-analysis, version alpha, untracked at spec time)

## Decisions

- Dark mode: C — keep, Baseten-style. Light = DESIGN.md values. Dark = near-black `#0e0e0e` canvas, white ink, same green `#19e76e`, hairlines `rgba(255,255,255,0.14)`, surfaces `#131a15` / `#161616`. No glow.
- Tokens: B — manual mirror. `DESIGN.md` frontmatter is human source, `src/styles/tokens.css` is manual copy with 1:1 names. Edit both together. No codegen.
- Scope: A — full reskin. Home, blog list + post, projects, resume, search, 404, nav, footer, all 15 components in `src/components/`.
- Fonts: A — Space Grotesk (600/400) for display/body as NeueAlteGrotesk substitute, system sans for buttons (16px/400), IBM Plex Mono kept only for code/labels. Drop Chakra Petch, Source Serif 4, VT323.
- Effects: A — strict Baseten. Remove `--shadow-*`, `--glow`, `.stars`, `.blueprint-grid`, `NoiseOverlay`, `TopologicalViz` torus, `AchievementSystem`, `ToastNotification`, glow keyframes. Flat + hairlines + mint tints only. Square everything except `badge-pill`.

## 1. Architecture

`DESIGN.md` stays at repo root. New `src/styles/tokens.css`:

- colors (22): `--canvas #ffffff`, `--ink #000000`, `--near-black #0e0e0e`, `--ink-deep #111827`, `--body #374151`, `--slate #425366`, `--slate-muted #5f758e`, `--steel #8999ac`, `--muted #6b7280`, `--muted-soft #9ca3af`, `--olive-muted #676e64`, `--neutral-300 #cccccc`, `--neutral-400 #b3b3b3`, `--hairline #e5e7eb`, `--hairline-strong #e6e6e6`, `--border-soft #d1d5db`, `--surface-mint #f5f8f4`, `--surface-soft #f7f8f9`, `--on-primary #ffffff`, `--brand-green #19e76e`, `--brand-green-deep #00b86b`, `--primary #000000`.
- typography: `--font-display: 'Space Grotesk', Inter, sans-serif`; `--display-xl 88px/600/0.909/-1.76px`; `--display-lg 64px/600/1.094/-1.92px`; `--title 24px/600/1.333/-0.48px`; `--body 24px/400/1.333/-0.48px`; `--button 16px/400/1.5/normal system-sans`.
- spacing: `--sp-xxs 4px`, `--sp-hairline-pad 7px`, `--sp-xs 8px`, `--sp-sm 12px`, `--sp-sm-plus 14px`, `--sp-md 16px`, `--sp-md-plus 20px`, `--sp-lg 24px`, `--sp-lg-plus 28px`, `--sp-xl 32px`, `--sp-xxl 40px`, `--sp-xxxl 48px`, `--sp-section 56px`, `--sp-section-lg 64px`. Button pad `7px 12px`.
- radius: `--r-none 0px`, `--r-pill 9999px`, `--r-full 9999px`.

`global.css` deletes old `:root` (`--accent #3553ff`, `--canvas #fafaf5`, Chakra/Source/VT323, shadows, glow) and `@import ./tokens.css`. Dark overrides live in same file under `html[data-theme="dark"]`. All components/pages use only `var(--…)`. `DESIGN.md` gets mirror comment + token table reference.

Isolation: `tokens.css` has one purpose (values), `global.css` has base/elements, each `.astro` component owns its layout. No component defines colors.

## 2. Components

- `announcement-bar` (new): green fill, ink text, button type, 16px pad. Content = `site-config.currently`.
- `top-nav` + `nav-link`: `WorkshopNav` → canvas bg, hairline bottom, wordmark left, links Lab Notes/Experiments/Resume/Search, right Search + theme toggle as `button-secondary`.
- `button-primary` black square 7×12 / `button-secondary` canvas + `border-soft` / `try-it-link` ink + chevron. Replaces all CTAs.
- `hero-band`: `HeroSection` → 2-col hairline grid, left 88px h1 + 24px body + button row, right new static `src/components/IsometricDiagram.astro` (inline SVG, green `#19e76e` / ink line-art, no animation, no deps). 64px pad. Deletes `TopologicalViz` torus.
- `feature-panel` mint 40px → Featured experiments shell + dossier tiles. `feature-block` white 24px → `ProjectCard`, `SpotlightCard`, `index-tile`, `BlogPostRow`.
- `highlight-marker` green behind 1–3 words in h1/section heads.
- `badge-pill` pill 7×12 `surface-soft` → tags/chips. Only `9999px` allowed.
- Prose: h2 64px + optional highlight, body 24px/1.333, links green underline, `hr` hairline, `blockquote` 3px green bar, `code` mint + hairline.
- Deleted: shadows, glow, stars, blueprint, noise, achievements, toasts. `ScrollProgress` deleted entirely (no replacement bar, per plan Task 8 omit option).

## 3. Data flow

1. Edit `DESIGN.md` frontmatter.
2. Copy to `tokens.css` (same name, comment cites source key).
3. `npm run dev` verify.
4. Commit both together. Rule: zero hex in components, `{token.refs}` everywhere, one component at a time, square default, green scarce (bar/highlight/diagrams only).

## 4. Error handling / Gaps

- Bad md value: no build break (manual) — catch via `grep -r "#[0-9a-fA-F]" src/components src/pages` (must hit only `tokens.css`) + visual review.
- Missing dark var: falls back to light (flash) — spec checklist requires 22×2 coverage.
- Font offline: falls back to Inter/system — still 600/tight, acceptable substitute.
- Diagram pink/blue accents: illustration-only, excluded from tokens.
- Footer/breakpoints unmeasured: footer = hairline top + mono links; breakpoints `<768 / 768–1024 / >1024`, hero 2-col→1-col, 3-up→1-up. Touch targets 44px min (derived).

## 5. Testing

- `npm run build` passes (Astro + Pagefind).
- Grep clean: zero `#hex` outside tokens/DESIGN, zero `box-shadow`, zero `Chakra|Source Serif|VT323|#3553ff|#fafaf5`.
- Light + dark visual: green bar, black squares, 88px hero, hairlines, mint panel, pills only.
- Routes `/`, `/blog/`, `/blog/[slug]/`, `/projects/`, `/resume/`, `/search/`, `/404` render, RSS/sitemap intact. Fonts `display=optional`.
