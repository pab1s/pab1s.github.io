# Cyber-Cosmic Observatory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the blog into a "Cyber-Cosmic Observatory" with space/physics aesthetics and interactive AI-themed features.

**Architecture:** Use PaperMod's extended CSS/JS injection points. Implement a modular `lab.js` for interactivity and CSS variables for the theme overhaul.

**Tech Stack:** Hugo, Vanilla CSS, Vanilla JS.

---

### Task 1: Foundation & Branching

**Files:**
- Create: `docs/superpowers/plans/2026-04-14-cyber-cosmic-overhaul.md` (Self-reference)

- [ ] **Step 1: Create a new branch**
Run: `git checkout -b feature/cyber-cosmic-overhaul`

- [ ] **Step 2: Commit initial plan and spec**
Run: `git add docs/superpowers/ && git commit -m "docs: add cyber-cosmic observatory spec and plan"`

---

### Task 2: Core "Midnight Alchemist" Palette

**Files:**
- Modify: `assets/css/extended/theme-vars.css`
- Create: `assets/css/extended/cosmic.css`

- [ ] **Step 1: Update CSS Variables**
Update `assets/css/extended/theme-vars.css`:
```css
:root {
    --primary: #00f5ff;
    --secondary: #00d4ff;
    --tertiary: #161b22;
    --content: #c9d1d9;
    --theme: #0d1117;
    --entry: #161b22;
    --border: #30363d;
    --radius: 4px;
    --main-font: "IBM Plex Mono", monospace;
    --code-font: "IBM Plex Mono", monospace;
    --accent-glow: 0 0 10px rgba(0, 245, 255, 0.2);
}
```

- [ ] **Step 2: Add Blueprint & Starfield Base**
Create `assets/css/extended/cosmic.css`:
```css
body {
    background-color: var(--theme);
    background-image: 
        radial-gradient(circle at 50% 50%, rgba(0, 245, 255, 0.03) 0%, transparent 80%),
        linear-gradient(rgba(48, 54, 61, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(48, 54, 61, 0.1) 1px, transparent 1px);
    background-size: 100% 100%, 40px 40px, 40px 40px;
}

/* Star pixels */
.star-pixel {
    position: fixed;
    width: 1px;
    height: 1px;
    background: #fff;
    opacity: 0.5;
    pointer-events: none;
    z-index: -1;
}
```

- [ ] **Step 3: Commit**
Run: `git add assets/css/extended/ && git commit -m "style: implement midnight alchemist palette and cosmic base"`

---

### Task 3: Cyber-Interference & Glitch Aesthetics

**Files:**
- Create: `assets/css/extended/cyber.css`

- [ ] **Step 1: Implement Scanlines and Glitch**
Create `assets/css/extended/cyber.css`:
```css
.scanlines::before {
    content: "";
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%),
                linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03));
    background-size: 100% 2px, 3px 100%;
    pointer-events: none;
    z-index: 9999;
}

@keyframes glitch {
    0% { transform: translate(0); }
    20% { transform: translate(-2px, 2px); }
    40% { transform: translate(-2px, -2px); }
    60% { transform: translate(2px, 2px); }
    80% { transform: translate(2px, -2px); }
    100% { transform: translate(0); }
}

.glitch:hover {
    animation: glitch 0.3s cubic-bezier(.25,.46,.45,.94) both infinite;
    color: var(--primary);
}
```

- [ ] **Step 2: Commit**
Run: `git add assets/css/extended/cyber.css && git commit -m "style: add cyber interference and glitch effects"`

---

### Task 4: Lab Interactivity (Telemetry & Interactivity)

**Files:**
- Create: `assets/js/lab.js`
- Modify: `layouts/partials/extend_head.html`

- [ ] **Step 1: Create Lab JS**
Create `assets/js/lab.js`:
```javascript
document.addEventListener('DOMContentLoaded', () => {
    // Star generator
    const stars = 50;
    for (let i = 0; i < stars; i++) {
        let star = document.createElement('div');
        star.className = 'star-pixel';
        star.style.top = Math.random() * 100 + 'vh';
        star.style.left = Math.random() * 100 + 'vw';
        star.style.animation = `pulse ${Math.random() * 3 + 2}s infinite`;
        document.body.appendChild(star);
    }

    // Telemetry Ticker
    const ticker = document.createElement('div');
    ticker.id = 'telemetry-ticker';
    ticker.style = "position:fixed;bottom:0;width:100%;background:rgba(13,17,23,0.9);border-top:1px solid #30363d;color:#00f5ff;font-size:10px;padding:2px 10px;font-family:monospace;z-index:1000;";
    ticker.innerHTML = "[NEURAL_LINK: ACTIVE] [ORBITAL_SLOT: 72A] [SYSTEM_STATUS: NOMINAL]";
    document.body.appendChild(ticker);
});
```

- [ ] **Step 2: Inject JS and Scanlines**
Modify `layouts/partials/extend_head.html`:
```html
<script src="{{ "js/lab.js" | relURL }}" defer></script>
<div class="scanlines"></div>
```

- [ ] **Step 3: Commit**
Run: `git add assets/js/lab.js layouts/partials/extend_head.html && git commit -m "feat: add lab interactivity and telemetry ticker"`

---

### Task 5: Physics Features (Gravitational Lens & Coordinates)

**Files:**
- Modify: `assets/css/extended/cosmic.css`
- Modify: `layouts/_default/single.html`

- [ ] **Step 1: Add Gravitational Hover**
Update `assets/css/extended/cosmic.css`:
```css
.entry-card:hover {
    transform: scale(1.02);
    box-shadow: 0 0 20px rgba(0, 245, 255, 0.15);
    border-color: var(--primary);
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

- [ ] **Step 2: Add Stellar Coordinates to Posts**
Modify `layouts/_default/single.html` to display a random or data-driven coordinate.
```html
<div class="stellar-coords" style="font-size: 10px; color: #8b949e; margin-bottom: 10px;">
    [COORDS: DEC +{{ .Date.Format "02" }}.{{ .Date.Format "01" }} RA {{ .Date.Format "15" }}h {{ .Date.Format "04" }}m]
</div>
```

- [ ] **Step 3: Commit**
Run: `git add . && git commit -m "feat: implement gravitational lens and stellar coordinates"`
