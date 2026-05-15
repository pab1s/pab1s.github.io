import { EigenvalueDecomposition, Matrix } from "ml-matrix";

/** Diagnóstico de una generación tras `tell` (estado público solo lectura). */
export type CmaDiagnostics = Readonly<{
  genAfter: number;
  fitnessSorted: Float64Array;
  fMean: number;
  fMedian: number;
  sigmaRatio: number;
  psNorm: number;
  pcNorm: number;
  meanShiftOverSigma: number;
  cDiag: Float64Array;
  cEigenvaluesAsc: Float64Array;
  /** Matriz covarianza C al final del paso (simétrica; fila-major triángulo superior). */
  cMatrix: Float64Array;
  ranked: ReadonlyArray<Readonly<{ f: number; x: Float64Array }>>;
}>;

function rngNormal(): number {
  const u = 1 - Math.random();
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function hypotn(v: Float64Array): number {
  let s = 0;
  for (let i = 0; i < v.length; i++) s += v[i] * v[i];
  return Math.sqrt(s);
}

/** v := Bᵀ Δ (B column eigenvectors): (Bᵀv)_k = Σⱼ Bjk vj — B stored row,col get(j,k) */
function btVec(B: Matrix, delta: Float64Array, n: number): Float64Array {
  const out = new Float64Array(n);
  for (let k = 0; k < n; k++) {
    let s = 0;
    for (let j = 0; j < n; j++) s += B.get(j, k) * delta[j];
    out[k] = s;
  }
  return out;
}

/** y = B * u (u length n column) */
function bVec(B: Matrix, u: Float64Array, n: number): Float64Array {
  const y = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (let j = 0; j < n; j++) s += B.get(i, j) * u[j];
    y[i] = s;
  }
  return y;
}

function outerToMatrix(y: Float64Array, n: number, scale: number): Matrix {
  const M = Matrix.zeros(n, n);
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      M.set(r, c, scale * y[r] * y[c]);
    }
  }
  return M;
}

/**
 * CMA-ES (reducido) — minimización. Basado en Hansen & Ostermeier.
 */
export class OrbitCMAES {
  readonly n: number;
  readonly lambda: number;
  readonly mu: number;
  readonly weights: Float64Array;
  readonly mueff: number;
  readonly cc: number;
  readonly cs: number;
  readonly c1: number;
  readonly cmu: number;
  readonly damps: number;
  readonly chiN: number;

  m: Float64Array;
  sigma: number;
  C: Matrix;
  pc: Float64Array;
  ps: Float64Array;
  gen = 0;
  bestX: Float64Array;
  bestF = Number.POSITIVE_INFINITY;

  /** Relleno tras cada `tell`; gen 0 = aún no hay paso completo. */
  lastDiag: CmaDiagnostics | null = null;

  private pop: Float64Array[] = [];

  constructor(n: number, opts?: { sigma0?: number }) {
    this.n = n;
    this.lambda = 4 + Math.floor(3 * Math.log(n));
    this.mu = Math.floor(this.lambda / 2);
    this.weights = new Float64Array(this.mu);
    let ws = 0;
    for (let i = 0; i < this.mu; i++) {
      this.weights[i] = Math.log(this.mu + 0.5) - Math.log(i + 1);
      ws += this.weights[i];
    }
    for (let i = 0; i < this.mu; i++) this.weights[i] /= ws;
    let w2 = 0;
    for (let i = 0; i < this.mu; i++) w2 += this.weights[i] * this.weights[i];
    this.mueff = 1 / w2;

    this.cc = (4 + this.mueff / n) / (n + 4 + 2 * (this.mueff / n));
    this.cs = (this.mueff + 2) / (n + this.mueff + 5);
    this.c1 = 2 / ((n + 1.3) ** 2 + this.mueff);
    this.cmu = Math.min(
      1 - this.c1,
      (2 * (this.mueff - 2 + 1 / this.mueff)) / ((n + 2) ** 2 + this.mueff),
    );
    this.damps =
      1 +
      2 * Math.max(0, Math.sqrt((this.mueff - 1) / (n + 1)) - 1) +
      this.cs;
    this.chiN = Math.sqrt(n) * (1 - 1 / (4 * n) + 1 / (21 * n * n));

    this.m = new Float64Array(n);
    this.sigma = opts?.sigma0 ?? 0.42;
    this.C = Matrix.eye(n, n);
    this.pc = new Float64Array(n);
    this.ps = new Float64Array(n);
    this.bestX = this.m.slice();
  }

  ask(): Float64Array[] {
    const { n, lambda, sigma, m, C } = this;
    let ed: EigenvalueDecomposition;
    try {
      ed = new EigenvalueDecomposition(C);
    } catch {
      this.C = Matrix.eye(n, n);
      ed = new EigenvalueDecomposition(this.C);
    }
    const B = ed.eigenvectorMatrix;
    const lam = ed.realEigenvalues.map((v) => Math.max(v, 1e-14));
    const sqrtL = lam.map((v) => Math.sqrt(v));

    this.pop = [];
    for (let k = 0; k < lambda; k++) {
      const z = new Float64Array(n);
      for (let i = 0; i < n; i++) z[i] = rngNormal();
      const sz = new Float64Array(n);
      for (let i = 0; i < n; i++) sz[i] = z[i] * sqrtL[i];
      const y = bVec(B, sz, n);
      const x = new Float64Array(n);
      for (let i = 0; i < n; i++) x[i] = m[i] + sigma * y[i];
      this.pop.push(x);
    }
    return this.pop;
  }

  tell(fitness: number[]): void {
    const { n, lambda, mu, weights, mueff } = this;
    if (fitness.length !== lambda) return;

    const sigma0 = this.sigma;

    type P = { x: Float64Array; f: number };
    const pairs: P[] = this.pop.map((x, i) => {
      const raw = fitness[i];
      const f = Number.isFinite(raw) ? raw : 1e9;
      return { x, f };
    });
    pairs.sort((a, b) => a.f - b.f);

    if (pairs[0].f < this.bestF) {
      this.bestF = pairs[0].f;
      this.bestX = pairs[0].x.slice();
    }

    let ed0: EigenvalueDecomposition;
    try {
      ed0 = new EigenvalueDecomposition(this.C);
    } catch {
      this.C = Matrix.eye(n, n);
      ed0 = new EigenvalueDecomposition(this.C);
    }
    const B0 = ed0.eigenvectorMatrix;
    const lam0 = ed0.realEigenvalues.map((v) => Math.max(v, 1e-14));
    const invSqrtLam = lam0.map((v) => 1 / Math.sqrt(v));

    const mold = this.m.slice();
    const mNew = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      let s = 0;
      for (let j = 0; j < mu; j++) s += weights[j] * pairs[j].x[i];
      mNew[i] = s;
    }

    const delta = new Float64Array(n);
    for (let i = 0; i < n; i++) delta[i] = (mNew[i] - mold[i]) / this.sigma;
    const wPath = btVec(B0, delta, n);
    for (let i = 0; i < n; i++) wPath[i] *= invSqrtLam[i];
    const cSig = Math.sqrt(this.cs * (2 - this.cs) * mueff);
    for (let i = 0; i < n; i++) this.ps[i] = (1 - this.cs) * this.ps[i] + cSig * wPath[i];

    const ns = hypotn(this.ps);
    this.sigma *= Math.exp((this.cs / this.damps) * (ns / this.chiN - 1));
    const sigmaRatio = this.sigma / sigma0;

    const sqrtcc = Math.sqrt(this.cc * (2 - this.cc) * mueff);
    const yσ = new Float64Array(n);
    for (let i = 0; i < n; i++) yσ[i] = (mNew[i] - mold[i]) / this.sigma;
    for (let i = 0; i < n; i++) this.pc[i] = (1 - this.cc) * this.pc[i] + sqrtcc * yσ[i];

    const rank1 = outerToMatrix(this.pc, n, this.c1);
    const pcNormPost = hypotn(this.pc);

    const rankMu = Matrix.zeros(n, n);
    for (let j = 0; j < mu; j++) {
      const xj = pairs[j].x;
      const yj = new Float64Array(n);
      for (let i = 0; i < n; i++) yj[i] = (xj[i] - mold[i]) / this.sigma;
      rankMu.add(outerToMatrix(yj, n, weights[j]));
    }
    rankMu.mul(this.cmu);

    const Cupd = this.C.clone().mul(1 - this.c1 - this.cmu);
    Cupd.add(rank1);
    Cupd.add(rankMu);

    for (let r = 0; r < n; r++) {
      for (let c = r + 1; c < n; c++) {
        const sym = (Cupd.get(r, c) + Cupd.get(c, r)) / 2;
        Cupd.set(r, c, sym);
        Cupd.set(c, r, sym);
      }
    }

    let cEigenvaluesAsc: Float64Array;
    try {
      const edc = new EigenvalueDecomposition(Cupd);
      const lam = edc.realEigenvalues.map((v) => Math.max(v, 1e-10));
      const sorted = Float64Array.from(lam).sort();
      cEigenvaluesAsc = sorted;
      const Bc = edc.eigenvectorMatrix;
      const D = Matrix.zeros(n, n);
      for (let i = 0; i < n; i++) D.set(i, i, lam[i]);
      this.C = Bc.mmul(D).mmul(Bc.transpose());
    } catch {
      this.C = Matrix.eye(n, n);
      cEigenvaluesAsc = new Float64Array(n);
      cEigenvaluesAsc.fill(1);
    }

    const cDiag = new Float64Array(n);
    for (let i = 0; i < n; i++) cDiag[i] = this.C.get(i, i);

    const cFlat = new Float64Array(n * n);
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) cFlat[r * n + c] = this.C.get(r, c);
    }

    const fitnessSorted = new Float64Array(lambda);
    let fSum = 0;
    for (let i = 0; i < lambda; i++) {
      fitnessSorted[i] = pairs[i].f;
      fSum += pairs[i].f;
    }
    const fMean = fSum / lambda;
    const mid = Math.floor(lambda / 2);
    const fMedian =
      lambda % 2 === 1
        ? fitnessSorted[mid]
        : 0.5 * (fitnessSorted[mid - 1] + fitnessSorted[mid]);

    let meanShift = 0;
    for (let i = 0; i < n; i++) {
      const d = mNew[i] - mold[i];
      meanShift += d * d;
    }
    meanShift = Math.sqrt(meanShift) / sigma0;

    const ranked = pairs.map((p) => ({ f: p.f, x: p.x.slice() as Float64Array }));

    this.lastDiag = {
      genAfter: this.gen + 1,
      fitnessSorted,
      fMean,
      fMedian,
      sigmaRatio,
      psNorm: ns,
      pcNorm: pcNormPost,
      meanShiftOverSigma: meanShift,
      cDiag,
      cEigenvaluesAsc,
      cMatrix: cFlat,
      ranked,
    };

    this.m = mNew;
    this.gen += 1;
  }
}
