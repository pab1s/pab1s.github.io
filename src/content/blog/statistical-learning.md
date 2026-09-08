---
title: "Is statistical learning 'all we need'?"
date: 2025-04-12
description: "A deep dive into the foundations of machine learning and the enigma of deep learning generalization."
author: "Pablo Olivares"
tags: ["machine-learning", "statistical-learning-theory", "generalization"]

categories: ["Machine Learning"]
draft: false
---

Hey everyone! Let's talk about machine learning. It’s everywhere now, right? From your phone unlocking with your face to recommending weirdly specific t-shirts online. But what *is* it, fundamentally? At its core, it's about teaching computers to do stuff by showing them examples, rather than programming explicit rules for every conceivable situation. Think about teaching a kid what a dog is. You don't list out "has four legs, barks, wags tail, etc." – you just point: "That's a dog. That's also a dog. That thing over there? Not a dog." The kid (usually!) figures out the underlying pattern. ML tries to do the same, just... with math.

### Learning from examples

So, we have some data. Let’s say pairs of $(x,y)$. Here, $x$ could be an email text, and $y$ could be 'spam' or 'not spam'. Or $x$ could be pixels of an image, and $y$ could be 'cat' or 'dog'. Our goal is to build a function, our model $f$, that takes a new input $x$ and predicts the corresponding output $y$. We want $f(x)$ to be as close to the true $y$ as possible.

How do we measure "close"? We need a **loss function**, denoted $L(f(x),y)$. This function spits out a number telling us how *bad* our prediction $f(x)$ was compared to the actual truth $y$.

- Maybe for predicting house prices (regression), the loss is just the squared difference: $L(f(x),y)=(f(x)−y)^2$. Big difference = big loss.
- For classification ('cat' vs 'dog'), maybe it's the "0-1 loss": $L(f(x),y)=1$ if $f(x) \neq y$, and $0$ if $f(x)=y$. Simple, but tricky to optimize directly. More often we use proxies like cross-entropy loss, which is smoother and gives the optimization algorithms something to grab onto.

The loss function $L$ is our scorecard. Low score = good job, model $f$! High score = back to the drawing board.

### An impossible dream

Now, what's the *ultimate* goal? We want our model $f$ to be good not just on the examples we showed it, but on *any* example it might encounter in the future. Imagine an infinite stream of all possible emails that have ever existed or will ever exist – this is our true data distribution, let's call it $\mathcal{D}$. The dream is to minimize the **Expected Risk** (or True Risk), $\mathcal{R}(f)$:
$$
\mathcal{R}(f)=\mathbb{E}_{(x,y) \sim \mathcal{D}}\left[L\big(f(x),y\big)\right]
$$
Let's unpack that $\mathbb{E}[\ldots]$ notation. It just means "the average loss over *all possible data points* $(x,y)$ drawn from our mythical distribution $\mathcal{D}$." If we could find the $f$ that makes $\mathcal{R}(f)$ as small as possible, we'd have the perfect spam filter, the perfect cat detector, the theoretically optimal model. We could pack up and go home.

There's just one tiny problem: **We never, ever get to see $\mathcal{D}$**. We don't have access to every email ever written or every photo ever taken. It's fundamentally unknowable. All we have is a finite pile of examples that we managed to collect – our training dataset, let's call it $S$. This set $S$ is hopefully *sampled* from $\mathcal{D}$, but it's just a tiny snapshot of that vast, unseen universe.

### The practical reality: minimizing empirical risk and generalization

So, what do we do? We do the only thing we *can* do: we try to make our model perform really well on the data we *have*. We minimize the **Empirical Risk**, $\mathcal{R}_{\text{emp}}(f)$. This is just the average loss calculated *only* on our training data $S$. Let our training set be:

$$
S=\{(x_1,y_1), (x_2,y_2), \dots, (x_N,y_N)\}
$$

Then the empirical risk is:

$$
\mathcal{R}_{\text{emp}} (f) = \frac{1}{N} \sum^{N} _{i=1} L\big(f(x_i), y_i\big)
$$

We can actually compute this! And we can use optimization algorithms (like gradient descent) to tweak the parameters of our model $f$ to drive this $\mathcal{R}_{\text{emp}}$ value down, down, down.

Now comes the crucial leap. We *hope* that by minimizing the empirical risk $\mathcal{R}_{\text{emp}}$ (doing well on the training data), our model $f$ will *also* have low true risk $\mathcal{R}$ (doing well on unseen data). This property is called **generalization**. It’s the whole point! A model that just memorizes the training data perfectly ($\mathcal{R}_{\text{emp}}(f)\approx 0$) but fails miserably on new data is completely useless.

A huge chunk of **Statistical Learning Theory**, pioneered by folks like Vapnik, is dedicated to figuring out *when* this leap of faith is justified (see Vapnik, *Statistical Learning Theory*, 1998)[^vapnik1998]. Concepts like PAC (Probably Approximately Correct) learning, introduced by Valiant (1984)[^valiant1984], try to give mathematical guarantees. They tell us that, under certain assumptions, if our training set $S$ is large enough ($N$ is big) and our model $f$ isn't *too* complex (its "capacity," sometimes measured by something like VC dimension, isn't excessively large relative to $N$), then $\mathcal{R}_{\text{emp}}$ is likely to be close to $\mathcal{R}$. The theory provides bounds on $|\mathcal{R}(f)-\mathcal{R}_{\text{emp}}(f)|$. The intuition is: if the model isn't complex enough to simply memorize everything, and it performs well on a large, representative sample of the data, it must have learned some underlying pattern that will likely hold for new data too.

### Finding the sweet spot: the bias-variance tradeoff

This brings us to the classic dilemma: model complexity. How complex should our function $f$ be?

- **Simple Models (e.g., linear regression):** These models have low capacity. They make strong assumptions about the data (like assuming a linear relationship). They might not be flexible enough to capture the true underlying pattern if it's complex. We say they have **high bias** (they are fundamentally biased away from the true solution) but **low variance** (if you trained them on different random samples of the data, you'd get pretty similar models). They *underfit*. Imagine trying to fit a wiggly curve with a straight ruler – you'll miss the detail.
- **Complex Models (e.g., a very deep decision tree, or a high-degree polynomial):** These models have high capacity. They can fit almost *anything*. They have **low bias** (they can approximate the true function very closely) but **high variance** (training them on different samples of data could lead to wildly different models, because they latch onto noise and specific quirks in each sample). They *overfit*. Imagine trying to fit those same points with a ridiculously flexible wire that wiggles through every single point – it fits the training data perfectly but will likely look insane between the points.

The **bias-variance tradeoff** is this constant battle: increasing model complexity generally decreases bias but increases variance, and vice-versa. A classic paper by Geman, Bienenstock, and Doursat (1992)[^geman1992] laid out a formal decomposition showing how expected error typically breaks down into $bias^2$, variance, and irreducible noise. For decades, machine learning engineering was largely about navigating this tradeoff – finding the "sweet spot" complexity for your problem and data size $N$. Techniques like cross-validation were developed precisely to estimate the true risk $\mathcal{R}$ on unseen data and help us pick the right model complexity, aiming for that sweet spot.

<figure class="ml-fig" aria-label="Interactive bias-variance demo">
  <div class="ml-cols cols-2">
    <div>
      <p class="ml-panel-title">training sample S + fit f</p>
      <svg viewBox="0 0 300 200" role="img" aria-labelledby="bv-fit-t bv-fit-d">
        <title id="bv-fit-t">Fitted curve on training points</title>
        <desc id="bv-fit-d">Dots are training samples. The green curve morphs from a straight line to a smooth fit to a wiggly overfit as complexity rises.</desc>
        <rect x="30" y="15" width="260" height="160" fill="none" stroke="var(--hairline)" />
        <text x="22" y="26" font-size="10" fill="var(--muted)">y</text>
        <text x="282" y="192" font-size="10" fill="var(--muted)">x</text>
        <g fill="var(--ink)">
          <circle cx="30" cy="114.1" r="3" />
          <circle cx="56" cy="103.2" r="3" />
          <circle cx="82" cy="54.5" r="3" />
          <circle cx="108" cy="55.4" r="3" />
          <circle cx="134" cy="40.2" r="3" />
          <circle cx="160" cy="75.9" r="3" />
          <circle cx="186" cy="91.7" r="3" />
          <circle cx="212" cy="113.2" r="3" />
          <circle cx="238" cy="150.7" r="3" />
          <circle cx="264" cy="133.8" r="3" />
          <circle cx="290" cy="126.9" r="3" />
        </g>
        <path id="bv-fit" d="M30,122.1 L43,108.5 L56,93.6 L69,78.9 L82,65.7 L95,55.4 L108,49.0 L121,47.0 L134,49.8 L147,56.9 L160,67.9 L173,81.4 L186,96.5 L199,111.1 L212,124.4 L225,134.6 L238,141.1 L251,143.0 L264,140.2 L277,133.1 L290,122.1" fill="none" stroke="var(--brand-green)" stroke-width="2" />
      </svg>
    </div>
    <div>
      <p class="ml-panel-title">error vs. complexity</p>
      <svg viewBox="0 0 300 200" role="img" aria-labelledby="bv-err-t bv-err-d">
        <title id="bv-err-t">Bias, variance and total error</title>
        <desc id="bv-err-d">Bias falls and variance rises with complexity, so total error is U-shaped. The green dot tracks the slider.</desc>
        <rect x="30" y="20" width="260" height="150" fill="none" stroke="var(--hairline)" />
        <path d="M30,150 C120,140 200,80 290,55" fill="none" stroke="var(--muted)" stroke-width="1.5" />
        <path d="M30,60 C120,65 200,110 290,155" fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="5 4" />
        <path d="M30,145 Q160,55 290,145" fill="none" stroke="var(--ink)" stroke-width="2" />
        <text x="36" y="142" font-size="9" fill="var(--muted)">bias²</text>
        <text x="36" y="52" font-size="9" fill="var(--muted)">variance</text>
        <text x="222" y="128" font-size="9" fill="var(--muted)">total</text>
        <line id="bv-guide" x1="160" y1="30" x2="160" y2="170" stroke="var(--hairline-strong)" stroke-dasharray="3 3" />
        <circle id="bv-marker" cx="160" cy="100" r="4.5" fill="var(--brand-green)" stroke="var(--ink)" stroke-width="1" />
      </svg>
    </div>
  </div>
  <div class="ml-control">
    <label for="bv-slider" class="sr-only">model complexity</label>
    <input id="bv-slider" type="range" min="0" max="100" value="50" step="1" aria-describedby="bv-readout" />
  </div>
  <figcaption><span class="ml-cap-id">Fig. 1 — fit vs. complexity.</span> <output id="bv-status">sweet spot</output> · <span id="bv-readout">train <span id="bv-train">0.21</span> · test <span id="bv-test">0.16</span></span> (illustrative units) — drag the slider: a rigid ruler underfits, the smooth curve generalizes, the wiggly wire memorizes noise.</figcaption>
</figure>
<script>
(function () {
  var slider = document.getElementById('bv-slider');
  if (!slider) return;
  var fit = document.getElementById('bv-fit');
  var marker = document.getElementById('bv-marker');
  var guide = document.getElementById('bv-guide');
  var status = document.getElementById('bv-status');
  var trainOut = document.getElementById('bv-train');
  var testOut = document.getElementById('bv-test');
  var TRUE = function (x) { return 0.5 + 0.3 * Math.sin(x * 6.2832 - 0.6); };
  var NOISE = [0.05, -0.06, 0.07, -0.04, 0.06, -0.05, 0.03, 0.07, -0.06, 0.04, -0.03];
  var DATA = [];
  for (var i = 0; i <= 10; i++) { var xd = i / 10; DATA.push([xd, TRUE(xd) + NOISE[i]]); }
  function interpData(x) {
    var f = x * 10, i0 = Math.floor(f), i1 = Math.min(10, i0 + 1), k = f - i0;
    return DATA[i0][1] * (1 - k) + DATA[i1][1] * k;
  }
  var X = function (x) { return 30 + x * 260; };
  var Y = function (y) { return 175 - y * 160; };
  function render(t) {
    var pts = [];
    var line0 = TRUE(0), line1 = TRUE(1);
    for (var j = 0; j <= 40; j++) {
      var x = j / 40, y;
      var line = line0 + (line1 - line0) * x;
      if (t <= 50) { var k = t / 50; y = line * (1 - k) + TRUE(x) * k; }
      else { var k2 = (t - 50) / 50; var wig = interpData(x) + 0.07 * Math.sin(x * 62); y = TRUE(x) * (1 - k2) + wig * k2; }
      pts.push((j === 0 ? 'M' : 'L') + X(x).toFixed(1) + ',' + Y(y).toFixed(1));
    }
    fit.setAttribute('d', pts.join(' '));
    var ex = 30 + (t / 100) * 260, ey = 100 + Math.pow((t - 50) / 50, 2) * 45;
    marker.setAttribute('cx', ex.toFixed(1));
    marker.setAttribute('cy', ey.toFixed(1));
    guide.setAttribute('x1', ex.toFixed(1));
    guide.setAttribute('x2', ex.toFixed(1));
    status.textContent = t < 35 ? 'underfit — high bias' : (t <= 65 ? 'sweet spot' : 'overfit — high variance');
    trainOut.textContent = (0.34 * (1 - t / 115) + 0.02).toFixed(2);
    testOut.textContent = (0.16 + Math.pow((t - 50) / 50, 2) * 0.22).toFixed(2);
  }
  slider.addEventListener('input', function () { render(Number(slider.value)); });
  render(Number(slider.value));
})();
</script>

### Building strength from weakness

One of the most elegant ideas to come out of this era was **ensemble methods**. What if, instead of trying to find one perfect model in that sweet spot, we combine lots of simple, potentially biased models? A "weak learner" is defined as a model that's just slightly better than random guessing. Think of a decision tree with only one split (a "stump"). Pretty dumb on its own.

<figure class="ml-fig" aria-label="Weak versus strong learners">
  <svg viewBox="0 0 560 190" role="img" aria-labelledby="ens-t ens-d" style="padding:1rem 0 0.25rem">
    <title id="ens-t">Weak learners combined into a strong learner</title>
    <desc id="ens-d">Three small dashed boxes labelled h1 to h3 with weights, plus signs between them, an equals sign, then one large solid box labelled f of x.</desc>
    <text x="172" y="18" text-anchor="middle" font-size="10" letter-spacing="2" fill="var(--muted)">WEAK LEARNERS</text>
    <text x="462" y="18" text-anchor="middle" font-size="10" letter-spacing="2" fill="var(--muted)">STRONG LEARNER</text>
    <g fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="5 4">
      <rect x="8" y="36" width="96" height="96" />
      <rect x="124" y="36" width="96" height="96" />
      <rect x="240" y="36" width="96" height="96" />
    </g>
    <g font-size="14" text-anchor="middle" fill="var(--ink)">
      <text x="56" y="92">h1</text>
      <text x="172" y="92">h2</text>
      <text x="288" y="92">h3</text>
    </g>
    <g font-size="10" text-anchor="middle" fill="var(--muted)">
      <text x="56" y="150">a1 0.5</text>
      <text x="172" y="150">a2 0.3</text>
      <text x="288" y="150">a3 0.2</text>
    </g>
    <g font-size="16" text-anchor="middle" fill="var(--muted)">
      <text x="114" y="92">+</text>
      <text x="230" y="92">+</text>
    </g>
    <text x="354" y="93" text-anchor="middle" font-size="18" fill="var(--brand-green)">=</text>
    <rect x="372" y="36" width="180" height="96" fill="none" stroke="var(--ink)" stroke-width="1.5" />
    <rect x="372" y="140" width="180" height="4" fill="var(--brand-green)" />
    <text x="462" y="86" text-anchor="middle" font-size="16" fill="var(--ink)">f(x)</text>
    <text x="462" y="108" text-anchor="middle" font-size="10" fill="var(--muted)">sum of a·h</text>
  </svg>
  <figcaption><span class="ml-cap-id">Fig. 2 — many weak → one strong (boosting).</span> each stump h_t is barely better than chance; weighted and summed (AdaBoost / GBM) they become one strong f(x).</figcaption>
</figure>

But methods like **AdaBoost** (Freund & Schapire, 1997)[^freund1997] found clever ways to iteratively train these weak learners, where each new learner $h_t(x)$ focuses on correcting the mistakes made by the ensemble so far, giving more weight to misclassified examples. Later, **Gradient Boosting Machines (GBMs)**, formalized by Friedman (2001)[^friedman2001], took a more general approach, viewing it as gradient descent in function space. You end up with a weighted combination, a final strong learner $f(x)$:

$$
f(x)=\sum_{t=1}^{T} \alpha_t\, h_t(x)
$$

where $h_t(x)$ are the weak learners and $\alpha_t$ are their weights (often related to how well each learner performed). Miraculously, this process turns a bunch of weaklings into an incredibly strong predictor! These boosted tree models (like XGBoost, LightGBM, which are optimized implementations of GBM ideas) dominated applied ML competitions for years and are still incredibly powerful. It felt like a triumph of statistical engineering – building highly accurate models from simple, understandable components, carefully controlling complexity by adding learners $h_t$ one by one.

### Then deep learning crashed the party

And then... deep learning happened. Neural networks, which had been around conceptually for ages (think perceptrons in the 50s, backpropagation in the 80s), suddenly became feasible to train at unprecedented scales thanks to massive datasets (like ImageNet)[^krizhevsky2012], powerful GPUs providing parallel computation, and some key algorithmic refinements (like better activation functions and initialization schemes). We started building **Deep Neural Networks (DNNs)** with *layers upon layers* of interconnected "neurons", resulting in models with *millions*, sometimes *billions*, of tunable parameters (weights and biases).

Think about that number. Billions of parameters! According to the classical bias-variance story we just discussed, these models have absolutely *ginormous* capacity. They live in parameter spaces with unimaginable dimensionality. They should be variance nightmares! They have *way* more than enough power to simply memorize every single data point in even very large training sets $S$. If you have $N=1$ million data points and a billion parameters, finding parameter settings that perfectly fit the data seems almost trivial – the system is vastly underdetermined.

And indeed, that's often what we see: people train huge DNNs to the point where the **training error ($\mathcal{R}_{\text{emp}}$) is essentially zero** (or extremely close). They have perfectly interpolated the training data.

### Where did the overfitting go?

Classical theory predicts disaster. A model $f$ with $\mathcal{R}_{\text{emp}}(f)\approx 0$ and vastly more parameters than data points $N$ *should* generalize terribly. Its variance should be through the roof. It should have fit every little noise quirk and random artifact in the training set $S$, making it useless on new data drawn from the true distribution $\mathcal{D}$.

But here's the spooky part, the puzzle that has obsessed researchers for the last decade or so: ***Often, these massively overparameterized deep learning models generalize surprisingly well!*** The gap between their near-zero empirical risk $\mathcal{R}_{\text{emp}}$ and their true risk $\mathcal{R}$ (estimated on unseen test data) is often much smaller than our classical intuition, built on the bias-variance tradeoff, would lead us to expect. They *can* overfit, for sure, if you don't use any explicit regularization or train carelessly. But the striking thing is how often they *don't*, even when trained to interpolation.

What in the world is going on? How can a model $f$ with billions of parameters, perfectly fitting the training data $S$, still capture meaningful patterns that apply to new data from $\mathcal{D}$? The old rules seem... *incomplete*, or at least insufficient to explain this behavior.

### Whispers of explanation

The community is buzzing with potential explanations, and it's still an active area of research. Nobody has the single "aha!" answer yet, but some intriguing ideas are emerging:

1. **Implicit Regularization of Optimization:** Maybe the *way* we train these models matters more than we thought. We typically use variants of **Stochastic Gradient Descent (SGD)**. SGD is simple, scalable, and surprisingly effective. Because it uses small batches of data to estimate the gradient $\nabla\mathcal{R}_{\text{emp}}(f)$ at each step, its path through the parameter space is noisy and jagged. This noisy process might inherently prefer certain types of solutions over others. Imagine SGD rattling around in a vast, high-dimensional loss landscape. Perhaps it's more likely to settle into wide, flat valleys (minima where the Hessian has small eigenvalues) rather than sharp, narrow ones. There's growing evidence, both theoretical and empirical, that flatter minima correspond to solutions that generalize better (e.g., Hochreiter & Schmidhuber, 1997[^hochreiter1997]; Keskar et al., 2016[^keskar2016]). So, the optimization algorithm itself, without any explicit penalty terms (like $L_1$ or $L_2$ norms) added to the loss, might be providing a form of "implicit" regularization, favoring simpler or more robust solutions among the many possible ways to perfectly fit the data. Some work even suggests SGD finds solutions with low rank or norm implicitly (e.g., Gunasekar et al., 2017[^gunasekar2017] on matrix factorization). It's like the optimizer itself has a hidden preference for solutions that happen to generalize well.

2. **Benign Overfitting & High Dimensions:** Perhaps our low-dimensional intuition about overfitting is misleading in the dizzying heights of billion-parameter spaces. Some theories explore the idea of **"benign overfitting"**, where fitting the training data perfectly, including some noise, doesn't necessarily harm generalization in very high-dimensional settings (parameters $\gg N$), especially for certain kinds of data and model structures.

3. **Double Descent:** The relationship between model capacity and generalization might be more complex than the simple U-shaped bias-variance curve. Seminal work by Belkin et al. (2019)[^belkin2019] highlighted the **"double descent"** phenomenon. As you increase model capacity (e.g., number of parameters or network width), the test error (approximating $\mathcal{R}$) first decreases (classical regime), then increases as it starts to overfit the training data... BUT then, as you increase capacity *even further*, pushing well past the point where it can perfectly fit the training data ($\mathcal{R}_{\text{emp}}\approx 0$, the interpolation threshold), the test error can surprisingly start to *decrease again*. This modern interpolation regime, where bigger models that perfectly fit the data generalize *better*, directly contradicts classical intuition and seems characteristic of deep learning.

<figure class="ml-fig" aria-label="Double descent curve">
  <svg viewBox="0 0 560 270" role="img" aria-labelledby="dd-t dd-d" style="padding:1rem 0 0.25rem">
    <title id="dd-t">Test error versus model capacity</title>
    <desc id="dd-d">Test error falls, rises to a peak at the interpolation threshold where training error hits zero, then falls again as capacity grows further.</desc>
    <line x1="36" y1="16" x2="36" y2="220" stroke="var(--ink)" stroke-width="1.5" />
    <line x1="36" y1="220" x2="528" y2="220" stroke="var(--ink)" stroke-width="1.5" />
    <text x="528" y="240" text-anchor="end" font-size="10" fill="var(--muted)">capacity →</text>
    <text x="16" y="120" text-anchor="middle" font-size="10" fill="var(--muted)" transform="rotate(-90 16 120)">test error</text>
    <line x1="336" y1="16" x2="336" y2="220" stroke="var(--muted)" stroke-width="1" stroke-dasharray="4 4" />
    <text x="336" y="30" text-anchor="middle" font-size="10" fill="var(--muted)">interpolation threshold</text>
    <text x="524" y="22" text-anchor="end" font-size="10" fill="var(--muted)">train</text>
    <path d="M36,180 C150,150 250,80 336,44 C400,34 470,32 528,30" fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="5 4" />
    <path d="M36,170 C120,162 170,120 230,128 C270,133 300,160 336,178" fill="none" stroke="var(--ink)" stroke-width="2" />
    <path d="M336,178 C380,160 420,140 528,96" fill="none" stroke="var(--brand-green)" stroke-width="2.5" />
    <circle cx="336" cy="178" r="3.5" fill="var(--ink)" />
    <text x="170" y="260" text-anchor="middle" font-size="10" fill="var(--muted)">classical: bias–variance U</text>
    <text x="440" y="260" text-anchor="middle" font-size="10" fill="var(--brand-green)">modern: bigger generalizes better</text>
  </svg>
  <figcaption><span class="ml-cap-id">Fig. 3 — double descent (Belkin et al. 2019).</span> past the threshold (train error near zero) test error descends again — the regime where deep nets live.</figcaption>
</figure>

1. **The Role of Data Structure:** Maybe the sheer volume and inherent structure of modern datasets (like images or natural language) play a crucial role. DNN architectures, with their layers, seem particularly adept at learning hierarchical representations of features (e.g., pixels → edges → textures → object parts → objects). Perhaps the interplay between the model architecture and the patterns present in the data $\mathcal{D}$ strongly guides the learning towards solutions that capture meaningful semantics rather than just fitting noise in $S$.

The truth is likely a complex interplay of these factors (and maybe others we haven't discovered yet). Understanding *why* deep learning generalizes the way it does remains one of the most fundamental and exciting open questions in the field.

### Where do we stand?

So, where does this leave us? The classical foundations of machine learning – minimizing empirical risk $\mathcal{R}_{\text{emp}}$ as a proxy for true risk $\mathcal{R}$, understanding the bias-variance tradeoff – are still the bedrock. They provide the essential language and the core concepts for reasoning about learning from data.

However, the runaway success and sometimes counter-intuitive behavior of deep learning, particularly its ability to generalize despite massive overparameterization, show that this foundation might be incomplete. The empirical reality seems to be outrunning the established theory. It's like we built incredibly fast spaceships using principles derived from horse-drawn carriages – they *work*, sometimes astonishingly well, but understanding *why* and predicting all their behaviors requires digging deeper, maybe even developing new theoretical frameworks.

This isn't just a philosophical point for academics. This gap between classical theory and modern practice has real, tangible consequences when we try to apply these powerful models to the messy, complicated problems of the real world. One of the first places where the neat theoretical assumptions (like data drawn i.i.d. from a nice $\mathcal{D}$) collide head-on with this messy reality is when our data isn't nicely balanced between categories. What happens then? How do our attempts to *fix* the data interact with these already complex and somewhat mysterious models? That's exactly what we'll dive into next time. Stay curious!

[^vapnik1998]: Vapnik, V. N. (1998). *Statistical Learning Theory*. Wiley.
[^valiant1984]: Valiant, L. G. (1984). A theory of the learnable. *Communications of the ACM*, 27(11), 1134–1142.
[^geman1992]: Geman, S., Bienenstock, E., & Doursat, R. (1992). Neural networks and the bias/variance dilemma. *Neural Computation*, 4(1), 2–58.
[^freund1997]: Freund, Y., & Schapire, R. E. (1997). A decision-theoretic generalization of on-line learning and an application to boosting. *Journal of Computer and System Sciences*, 55(1), 119–139.
[^friedman2001]: Friedman, J. H. (2001). Greedy function approximation: A gradient boosting machine. *The Annals of Statistics*, 29(5), 1189–1232.
[^krizhevsky2012]: Krizhevsky, A., Sutskever, I., & Hinton, G. E. (2012). ImageNet classification with deep convolutional neural networks. *Advances in Neural Information Processing Systems*, 25.
[^hochreiter1997]: Hochreiter, S., & Schmidhuber, J. (1997). Flat minima. *Neural Computation*, 9(1), 1–42.
[^keskar2016]: Keskar, N. S., Mudigere, D., Nocedal, J., Smelyanskiy, M., & Tang, P. T. P. (2016). On large-batch training for deep learning: Generalization gap and sharp minima. *arXiv:1609.04836*.
[^gunasekar2017]: Gunasekar, S., Woodworth, B. E., Bhojanapalli, S., Neyshabur, B., & Srebro, N. (2017). Implicit bias of gradient descent on linear convolutional networks. *Advances in Neural Information Processing Systems*, 30.
[^belkin2019]: Belkin, M., Hsu, D., Ma, S., & Mandal, S. (2019). Reconciling modern machine-learning practice and the classical bias–variance trade-off. *Proceedings of the National Academy of Sciences*, 116(32), 15849–15854.
