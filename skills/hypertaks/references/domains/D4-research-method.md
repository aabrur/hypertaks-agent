# D4 - Research Methodology
Every entry: **when · inputs · formula · output shape · traps · volatility**

**The law this pack enforces: the design determines the permitted claim.**
Data never upgrades a design. Correlational data cannot support a causal claim - not
with a larger sample, not with a smaller p-value, not with a more sophisticated model.
A purposive or convenience sample cannot support a population-level generalization, no
matter how many respondents answered. Every result must be delivered with its **claim
ceiling** (the strongest statement the design permits), and the abstract, discussion,
and conclusion must not exceed it. Exceeding the ceiling is the failure mode this pack
exists to block, and it is repeated below wherever it applies.

---

## Research Design Selection (the claim lattice)

- **When:** before any data is collected, and again before any conclusion is written.
- **Inputs:** the question's verb (describe / relate / explain / cause), whether the
  independent variable can be manipulated, whether units can be randomly assigned.
- **Output shape:** a design matrix, one row per candidate design, with the ceiling stated.

| Design | Manipulation | Random assignment | Permitted claim | Forbidden claim |
|---|---|---|---|---|
| True experimental | yes | yes | causal, within the studied units and setting | population generalization unless the sample was probabilistic |
| Quasi-experimental | yes | no | conditional causal, weakened by selection; needs matching or a defensible counterfactual | unqualified causal claim |
| Correlational | no | no | association, co-variation, prediction, direction and magnitude | **any causal claim, ever** |
| Descriptive / survey | no | no | prevalence, distribution, profile at a point in time | relationship as explanation; causation |
| Case study | no | no | deep context, theory generation, analytic generalization to theory | statistical generalization to a population |
| Mixed methods | varies | varies | bounded by the **strongest single component** | a causal claim assembled from two non-causal strands |

  Mixed-methods notation records priority and sequence: QUAN -> qual (sequential
  explanatory), QUAL -> quan (sequential exploratory), QUAN + QUAL (convergent
  parallel). Its deliverable is an **integration point** - a joint display or a stated
  meta-inference - not two reports stapled together.
- **Traps:** running a cross-sectional survey, fitting a regression, and writing "X
  influences Y" or "the effect of X on Y" - a coefficient on observational data is a
  **conditional association**, and calling it an effect is the most common over-claim
  in applied research. Calling a study experimental when nothing was manipulated.
  Treating a longitudinal correlation as causal because time order was observed:
  temporal precedence is necessary for causation and never sufficient, since the
  confounder was there first too. Choosing the design for convenience, then writing
  the question to match it.
- **Volatility:** LOW

## Hypothesis Formulation

- **When:** the design is explanatory or comparative and a statistical test will run.
- **Inputs:** the construct pair, the theory linking them, and an operational
  definition of each variable.
- **Formula:** `H0: mu1 = mu2` (equivalently `beta = 0`, `rho = 0`);
  `H1: mu1 != mu2` (non-directional, two-tailed) or `H1: mu1 > mu2` (directional,
  one-tailed).
- **Output shape:** per hypothesis - the research hypothesis in words, the statistical
  hypothesis in symbols, the operational definition of each variable (instrument, item
  count, scoring range), the deciding test, and the claim licensed if H0 is rejected.
  An operational definition is the construct made observable: "employee engagement" is
  not measurable; "the mean of 9 items scored 0-6 on the named scale" is.
- **Traps:** writing H1 as a statement of no difference. Switching to a one-tailed test
  after seeing p = .07 two-tailed - that is p-hacking, and it forfeits the right to
  report an effect in the other direction whatever the data show. "Accepting H0": you
  fail to reject, which is not evidence of absence. "Proving" H1: no test proves.
  Constructs with no operational definition that no collected variable can test. Causal
  verbs in the hypothesis of a correlational study - if the design cannot deliver
  causation, write the hypothesis in association terms or upgrade the design.
- **Volatility:** LOW

## Population, Sample, and Sampling Frame

- **When:** defining who the claim is about. Always before sample size is computed.
- **Inputs:** inclusion and exclusion criteria; an enumerable list of units, or the
  admission that none exists; the source and date of that list.
- **Output shape:** four stacked definitions - **target population** (the set the claim
  is about), **accessible population** (the reachable part), **sampling frame** (the
  operational list drawn from, with source and date), **sample** (units drawn, with
  response rate) - plus the named **coverage gap** between frame and target population.
- **Traps:** the claim travels only as far as the frame allows. Sampling an Instagram
  follower list makes the population "our followers", not "consumers". Declaring the
  population "all residents of the city", then intercepting 100 people at one mall on
  one Saturday: the real frame is mall visitors that day, and the write-up must say so.
  Confusing response rate with sampling fraction. Ignoring nonresponse bias - on a 30%
  response satisfaction survey, the angry and the delighted answered. Using Slovin with
  an N that was never enumerated: if you cannot count N, you cannot use a formula that
  takes N.
- **Volatility:** LOW

## Sampling Technique and the Inference It Permits

- **When:** choosing how units are drawn. This choice, not the sample size, decides
  whether inference to a population is legitimate at all.
- **Inputs:** a frame (or its absence), a chance mechanism (or its absence), and the
  selection probability of each unit.
- **Formula:** proportional stratified allocation `n_h = n x (N_h / N)`; systematic
  interval `k = N / n` with a random start in `[1, k]`; cluster design effect
  `DEFF = 1 + (m - 1) x rho` and effective sample `n_eff = n / DEFF`, with `m` the
  average cluster size and `rho` the intraclass correlation.
- **Output shape:** the technique named, the mechanism described, and an explicit
  claim-ceiling line in the methodology.

| Probability technique | Basis | Permits |
|---|---|---|
| Simple random | equal, known probability from a complete frame | full statistical inference: standard errors, confidence intervals, generalization |
| Systematic | every k-th unit, random start | same, provided the frame has no hidden periodicity |
| Stratified | homogeneous strata, sampled within | same, with better precision when strata differ on the outcome |
| Cluster | whole groups sampled | same, but only after inflating n by DEFF |

| Non-probability technique | Basis | Permits | Forbids |
|---|---|---|---|
| Purposive | fits a stated criterion (expert, extreme case, typical case) | analytic generalization to **theory**; depth on the criterion | any statement about population prevalence |
| Convenience | whoever is available | exploratory description, pilot and instrument testing | any inferential or population claim |
| Snowball | referral chains from participants | access to hidden or stigmatized populations | representativeness; it over-represents the well-connected |
| Quota | preset category counts, filled non-randomly | a category-balanced description | a standard error or margin of error; it is **not** stratified sampling |

- **Traps:** the hard rule, repeated because it is broken constantly - **a
  non-probability sample cannot support a population-level generalization, cannot carry
  a margin of error, and cannot license the ordinary population reading of a p-value or
  a confidence interval.** "Margin of error +/- 5%" on a convenience sample is fiction
  with arithmetic wrapped around it. "Respondents were selected randomly" when the
  researcher picked whoever looked approachable: random means a chance mechanism with
  known probability, not researcher whim. Reporting cluster data with simple-random
  standard errors - ignoring DEFF makes every interval too narrow and every p-value too
  small. Describing quota sampling as stratified because both have strata: selection
  inside the quota is not random, so no design-based standard error is defensible.
  Applying Slovin to a purposive sample - Slovin returns a probability-sampling n, and
  the two designs are incompatible.
- **Volatility:** LOW

## Sample Size Determination (Slovin and power analysis)

- **When:** Slovin and the proportion formula size a **descriptive estimate** from a
  probability sample with a known N. **Power analysis** sizes anything that will
  **test a hypothesis** - comparative, correlational, regression, or SEM. Using the
  descriptive route to justify a hypothesis-testing study is a formula worn as costume.
- **Inputs:** for Slovin - N, tolerated margin of error e (a decimal). For power - any
  three of `alpha`, power `1 - beta`, the minimum effect size worth detecting, and `n`;
  the fourth follows. The effect size comes from prior literature, a pilot, or a stated
  practical threshold, never from the data you are about to collect.
- **Formula:** proportion sample size `n0 = Z^2 x p x (1 - p) / e^2`, with the finite
  population correction `n = n0 / (1 + (n0 - 1) / N)`. **Slovin** is that pair collapsed
  under `Z ~ 2` and `p = 0.5`: `n = N / (1 + N x e^2)`.
  Power, two independent means, two-tailed:
  `n per group = 2 x (Z_(1-alpha/2) + Z_(1-beta))^2 / d^2`, where `d = (mu1 - mu2) /
  sigma_pooled` (Cohen's d) and
  `sigma_pooled = sqrt( ((n1-1)s1^2 + (n2-1)s2^2) / (n1 + n2 - 2) )`.
  Power for a correlation, via the Fisher transform:
  `n = ((Z_(1-alpha/2) + Z_(1-beta)) / C)^2 + 3`, with `C = 0.5 x ln((1 + r)/(1 - r))`.
- **Output shape:** a computation block - inputs with sources and units, formula,
  substitution shown, result with a unit, assumptions, and the claim ceiling.

```
METHOD:       Slovin
INPUTS:       N = 1,200 employees [source: HR master list, dated, VERIFIED]
              e = 0.05 (5% margin of error)
FORMULA:      n = N / (1 + N x e^2)
SUBSTITUTION: 1,200 / (1 + 1,200 x 0.0025) = 1,200 / (1 + 3.0) = 1,200 / 4.0 = 300
RESULT:       n = 300 respondents   [unit: respondents]
ASSUMPTIONS:  probability sampling from a complete frame of N = 1,200; p = 0.5;
              confidence ~95%; estimating a proportion, NOT testing a hypothesis.
              Inflate for nonresponse: at 80% response, distribute 300/0.80 = 375.
CEILING:      a prevalence estimate for these 1,200 employees. No causal claim,
              no generalization beyond this frame.
```

```
METHOD:       Power analysis, two independent means, two-tailed
INPUTS:       alpha = 0.05 -> Z = 1.96 | power = 0.80 -> Z = 0.84
              d = 0.5 (medium; source: pilot study, INFERRED)
FORMULA:      n per group = 2 x (Z_(1-alpha/2) + Z_(1-beta))^2 / d^2
SUBSTITUTION: 2 x (1.96 + 0.84)^2 / 0.5^2 = 2 x 7.84 / 0.25 = 15.68 / 0.25 = 62.7
RESULT:       n ~ 63 per group, 126 total   [unit: participants]
              (a t-based solver returns 64 per group; the normal approximation runs
              one or two low, so round up)
ASSUMPTIONS:  equal group sizes, equal variances, two-tailed, complete data
```

- **Traps:** Slovin controls the **margin of error only**. It knows nothing about effect
  size, power, or the number of predictors, so it returns the same n whether you plan a
  single mean or a twelve-path structural model. Writing `e = 5` instead of `e = 0.05`
  (a factor-of-10,000 error in the denominator - check the decimal every time).
  Reporting the computed n as the achieved n after 40% dropped out. Running the power
  analysis **after** the data is in and calling it justification: post-hoc "observed
  power" is a restatement of the p-value and carries no information. Choosing d = 0.8
  because it yields an affordable n - the effect size is a claim about the world, not a
  budget lever, and inflating it guarantees an underpowered study that will miss a real
  effect. Forgetting that an underpowered study that does reach p < .05 produces the
  **least** trustworthy result of all, since only inflated estimates could have crossed
  the threshold.
- **Volatility:** LOW

## Validity (construct, internal, external) and Its Threats

- **When:** designing the study, and again when writing limitations and conclusions.
- **Inputs:** the design, the instrument, the sample, the setting, the timeline.
- **Formula:** content validity ratio (Lawshe), from an expert panel of N raters of whom
  n_e judge an item essential: `CVR = (n_e - N/2) / (N/2)`, ranging -1 to +1.
- **Output shape:** a **validity-threat table** - threat | present? | how the design
  mitigates it | residual risk carried into the claim. The residual-risk column must
  reappear, unedited in substance, in the limitations section.
  - **Construct validity** (the instrument measures what it names). Threats: construct
    underrepresentation, construct-irrelevant variance (reading ability, social
    desirability), mono-operation and mono-method bias, hypothesis guessing, evaluation
    apprehension. Evidence: content (expert panel, CVR), convergent (AVE >= 0.50),
    discriminant (HTMT below 0.85), criterion and predictive.
  - **Internal validity** (the change is due to the treatment). Threats: history,
    maturation, testing, instrumentation, regression to the mean, selection, attrition,
    selection-interactions, diffusion of treatment, compensatory rivalry. Only **design**
    buys internal validity - random assignment, a control group, blinding. Statistical
    control on observational data narrows the gap and never closes it: you cannot covary
    out a confounder you did not measure.
  - **External validity** (the result travels). Threats: interaction of selection,
    setting, or history with the treatment; an unrepresentative sample; an artificial
    setting; time-bound conditions.
- **Traps:** "the instrument is valid because Cronbach alpha is 0.90" - alpha is
  **reliability**, and a consistently wrong measure is consistently wrong. Listing
  threats in the methodology chapter, then writing a conclusion that behaves as though
  none existed. Ignoring the trade: tight laboratory control buys internal validity and
  spends external validity, and the write-up must say which it bought. Generalizing from
  one organization to an industry.
- **Volatility:** LOW

## Instrument Reliability

- **When:** any multi-item scale, coding scheme, or repeated measure.
- **Inputs:** item-level data (internal consistency), two administrations (test-retest),
  or two or more raters (inter-rater).
- **Formula:** Cronbach alpha over k items:
  `alpha = (k / (k - 1)) x (1 - (sum of item variances / variance of the total score))`.
  Standardized form from the mean inter-item correlation r_bar:
  `alpha = (k x r_bar) / (1 + (k - 1) x r_bar)`.
  Cohen's kappa, two raters on categories: `kappa = (p_o - p_e) / (1 - p_e)`, with p_o
  the observed agreement and p_e the agreement expected by chance.
  Reliability caps validity - the correction for attenuation bounds the observable
  correlation between two measures at `sqrt(r_xx x r_yy)`.
- **Output shape:** a computation block per coefficient, with k, the thresholds applied,
  and every item deletion disclosed.

```
METHOD:       Cronbach alpha
INPUTS:       k = 10 items | sum of item variances = 6.0 | variance of total = 30.0
FORMULA:      alpha = (k / (k-1)) x (1 - sum(var_i) / var_total)
SUBSTITUTION: (10 / 9) x (1 - 6.0 / 30.0) = 1.111 x (1 - 0.20) = 1.111 x 0.80
RESULT:       alpha = 0.889   [unit: dimensionless, 0 to 1]
INTERPRETATION: >= 0.70 acceptable, >= 0.80 good, > 0.95 signals redundant items
ASSUMPTIONS:  the 10 items measure ONE construct and are tau-equivalent
```

- **Traps:** alpha rises mechanically with k, so a 40-item scale clears 0.90 while
  holding weak items - a high alpha is not evidence of a good scale. Computing one alpha
  across a questionnaire containing five different constructs: the number is meaningless.
  Deleting items until alpha crosses 0.70 and not reporting the deletions. Reporting
  alpha for a two-item scale (use the Spearman-Brown corrected correlation). Reporting
  percent agreement instead of kappa - percent agreement ignores chance, and two raters
  coding a rare category agree 90% of the time by accident. A test-retest interval short
  enough for memory to inflate r, or long enough for real change to deflate it. Above
  all: **reliability is necessary and not sufficient for validity.** A thermometer stuck
  at 30 degrees is perfectly reliable and entirely invalid. Report McDonald's omega when
  tau-equivalence fails.
- **Volatility:** LOW

## Measurement Scales and the Statistics Each Permits

- **When:** before choosing any test. Most analysis errors are born here, and they are
  invisible in the output: the software will happily average a gender code.
- **Inputs:** each variable, its coding, and the meaning of the distance between codes.
- **Output shape:** a variable table - variable | scale | permitted statistics | test
  selected | why the test matches the scale.

| Scale | Property | Permitted | Forbidden |
|---|---|---|---|
| Nominal | labels, no order (gender, region, brand) | mode, frequency, proportion, chi-square, Cramer's V | mean, SD, correlation, ranking |
| Ordinal | order, unequal intervals (rank, class, single Likert item) | median, mode, percentile, Spearman rho, Kendall tau, Mann-Whitney, Kruskal-Wallis, ordinal logistic | mean, SD, Pearson r (contested at best) |
| Interval | equal intervals, arbitrary zero (Celsius, IQ, standardized score) | all of the above, plus mean, SD, Pearson r, t-test, ANOVA, regression | ratio statements ("twice as hot") |
| Ratio | equal intervals, true zero (income, weight, count, time) | everything, plus geometric mean, coefficient of variation, ratio statements | nothing |

- **Traps:** coding gender 1 and 2 and reporting a mean of 1.43 - arithmetically correct,
  semantically void. Running Pearson correlation on ranked data. Treating a count as
  ordinal and discarding information. Confusing the **scale of the variable** with the
  **type of the column**: the software sees a number and offers a mean regardless of
  whether the number means anything. Choosing a test from a list of test names instead of
  from the measurement level of the variables entering it.
- **Volatility:** LOW

## Likert Scale Treatment (the ordinal-versus-interval question)

- **When:** any attitude, satisfaction, or perception instrument.
- **Inputs:** the number of response points, the number of items per construct, whether
  the items are summated.
- **Output shape:** an explicitly stated decision - "single items are treated as ordinal
  and analyzed with [nonparametric test]; the summated construct score (mean of k items)
  is treated as interval, an assumption justified by unidimensionality and by k items on
  a format of five points or wider" - carried through to the limitations.
- **Traps:** a **single Likert item is ordinal**, full stop: the distance from "agree" to
  "strongly agree" is not the distance from "neutral" to "agree", and no respondent was
  consulted about the spacing. A **summated multi-item scale** is conventionally treated
  as interval, and parametric tests are demonstrably robust to that for unidimensional
  scales with enough points - but it is an **assumption you state**, not a fact you
  inherit. Reporting the mean of a single item to two decimals as if it were measured.
  Claiming "satisfaction of 4.2 is twice 2.1": there is no true zero, so no ratio exists.
  Averaging items from different constructs into one score. Forgetting to reverse
  negatively worded items, which silently destroys the alpha and the factor structure at
  once.
- **Volatility:** LOW

## SEM and PLS-SEM

- **When:** the model has latent constructs with multiple indicators and paths among
  them, and the measurement and structural models must be estimated together.
- **Inputs:** a theory-specified model, indicator data, an adequate sample. Choose the
  estimator before the data arrives.
  - **CB-SEM** (covariance-based): **confirmation** of established theory. Wants larger
    n, approximate multivariate normality, reflective constructs, an identified model.
    Reports global fit.
  - **PLS-SEM** (variance-based): **prediction** and theory development. Tolerates
    smaller n, non-normal data, formative constructs, complex models. Has **no global fit
    test**; SRMR is an approximate criterion only.
- **Formula:** composite reliability
  `CR = (sum of lambda_i)^2 / [ (sum of lambda_i)^2 + sum of (1 - lambda_i^2) ]`;
  average variance extracted `AVE = (sum of lambda_i^2) / k`;
  effect size `f^2 = (R2_included - R2_excluded) / (1 - R2_included)`, read as 0.02
  small, 0.15 medium, 0.35 large.
- **Output shape:** two blocks, always in this order.
  1. **Measurement model.** Reflective: outer loadings (>= 0.708), CR (0.70 to 0.95), AVE
     (>= 0.50), discriminant validity (HTMT below 0.85, or Fornell-Larcker - the sqrt of
     each construct's AVE exceeds its correlation with every other construct). Formative:
     indicator VIF (below 3 to 5), outer-weight significance, and theoretical
     completeness of the indicator set.
  2. **Structural model.** Path coefficients with bootstrap confidence intervals (5,000
     subsamples), R2, f2, predictive relevance Q2. CB-SEM fit indices - chi-square/df,
     CFI, TLI, RMSEA, SRMR - are reported as a set, never one alone.
- **Traps:** **reflective versus formative is a theory decision, not a software setting.**
  Reflective indicators are *caused by* the construct, are interchangeable, and survive
  the deletion of any one. Formative indicators *cause* the construct, are not
  interchangeable, and deleting one changes what the construct means. Running alpha, AVE,
  and Fornell-Larcker on a formative construct is a category error, and it is common. The
  **10-times rule** for PLS sample size is a weak heuristic, not a justification - size
  from a power analysis on the most complex regression in the model. Chasing modification
  indices until the model fits: at that point the model describes your sample rather than
  testing your theory, and it must be reported as exploratory. And the ceiling this pack
  defends: **a significant path coefficient on cross-sectional survey data is an
  association.** The arrow is your theory; it is not a finding of the data. SEM does not
  manufacture causation from correlational data, and "influence" in the results section
  does not become true because the software drew an arrowhead.
- **Volatility:** LOW

## Triangulation

- **When:** a single source, method, or analyst would leave the finding fragile.
- **Inputs:** two or more independent sources, methods, analysts, or theoretical lenses.
- **Output shape:** a convergence table - finding | source A | source B | source C |
  converge, diverge, or complement - plus an explicit treatment of every divergence. The
  four types: **data** (time, space, person), **investigator** (multiple analysts),
  **theory** (multiple lenses on the same data), **methodological** (multiple methods on
  the same question).
- **Traps:** divergence is a **finding**, not a failure, and quietly dropping the source
  that disagreed is data suppression wearing a methodology label. Counting two interviews
  from the same department as data triangulation. Claiming method triangulation when the
  second method never addressed the same question. Triangulation strengthens
  **credibility**; it does not convert a correlational design into a causal one, and
  three non-probability sources still do not generalize to a population.
- **Volatility:** LOW

## Qualitative Coding (open, axial, selective)

- **When:** the data is text, transcript, field note, or open-ended response, and the
  goal is to build categories or theory from it.
- **Inputs:** transcribed data, a coding tool, an audit trail.
- **Output shape:** a codebook (code | definition | inclusion criterion | exclusion
  criterion | exemplar quote with source ID), a category structure, and a saturation
  statement backed by evidence.
  - **Open coding:** line-by-line, in vivo where the participant's own words carry the
    concept. Fracture the data.
  - **Axial coding:** relate categories to subcategories - conditions, actions and
    interactions, consequences.
  - **Selective coding:** identify the core category and integrate the rest around it.
  - **Saturation:** the point at which new data yields no new codes or properties.
- **Traps:** asserting saturation ("saturation was reached at the 12th informant") with no
  evidence - saturation is **demonstrated**, by reporting the new-code count per interview
  and showing it flatten, not declared. Counting codes and reporting "8 of 12 respondents
  said X" as though it were a frequency estimate: a purposive sample supports no
  prevalence claim, and the number invites exactly the population reading it cannot
  support. Coding into the categories the literature already supplied and calling the
  result grounded. Collapsing the whole procedure into "we read the transcripts and found
  some themes".
- **Volatility:** LOW

## Thematic Analysis

- **When:** patterns of meaning are needed across a qualitative dataset without committing
  to the full grounded-theory apparatus.
- **Inputs:** the dataset, an explicit stance (inductive or deductive; semantic or
  latent), and a defined analytic position.
- **Output shape:** six phases, each evidenced - (1) familiarization, (2) generating
  initial codes, (3) searching for themes, (4) reviewing themes against the coded extracts
  and the whole dataset, (5) defining and naming themes, (6) the report. Each theme ships
  with a **central organizing concept**, its boundary, and at least two exemplar extracts
  with participant IDs.
- **Traps:** "themes emerged from the data" - they did not; you constructed them, and
  passive voice is not a method. A theme that is only a topic summary ("Training") rather
  than a claim organized by a central concept ("Training is experienced as a compliance
  ritual, not as capability building"). Quotes used as decoration rather than as evidence.
  Bolting an inter-rater kappa onto a reflexive design to look rigorous, when reflexive
  thematic analysis does not treat coding as a reliability exercise at all - pick the
  paradigm and stay inside it.
- **Volatility:** LOW

## Citation Shape (APA-style)

- **When:** any academic deliverable, and any deliverable an academic reviewer will read.
- **Inputs:** the full source record - authors, year, title, container, volume, issue,
  pages, DOI or stable URL - **taken from the source you actually read**.
- **Output shape:**
  - In-text: `(Author, year)` or `Author (year)`; a direct quotation adds the page. Three
    or more authors use "et al." from the first citation onward.
  - Reference (journal article): `Author, A. A., & Author, B. B. (Year). Article title in
    sentence case. Journal Name in Title Case, volume(issue), pages.
    https://doi.org/10.xxxx/xxxxx`
  - Reference list alphabetical by first author surname, hanging indent. Every in-text
    citation appears in the list; every list entry is cited in the text.
- **Traps:** **fabricating a reference.** This is the highest-frequency and most
  destructive AI failure in this domain - a plausible author, a plausible journal, a
  plausible DOI, and no such paper. Every reference must be verifiable against the actual
  source; anything you did not open is marked UNVERIFIED and is not cited. Citing the
  abstract while pretending to the article. Secondary citation ("as cited in") used as a
  habit rather than as a last resort for a genuinely unobtainable original. Sentence case
  and title case swapped. A DOI written as a bare string instead of a resolvable link.
  Padding the list with sources never read - reviewers check.
- **Volatility:** MEDIUM - style-manual editions change the et al. rule, the DOI format,
  the running head, and the title-page layout. Do not trust recall for the mechanics:
  verify against the current edition of the manual, and against the target institution's
  or journal's own guide, which frequently overrides it.

## Thesis and Dissertation Structure

- **When:** the deliverable is a thesis, dissertation, or formal research report.
- **Inputs:** the institution's current template (which outranks any general convention),
  the research questions, and the design's claim ceiling.
- **Output shape:** the chapter chain, each chapter carrying an obligation to the next.
  1. **Introduction** - background, problem statement, research questions and objectives,
     scope, significance.
  2. **Literature review** - theoretical framework, prior findings, the **research gap**,
     and hypothesis development that follows from the theory rather than preceding it.
  3. **Methodology** - design, population and sampling frame, sampling technique, sample
     size with its computation block, instrument, validity and reliability evidence,
     analysis plan. **This chapter sets the claim ceiling.**
  4. **Results and discussion** - findings first, interpretation second, never fused.
  5. **Conclusion** - answers to the research questions, limitations, recommendations,
     future work.
- **Traps:** research questions the chosen analysis cannot answer. A hypothesis in the
  literature chapter that no test in the methodology chapter can reject. A "research gap"
  that is only a **topic** gap ("no one has studied this in this city") rather than a
  knowledge gap ("the mechanism is contested and the two theories predict opposite
  signs"). A limitations section listing generic apologies about time and budget while
  hiding the design's actual claim ceiling. And the structural failure this pack exists to
  prevent: **the methodology chapter describes a cross-sectional survey and the conclusion
  announces that X causes Y.** The ceiling set in the methodology binds the conclusion. If
  the conclusion needs a stronger claim, the methodology has to change - before the data is
  collected, not after.
- **Volatility:** MEDIUM - institutional templates and required chapter counts vary by
  department and get revised; verify against the current departmental guide rather than
  from convention or recall.

## Statistical-Conclusion Errors

- **When:** any time a p-value appears in a deliverable.
- **Inputs:** the pre-stated analysis plan, the count of tests actually run, the effect
  sizes.
- **Formula:** family-wise error rate over m independent tests:
  `P(at least one false positive) = 1 - (1 - alpha)^m`. With alpha = 0.05 and m = 20:
  `1 - 0.95^20 = 1 - 0.358 = 0.642` - a 64% chance of at least one false positive.
  Bonferroni: `alpha_adjusted = alpha / m`. Across many tests, prefer a
  false-discovery-rate procedure (Benjamini-Hochberg) over Bonferroni's blunt loss of
  power.
- **Output shape:** every reported test carries a p-value **and** an effect size **and** a
  confidence interval, and the results section states how many tests were run in total,
  not how many survived.
- **Traps:**
  - **p-hacking** - trying specifications, dropping outliers, splitting subgroups, or
    adding covariates until p crosses 0.05. The fix is an analysis plan stated before the
    data is seen, and disclosure of every model tested.
  - **HARKing** - hypothesizing after the results are known and presenting it as a priori.
    A hypothesis generated by a dataset cannot be tested by that same dataset; it can only
    be labeled exploratory and left for the next study.
  - **Multiple comparisons** - see the formula. Twenty subgroup tests hand you a
    "significant" finding by construction.
  - **Significance mistaken for magnitude** - at n = 5,000, r = 0.04 reaches p < .05 and
    means nothing. Significance is a statement about sampling noise, not a statement that
    the effect matters. Report Cohen's d, r, eta-squared, R2, or the odds ratio, and
    interpret **that**.
  - **p > .05 read as proof of no effect** - absence of evidence is not evidence of
    absence, especially when the study is underpowered. Report the confidence interval,
    and run an equivalence test if the claim really is "no meaningful difference".
  - **p misread as the probability the hypothesis is true.** It is the probability of data
    at least this extreme **if H0 were true**, and it is not the reverse.
  - And the error outranking all the others: a clean p-value on a design that cannot
    support the claim being made. The statistics were never the constraint. **The design
    was.**
- **Volatility:** LOW
