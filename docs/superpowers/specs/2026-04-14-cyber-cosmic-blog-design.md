# Design Spec: Cyber-Cosmic Observatory Transformation

**Date:** 2026-04-14
**Status:** Approved
**Project:** pab1s.github.io

## 1. Overview
Transform the personal blog into a "Cyber-Cosmic Observatory"—a fusion of high-frontier physics/space exploration with a gritty, AI-driven cyberpunk aesthetic. This builds upon the "Data Alchemist" research foundation.

## 2. Visual Identity: "Quantum Cyber"
### 2.1 Colors & Background
- **Palette:** Deep blacks (`#0d1117`), cyan accents (`#00f5ff`), and "Neon Pulse" highlights.
- **Cosmic Horizon:** Subtle deep-space gradient with drifting "star-pixels" (CSS/JS animation).
- **Digital Interference:** Subtle scan-line overlay and occasional tiny CSS-glitch effects on headers.

### 2.2 Typography
- **Primary:** IBM Plex Mono for all text.
- **Aesthetic:** Dramatic weight scaling (Massive Bold vs. Tiny Light).

## 3. Playable Features
### 3.1 Neural Link Search (Command Palette)
- **Trigger:** `Ctrl + K`.
- **Look:** Terminal interface with "decoding" animations for search results.

### 3.2 Physics-Inspired UI
- **Gravitational Lens:** Magnetic hover effects and distortions for homepage cards and avatar.
- **Stellar Coordinates:** Each post gets a procedurally generated coordinate (e.g., `DEC: +14.2 RA: 05h`).

### 3.3 AI Integration
- **Decryptor Summary:** Post summaries animate into view as if being decrypted by an AI.
- **Telemetry Ticker:** A scrolling ticker showing "Live Lab Data" (e.g., `NEURAL_LINK: ACTIVE`).

## 4. Technical Implementation
- **Theme:** PaperMod (Hugo).
- **CSS:** Custom overrides in `assets/css/extended/`.
- **JS:** Vanilla JS in `assets/js/lab.js`.
