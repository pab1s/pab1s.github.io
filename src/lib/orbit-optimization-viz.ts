/**
 * Órbita visual 2D sobre plano: cuerpo central fijo, aceleración a ∝ −r/|r|³ (ley inversa al cuadrado),
 * integrada con Euler semiimplícito en pocos subpasos por frame. El plano se escala y se rota en pantalla
 * alrededor del foco; la física sigue en coordenadas canónicas.
 */

import type { OrbitEvalSnapshot } from "./orbit-fitness-eval";
import { decodeOrbitTheta, evalOrbitFitness, sampleOrbitPath } from "./orbit-fitness-eval";
import { OrbitCMAES } from "./orbit-cma-es";

function clamp(x: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, x));
}

function accel(mu: number, rx: number, ry: number, ε2: number) {
  const d = rx * rx + ry * ry + ε2;
  const k = -mu / (d * Math.sqrt(d));
  return { ax: k * rx, ay: k * ry };
}

export function attachOrbitOptimization(canvas: HTMLCanvasElement): () => void {
  const parent = canvas.parentElement;
  const ctx = canvas.getContext("2d");
  if (!parent || !ctx) return () => {};

  const coordsRoot = parent.querySelector<HTMLElement>("[data-orbit-coords]");
  const coordsSatEl = coordsRoot?.querySelector<HTMLElement>(".orbit-hub-coords-sat");
  const coordsPtrEl = coordsRoot?.querySelector<HTMLElement>(".orbit-hub-coords-ptr");

  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  let cx = 0;
  let cy = 0;
  let rxGuide = 140;
  let ryGuide = 52;
  let planetR = 48;
  let geomCssW = 720;

  let mu = 1;
  let a = 120;
  let e = 0.5;
  let softEps2 = 0.06 * 0.06;
  const sub = 4;
  let dt = 0.006;

  /** Tras cada reset(), física nominal (CMA modula µ, Δt, suavizado, ε²). */
  let muNom = 1;
  let dtNom = 0.006;
  let softEpsNom = softEps2;
  /** Suavizado de |v| vs velMul decode (órbita continua cuando θ cambia). */
  let velScaleSmooth = 1;
  let velScalePrev = 1;

  let snapshot: OrbitEvalSnapshot | null = null;
  const cmaEs = new OrbitCMAES(4, { sigma0: 0.36 });
  const displayTheta = new Float64Array(4);

  let rx = 1;
  let ry = 0;
  let vx = 0;
  let vy = 1;

  let rafId = 0;
  const trail: { x: number; y: number }[] = [];
  const trailCap = 220;

  /** Arcos órbita para cada θ de la última generación (orden fitness). */
  type RankPath = { rank: number; pts: { rx: number; ry: number }[] };
  let cmaRankPaths: RankPath[] = [];
  let cmaMeanPath: { rx: number; ry: number }[] = [];

  type OrbitPal = {
    guide: string;
    trail: string;
    trailAlpha: number;
    planetFill: string;
    planetStroke: string;
    planetCross: string;
    satFill: string;
    satStroke: string;
    satCross: string;
  };

  let pal: OrbitPal = {
    guide: "rgba(255,255,255,0.09)",
    trail: "rgba(110,195,255,0.55)",
    trailAlpha: 0.42,
    planetFill: "rgba(20,46,102,0.92)",
    planetStroke: "rgba(120,180,218,0.28)",
    planetCross: "rgba(180,220,248,0.12)",
    satFill: "rgba(246,250,255,0.94)",
    satStroke: "rgba(118,196,255,0.42)",
    satCross: "rgba(148,210,255,0.5)",
  };

  function refreshPalette() {
    const cs = getComputedStyle(document.documentElement);
    const s = (k: string, fb: string) => cs.getPropertyValue(k).trim() || fb;
    const alpha = Number.parseFloat(cs.getPropertyValue("--orbit-trail-alpha").trim());
    pal = {
      guide: s("--orbit-guide", pal.guide),
      trail: s("--orbit-trail", pal.trail),
      trailAlpha: Number.isFinite(alpha) ? alpha : pal.trailAlpha,
      planetFill: s("--orbit-planet-fill", pal.planetFill),
      planetStroke: s("--orbit-planet-stroke", pal.planetStroke),
      planetCross: s("--orbit-planet-cross", pal.planetCross),
      satFill: s("--orbit-sat-fill", pal.satFill),
      satStroke: s("--orbit-sat-stroke", pal.satStroke),
      satCross: s("--orbit-sat-cross", pal.satCross),
    };
  }

  function reset() {
    const ar = ryGuide / Math.max(rxGuide, 1e-6);
    e = clamp(Math.sqrt(Math.max(0, 1 - ar * ar)), 0.28, 0.74);
    const rpF = planetR + 28;
    const raC = Math.min(rxGuide * 0.98, geomCssW * 0.56);
    let lo = rpF / (1 - e);
    let hi = raC / (1 + e);
    if (hi <= lo + 8) {
      e = clamp(e * 0.82, 0.14, e);
      lo = rpF / (1 - e);
      hi = raC / (1 + e);
    }
    a = hi > lo + 2 ? clamp(0.5 * (lo + hi), lo + 1, hi - 1) : lo + 14;

    const T = 22;
    mu = (4 * Math.PI * Math.PI * a * a * a) / (T * T);

    const rp = a * (1 - e);
    rx = rp;
    ry = 0;
    const v = Math.sqrt(mu * ((1 + e) / (a * (1 - e))));
    vx = 0;
    vy = -v;

    dt = clamp(T / (280 * sub), 0.0012, 0.012);

    muNom = mu;
    dtNom = dt;
    softEpsNom = softEps2;
    velScaleSmooth = decodeOrbitTheta(displayTheta).velMul;
    velScalePrev = velScaleSmooth;

    snapshot = {
      mu: muNom,
      a,
      e,
      rx0: rx,
      ry0: ry,
      vx0: vx,
      vy0: vy,
      dt: dtNom,
      planetR,
      ε2: softEpsNom,
      sub,
      rEscape: Math.max(rxGuide, ryGuide) * 3.55,
    };

    trail.length = 0;
    cmaRankPaths = [];
    cmaMeanPath = [];
  }

  function rebuildCmaPaths() {
    if (!snapshot) {
      cmaRankPaths = [];
      cmaMeanPath = [];
      return;
    }
    const d = cmaEs.lastDiag;
    if (!d || d.ranked.length === 0) {
      cmaRankPaths = [];
      cmaMeanPath = [];
      return;
    }
    const maxSteps = 780;
    const every = 2;
    cmaRankPaths = d.ranked.map((row, rank) => ({
      rank,
      pts: sampleOrbitPath(snapshot, row.x, maxSteps, every),
    }));
    cmaMeanPath = sampleOrbitPath(snapshot, cmaEs.m, maxSteps, every);
  }

  function hueForRank(rank: number, total: number): number {
    if (total <= 1) return 125;
    const u = rank / (total - 1);
    return (1 - u) * 128 + u * 16;
  }

  /**
   * Mismo marco que la elipse/planeta/sonda: física rx, ry + transformación vista.
   */
  function drawCmaPopulationArcs() {
    const λ = cmaRankPaths.length;
    if (λ === 0 && cmaMeanPath.length < 2) return;

    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    if (cmaMeanPath.length >= 2) {
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 1.35;
      ctx.strokeStyle = "rgba(110, 220, 255, 0.52)";
      ctx.beginPath();
      const p0 = cmaMeanPath[0];
      ctx.moveTo(cx + p0.rx, cy + p0.ry);
      for (let i = 1; i < cmaMeanPath.length; i++) {
        const p = cmaMeanPath[i];
        ctx.lineTo(cx + p.rx, cy + p.ry);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    for (let j = λ - 1; j >= 0; j--) {
      const layer = cmaRankPaths[j];
      if (layer.pts.length < 2) continue;
      const h = hueForRank(layer.rank, λ);
      const alpha = layer.rank === 0 ? 0.42 : 0.14 + 0.2 * Math.max(0, 1 - layer.rank / Math.max(1, λ - 1));
      const lw = layer.rank === 0 ? 1.85 : Math.max(0.72, 1.45 - layer.rank * 0.07);
      ctx.lineWidth = lw;
      ctx.strokeStyle = `hsla(${h.toFixed(1)},76%,54%,${alpha})`;
      ctx.beginPath();
      ctx.moveTo(cx + layer.pts[0].rx, cy + layer.pts[0].ry);
      for (let i = 1; i < layer.pts.length; i++) {
        const p = layer.pts[i];
        ctx.lineTo(cx + p.rx, cy + p.ry);
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  /** Texto fuera del plano oblicuo (pixels CSS). */
  function drawCmaScreenLegend(cssW: number, cssH: number) {
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.textAlign = "left";
    const x0 = 10;
    const y0 = cssH - 46;
    const mono = '600 9px ui-monospace, SFMono-Regular, "Cascadia Code", monospace';
    ctx.font = mono;
    ctx.fillStyle = "rgba(200,215,228,0.88)";
    const bf =
      cmaEs.bestF < 1e5 && Number.isFinite(cmaEs.bestF)
        ? cmaEs.bestF.toPrecision(4)
        : "pen.";
    ctx.fillText(`CMA‑ES · gen ${cmaEs.gen} · σ ${cmaEs.sigma.toPrecision(4)} · best f ${bf}`, x0, y0);
    ctx.font = '500 8px ui-monospace, SFMono-Regular, "Cascadia Code", monospace';
    ctx.fillStyle = "rgba(148,172,188,0.78)";
    ctx.fillText(`Arcos: λ hipótesis (rank) colores peor→mejor · punteado: media m · trazo claro: órbita en vivo`, x0, y0 + 12);
    ctx.restore();
  }

  /** Inclinación del plano orbital en pantalla (rad); la simulación sigue en ejes canónicos. */
  const viewTiltRad = (-41 * Math.PI) / 180;

  function evolveOneCmaGeneration() {
    if (!snapshot) return;
    const pop = cmaEs.ask();
    const fits = pop.map((p) => evalOrbitFitness(snapshot, p));
    cmaEs.tell(fits);
    rebuildCmaPaths();
  }

  function geom() {
    const rect = parent.getBoundingClientRect();
    const cssW = Math.max(240, rect.width);
    const cssH = Math.max(240, rect.height);
    geomCssW = cssW;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;

    cx = cssW / 2;
    cy = cssH / 2 + cssH * 0.018;
    const base = Math.min(cssW, cssH);
    rxGuide = base * 0.565;
    ryGuide = base * 0.158;
    planetR = base * 0.158;
    reset();
    refreshPalette();
  }

  function step() {
    const d = decodeOrbitTheta(displayTheta);
    const muS = muNom * d.muMul;
    const epsS = softEpsNom * d.epsMul;
    const dtS = clamp(dtNom * d.dtMul, 0.00095, 0.028);

    velScaleSmooth += 0.06 * (d.velMul - velScaleSmooth);
    const vs = velScaleSmooth / velScalePrev;
    velScalePrev = velScaleSmooth;
    vx *= vs;
    vy *= vs;

    for (let _ = 0; _ < sub; _++) {
      const { ax, ay } = accel(muS, rx, ry, epsS);
      vx += ax * dtS;
      vy += ay * dtS;
      rx += vx * dtS;
      ry += vy * dtS;
    }
  }

  function drawGuideEllipse() {
    ctx.save();
    ctx.setLineDash([4, 12]);
    ctx.lineWidth = 1.15;
    ctx.strokeStyle = pal.guide;
    ctx.beginPath();
    const p = a * (1 - e * e);
    for (let k = 0; k <= 96; k++) {
      const ν = (k / 96) * Math.PI * 2;
      const rad = p / (1 + e * Math.cos(ν));
      const x = cx + rad * Math.cos(ν);
      const y = cy + rad * Math.sin(ν);
      if (k === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  function drawPlanet() {
    ctx.beginPath();
    ctx.arc(cx, cy, planetR, 0, Math.PI * 2);
    ctx.fillStyle = pal.planetFill;
    ctx.fill();
    ctx.strokeStyle = pal.planetStroke;
    ctx.lineWidth = 1.05;
    ctx.stroke();

    ctx.save();
    ctx.strokeStyle = pal.planetCross;
    ctx.lineWidth = 1;
    const g = planetR + Math.max(20, planetR * 0.38);
    ctx.beginPath();
    ctx.moveTo(cx - g, cy);
    ctx.lineTo(cx + g, cy);
    ctx.moveTo(cx, cy - g * 0.88);
    ctx.lineTo(cx, cy + g * 0.88);
    ctx.stroke();
    ctx.restore();
  }

  function drawTrail() {
    const n = trail.length;
    if (n < 2) return;
    ctx.save();
    ctx.globalAlpha = pal.trailAlpha;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = pal.trail;
    ctx.lineWidth = 1.35;
    ctx.beginPath();
    ctx.moveTo(trail[0].x, trail[0].y);
    for (let i = 1; i < n; i++) ctx.lineTo(trail[i].x, trail[i].y);
    ctx.stroke();
    ctx.restore();
  }

  function drawSatellite(sx: number, sy: number) {
    const rSat = Math.max(3.1, planetR * 0.102);
    const t = rSat + 4.25;

    ctx.save();
    ctx.fillStyle = pal.satFill;
    ctx.strokeStyle = pal.satStroke;
    ctx.lineWidth = 1.05;
    ctx.beginPath();
    ctx.arc(sx, sy, rSat, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = pal.satCross;
    ctx.beginPath();
    ctx.moveTo(sx - t, sy);
    ctx.lineTo(sx - rSat * 0.45, sy);
    ctx.moveTo(sx + t, sy);
    ctx.lineTo(sx + rSat * 0.45, sy);
    ctx.moveTo(sx, sy - t);
    ctx.lineTo(sx, sy - rSat * 0.45);
    ctx.moveTo(sx, sy + t);
    ctx.lineTo(sx, sy + rSat * 0.45);
    ctx.stroke();
    ctx.restore();
  }

  function tick() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const α = 0.095;
    for (let i = 0; i < 4; i++) displayTheta[i] += α * (cmaEs.bestX[i] - displayTheta[i]);

    step();

    const r = Math.hypot(rx, ry);
    if (r < planetR + 1.5 || r > Math.max(rxGuide, ryGuide) * 3.55) reset();

    const sx = cx + rx;
    const sy = cy + ry;
    trail.push({ x: sx, y: sy });
    while (trail.length > trailCap) trail.shift();

    ctx.save();
    ctx.translate(cx, cy);
    const viewFitScale = 0.905;
    ctx.scale(viewFitScale, viewFitScale);
    ctx.rotate(viewTiltRad);
    ctx.translate(-cx, -cy);
    drawGuideEllipse();
    drawCmaPopulationArcs();
    drawTrail();
    drawPlanet();
    drawSatellite(sx, sy);
    ctx.restore();

    const cssWFrame = canvas.width / dpr;
    const cssHFrame = canvas.height / dpr;

    if (coordsSatEl) {
      const xs = rx.toFixed(1);
      const ys = ry.toFixed(1);
      coordsSatEl.textContent = `SAT  x:${xs}  y:${ys}`;
    }

    drawCmaScreenLegend(cssWFrame, cssHFrame);
  }

  let ptrX = 0;
  let ptrY = 0;

  function updatePtrCoords() {
    if (coordsPtrEl && !coordsPtrEl.hidden) {
      coordsPtrEl.textContent = `PTR  x:${ptrX.toFixed(0)}  y:${ptrY.toFixed(0)}`;
    }
  }

  function onPointerMove(ev: PointerEvent) {
    const rect = canvas.getBoundingClientRect();
    const px = ev.clientX - rect.left;
    const py = ev.clientY - rect.top;
    ptrX = px - cx;
    ptrY = py - cy;
    updatePtrCoords();
  }

  function onPointerLeave() {
    if (coordsPtrEl) {
      coordsPtrEl.hidden = true;
    }
  }

  function onPointerEnter(ev: PointerEvent) {
    if (coordsPtrEl) coordsPtrEl.hidden = false;
    onPointerMove(ev);
  }

  geom();
  document.addEventListener("site-theme", refreshPalette);
  const ro = new ResizeObserver(geom);
  ro.observe(parent);

  const cmaInterval = window.setInterval(evolveOneCmaGeneration, 220);
  evolveOneCmaGeneration();

  const loop = () => {
    tick();
    rafId = requestAnimationFrame(loop);
  };
  rafId = requestAnimationFrame(loop);

  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerenter", onPointerEnter);
  canvas.addEventListener("pointerleave", onPointerLeave);

  return () => {
    window.clearInterval(cmaInterval);
    cancelAnimationFrame(rafId);
    ro.disconnect();
    document.removeEventListener("site-theme", refreshPalette);
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerenter", onPointerEnter);
    canvas.removeEventListener("pointerleave", onPointerLeave);
  };
}
