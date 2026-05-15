/**
 * Evaluación rápida de candidatos CMA-ES: misma integración semiimplícita que el visor.
 * Objetivo: minimizar varianza de energía específica + momento angular (órbita “cerrada”).
 */

function clamp(x: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, x));
}

function accel(mu: number, rx: number, ry: number, ε2: number) {
  const d = rx * rx + ry * ry + ε2;
  const k = -mu / (d * Math.sqrt(d));
  return { ax: k * rx, ay: k * ry };
}

export type OrbitEvalSnapshot = {
  mu: number;
  a: number;
  e: number;
  rx0: number;
  ry0: number;
  vx0: number;
  vy0: number;
  dt: number;
  planetR: number;
  ε2: number;
  sub: number;
  rEscape: number;
};

/** Decodifica θ ∈ ℝ⁴ en multiplicadores fisicamente razonables. */
export function decodeOrbitTheta(theta: Float64Array | number[]) {
  const k = 0.38;
  return {
    muMul: clamp(Math.exp(theta[0] * k), 0.45, 2.6),
    dtMul: clamp(Math.exp(theta[1] * k), 0.45, 2.4),
    velMul: clamp(Math.exp(theta[2] * k), 0.5, 2.5),
    epsMul: clamp(Math.exp(theta[3] * 0.55), 0.35, 4.5),
  };
}

/**
 * Integra desde el mismo estado inicial que el evaluador y devuelve muestras (rx, ry) en espacio físico,
 * hasta choque/huida o maxSteps — para dibujar en el canvas cada hipótesis θ de CMA‑ES.
 */
export function sampleOrbitPath(
  s: OrbitEvalSnapshot,
  theta: Float64Array,
  maxSteps = 820,
  sampleEvery = 2,
): { rx: number; ry: number }[] {
  const { muMul, dtMul, velMul, epsMul } = decodeOrbitTheta(theta);
  let rx = s.rx0;
  let ry = s.ry0;
  let vx = s.vx0 * velMul;
  let vy = s.vy0 * velMul;
  const mu = s.mu * muMul;
  const dt = clamp(s.dt * dtMul, 0.0006, 0.028);
  const ε2 = s.ε2 * epsMul;
  const sub = s.sub;
  const pr = s.planetR;

  const out: { rx: number; ry: number }[] = [];

  for (let step = 0; step < maxSteps; step++) {
    for (let _ = 0; _ < sub; _++) {
      const { ax, ay } = accel(mu, rx, ry, ε2);
      vx += ax * dt;
      vy += ay * dt;
      rx += vx * dt;
      ry += vy * dt;
    }
    const r = Math.hypot(rx, ry);
    if (r < pr + 1.2 || r > s.rEscape) break;
    if (step % sampleEvery === 0) out.push({ rx, ry });
  }

  return out;
}

export function evalOrbitFitness(s: OrbitEvalSnapshot, theta: Float64Array, maxSteps = 5200): number {
  const { muMul, dtMul, velMul, epsMul } = decodeOrbitTheta(theta);
  let rx = s.rx0;
  let ry = s.ry0;
  let vx = s.vx0 * velMul;
  let vy = s.vy0 * velMul;
  const mu = s.mu * muMul;
  let dt = s.dt * dtMul;
  dt = clamp(dt, 0.0006, 0.028);
  const ε2 = s.ε2 * epsMul;
  const sub = s.sub;
  const pr = s.planetR;

  const Es: number[] = [];
  const Ls: number[] = [];
  const sampleEvery = 5;

  for (let step = 0; step < maxSteps; step++) {
    for (let _ = 0; _ < sub; _++) {
      const { ax, ay } = accel(mu, rx, ry, ε2);
      vx += ax * dt;
      vy += ay * dt;
      rx += vx * dt;
      ry += vy * dt;
    }
    const r = Math.hypot(rx, ry);
    if (r < pr + 1.2 || r > s.rEscape) {
      return 1e6 + (maxSteps - step);
    }
    if (step % sampleEvery === 0) {
      const E = 0.5 * (vx * vx + vy * vy) - mu / Math.max(r, 1e-6);
      const L = rx * vy - ry * vx;
      Es.push(E);
      Ls.push(L);
    }
  }

  function variance(arr: number[]) {
    if (arr.length < 3) return 1e3;
    const m = arr.reduce((a, b) => a + b, 0) / arr.length;
    return arr.reduce((s, x) => s + (x - m) * (x - m), 0) / arr.length;
  }

  return variance(Es) + 0.18 * variance(Ls);
}
