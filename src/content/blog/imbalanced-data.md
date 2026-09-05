---
title: "When Data Doesn't Play Fair"
date: 2025-07-23
description: "When 99.9% accuracy means nothing: fraud, rare diseases, and learning from lopsided data."
author: "Pablo Olivares"
tags: ["imbalanced-learning", "statistical-learning-theory", "generalization"]

categories: ["Machine Learning"]
draft: false
---


Remember that cozy assumption from basic ML theory? That our training data $\mathcal{S} = \lbrace{(x_1, y_1), \dots, (x_N, y_N)\rbrace}$ is drawn independently and identically distributed (i.i.d.) from some underlying true distribution $\mathcal{D}$? And that minimizing the empirical risk $\mathcal{R}_{emp}(f)$ is a good proxy for minimizing the true risk $\mathcal{R}(f)$ ? It sounds so clean, so elegant.

But what happens when $\mathcal{D}$ itself is... lopsided?

### Welcome to the Imbalance Zone

Think about real-world problems:

- **Fraud Detection:** Most transactions are legit. Maybe only 0.1% are fraudulent.
- **Medical Diagnosis:** Screening for a rare disease? The vast majority of patients will be healthy.
- **Ad Click Prediction:** Most people scrolling past an ad _don't_ click it.
- **Manufacturing Defect Detection:** Hopefully, most items coming off the line are perfectly fine.

In all these cases, one class (the "majority" class, e.g., 'not fraud', 'healthy') dramatically outnumbers the other class (the "minority" class, e.g., 'fraud', 'disease present'). This is **imbalanced data**.

Why is this a problem? Let's think about minimizing that standard empirical risk $\mathcal{R}_{emp}$. If 99.9% of your data is 'not fraud', a lazy model can achieve 99.9% accuracy by simply predicting 'not fraud' _every single time_. The contribution of the few fraud examples to the total loss $\sum L(f(x_i), y_i)$ is minuscule. The optimization process, blindly minimizing the average loss, happily converges to this useless solution because it looks great on the overall accuracy metric.

### Metrics That Matter

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

Often, especially in fraud or disease detection, **Recall for the minority class** is paramount – we'd rather flag a few legitimate transactions (lower precision) than miss actual fraud cases (high recall). Standard empirical risk minimization doesn't optimize for these metrics directly.

### Let's Resample! (And Break Things?)

So, the standard approach fails because the minority class gets drowned out. The most intuitive way to fight back is to change the data itself to make it look more balanced _before_ training. This falls into two main camps: over-sampling and under-sampling.

#### Over-sampling: More of the Little Guy

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
- **ADASYN (Adaptive Synthetic Sampling):** A refinement of SMOTE (He et al., 2008)[^he2008]. ADASYN focuses on generating _more_ synthetic samples for minority instances that are _harder to learn_. It looks at the neighborhood of each minority point $x_i$ and checks the ratio of majority vs. minority neighbors. If $x_i$ has many majority neighbors, it's considered harder to learn (e.g., near the decision boundary), and ADASYN generates more synthetic samples around it.

_Potential Issues with Over-sampling:_ While often effective, creating synthetic data can sometimes blur the lines between classes if done too aggressively, potentially making the classification task harder in some regions. It can also still lead to overfitting, especially if the synthetic samples don't truly represent unseen minority variations. And, of course, it increases the size of your training set, making training slower.

#### Under-sampling: Less of the Big Guy

The opposite approach: let's reduce the representation of the majority class.

- **Random Under-sampling:** Just randomly discard majority class samples until classes are balanced. The huge risk? You might throw away crucial information contained in those majority samples, potentially making the model worse overall.
- **Tomek Links:** A more targeted approach to "clean" the dataset (Tomek, 1976)[^tomek1976]. A Tomek link is a pair of instances $(x_i, x_j)$ from different classes such that they are each other's nearest neighbor. Let $d(\cdot, \cdot)$ be the distance metric. Then $(x_i, x_j)$ is a Tomek link if $d(x_i, x_j) = \min_{k} d(x_i, x_k)$ where $x_k$ has a different class than $x_i$, AND $d(x_i, x_j) = \min_{l} d(x_j, x_l)$ where $x_l$ has a different class than $x_j$. The idea is these points might represent noisy overlap between classes. Removing one or both (usually the majority instance) can lead to a cleaner separation.
- **Edited Nearest Neighbors (ENN):** Another cleaning method (Wilson, 1972)[^wilson1972]. For each instance $x_i$ in the dataset, examine its $k$ nearest neighbors. If the majority class among the neighbors is _different_ from the class of $x_i$ itself, then $x_i$ is deemed potentially noisy or mislabeled, and it gets removed. This tends to remove points that are deep inside regions predominantly occupied by another class.

_Potential Issues with Under-sampling:_ The main risk is always information loss. Random undersampling is particularly dangerous for this reason. Cleaning methods like Tomek Links and ENN are safer but can still remove informative points, and their effectiveness depends heavily on the data structure and choice of $k$ or distance metric.

#### What Have We Actually Done?

Okay, these resampling techniques often _improve_ our desired metrics (like minority class F1-score) on test sets. That's great! But let's put our theorist hat back on for a second. What did we just do to our nice learning setup?

We started with a training set $\mathcal{S}$ hopefully sampled i.i.d. from the true, imbalanced distribution $\mathcal{D}$. We then applied some transformation (SMOTE, ENN, etc.) to get a _new_ training set $\mathcal{S}'$ which effectively represents a different, more balanced distribution $\mathcal{D}'$. We then trained our model $f$ by minimizing the empirical risk on this _modified_ set:

$$
\mathcal{R}'_{emp}(f) = \mathbb{E}_{(x,y) \sim \mathcal{S}'}[L(f(x), y)] \quad (\text{where } \mathcal{S}' \text{ reflects } \mathcal{D}')
$$

But our ultimate goal was to minimize the true risk $\mathcal{R}(f)$ defined on the _original_ distribution $\mathcal{D}$! The theoretical guarantees connecting $\mathcal{R}_{emp}$ and $\mathcal{R}$ from statistical learning theory heavily rely on that i.i.d. assumption – that $\mathcal{S}$ is a direct, representative sample of $\mathcal{D}$. By resampling, we've deliberately broken this assumption. We've trained our model on $\mathcal{D}'$. How well will it perform on $\mathcal{D}$? The theoretical link is severed, or at least significantly weakened, leading to a **distribution shift**. We have a mismatch between the training distribution $P_{train}(x, y)$ (which reflects $\mathcal{D}'$) and the test/deployment distribution $P_{test}(x, y)$ (which reflects the real-world $\mathcal{D}$). Specifically, resampling techniques typically introduce:

- **Prior Probability Shift:** $P_{train}(y) \neq P_{test}(y)$. We artificially changed the class balance.
- **Covariate Shift:** $P_{train}(x) \neq P_{test}(x)$. Over-sampling adds points only in certain regions; under-sampling removes points. The distribution of features $x$ is altered.

The danger is that the model $f$ learns rules that work well in the balanced, potentially cleaned-up world of $\mathcal{D}'$, but these rules might not be robust or optimal when deployed in the wild, imbalanced world of $\mathcal{D}$. It's like learning to ride a bike with heavy-duty training wheels (resampling) and then suddenly having them removed on a bumpy road (deployment). Performance might drop unexpectedly.

Furthermore (and this is a sneak peek for next time), training with artificially balanced class priors can seriously mess up the model's output probabilities. A model trained on a 50/50 balanced set might output probabilities around 0.5 for ambiguous cases, but those probabilities are meaningless for the original 99/1 imbalanced distribution.

### Cost-Sensitive Learning: Changing the Rules, Not the Players

Instead of manipulating the data $\mathcal{S}$, what if we manipulate the loss function $L$ instead? This is the idea behind **cost-sensitive learning**. We acknowledge that misclassifying a minority instance (e.g., missing a fraud case) is much more costly than misclassifying a majority instance (e.g., flagging a legit transaction).

We can incorporate these costs directly into the loss. For example, using weighted cross-entropy:

$$
L'(f(x), y) = w_y \cdot L_{CE}(f(x), y)
$$

Here, $w_y$ is a weight assigned based on the true class $y$. We would set $w_{minority} > w_{majority}$ (often inversely proportional to class frequencies). This tells the optimizer: "Pay more attention to getting the minority class right!"

_Pros:_ Doesn't alter the data distribution $\mathcal{S}$. Keeps the connection to $\mathcal{D}$ more direct. _Cons:_ Still changes the objective function – we're no longer minimizing the standard $\mathcal{R}_{emp}$ on $\mathcal{D}$. Choosing the optimal weights $w_y$ can be non-trivial. It can also affect the calibration of the output probabilities.

### Walking the Tightrope: A Necessary Evil or a Better Path?

In applied machine learning, we live in a world of pragmatism. Resampling techniques and cost-sensitive learning are not just tricks; they are indispensable tools that consistently deliver models with better real-world performance on the metrics that matter, like finding those few crucial cases of fraud or disease.

And here we arrive at a fascinating and slightly uncomfortable paradox: by deliberately **breaking** the clean i.i.d. assumption that underpins so much of learning theory, we often build models that are **more useful** in the real world.

This should make us pause and think. Are we merely applying a 'hack' to fix a broken learning process? Or is the textbook formulation of minimizing empirical risk on the original distribution $\mathcal{D}$ not the whole story for achieving practical success? Perhaps the goal shouldn't be to create a perfect statistical mirror of the imbalanced reality, but to create a learning environment, even an artificial one like $\mathcal{S}'$, that most efficiently **teaches the model the concepts** needed to distinguish between classes. We aren't just showing it data; we are guiding its focus.

This perspective, however, raises a critical new question. If we've trained our model in this artificial, 'balanced' classroom, how much can we trust what it says when it graduates to the real world? It might be great at sorting 'fraud' from 'not fraud' (high F1-score), but what does its prediction of "70% probability of fraud" actually **mean**? Its sense of probability was honed on a 50/50 dataset, not the real 99.9/0.1 world. The model is a good classifier, but is it a reliable prognosticator?

To trust our models beyond their classification accuracy, we must be able to understand and quantify their uncertainty. This leads us directly to our next topic: **model calibration and the powerful framework of conformal prediction**. These aren't just tools for fine-tuning; they are lenses through which we can begin to unravel what our models truly learn and how much confidence we should have in their predictions, especially when the path to learning was anything but straight. Let's tackle that next.
[^chawla2002]: Chawla, N. V., Bowyer, K. W., Hall, L. O., & Kegelmeyer, W. P. (2002). SMOTE: Synthetic minority over-sampling technique. *Journal of Artificial Intelligence Research*, 16, 321–357.
[^he2008]: He, H., Bai, Y., Garcia, E. A., & Li, S. (2008). ADASYN: Adaptive synthetic sampling approach for imbalanced learning. *Proc. IEEE Int. Joint Conf. on Neural Networks (IJCNN)*, 1322–1328.
[^tomek1976]: Tomek, I. (1976). Two modifications of CNN. *IEEE Trans. Systems, Man, and Cybernetics*, SMC-6(11), 769–772.
[^wilson1972]: Wilson, D. L. (1972). Asymptotic properties of nearest neighbor rules using edited data. *IEEE Trans. Systems, Man, and Cybernetics*, SMC-2(3), 408–421.
