---
title: "Beyond Probabilistic Learning: Rethinking Machine Learning in the Era of Imbalanced Data"
date: 2024-08-31
description: "Is it really all about probabilities?"
author: "Pablo Olivares"
tags: ["machine-learning", "imbalanced-data", "calibration", "distribution-shift"]
categories: ["Machine Learning"]
draft: false
---

Modern machine learning (ML) is at a crossroads. As deep learning models and ensemble techniques reach unparalleled levels of performance, it’s becoming clear that traditional statistical foundations may no longer be sufficient to explain or guide the most advanced models. Despite the success of strong learners like deep neural networks, these models excel in real-world scenarios even when violating the core principles of classical statistical learning theory.

Particularly, imbalanced data and calibration problems expose the limitations of traditional theory. Models that dominate competitions like Kaggle often achieve high accuracy while producing unreliable probabilistic estimates. This brings us to a concerning question: Is the traditional statistical and probabilistic framework still enough to understand why modern machine learning models work so well?

This article will explore this question by examining the disconnect between classical theory and modern machine learning, focusing on key challenges like calibration, imbalanced data, distribution shift, and the paradox of strong learners' success. We’ll also argue that the time has come to rethink the foundational assumptions of learning theory, suggesting a broader framework to understand machine learning's real-world complexities.

### The Statistical Foundations of Learning: From Weak to Strong Learners

Classical machine learning theory revolves around the concept of **expected risk minimization**, where the goal is to find a model that minimizes the average error across the true data distribution. This error is typically defined using a loss function $L(f(x), y)$, where $f(x)$ is the prediction made by the model, and $y$ is the actual label. The expected risk, or true risk, is represented mathematically as:

$$
\mathcal{R}(f) = \mathbb{E}_{(x,y) \sim \mathcal{D}}[L(f(x), y)],
$$

where $ \mathcal{D} $ is the true data distribution. In practice, however, we do not have access to the true distribution $ \mathcal{D} $, and we instead minimize the **empirical risk**, which is calculated over a finite training set. This discrepancy between the true risk and empirical risk is one of the main sources of error in machine learning.

In classical theory, models are often categorized as either **weak learners** or **strong learners**. A **weak learner** is defined as a model that performs slightly better than random guessing. In contrast, a **strong learner** can achieve high accuracy consistently. The goal of ensemble methods such as **AdaBoost** or **Gradient Boosting** is to turn a set of weak learners into a strong learner. This process is typically expressed as a weighted combination of weak learners:

$$
f(x) = \sum_{t=1}^{T} \alpha_t h_t(x),
$$

where $h_t(x)$ represents each weak learner, and $ \alpha_t $ are weights assigned to these learners. In theory, by iteratively correcting the errors of the weak learners, we can produce a strong learner with significantly improved performance. 

However, as models become more complex and overparameterized—such as deep neural networks with millions of parameters—these theoretical distinctions blur. Classical statistical learning theory suggests that such models should overfit and perform poorly on unseen data, but in reality, they generalize well, challenging the foundational assumptions of weak and strong learners.

### Imbalanced Data: When Statistical Assumptions Break Down

One of the major challenges where statistical theory breaks down is in handling **imbalanced data**. In many real-world problems, such as fraud detection, medical diagnosis, and rare event prediction, one class is significantly underrepresented compared to the others. This imbalance creates problems for machine learning models, which tend to be biased towards the majority class, often neglecting the minority class entirely.

To combat this, several **resampling techniques** and **cost-sensitive methods** have been developed. However, these approaches often disrupt the original data distribution, leading to a violation of the i.i.d. (independent and identically distributed) assumption, which is central to classical learning theory. Let's explore some of the common methods used to address imbalanced data:

#### Synthetic Minority Over-sampling Technique (SMOTE)

**SMOTE** is one of the most popular methods to address imbalanced data. It operates by creating synthetic examples for the minority class. Given a feature vector from the minority class, SMOTE finds its $k$-nearest neighbors and generates new synthetic examples by interpolating between the original vector and one of its neighbors. Mathematically, for a minority class instance $ x_i $, a synthetic instance $ x_{\text{new}} $ is created as:

$$
x_{\text{new}} = x_i + \lambda \cdot (x_{\text{nn}} - x_i),
$$

where $ x_{\text{nn}} $ is a randomly chosen neighbor of $ x_i $, and $ \lambda $ is a random number between 0 and 1. By generating these synthetic examples, SMOTE helps to rebalance the dataset. However, this method alters the data distribution and may introduce unrealistic examples, which violates the statistical assumptions underlying traditional models.

#### Adaptive Synthetic Sampling (ADASYN)

**ADASYN** extends SMOTE by focusing more on generating synthetic samples for minority instances that are harder to classify. Specifically, ADASYN adjusts the number of synthetic examples generated for each minority class instance based on its **density**—instances that are in sparsely populated regions of the feature space are given more synthetic examples. The idea is to focus the sampling effort on the most difficult-to-learn regions, which in theory should help improve model performance on challenging cases.

While ADASYN improves upon SMOTE by being more targeted, it still disrupts the original data distribution and may lead to overfitting in certain regions of the feature space.

#### Tomek Links and Edited Nearest Neighbors (ENN)

Another approach to dealing with imbalanced data is **Tomek links** and **Edited Nearest Neighbors (ENN)**. These techniques focus on **cleaning** the dataset by removing instances that are deemed noisy or redundant.

A **Tomek link** is a pair of instances from different classes that are each other's nearest neighbors. If a Tomek link is found, one or both instances in the pair are removed, under the assumption that these instances represent borderline or overlapping areas of the feature space that could confuse the model. This results in a cleaner separation between classes, but again, it alters the data distribution, removing potentially informative data points.

**Edited Nearest Neighbors (ENN)** also remove noisy or misclassified examples based on the nearest neighbors rule. If an instance is misclassified by its $k$-nearest neighbors, it is removed from the dataset. Like Tomek links, ENN helps to clean the dataset but also disrupts the natural class distribution.

While these resampling methods improve performance on imbalanced datasets on weak learners, they fundamentally alter the data distribution. This presents a theoretical incoherence with the principles of statistical learning, which rely on the assumption that the training data is a representative sample of the real-world data distribution. By changing the distribution through synthetic samples or removing instances, these methods distort the relationship between the empirical risk and the true risk, leading to models that may perform well on validation metrics but struggle when deployed in real-world settings where the data distribution differs.

In a similar way, **cost-sensitive learning**—which assigns higher penalties to minority class misclassifications—skews the loss function and alters the balance of risk minimization. While effective, this approach deviates from the original goal of minimizing a consistent loss function across the entire data distribution.

### Distribution Shift and its Implications

As we were foreshadowing, the introduction of synthetic data and cost-sensitive methods raises concerns about **distribution shift**. Distribution shift refers to the phenomenon where the data the model encounters in the real world differs from the training data distribution. This shift is exacerbated when resampling or cost-sensitive techniques are employed, as the model is optimized on a distribution that is no longer reflective of the true underlying process.

This presents significant challenges, especially when models trained with such techniques are deployed in dynamic environments where the data evolves over time. For instance, in fraud detection or disease monitoring, a model trained on resampled data may perform well initially but fail to generalize as the underlying patterns shift.

### Calibration: Beyond Accuracy in Model Evaluation

In addition to the problems posed by imbalanced data, **calibration** presents another challenge for machine learning models. Calibration refers to how well a model's predicted probabilities align with the true likelihood of an event occurring. A model is said to be **well-calibrated** if, for predictions made with a certain probability $ p $, the true outcomes occur with that same probability $ p $. In other words, if a model predicts a 70% chance of rain, it should rain 70% of the time when that prediction is made.

#### Calibration in Practice: Platt Scaling and Temperature Scaling

Many machine learning models, particularly those used in high-stakes environments like finance and healthcare, require not only high accuracy but also reliable probabilistic estimates. However, **Kaggle-winning models** and other high-performing systems often excel in accuracy while producing poorly calibrated probability estimates. This is particularly problematic in cases where decisions rely heavily on predicted probabilities rather than class labels.

One common approach to improving calibration is **Platt scaling**, which is often used with **Support Vector Machines (SVMs)**. Platt scaling applies a logistic regression model to the output scores of the SVM, mapping these scores to probabilities. Given an uncalibrated score $ f(x) $, Platt scaling adjusts it by finding the parameters $ A $ and $ B $ such that:

$$
P(y=1|f(x)) = \frac{1}{1 + \exp(A f(x) + B)}.
$$

Platt scaling has been widely used but often underperforms with modern deep learning models, whose overconfident predictions are difficult to correct with simple transformations.

Another widely used method is **temperature scaling**, which is particularly useful for deep neural networks. Temperature scaling works by dividing the logits (the raw output of a neural network before applying the softmax function) by a constant temperature parameter $ T $. The goal is to find the value of $ T $ that best calibrates the predicted probabilities without affecting the model's accuracy. The scaled probabilities are given by:

$$
\hat{p}_i = \frac{\exp(z_i / T)}{\sum_j \exp(z_j / T)},
$$

where $ z_i $ are the original logits, and $ T $ is the learned temperature. Unlike Platt scaling, which can change both the ranking and calibration of predictions, temperature scaling only adjusts the calibration, preserving the original model’s accuracy. Yet, despite its effectiveness, temperature scaling is still a post-hoc correction, which doesn't address the root cause of miscalibration—namely, the optimization process itself.

#### Conformal Prediction: A Step Beyond Calibration

While Platt and temperature scaling focus on calibrating predicted probabilities, **conformal prediction** takes this a step further by providing calibrated prediction intervals or sets, rather than single-point predictions. Conformal prediction aims to offer coverage guarantees, ensuring that the true label lies within the predicted set with a predefined probability.

The approach works by defining a nonconformity score for each instance, which measures how unusual or nonconforming the instance is compared to the training data. These scores are then used to create prediction intervals that maintain a desired coverage level. For example, a conformal predictor can guarantee that the correct label is included in the prediction set with 95% probability. 

Conformal prediction provides a valuable tool for addressing the uncertainty inherent in many machine learning models, especially in domains where reliable uncertainty estimates are crucial. Unlike traditional calibration methods that only provide a single probability score, conformal prediction offers a more nuanced view by quantifying uncertainty at the instance level.

Nevertheless, while calibration and conformal prediction are consistent with the principles of statistical theory, they highlight an important limitation: even poorly calibrated models can achieve remarkable success in practice. This suggests that accuracy alone might not be sufficient to explain machine learning performance, and that the statistical framework, while useful, might not capture the full complexity of the learning process.

### Breaking Free from Statistical Dogma: Towards a New Learning Paradigm

The limitations of traditional statistical learning theory in explaining the success of modern models suggest that a broader understanding is required. While calibration methods and resampling techniques have pushed the boundaries of what classical models can achieve, they do not fully explain the performance of highly complex systems like deep neural networks. **Geometrical approaches**, which model data as points in high-dimensional spaces, and **topological data analysis**, which captures the shape and structure of data, offer promising new directions for understanding the complexities of modern machine learning. These approaches focus not on probability distributions but on the inherent structure and relationships within the data.

Additionally, the concept of **implicit regularization**, where models generalize well despite overfitting to the training data, suggests that optimization processes might inherently bias models toward simpler solutions, even without explicit constraints. These novel ideas point to the need for a more expansive theoretical framework—one that can account for the apparent contradictions between statistical theory and the success of modern machine learning.
