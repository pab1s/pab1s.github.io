/**
 * Neural Network Layer-by-Layer 3D Visualization
 * Trains a feedforward network (3→8→1) on interlocking 3D tori.
 * Cycles through Input → Hidden → Output layers with smooth morphing.
 */

// ─── 3D Math ───────────────────────────────────────────────────────────────

interface Vec3 { x: number; y: number; z: number }

function rotateY(v: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle), s = Math.sin(angle);
  return { x: v.x * c - v.z * s, y: v.y, z: v.x * s + v.z * c };
}

function rotateX(v: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle), s = Math.sin(angle);
  return { x: v.x, y: v.y * c - v.z * s, z: v.y * s + v.z * c };
}

function project3D(v: Vec3, fov: number, distance: number): { x: number; y: number; z: number; scale: number } {
  const z = v.z + distance;
  const scale = fov / z;
  return { x: v.x * scale, y: v.y * scale, z, scale };
}

// ─── Data Generation: Interlocking 3D Tori ─────────────────────────────────

interface Point3D { x: number; y: number; z: number; label: number }

function generateInterlockingTori(n: number): Point3D[] {
  const data: Point3D[] = [];
  const half = Math.floor(n / 2);

  // Torus A: lying in XY plane, major radius R=2, minor r=0.5
  for (let i = 0; i < half; i++) {
    const u = (Math.PI * 2 * i) / half + (Math.random() - 0.5) * 0.3;
    const v = Math.random() * Math.PI * 2;
    const R = 2.0, r = 0.5;
    const noise = 0.15;
    data.push({
      x: (R + r * Math.cos(v)) * Math.cos(u) + (Math.random() - 0.5) * noise,
      y: (R + r * Math.cos(v)) * Math.sin(u) + (Math.random() - 0.5) * noise,
      z: r * Math.sin(v) + (Math.random() - 0.5) * noise,
      label: 0,
    });
  }

  // Torus B: lying in XZ plane (rotated 90° around X), same R, shifted
  // This creates interlocking/overlapping regions
  for (let i = 0; i < half; i++) {
    const u = (Math.PI * 2 * i) / half + (Math.random() - 0.5) * 0.3;
    const v = Math.random() * Math.PI * 2;
    const R = 2.0, r = 0.5;
    const noise = 0.15;
    // Rotated: x stays, y becomes z, z becomes y (with sign flip)
    const tx = (R + r * Math.cos(v)) * Math.cos(u);
    const ty = r * Math.sin(v);
    const tz = (R + r * Math.cos(v)) * Math.sin(u);
    data.push({
      x: tx + (Math.random() - 0.5) * noise + 0.3, // slight offset to increase overlap
      y: tz + (Math.random() - 0.5) * noise,
      z: ty + (Math.random() - 0.5) * noise,
      label: 1,
    });
  }

  return data;
}

// ─── Neural Network (3 → 8 → 1) ────────────────────────────────────────────

class NeuralNet3D {
  W1: number[][]; // 8 x 3
  b1: number[];   // 8
  W2: number[];   // 8
  b2: number;

  z1: number[] = Array(8).fill(0);
  a1: number[] = Array(8).fill(0);
  z2: number = 0;
  a2: number = 0;

  lr = 0.2;
  loss = 0;
  accuracy = 0;

  constructor() {
    // Xavier init
    const sqrt6_3 = Math.sqrt(6 / 3);
    const sqrt6_8 = Math.sqrt(6 / 8);
    this.W1 = Array.from({ length: 8 }, () => [
      (Math.random() - 0.5) * sqrt6_3,
      (Math.random() - 0.5) * sqrt6_3,
      (Math.random() - 0.5) * sqrt6_3,
    ]);
    this.b1 = Array(8).fill(0);
    this.W2 = Array.from({ length: 8 }, () => (Math.random() - 0.5) * sqrt6_8);
    this.b2 = 0;
  }

  tanh(x: number): number { return Math.tanh(x); }
  sigmoid(x: number): number { return 1 / (1 + Math.exp(-Math.max(-10, Math.min(10, x)))); }

  forward(x: number, y: number, z: number): number {
    for (let i = 0; i < 8; i++) {
      this.z1[i] = this.W1[i][0] * x + this.W1[i][1] * y + this.W1[i][2] * z + this.b1[i];
      this.a1[i] = this.tanh(this.z1[i]);
    }
    this.z2 = 0;
    for (let i = 0; i < 8; i++) this.z2 += this.W2[i] * this.a1[i];
    this.z2 += this.b2;
    this.a2 = this.sigmoid(this.z2);
    return this.a2;
  }

  trainStep(data: Point3D[]): void {
    this.loss = 0;
    let correct = 0;

    const dW1 = Array.from({ length: 8 }, () => [0, 0, 0]);
    const db1 = Array(8).fill(0);
    const dW2 = Array(8).fill(0);
    let db2 = 0;

    for (const p of data) {
      const pred = this.forward(p.x, p.y, p.z);
      const target = p.label;
      const err = pred - target;

      if ((pred > 0.5 ? 1 : 0) === target) correct++;
      this.loss += -(target * Math.log(pred + 1e-8) + (1 - target) * Math.log(1 - pred + 1e-8));

      const dz2 = err;
      db2 += dz2;
      for (let i = 0; i < 8; i++) {
        dW2[i] += dz2 * this.a1[i];
        const dz1 = dz2 * this.W2[i] * (1 - this.a1[i] * this.a1[i]);
        db1[i] += dz1;
        dW1[i][0] += dz1 * p.x;
        dW1[i][1] += dz1 * p.y;
        dW1[i][2] += dz1 * p.z;
      }
    }

    const n = data.length;
    this.loss /= n;
    this.accuracy = correct / n;

    for (let i = 0; i < 8; i++) {
      this.W1[i][0] -= this.lr * (dW1[i][0] / n);
      this.W1[i][1] -= this.lr * (dW1[i][1] / n);
      this.W1[i][2] -= this.lr * (dW1[i][2] / n);
      this.b1[i] -= this.lr * (db1[i] / n);
      this.W2[i] -= this.lr * (dW2[i] / n);
    }
    this.b2 -= this.lr * (db2 / n);
  }
}

// ─── Palette ─────────────────────────────────────────────────────────────────

interface NNPalette {
  class0: string;
  class1: string;
  class0Glow: string;
  class1Glow: string;
  boundary: string;
  grid: string;
  text: string;
  textMuted: string;
  networkLine: string;
  networkLineActive: string;
  nodeBg: string;
  nodeBorder: string;
}

function getPalette(): NNPalette {
  const cs = getComputedStyle(document.documentElement);
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const accent = cs.getPropertyValue("--accent").trim() || "#3553ff";
  const ink = cs.getPropertyValue("--ink").trim() || "#1a1a1a";
  const muted = cs.getPropertyValue("--muted").trim() || "rgba(0,0,0,0.45)";
  const line = cs.getPropertyValue("--line").trim() || "rgba(0,0,0,0.10)";

  return {
    class0: isDark ? "rgba(107, 142, 255, 0.85)" : "rgba(53, 83, 255, 0.80)",
    class1: isDark ? "rgba(255, 170, 90, 0.85)" : "rgba(210, 110, 50, 0.80)",
    class0Glow: isDark ? "rgba(107, 142, 255, 0.3)" : "rgba(53, 83, 255, 0.25)",
    class1Glow: isDark ? "rgba(255, 170, 90, 0.3)" : "rgba(210, 110, 50, 0.25)",
    boundary: line,
    grid: line,
    text: ink,
    textMuted: muted,
    networkLine: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)",
    networkLineActive: accent,
    nodeBg: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
    nodeBorder: isDark ? "rgba(255,255,255,0.20)" : "rgba(0,0,0,0.15)",
  };
}

// ─── Main Visualization ──────────────────────────────────────────────────────

export function attachNeuralNetViz(canvas: HTMLCanvasElement): () => void {
  const parent = canvas.parentElement;
  const ctx = canvas.getContext("2d");
  if (!parent || !ctx) return () => {};

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let cssW = 720;
  let cssH = 720;

  const data = generateInterlockingTori(320);
  const net = new NeuralNet3D();
  let epoch = 0;
  const maxEpochs = 150;
  let pausedFrames = 0;
  let converged = false;

  // 3D view state
  let rotY = 0;
  let rotX = 0.3; // slight tilt
  const fov = 300;
  const camDist = 8;

  // Phase cycling: 0=input, 1=hidden, 2=output
  const phaseDuration = 180; // frames at 60fps ≈ 3s
  let phaseFrame = 0;
  let currentPhase = 0; // 0, 1, 2
  const phaseNames = ["INPUT", "HIDDEN", "OUTPUT"];
  const phaseLabels = ["INPUT SPACE · R³", "HIDDEN LAYER · φ(x)", "OUTPUT · σ(W₂h + b₂)"];

  // Pre-compute coordinate ranges
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const p of data) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
    if (p.z < minZ) minZ = p.z;
    if (p.z > maxZ) maxZ = p.z;
  }
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const centerZ = (minZ + maxZ) / 2;
  const maxRange = Math.max(maxX - minX, maxY - minY, maxZ - minZ);

  // Store per-point positions for smooth morphing
  const positions = data.map(() => ({ input: { x: 0, y: 0, z: 0 }, hidden: { x: 0, y: 0, z: 0 }, output: { x: 0, y: 0, z: 0 } }));

  let pal = getPalette();

  function resize() {
    const rect = parent.getBoundingClientRect();
    cssW = Math.max(240, rect.width);
    cssH = Math.max(240, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
  }

  function updatePositions() {
    for (let i = 0; i < data.length; i++) {
      const p = data[i];
      // Input: normalized centered coordinates
      positions[i].input = {
        x: (p.x - centerX) / maxRange * 3.5,
        y: (p.y - centerY) / maxRange * 3.5,
        z: (p.z - centerZ) / maxRange * 3.5,
      };

      // Hidden: first 3 activations
      net.forward(p.x, p.y, p.z);
      positions[i].hidden = {
        x: net.a1[0] * 2.5,
        y: net.a1[1] * 2.5,
        z: net.a1[2] * 2.5,
      };

      // Output: prediction confidence mapped to Z, x/y from input for continuity
      const conf = net.a2;
      const isClass1 = conf > 0.5 ? 1 : 0;
      const separation = isClass1 ? 1.5 : -1.5;
      positions[i].output = {
        x: positions[i].input.x * 0.3,
        y: positions[i].input.y * 0.3,
        z: separation + (conf - 0.5) * 2,
      };
    }
  }

  function getInterpolatedPos(idx: number, phase: number, t: number): Vec3 {
    // t: 0..1 interpolation factor between phases
    const p = positions[idx];
    if (phase === 0) {
      // input → hidden
      return {
        x: p.input.x + (p.hidden.x - p.input.x) * t,
        y: p.input.y + (p.hidden.y - p.input.y) * t,
        z: p.input.z + (p.hidden.z - p.input.z) * t,
      };
    } else if (phase === 1) {
      // hidden → output
      return {
        x: p.hidden.x + (p.output.x - p.hidden.x) * t,
        y: p.hidden.y + (p.output.y - p.hidden.y) * t,
        z: p.hidden.z + (p.output.z - p.hidden.z) * t,
      };
    } else {
      // output → input (wrap around)
      return {
        x: p.output.x + (p.input.x - p.output.x) * t,
        y: p.output.y + (p.input.y - p.output.y) * t,
        z: p.output.z + (p.input.z - p.output.z) * t,
      };
    }
  }

  function draw3DScatter(phase: number, t: number) {
    const cx = cssW / 2;
    const cy = cssH * 0.42;
    const projected: Array<{ x: number; y: number; z: number; scale: number; idx: number; label: number }> = [];

    for (let i = 0; i < data.length; i++) {
      const pos = getInterpolatedPos(i, phase, t);
      // Apply rotation
      let v = rotateY(pos, rotY);
      v = rotateX(v, rotX);
      const pr = project3D(v, fov, camDist);
      projected.push({
        x: cx + pr.x,
        y: cy - pr.y,
        z: pr.z,
        scale: pr.scale,
        idx: i,
        label: data[i].label,
      });
    }

    // Sort by depth (back to front)
    projected.sort((a, b) => b.z - a.z);

    // Draw points
    for (const p of projected) {
      const pred = net.a2; // last computed prediction for this point
      const size = Math.max(2, 4 * p.scale);

      let color: string;
      let glow: string;

      if (currentPhase === 2) {
        // Output phase: color by confidence
        const conf = data[p.idx].label === 0 ? 1 - pred : pred;
        const baseColor = data[p.idx].label === 0 ? pal.class0 : pal.class1;
        // Parse rgba and adjust alpha by confidence
        const match = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
          const r = match[1], g = match[2], b = match[3];
          const alpha = Math.min(0.85, 0.3 + conf * 0.7);
          color = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          glow = `rgba(${r}, ${g}, ${b}, ${alpha * 0.3})`;
        } else {
          color = baseColor;
          glow = data[p.idx].label === 0 ? pal.class0Glow : pal.class1Glow;
        }
      } else {
        color = data[p.idx].label === 0 ? pal.class0 : pal.class1;
        glow = data[p.idx].label === 0 ? pal.class0Glow : pal.class1Glow;
      }

      // Glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, size * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }

    // Draw axes
    const axisLen = 2.0;
    const axes = [
      { dir: { x: axisLen, y: 0, z: 0 }, color: "rgba(255,80,80,0.6)", label: "x" },
      { dir: { x: 0, y: axisLen, z: 0 }, color: "rgba(80,255,80,0.6)", label: "y" },
      { dir: { x: 0, y: 0, z: axisLen }, color: "rgba(80,80,255,0.6)", label: "z" },
    ];

    ctx.save();
    for (const axis of axes) {
      let end = rotateY(axis.dir, rotY);
      end = rotateX(end, rotX);
      const pr = project3D(end, fov, camDist);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + pr.x, cy - pr.y);
      ctx.strokeStyle = axis.color;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawNetworkDiagram(bottomY: number, height: number) {
    const pad = 16;
    const availW = cssW - pad * 2;
    const cx = cssW / 2;
    const cy = bottomY + height / 2;

    const layers = [
      { x: cx - availW * 0.32, nodes: 3, labels: ["x", "y", "z"] },
      { x: cx, nodes: 8, labels: ["h₀", "h₁", "h₂", "h₃", "h₄", "h₅", "h₆", "h₇"] },
      { x: cx + availW * 0.32, nodes: 1, labels: ["ŷ"] },
    ];

    const nodeR = Math.min(7, height * 0.08);
    const layerSpacing = Math.min(14, height * 0.18);

    // Highlight active layer
    const activeLayerIdx = currentPhase === 0 ? 0 : currentPhase === 1 ? 1 : 2;

    // Connections
    ctx.save();
    for (let l = 0; l < layers.length - 1; l++) {
      const fromLayer = layers[l];
      const toLayer = layers[l + 1];
      const isActive = l === activeLayerIdx || l + 1 === activeLayerIdx;
      const fromYStart = cy - ((fromLayer.nodes - 1) * layerSpacing) / 2;
      const toYStart = cy - ((toLayer.nodes - 1) * layerSpacing) / 2;

      for (let i = 0; i < fromLayer.nodes; i++) {
        for (let j = 0; j < toLayer.nodes; j++) {
          let w = 0;
          if (l === 0) w = net.W1[j][i];
          else w = net.W2[j];
          const absW = Math.abs(w);
          const maxW = 2.0;
          const alpha = Math.min(absW / maxW, 1);

          ctx.beginPath();
          ctx.moveTo(fromLayer.x, fromYStart + i * layerSpacing);
          ctx.lineTo(toLayer.x, toYStart + j * layerSpacing);
          ctx.strokeStyle = isActive ? pal.networkLineActive : pal.networkLine;
          ctx.globalAlpha = isActive ? 0.25 + alpha * 0.55 : 0.08 + alpha * 0.12;
          ctx.lineWidth = isActive ? 0.8 + alpha * 1.5 : 0.5;
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // Nodes
    for (let l = 0; l < layers.length; l++) {
      const layer = layers[l];
      const isActive = l === activeLayerIdx;
      const yStart = cy - ((layer.nodes - 1) * layerSpacing) / 2;
      for (let i = 0; i < layer.nodes; i++) {
        const ny = yStart + i * layerSpacing;
        ctx.beginPath();
        ctx.arc(layer.x, ny, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? pal.nodeBg : pal.nodeBg;
        ctx.fill();
        ctx.strokeStyle = isActive ? pal.networkLineActive : pal.nodeBorder;
        ctx.lineWidth = isActive ? 1.5 : 0.8;
        ctx.stroke();

        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `500 9px ui-monospace, monospace`;
        ctx.fillStyle = isActive ? pal.text : pal.textMuted;
        ctx.fillText(layer.labels[i], layer.x, ny + nodeR + 12);
        ctx.restore();
      }
    }

    // Phase indicator above diagram
    ctx.save();
    ctx.font = `600 9px ui-monospace, monospace`;
    ctx.fillStyle = pal.networkLineActive;
    ctx.textAlign = "center";
    const indicatorY = bottomY + 10;
    // Draw connecting dots
    const dotXStart = cx - 40;
    const dotSpacing = 40;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(dotXStart + i * dotSpacing, indicatorY, i === activeLayerIdx ? 3 : 2, 0, Math.PI * 2);
      ctx.fillStyle = i === activeLayerIdx ? pal.networkLineActive : pal.textMuted;
      ctx.globalAlpha = i === activeLayerIdx ? 1 : 0.4;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillText(phaseNames[activeLayerIdx], cx, indicatorY + 14);
    ctx.restore();

    // Metrics on right
    ctx.save();
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.font = `600 9px ui-monospace, monospace`;
    const metricsX = cssW - pad;
    const metricsY = cy;
    ctx.fillStyle = pal.textMuted;
    ctx.fillText(`EPOCH ${String(epoch).padStart(3, "0")} / ${maxEpochs}`, metricsX, metricsY - 12);
    ctx.fillStyle = pal.text;
    ctx.fillText(`LOSS ${net.loss.toFixed(3)}`, metricsX, metricsY);
    ctx.fillStyle = net.accuracy > 0.88 ? pal.networkLineActive : pal.textMuted;
    ctx.fillText(`ACC ${(net.accuracy * 100).toFixed(0)}%`, metricsX, metricsY + 12);
    ctx.restore();
  }

  function render() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    pal = getPalette();

    const topH = cssH * 0.68;
    const bottomH = cssH - topH;

    // Label for current phase
    ctx.save();
    ctx.font = `600 9px ui-monospace, monospace`;
    ctx.fillStyle = pal.textMuted;
    ctx.textAlign = "left";
    ctx.fillText(phaseLabels[currentPhase], 12, 18);
    ctx.restore();

    // Compute interpolation factor within current phase
    const phaseT = phaseFrame / phaseDuration;
    const smoothT = phaseT < 0.5 ? 2 * phaseT * phaseT : 1 - Math.pow(-2 * phaseT + 2, 2) / 2; // easeInOutQuad

    // Draw 3D scatter
    draw3DScatter(currentPhase, smoothT);

    // Separator
    ctx.save();
    ctx.strokeStyle = pal.grid;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(10, topH);
    ctx.lineTo(cssW - 10, topH);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Network diagram
    drawNetworkDiagram(topH + 6, bottomH - 6);
  }

  let rafId = 0;

  function tick() {
    if (converged) {
      pausedFrames++;
      if (pausedFrames > 90) {
        epoch = 0;
        converged = false;
        pausedFrames = 0;
        net.lr = 0.2;
        // Re-init
        const sqrt6_3 = Math.sqrt(6 / 3);
        const sqrt6_8 = Math.sqrt(6 / 8);
        net.W1 = Array.from({ length: 8 }, () => [
          (Math.random() - 0.5) * sqrt6_3,
          (Math.random() - 0.5) * sqrt6_3,
          (Math.random() - 0.5) * sqrt6_3,
        ]);
        net.b1 = Array(8).fill(0);
        net.W2 = Array.from({ length: 8 }, () => (Math.random() - 0.5) * sqrt6_8);
        net.b2 = 0;
        currentPhase = 0;
        phaseFrame = 0;
      }
    } else {
      const stepsPerFrame = 4;
      for (let i = 0; i < stepsPerFrame && epoch < maxEpochs; i++) {
        net.trainStep(data);
        epoch++;
        if (epoch > 80) net.lr = 0.1;
        if (epoch > 120) net.lr = 0.05;
      }
      if (epoch >= maxEpochs || net.accuracy > 0.96) {
        converged = true;
        pausedFrames = 0;
      }
    }

    // Update rotation
    rotY += 0.008;
    rotX = 0.3 + Math.sin(rotY * 0.5) * 0.15; // gentle wobble

    // Update phase
    phaseFrame++;
    if (phaseFrame >= phaseDuration) {
      phaseFrame = 0;
      currentPhase = (currentPhase + 1) % 3;
    }

    updatePositions();
    render();
    rafId = requestAnimationFrame(tick);
  }

  resize();

  const ro = new ResizeObserver(resize);
  ro.observe(parent);

  function onThemeChange() {
    pal = getPalette();
  }
  document.addEventListener("site-theme", onThemeChange);

  rafId = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(rafId);
    ro.disconnect();
    document.removeEventListener("site-theme", onThemeChange);
  };
}
