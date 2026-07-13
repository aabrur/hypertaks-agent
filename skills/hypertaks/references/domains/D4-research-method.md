# D4 - Research Methodology
Every entry: **when · inputs · formula · output shape · traps · volatility**

**The law this pack enforces: the design determines the permitted claim.**
Data never upgrades a design. Correlational data cannot support a causal claim. A convenience sample cannot support a population-level generalization. Every result must be delivered with its **claim ceiling** (the strongest statement the design permits).

---

## Research Design Selection (the claim lattice)

- **When:** Before any data is collected, and before writing conclusions.
- **Inputs:** Question's verb, manipulability of independent variable, random assignment feasibility.
- **Output shape:** A design matrix with one row per candidate design, stating the claim ceiling.
| Design | Manipulation | Random assignment | Permitted claim | Forbidden claim |
|---|---|---|---|---|
| True experimental | yes | yes | causal (within studied units) | population generalization (unless probabilistic sample) |
| Quasi-experimental | yes | no | conditional causal | unqualified causal claim |
| Correlational | no | no | association, prediction | **any causal claim** |
| Descriptive / survey | no | no | prevalence, profile | causation |
| Case study | no | no | theory generation | statistical generalization |
| Mixed methods | varies | varies | bounded by **strongest single component** | a causal claim from non-causal strands |
- **Traps:**
  - Calling conditional association an "effect".
  - Calling a study experimental when nothing was manipulated.
  - Treating longitudinal correlation as causal.
  - Choosing design for convenience, then writing matching questions.
- **Volatility:** LOW

## Hypothesis Formulation

- **When:** Explanatory/comparative designs where statistical tests run.
- **Inputs:** Construct pair, linking theory, operational definition.
- **Formula:** `H0: mu1 = mu2` (equivalently `beta = 0`, `rho = 0`); `H1: mu1 != mu2` (two-tailed) or `H1: mu1 > mu2` (one-tailed).
- **Output shape:** The research hypothesis, statistical hypothesis, operational definition of each variable, deciding test, and claim licensed if H0 is rejected.
- **Traps:**
  - Writing H1 as no difference.
  - Switching to one-tailed test post-hoc (p-hacking).
  - "Accepting H0" (failing to reject isn't evidence of absence).
  - "Proving" H1.
  - Constructs lacking operational definitions.
  - Using causal verbs in correlational study hypotheses.
- **Volatility:** LOW

## Population, Sample, and Sampling Frame

- **When:** Defining who the claim is about; before computing sample size.
- **Inputs:** Inclusion/exclusion criteria, enumerable unit list, source/date.
- **Output shape:** Definitions for target population, accessible population, sampling frame, sample, and the coverage gap.
- **Traps:**
  - Over-generalizing beyond the sampling frame.
  - Confusing response rate with sampling fraction.
  - Ignoring nonresponse bias.
  - Using Slovin with uncounted N.
- **Volatility:** LOW

## Sampling Technique and the Inference It Permits

- **When:** Choosing how units are drawn.
- **Inputs:** Frame, chance mechanism, unit selection probability.
- **Formula:** proportional stratified allocation `n_h = n x (N_h / N)`; systematic interval `k = N / n` with a random start in `[1, k]`; cluster design effect `DEFF = 1 + (m - 1) x rho` and effective sample `n_eff = n / DEFF`, with `m` the average cluster size and `rho` the intraclass correlation.
- **Output shape:** Named technique, described mechanism, explicit claim ceiling.
| Probability technique | Permits |
|---|---|
| Simple random / Systematic / Stratified / Cluster | full statistical inference, generalization |
| Non-probability technique | Permits | Forbids |
|---|---|---|
| Purposive | analytic generalization to theory | population prevalence claims |
| Convenience / Snowball | exploratory description | inferential or population claims |
| Quota | category-balanced description | standard errors |
- **Traps:**
  - **A non-probability sample cannot support population generalizations or margins of error.**
  - Claiming "random selection" when using convenience sampling.
  - Reporting cluster data with simple-random standard errors (ignores DEFF).
  - Applying Slovin to a purposive sample.
- **Volatility:** LOW

## Sample Size Determination (Slovin and power analysis)

- **When:** Sizing a descriptive estimate from a probability sample (Slovin) or testing a hypothesis (power analysis).
- **Inputs:** Slovin: N, margin of error e. Power: 3 of `alpha`, power `1 - beta`, minimum effect size, `n`. **If e is not provided, it is `DATA UNAVAILABLE`. Do not assume e = 0.05.**
- **Formula:** proportion sample size `n0 = Z^2 x p x (1 - p) / e^2`, with the finite population correction `n = n0 / (1 + (n0 - 1) / N)`. **Slovin** is that pair collapsed under `Z ~ 2` and `p = 0.5`: `n = N / (1 + N x e^2)`. Power, two independent means, two-tailed: `n per group = 2 x (Z_(1-alpha/2) + Z_(1-beta))^2 / d^2`, where `d = (mu1 - mu2) / sigma_pooled` and `sigma_pooled = sqrt( ((n1-1)s1^2 + (n2-1)s2^2) / (n1 + n2 - 2) )`. Power for a correlation, via the Fisher transform: `n = ((Z_(1-alpha/2) + Z_(1-beta)) / C)^2 + 3`, with `C = 0.5 x ln((1 + r)/(1 - r))`.
- **Output shape:** A computation block containing inputs, formulas, substitutions, result, assumptions, and claim ceiling.
- **Traps:**
  - Using Slovin for hypothesis-testing studies.
  - Confusing e = 5% with e = 5.
  - Running post-hoc power analysis.
  - Choosing large effect sizes solely to reduce n.
  - Inferring 'e' when it is not provided. If 'e' is missing, it is DATA UNAVAILABLE.
- **Volatility:** LOW

## Validity (construct, internal, external) and Its Threats

- **When:** Study design, and writing limitations/conclusions.
- **Inputs:** Design, instrument, sample, setting, timeline.
- **Formula:** content validity ratio `CVR = (n_e - N/2) / (N/2)`.
- **Output shape:** A validity-threat table mapping threats, mitigation, and residual risk. Risk reappears in limitations.
- **Traps:**
  - Confusing reliability (alpha) with validity.
  - Listing threats in methodology but ignoring them in conclusions.
  - Ignoring the trade-off between internal and external validity.
  - Generalizing from one organization to an industry.
- **Volatility:** LOW

## Instrument Reliability

- **When:** Multi-item scales, coding schemes, or repeated measures.
- **Inputs:** Item-level data, test-retest data, or inter-rater data.
- **Formula:** Cronbach alpha: `alpha = (k / (k - 1)) x (1 - (sum of item variances / variance of the total score))`. Standardized: `alpha = (k x r_bar) / (1 + (k - 1) x r_bar)`. Cohen's kappa: `kappa = (p_o - p_e) / (1 - p_e)`. Attenuation bound: `sqrt(r_xx x r_yy)`.
- **Output shape:** A computation block with k, thresholds, and disclosed deletions.
- **Traps:**
  - Assuming high alpha means a good scale (it rises mechanically with k).
  - Computing one alpha across multiple constructs.
  - Reporting percent agreement instead of kappa.
  - Treating reliability as sufficient for validity.
- **Volatility:** LOW

## Measurement Scales and the Statistics Each Permits

- **When:** Choosing tests.
- **Inputs:** Variable coding and meaning of intervals.
- **Output shape:** Variable table listing scale, permitted statistics, selected test, and justification.
- **Traps:**
  - Averaging nominal codes.
  - Running Pearson correlation on ordinal ranks.
  - Treating counts as ordinal.
  - Confusing software column types with measurement scales.
- **Volatility:** LOW

## Likert Scale Treatment (the ordinal-versus-interval question)

- **When:** Attitude/perception instruments.
- **Inputs:** Response points, items per construct, whether summated.
- **Output shape:** Explicit decision statement treating single items as ordinal and summated constructs as interval.
- **Traps:**
  - Treating single Likert items as interval.
  - Claiming ratio properties (e.g., "twice as satisfied") without a true zero.
  - Averaging items from different constructs.
  - Forgetting to reverse negatively worded items.
- **Volatility:** LOW

## SEM and PLS-SEM

- **When:** Models with latent constructs and multiple paths.
- **Inputs:** Theory-specified model, indicator data, sample.
- **Formula:** composite reliability `CR = (sum of lambda_i)^2 / [ (sum of lambda_i)^2 + sum of (1 - lambda_i^2) ]`; average variance extracted `AVE = (sum of lambda_i^2) / k`; effect size `f^2 = (R2_included - R2_excluded) / (1 - R2_included)`.
- **Output shape:** Two blocks: Measurement model (reliability, validity, VIF) and Structural model (path coefficients, R2, predictive relevance, fit indices).
- **Traps:**
  - Treating reflective vs. formative as software settings, not theory.
  - Running alpha/AVE on formative constructs.
  - Using the "10-times rule" instead of power analysis.
  - Chasing modification indices.
  - Claiming causation from cross-sectional SEM paths.
- **Volatility:** LOW

## Triangulation

- **When:** Single sources/methods leave findings fragile.
- **Inputs:** Multiple sources, methods, analysts, or theories.
- **Output shape:** A convergence table showing findings across sources and resolving divergences.
- **Traps:**
  - Treating divergence as failure rather than a finding.
  - Overstating triangulation (e.g., two interviews from one department).
  - Claiming method triangulation for unrelated questions.
  - Believing triangulation converts correlational designs to causal ones.
- **Volatility:** LOW

## Qualitative Coding (open, axial, selective)

- **When:** Analyzing text to build categories/theory.
- **Inputs:** Transcribed data, coding tool, audit trail.
- **Output shape:** Codebook, category structure, and evidence-backed saturation statement.
- **Traps:**
  - Asserting saturation without evidence (e.g., new-code counts).
  - Reporting code frequencies as population prevalence.
  - Forcing data into pre-existing literature categories.
- **Volatility:** LOW

## Thematic Analysis

- **When:** Finding meaning patterns without full grounded theory.
- **Inputs:** Dataset, explicit stance (inductive/deductive), analytic position.
- **Output shape:** Six evidenced phases: familiarization, initial coding, theme search, review, definition, report. Each theme requires a central concept and exemplar extracts.
- **Traps:**
  - Claiming themes "emerged" (you constructed them).
  - Creating topic summaries instead of concept-organized themes.
  - Using quotes as mere decoration.
  - Applying inter-rater reliability to reflexive designs.
- **Volatility:** LOW

## Citation Shape (APA-style)

- **When:** Academic deliverables.
- **Inputs:** Full source record from the actual read source.
- **Output shape:** In-text citations and an alphabetical reference list (hanging indent, verifiable).
- **Traps:**
  - **Fabricating references** (hallucinations).
  - Citing abstracts while pretending to read the article.
  - Unnecessary secondary citations.
  - Broken DOIs.
  - Padding reference lists.
- **Volatility:** MEDIUM

## Thesis and Dissertation Structure

- **When:** Formal research reports.
- **Inputs:** Institutional template, research questions, claim ceiling.
- **Output shape:** Chapter chain (Intro, Lit Review, Methodology, Results/Discussion, Conclusion).
- **Traps:**
  - Questions the analysis cannot answer.
  - Lit review hypotheses untestable by methodology.
  - Topic gaps instead of knowledge gaps.
  - **Conclusions that exceed the methodology's claim ceiling.**
- **Volatility:** MEDIUM

## Statistical-Conclusion Errors

- **When:** Reporting p-values.
- **Inputs:** Pre-stated analysis plan, test count, effect sizes.
- **Formula:** family-wise error rate `P(at least one false positive) = 1 - (1 - alpha)^m`; Bonferroni: `alpha_adjusted = alpha / m`.
- **Output shape:** P-values, effect sizes, confidence intervals, and total tests run.
- **Traps:**
  - **p-hacking** (fishing for p < 0.05).
  - **HARKing** (hypothesizing after results).
  - Ignoring multiple comparison inflation.
  - Mistaking significance for magnitude.
  - Interpreting p > 0.05 as proof of no effect.
  - Reading p as probability H0 is true.
  - Clean p-values on unsupported designs.
- **Volatility:** LOW
