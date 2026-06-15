/**
 * Neural Network Layer-by-Layer 3D Visualization
 * Trains a feedforward network (3→16→1) on interlocking 3D tori.
 * All UI overlays (metrics, mini schematic, phase dots) are drawn on the canvas.
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
  const scale = fov / Math.max(z, 0.1);
  return { x: v.x * scale, y: v.y * scale, z, scale };
}

// ─── Data Generation: Interlocking 3D Tori ─────────────────────────────────

interface Point3D { x: number; y: number; z: number; label: number }

function generateInterlockingTori(n: number): Point3D[] {
  const data: Point3D[] = [];
  const half = Math.floor(n / 2);

  for (let i = 0; i < half; i++) {
    const u = (Math.PI * 2 * i) / half + (Math.random() - 0.5) * 0.3;
    const v = Math.random() * Math.PI * 2;
    const R = 2.2, r = 0.55;
    const noise = 0.08;
    data.push({
      x: (R + r * Math.cos(v)) * Math.cos(u) + (Math.random() - 0.5) * noise,
      y: (R + r * Math.cos(v)) * Math.sin(u) + (Math.random() - 0.5) * noise,
      z: r * Math.sin(v) + (Math.random() - 0.5) * noise,
      label: 0,
    });
  }

  for (let i = 0; i < half; i++) {
    const u = (Math.PI * 2 * i) / half + (Math.random() - 0.5) * 0.3;
    const v = Math.random() * Math.PI * 2;
    const R = 2.2, r = 0.55;
    const noise = 0.08;
    data.push({
      x: (R + r * Math.cos(v)) * Math.cos(u) + (Math.random() - 0.5) * noise,
      y: r * Math.sin(v) + (Math.random() - 0.5) * noise,
      z: (R + r * Math.cos(v)) * Math.sin(u) + (Math.random() - 0.5) * noise,
      label: 1,
    });
  }

  return data;
}

// ─── Adam Neural Network (3 → 16 → 1) ──────────────────────────────────────

class NeuralNet3D {
  nInput = 3;
  nHidden = 16;
  nOutput = 1;

  W1: number[][];
  b1: number[];
  W2: number[][];
  b2: number[];

  mW1: number[][]; vW1: number[][];
  mb1: number[];   vb1: number[];
  mW2: number[][]; vW2: number[][];
  mb2: number[];   vb2: number[];

  z1: number[];
  a1: number[];
  z2: number[];
  a2: number[];

  lr = 0.01;
  beta1 = 0.9;
  beta2 = 0.999;
  eps = 1e-8;
  weightDecay = 0.001;
  t = 0;

  loss = 0;
  accuracy = 0;

  constructor() {
    const he = Math.sqrt(2 / this.nInput);
    const he2 = Math.sqrt(2 / this.nHidden);
    this.W1 = Array.from({ length: this.nHidden }, () =>
      Array.from({ length: this.nInput }, () => (Math.random() - 0.5) * 2 * he)
    );
    this.b1 = Array(this.nHidden).fill(0);
    this.W2 = Array.from({ length: this.nOutput }, () =>
      Array.from({ length: this.nHidden }, () => (Math.random() - 0.5) * 2 * he2)
    );
    this.b2 = Array(this.nOutput).fill(0);

    this.mW1 = Array.from({ length: this.nHidden }, () => Array(this.nInput).fill(0));
    this.vW1 = Array.from({ length: this.nHidden }, () => Array(this.nInput).fill(0));
    this.mb1 = Array(this.nHidden).fill(0);
    this.vb1 = Array(this.nHidden).fill(0);
    this.mW2 = Array.from({ length: this.nOutput }, () => Array(this.nHidden).fill(0));
    this.vW2 = Array.from({ length: this.nOutput }, () => Array(this.nHidden).fill(0));
    this.mb2 = Array(this.nOutput).fill(0);
    this.vb2 = Array(this.nOutput).fill(0);

    this.z1 = Array(this.nHidden).fill(0);
    this.a1 = Array(this.nHidden).fill(0);
    this.z2 = Array(this.nOutput).fill(0);
    this.a2 = Array(this.nOutput).fill(0);
  }

  relu(x: number): number { return Math.max(0, x); }
  reluDeriv(x: number): number { return x > 0 ? 1 : 0; }
  sigmoid(x: number): number {
    const z = Math.exp(-Math.max(-10, Math.min(10, x)));
    return 1 / (1 + z);
  }

  forward(x: number, y: number, z: number): number {
    for (let i = 0; i < this.nHidden; i++) {
      this.z1[i] = this.W1[i][0] * x + this.W1[i][1] * y + this.W1[i][2] * z + this.b1[i];
      this.a1[i] = this.relu(this.z1[i]);
    }
    this.z2[0] = this.b2[0];
    for (let i = 0; i < this.nHidden; i++) this.z2[0] += this.W2[0][i] * this.a1[i];
    this.a2[0] = this.sigmoid(this.z2[0]);
    return this.a2[0];
  }

  private adamUpdate(w: number, m: number, v: number, grad: number, lr: number, t: number): [number, number, number] {
    const mNew = this.beta1 * m + (1 - this.beta1) * grad;
    const vNew = this.beta2 * v + (1 - this.beta2) * grad * grad;
    const mHat = mNew / (1 - Math.pow(this.beta1, t));
    const vHat = vNew / (1 - Math.pow(this.beta2, t));
    const wNew = w - lr * (mHat / (Math.sqrt(vHat) + this.eps));
    return [wNew, mNew, vNew];
  }

  trainStep(data: Point3D[]): void {
    this.t++;
    this.loss = 0;
    let correct = 0;

    const dW1 = Array.from({ length: this.nHidden }, () => [0, 0, 0]);
    const db1 = Array(this.nHidden).fill(0);
    const dW2 = Array.from({ length: this.nOutput }, () => Array(this.nHidden).fill(0));
    const db2 = Array(this.nOutput).fill(0);

    for (const p of data) {
      const pred = this.forward(p.x, p.y, p.z);
      const target = p.label;
      const err = pred - target;

      if ((pred > 0.5 ? 1 : 0) === target) correct++;
      this.loss += -(target * Math.log(pred + 1e-8) + (1 - target) * Math.log(1 - pred + 1e-8));

      const dz2 = err;
      db2[0] += dz2;
      for (let i = 0; i < this.nHidden; i++) {
        dW2[0][i] += dz2 * this.a1[i];
        const dz1 = dz2 * this.W2[0][i] * this.reluDeriv(this.z1[i]);
        db1[i] += dz1;
        dW1[i][0] += dz1 * p.x;
        dW1[i][1] += dz1 * p.y;
        dW1[i][2] += dz1 * p.z;
      }
    }

    const n = data.length;
    this.loss /= n;
    this.accuracy = correct / n;

    const maxEpochs = 200;
    const progress = Math.min(this.t / maxEpochs, 1);
    const lr = this.lr * (0.5 + 0.5 * Math.cos(progress * Math.PI));

    for (let i = 0; i < this.nHidden; i++) {
      for (let j = 0; j < this.nInput; j++) {
        const grad = dW1[i][j] / n + this.weightDecay * this.W1[i][j];
        const [wNew, mNew, vNew] = this.adamUpdate(this.W1[i][j], this.mW1[i][j], this.vW1[i][j], grad, lr, this.t);
        this.W1[i][j] = wNew; this.mW1[i][j] = mNew; this.vW1[i][j] = vNew;
      }
      const [bNew, mNew, vNew] = this.adamUpdate(this.b1[i], this.mb1[i], this.vb1[i], db1[i] / n, lr, this.t);
      this.b1[i] = bNew; this.mb1[i] = mNew; this.vb1[i] = vNew;
    }

    for (let i = 0; i < this.nOutput; i++) {
      for (let j = 0; j < this.nHidden; j++) {
        const grad = dW2[i][j] / n + this.weightDecay * this.W2[i][j];
        const [wNew, mNew, vNew] = this.adamUpdate(this.W2[i][j], this.mW2[i][j], this.vW2[i][j], grad, lr, this.t);
        this.W2[i][j] = wNew; this.mW2[i][j] = mNew; this.vW2[i][j] = vNew;
      }
      const [bNew, mNew, vNew] = this.adamUpdate(this.b2[i], this.mb2[i], this.vb2[i], db2[i] / n, lr, this.t);
      this.b2[i] = bNew; this.mb2[i] = mNew; this.vb2[i] = vNew;
    }
  }
}

// ─── Palette ─────────────────────────────────────────────────────────────────

interface NNPalette {
  class0: string;
  class1: string;
  grid: string;
  text: string;
  textMuted: string;
  accent: string;
  nodeBg: string;
  nodeBorder: string;
  line: string;
}

function getPalette(): NNPalette {
  const cs = getComputedStyle(document.documentElement);
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const accent = cs.getPropertyValue("--accent").trim() || "#3553ff";
  const ink = cs.getPropertyValue("--ink").trim() || "#1a1a1a";
  const muted = cs.getPropertyValue("--ink-muted").trim() || "rgba(0,0,0,0.45)";
  const line = cs.getPropertyValue("--line").trim() || "rgba(0,0,0,0.10)";

  return {
    class0: isDark ? "rgba(107, 142, 255, 0.95)" : "rgba(53, 83, 255, 0.92)",
    class1: isDark ? "rgba(255, 170, 90, 0.95)" : "rgba(220, 110, 50, 0.92)",
    grid: line,
    text: ink,
    textMuted: muted,
    accent: accent,
    nodeBg: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
    nodeBorder: isDark ? "rgba(255,255,255,0.20)" : "rgba(0,0,0,0.15)",
    line: line,
  };
}

// ─── Main Visualization ──────────────────────────────────────────────────────

export function attachNeuralNetViz(canvas: HTMLCanvasElement): () => void {
  const parent = canvas.parentElement;
  const ctx = canvas.getContext("2d");
  if (!parent || !ctx) return () => {};

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let cssW = 720;
  let cssH = 450;

  const rawData = generateInterlockingTori(300);

  // Normalize inputs
  let meanX = 0, meanY = 0, meanZ = 0;
  let stdX = 0, stdY = 0, stdZ = 0;
  for (const p of rawData) {
    meanX += p.x; meanY += p.y; meanZ += p.z;
  }
  meanX /= rawData.length; meanY /= rawData.length; meanZ /= rawData.length;
  for (const p of rawData) {
    stdX += (p.x - meanX) ** 2; stdY += (p.y - meanY) ** 2; stdZ += (p.z - meanZ) ** 2;
  }
  stdX = Math.sqrt(stdX / rawData.length) || 1;
  stdY = Math.sqrt(stdY / rawData.length) || 1;
  stdZ = Math.sqrt(stdZ / rawData.length) || 1;

  const data: Point3D[] = rawData.map(p => ({
    x: (p.x - meanX) / stdX,
    y: (p.y - meanY) / stdY,
    z: (p.z - meanZ) / stdZ,
    label: p.label,
  }));

  const net = new NeuralNet3D();
  const predictions = new Float64Array(data.length);
  let epoch = 0;
  const maxEpochs = 200;
  let pausedFrames = 0;
  let converged = false;

  // 3D view state
  let rotY = 0;
  let rotX = 0.25;
  const fov = 240;
  const camDist = 7;

  // Phase cycling
  const phaseDuration = 160;
  let phaseFrame = 0;
  let currentPhase = 0;
  const phaseNames = ["INPUT", "HIDDEN", "OUTPUT"];
  const phaseLabels = ["INPUT SPACE · R³", "HIDDEN LAYER · ReLU(W₁x + b₁)", "OUTPUT · σ(W₂h + b₂)"];

  // Data bounds
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

  const positions = data.map(() => ({
    input: { x: 0, y: 0, z: 0 },
    hidden: { x: 0, y: 0, z: 0 },
    output: { x: 0, y: 0, z: 0 },
  }));

  let pal = getPalette();

  function resize() {
    const rect = parent.getBoundingClientRect();
    cssW = Math.max(240, rect.width);
    cssH = Math.max(150, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
  }

  function updatePositions() {
    for (let i = 0; i < data.length; i++) {
      const p = data[i];
      positions[i].input = {
        x: (p.x - centerX) / maxRange * 3.2,
        y: (p.y - centerY) / maxRange * 3.2,
        z: (p.z - centerZ) / maxRange * 3.2,
      };

      predictions[i] = net.forward(p.x, p.y, p.z);
      positions[i].hidden = {
        x: net.a1[0] * 2.2,
        y: net.a1[1] * 2.2,
        z: net.a1[2] * 2.2,
      };

      const conf = predictions[i];
      const isClass1 = conf > 0.5 ? 1 : 0;
      const separation = isClass1 ? 1.2 : -1.2;
      positions[i].output = {
        x: positions[i].input.x * 0.2,
        y: positions[i].input.y * 0.2,
        z: separation + (conf - 0.5) * 1.5,
      };
    }
  }

  function getInterpolatedPos(idx: number, phase: number, t: number): Vec3 {
    const p = positions[idx];
    const s = t;
    if (phase === 0) {
      return {
        x: p.input.x + (p.hidden.x - p.input.x) * s,
        y: p.input.y + (p.hidden.y - p.input.y) * s,
        z: p.input.z + (p.hidden.z - p.input.z) * s,
      };
    } else if (phase === 1) {
      return {
        x: p.hidden.x + (p.output.x - p.hidden.x) * s,
        y: p.hidden.y + (p.output.y - p.hidden.y) * s,
        z: p.hidden.z + (p.output.z - p.hidden.z) * s,
      };
    } else {
      return {
        x: p.output.x + (p.input.x - p.output.x) * s,
        y: p.output.y + (p.input.y - p.output.y) * s,
        z: p.output.z + (p.input.z - p.output.z) * s,
      };
    }
  }

  function drawGroundPlane(cx: number, cy: number) {
    const gridSize = 3.0;
    const steps = 6;
    ctx.save();
    ctx.strokeStyle = pal.grid;
    ctx.lineWidth = 0.4;
    ctx.globalAlpha = 0.5;

    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 2 - 1;
      const p1 = project3D(rotateX(rotateY({ x: t * gridSize, y: -gridSize, z: 0 }, rotY), rotX), fov, camDist);
      const p2 = project3D(rotateX(rotateY({ x: t * gridSize, y: gridSize, z: 0 }, rotY), rotX), fov, camDist);
      ctx.beginPath();
      ctx.moveTo(cx + p1.x, cy - p1.y);
      ctx.lineTo(cx + p2.x, cy - p2.y);
      ctx.stroke();

      const p3 = project3D(rotateX(rotateY({ x: -gridSize, y: t * gridSize, z: 0 }, rotY), rotX), fov, camDist);
      const p4 = project3D(rotateX(rotateY({ x: gridSize, y: t * gridSize, z: 0 }, rotY), rotX), fov, camDist);
      ctx.beginPath();
      ctx.moveTo(cx + p3.x, cy - p3.y);
      ctx.lineTo(cx + p4.x, cy - p4.y);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function draw3DScatter(phase: number, t: number) {
    const cx = cssW / 2;
    const cy = cssH * 0.52;
    const projected: Array<{ x: number; y: number; z: number; scale: number; idx: number; label: number }> = [];

    for (let i = 0; i < data.length; i++) {
      const pos = getInterpolatedPos(i, phase, t);
      const v = rotateX(rotateY(pos, rotY), rotX);
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

    projected.sort((a, b) => b.z - a.z);

    for (const p of projected) {
      const size = Math.max(1.2, Math.min(2.8, p.scale * 0.12));

      let color: string;
      if (currentPhase === 2) {
        const conf = data[p.idx].label === 0 ? 1 - predictions[p.idx] : predictions[p.idx];
        const base = data[p.idx].label === 0 ? pal.class0 : pal.class1;
        const match = base.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
          const alpha = Math.min(0.95, 0.5 + conf * 0.45);
          color = `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha})`;
        } else {
          color = base;
        }
      } else {
        color = data[p.idx].label === 0 ? pal.class0 : pal.class1;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }

    // Axes
    const axisLen = 1.8;
    const axes = [
      { dir: { x: axisLen, y: 0, z: 0 }, color: "rgba(200,80,80,0.7)" },
      { dir: { x: 0, y: axisLen, z: 0 }, color: "rgba(80,180,80,0.7)" },
      { dir: { x: 0, y: 0, z: axisLen }, color: "rgba(80,80,200,0.7)" },
    ];

    ctx.save();
    for (const axis of axes) {
      const end = rotateX(rotateY(axis.dir, rotY), rotX);
      const pr = project3D(end, fov, camDist);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + pr.x, cy - pr.y);
      ctx.strokeStyle = axis.color;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    ctx.restore();
  }

  // ─── Floating Overlays ────────────────────────────────────────────────────

  function drawTopLeftLabel() {
    ctx.save();
    ctx.font = `600 9px ui-monospace, monospace`;
    ctx.fillStyle = pal.textMuted;
    ctx.textAlign = "left";
    ctx.fillText(phaseLabels[currentPhase], 10, 16);
    ctx.restore();
  }

  function drawTopRightMetrics() {
    const padR = 10;
    const x = cssW - padR;
    const y = 12;
    const lh = 12;

    ctx.save();
    ctx.font = `600 9px ui-monospace, monospace`;
    ctx.textAlign = "right";
    ctx.textBaseline = "top";

    ctx.fillStyle = pal.textMuted;
    ctx.fillText(`EPOCH ${String(epoch).padStart(3, "0")}/${maxEpochs}`, x, y);

    ctx.fillStyle = pal.text;
    ctx.fillText(`LOSS ${net.loss.toFixed(3)}`, x, y + lh);

    ctx.fillStyle = net.accuracy > 0.88 ? pal.accent : pal.textMuted;
    ctx.fillText(`ACC ${(net.accuracy * 100).toFixed(0)}%`, x, y + lh * 2);

    ctx.restore();
  }

  function drawBottomLeftSchematic() {
    const sx = 10;
    const sy = cssH - 50;
    const w = 70;
    const h = 40;

    // Background panel
    ctx.save();
    ctx.fillStyle = pal.nodeBg;
    ctx.fillRect(sx, sy, w, h);
    ctx.strokeStyle = pal.line;
    ctx.lineWidth = 0.5;
    ctx.strokeRect(sx, sy, w, h);

    // Layer positions within the schematic
    const layers = [
      { x: sx + 8, nodes: 3 },
      { x: sx + w / 2, nodes: 16 },
      { x: sx + w - 8, nodes: 1 },
    ];
    const nodeR = 1.8;
    const spacing = 7;
    const cy = sy + h / 2;

    // Draw connections
    ctx.globalAlpha = 0.2;
    for (let l = 0; l < layers.length - 1; l++) {
      const fromY = cy - ((layers[l].nodes - 1) * spacing) / 2;
      const toY = cy - ((layers[l + 1].nodes - 1) * spacing) / 2;
      for (let i = 0; i < layers[l].nodes; i += 2) {
        for (let j = 0; j < layers[l + 1].nodes; j += 4) {
          ctx.beginPath();
          ctx.moveTo(layers[l].x, fromY + i * spacing);
          ctx.lineTo(layers[l + 1].x, toY + j * spacing);
          ctx.strokeStyle = pal.line;
          ctx.lineWidth = 0.4;
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;

    // Draw nodes
    for (let l = 0; l < layers.length; l++) {
      const isActive = l === currentPhase;
      const yStart = cy - ((layers[l].nodes - 1) * spacing) / 2;
      for (let i = 0; i < layers[l].nodes; i++) {
        ctx.beginPath();
        ctx.arc(layers[l].x, yStart + i * spacing, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? pal.accent : pal.nodeBorder;
        ctx.fill();
      }
    }

    // Labels
    ctx.font = `500 7px ui-monospace, monospace`;
    ctx.fillStyle = pal.textMuted;
    ctx.textAlign = "center";
    ctx.fillText("3 → 16 → 1", sx + w / 2, sy + h - 4);

    ctx.restore();
  }

  function drawBottomRightPhaseDots() {
    const cx = cssW - 30;
    const cy = cssH - 14;
    const dotSpacing = 10;

    ctx.save();
    ctx.font = `600 8px ui-monospace, monospace`;
    ctx.fillStyle = pal.accent;
    ctx.textAlign = "center";
    ctx.fillText(phaseNames[currentPhase], cx, cy - 6);

    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(cx - dotSpacing + i * dotSpacing, cy, i === currentPhase ? 2.5 : 1.5, 0, Math.PI * 2);
      ctx.fillStyle = i === currentPhase ? pal.accent : pal.textMuted;
      ctx.globalAlpha = i === currentPhase ? 1 : 0.4;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function render() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    pal = getPalette();

    const cx = cssW / 2;
    const cy = cssH * 0.52;

    drawGroundPlane(cx, cy);
    draw3DScatter(currentPhase, smoothT());

    // Floating overlays
    drawTopLeftLabel();
    drawTopRightMetrics();
    drawBottomLeftSchematic();
    drawBottomRightPhaseDots();
  }

  function smoothT(): number {
    const t = phaseFrame / phaseDuration;
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  let rafId = 0;

  function tick() {
    if (converged) {
      pausedFrames++;
      if (pausedFrames > 90) {
        epoch = 0;
        converged = false;
        pausedFrames = 0;
        net.lr = 0.01;
        net.t = 0;
        const he = Math.sqrt(2 / net.nInput);
        const he2 = Math.sqrt(2 / net.nHidden);
        net.W1 = Array.from({ length: net.nHidden }, () =>
          Array.from({ length: net.nInput }, () => (Math.random() - 0.5) * 2 * he)
        );
        net.b1 = Array(net.nHidden).fill(0);
        net.W2 = Array.from({ length: net.nOutput }, () =>
          Array.from({ length: net.nHidden }, () => (Math.random() - 0.5) * 2 * he2)
        );
        net.b2 = Array(net.nOutput).fill(0);
        net.mW1 = Array.from({ length: net.nHidden }, () => Array(net.nInput).fill(0));
        net.vW1 = Array.from({ length: net.nHidden }, () => Array(net.nInput).fill(0));
        net.mb1 = Array(net.nHidden).fill(0);
        net.vb1 = Array(net.nHidden).fill(0);
        net.mW2 = Array.from({ length: net.nOutput }, () => Array(net.nHidden).fill(0));
        net.vW2 = Array.from({ length: net.nOutput }, () => Array(net.nHidden).fill(0));
        net.mb2 = Array(net.nOutput).fill(0);
        net.vb2 = Array(net.nOutput).fill(0);
        currentPhase = 0;
        phaseFrame = 0;
      }
    } else {
      const stepsPerFrame = 3;
      for (let i = 0; i < stepsPerFrame && epoch < maxEpochs; i++) {
        net.trainStep(data);
        epoch++;
      }
      if (epoch >= maxEpochs || net.accuracy > 0.98) {
        converged = true;
        pausedFrames = 0;
      }
    }

    rotY += 0.006;
    rotX = 0.25 + Math.sin(rotY * 0.4) * 0.12;

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
