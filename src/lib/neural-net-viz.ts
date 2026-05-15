/**
 * Neural Network Manifold Unfolding Visualization
 * Trains a feedforward network (2→4→1) on overlapping concentric circles.
 * Shows input space (left) and hidden layer topology (right) as they evolve.
 */

// ─── Data Generation ─────────────────────────────────────────────────────────

type Point2D = { x: number; y: number; label: number };

function generateDonutData(n: number, innerR: number, outerR: number, noise: number): Point2D[] {
  const data: Point2D[] = [];
  const half = Math.floor(n / 2);
  for (let i = 0; i < half; i++) {
    const angle = (Math.PI * 2 * i) / half + Math.random() * 0.1;
    const r = innerR + (Math.random() - 0.5) * noise;
    data.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r, label: 0 });
  }
  for (let i = 0; i < half; i++) {
    const angle = (Math.PI * 2 * i) / half + Math.random() * 0.1;
    const r = outerR + (Math.random() - 0.5) * noise;
    data.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r, label: 1 });
  }
  // Add extra overlap: some outer points closer, some inner points farther
  for (let i = 0; i < n / 8; i++) {
    const angle = Math.random() * Math.PI * 2;
    data[Math.floor(Math.random() * half)].x = Math.cos(angle) * (innerR + 0.3 + Math.random() * 0.4);
    data[Math.floor(Math.random() * half)].y = Math.sin(angle) * (innerR + 0.3 + Math.random() * 0.4);
  }
  return data;
}

// ─── Neural Network (2 → 4 → 1) ────────────────────────────────────────────

class NeuralNet {
  // Weights
  W1: number[][]; // 4x2 (hidden x input)
  b1: number[];   // 4
  W2: number[];   // 4 (output x hidden)
  b2: number;     // 1

  // Activations & pre-activations (stored for visualization)
  z1: number[] = [0, 0, 0, 0];
  a1: number[] = [0, 0, 0, 0];
  z2: number = 0;
  a2: number = 0;

  // Gradients
  dW1: number[][];
  db1: number[];
  dW2: number[];
  db2: number = 0;

  lr = 0.15;
  loss = 0;
  accuracy = 0;

  constructor() {
    // Xavier init
    this.W1 = Array.from({ length: 4 }, () => [
      (Math.random() - 0.5) * Math.sqrt(2 / 2),
      (Math.random() - 0.5) * Math.sqrt(2 / 2),
    ]);
    this.b1 = [0, 0, 0, 0];
    this.W2 = Array.from({ length: 4 }, () => (Math.random() - 0.5) * Math.sqrt(2 / 4));
    this.b2 = 0;
    this.dW1 = Array.from({ length: 4 }, () => [0, 0]);
    this.db1 = [0, 0, 0, 0];
    this.dW2 = [0, 0, 0, 0];
  }

  tanh(x: number): number {
    return Math.tanh(x);
  }

  sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  forward(x: number, y: number): number {
    // Hidden layer
    for (let i = 0; i < 4; i++) {
      this.z1[i] = this.W1[i][0] * x + this.W1[i][1] * y + this.b1[i];
      this.a1[i] = this.tanh(this.z1[i]);
    }
    // Output layer
    this.z2 = 0;
    for (let i = 0; i < 4; i++) {
      this.z2 += this.W2[i] * this.a1[i];
    }
    this.z2 += this.b2;
    this.a2 = this.sigmoid(this.z2);
    return this.a2;
  }

  trainStep(data: Point2D[]): void {
    this.loss = 0;
    let correct = 0;

    // Zero gradients
    for (let i = 0; i < 4; i++) {
      this.dW1[i][0] = 0;
      this.dW1[i][1] = 0;
      this.db1[i] = 0;
      this.dW2[i] = 0;
    }
    this.db2 = 0;

    for (const p of data) {
      const pred = this.forward(p.x, p.y);
      const target = p.label;
      const err = pred - target;

      if ((pred > 0.5 ? 1 : 0) === target) correct++;
      this.loss += -(target * Math.log(pred + 1e-8) + (1 - target) * Math.log(1 - pred + 1e-8));

      // Backprop
      const dz2 = err;
      this.db2 += dz2;
      for (let i = 0; i < 4; i++) {
        this.dW2[i] += dz2 * this.a1[i];
        const dz1 = dz2 * this.W2[i] * (1 - this.a1[i] * this.a1[i]); // tanh derivative
        this.db1[i] += dz1;
        this.dW1[i][0] += dz1 * p.x;
        this.dW1[i][1] += dz1 * p.y;
      }
    }

    const n = data.length;
    this.loss /= n;
    this.accuracy = correct / n;

    // Update weights
    for (let i = 0; i < 4; i++) {
      this.W1[i][0] -= this.lr * (this.dW1[i][0] / n);
      this.W1[i][1] -= this.lr * (this.dW1[i][1] / n);
      this.b1[i] -= this.lr * (this.db1[i] / n);
      this.W2[i] -= this.lr * (this.dW2[i] / n);
    }
    this.b2 -= this.lr * (this.db2 / n);
  }
}

// ─── Palette ───────────────────────────────────────────────────────────────

interface NNPalette {
  class0: string;
  class1: string;
  boundary: string;
  boundaryActive: string;
  grid: string;
  text: string;
  textMuted: string;
  networkLine: string;
  networkLineActive: string;
  bgAlpha: number;
}

function getPalette(): NNPalette {
  const cs = getComputedStyle(document.documentElement);
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const accent = cs.getPropertyValue("--accent").trim() || "#3553ff";
  const ink = cs.getPropertyValue("--ink").trim() || "#1a1a1a";
  const muted = cs.getPropertyValue("--muted").trim() || "rgba(0,0,0,0.45)";
  const line = cs.getPropertyValue("--line").trim() || "rgba(0,0,0,0.10)";

  return {
    class0: isDark ? "rgba(107, 142, 255, 0.75)" : "rgba(53, 83, 255, 0.70)",
    class1: isDark ? "rgba(255, 160, 80, 0.75)" : "rgba(200, 100, 50, 0.70)",
    boundary: line,
    boundaryActive: accent,
    grid: line,
    text: ink,
    textMuted: muted,
    networkLine: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)",
    networkLineActive: accent,
    bgAlpha: 0.02,
  };
}

// ─── Canvas Renderer ────────────────────────────────────────────────────────

export function attachNeuralNetViz(canvas: HTMLCanvasElement): () => void {
  const parent = canvas.parentElement;
  const ctx = canvas.getContext("2d");
  if (!parent || !ctx) return () => {};

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let cssW = 720;
  let cssH = 720;

  const data = generateDonutData(400, 1.2, 2.2, 0.35);
  const net = new NeuralNet();
  let epoch = 0;
  const maxEpochs = 120;
  let pausedFrames = 0;
  let converged = false;

  // Pre-compute data bounds for consistent scaling
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of data) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  const dataRange = Math.max(maxX - minX, maxY - minY);
  const pad = dataRange * 0.15;
  const viewMinX = minX - pad;
  const viewMaxX = maxX + pad;
  const viewMinY = minY - pad;
  const viewMaxY = maxY + pad;

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

  function worldToCanvas(wx: number, wy: number, cx0: number, cy0: number, cSize: number) {
    const normX = (wx - viewMinX) / (viewMaxX - viewMinX);
    const normY = (wy - viewMinY) / (viewMaxY - viewMinY);
    return {
      x: cx0 + normX * cSize,
      y: cy0 + (1 - normY) * cSize,
    };
  }

  function drawGrid(cx0: number, cy0: number, cSize: number) {
    ctx.save();
    ctx.strokeStyle = pal.grid;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 4]);
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = cx0 + t * cSize;
      const y = cy0 + t * cSize;
      ctx.beginPath();
      ctx.moveTo(x, cy0);
      ctx.lineTo(x, cy0 + cSize);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx0, y);
      ctx.lineTo(cx0 + cSize, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();
  }

  function drawDecisionBoundary(cx0: number, cy0: number, cSize: number) {
    // Sample grid and draw contour where prediction = 0.5
    const res = 40;
    ctx.save();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = net.accuracy > 0.88 ? pal.boundaryActive : pal.boundary;
    ctx.setLineDash(net.accuracy > 0.88 ? [] : [3, 4]);

    for (let i = 0; i < res; i++) {
      for (let j = 0; j < res; j++) {
        const wx1 = viewMinX + (i / res) * (viewMaxX - viewMinX);
        const wy1 = viewMinY + (j / res) * (viewMaxY - viewMinY);
        const wx2 = viewMinX + ((i + 1) / res) * (viewMaxX - viewMinX);
        const wy2 = viewMinY + ((j + 1) / res) * (viewMaxY - viewMinY);

        const p1 = net.forward(wx1, wy1);
        const p2 = net.forward(wx2, wy1);
        const p3 = net.forward(wx1, wy2);

        // Draw cell if boundary passes through
        if ((p1 - 0.5) * (p2 - 0.5) < 0 || (p1 - 0.5) * (p3 - 0.5) < 0) {
          const c1 = worldToCanvas(wx1, wy1, cx0, cy0, cSize);
          const c2 = worldToCanvas(wx2, wy2, cx0, cy0, cSize);
          ctx.fillStyle = pal.boundaryActive;
          ctx.globalAlpha = 0.08;
          ctx.fillRect(c1.x, c1.y, c2.x - c1.x, c2.y - c1.y);
          ctx.globalAlpha = 1;
        }
      }
    }
    ctx.setLineDash([]);
    ctx.restore();
  }

  function drawHiddenSpace(cx0: number, cy0: number, cSize: number) {
    // Compute hidden activations for all data points
    const hiddenPoints: { x: number; y: number; label: number }[] = [];
    let hMinX = Infinity, hMaxX = -Infinity, hMinY = Infinity, hMaxY = -Infinity;

    for (const p of data) {
      net.forward(p.x, p.y);
      const hx = net.a1[0];
      const hy = net.a1[1];
      hiddenPoints.push({ x: hx, y: hy, label: p.label });
      if (hx < hMinX) hMinX = hx;
      if (hx > hMaxX) hMaxX = hx;
      if (hy < hMinY) hMinY = hy;
      if (hy > hMaxY) hMaxY = hy;
    }

    const hPad = 0.2;
    const hRange = Math.max(hMaxX - hMinX, hMaxY - hMinY);
    const hVMnX = hMinX - hPad;
    const hVMxX = hMaxX + hPad;
    const hVMnY = hMinY - hPad;
    const hVMxY = hMaxY + hPad;

    // Grid
    ctx.save();
    ctx.strokeStyle = pal.grid;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 4]);
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = cx0 + t * cSize;
      const y = cy0 + t * cSize;
      ctx.beginPath();
      ctx.moveTo(x, cy0);
      ctx.lineTo(x, cy0 + cSize);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx0, y);
      ctx.lineTo(cx0 + cSize, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();

    // Decision boundary in hidden space (line where W2·h + b2 = 0)
    // W2[0]*h0 + W2[1]*h1 + W2[2]*h2 + W2[3]*h3 + b2 = 0
    // We can only plot h0 vs h1, so we fix h2=h3=0 for visualization
    // h1 = -(W2[0]*h0 + b2) / W2[1]  (assuming W2[1] != 0)
    if (Math.abs(net.W2[1]) > 0.01) {
      ctx.save();
      ctx.strokeStyle = net.accuracy > 0.88 ? pal.boundaryActive : pal.boundary;
      ctx.lineWidth = 2;
      ctx.setLineDash(net.accuracy > 0.88 ? [] : [4, 4]);
      ctx.beginPath();
      const h0Start = hVMnX;
      const h0End = hVMxX;
      const h1Start = -(net.W2[0] * h0Start + net.b2) / net.W2[1];
      const h1End = -(net.W2[0] * h0End + net.b2) / net.W2[1];

      const normX1 = (h0Start - hVMnX) / (hVMxX - hVMnX);
      const normY1 = 1 - (h1Start - hVMnY) / (hVMxY - hVMnY);
      const normX2 = (h0End - hVMnX) / (hVMxX - hVMnX);
      const normY2 = 1 - (h1End - hVMnY) / (hVMxY - hVMnY);

      ctx.moveTo(cx0 + normX1 * cSize, cy0 + normY1 * cSize);
      ctx.lineTo(cx0 + normX2 * cSize, cy0 + normY2 * cSize);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Points
    for (const hp of hiddenPoints) {
      const normX = (hp.x - hVMnX) / (hVMxX - hVMnX);
      const normY = 1 - (hp.y - hVMnY) / (hVMxY - hVMnY);
      const cx = cx0 + normX * cSize;
      const cy = cy0 + normY * cSize;
      ctx.beginPath();
      ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = hp.label === 0 ? pal.class0 : pal.class1;
      ctx.fill();
    }
  }

  function drawNetworkDiagram(bottomY: number, height: number) {
    const pad = 20;
    const availW = cssW - pad * 2;
    const cx = cssW / 2;
    const cy = bottomY + height / 2;

    // Layer positions
    const layers = [
      { x: cx - availW * 0.35, nodes: 2, labels: ["x", "y"] },
      { x: cx, nodes: 4, labels: ["h₀", "h₁", "h₂", "h₃"] },
      { x: cx + availW * 0.35, nodes: 1, labels: ["ŷ"] },
    ];

    const nodeR = Math.min(10, height * 0.12);
    const layerSpacing = height * 0.25;

    // Draw connections first (behind nodes)
    ctx.save();
    for (let l = 0; l < layers.length - 1; l++) {
      const fromLayer = layers[l];
      const toLayer = layers[l + 1];
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
          const lw = 0.5 + alpha * 2;

          ctx.beginPath();
          ctx.moveTo(fromLayer.x, fromYStart + i * layerSpacing);
          ctx.lineTo(toLayer.x, toYStart + j * layerSpacing);
          ctx.strokeStyle = alpha > 0.3 ? pal.networkLineActive : pal.networkLine;
          ctx.globalAlpha = 0.3 + alpha * 0.7;
          ctx.lineWidth = lw;
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // Draw nodes
    for (const layer of layers) {
      const yStart = cy - ((layer.nodes - 1) * layerSpacing) / 2;
      for (let i = 0; i < layer.nodes; i++) {
        const ny = yStart + i * layerSpacing;
        ctx.beginPath();
        ctx.arc(layer.x, ny, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = pal.bgAlpha < 0.5 ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)";
        ctx.fill();
        ctx.strokeStyle = pal.text;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Label
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `500 11px ui-monospace, monospace`;
        ctx.fillStyle = pal.text;
        ctx.fillText(layer.labels[i], layer.x, ny + nodeR + 14);
        ctx.restore();
      }
    }

    // Metrics
    ctx.save();
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.font = `600 10px ui-monospace, monospace`;
    const metricsX = cssW - pad;
    const metricsY = bottomY + height / 2;
    ctx.fillStyle = pal.textMuted;
    ctx.fillText(`EPOCH ${String(epoch).padStart(3, "0")} / ${maxEpochs}`, metricsX, metricsY - 14);
    ctx.fillStyle = pal.text;
    ctx.fillText(`LOSS ${net.loss.toFixed(3)}`, metricsX, metricsY);
    ctx.fillStyle = net.accuracy > 0.88 ? pal.boundaryActive : pal.textMuted;
    ctx.fillText(`ACC ${(net.accuracy * 100).toFixed(0)}%`, metricsX, metricsY + 14);
    ctx.restore();
  }

  function render() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    pal = getPalette();

    const pad = 16;
    const topH = cssH * 0.72;
    const bottomH = cssH - topH;
    const panelW = (cssW - pad * 3) / 2;

    // ── Input Space (left) ──
    const inputX = pad;
    const inputY = pad;
    const plotSize = Math.min(panelW, topH - pad * 2);

    // Panel bg
    ctx.fillStyle = pal.textMuted;
    ctx.globalAlpha = pal.bgAlpha;
    ctx.fillRect(inputX, inputY, plotSize, plotSize);
    ctx.globalAlpha = 1;

    drawGrid(inputX, inputY, plotSize);
    drawDecisionBoundary(inputX, inputY, plotSize);

    // Data points
    for (const p of data) {
      const c = worldToCanvas(p.x, p.y, inputX, inputY, plotSize);
      ctx.beginPath();
      ctx.arc(c.x, c.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = p.label === 0 ? pal.class0 : pal.class1;
      ctx.fill();
    }

    // Label
    ctx.save();
    ctx.font = `600 9px ui-monospace, monospace`;
    ctx.fillStyle = pal.textMuted;
    ctx.textAlign = "left";
    ctx.fillText("INPUT SPACE · R²", inputX, inputY - 6);
    ctx.restore();

    // ── Hidden Layer (right) ──
    const hiddenX = inputX + plotSize + pad;
    const hiddenY = inputY;

    ctx.fillStyle = pal.textMuted;
    ctx.globalAlpha = pal.bgAlpha;
    ctx.fillRect(hiddenX, hiddenY, plotSize, plotSize);
    ctx.globalAlpha = 1;

    drawHiddenSpace(hiddenX, hiddenY, plotSize);

    ctx.save();
    ctx.font = `600 9px ui-monospace, monospace`;
    ctx.fillStyle = pal.textMuted;
    ctx.textAlign = "left";
    ctx.fillText("HIDDEN LAYER · tanh(W₁x + b₁)", hiddenX, hiddenY - 6);
    ctx.restore();

    // Separator line between top panels and bottom
    ctx.save();
    ctx.strokeStyle = pal.grid;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(pad, topH);
    ctx.lineTo(cssW - pad, topH);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // ── Network Diagram (bottom) ──
    drawNetworkDiagram(topH + 8, bottomH - 8);
  }

  let rafId = 0;

  function tick() {
    if (converged) {
      pausedFrames++;
      if (pausedFrames > 120) {
        // Reset
        epoch = 0;
        converged = false;
        pausedFrames = 0;
        net.lr = 0.15;
        // Re-init weights
        net.W1 = Array.from({ length: 4 }, () => [
          (Math.random() - 0.5) * Math.sqrt(2 / 2),
          (Math.random() - 0.5) * Math.sqrt(2 / 2),
        ]);
        net.b1 = [0, 0, 0, 0];
        net.W2 = Array.from({ length: 4 }, () => (Math.random() - 0.5) * Math.sqrt(2 / 4));
        net.b2 = 0;
      }
    } else {
      const stepsPerFrame = 5;
      for (let i = 0; i < stepsPerFrame && epoch < maxEpochs; i++) {
        net.trainStep(data);
        epoch++;
        // Learning rate decay
        if (epoch > 60) net.lr = 0.08;
        if (epoch > 90) net.lr = 0.04;
      }
      if (epoch >= maxEpochs || net.accuracy > 0.95) {
        converged = true;
        pausedFrames = 0;
      }
    }

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
