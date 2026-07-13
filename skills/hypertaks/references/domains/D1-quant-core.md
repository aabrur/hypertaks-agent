# D1 - Quantitative Core
Every entry: **when · inputs · formula · output shape · traps · volatility**

Statistics, mathematics, and operations research. Symbols use plain text: `sqrt()`,
`x`, `/`, `^`, and Greek names spelled out (sigma, mu, alpha, lambda). Every result
carries a unit. Every method touching money or safety carries a SENSITIVITY line.

---

## Descriptive statistics (center and spread)
- **When:** first pass on any numeric column, before any test or model.
- **Inputs:** x_i = observations (unit of the measured variable, e.g. units/day, Rp, mm); n = sample size (count).
- **Formula:** `mean = sum(x_i)/n` · `sample variance s^2 = sum((x_i - mean)^2)/(n-1)` · `SD s = sqrt(s^2)` · `mean absolute deviation = sum|x_i - mean|/n` · `CV = s/mean` (dimensionless)
- **Output shape:** computation block (METHOD / INPUTS / FORMULA / SUBSTITUTION / RESULT with unit / ASSUMPTIONS), plus a one-row summary table: n, mean, median, SD, min, max, and the count of missing values.
- **Traps:** dividing by `n` instead of `n-1` for a *sample* variance understates spread - the `n` divisor is only correct for a full population. "MAD" is overloaded: mean absolute deviation (used in forecasting) is not median absolute deviation (a robust scale estimate, `median|x_i - median|`) - name which one you used. Reporting the mean on a skewed or heavy-tailed variable (income, lead time, ticket value) hides the decision; report the median and a percentile. SD has the same unit as x, variance has the unit *squared* - a "variance of 12 minutes" is a unit error.
- **Volatility:** LOW

## One-sample t-test
- **When:** one group's mean is compared against a fixed target or claim; population sigma unknown.
- **Inputs:** xbar = sample mean (unit of x); mu0 = target value (same unit); s = sample SD (same unit); n = sample size (count); alpha = significance level (dimensionless).
- **Formula:** `t = (xbar - mu0) / (s / sqrt(n))`, df = n - 1
- **Output shape:** computation block, plus a decision line: t-statistic, df, critical value or p-value, reject/fail-to-reject, and the confidence interval `xbar +/- t_crit x s/sqrt(n)` **with the unit**.
- **Traps:** using z instead of t when sigma is estimated from the sample and n is small. Choosing one-tailed *after* seeing the data direction - that halves the p-value dishonestly; the tail is fixed by the hypothesis, before the data. Reporting "significant" without an effect size: with n = 5,000 a trivial 0.2-unit shift is significant and worthless. "Fail to reject" is not "the means are equal".
- **Volatility:** LOW

## Two-sample t-test (independent groups)
- **When:** two separate, unrelated groups are compared on one continuous outcome.
- **Inputs:** xbar1, xbar2 = group means (unit of x); s1, s2 = group SDs (same unit); n1, n2 = group sizes (count).
- **Formula:** pooled (equal variances): `sp^2 = ((n1-1)s1^2 + (n2-1)s2^2) / (n1+n2-2)` then `t = (xbar1 - xbar2) / (sp x sqrt(1/n1 + 1/n2))`, df = n1 + n2 - 2. Welch (unequal variances): `t = (xbar1 - xbar2) / sqrt(s1^2/n1 + s2^2/n2)`, df = `(s1^2/n1 + s2^2/n2)^2 / [ (s1^2/n1)^2/(n1-1) + (s2^2/n2)^2/(n2-1) ]`
- **Output shape:** computation block, plus a group table (n, mean, SD per group) and the CI of the *difference* with its unit.
- **Traps:** pooling when the variances are clearly unequal and the groups are unbalanced - that is where the pooled test breaks; Welch is the safer default and costs almost nothing. Applying this to paired data (before/after on the same subjects) throws away the pairing and inflates the SE. Groups that are not independent (same store, same operator, same batch) violate the test outright.
- **Volatility:** LOW

## Paired t-test
- **When:** the same units are measured twice (before/after, method A vs method B on the same items).
- **Inputs:** d_i = x_after,i - x_before,i (unit of x); dbar = mean difference (unit of x); sd = SD of the differences (unit of x); n = number of *pairs* (count).
- **Formula:** `t = dbar / (sd / sqrt(n))`, df = n - 1
- **Output shape:** computation block, plus the differences table and the CI of the mean difference with its unit.
- **Traps:** n is the number of pairs, not the number of observations - using 2n doubles the apparent df. The test is on the differences, so the *differences* (not the raw values) must be roughly symmetric. A drifting baseline or a learning effect can create a significant "improvement" that has nothing to do with the treatment; a control arm, not a bigger n, is the fix.
- **Volatility:** LOW

## One-way ANOVA
- **When:** three or more group means are compared on one continuous outcome.
- **Inputs:** k = number of groups (count); n_j = size of group j (count); N = sum n_j (count); xbar_j = group means (unit of x); xbar_grand = overall mean (unit of x).
- **Formula:** `SSB = sum_j n_j x (xbar_j - xbar_grand)^2` (df = k-1) · `SSW = sum_j sum_i (x_ij - xbar_j)^2` (df = N-k) · `MSB = SSB/(k-1)` · `MSW = SSW/(N-k)` · `F = MSB / MSW`
- **Output shape:** computation block, plus the standard ANOVA table (Source | SS | df | MS | F | p) with SST = SSB + SSW as an arithmetic check.
- **Traps:** a significant F says *at least one* mean differs - it never says which; a post hoc test (Tukey HSD, Bonferroni) is mandatory before naming the group. Running all pairwise t-tests instead inflates the family-wise error rate (10 comparisons at alpha 0.05 gives roughly a 40% chance of a false positive). ANOVA assumes equal variances (check with Levene) and independent observations; repeated measures on the same subjects need a repeated-measures model, not this one.
- **Volatility:** LOW

## Chi-square (goodness of fit and independence)
- **When:** categorical counts are tested against expected proportions, or two categorical variables are tested for association.
- **Inputs:** O_ij = observed counts (count); E_ij = expected counts (count); r = rows, c = columns (count).
- **Formula:** `X^2 = sum (O - E)^2 / E`. Independence: `E_ij = (row_i total x col_j total) / N`, df = (r-1)(c-1). Goodness of fit: df = k - 1 - m, where m = parameters estimated from the data.
- **Output shape:** computation block, plus the contingency table showing O and E in every cell, and the cells contributing most to X^2.
- **Traps:** running chi-square on percentages or on means - it only accepts raw *counts*; converting 40% back to "40" when n = 500 is a real and common error. The conventional rule is that expected counts should be at least 5 in most cells; for a sparse 2x2, use Fisher's exact test. Chi-square shows association, not direction or strength - report Cramer's V for strength. Each observation must fall in exactly one cell; multi-response survey items break that.
- **Volatility:** LOW

## Correlation (Pearson and Spearman)
- **When:** measuring the strength of association between two continuous variables, before or instead of a model.
- **Inputs:** paired (x_i, y_i) with their units; n = pairs (count).
- **Formula:** `r = sum((x-xbar)(y-ybar)) / sqrt( sum((x-xbar)^2) x sum((y-ybar)^2) )`, range -1 to +1. Significance: `t = r x sqrt(n-2) / sqrt(1 - r^2)`, df = n-2. Spearman (no ties): `rho = 1 - 6 x sum(d_i^2) / (n(n^2 - 1))` where d_i = rank difference.
- **Output shape:** computation block, plus a correlation matrix and - always - a scatter plot; r without the scatter is a claim without evidence.
- **Traps:** r only detects *linear* association; a perfect U-shape returns r near 0. One outlier can carry the whole correlation, or destroy it. Correlation is not causation, and it is not prediction either. Restricted range (sampling only high performers) attenuates r toward 0. Correlating two aggregated series (monthly totals, per-region averages) inflates r badly - the ecological fallacy. `r^2`, not r, is the shared variance: r = 0.7 is not "70% explained", it is 49%.
- **Volatility:** LOW

## Simple linear regression
- **When:** one predictor, one continuous outcome; the slope itself is the answer (per-unit effect).
- **Inputs:** x = predictor (its unit); y = outcome (its unit); n = observations (count).
- **Formula:** `b1 = sum((x-xbar)(y-ybar)) / sum((x-xbar)^2)` · `b0 = ybar - b1 x xbar` · `yhat = b0 + b1 x` · `SSE = sum(y - yhat)^2` · `SST = sum(y - ybar)^2` · `R2 = 1 - SSE/SST` · `s_e = sqrt(SSE/(n-2))` · `SE(b1) = s_e / sqrt(sum((x-xbar)^2))` · `t = b1 / SE(b1)`, df = n-2
- **Output shape:** computation block, plus the coefficient table (b, SE, t, p), R2, and a residual-vs-fitted plot. Slope must be stated with a compound unit: "b1 = 4.2 units sold per Rp 1,000 of price cut".
- **Traps:** the intercept is usually meaningless when x = 0 is outside the observed range - do not interpret it. Extrapolating past the data range is where regressions kill decisions. R2 measures fit, not correctness: a rising-trend regression on two rising time series produces a beautiful R2 and a spurious relationship. Residual structure (a fan shape, a curve, autocorrelation in time series) invalidates the SEs even when the coefficients look fine.
- **Volatility:** LOW

## Multiple regression, R2 and adjusted R2
- **When:** several predictors act at once and their individual contributions must be separated.
- **Inputs:** X = n x (k+1) design matrix including the intercept column; y = outcome vector (its unit); k = number of predictors (count); n = observations (count).
- **Formula:** `b = (X'X)^-1 X'y` · `R2 = 1 - SSE/SST` · `adjusted R2 = 1 - (1 - R2) x (n - 1)/(n - k - 1)` · overall test `F = (R2/k) / ((1 - R2)/(n - k - 1))`, df1 = k, df2 = n-k-1 · `VIF_j = 1/(1 - R2_j)` where R2_j is from regressing predictor j on the other predictors.
- **Output shape:** computation block, plus the coefficient table (b, SE, t, p, VIF), R2 and adjusted R2 side by side, and the overall F. Each coefficient stated as "holding the other predictors constant".
- **Traps:** in adjusted R2 the denominator is `n - k - 1`, where k **excludes** the intercept; using `n - k` is the standard off-by-one and it inflates the figure. R2 never decreases when a predictor is added - so R2 can never justify adding one; adjusted R2 can. Multicollinearity (VIF above roughly 5-10) leaves R2 healthy while individual coefficients flip sign and become unstable - the model still predicts, but no single coefficient can be interpreted. Adding predictors until R2 looks good is overfitting: check on held-out data, not on the fitting sample.
- **Volatility:** LOW

## Sample size (proportion, mean, and Slovin)
- **When:** deciding how many respondents or items to collect before the survey or experiment runs.
- **Inputs:** z = z-score for the confidence level (dimensionless; 1.96 at 95%); p = expected proportion (dimensionless, 0-1); e = margin of error (same unit as the estimate; a proportion for p, the variable's unit for a mean); sigma = expected SD (unit of x); N = population size (count).
- **Formula:** proportion: `n = z^2 x p x (1-p) / e^2` · mean: `n = (z x sigma / e)^2` · finite population correction: `n_adj = n / (1 + (n-1)/N)` · Slovin: `n = N / (1 + N x e^2)`
- **Output shape:** computation block, plus a small table of n at e = 0.03 / 0.05 / 0.10 so the cost-vs-precision trade is visible. Always round **up**.
- **Traps:** p = 0.5 maximizes `p(1-p)` and therefore gives the largest, safest n - use it when p is unknown, not a hopeful 0.1. Slovin's formula is a convenience shortcut with no clear primary source: it silently assumes 95% confidence and p = 0.5, applies only to estimating a proportion in a finite population, and cannot be used for a mean or at any other confidence level - if a reviewer challenges it, the honest reply is to re-derive n from the proportion formula plus the FPC. The computed n is the number of **usable** responses; inflate it for the expected non-response rate. Ignoring cluster or stratified design effects understates n, sometimes by 2x or more.
- **Volatility:** MEDIUM (the 0.70/0.05 conventions and the acceptability of Slovin vary by field and reviewer)

## Cronbach's alpha (internal consistency reliability)
- **When:** a multi-item scale (survey construct) must be shown to hang together before its items are averaged.
- **Inputs:** k = number of items in the scale (count); s_i^2 = variance of item i (scale points squared); s_total^2 = variance of the summed scale score (scale points squared).
- **Formula:** `alpha = (k / (k-1)) x (1 - sum(s_i^2) / s_total^2)`
- **Output shape:** computation block, plus an item table: item-total correlation and "alpha if item deleted" per item.
- **Traps:** alpha rises mechanically with the number of items - a 30-item scale of near-junk can still reach 0.8; alpha is not evidence of a single underlying construct (that requires factor analysis). Reverse-coded items **must** be reverse-scored before alpha is computed, otherwise alpha collapses toward 0 or goes negative; a negative alpha is almost always this bug, not a finding. Alpha above roughly 0.95 signals redundant, near-duplicate items, not excellence. Alpha assumes tau-equivalence (equal item loadings); when that fails, alpha understates reliability and omega is the better statistic.
- **Volatility:** MEDIUM (the 0.70 threshold is a convention, and disciplines differ)

## Forecast error metrics (MAD, MSE, RMSE, MAPE, bias)
- **When:** comparing forecasting methods, or proving that a live forecast is still fit for use.
- **Inputs:** A_t = actual (unit of the series, e.g. units/month); F_t = forecast (same unit); n = number of periods compared (count).
- **Formula:** `e_t = A_t - F_t` · `MAD = sum|e_t| / n` (unit of the series) · `MSE = sum(e_t^2)/n` (unit squared) · `RMSE = sqrt(MSE)` (unit of the series) · `MAPE = (100/n) x sum( |e_t| / |A_t| )` (percent) · `bias (mean forecast error) = sum(e_t) / n` (unit of the series)
- **Output shape:** computation block, plus a period-by-period error table (A_t, F_t, e_t, |e_t|, e_t^2, |e_t/A_t|) and a metric row per candidate method. **SENSITIVITY:** state how the ranking of methods changes if the largest single error is excluded - one outlier month routinely flips an RMSE ranking while leaving MAD unchanged.
- **Traps:** RMSE and MAD rank methods differently on purpose - RMSE squares errors, so it punishes one large miss far more than several small ones; choose the metric that matches the cost of the error (if a single stockout is catastrophic, RMSE; if cost is linear in units, MAD). MAPE is undefined when any A_t = 0 and explodes for near-zero actuals, which makes it useless for intermittent demand; it is also asymmetric - it penalizes over-forecasting more than under-forecasting. Bias is the *only* one of these that keeps its sign: a MAD of zero is impossible, but a bias of zero with a large MAD means the forecast is noisy yet centered, while a persistently positive bias means chronic under-forecasting and creeping stockouts. Comparing MAPE across series with different scales is fine; comparing MAD or RMSE across them is not.
- **Volatility:** LOW

## Tracking signal
- **When:** monitoring a live forecast for drift, so a model is retired before it quietly bleeds inventory.
- **Inputs:** e_t = period errors (unit of the series); RSFE = running sum of forecast errors = `sum(e_t)` (unit of the series); MAD = mean absolute deviation (unit of the series).
- **Formula:** `TS = RSFE / MAD` (dimensionless, in units of MAD)
- **Output shape:** computation block, plus a TS-per-period control chart with the action limits drawn. **SENSITIVITY:** show the period at which TS would breach the limit under a 10% and a 20% demand shift.
- **Traps:** the +/-4 MAD limit is a common convention, not a law - tighter limits (+/-3) catch drift sooner and raise false alarms; state the limit chosen. RSFE is cumulative, so an early bias never washes out; reset the running sum when the model is re-fitted, or the signal will keep condemning a model that has already been fixed. A TS near zero with a huge MAD is not a healthy forecast - it is an unbiased but useless one; TS must always be read next to MAD, never alone.
- **Volatility:** MEDIUM (the control-limit convention varies by textbook and by firm)

## Derivatives and unconstrained optimization
- **When:** a smooth objective (profit, cost, yield) must be maximized or minimized with no binding constraint.
- **Inputs:** f(x) = objective (Rp, units, or hours) as a function of decision variable x (its unit).
- **Formula:** first-order condition `f'(x*) = 0`. Second-order condition: `f''(x*) < 0` -> local maximum; `f''(x*) > 0` -> local minimum; `f''(x*) = 0` -> inconclusive. Two variables: solve `f_x = 0, f_y = 0`, then `D = f_xx x f_yy - (f_xy)^2`; `D > 0 and f_xx < 0` -> max; `D > 0 and f_xx > 0` -> min; `D < 0` -> saddle point; `D = 0` -> inconclusive.
- **Output shape:** computation block showing the derivative, the stationary point, and the second-order check, plus the objective value at x* **with its unit**. **SENSITIVITY:** for a money objective, report f at x* +/- 10% - near a flat optimum, a 10% error in x often costs under 1%, and that changes how hard the input is worth chasing.
- **Traps:** solving `f'(x) = 0` and stopping is the classic error - without the second-order check the "optimum" may be a minimum, and the recommendation is then exactly backwards. Stationary points are *local*; on a non-concave objective the global optimum may sit at a boundary (x = 0, x = capacity), which the derivative never sees - always evaluate the endpoints too. Marginal analysis (MR = MC) is the same condition rewritten; a discrete decision (whole trucks, whole staff) needs the integer neighbours checked, not the continuous x*.
- **Volatility:** LOW

## Lagrange multipliers
- **When:** optimizing subject to an equality constraint (a fixed budget, a fixed capacity, a required output).
- **Inputs:** f(x,y) = objective (Rp or units); g(x,y) = c = constraint (same unit as c, e.g. Rp of budget); lambda = multiplier (unit of f per unit of c).
- **Formula:** `L(x, y, lambda) = f(x,y) - lambda x (g(x,y) - c)`. Solve `dL/dx = 0`, `dL/dy = 0`, `dL/dlambda = 0` (the last one restores the constraint). At the optimum `lambda = df*/dc` - the shadow price of the constraint.
- **Output shape:** computation block with the three stationarity equations and the solved x*, y*, lambda, plus the interpretation line for lambda **with a compound unit**: "lambda = 3.4 units of profit per additional Rp 1,000 of budget". **SENSITIVITY:** use lambda to price a +/-10% change in c, and flag that it is a *local* rate.
- **Traps:** the sign convention flips lambda's sign (`f - lambda(g - c)` vs `f + lambda(g - c)`); the magnitude is the shadow price either way, but state the convention or the recommendation reads backwards. lambda is a **marginal** rate valid only in a neighbourhood of c - multiplying lambda by a large budget increase to project a large profit gain is a real and expensive mistake. For inequality constraints, this method is not enough: use the KKT conditions, where a non-binding constraint forces lambda = 0.
- **Volatility:** LOW

## Matrix operations
- **When:** solving simultaneous equations, running regression by hand, or stepping a Markov chain.
- **Inputs:** A (m x n), B (n x p) - dimensions in counts; entries carry the unit of the model.
- **Formula:** `(AB)_ij = sum_k a_ik x b_kj` (defined only if A's columns = B's rows) · 2x2 with `A = [[a,b],[c,d]]`: `det(A) = ad - bc`, `A^-1 = (1/det) x [[d, -b], [-c, a]]` · `(AB)' = B'A'` · `(AB)^-1 = B^-1 A^-1`
- **Output shape:** computation block showing the dimension check before the multiply, the intermediate matrix, and the result. State the unit of the product's entries.
- **Traps:** `AB != BA` - matrix multiplication is not commutative, and reversing the order silently produces a differently-shaped, wrong answer (or no answer). `det(A) = 0` means no inverse exists; in regression that is perfect multicollinearity, and the software's "singular matrix" error is a modelling message, not a numerical hiccup. Note the *reversal* in `(AB)^-1 = B^-1 A^-1` and `(AB)' = B'A'`. For anything above 3x3, invert numerically rather than by hand; near-singular matrices amplify rounding error badly.
- **Volatility:** LOW

## Linear programming (formulation)
- **When:** allocating scarce resources across activities with a linear objective and linear constraints.
- **Inputs:** x_j = decision variables (units of activity j); c_j = objective coefficient (Rp per unit of x_j); a_ij = resource i used per unit of x_j (resource-unit per activity-unit); b_i = resource availability (resource unit, e.g. machine-hours/week).
- **Formula:** `max Z = sum_j c_j x_j` subject to `sum_j a_ij x_j <= b_i` for all i, and `x_j >= 0`
- **Output shape:** computation block, plus the explicit model (decision variables with units, objective, one line per constraint with its unit) and, for two variables, the feasible region with the optimal corner named. **SENSITIVITY:** required - report the range over which each objective coefficient can vary without changing the optimal basis.
- **Traps:** the single most common failure is a units mismatch inside a constraint - `a_ij` must be *resource per unit of activity*, so hours/unit x units = hours; if the coefficient is stated per batch and x is per unit, the whole model is silently wrong and still solves cleanly. Forgetting `x_j >= 0` admits nonsense solutions. An unbounded LP means a missing constraint, not an infinitely profitable business; an infeasible LP means the constraints contradict, and the fix is to find the contradiction, not to relax constraints at random. If the variables must be whole (trucks, staff), rounding the LP answer can leave feasibility - that needs integer programming.
- **Volatility:** LOW

## Simplex and reading shadow prices
- **When:** solving an LP and, more importantly, extracting the economic information from the solution.
- **Inputs:** the LP in standard form with slack variables s_i (resource units) added to each `<=` constraint.
- **Formula:** `sum_j a_ij x_j + s_i = b_i`. Shadow price (dual value) `y_i = dZ*/db_i` = the change in the optimal objective per **one-unit** increase in b_i. Reduced cost of a non-basic variable = the amount its objective coefficient must improve before it enters the solution.
- **Output shape:** computation block, plus the sensitivity report: per constraint - slack, shadow price **with a compound unit** ("Rp 4,200 per extra machine-hour"), and the allowable RHS increase/decrease; per variable - reduced cost and the objective-coefficient range. **SENSITIVITY:** mandatory here; the shadow prices *are* the sensitivity, and the RHS ranging interval must be printed with them.
- **Traps:** a shadow price is valid **only inside its allowable RHS range**; multiplying it by 500 extra hours when the range says 60 is the single most costly LP error in practice - beyond the range the basis changes and the rate changes with it. A constraint with positive slack is non-binding and its shadow price is 0: paying for more of a resource you are not using up buys nothing. Under degeneracy (a redundant binding constraint) the shadow prices are not unique, and two solvers can honestly report different ones. The shadow price is the value of one more unit *at the current cost* - it is the maximum premium worth paying above the price already in the objective, not the total worth of the resource.
- **Volatility:** LOW

## Transportation problem - initial feasible solution (NW Corner, Least Cost, VAM)
- **When:** shipping a homogeneous good from m sources to n destinations at minimum total cost.
- **Inputs:** s_i = supply at source i (units); d_j = demand at destination j (units); c_ij = unit shipping cost (Rp per unit).
- **Formula:** balance first - if `sum(s_i) != sum(d_j)`, add a dummy source or destination with cost 0 carrying the difference. **Northwest Corner:** start top-left, allocate `min(s_i, d_j)`, cross out the exhausted row or column, move right or down. **Least Cost:** repeatedly pick the lowest c_ij cell remaining and allocate `min(s_i, d_j)`. **VAM:** for every remaining row and column compute the penalty = (second-lowest cost - lowest cost); pick the row/column with the largest penalty; allocate to its lowest-cost cell; recompute penalties.
- **Output shape:** computation block, plus the allocation matrix with the total cost `sum(c_ij x q_ij)` in Rp, and the occupied-cell count checked against `m + n - 1`. **SENSITIVITY:** report the total cost under all three starting methods - the spread shows how much the starting rule matters here.
- **Traps:** Northwest Corner ignores cost entirely - it is a *feasibility* device, never an answer; presenting its cost as "the optimal shipping plan" is a straight error. VAM usually lands closest to optimal but is still **not guaranteed optimal** - every initial solution must go through MODI or stepping-stone. Degeneracy: if the occupied cells number fewer than `m + n - 1`, the optimality test cannot run; place a zero (epsilon) allocation in an independent cell to restore the count. Recompute VAM penalties after every allocation - reusing the first round's penalties is the most common VAM bug.
- **Volatility:** LOW

## Transportation optimality - MODI and stepping-stone
- **When:** testing whether an initial transportation solution can be improved, and improving it.
- **Inputs:** the current allocation, c_ij (Rp per unit), the occupied cells (must number `m + n - 1`).
- **Formula:** **MODI:** set `u_1 = 0`; for every **occupied** cell solve `u_i + v_j = c_ij` to get all u_i and v_j. For every **empty** cell the improvement index is `d_ij = c_ij - u_i - v_j`. If all `d_ij >= 0`, the solution is optimal (minimization). Otherwise the most negative d_ij enters. **Stepping-stone:** trace a closed loop from the entering cell through occupied cells, alternate `+` and `-`; the shipment moved is the smallest quantity in a `-` cell; that cell leaves the basis.
- **Output shape:** computation block, plus the u/v table, the improvement-index matrix for empty cells, the loop drawn as a cell sequence, and the new total cost in Rp with the delta from the previous iteration. **SENSITIVITY:** report the cost change per Rp 1 change in the entering cell's unit cost.
- **Traps:** u_1 = 0 is an arbitrary anchor - the u's and v's are not unique, but the `d_ij` are; do not interpret an individual u or v as a price without care. The improvement index must be computed for **every** empty cell, not just the cheap-looking ones. Stopping at the first negative d_ij instead of the most negative still converges, but slowly. The closed loop turns only at *occupied* cells (it may pass through others) and each turn must alternate sign - a mis-traced loop produces an infeasible allocation that still totals correctly, which is why the row/column sums must be re-checked after every move. For a maximization transportation problem the stop rule inverts (all `d_ij <= 0`).
- **Volatility:** LOW

## Hungarian assignment method
- **When:** assigning n agents to n tasks one-to-one at minimum total cost (or maximum total value).
- **Inputs:** c_ij = cost of assigning agent i to task j (Rp, or hours); the matrix must be square.
- **Formula:** 1) pad to square with dummy rows/columns of cost 0. 2) subtract each row's minimum from that row. 3) subtract each column's minimum from that column. 4) cover all zeros with the **minimum** number of horizontal/vertical lines. 5) if lines = n, an optimal assignment exists among the zeros - stop. 6) otherwise let k = the smallest uncovered value; subtract k from every uncovered element, add k to every element at a line intersection, leave singly-covered elements alone; return to step 4.
- **Output shape:** computation block showing each reduced matrix, the line cover at each round, and the final assignment table (agent -> task -> original cost) with the total in Rp. **SENSITIVITY:** report the second-best assignment's total - if it is within a few percent, the "optimal" assignment is not worth defending against practical constraints.
- **Traps:** for a **maximization** problem, convert first: subtract every element from the matrix's largest element, then run the standard minimization steps - running the Hungarian method directly on a profit matrix maximizes nothing, it minimizes profit. Step 4 asks for the *minimum* number of covering lines; drawing more lines than necessary makes the method terminate early on a non-optimal assignment, and this is the dominant error. The final cost must always be read from the **original** matrix, never from the reduced one. Forbidden assignments are handled with a very large cost M, not by deletion, which would break squareness.
- **Volatility:** LOW

## CPM - forward pass, backward pass, float
- **When:** scheduling a project with known activity durations and dependencies; identifying what can slip.
- **Inputs:** activity list with duration t (days or weeks) and predecessors; project start = time 0.
- **Formula:** forward pass: `ES = max(EF of all predecessors)` (0 if none), `EF = ES + t`. Backward pass: `LF = min(LS of all successors)` (project EF for terminal activities), `LS = LF - t`. `Total float TF = LS - ES = LF - EF`. `Free float FF = min(ES of successors) - EF`. Critical path = the chain with `TF = 0`.
- **Output shape:** computation block, plus the activity table (Activity | t | predecessors | ES | EF | LS | LF | TF | FF) with the critical path named and the project duration **in days**. **SENSITIVITY:** for any crashing decision, report the cost slope `(crash cost - normal cost)/(normal time - crash time)` in Rp per day and crash the cheapest critical activity first.
- **Traps:** total float belongs to a *path*, not to an activity - consuming activity B's 5 days of total float can consume C's float too and turn a near-critical path critical; free float is the amount that can be used without disturbing any successor, and it is the only float an activity owns outright. Crashing a non-critical activity buys zero days and costs full money. After any crash, **recompute the critical path** - it moves, and a second (parallel) critical path appears, at which point both must be crashed together to buy one more day. A negative float means the imposed deadline is already earlier than the earliest possible finish.
- **Volatility:** LOW

## PERT - three-point estimate and probability of completion
- **When:** activity durations are uncertain and a completion date must be quoted with a confidence, not as a point.
- **Inputs:** a = optimistic time, m = most likely time, b = pessimistic time (all in days); D = the target/promised date (days).
- **Formula:** `te = (a + 4m + b) / 6` (days) · `variance = ((b - a) / 6)^2` (days squared) · project mean `Te = sum(te)` over the **critical path** · project variance `Var_p = sum(variance)` over the critical path · `sigma_p = sqrt(Var_p)` (days) · `Z = (D - Te) / sigma_p` · `P(finish by D) = Phi(Z)` from the standard normal table.
- **Output shape:** computation block, plus an activity table (a, m, b, te, variance), the critical path with Te and sigma_p **in days**, and the probability of meeting D as a percentage. **SENSITIVITY:** required whenever a penalty clause or a bonus is attached - report the date achieving 80% and 95% confidence, not just the mean date.
- **Traps:** `Te` is a **50% date** - quoting the PERT mean to a client as "the delivery date" means promising a coin flip. Variance is `((b-a)/6)^2`, not `(b-a)/6`; forgetting to square is a frequent, quiet error that makes sigma_p far too large. Variances are summed **only along the critical path** and only because the activities are assumed independent - correlated delays (one late supplier hitting three activities) break this and the true sigma_p is larger. A near-critical parallel path with high variance can become the binding path in a bad draw; PERT's normal approximation ignores this and therefore *overstates* the probability of on-time completion. Simulation (see Monte Carlo) handles it; PERT does not.
- **Volatility:** LOW

## Queueing M/M/1
- **When:** a single server, Poisson arrivals, exponential service; sizing waiting time or queue space.
- **Inputs:** lambda = arrival rate (customers/hour); mu = service rate per server (customers/hour); both in the **same** time unit.
- **Formula:** `rho = lambda / mu` (utilization, must be < 1) · `L = lambda / (mu - lambda)` (customers in system) · `Lq = rho^2 / (1 - rho)` (customers in queue) · `W = 1 / (mu - lambda)` (hours in system) · `Wq = rho / (mu - lambda)` (hours in queue) · `P0 = 1 - rho` · `Pn = (1 - rho) x rho^n`
- **Output shape:** computation block, plus the metric table (rho, L, Lq, W, Wq) **with units**, and the Wq-vs-rho curve. **SENSITIVITY:** required when staffing cost is involved - show Wq at rho = 0.80, 0.90, 0.95, which makes the nonlinearity undeniable.
- **Traps:** lambda and mu must share a time unit - mixing customers/hour with minutes/customer is the number-one error here; mu is a *rate* (customers/hour), so a 6-minute service time is mu = 10/hour, not mu = 6. `rho >= 1` means the queue grows without bound and every formula above returns garbage (or a negative W) rather than an error - always check rho first. Wq explodes nonlinearly near rho = 1: going from 90% to 95% utilization *doubles* the wait. A "busy" server at 95% is not efficient, it is one absence away from collapse. Real arrivals are rarely Poisson (appointment systems, shift starts) and real service times are rarely exponential - M/M/1 is a first estimate, not a design.
- **Volatility:** LOW

## Queueing M/M/c (multi-server)
- **When:** c identical parallel servers share one queue (call centre, teller line, dock doors).
- **Inputs:** lambda = arrival rate (customers/hour); mu = service rate **per server** (customers/hour); c = number of servers (count).
- **Formula:** `a = lambda / mu` (offered load, erlangs) · `rho = a / c` (must be < 1) · `P0 = [ sum_{n=0..c-1} (a^n / n!) + (a^c / c!) x (1 / (1 - rho)) ]^-1` · `Lq = P0 x a^c x rho / ( c! x (1 - rho)^2 )` · `Wq = Lq / lambda` · `W = Wq + 1/mu` · `L = lambda x W`
- **Output shape:** computation block, plus a table of (c, rho, Lq, Wq, servers cost, waiting cost, total cost) for c, c+1, c+2 - the staffing decision is a table, never a single number. **SENSITIVITY:** mandatory (this is a money and often a safety decision) - show total cost at +/-20% on lambda; the optimal c is usually stable, and that stability is the finding.
- **Traps:** the stability check is `lambda / (c x mu) < 1`, **not** `lambda/mu < 1` - a system with c = 3 and a = 2.4 is stable, and testing `a < 1` would wrongly declare it collapsing. mu is per server; multiplying it by c before substituting double-counts capacity. The `c!` and the `(1-rho)^2` in Lq are both routinely dropped or mis-placed - re-derive rather than recall if the numbers look implausible. Adding a server has sharply diminishing returns above c where rho drops below roughly 0.7; going from 1 to 2 servers can cut Wq by 90%, from 4 to 5 by almost nothing. Separate queues per server (supermarket style) perform strictly worse than one shared queue - if the model assumes a shared queue, the layout must actually have one.
- **Volatility:** LOW

## Little's Law
- **When:** any stable queue or process - the cheapest sanity check in operations, and it needs no distribution assumption.
- **Inputs:** L = average number in the system (items); lambda = average throughput rate (items/hour); W = average time in the system (hours).
- **Formula:** `L = lambda x W`, and for the queue alone `Lq = lambda x Wq`
- **Output shape:** computation block, plus the third quantity solved from the two that are known, **with its unit** ("WIP 340 units / throughput 85 units/hr = 4.0 hours of flow time").
- **Traps:** lambda is the **throughput actually flowing through** (arrivals that enter and eventually leave), not the offered demand or the capacity - using capacity where arrivals belong understates W. The system must be stable over the measurement window: if WIP is growing, L is not an average and the law does not apply to that window. The boundary of "the system" must be identical in all three terms - measuring L for the whole factory but W for one workstation gives a fluent, confident, meaningless number. Units must match: throughput per *hour* with time in *days* is off by 24x and looks entirely plausible.
- **Volatility:** LOW

## EMV and decision trees
- **When:** choosing among alternatives under risk, with known (or assessed) state probabilities and payoffs.
- **Inputs:** a = alternatives; s = states of nature; P(s) = probability (dimensionless, must sum to 1); payoff(a,s) = outcome (Rp).
- **Formula:** `EMV(a) = sum_s P(s) x payoff(a,s)` (Rp). Choose the alternative with the highest EMV. Tree: roll back right to left - at a chance node take the expectation, at a decision node take the maximum, prune the losing branches.
- **Output shape:** computation block, plus the payoff matrix (alternatives x states), an EMV column in Rp, and the tree with pruned branches marked. **SENSITIVITY:** mandatory - find the **break-even probability** at which the preferred alternative changes, and state whether the assessed probability is comfortably away from it.
- **Traps:** probabilities that do not sum to 1 make every EMV wrong while the arithmetic still runs cleanly - check the sum first, every time. EMV is the right criterion only for a *repeated* decision or a risk-neutral decision maker; for a one-shot bet that can bankrupt the firm, the highest-EMV option can be the wrong choice, and that is a utility problem, not an arithmetic one. Sunk costs must not appear in any payoff. Rolling back a tree left-to-right instead of right-to-left inverts the logic entirely. If the probabilities are guesses, the break-even-probability analysis is the real deliverable - the EMV number itself is theatre.
- **Volatility:** LOW

## EVPI (expected value of perfect information)
- **When:** deciding how much to pay for a study, a survey, a pilot, or a consultant before committing.
- **Inputs:** the same payoff matrix and P(s) as the EMV entry (Rp; probabilities dimensionless).
- **Formula:** `EVwPI = sum_s P(s) x max_a payoff(a,s)` (Rp) · `EVPI = EVwPI - EMV(best alternative)` (Rp)
- **Output shape:** computation block, plus the "best payoff per state" row that feeds EVwPI, and the EVPI stated in Rp as a **ceiling** on the research budget. **SENSITIVITY:** mandatory - recompute EVPI at +/-10 percentage points on the key probability; EVPI is largest when the decision is closest to a coin flip, and near-zero when one alternative dominates.
- **Traps:** EVPI is an **upper bound**, not a price - real information is imperfect, so the value of an actual study (EVSI) is always strictly less, often far less; quoting EVPI as the study's worth overpays. EVwPI takes the max **within each state** and then averages - taking the max of the EMVs instead collapses to the EMV and returns EVPI = 0. If EVPI comes out at or near zero, that is a genuine finding: the decision is insensitive to the uncertainty and no research is worth buying. EVPI can be large while the decision is still obvious - check which alternative EVPI would actually change before funding anything.
- **Volatility:** LOW

## Markov chains (transition matrix and steady state)
- **When:** modelling movement between discrete states over time - brand switching, machine up/down, customer credit status.
- **Inputs:** P = transition matrix, `P_ij` = probability of moving from state i to state j (dimensionless); each **row** must sum to 1. pi_0 = initial state vector (row vector of shares, summing to 1).
- **Formula:** `pi_(t+1) = pi_t x P` · `pi_n = pi_0 x P^n` · steady state: solve `pi = pi x P` together with `sum(pi_i) = 1`
- **Output shape:** computation block, plus the transition matrix with rows verified to sum to 1, the state vector at the horizons that matter, and the steady-state vector as shares (percent). If the states carry money (customers x margin), convert the steady-state shares into Rp per period. **SENSITIVITY:** if a decision depends on it, show the steady state under +/-5 percentage points on the largest switching probability.
- **Traps:** row-vector times matrix (`pi x P`) versus column-vector convention (`P' x pi'`) - mixing the two transposes the answer and produces a plausible, wrong steady state; fix the convention and check that rows (not columns) sum to 1. Solving `pi = pi x P` alone gives an underdetermined system - one equation is redundant, so **discard one and add the normalization** `sum(pi) = 1`, or the solution is the zero vector. A steady state exists and is unique only if the chain is irreducible and aperiodic; an **absorbing** chain (churned customers who never return, a scrapped machine) has no such steady state, and its questions are answered by the fundamental matrix `N = (I - Q)^-1` instead. The transition probabilities are assumed constant over time - after a price change or a competitor launch they are not, and a chain estimated on old data will confidently project a dead market.
- **Volatility:** LOW

## Monte Carlo simulation
- **When:** the model is analytically messy, several inputs are uncertain at once, or the tails matter more than the mean.
- **Inputs:** the deterministic model; a distribution per uncertain input (with its unit); N = number of iterations (count); the random seed.
- **Formula:** draw `u ~ Uniform(0,1)`, invert to the input distribution (`x = F^-1(u)`), run the model, repeat N times, then summarize the output distribution. Precision of the mean estimate: `SE = s / sqrt(N)` (unit of the output).
- **Output shape:** computation block for one traced iteration (so the arithmetic is checkable), plus the output histogram, the P5 / P50 / P95 in the output's unit, `P(outcome < threshold)`, and a tornado chart ranking inputs by their influence. **SENSITIVITY:** mandatory for money or safety outputs - the tornado chart **is** the sensitivity, and it is more decision-relevant than the mean.
- **Traps:** reporting the mean of a simulation defeats the purpose - if a point estimate were adequate, no simulation was needed; the deliverable is the distribution, above all the tail the decision fears. Treating inputs as independent when they are correlated (demand and price, fuel cost and freight rate) systematically **understates** tail risk - the bad draws arrive together in reality but never in the model. `SE = s/sqrt(N)` means halving the error needs **4x** the iterations; 1,000 runs is a sketch, not an answer. Defaulting every uncertain input to a triangular distribution because three points are easy to elicit quietly imposes a shape nobody checked. An unrecorded seed makes the result irreproducible, which in a regulated or audited setting makes it unusable.
- **Volatility:** LOW

## Game theory (2x2, dominant strategy, Nash, minimax, mixed)
- **When:** the payoff depends on a rival's simultaneous choice - pricing, capacity, bidding, entry.
- **Inputs:** the payoff matrix; for a zero-sum game with row payoffs `[[a, b], [c, d]]` all entries in Rp (or share points).
- **Formula:** **Dominant strategy:** a strategy strictly better for a player regardless of the rival's choice - if one exists, it is played. **Pure Nash equilibrium:** a cell where neither player gains by unilaterally deviating (check each cell against its own column-best and row-best). **Zero-sum saddle point:** `maximin` (row: best of the row minima) and `minimax` (column: best of the column maxima); if they are equal, that value is the game's value and both play pure. **Zero-sum 2x2 mixed** (no saddle point), with `D = a + d - b - c`: `p = (d - c)/D` = probability the row player plays row 1 · `q = (d - b)/D` = probability the column player plays column 1 · `V = (ad - bc)/D` = value of the game (Rp).
- **Output shape:** computation block, plus the payoff matrix with each player's best responses marked, the equilibrium named, and for a mixed solution the probabilities (dimensionless) alongside V **with its unit**. **SENSITIVITY:** required - state how far a payoff can move before the equilibrium changes cell.
- **Traps:** the `p`, `q`, `V` formulas above apply to a **zero-sum 2x2 with no saddle point** - applying them to a non-zero-sum game (each cell holding two different payoffs) is wrong. In a non-zero-sum game each player mixes to make the **other** player indifferent, using the **other** player's payoffs, and that is a different calculation. Always test for a saddle point *before* mixing: if a saddle exists, mixing is unnecessary and the formulas can even divide by a near-zero D. A game can have zero, one, or several pure Nash equilibria - finding one and stopping misses the coordination problem entirely. Nash equilibrium is not the Pareto-best outcome (the Prisoner's Dilemma is exactly the case where the dominant-strategy equilibrium is worse for both), so "we found the Nash equilibrium" is a description of the trap, not a recommendation to walk into it. And the payoff matrix is itself an assumption about the rival's objective - a rival maximizing share, not profit, plays a different game.
- **Volatility:** LOW
