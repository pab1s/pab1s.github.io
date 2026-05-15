/**
 * Neural Network Layer-by-Layer 3D Visualization
 * Trains a feedforward network (3→16→1) on interlocking 3D tori.
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
  const scale = fov / Math.max(z, 0.1);
  return { x: v.x * scale, y: v.y * scale, z, scale };
}

// ─── Data Generation: Interlocking 3D Tori ─────────────────────────────────

interface Point3D { x: number; y: number; z: number; label: number }

function generateInterlockingTori(n: number): Point3D[] {
  const data: Point3D[] = [];
  const half = Math.floor(n / 2);

  // Torus A: XY plane, tube around Z axis
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

  // Torus B: XZ plane, tube around Y axis
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
  // Architecture: 3 inputs → 16 hidden → 1 output
  nInput = 3;
  nHidden = 16;
  nOutput = 1;

  W1: number[][];  // 16 x 3
  b1: number[];    // 16
  W2: number[][];  // 1 x 16
  b2: number[];    // 1

  // Adam state
  mW1: number[][]; vW1: number[][];
  mb1: number[];   vb1: number[];
  mW2: number[][]; vW2: number[][];
  mb2: number[];   vb2: number[];

  // Activations
  z1: number[];
  a1: number[];
  z2: number[];
  a2: number[];

  lr = 0.01;
  beta1 = 0.9;
  beta2 = 0.999;
  eps = 1e-8;
  weightDecay = 0.001;
  t = 0; // timestep

  loss = 0;
  accuracy = 0;

  constructor() {
    // He initialization for ReLU
    const he = Math.sqrt(2 / this.nInput);
    this.W1 = Array.from({ length: this.nHidden }, () =>
      Array.from({ length: this.nInput }, () => (Math.random() - 0.5) * 2 * he)
    );
    this.b1 = Array(this.nHidden).fill(0);

    const he2 = Math.sqrt(2 / this.nHidden);
    this.W2 = Array.from({ length: this.nOutput }, () =>
      Array.from({ length: this.nHidden }, () => (Math.random() - 0.5) * 2 * he2)
    );
    this.b2 = Array(this.nOutput).fill(0);

    // Adam buffers
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
    // Hidden layer
    for (let i = 0; i < this.nHidden; i++) {
      this.z1[i] = this.W1[i][0] * x + this.W1[i][1] * y + this.W1[i][2] * z + this.b1[i];
      this.a1[i] = this.relu(this.z1[i]);
    }
    // Output layer
    this.z2[0] = this.b2[0];
    for (let i = 0; i < this.nHidden; i++) this.z2[0] += this.W2[0][i] * this.a1[i];
    this.a2[0] = this.sigmoid(this.z2[0]);
    return this.a2[0];
  }

  private adamUpdate(
    w: number, m: number, v: number, grad: number, lr: number, t: number
  ): [number, number, number] {
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

    // Accumulate gradients
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

      // Backprop
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

    // Cosine annealing LR
    const maxEpochs = 200;
    const progress = Math.min(this.t / maxEpochs, 1);
    const lr = this.lr * (0.5 + 0.5 * Math.cos(progress * Math.PI));

    // Adam update with weight decay
    for (let i = 0; i < this.nHidden; i++) {
      for (let j = 0; j < this.nInput; j++) {
        const grad = dW1[i][j] / n + this.weightDecay * this.W1[i][j];
        const [wNew, mNew, vNew] = this.adamUpdate(this.W1[i][j], this.mW1[i][j], this.vW1[i][j], grad, lr, this.t);
        this.W1[i][j] = wNew;
        this.mW1[i][j] = mNew;
        this.vW1[i][j] = vNew;
      }
      const gradB = db1[i] / n;
      const [bNew, mNew, vNew] = this.adamUpdate(this.b1[i], this.mb1[i], this.vb1[i], gradB, lr, this.t);
      this.b1[i] = bNew;
      this.mb1[i] = mNew;
      this.vb1[i] = vNew;
    }

    for (let i = 0; i < this.nOutput; i++) {
      for (let j = 0; j < this.nHidden; j++) {
        const grad = dW2[i][j] / n + this.weightDecay * this.W2[i][j];
        const [wNew, mNew, vNew] = this.adamUpdate(this.W2[i][j], this.mW2[i][j], this.vW2[i][j], grad, lr, this.t);
        this.W2[i][j] = wNew;
        this.mW2[i][j] = mNew;
        this.vW2[i][j] = vNew;
      }
      const gradB = db2[i] / n;
      const [bNew, mNew, vNew] = this.adamUpdate(this.b2[i], this.mb2[i], this.vb2[i], gradB, lr, this.t);
      this.b2[i] = bNew;
      this.mb2[i] = mNew;
      this.vb2[i] = vNew;
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
    class0: isDark ? "rgba(107, 142, 255, 0.95)" : "rgba(53, 83, 255, 0.92)",
    class1: isDark ? "rgba(255, 170, 90, 0.95)" : "rgba(220, 110, 50, 0.92)",
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

  // Phase cycling: 0=input, 1=hidden, 2=output
  const phaseDuration = 160;
  let phaseFrame = 0;
  let currentPhase = 0;
  const phaseNames = ["INPUT", "HIDDEN", "OUTPUT"];
  const phaseLabels = ["INPUT SPACE · R³", "HIDDEN LAYER · ReLU(W₁x + b₁)", "OUTPUT · σ(W₂h + b₂)"];

  // Data bounds (normalized)
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

  // Per-point positions
  const positions = data.map(() => ({
    input: { x: 0, y: 0, z: 0 },
    hidden: { x: 0, y: 0, z: 0 },
    output: { x: 0, y: 0, z: 0 },
  }));

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
        x: (p.x - centerX) / maxRange * 3.2,
        y: (p.y - centerY) / maxRange * 3.2,
        z: (p.z - centerZ) / maxRange * 3.2,
      };

      // Hidden: first 3 activations (from 16 total)
      predictions[i] = net.forward(p.x, p.y, p.z);
      positions[i].hidden = {
        x: net.a1[0] * 2.2,
        y: net.a1[1] * 2.2,
        z: net.a1[2] * 2.2,
      };

      // Output: separated by class confidence
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
    const cy = cssH * 0.40;
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

    // Sort by depth (back to front)
    projected.sort((a, b) => b.z - a.z);

    // Draw points
    for (const p of projected) {
      const size = Math.max(1.2, Math.min(2.8, p.scale * 0.12));

      let color: string;
      if (currentPhase === 2) {
        // Output phase: color by confidence
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

  function drawNetworkDiagram(bottomY: number, height: number) {
    const pad = 16;
    const availW = cssW - pad * 2;
    const cx = cssW / 2;
    const cy = bottomY + height / 2;

    // Show 3 → 16 → 1, but only label a subset of hidden neurons
    const layers = [
      { x: cx - availW * 0.32, nodes: 3, labels: ["x", "y", "z"] },
      { x: cx, nodes: 16, labels: Array.from({ length: 16 }, (_, i) => `h${i}`) },
      { x: cx + availW * 0.32, nodes: 1, labels: ["ŷ"] },
    ];

    const nodeR = Math.min(5, height * 0.055);
    const layerSpacing = Math.min(9, height * 0.11);
    const activeLayerIdx = currentPhase;

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
          else w = net.W2[0][j];
          const absW = Math.min(Math.abs(w) / 2.0, 1);

          ctx.beginPath();
          ctx.moveTo(fromLayer.x, fromYStart + i * layerSpacing);
          ctx.lineTo(toLayer.x, toYStart + j * layerSpacing);
          ctx.strokeStyle = isActive ? pal.networkLineActive : pal.networkLine;
          ctx.globalAlpha = isActive ? 0.12 + absW * 0.4 : 0.04 + absW * 0.06;
          ctx.lineWidth = isActive ? 0.6 + absW * 1.0 : 0.3;
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
        ctx.fillStyle = pal.nodeBg;
        ctx.fill();
        ctx.strokeStyle = isActive ? pal.networkLineActive : pal.nodeBorder;
        ctx.lineWidth = isActive ? 1.5 : 0.8;
        ctx.stroke();

        // Only label every other hidden neuron to avoid clutter
        if (l !== 1 || i % 2 === 0) {
          ctx.save();
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = `500 8px ui-monospace, monospace`;
          ctx.fillStyle = isActive ? pal.text : pal.textMuted;
          ctx.fillText(layer.labels[i], layer.x, ny + nodeR + 11);
          ctx.restore();
        }
      }
    }

    // Phase indicator dots
    ctx.save();
    ctx.font = `600 9px ui-monospace, monospace`;
    ctx.fillStyle = pal.networkLineActive;
    ctx.textAlign = "center";
    const indicatorY = bottomY + 10;
    const dotXStart = cx - 36;
    const dotSpacing = 36;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(dotXStart + i * dotSpacing, indicatorY, i === activeLayerIdx ? 3 : 2, 0, Math.PI * 2);
      ctx.fillStyle = i === activeLayerIdx ? pal.networkLineActive : pal.textMuted;
      ctx.globalAlpha = i === activeLayerIdx ? 1 : 0.35;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillText(phaseNames[activeLayerIdx], cx, indicatorY + 14);
    ctx.restore();

    // Metrics
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

    // Phase label
    ctx.save();
    ctx.font = `600 9px ui-monospace, monospace`;
    ctx.fillStyle = pal.textMuted;
    ctx.textAlign = "left";
    ctx.fillText(phaseLabels[currentPhase], 12, 18);
    ctx.restore();

    const phaseT = phaseFrame / phaseDuration;
    const smoothT = phaseT < 0.5
      ? 2 * phaseT * phaseT
      : 1 - Math.pow(-2 * phaseT + 2, 2) / 2;

    const cx = cssW / 2;
    const cy = cssH * 0.40;

    // Ground plane first (behind points)
    drawGroundPlane(cx, cy);

    // 3D scatter
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
        net.lr = 0.01;
        net.t = 0;
        // Re-init with He
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
        // Reset Adam
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
