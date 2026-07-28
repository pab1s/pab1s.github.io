# Design Spec: The Curiosity Workshop — A Data Alchemist's Portfolio

> **Date:** 2026-05-15
> **Status:** Approved
> **Project:** pab1s.github.io

## 1. Overview

Transform the personal portfolio from a "cyber-cosmic terminal" into **"The Curiosity Workshop"** — a warm, personal digital space that reflects the owner's identity as a data alchemist, tinkerer, cook, and space enthusiast. The site should feel like stepping into a well-lit workshop at dusk: a telescope by the window, copper pots on the bench, a notebook open to half-finished equations, and the hum of a running experiment.

**Core metaphor**: Data science is alchemy. Raw data goes in; insight comes out. The portfolio frames every project as a "recipe" — ingredients (stack), process (methods), result (outcome). The orbit visualization becomes the "armillary sphere" — a brass instrument tracking an optimization in progress.

## 2. Visual Identity

### 2.1 Colors

| Role | Dark Mode | Light Mode |
|------|-----------|------------|
| Canvas | `#0C0E12` (deep warm charcoal, workshop at night) | `#F7F5F0` (creamy parchment) |
| Panel/Card | `rgba(255,248,240,0.03)` + `backdrop-filter: blur(12px)` | `#FFFFFF` |
| Ink (body) | `#F0EBE3` (warm cream-white) | `#1C1E22` (warm near-black) |
| Muted | `rgba(200,190,175,0.5)` | `rgba(60,55,50,0.5)` |
| Primary Accent | `#D4A574` (copper/terracotta — tools, brass, warmth) | `#B87333` |
| Secondary Accent | `#8FBC8F` (sage green — fresh ideas, plants) | `#6B8E6B` |
| Tertiary Glow | `#E8DCC4` (warm candlelight gold) | `#C4A882` |
| Line/Border | `rgba(212,165,116,0.15)` | `rgba(184,115,51,0.2)` |
| Code BG | `rgba(212,165,116,0.06)` | `rgba(184,115,51,0.06)` |
| Link Underline | `rgba(212,165,116,0.35)` | `rgba(184,115,51,0.35)` |
| Link Hover | `#F5CBA7` | `#8B4513` |
| Frame Dash | `rgba(212,165,116,0.18)` | `rgba(184,115,51,0.2)` |
| Table TH BG | `rgba(212,165,116,0.08)` | `rgba(184,115,51,0.08)` |
| Project Banner BG | `rgba(212,165,116,0.05)` | `rgba(184,115,51,0.07)` |
| Stars Opacity | `0.18` | `0` |

**Gradients:**
- Hero glow: `radial-gradient(ellipse 120% 90% at 50% -10%, rgba(212,165,116,0.10), transparent 55%)`
- Side glow: `radial-gradient(ellipse 90% 50% at 100% 10%, rgba(232,220,196,0.05), transparent 50%)`

**Grid:** Dashed copper-tinted grid lines at 92px, opacity 0.12 in dark, 0.08 in light.

### 2.2 Typography

- **Display / H1-H2**: `Cabinet Grotesk` (or `Satoshi` fallback) — weight 600-700, `tracking-tight`, `leading-none` for hero
- **Body**: `Geist` (or `Inter` fallback) — 16px (1rem), weight 400, line-height 1.65, `max-width: 65ch`
- **Labels / Code / Orbit Legend**: `IBM Plex Mono` — 0.72rem-0.85rem, weight 400-500
- **Accent / Quotes**: Slight italic, larger size (1.1rem), warm cream color

**Scale:**
- H1: `clamp(2rem, 5vw, 3.2rem)`, uppercase, letter-spacing 0.02em
- H2: `clamp(1.2rem, 2.5vw, 1.6rem)`, color accent, left border 3px solid accent-muted
- Body: 1rem (16px)
- Small / Meta: 0.75rem (12px)
- Tiny / Labels: 0.65rem (10.4px)

### 2.3 Textures & Surfaces

- **Noise overlay**: Fixed, `pointer-events-none`, `z-index: 9999`, subtle SVG noise at 3% opacity to break digital flatness
- **Glass panels**: `backdrop-filter: blur(12px)`, 1px inner border `rgba(255,255,255,0.06)`, subtle inner shadow for edge refraction
- **Cards**: No outer border by default. Elevation communicated via background tint + hover shadow. Only use borders when grouping is ambiguous.
- **Spotlight borders**: Cards illuminate a warm copper border dynamically under the cursor position

## 3. Layout Architecture

### 3.1 Global

- **Container**: `max-width: 1280px`, centered with auto margins, `padding-inline: clamp(1rem, 4vw, 2rem)`
- **Vertical rhythm**: Section gaps of `clamp(3rem, 8vh, 6rem)` — generous, editorial whitespace
- **No more `h-screen`**: Use `min-height: 100dvh` for full-height sections
- **Scroll behavior**: `scroll-behavior: smooth` on html

### 3.2 Home Page (Hero)

**Structure: Split-screen asymmetric**
- Left column (~45%): Warm personal introduction
  - Large photo/avatar (80x80px, rounded square with subtle copper border)
  - H1: "Hi, I'm Pablo." (not uppercase — warm, conversational)
  - Subtitle: "ML engineer · data alchemist · tinkerer"
  - Short paragraph: "I turn raw data into insight, build things with PyTorch and curiosity, and cook up experiments in my digital workshop. Currently engineering ML at Santander."
  - Social icons row (redesigned as "workshop tools")
- Right column (~55%): The Armillary Sphere
  - Orbit canvas, large and unhurried, reskinned with copper/gold palette
  - Below canvas: "Currently optimizing: [project name]" label with monospace font
  - Canvas responds to hover: subtle glow intensifies
- Below hero: Bento grid
  - Blog feed (3 latest posts)
  - Featured project card (large)
  - "What I'm tinkering with" widget (e.g., "Reading about conformal prediction", "Experimenting with LLM interpretability")
  - Small stats widget ("Experiments run: 47", "Papers read this month: 12")

### 3.3 Projects Page

**Structure: Editorial grid, not uniform cards**
- Hero section: "The Lab Bench" — warm intro text, "Every project is a recipe. Here are mine."
- Featured projects (top 2): Large asymmetric cards, left text + right image, or full-width with overlay
- Remaining projects: Masonry-style grid, varying heights based on content
- Each card:
  - Project image (banner, 120px height, rounded)
  - Title (H3)
  - Description (2-3 lines, clamped)
  - "Ingredients" (tech stack tags, styled as spice labels)
  - "Prep time" (duration) + "Difficulty" (optional)
  - Links: "View recipe" (GitHub), "Live demo" (if exists)
  - Hover: card lifts, image parallax, spotlight border illuminates

### 3.4 Blog Page

**Structure: Notebook editorial**
- Hero: "Lab Notebook" — "Notes on ML, math, and the art of data alchemy."
- Post list: Staggered entry on load
  - Each post is a clean row/cell:
    - Date (monospace, small, left)
    - Title (H3, prominent)
    - Description (1-2 lines, muted)
    - Tags (colored by category: AI = coral, math = sage, engineering = steel-blue)
  - Generous vertical spacing between posts
  - No borders between posts — use whitespace as separator
- No more flat list with frames

### 3.5 Resume Page

**Structure: Clean, print-friendly, but personal**
- Header: Name, title, contact (centered or left-aligned)
- Sections: Experience, Education, Skills, Projects, Languages
- Skills section: Visualized as a "workbench" — skills grouped by category, proficiency shown via small copper bars or tool icons
- Volunteer section included
- Print-friendly: hide orbit, animations, noise. Show clean borders.

### 3.6 Kitchen Page (New)

**Structure: Recipe gallery**
- Hero: "The Kitchen" — "Data isn't the only thing I alchemize."
- Recipe cards:
  - Photo, title, cuisine tag, difficulty, prep time
  - "Ingredients" list
  - "Method" (brief steps)
  - Personal note: "Why I love this recipe"
- Filterable by cuisine, difficulty, type
- Each recipe connects to a "data alchemy principle" metaphorically

### 3.7 Search Page

- Keep existing Pagefind integration
- Style search input as a "lab search" — monospace placeholder, copper focus ring
- Results styled cleanly, no frame borders

### 3.8 404 Page

- "Off the map" — but warmer
- Illustration: a compass or telescope pointing the wrong way
- "This experiment hasn't been conducted yet."
- Link back home

## 4. Components

### 4.1 Navigation (SiteHeader)

- **Style**: Floating top bar, not a full-width frame. `position: sticky`, `top: 0`, `z-index: 50`.
- **Background**: Glassmorphism — `backdrop-filter: blur(16px)`, background `rgba(12,14,18,0.7)` in dark, `rgba(247,245,240,0.85)` in light.
- **Items**:
  - Home link: avatar thumbnail + name
  - Nav items: icon + label — Quill (Blog), Gear (Projects), Blueprint (Resume), Search (Magnifying glass), Flask (Kitchen)
  - Theme toggle: integrated, sun/moon with copper glow
- **Active state**: Copper underline or dot indicator, not bold color change
- **Hover**: subtle scale(1.02) + color shift

### 4.2 Orbit Visualization (Reskinned)

- **Canvas colors**: Central body = copper `#D4A574`, orbiting particles = warm gold `#E8DCC4`, trails = copper at 40% opacity
- **Background**: Transparent (inherits page bg)
- **Legend**: "Armillary Sphere · CMA-ES in progress" — monospace, small, top-left of canvas
- **Coords**: Bottom-right, monospace, warm muted color
- **Hover interaction**: Canvas glow intensifies slightly
- **Click interaction**: Opens a small tooltip: "This sphere tracks a real optimization. Currently tuning: [project]"

### 4.3 Project Card (Recipe Card)

- **Base**: No border. Background `var(--panel)`. Rounded corners `8px`.
- **Image**: Full-width top, `120px` height, `object-fit: cover`, rounded top corners.
- **Content padding**: `1.25rem`
- **Title**: H3, weight 600
- **Description**: Body text, 2-3 lines clamped
- **Tags**: "Spice labels" — small rounded pills, border 1px solid accent at 20% opacity, text accent color
- **Links**: "View recipe →" and "Live demo →" — text links with underline, not buttons
- **Hover**: `translateY(-6px)`, shadow `0 12px 32px rgba(212,165,116,0.08)`, spotlight border follows cursor
- **Active/Pressed**: `scale(0.98)`

### 4.4 Blog Post Row

- **Layout**: Grid with date column (left, fixed width ~100px) and content column (right, fluid)
- **Date**: Monospace, small, muted, formatted as "2024.06.15" (dot separators for alchemy feel)
- **Title**: H3, no underline by default
- **Description**: Muted, 1-2 lines
- **Tags**: Small, colored dots + text by category
- **Hover**: Title shifts to accent color, subtle `translateX(4px)` on the row

### 4.5 Social Icons (Workshop Tools)

- **Icons**: GitHub (wrench), LinkedIn (compass), Email (envelope/sealed letter)
- **Style**: Small rounded squares (squircles, not circles), border 1px solid line color
- **Hover**: Background fills with accent at 6% opacity, border accent, `translateY(-2px)`
- **Size**: `2rem` x `2rem`, icon 18px

### 4.6 Theme Toggle

- **Style**: Small rounded button with sun/moon SVG
- **Hover**: Copper glow ring
- **Keyboard**: Alt+T preserved

### 4.7 Footer (Telemetry -> Workshop Status)

- **Style**: Clean, minimal, not a frame box
- **Left**: Workshop status line — cycles through personal notes:
  - "Currently reading: The Book of Why"
  - "Last experiment: LLM interpretability pipeline"
  - "Kitchen status: Perfecting sourdough"
  - "Stargazing: Tracking Jupiter's moons"
- **Right**: Social links as text, no icons
- **Bottom**: "Built with Astro · Blueprints strictly aspirational"

## 5. Interactions & Motion

### 5.1 Global

- **Smooth scroll**: `scroll-behavior: smooth` on html
- **Page transitions**: No full page reload feel — content fades in

### 5.2 Entry Animations (Staggered)

- **Blog posts, project cards, bento items**: Staggered fade-in + translateY(20px -> 0)
- **Delay**: `calc(var(--index) * 80ms)` via CSS custom properties
- **Duration**: 500ms
- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo)

### 5.3 Hover States

- **Links**: Underline color transitions to accent, 200ms
- **Cards**: `translateY(-6px)`, shadow appears, 300ms spring-like easing
- **Buttons**: Background fill, `scale(1.02)`
- **Nav items**: `scale(1.02)`, copper dot appears below

### 5.4 Active/Pressed

- **All interactive elements**: `scale(0.98)`, `translateY(1px)` — tactile, mechanical feel
- **Duration**: 100ms

### 5.5 Spotlight Borders

- **Implementation**: CSS-only where possible, JS for cursor tracking
- **Effect**: A radial gradient follows the cursor over card borders, illuminating copper glow
- **CSS**: `--mouse-x`, `--mouse-y` updated on `mousemove`, used in `background: radial-gradient(...)`

### 5.6 Noise Overlay

- **Element**: Fixed div, full viewport, `pointer-events: none`, `z-index: 9999`
- **Texture**: SVG filter noise or CSS `filter: url(#noise)`
- **Opacity**: 3% in dark, 2% in light
- **Performance**: Static, no animation

## 6. Easter Eggs & Gamification

### 6.1 Konami Code (↑↑↓↓←→←→BA)

- **Trigger**: Keyboard sequence
- **Reward**: Secret `/kitchen/` page unlock animation (a cabinet door swings open)
- **Redirect**: Smooth navigate to `/kitchen/`

### 6.2 Hidden Constellation

- **Trigger**: Click 5 "stars" (random small dots in the background)
- **Reward**: Reveals a fun fact about Pablo in a toast notification
- **Facts**: "I can solve a Rubik's cube in under 2 minutes", "My first program was a calculator in Java", etc.

### 6.3 Lab Notebook Doodle

- **Trigger**: Shake mouse rapidly on blog page
- **Reward**: A small hand-drawn-style doodle (star, flask, whisk) appears in a random margin
- **Implementation**: CSS animation triggered by JS detecting rapid mouse movement

### 6.4 Robot Diagnostics Panel

- **Trigger**: Click footer status text 3 times rapidly
- **Reward**: A fake "System Diagnostics" modal opens with playful tech-jargon:
  - "Neural link: Operational"
  - "Coffee levels: Critical"
  - "Curiosity quotient: 97.3%"
  - "Sourdough starter: Alive and well"

### 6.5 Achievement Badges

| Badge | Condition | Toast Text |
|-------|-----------|------------|
| Code Archaeologist | Read 3 blog posts | "Badge unlocked: Code Archaeologist" |
| Stargazer | Spend 2+ min on home page | "Badge unlocked: Stargazer" |
| Chef | Find the Kitchen page | "Badge unlocked: Chef's Kiss" |
| Tinkerer | Visit all 4 main pages | "Badge unlocked: Master Tinkerer" |
| Alchemist | Read a post + view a project + view resume | "Badge unlocked: Data Alchemist" |

- **Storage**: `localStorage` key `workshop-badges`
- **UI**: Small toast notification slides up from bottom-right, stays 3 seconds
- **Progress bar**: Subtle, collapsible XP bar at bottom: "Curiosity Level: N" — fills as you explore

### 6.6 Recipe of the Day

- **Trigger**: Click the orbit sphere at midnight UTC (or just a fun hidden button)
- **Reward**: Reveals a favorite recipe card overlay

## 7. Content Strategy

### 7.1 Voice & Tone

- **Warm, curious, slightly whimsical** — like a friend explaining their passion project
- **No AI cliches**: No "Elevate", "Seamless", "Unleash", "Next-Gen", "Delve"
- **Active voice**: "I built", "I discovered", "I learned"
- **Personal pronouns**: First person throughout
- **Metaphors**: Cooking, alchemy, space, workshop — but used naturally, not forced

### 7.2 Site Copy

- **Home hero**: "Hi, I'm Pablo. I turn raw data into insight, build things with PyTorch and curiosity, and cook up experiments in my digital workshop. Currently engineering ML at Santander."
- **Projects intro**: "The Lab Bench. Every project is a recipe. Here are some I've cooked up."
- **Blog intro**: "Lab Notebook. Notes on ML, math, and the art of data alchemy."
- **Resume intro**: "Resume. A concise map of where I've been and what I've built."
- **Kitchen intro**: "The Kitchen. Data isn't the only thing I alchemize. Here are some recipes I love."

### 7.3 Tag Colors (Blog & Projects)

| Category | Color |
|----------|-------|
| AI / Machine Learning | `#D4A574` (copper) |
| Math / Theory | `#8FBC8F` (sage) |
| Engineering / Systems | `#7BA7BC` (steel blue) |
| Cooking / Personal | `#E8A87C` (soft peach) |
| Space / Physics | `#B8A9C9` (dusty lavender) |

## 8. Technical Notes

### 8.1 Fonts

Load from Google Fonts or self-host:
- `Cabinet Grotesk` (display) — or use `Outfit` or `Satoshi` if unavailable
- `Geist` (body) — or `Inter` fallback
- `IBM Plex Mono` (mono) — already loaded

### 8.2 Performance

- **Noise overlay**: Static SVG, no animation, `will-change: none`
- **Spotlight borders**: CSS custom properties updated via JS, use `requestAnimationFrame`
- **Staggered entry**: CSS-only with `animation-delay`, no JS needed
- **Orbit canvas**: Already optimized, just reskin colors

### 8.3 Accessibility

- **Focus rings**: 2px solid copper, offset 2px
- **Skip link**: Hidden until focused, "Skip to content"
- **Reduced motion**: Respect `prefers-reduced-motion` — disable staggered animations, parallax
- **Color contrast**: All text meets WCAG AA against backgrounds
- **Alt text**: Every image has descriptive alt text

## 9. File Map

### New Files
- `src/pages/kitchen/index.astro` — Kitchen page
- `src/components/WorkshopNav.astro` — New navigation (replaces SiteHeader)
- `src/components/HeroSection.astro` — Home hero
- `src/components/BentoGrid.astro` — Home bento grid
- `src/components/ProjectCard.astro` — Recipe-style project card
- `src/components/BlogPostRow.astro` — Editorial blog row
- `src/components/SpotlightCard.astro` — Wrapper for spotlight border effect
- `src/components/ToastNotification.astro` — Achievement toast
- `src/components/AchievementSystem.astro` — Gamification logic
- `src/components/KitchenRecipeCard.astro` — Recipe card for kitchen
- `src/components/NoiseOverlay.astro` — Global noise texture
- `src/data/recipes.json` — Recipe data
- `src/lib/achievements.ts` — Achievement tracking logic
- `src/lib/easter-eggs.ts` — Easter egg triggers
- `src/styles/animations.css` — Keyframes and animation utilities
- `public/fonts/` — Self-hosted fonts (optional)

### Modified Files
- `src/styles/global.css` — Complete color palette overhaul, new layout utilities
- `src/layouts/BaseLayout.astro` — Add noise overlay, new font links
- `src/pages/index.astro` — Complete rewrite with hero + bento
- `src/pages/projects/index.astro` — Editorial grid layout
- `src/pages/blog/index.astro` — Editorial list layout
- `src/pages/resume/index.astro` — Visual skills workbench
- `src/pages/blog/[slug]/index.astro` — Updated styling
- `src/pages/search/index.astro` — Updated styling
- `src/pages/404.astro` — Warmer 404
- `src/components/SiteHeader.astro` — Deprecate, replace with WorkshopNav
- `src/components/SiteFooter.astro` — New workshop status footer
- `src/components/SocialIconRow.astro` — New tool icons
- `src/components/ThemeCycleButton.astro` — Copper glow hover
- `src/components/OrbitOptimizationHub.astro` — Reskin colors
- `src/components/OrbitLabFeedDock.astro` — Bento grid items
- `src/lib/orbit-optimization-viz.ts` — Update color constants
- `src/site-config.ts` — Update tagline, descriptions
- `astro.config.mjs` — Add kitchen route if needed

## 10. Migration Strategy

1. **Phase 1: Foundation** — New CSS variables, fonts, base layout changes
2. **Phase 2: Components** — Build new components independently
3. **Phase 3: Pages** — Rewrite pages using new components
4. **Phase 4: Interactions** — Add animations, easter eggs, gamification
5. **Phase 5: Content** — Add kitchen page, update copy
6. **Phase 6: Polish** — Accessibility, reduced motion, print styles, testing

## 11. Success Criteria

- [ ] Home page loads with large, readable text (16px+ body)
- [ ] Orbit visualization displays in copper/gold palette
- [ ] Project cards have hover lift and spotlight borders
- [ ] Blog posts stagger in on page load
- [ ] Navigation is sticky, glassmorphic, with tool icons
- [ ] At least 3 easter eggs are functional
- [ ] Achievement system tracks progress in localStorage
- [ ] Kitchen page exists with at least 2 recipes
- [ ] All pages pass Lighthouse accessibility audit (90+)
- [ ] Dark/light theme toggle works across all pages
- [ ] Site is fully responsive (mobile, tablet, desktop)
- [ ] No generic AI cliches in copy
- [ ] Color contrast meets WCAG AA
