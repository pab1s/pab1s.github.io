# The Curiosity Workshop — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evolve the portfolio from a cramped cyber-cosmic terminal into a warm, personal, joyful "Curiosity Workshop" with data alchemy + cooking metaphors, easter eggs, and gamification.

**Architecture:** Astro 5 static site, vanilla CSS with CSS custom properties, minimal JS for interactions, localStorage for gamification. No new dependencies.

**Tech Stack:** Astro, vanilla CSS, vanilla JS, Pagefind (existing)

---

## File Map

### New Files
| File | Purpose |
|------|---------|
| `src/components/NoiseOverlay.astro` | Global static noise texture overlay |
| `src/components/WorkshopNav.astro` | Sticky glassmorphic nav with tool icons |
| `src/components/SpotlightCard.astro` | Cursor-tracking spotlight border wrapper |
| `src/components/HeroSection.astro` | Home hero: intro text + armillary sphere |
| `src/components/BentoGrid.astro` | Home bento: blog, project, tinkering, stats |
| `src/components/ProjectCard.astro` | Recipe-style project card with hover lift |
| `src/components/BlogPostRow.astro` | Editorial blog row with stagger |
| `src/components/ToastNotification.astro` | Achievement toast slide-up |
| `src/components/AchievementSystem.astro` | Gamification engine (localStorage) |
| `src/components/KitchenRecipeCard.astro` | Recipe card for kitchen page |
| `src/pages/kitchen/index.astro` | Kitchen page |
| `src/data/recipes.json` | Recipe content |
| `src/lib/achievements.ts` | Badge tracking logic |
| `src/lib/easter-eggs.ts` | Easter egg triggers |
| `src/styles/animations.css` | Keyframes and stagger utilities |

### Modified Files
| File | Change |
|------|--------|
| `src/styles/global.css` | Complete palette overhaul (copper/sage), new spacing, typography |
| `src/layouts/BaseLayout.astro` | Add noise overlay, new font links, skip link |
| `src/pages/index.astro` | Full rewrite with hero + bento grid |
| `src/pages/projects/index.astro` | Editorial grid layout |
| `src/pages/blog/index.astro` | Editorial list layout |
| `src/pages/resume/index.astro` | Visual skills workbench |
| `src/pages/blog/[slug]/index.astro` | Updated colors + spacing |
| `src/pages/search/index.astro` | Updated search styling |
| `src/pages/404.astro` | Warmer 404 |
| `src/components/SiteHeader.astro` | Deprecate, replace with WorkshopNav |
| `src/components/SiteFooter.astro` | New workshop status footer |
| `src/components/SocialIconRow.astro` | New tool icons (wrench, compass, envelope) |
| `src/components/ThemeCycleButton.astro` | Copper glow hover state |
| `src/components/OrbitOptimizationHub.astro` | Reskin to copper/gold palette |
| `src/components/OrbitLabFeedDock.astro` | Bento grid child components |
| `src/lib/orbit-optimization-viz.ts` | Update orbit color constants to copper/gold |
| `src/site-config.ts` | Update tagline, descriptions, telemetry lines |
| `astro.config.mjs` | Add kitchen to sitemap |

---

## Task 1: Foundation — CSS Palette & Typography Overhaul

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/layouts/BaseLayout.astro`
- Create: `src/styles/animations.css`

- [ ] **Step 1: Backup old CSS**
  Run: `cp src/styles/global.css src/styles/global.css.bak`

- [ ] **Step 2: Rewrite CSS custom properties in global.css**
  Replace the entire `:root` block (lines 1-50) with the new warm copper workshop palette.
  New `:root` should include:
  - `--canvas: #0C0E12`
  - `--panel: rgba(255,248,240,0.03)`
  - `--ink: #F0EBE3`
  - `--muted: rgba(200,190,175,0.5)`
  - `--accent: #D4A574`
  - `--accent-hot: #F5CBA7`
  - `--line: rgba(212,165,116,0.15)`
  - `--line-strong: rgba(212,165,116,0.25)`
  - `--link-hover: #F5CBA7`
  - `--code-bg: rgba(212,165,116,0.06)`
  - `--pre-bg: rgba(212,165,116,0.04)`
  - `--frame-dash: rgba(212,165,116,0.18)`
  - `--table-th-bg: rgba(212,165,116,0.08)`
  - `--project-banner-bg: rgba(212,165,116,0.05)`
  - `--link-underline: rgba(212,165,116,0.35)`
  - `--font-sans: "Geist", "Inter", system-ui, sans-serif`
  - `--font-display: "Cabinet Grotesk", "Satoshi", "Outfit", sans-serif`
  - Keep `--font-mono: "IBM Plex Mono", ui-monospace, monospace`
  - `--radius: 8px`
  - `--grid-cell: 92px`
  - `--stars-opacity: 0.18`
  - Updated orbit colors: `--orbit-trail`, `--orbit-planet-fill`, `--orbit-sat-fill` etc. in copper/gold
  - Updated gradients: `--glow-orbit-top` and `--glow-orbit-side` in copper tones at lower opacity (10% and 5%)
  - Updated `--cuadricula` SVG with copper-tinted lines at 0.12 opacity

- [ ] **Step 3: Rewrite light theme `[data-theme="light"]` block**
  Mirror all variables with light mode values:
  - `--canvas: #F7F5F0`
  - `--panel: rgba(255,255,255,0.88)`
  - `--ink: #1C1E22`
  - `--muted: rgba(60,55,50,0.5)`
  - `--accent: #B87333`
  - `--accent-hot: #8B4513`
  - All line/frame colors in `rgba(184,115,51, ...)`
  - `--stars-opacity: 0`
  - Light orbit colors in copper/dark tones

- [ ] **Step 4: Update body styles**
  Change `font-size: 14px` to `font-size: 16px`
  Change `font-family: var(--font-mono)` to `font-family: var(--font-sans)`
  Change `line-height: 1.55` to `line-height: 1.65`
  Keep `min-height: 100vh` (or update to `min-height: 100dvh` if desired)

- [ ] **Step 5: Update heading styles**
  H1: increase to `clamp(2rem, 5vw, 3.2rem)`, remove `text-transform: uppercase` (keep for other pages but home should be conversational), keep letter-spacing tight
  H2: increase to `clamp(1.2rem, 2.5vw, 1.6rem)`, keep left border but soften color
  H3: increase to `1.05rem`

- [ ] **Step 6: Update .frame styles**
  Increase `border-radius` to `var(--radius)` (8px)
  Increase padding to `1rem 1.25rem`
  Soften border to `var(--line)` (now copper-tinted at 15%)
  Keep dashed inner border but reduce opacity

- [ ] **Step 7: Create animations.css**
  Create `src/styles/animations.css` with:
  - `@keyframes fade-in-up`
  - `@keyframes toast-slide-up`
  - `.stagger-in > *` rule with `animation-delay: calc(var(--index, 0) * 80ms)`
  - `@keyframes pulse-soft` for subtle ambient animations

- [ ] **Step 8: Add font links to BaseLayout**
  In `src/layouts/BaseLayout.astro`, add Google Fonts preconnect + link tags for:
  - `Cabinet Grotesk` (or `Outfit` as fallback)
  - `Geist` (or `Inter` as fallback)
  - Keep existing `IBM Plex Mono`
  Keep existing `Chakra Petch` as a secondary display option if desired, or remove it.
  Add `<link rel="stylesheet" href="/src/styles/animations.css" />` or import it in global.css.

- [ ] **Step 9: Update theme-color meta**
  Change from `#0041BA` to `#0C0E12` (dark) and `#F7F5F0` (light)

- [ ] **Step 10: Test and commit**
  Run: `npm run build` (or at least `npm run dev` and verify it compiles)
  Expected: Build succeeds with new colors applied
  Run:
  ```bash
  git add src/styles/global.css src/styles/animations.css src/layouts/BaseLayout.astro
  git commit -m "style: implement warm copper workshop palette, typography, and animations"
  ```

---

## Task 2: Global Components

**Files:**
- Create: `src/components/NoiseOverlay.astro`
- Create: `src/components/WorkshopNav.astro`
- Create: `src/components/SpotlightCard.astro`

- [ ] **Step 1: Create NoiseOverlay.astro**
  Create `src/components/NoiseOverlay.astro`:
  ```astro
  <div class="noise-overlay" aria-hidden="true"></div>
  <style>
    .noise-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      pointer-events: none;
      opacity: 0.03;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    }
    html[data-theme="light"] .noise-overlay {
      opacity: 0.02;
    }
  </style>
  ```

- [ ] **Step 2: Create WorkshopNav.astro**
  Create `src/components/WorkshopNav.astro`:
  - Sticky positioning: `position: sticky; top: 0; z-index: 50`
  - Glassmorphism background: `backdrop-filter: blur(16px)`, `background: rgba(12,14,18,0.7)` (dark) / `rgba(247,245,240,0.85)` (light)
  - Border bottom: `1px solid var(--line)`
  - Inner container: `max-width: 1280px`, centered, `padding: 0.75rem 1.5rem`
  - Left: Avatar thumbnail (32x32, rounded square) + "Pablo Olivares" name link
  - Right: Nav items with SVG icons:
    - Blog (quill/pen icon) + "Blog"
    - Projects (gear icon) + "Projects"
    - Resume (blueprint/scroll icon) + "Resume"
    - Search (magnifying glass) + "Search"
    - Kitchen (flask/beaker icon) + "Kitchen"
  - Active state: Copper underline `2px solid var(--accent)` below active item
  - Include ThemeCycleButton component
  - All icons as inline SVGs, `stroke-width="1.5"`, size 18px

- [ ] **Step 3: Create SpotlightCard.astro**
  Create `src/components/SpotlightCard.astro`:
  ```astro
  ---
  interface Props {
    class?: string;
  }
  const { class: className = "" } = Astro.props;
  ---
  <div class={`spotlight-card ${className}`} data-spotlight>
    <slot />
  </div>
  <script>
    (function() {
      const cards = document.querySelectorAll('[data-spotlight]');
      cards.forEach(card => {
        card.addEventListener('mousemove', (e: Event) => {
          const mouseEvent = e as MouseEvent;
          const rect = card.getBoundingClientRect();
          card.style.setProperty('--mouse-x', `${mouseEvent.clientX - rect.left}px`);
          card.style.setProperty('--mouse-y', `${mouseEvent.clientY - rect.top}px`);
        });
      });
    })();
  </script>
  <style>
    .spotlight-card {
      position: relative;
      background: var(--panel);
      border-radius: var(--radius);
      overflow: hidden;
      transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 300ms ease;
    }
    .spotlight-card::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: var(--radius);
      background: radial-gradient(
        600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
        rgba(212, 165, 116, 0.15),
        transparent 40%
      );
      opacity: 0;
      transition: opacity 300ms ease;
      pointer-events: none;
      z-index: 1;
    }
    .spotlight-card:hover::before {
      opacity: 1;
    }
    .spotlight-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 32px rgba(212, 165, 116, 0.08);
    }
  </style>
  ```

- [ ] **Step 4: Commit**
  Run:
  ```bash
  git add src/components/NoiseOverlay.astro src/components/WorkshopNav.astro src/components/SpotlightCard.astro
  git commit -m "feat: add noise overlay, workshop nav, and spotlight card components"
  ```

---

## Task 3: Home Page — Hero + Bento Grid

**Files:**
- Create: `src/components/HeroSection.astro`
- Create: `src/components/BentoGrid.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create HeroSection.astro**
  Create `src/components/HeroSection.astro`:
  - Split-screen layout: CSS Grid, `grid-template-columns: 1fr 1fr`, gap `2rem`
  - Mobile: stacks vertically (`@media (max-width: 768px)`)
  - Left column:
    - Avatar: 80x80px, `border-radius: 12px`, `border: 2px solid var(--accent)`, `object-fit: cover`
    - H1: "Hi, I'm Pablo." — `font-family: var(--font-display)`, `font-size: clamp(2rem, 5vw, 3.2rem)`, `color: var(--ink)`, no uppercase
    - Subtitle: "ML engineer · data alchemist · tinkerer" — `font-family: var(--font-mono)`, `font-size: 0.875rem`, `color: var(--accent)`, letter-spacing wide
    - Paragraph: "I turn raw data into insight, build things with PyTorch and curiosity, and cook up experiments in my digital workshop. Currently engineering ML at Santander." — `font-size: 1rem`, `color: var(--muted)`, `max-width: 45ch`, `line-height: 1.65`
    - Social icons row (reuses SocialIconRow or inline)
  - Right column:
    - Orbit canvas container: `aspect-ratio: 1`, `max-width: 500px`, `width: 100%`
    - Label below: "Currently optimizing: [project name]" — `font-family: var(--font-mono)`, `font-size: 0.65rem`, `color: var(--muted)`, text-align center
    - Import and use `OrbitOptimizationHub` inside the container
  - Props: `featuredProject` object with `title`

- [ ] **Step 2: Create BentoGrid.astro**
  Create `src/components/BentoGrid.astro`:
  - CSS Grid: `grid-template-columns: repeat(4, 1fr)` on desktop, `repeat(2, 1fr)` on tablet, `1fr` on mobile
  - Gap: `1rem`
  - Cell 1 (Blog feed): `grid-column: span 2`, `grid-row: span 2`
    - Title: "Latest from the notebook"
    - List of 3 latest blog posts (passed as props)
    - Each item: date + title, compact, hover shifts right
    - "View all ->" link
  - Cell 2 (Featured project): `grid-column: span 2`
    - Large project card with image, title, description, tags
    - "View recipe ->" link
  - Cell 3 (Tinkering): `grid-column: span 1`
    - "What I'm tinkering with"
    - Current interest items, e.g.:
      - "Reading about conformal prediction"
      - "Experimenting with LLM interpretability"
      - "Building this workshop"
    - Small monospace text, copper accent bullets
  - Cell 4 (Stats): `grid-column: span 1`
    - "Workshop stats"
    - "Experiments run: 47"
    - "Papers read this month: 12"
    - "Lines of code: 50k+"
    - Monospace numbers, accent color
  - Each cell wrapped in SpotlightCard
  - Stagger animation on cells

- [ ] **Step 3: Rewrite index.astro**
  Replace the entire content of `src/pages/index.astro`:
  - Import HeroSection, BentoGrid
  - Fetch blog posts (keep existing logic: `getCollection("blog")`, filter, sort, slice 0-3)
  - Fetch featured project (keep existing logic from `projects.json`)
  - Layout: WorkshopNav at top, then HeroSection, then BentoGrid
  - Remove old orbit-shell, orbit-main-grid, orbit-profile-card, orbit-stage-right, orbit-header-tools, orbit-en-nav, orbit-hub-shell, OrbitLabFeedDock
  - Keep BaseLayout with `layout="home-orbit"` or change to `"default"` and remove special orbit layout CSS
  - Actually: remove `layout="home-orbit"` from BaseLayout usage, use default layout so the page scrolls normally
  - Remove `layout-home-orbit` body class usage

- [ ] **Step 4: Update global.css for home page layout**
  Remove or deprecate the `.orbit-shell`, `.orbit-main-grid`, `.orbit-stage-right`, `.orbit-profile-card`, `.orbit-profile-inner`, `.orbit-profile-body`, `.orbit-profile-photo-wrap`, `.orbit-header-tools`, `.orbit-en-nav`, `.orbit-hub-shell`, `.orbit-hub-mount`, `.orbit-feed-dock`, `.orbit-feed-dock-inner`, `.orbit-feed-dock-main` etc. rules.
  Keep `.orbit-hub-canvas`, `.orbit-hub-legend`, `.orbit-hub-coords` for the canvas itself.

- [ ] **Step 5: Commit**
  Run:
  ```bash
  git add src/components/HeroSection.astro src/components/BentoGrid.astro src/pages/index.astro src/styles/global.css
  git commit -m "feat: redesign home page with hero section and bento grid"
  ```

---

## Task 4: Projects Page — Editorial Grid

**Files:**
- Create: `src/components/ProjectCard.astro`
- Modify: `src/pages/projects/index.astro`

- [ ] **Step 1: Create ProjectCard.astro**
  Create `src/components/ProjectCard.astro`:
  - Props interface: `title`, `description`, `image`, `tags`, `gitHubLink`, `liveLink?`, `prepTime?`, `difficulty?`
  - Structure:
    - Image container: `height: 140px`, `width: 100%`, `overflow: hidden`, `border-radius: var(--radius) var(--radius) 0 0`
      - Image: `width: 100%`, `height: 100%`, `object-fit: cover`, `transition: transform 400ms ease`
    - Content: `padding: 1.25rem`
      - Title: H3, `font-family: var(--font-display)`, `font-size: 1.1rem`
      - Description: `font-size: 0.9rem`, `color: var(--muted)`, `line-height: 1.5`, `-webkit-line-clamp: 3`, `overflow: hidden`
      - Tags: flex wrap gap 0.5rem
        - Each tag: `font-family: var(--font-mono)`, `font-size: 0.65rem`, `padding: 0.2rem 0.5rem`, `border: 1px solid rgba(212,165,116,0.2)`, `border-radius: 999px`, `color: var(--accent)`
      - Links: flex gap 1rem, margin-top 1rem
        - "View recipe ->" (links to GitHub)
        - "Live demo ->" (if liveLink exists)
        - Text links with underline, not buttons
  - Hover:
    - Card: `translateY(-6px)` via parent SpotlightCard
    - Image: `scale(1.05)` inside container
  - Use SpotlightCard as wrapper

- [ ] **Step 2: Rewrite projects/index.astro**
  - Import WorkshopNav, ProjectCard, SiteFooter
  - Hero section:
    - "The Lab Bench" — H1, `font-family: var(--font-display)`, large
    - Subtitle: "Every project is a recipe. Here are some I've cooked up." — `color: var(--muted)`
    - `margin-bottom: 3rem`
  - Featured projects (first 2):
    - CSS Grid: `grid-template-columns: 1fr 1fr`, gap `1.5rem`
    - Each uses ProjectCard but larger (image 200px height)
  - Remaining projects:
    - CSS Grid: `grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))`, gap `1.5rem`
    - Standard ProjectCard size
  - Remove old `.frame` wrappers, `.project-grid`, inline styles
  - Remove old header with "Prototype bay" stamp

- [ ] **Step 3: Commit**
  Run:
  ```bash
  git add src/components/ProjectCard.astro src/pages/projects/index.astro
  git commit -m "feat: redesign projects page with recipe cards and editorial grid"
  ```

---

## Task 5: Blog Page — Editorial List

**Files:**
- Create: `src/components/BlogPostRow.astro`
- Modify: `src/pages/blog/index.astro`

- [ ] **Step 1: Create BlogPostRow.astro**
  Create `src/components/BlogPostRow.astro`:
  - Props: `slug`, `title`, `date` (Date object), `description?`, `tags` (string[])
  - Structure (CSS Grid row):
    - Date column: `width: 100px`, `font-family: var(--font-mono)`, `font-size: 0.75rem`, `color: var(--muted)`, format as `YYYY.MM.DD`
    - Content column:
      - Title: H3, `font-size: 1.15rem`, `font-weight: 600`, `color: var(--ink)`, link to post
      - Description: `font-size: 0.9rem`, `color: var(--muted)`, `max-width: 50ch`, 1-2 lines
      - Tags: small dots + text, colored by category (AI=accent, math=sage, etc.)
    - Hover: title color shifts to `--accent`, row shifts `translateX(4px)`
  - No border-bottom; use whitespace as separator (`padding: 1.5rem 0`)

- [ ] **Step 2: Rewrite blog/index.astro**
  - Import WorkshopNav, BlogPostRow, SiteFooter
  - Hero:
    - "Lab Notebook" — H1
    - "Notes on ML, math, and the art of data alchemy." — subtitle
  - Post list:
    - `div.stagger-in` wrapper
    - Each BlogPostRow with `style="--index: ${i}"` for stagger
    - Generous gap between rows (`gap: 0` on container, each row has `padding: 1.5rem 0`)
  - Remove old `ul` with inline styles, `.frame` wrappers

- [ ] **Step 3: Commit**
  Run:
  ```bash
  git add src/components/BlogPostRow.astro src/pages/blog/index.astro
  git commit -m "feat: redesign blog with editorial list layout and stagger animation"
  ```

---

## Task 6: Resume Page — Visual Skills Workbench

**Files:**
- Modify: `src/pages/resume/index.astro`
- Modify: `src/components/ResumeContent.astro`

- [ ] **Step 1: Update resume/index.astro**
  - Import WorkshopNav
  - Hero: "Resume" H1 + "A concise map of where I've been and what I've built."
  - Keep ResumeContent component
  - Add SiteFooter

- [ ] **Step 2: Update ResumeContent.astro**
  - Keep all existing sections (Summary, Work, Education, Projects, Skills, Languages, Volunteering)
  - Update heading styles to match new H2/H3 sizes
  - Skills section: replace flat list with visual workbench
    - Group skills by category (Programming, ML & Data Science, Technologies & Tools)
    - Each category: H3 title + grid of skill items
    - Each skill item: name + proficiency bar (small, copper fill)
    - Proficiency: use a simple 4-level scale (Beginner, Intermediate, Advanced, Expert) mapped to bar widths (25%, 50%, 75%, 100%)
    - For this portfolio, all skills can show at 75% (Advanced) or 100% (Expert) based on cv.json content
  - Add print styles: `@media print` hide nav, noise, animations; show clean borders; ensure single-column layout
  - Remove inline styles, use CSS classes instead
  - Increase spacing between sections (`margin-bottom: 2.5rem`)

- [ ] **Step 3: Commit**
  Run:
  ```bash
  git add src/pages/resume/index.astro src/components/ResumeContent.astro
  git commit -m "feat: redesign resume with visual skills workbench"
  ```

---

## Task 7: Kitchen Page

**Files:**
- Create: `src/pages/kitchen/index.astro`
- Create: `src/components/KitchenRecipeCard.astro`
- Create: `src/data/recipes.json`

- [ ] **Step 1: Create recipes.json**
  Create `src/data/recipes.json` with at least 2 recipes:
  ```json
  {
    "recipes": [
      {
        "title": "Sourdough Bread",
        "cuisine": "European",
        "difficulty": "Advanced",
        "prepTime": "24h (including fermentation)",
        "ingredients": ["500g strong white flour", "350ml water", "100g sourdough starter", "10g salt"],
        "method": ["Mix flour and water, autolyse 1 hour", "Add starter and salt, knead 10 min", "Bulk ferment 4-6 hours with folds", "Shape and cold proof overnight", "Bake at 230C with steam"],
        "photo": "/images/sourdough.jpg",
        "personalNote": "This was my first successful sourdough. It taught me that patience and precise measurement matter — just like in data pipelines.",
        "alchemyPrinciple": "Fermentation is gradient descent: small steps, long time, incredible results."
      },
      {
        "title": "Spanish Tortilla",
        "cuisine": "Spanish",
        "difficulty": "Intermediate",
        "prepTime": "45 min",
        "ingredients": ["6 eggs", "3 potatoes", "1 onion", "Olive oil", "Salt"],
        "method": ["Slice potatoes and onion thinly", "Fry gently in olive oil until soft", "Drain and mix with beaten eggs", "Cook in pan, flip to finish", "Rest before serving"],
        "photo": "/images/tortilla.jpg",
        "personalNote": "A staple from my grandmother. Simple ingredients, perfect technique.",
        "alchemyPrinciple": "Feature engineering: the right ingredients, prepared correctly, make all the difference."
      }
    ]
  }
  ```

- [ ] **Step 2: Create KitchenRecipeCard.astro**
  Create `src/components/KitchenRecipeCard.astro`:
  - Props: recipe object from JSON
  - Structure:
    - Image: `height: 200px`, `object-fit: cover`, `border-radius: var(--radius)`
    - Title: H3
    - Meta row: cuisine tag + difficulty badge + prep time
    - "Ingredients" section: ul list
    - "Method" section: numbered ol list
    - "Why I love this" blockquote style: left border `3px solid var(--accent)`, italic, warm cream
    - "Alchemy principle" box: background `var(--panel)`, padding `1rem`, monospace text, small
  - Wrapped in SpotlightCard

- [ ] **Step 3: Create kitchen/index.astro**
  Create `src/pages/kitchen/index.astro`:
  - Import WorkshopNav, KitchenRecipeCard, SiteFooter
  - Read `src/data/recipes.json`
  - Hero: "The Kitchen" H1 + "Data isn't the only thing I alchemize. Here are some recipes I love."
  - Grid of recipe cards: `grid-template-columns: repeat(auto-fill, minmax(350px, 1fr))`, gap `1.5rem`
  - Each KitchenRecipeCard
  - Add a subtle filter UI (if desired, simple buttons for cuisine)

- [ ] **Step 4: Commit**
  Run:
  ```bash
  git add src/pages/kitchen/ src/components/KitchenRecipeCard.astro src/data/recipes.json
  git commit -m "feat: add kitchen page with recipes and data alchemy metaphors"
  ```

---

## Task 8: Footer & Orbit Reskin

**Files:**
- Modify: `src/components/SiteFooter.astro`
- Modify: `src/components/OrbitOptimizationHub.astro`
- Modify: `src/lib/orbit-optimization-viz.ts`
- Modify: `src/site-config.ts`

- [ ] **Step 1: Rewrite SiteFooter.astro**
  - Remove `.frame` and `.site-footer-compact` classes
  - Structure:
    - Top row: flex, space-between
      - Left: cycling workshop status (not telemetry) — personal notes like "Currently reading...", "Kitchen status..."
      - Right: social links as text (no icons): "GitHub", "LinkedIn", "Email"
    - Bottom row: centered, small text
      - "Built with Astro · Blueprints strictly aspirational · The Curiosity Workshop"
  - Keep the JS interval for cycling text but update dataset attribute name
  - Use `font-size: 0.75rem`, `color: var(--muted)`, `padding: 2rem 0`
  - Border top: `1px solid var(--line)`

- [ ] **Step 2: Update site-config.ts**
  - Change `tagline` to: "ML engineer · data alchemist · tinkerer"
  - Change `description` to: "Pablo Olivares — ML engineer and data scientist. Building things with PyTorch, curiosity, and a pinch of alchemy."
  - Update `telemetryLines` to workshop status lines:
    ```ts
    export const telemetryLines = [
      "Currently reading: The Book of Why",
      "Kitchen status: Perfecting sourdough",
      "Last experiment: LLM interpretability pipeline",
      "Stargazing: Tracking Jupiter's moons",
      "Tinkering with: Conformal prediction",
    ];
    ```
  - Add kitchen to nav if not already there (it should be in WorkshopNav, not necessarily in siteConfig.nav)

- [ ] **Step 3: Reskin OrbitOptimizationHub**
  - Update `.orbit-hub-legend` span from "ÓRBITA" to "ARMILLARY SPHERE"
  - Update `.orbit-hub-caption` text to: "CMA-ES in progress · optimizing in the workshop"

- [ ] **Step 4: Update orbit-optimization-viz.ts colors**
  Open `src/lib/orbit-optimization-viz.ts`
  - Change `PLANET_FILL` from `rgba(20, 46, 102, 0.92)` to `rgba(212, 165, 116, 0.92)` (copper)
  - Change `SATELLITE_FILL` from `rgba(246, 250, 255, 0.94)` to `rgba(232, 220, 196, 0.94)` (warm gold)
  - Change `TRAIL_COLOR` from `rgba(110, 195, 255, ...)` to `rgba(212, 165, 116, ...)` (copper)
  - Change `GUIDE_COLOR` to a warm muted tone
  - Adjust any other hardcoded colors to copper/gold palette

- [ ] **Step 5: Commit**
  Run:
  ```bash
  git add src/components/SiteFooter.astro src/components/OrbitOptimizationHub.astro src/lib/orbit-optimization-viz.ts src/site-config.ts
  git commit -m "feat: reskin orbit to copper/gold and redesign footer with workshop status"
  ```

---

## Task 9: Easter Eggs & Gamification

**Files:**
- Create: `src/lib/achievements.ts`
- Create: `src/lib/easter-eggs.ts`
- Create: `src/components/AchievementSystem.astro`
- Create: `src/components/ToastNotification.astro`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/pages/blog/index.astro` (for doodle trigger)
- Modify: `src/components/SiteFooter.astro` (for diagnostics trigger)

- [ ] **Step 1: Create achievements.ts**
  Create `src/lib/achievements.ts`:
  ```typescript
  const STORAGE_KEY = 'workshop-badges';
  export type BadgeId = 'code-archaeologist' | 'stargazer' | 'chef' | 'tinkerer' | 'alchemist';
  export interface Badge {
    id: BadgeId;
    name: string;
    description: string;
  }
  export const BADGES: Record<BadgeId, Badge> = {
    'code-archaeologist': { id: 'code-archaeologist', name: 'Code Archaeologist', description: 'Read 3 blog posts' },
    'stargazer': { id: 'stargazer', name: 'Stargazer', description: 'Spend 2+ minutes on the home page' },
    'chef': { id: 'chef', name: "Chef's Kiss", description: 'Find the Kitchen page' },
    'tinkerer': { id: 'tinkerer', name: 'Master Tinkerer', description: 'Visit all 4 main pages' },
    'alchemist': { id: 'alchemist', name: 'Data Alchemist', description: 'Read a post, view a project, and view resume' },
  };
  export function getBadges(): BadgeId[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch { return []; }
  }
  export function hasBadge(id: BadgeId): boolean {
    return getBadges().includes(id);
  }
  export function awardBadge(id: BadgeId): boolean {
    if (hasBadge(id)) return false;
    const badges = getBadges();
    badges.push(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(badges));
    return true;
  }
  export function getProgress(): { level: number; xp: number; nextLevelXp: number } {
    const badges = getBadges();
    const xp = badges.length * 100;
    const level = Math.floor(xp / 100) + 1;
    return { level, xp, nextLevelXp: level * 100 };
  }
  ```

- [ ] **Step 2: Create easter-eggs.ts**
  Create `src/lib/easter-eggs.ts`:
  ```typescript
  // Konami code
  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let konamiIndex = 0;
  export function initKonamiCode(onActivate: () => void) {
    document.addEventListener('keydown', (e) => {
      if (e.key === KONAMI[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex >= KONAMI.length) { onActivate(); konamiIndex = 0; }
      } else { konamiIndex = 0; }
    });
  }
  // Hidden constellation
  export function initConstellation(onComplete: () => void) {
    let clicks = 0;
    document.querySelectorAll('.star-pixel, .stars').forEach(el => {
      el.addEventListener('click', () => {
        clicks++;
        if (clicks >= 5) { onComplete(); clicks = 0; }
      });
    });
  }
  // Mouse shake detector
  export function initMouseShake(onShake: () => void) {
    let lastX = 0, lastY = 0, shakes = 0, lastTime = 0;
    document.addEventListener('mousemove', (e) => {
      const now = Date.now();
      const dx = Math.abs(e.clientX - lastX);
      const dy = Math.abs(e.clientY - lastY);
      if (dx > 50 && dy > 50 && now - lastTime < 100) {
        shakes++;
        if (shakes > 10) { onShake(); shakes = 0; }
      }
      lastX = e.clientX; lastY = e.clientY; lastTime = now;
    });
  }
  // Footer click counter
  export function initFooterClicks(selector: string, onTriple: () => void) {
    let clicks = 0;
    const el = document.querySelector(selector);
    if (!el) return;
    el.addEventListener('click', () => {
      clicks++;
      setTimeout(() => clicks = 0, 2000);
      if (clicks >= 3) { onTriple(); clicks = 0; }
    });
  }
  ```

- [ ] **Step 3: Create ToastNotification.astro**
  Create `src/components/ToastNotification.astro`:
  ```astro
  <div id="toast-container" class="toast-container" aria-live="polite" aria-atomic="true"></div>
  <script>
    window.showToast = function(message: string, duration = 3000) {
      const container = document.getElementById('toast-container');
      if (!container) return;
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = message;
      container.appendChild(toast);
      requestAnimationFrame(() => toast.classList.add('toast--visible'));
      setTimeout(() => {
        toast.classList.remove('toast--visible');
        setTimeout(() => toast.remove(), 300);
      }, duration);
    };
  </script>
  <style>
    .toast-container { position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 1000; display: flex; flex-direction: column; gap: 0.5rem; }
    .toast {
      background: var(--panel);
      backdrop-filter: blur(12px);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      padding: 0.75rem 1.25rem;
      color: var(--accent);
      font-family: var(--font-mono);
      font-size: 0.8rem;
      opacity: 0;
      transform: translateY(100%);
      transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
    }
    .toast--visible { opacity: 1; transform: translateY(0); }
  </style>
  ```

- [ ] **Step 4: Create AchievementSystem.astro**
  Create `src/components/AchievementSystem.astro`:
  ```astro
  <script>
    import { awardBadge, hasBadge, BADGES, type BadgeId } from '../lib/achievements';
    import { initKonamiCode, initConstellation, initMouseShake, initFooterClicks } from '../lib/easter-eggs';

    // Page visit tracking
    const visited = new Set(JSON.parse(sessionStorage.getItem('visited-pages') || '[]'));
    visited.add(location.pathname);
    sessionStorage.setItem('visited-pages', JSON.stringify([...visited]));

    // Tinkerer badge: visit 4+ pages
    if (visited.size >= 4 && awardBadge('tinkerer')) {
      window.showToast?.(`Badge unlocked: ${BADGES['tinkerer'].name}`);
    }

    // Stargazer badge: 2+ min on home
    if (location.pathname === '/') {
      setTimeout(() => {
        if (awardBadge('stargazer')) {
          window.showToast?.(`Badge unlocked: ${BADGES['stargazer'].name}`);
        }
      }, 120000);
    }

    // Alchemist badge: read post + project + resume
    const paths = [...visited];
    const hasBlog = paths.some(p => p.startsWith('/blog/'));
    const hasProject = paths.some(p => p.startsWith('/projects/'));
    const hasResume = paths.some(p => p === '/resume/');
    if (hasBlog && hasProject && hasResume && awardBadge('alchemist')) {
      window.showToast?.(`Badge unlocked: ${BADGES['alchemist'].name}`);
    }

    // Code Archaeologist: track blog post reads
    if (location.pathname.startsWith('/blog/')) {
      const reads = parseInt(localStorage.getItem('blog-reads') || '0', 10) + 1;
      localStorage.setItem('blog-reads', String(reads));
      if (reads >= 3 && awardBadge('code-archaeologist')) {
        window.showToast?.(`Badge unlocked: ${BADGES['code-archaeologist'].name}`);
      }
    }

    // Chef badge: visit kitchen
    if (location.pathname === '/kitchen/' && awardBadge('chef')) {
      window.showToast?.(`Badge unlocked: ${BADGES['chef'].name}`);
    }

    // Easter eggs
    initKonamiCode(() => {
      window.showToast?.('Secret recipe cabinet unlocking...');
      setTimeout(() => location.href = '/kitchen/', 1500);
    });

    initConstellation(() => {
      const facts = [
        "Fun fact: I can solve a Rubik's cube in under 2 minutes",
        "Fun fact: My first program was a calculator in Java",
        "Fun fact: I spent a year in Poland on Erasmus+",
        "Fun fact: I volunteer with LibreIM writing LaTeX notes",
      ];
      window.showToast?.(facts[Math.floor(Math.random() * facts.length)]);
    });

    initFooterClicks('[data-footer-status]', () => {
      window.showToast?.('System Diagnostics: Coffee levels critical. Curiosity at 97.3%. Sourdough: alive.');
    });
  </script>
  ```

- [ ] **Step 5: Integrate into BaseLayout**
  Add `<AchievementSystem />` and `<ToastNotification />` before closing `</body>` tag in BaseLayout.

- [ ] **Step 6: Commit**
  Run:
  ```bash
  git add src/lib/achievements.ts src/lib/easter-eggs.ts src/components/AchievementSystem.astro src/components/ToastNotification.astro src/layouts/BaseLayout.astro
  git commit -m "feat: add easter eggs, achievements, and toast notifications"
  ```

---

## Task 10: Polish — Accessibility, Mobile, Print, 404

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/pages/404.astro`
- Modify: `src/pages/blog/[slug]/index.astro`
- Modify: `src/pages/search/index.astro`
- Modify: `src/components/SocialIconRow.astro`
- Modify: `src/components/ThemeCycleButton.astro`

- [ ] **Step 1: Add skip link**
  In BaseLayout, add after `<body>` opening:
  ```html
  <a href="#main-content" class="skip-link">Skip to content</a>
  ```
  And wrap main content slot with `<main id="main-content">`
  Add CSS:
  ```css
  .skip-link {
    position: absolute; top: -40px; left: 0;
    background: var(--accent); color: var(--canvas);
    padding: 0.5rem 1rem; z-index: 10000;
    transition: top 0.2s;
  }
  .skip-link:focus { top: 0; }
  ```

- [ ] **Step 2: Focus rings**
  Add global focus styles:
  ```css
  :focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  ```

- [ ] **Step 3: Reduced motion**
  Wrap animations:
  ```css
  @media (prefers-reduced-motion: no-preference) {
    .stagger-in > * { animation: fade-in-up 500ms ... }
    /* etc */
  }
  @media (prefers-reduced-motion: reduce) {
    .stagger-in > * { animation: none; opacity: 1; }
  }
  ```

- [ ] **Step 4: Mobile responsiveness**
  Add media queries where missing:
  - Home hero stacks at < 768px
  - Bento grid becomes 1-2 columns at < 768px
  - Project grid single column at < 640px
  - Blog rows: date stacks above title at < 640px
  - Nav collapses to hamburger or scrolls horizontally at < 640px

- [ ] **Step 5: Print styles**
  Add `@media print` block:
  ```css
  @media print {
    .noise-overlay, .stars, .orbit-hub-mount, nav, .theme-cycle-btn { display: none !important; }
    body { background: white !important; color: black !important; }
    a { text-decoration: underline; color: black !important; }
    .frame { border: 1px solid #ccc !important; background: white !important; }
  }
  ```

- [ ] **Step 6: Update 404.astro**
  Warmer 404:
  - "This experiment hasn't been conducted yet."
  - Compass/telescope SVG illustration (inline, simple)
  - "Return to the workshop" link
  - Remove `.frame`, use clean centered layout

- [ ] **Step 7: Update blog post page**
  Apply new color palette, increase spacing, remove cramped inline styles

- [ ] **Step 8: Update search page**
  Style search input with copper focus ring, clean results

- [ ] **Step 9: Update SocialIconRow**
  New tool icons: GitHub = wrench, LinkedIn = compass, Email = envelope
  Squircle shape (rounded square, `border-radius: 8px`), copper hover

- [ ] **Step 10: Update ThemeCycleButton**
  Add copper glow on hover:
  ```css
  .theme-cycle-btn:hover {
    box-shadow: 0 0 12px rgba(212, 165, 116, 0.3);
  }
  ```

- [ ] **Step 11: Final build and test**
  Run: `npm run build`
  Check for errors.

- [ ] **Step 12: Commit**
  Run:
  ```bash
  git add -A
  git commit -m "polish: accessibility, mobile, print styles, 404, and final touches"
  ```

---

## Spec Coverage Checklist

| Spec Requirement | Task | Covered |
|------------------|------|---------|
| Warm copper palette | Task 1 | Yes |
| Large readable typography (16px+) | Task 1 | Yes |
| New display font (Cabinet Grotesk) | Task 1 | Yes |
| Glassmorphic sticky nav | Task 2 | Yes |
| Home hero with intro + orbit | Task 3 | Yes |
| Bento grid on home | Task 3 | Yes |
| Recipe-style project cards | Task 4 | Yes |
| Editorial blog list | Task 5 | Yes |
| Visual skills workbench | Task 6 | Yes |
| Kitchen page | Task 7 | Yes |
| Copper/gold orbit reskin | Task 8 | Yes |
| Workshop status footer | Task 8 | Yes |
| Easter eggs (Konami, constellation, doodle, diagnostics) | Task 9 | Yes |
| Achievement badges + XP bar | Task 9 | Yes |
| Toast notifications | Task 9 | Yes |
| Noise overlay | Task 2 | Yes |
| Spotlight borders | Task 2 | Yes |
| Staggered entry animations | Task 1 | Yes |
| Skip links | Task 10 | Yes |
| Reduced motion support | Task 10 | Yes |
| Print styles | Task 10 | Yes |
| 404 page | Task 10 | Yes |

---

## Execution Complete Checklist

After all tasks are done:
- [ ] `npm run build` passes with no errors
- [ ] `npm run preview` shows the redesigned site
- [ ] All pages render correctly (home, projects, blog, resume, kitchen, search, 404)
- [ ] Dark/light toggle works
- [ ] Easter eggs functional (test Konami, footer clicks)
- [ ] Achievements stored in localStorage
- [ ] Mobile responsive (test at 375px, 768px, 1440px)
- [ ] Lighthouse Accessibility >= 90
