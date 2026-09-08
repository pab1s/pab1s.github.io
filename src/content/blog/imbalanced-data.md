---
title: "When data doesn't play fair"
date: 2025-07-23
description: "When 99.9% accuracy means nothing: fraud, rare diseases, and learning from lopsided data."
author: "Pablo Olivares"
tags: ["imbalanced-learning", "statistical-learning-theory", "generalization"]

categories: ["Machine Learning"]
draft: false
---


Remember that cozy assumption from basic ML theory? That our training data:

$$
\mathcal{S} = \lbrace{(x_1, y_1), \dots, (x_N, y_N)\rbrace}
$$

is drawn independently and identically distributed (i.i.d.) from some underlying true distribution $\mathcal{D}$? And that minimizing the empirical risk $\mathcal{R}_{emp}(f)$ is a good proxy for minimizing the true risk $\mathcal{R}(f)$ ? It sounds so clean, so elegant.

But what happens when $\mathcal{D}$ itself is... lopsided?

### Welcome to the imbalance zone

Think about real-world problems:

- **Fraud Detection:** Most transactions are legit. Maybe only 0.1% are fraudulent.
- **Medical Diagnosis:** Screening for a rare disease? The vast majority of patients will be healthy.
- **Ad Click Prediction:** Most people scrolling past an ad _don't_ click it.
- **Manufacturing Defect Detection:** Hopefully, most items coming off the line are perfectly fine.

In all these cases, one class (the "majority" class, e.g., 'not fraud', 'healthy') dramatically outnumbers the other class (the "minority" class, e.g., 'fraud', 'disease present'). This is **imbalanced data**.

<figure class="ml-fig" aria-label="One in a hundred">
  <svg viewBox="0 0 560 64" role="img" aria-labelledby="imb-t imb-d">
    <title id="imb-t">A hundred transactions, one fraud</title>
    <desc id="imb-d">Grid of one hundred squares; ninety-nine are grey and one, at the end, is green.</desc>
    <defs><pattern id="imb-pat" width="10" height="10" x="5" y="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="var(--muted)" opacity="0.35" /></pattern></defs>
    <rect x="5" y="8" width="498" height="18" fill="url(#imb-pat)" />
    <rect x="495" y="18" width="8" height="8" fill="var(--brand-green)" />
    <text x="5" y="44" font-size="10" fill="var(--muted)">100 transactions</text>
    <text x="503" y="26" font-size="10" fill="var(--brand-green)">1 fraud</text>
  </svg>
  <figcaption><span class="ml-cap-id">Fig. 1 — one in a hundred (1% minority).</span> the lazy “never fraud” classifier scores 99% here — and catches nothing.</figcaption>
</figure>

Why is this a problem? Let's think about minimizing that standard empirical risk $\mathcal{R}_{emp}$. If 99.9% of your data is 'not fraud', a lazy model can achieve 99.9% accuracy by simply predicting 'not fraud' _every single time_. The contribution of the few fraud examples to the total loss $\sum L(f(x_i), y_i)$ is minuscule. The optimization process, blindly minimizing the average loss, happily converges to this useless solution because it looks great on the overall accuracy metric.

### Metrics that matter

This immediately tells us that **accuracy is a terrible metric** for highly imbalanced problems. That 99.9% accurate 'never fraud' detector is worthless. We need metrics that focus on the minority class performance:

- **Precision:** Of the times the model predicted 'fraud', how often was it actually fraud (TP=True Positives, FP=False Positives)?
  $$
  P = \frac{TP}{TP+FP}
  $$
- **Recall (Sensitivity):** Of all the actual fraud cases, how many did the model find (FN=False Negatives)?
  $$
  R = \frac{TP}{TP+FN}
  $$
- **F1-Score:** The harmonic mean of Precision and Recall, giving a balanced measure:
  $$
  F1 = 2 \cdot \frac{P \cdot R}{P + R}
  $$
- **AUC-ROC:** Area Under the Receiver Operating Characteristic Curve. Plots True Positive Rate (Recall) vs. False Positive Rate across different prediction thresholds. Good for overall ranking ability.
- **AUC-PR:** Area Under the Precision-Recall Curve. Often more informative than ROC for highly imbalanced data, as it focuses directly on the tradeoff between finding minority samples (Recall) and the precision of those findings.

<figure class="ml-fig" aria-label="Decision threshold demo">
  <div>
  <svg viewBox="0 0 560 250" role="img" aria-labelledby="th-t th-d">
    <title id="th-t">Overlapping score distributions with a moving threshold</title>
    <desc id="th-d">Two overlapping humps: majority low scores, minority higher. A green vertical line marks the decision threshold and moves with the slider.</desc>
    <line x1="40" y1="180" x2="520" y2="180" stroke="var(--ink)" stroke-width="1.5" />
    <text x="40" y="198" text-anchor="middle" font-size="10" fill="var(--muted)">0</text>
    <text x="280" y="198" text-anchor="middle" font-size="10" fill="var(--muted)">0.5</text>
    <text x="520" y="198" text-anchor="middle" font-size="10" fill="var(--muted)">1</text>
    <text x="520" y="216" text-anchor="end" font-size="10" fill="var(--muted)">model score →</text>
    <path d="M40.0,170.6 L52.0,166.1 L64.0,160.0 L76.0,152.3 L88.0,142.7 L100.0,131.4 L112.0,118.7 L124.0,105.0 L136.0,91.2 L148.0,78.1 L160.0,66.8 L172.0,58.2 L184.0,53.1 L196.0,51.9 L208.0,54.7 L220.0,61.3 L232.0,71.1 L244.0,83.2 L256.0,96.7 L268.0,110.5 L280.0,123.9 L292.0,136.1 L304.0,146.7 L316.0,155.6 L328.0,162.6 L340.0,168.0 L352.0,172.0 L364.0,174.9 L376.0,176.8 L388.0,178.0 L400.0,178.9 L412.0,179.3 L424.0,179.6 L436.0,179.8 L448.0,179.9 L460.0,180.0 L472.0,180.0 L484.0,180.0 L496.0,180.0 L508.0,180.0 L520.0,180.0" fill="none" stroke="var(--muted)" stroke-width="1.5" />
    <path d="M40.0,179.9 L52.0,179.9 L64.0,179.8 L76.0,179.7 L88.0,179.4 L100.0,179.1 L112.0,178.5 L124.0,177.7 L136.0,176.4 L148.0,174.7 L160.0,172.3 L172.0,169.0 L184.0,164.8 L196.0,159.5 L208.0,153.0 L220.0,145.3 L232.0,136.4 L244.0,126.6 L256.0,116.2 L268.0,105.6 L280.0,95.3 L292.0,85.9 L304.0,78.0 L316.0,72.1 L328.0,68.7 L340.0,67.9 L352.0,69.8 L364.0,74.2 L376.0,81.0 L388.0,89.5 L400.0,99.3 L412.0,109.8 L424.0,120.4 L436.0,130.6 L448.0,140.1 L460.0,148.5 L472.0,155.7 L484.0,161.8 L496.0,166.6 L508.0,170.4 L520.0,173.3" fill="none" stroke="var(--ink)" stroke-width="2" />
    <text x="190" y="42" text-anchor="middle" font-size="10" fill="var(--muted)">majority</text>
    <text x="360" y="60" font-size="10" fill="var(--ink)">minority</text>
    <line id="th-line" x1="280" y1="30" x2="280" y2="180" stroke="var(--brand-green)" stroke-width="1.5" />
    <circle id="th-dot" cx="280" cy="30" r="4" fill="var(--brand-green)" />
  </svg></div>
  <div class="ml-control">
    <label for="th-slider" class="sr-only">decision threshold</label>
    <input id="th-slider" type="range" min="0.05" max="0.95" value="0.5" step="0.01" aria-describedby="th-readout" />
  </div>
  <div class="ml-readout"><output id="th-status">trade-off zone</output> · <span id="th-readout">recall <span id="th-r">0.77</span> · precision <span id="th-p">0.07</span> · accuracy <span id="th-acc">0.90</span><br /><span id="th-counts">TP 7.7 · FP 98 · FN 2.3 (N=1000, 1% fraud)</span></span></div>
  <figcaption><span class="ml-cap-id">Fig. 2 — threshold trades precision vs recall.</span> curves show shapes only, counts use the real 99/1 priors. Drag the threshold: accuracy stays pretty while the minority trade-off swings.</figcaption>
</figure>
<script>
(function () {
  var s = document.getElementById('th-slider');
  if (!s) return;
  var line = document.getElementById('th-line');
  var dot = document.getElementById('th-dot');
  var st = document.getElementById('th-status');
  var rO = document.getElementById('th-r');
  var pO = document.getElementById('th-p');
  var aO = document.getElementById('th-acc');
  var cO = document.getElementById('th-counts');
  function Phi(z) {
    var t = 1 / (1 + 0.2316419 * Math.abs(z));
    var d = 0.3989423 * Math.exp(-z * z / 2);
    var p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1 - p : p;
  }
  function render(t) {
    var F0 = Phi((t - 0.32) / 0.14), F1 = Phi((t - 0.62) / 0.16);
    var R = 1 - F1, TP = 10 * R, FP = 990 * (1 - F0), FN = 10 * F1;
    var P = TP / (TP + FP), A = (TP + 990 * F0) / 1000;
    var x = (40 + t * 480).toFixed(1);
    line.setAttribute('x1', x); line.setAttribute('x2', x); dot.setAttribute('cx', x);
    st.textContent = t < 0.35 ? 'catch almost everything' : (t <= 0.65 ? 'trade-off zone' : 'missing the minority');
    rO.textContent = R.toFixed(2); pO.textContent = P.toFixed(2); aO.textContent = A.toFixed(2);
    cO.textContent = 'TP ' + TP.toFixed(1) + ' · FP ' + FP.toFixed(0) + ' · FN ' + FN.toFixed(1) + ' (N=1000, 1% fraud)';
  }
  s.addEventListener('input', function () { render(Number(s.value)); });
  render(Number(s.value));
})();
</script>

Often, especially in fraud or disease detection, **Recall for the minority class** is paramount – we'd rather flag a few legitimate transactions (lower precision) than miss actual fraud cases (high recall). Standard empirical risk minimization doesn't optimize for these metrics directly.

### Let's resample! (and break things?)

So, the standard approach fails because the minority class gets drowned out. The most intuitive way to fight back is to change the data itself to make it look more balanced _before_ training. This falls into two main camps: over-sampling and under-sampling.

#### Over-sampling: more of the little guy

The idea: let's increase the representation of the minority class.

- **Random Over-sampling:** Just duplicate existing minority samples. Simple, but can lead to overfitting as the model sees the exact same examples multiple times.
- **SMOTE (Synthetic Minority Over-sampling Technique):** This is the classic, more sophisticated approach (Chawla et al., 2002)[^chawla2002]. Instead of just duplicating, let's _synthesize_ new minority examples that are _plausible_. The algorithm works roughly like this:
    1. For each minority instance $x_i$.
    2. Find its $k$ nearest neighbors that are _also_ in the minority class.
    3. Randomly choose one of these neighbors, let's call it $x_{nn}$.
    4. Create a new synthetic instance $x_{new}$ by interpolating along the line segment between $x_i$ and $x_{nn}$:

    $$
    x_{new} = x_i + \lambda \cdot (x_{nn} - x_i)
    $$

    where $\lambda$ is a random number chosen uniformly from $[0, 1]$.
    5. Repeat this process until the desired level of balance is achieved. The intuition is to "fill in" the feature space region occupied by the minority class, creating denser clusters and forcing the decision boundary to be more specific.

<figure class="ml-fig" aria-label="SMOTE interpolation">
  <svg viewBox="0 0 560 230" role="img" aria-labelledby="sm-t sm-d">
    <title id="sm-t">A synthetic point interpolated between two minority samples</title>
    <desc id="sm-d">Two solid minority dots joined by a dashed segment; a green dot sits on the segment between them.</desc>
    <g fill="var(--muted)" opacity="0.35">
      <circle cx="135" cy="155" r="4" />
      <circle cx="150" cy="115" r="4" />
      <circle cx="195" cy="170" r="4" />
      <circle cx="225" cy="150" r="4" />
      <circle cx="205" cy="120" r="4" />
      <circle cx="165" cy="95" r="4" />
      <circle cx="120" cy="120" r="4" />
      <circle cx="250" cy="170" r="4" />
    </g>
    <g fill="none" stroke="var(--muted)" stroke-width="1.5">
      <rect x="424" y="74" width="12" height="12" />
      <rect x="464" y="114" width="12" height="12" />
      <rect x="439" y="154" width="12" height="12" />
    </g>
    <text x="470" y="66" font-size="10" fill="var(--muted)">majority nearby</text>
    <line x1="170" y1="150" x2="250" y2="95" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="5 4" />
    <circle cx="170" cy="150" r="5" fill="var(--ink)" />
    <circle cx="250" cy="95" r="5" fill="var(--ink)" />
    <circle cx="202" cy="128" r="5.5" fill="var(--brand-green)" />
    <text x="146" y="170" font-size="11" fill="var(--ink)">x_i</text>
    <text x="260" y="92" font-size="11" fill="var(--ink)">x_nn</text>
    <text x="214" y="122" font-size="11" fill="var(--brand-green)">x_new, λ=0.4</text>
  </svg>
  <figcaption><span class="ml-cap-id">Fig. 3 — SMOTE fills between neighbors (Chawla et al. 2002).</span> a new minority point, not a copy — interpolated along the segment, densifying the cluster.</figcaption>
</figure>

- **ADASYN (Adaptive Synthetic Sampling):** A refinement of SMOTE (He et al., 2008)[^he2008]. ADASYN focuses on generating _more_ synthetic samples for minority instances that are _harder to learn_. It looks at the neighborhood of each minority point $x_i$ and checks the ratio of majority vs. minority neighbors. If $x_i$ has many majority neighbors, it's considered harder to learn (e.g., near the decision boundary), and ADASYN generates more synthetic samples around it.

_Potential Issues with Over-sampling:_ While often effective, creating synthetic data can sometimes blur the lines between classes if done too aggressively, potentially making the classification task harder in some regions. It can also still lead to overfitting, especially if the synthetic samples don't truly represent unseen minority variations. And, of course, it increases the size of your training set, making training slower.

#### Under-sampling: less of the big guy

The opposite approach: let's reduce the representation of the majority class.

- **Random Under-sampling:** Just randomly discard majority class samples until classes are balanced. The huge risk? You might throw away crucial information contained in those majority samples, potentially making the model worse overall.
- **Tomek Links:** A more targeted approach to "clean" the dataset (Tomek, 1976)[^tomek1976]. A Tomek link is a pair of instances $(x_i, x_j)$ from different classes such that they are each other's nearest neighbor. Let $d(\cdot, \cdot)$ be the distance metric. Then $(x_i, x_j)$ is a Tomek link if:

  $$
  d(x_i, x_j) = \min_{k} d(x_i, x_k), \\
  d(x_i, x_j) = \min_{l} d(x_j, x_l)
  $$

  where $x_k$ has a different class than $x_i$, and $x_l$ has a different class than $x_j$. The idea is these points might represent noisy overlap between classes. Removing one or both (usually the majority instance) can lead to a cleaner separation.
- **Edited Nearest Neighbors (ENN):** Another cleaning method (Wilson, 1972)[^wilson1972]. For each instance $x_i$ in the dataset, examine its $k$ nearest neighbors. If the majority class among the neighbors is _different_ from the class of $x_i$ itself, then $x_i$ is deemed potentially noisy or mislabeled, and it gets removed. This tends to remove points that are deep inside regions predominantly occupied by another class.

_Potential Issues with Under-sampling:_ The main risk is always information loss. Random undersampling is particularly dangerous for this reason. Cleaning methods like Tomek Links and ENN are safer but can still remove informative points, and their effectiveness depends heavily on the data structure and choice of $k$ or distance metric.

#### What have we actually done?

Okay, these resampling techniques often _improve_ our desired metrics (like minority class F1-score) on test sets. That's great! But let's put our theorist hat back on for a second. What did we just do to our nice learning setup?

We started with a training set $\mathcal{S}$ hopefully sampled i.i.d. from the true, imbalanced distribution $\mathcal{D}$. We then applied some transformation (SMOTE, ENN, etc.) to get a _new_ training set $\mathcal{S}'$ which effectively represents a different, more balanced distribution $\mathcal{D}'$. We then trained our model $f$ by minimizing the empirical risk on this _modified_ set:

$$
\mathcal{R}'_{emp}(f) = \mathbb{E}_{(x,y) \sim \mathcal{S}'}[L(f(x), y)] \quad (\text{where } \mathcal{S}' \text{ reflects } \mathcal{D}')
$$

But our ultimate goal was to minimize the true risk $\mathcal{R}(f)$ defined on the _original_ distribution $\mathcal{D}$! The theoretical guarantees connecting $\mathcal{R}_{emp}$ and $\mathcal{R}$ from statistical learning theory heavily rely on that i.i.d. assumption – that $\mathcal{S}$ is a direct, representative sample of $\mathcal{D}$. By resampling, we've deliberately broken this assumption. We've trained our model on $\mathcal{D}'$. How well will it perform on $\mathcal{D}$? The theoretical link is severed, or at least significantly weakened, leading to a **distribution shift**. We have a mismatch between the training distribution $P_{train}(x, y)$ (which reflects $\mathcal{D}'$) and the test/deployment distribution $P_{test}(x, y)$ (which reflects the real-world $\mathcal{D}$). Specifically, resampling techniques typically introduce:

- **Prior Probability Shift:**

  $$
  P_{train}(y) \neq P_{test}(y)
  $$

  We artificially changed the class balance.
- **Covariate Shift:**

  $$
  P_{train}(x) \neq P_{test}(x)
  $$

  Over-sampling adds points only in certain regions; under-sampling removes points. The distribution of features $x$ is altered.

<figure class="ml-fig" aria-label="Prior shift from resampling">
  <svg viewBox="0 0 560 150" role="img" aria-labelledby="ps-t ps-d">
    <title id="ps-t">Class balance before and after resampling</title>
    <desc id="ps-d">Two bars: the real world is almost all majority with a sliver of minority; the resampled set is half and half.</desc>
    <text x="130" y="46" text-anchor="end" font-size="10" fill="var(--muted)">D · real</text>
    <rect x="140" y="30" width="386" height="16" fill="var(--muted)" opacity="0.35" />
    <rect x="526" y="30" width="4" height="16" fill="var(--brand-green)" />
    <text x="538" y="43" font-size="10" fill="var(--muted)">99 / 1</text>
    <text x="130" y="106" text-anchor="end" font-size="10" fill="var(--muted)">D' · resampled</text>
    <rect x="140" y="90" width="195" height="16" fill="var(--muted)" opacity="0.35" />
    <rect x="335" y="90" width="195" height="16" fill="var(--brand-green)" />
    <text x="538" y="103" font-size="10" fill="var(--muted)">50 / 50</text>
  </svg>
  <figcaption><span class="ml-cap-id">Fig. 4 — resampling rewrites the priors.</span> we train on the bottom bar but deploy into the top one — the i.i.d. link is severed.</figcaption>
</figure>

The danger is that the model $f$ learns rules that work well in the balanced, potentially cleaned-up world of $\mathcal{D}'$, but these rules might not be robust or optimal when deployed in the wild, imbalanced world of $\mathcal{D}$. It's like learning to ride a bike with heavy-duty training wheels (resampling) and then suddenly having them removed on a bumpy road (deployment). Performance might drop unexpectedly.

Furthermore (and this is a sneak peek for next time), training with artificially balanced class priors can seriously mess up the model's output probabilities. A model trained on a 50/50 balanced set might output probabilities around 0.5 for ambiguous cases, but those probabilities are meaningless for the original 99/1 imbalanced distribution.

### Cost-sensitive learning: changing the rules, not the players

Instead of manipulating the data $\mathcal{S}$, what if we manipulate the loss function $L$ instead? This is the idea behind **cost-sensitive learning**. We acknowledge that misclassifying a minority instance (e.g., missing a fraud case) is much more costly than misclassifying a majority instance (e.g., flagging a legit transaction).

We can incorporate these costs directly into the loss. For example, using weighted cross-entropy:

$$
L'(f(x), y) = w_y \cdot L_{CE}(f(x), y)
$$

Here, $w_y$ is a weight assigned based on the true class $y$. We would set $w_{minority} > w_{majority}$ (often inversely proportional to class frequencies). This tells the optimizer: "Pay more attention to getting the minority class right!"

_Pros:_ Doesn't alter the data distribution $\mathcal{S}$. Keeps the connection to $\mathcal{D}$ more direct. _Cons:_ Still changes the objective function – we're no longer minimizing the standard $\mathcal{R}_{emp}$ on $\mathcal{D}$. Choosing the optimal weights $w_y$ can be non-trivial. It can also affect the calibration of the output probabilities.

### Walking the tightrope: a necessary evil or a better path?

In applied machine learning, we live in a world of pragmatism. Resampling techniques and cost-sensitive learning are not just tricks; they are indispensable tools that consistently deliver models with better real-world performance on the metrics that matter, like finding those few crucial cases of fraud or disease.

And here we arrive at a fascinating and slightly uncomfortable paradox: by deliberately **breaking** the clean i.i.d. assumption that underpins so much of learning theory, we often build models that are **more useful** in the real world.

This should make us pause and think. Are we merely applying a 'hack' to fix a broken learning process? Or is the textbook formulation of minimizing empirical risk on the original distribution $\mathcal{D}$ not the whole story for achieving practical success? Perhaps the goal shouldn't be to create a perfect statistical mirror of the imbalanced reality, but to create a learning environment, even an artificial one like $\mathcal{S}'$, that most efficiently **teaches the model the concepts** needed to distinguish between classes. We aren't just showing it data; we are guiding its focus.

This perspective, however, raises a critical new question. If we've trained our model in this artificial, 'balanced' classroom, how much can we trust what it says when it graduates to the real world? It might be great at sorting 'fraud' from 'not fraud' (high F1-score), but what does its prediction of "70% probability of fraud" actually **mean**? Its sense of probability was honed on a 50/50 dataset, not the real 99.9/0.1 world. The model is a good classifier, but is it a reliable prognosticator?

To trust our models beyond their classification accuracy, we must be able to understand and quantify their uncertainty. This leads us directly to our next topic: **model calibration and the powerful framework of conformal prediction**. These aren't just tools for fine-tuning; they are lenses through which we can begin to unravel what our models truly learn and how much confidence we should have in their predictions, especially when the path to learning was anything but straight. Let's tackle that next.
[^chawla2002]: Chawla, N. V., Bowyer, K. W., Hall, L. O., & Kegelmeyer, W. P. (2002). SMOTE: Synthetic minority over-sampling technique. _Journal of Artificial Intelligence Research_, 16, 321–357.
[^he2008]: He, H., Bai, Y., Garcia, E. A., & Li, S. (2008). ADASYN: Adaptive synthetic sampling approach for imbalanced learning. _Proc. IEEE Int. Joint Conf. on Neural Networks (IJCNN)_, 1322–1328.
[^tomek1976]: Tomek, I. (1976). Two modifications of CNN. _IEEE Trans. Systems, Man, and Cybernetics_, SMC-6(11), 769–772.
[^wilson1972]: Wilson, D. L. (1972). Asymptotic properties of nearest neighbor rules using edited data. _IEEE Trans. Systems, Man, and Cybernetics_, SMC-2(3), 408–421.
