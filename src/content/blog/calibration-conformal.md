---
title: "The Crisis of Confidence in Statistical Purity"
date: 2025-11-19
description: ""
author: "Pablo Olivares"
tags: ["uncertainty-quantification", "calibration", "conformal-prediction"]

categories: ["Machine Learning"]
draft: false
---

Alright, we've journeyed through the surprising generalization of huge neural nets (first part) and navigated the murky waters of imbalanced data, using techniques like SMOTE that felt necessary but theoretically a bit... dodgy (second part). We tweaked our data $\mathcal{S}'$ or our loss function $L'$ to get better performance on metrics like F1 score, especially for those pesky rare classes. Great! Mission accomplished?

Well, hold on. When our fraud detection model, trained on SMOTE'd data, now confidently outputs $P(\text{fraud} | x) = 0.8$, what does that _mean_? Can we take that 80% to the bank? This isn't just about imbalanced data; it turns out that many of the powerhouse models driving AI today have a shaky relationship with the probabilities they produce. And this leads to a fascinating, perhaps even uncomfortable, question: do they _need_ to be statistically "well-behaved" in the classical sense to be incredibly effective?

### The Ideal Perfect Calibration

Let's quickly recap the textbook ideal. We want our model's predicted probabilities $\hat{p}$ to be **calibrated**. This means that if you look at all the times the model predicted an event with probability $p$, that event should actually occur with frequency $p$ in the real world. Formally, for a binary outcome $Y \in \{0, 1\}$: $$ P(Y=1 | \hat{p} = p) = p \quad \forall p \in [0, 1] $$ This feels right, doesn't it? It's statistically pure. Probabilities should mean what they say on the tin. Reliable probabilities seem essential for rational decision-making in medicine, finance, autonomous systems – anywhere uncertainty matters.

Now, here comes the elephant in the room. Many of the models achieving **State-of-the-Art (SOTA)** results on complex benchmarks – massive ResNets, Transformers, powerful Gradient Boosted Trees – are often **terribly miscalibrated** straight out of the box. They tend to be wildly **overconfident**, assigning probabilities near 0 or 1 far too readily (as highlighted in Guo et al., 2017).

Think about that. These models are winning competitions, recognizing images better than humans in some cases, generating coherent text... all while being demonstrably bad at estimating the true likelihood of their own correctness according to the classical definition.

**This presents a major paradox and a challenge to the statistical orthodoxy.** If perfect calibration were truly a prerequisite for high performance, how could these SOTA models function so well? Their success _in spite of_ poor calibration suggests that maybe, just maybe, achieving that specific kind of statistical purity isn't the only path to effective pattern recognition and decision-making. Maybe minimizing the task-specific loss (like cross-entropy for classification accuracy) finds powerful representations and decision boundaries, even if the side effect is less interpretability. The models seem to prioritize getting the answer _right_ over expressing perfectly nuanced uncertainty in the classical sense.

Why does this happen? As we touched on before, the optimization process (like minimizing cross-entropy with SGD) incentivizes driving probabilities to extremes for separable training data. High model capacity makes this separation easy. And techniques used for imbalance (resampling, cost-weighting) can further distort the output probabilities relative to the true data distribution $\mathcal{D}$. The models learn what they're told to learn – minimize the given loss on the given (potentially modified) data – and good calibration isn't usually part of that explicit objective.

### Patching the Symptoms

Naturally, the mismatch between the model's raw output and the desired statistical property led to **post-hoc calibration** methods. We take the model's outputs (logits $z$ or initial probabilities $\hat{p}$) and try to "fix" them using a separate calibration dataset.

We can visualize the miscalibration using **reliability diagrams** (plotting actual accuracy within bins vs. average predicted confidence per bin) and quantify it with metrics like **Expected Calibration Error (ECE)**: $$ ECE = \sum_{m=1}^{M} \frac{|B_m|}{N} |\text{acc}(B_m) - \text{conf}(B_m)| $$

Here's what this formula is doing: you divide your predictions into $M$ bins based on confidence levels (e.g., bin 1 is all predictions with confidence 0–10%, bin 2 is 10–20%, etc.). For each bin $B_m$, you compute $\text{acc}(B_m)$, the actual fraction of correct predictions in that bin, and $\text{conf}(B_m)$, the average predicted confidence of examples in that bin. The term $\frac{|B_m|}{N}$ is the proportion of total samples that fell into bin $m$. Then you sum the weighted absolute gap between accuracy and confidence across all bins. In a perfectly calibrated model, these gaps are zero everywhere, so $ECE = 0$. High ECE means your model is systematically over- or under-confident in some bins—the miscalibration is real and measurable.

Then we apply fixes:

- **Platt Scaling:** Take the model's raw logits $z$ and fit a simple sigmoid $\sigma(Az+B)$ on top, learned via logistic regression on the calibration set. Two parameters, that's it. The idea is: maybe the model's scores are just on the wrong scale—stretch and shift them a bit and they'll line up with reality. It works okay for simpler models (SVMs, shallow networks), but for modern deep nets? Often feels like putting a band-aid on a much deeper wound. The sigmoid is too rigid; it can't capture the fact that the model might be confidently wrong about certain types of examples (say, all the edge cases) while being reasonable about others. Once you deploy it, you're stuck with that one sigmoid forever.

- **Temperature Scaling:** Here's an idea that feels almost too simple to work: divide all your logits by a single scalar $T$ before the softmax, like $\hat{q}_i = \frac{\exp(z_i / T)}{\sum_{j} \exp(z_j / T)}$. Learn $T$ on the calibration set by minimizing cross-entropy. What's happening? If $T>1$, you're softening the logits—pulling extreme values back toward the middle, expressing more uncertainty. If $T<1$, you're sharpening—amplifying the model's convictions. The beauty is that this _doesn't change which class wins_; `argmax` is invariant to this temperature shift. You get the same predictions but with different confidence levels. For modern deep neural networks, this one-parameter fix is surprisingly effective—often more so than Platt Scaling. Why? Because neural nets tend to be _uniformly_ overconfident across the board, and temperature scaling corrects that global bias elegantly. The catch: it can't fix localized miscalibration. If the model is overconfident on one class and underconfident on another, a single $T$ will only trade one problem for another.

- **Isotonic Regression:** This is where we get more aggressive. Instead of fitting a global transformation (like a sigmoid or a single temperature), isotonic regression learns a _piecewise constant_ monotonic mapping from your model's scores to calibrated probabilities. Conceptually: divide the range of scores into bins, sort them, and fit monotonically increasing step functions. The beauty is flexibility—it can handle non-uniform miscalibration, catching situations where the model is wildly overconfident at high scores but reasonable at medium ones. The tradeoff? More parameters to learn, which means you need a larger calibration set or risk overfitting the calibration itself. Also, it's less interpretable; you can't write down a simple formula like "divide by $T$". And there's an implicit assumption built in: monotonicity. If your model somehow violates that (which shouldn't happen in well-behaved classifiers, but can in weird edge cases), isotonic regression will force it anyway. It's a tool that gives you power, but demands respect—use it when you have enough calibration data and you suspect the miscalibration is genuinely non-uniform.

These methods _work_ in the sense that they reduce ECE and make the reliability diagram look prettier (closer to the diagonal). Temperature scaling, in particular, is a common step in deploying neural nets now.

But let's be critical. What are we really doing here? We have a model that achieves SOTA performance despite producing miscalibrated scores. We then apply a simple transformation _after training_ to make the scores align better with the statistical ideal. It's like the model aced the exam using its own weird methods, and we're just adjusting the score report afterward to fit a standard format. Does this adjustment change the fact that the model's internal "reasoning" (its learned representations and weights) produced those scores in the first place? Does it fundamentally increase our trust, or just make the numbers _look_ better according to one specific definition? It feels more like satisfying a statistical checklist than fundamentally improving the model's understanding.

### An Alternative Angle

Maybe the relentless focus on getting that single probability number $p$ to perfectly match the true frequency is missing the point, especially when the models seem to work well without it. What if we changed the goal? Instead of asking "What's the exact probability?", what if we asked "Can you give me a _set_ of predictions that is guaranteed to contain the true answer most of the time?"

This is the core idea behind **Conformal Prediction (CP)**. CP doesn't try to "fix" the model's internal probabilities. Instead, it uses a calibration dataset to determine a threshold for how "weird" a prediction looks, and then outputs a **prediction set** $\mathcal{C}(x)$ for a new input $x$. The magic is that CP provides a formal guarantee:

$$ P(y_{true} \in \mathcal{C}(x)) \ge 1 - \alpha $$

Here, $y_{true}$ is the actual true label, and $1-\alpha$ is our desired confidence level (e.g., 95% if $\alpha=0.05$). This guarantee holds under minimal assumptions (exchangeability of data), _regardless_ of how good or bad the underlying model is, or how miscalibrated its raw scores are!

How does it work (in brief)?

1. Define a **nonconformity score** $s(x, y)$ that measures how poorly the model's prediction for $x$ matches the label $y$. A high score means the label looks "nonconforming" or weird given the model's output for $x$. (Example: $s(x, y) = 1 - \hat{p}_y$, where $\hat{p}_y$ is the model's raw predicted probability for class $y$).
2. Calculate these scores for all points in a separate **calibration set**. This gives a distribution of typical scores.
3. Find the $(1-\alpha)$ quantile $q$ of these calibration scores. This $q$ is our threshold.
4. For a new test point $x_{new}$, create the prediction set $\mathcal{C}(x_{new})$ by including all possible labels $y'$ for which the nonconformity score $s(x_{new}, y')$ is _less than or equal to_ the threshold $q$.

If the model is confident and correct, the set $\mathcal{C}(x)$ might contain only one label. If the model is uncertain, the set might contain multiple labels, honestly reflecting the ambiguity.

CP offers a different path. It provides rigorous, assumption-light uncertainty quantification _without_ demanding perfect point probability calibration from the underlying model. It accepts the model's scores (however flawed) and builds a valid guarantee _around_ them. This feels much more aligned with the empirical reality where models can be powerful pattern recognizers even if their probability estimates aren't statistically pure. It shifts the focus from "is this probability number correct?" to "is the true answer within this guaranteed set?".

### Towards a New Understanding Beyond Classical Stats?

So, where does this leave us? We're faced with a fascinating disconnect. Our most powerful machine learning models achieve incredible empirical success, often dominating benchmarks and real-world tasks. Yet, under the lens of classical statistical learning theory, they exhibit behaviors (generalizing despite overparameterization, performing well despite miscalibration) that are unexpected or even paradoxical.

Trying to force these models back into the classical mold with post-hoc fixes like temperature scaling feels insufficient. Methods like Conformal Prediction offer a pragmatic, statistically sound way to handle uncertainty that gracefully sidesteps some of these issues by changing the nature of the prediction.

But the deeper question remains: _Why_ do these models work so well in the first place, even when violating classical statistical norms? The fact that SOTA performance doesn't strictly require perfect calibration suggests that our traditional statistical framework, while foundational, might not be the right or complete theoretical lens to fully _understand_ the mechanisms behind modern deep learning success.

Perhaps minimizing expected risk $\mathcal{R}(f)$ is the ultimate goal, but the way modern models navigate towards good solutions via empirical risk $\mathcal{R}_{emp}(f)$ minimization, especially in high-dimensional, overparameterized regimes, involves dynamics we don't fully grasp using only classical tools.

This points towards the urgent need for new theoretical perspectives, drawing potentially from:

- **Optimization Dynamics & Implicit Bias:** Deeply analyzing the trajectories taken by optimizers like SGD in high-dimensional loss landscapes. What properties do the solutions they find have? (Recall the "flat minima" and implicit regularization ideas from the first part).
- **High-Dimensional Geometry & Topology:** The spaces these models operate in are incredibly large. Perhaps the geometric shape of the data manifold, the loss surface, and the function space itself holds the key. Tools from differential geometry or algebraic topology can reveal structures hidden from a purely probabilistic view.
- **Explicitly Embracing Phenomena like Double Descent:** Building theories that inherently predict and explain why _more_ parameters can sometimes lead to _better_ generalization beyond the interpolation point.

The journey of modern machine learning seems to indicate that while statistical principles are vital, the path to understanding might require broadening our theoretical toolkit considerably. The models work – now we need theories that can truly explain _why_, embracing the complexity and the surprising empirical realities, rather than just trying to patch them to fit old assumptions. The most exciting discoveries might lie at the intersection of statistics, optimization, geometry, and topology. The game is afoot!