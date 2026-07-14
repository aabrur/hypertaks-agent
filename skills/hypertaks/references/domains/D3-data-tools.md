# D3 - Data Tools
Every entry: **when · inputs · formula · output shape · traps · volatility**

Scope: Excel, Power Query, DAX, Solver, Python (pandas / numpy / statsmodels /
scikit-learn / PuLP / OR-Tools), SQL, and database design.

**Volatility note - read before you trust recall.** Mathematics and SQL semantics
(join algebra, three-valued logic, normal-form definitions, ACID) are `LOW`: they do
not move, recall is fine. **Library APIs (pandas, scikit-learn, statsmodels,
OR-Tools, DAX, Power Query M) are `MEDIUM`: signatures, defaults, and deprecations
change between releases.** For every `MEDIUM` entry, treat the snippet as a shape to
adapt, not a quotation to paste: verify argument names and defaults against the
current release docs, and state which behaviour you assumed. Never write a version
string from memory.

Every snippet below must be **run**, not admired. The deliverable is a runnable
snippet **plus a validation step** whose output proves the code did what the prose
claims (row counts before and after, a reconciliation total, a null audit).

---

## Excel lookup: XLOOKUP vs INDEX+MATCH vs VLOOKUP
- **When:** pulling an attribute from a reference table into a transaction table.
- **Inputs:** a lookup key, a lookup range, a return range, a decision on what an unmatched key means.
- **Formula:** `XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode], [search_mode])` · `INDEX(return_range, MATCH(lookup_value, lookup_range, 0))` · `VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])`
- **Output shape:** the formula written against real ranges, plus a match-rate check: `COUNTIF(key_range, "<>") - SUMPRODUCT(--ISNA(result_range))` or a count of `#N/A` cells. State the unmatched count explicitly; a lookup with 3% silent misses is a wrong report.
- **Traps:** VLOOKUP breaks in three ways, and all three are silent. (1) `col_index_num` is a **positional integer**, so inserting or deleting a column inside `table_array` shifts the answer to a different column without any error. (2) It cannot look **left** of the key. (3) Its fourth argument **defaults to TRUE** (approximate match), which on unsorted data returns a plausible neighbour rather than an error - the single most expensive default in the product. Always pass `FALSE` / `0`. INDEX+MATCH survives column moves but still needs `0` as the third MATCH argument. XLOOKUP defaults to exact match and takes an `if_not_found` argument, so use it where available; **its availability depends on the Excel build**, so an INDEX+MATCH fallback is still required for shared workbooks. All three break on type mismatch (text "00123" vs number 123) and trailing spaces: pre-clean with `TRIM` and a deliberate `TEXT`/`VALUE` cast, and never trust a lookup you have not counted the misses on.
- **Volatility:** MEDIUM (function availability varies by build; behaviour is stable)

## Excel statistical functions and the safety-stock Z value
- **When:** computing a confidence interval, a control limit, or a service-level Z for safety stock.
- **Inputs:** a probability (a service level or a confidence level), a sample standard deviation, a sample size, lead time.
- **Formula:** `NORM.S.INV(probability)` -> the standard-normal z. `NORM.INV(probability, mean, standard_dev)`. `NORM.S.DIST(z, TRUE)` -> the cumulative probability back. `STDEV.S(range)` (sample, n-1) vs `STDEV.P(range)` (population, n). Safety stock with constant lead time: `SS = z * sigma_d * SQRT(L)`. With variable lead time: `SS = z * SQRT(L * sigma_d^2 + d^2 * sigma_L^2)`.
- **Output shape:** the cell formulas plus a computation block showing the substitution and the unit (units, not "a number"). **SENSITIVITY: this drives inventory money and stockout risk. Report SS at the target service level and at +/-1 service-level step (for example 90 / 95 / 98 percent) and at +/-20% on sigma_d, and state the cash tied up at each. Z is convex in the service level: the last two points of service cost far more than the first ninety.**
- **Traps:** `NORM.S.INV(0.95) = 1.6449` is the **one-tailed** value and is the correct one for safety stock (you only care about running out, not about overstocking). `1.96` is the **two-tailed** 95% value and belongs in a confidence interval. Mixing them silently over- or under-stocks by ~19%. Second trap: sigma_d must be the standard deviation of demand **over the same time bucket as L** - weekly sigma with a lead time in days is a units mismatch, not an arithmetic error, so nothing complains. Third: `STDEV.P` on a sample understates sigma and quietly under-stocks. Fourth: legacy names (`NORMSINV`, `STDEV`) still evaluate for compatibility, so an old workbook mixing both conventions will not error.
- **Volatility:** LOW

## Power Query (shape / ETL)
- **When:** repeatable ingestion and reshaping before the data reaches a sheet or a model. Any transform you would otherwise redo by hand each month.
- **Inputs:** a source (file / folder / database / API), the target shape (one row per grain), the refresh cadence.
- **Formula:** `Table.SelectRows(Source, each [Qty] > 0)` · `Table.Group(Source, {"Region"}, {{"Units", each List.Sum([Qty]), type number}})` · `Table.UnpivotOtherColumns(Source, {"Region"}, "Month", "Value")` · `Table.TransformColumnTypes(Source, {{"Qty", Int64.Type}})`
- **Output shape:** the Applied Steps list (each step named for what it does, not "Changed Type1"), plus a row-count and a sum reconciliation against the source before and after the transform.
- **Traps:** (1) **Query folding**: while steps fold, they run on the source server; the first non-foldable step (a custom M function, `Table.Buffer`, some index columns) pulls the **entire table** into memory and every later step runs locally. A ten-second query becomes a ten-minute one with no warning. Check "View Native Query" at the last step. (2) The auto-inserted **"Changed Type" step hardcodes column names**, so an upstream rename breaks the refresh with a misleading error many steps later. (3) Type conversion is **locale-dependent**: a comma decimal separator becomes a thousands separator and 1,5 turns into 15. Use `Table.TransformColumnTypes` with an explicit culture. (4) "Use First Row as Headers" applied before removing junk rows promotes a junk row. (5) Absolute local file paths break for every other user; parameterise the path.
- **Volatility:** MEDIUM (M library surface changes; verify against current docs)

## DAX basics: measures vs calculated columns, CALCULATE, filter context
- **When:** building a semantic model where one number must respond correctly to every slicer.
- **Inputs:** a star-schema model with relationships, a marked Date table, an agreed grain.
- **Formula:** `Total Sales = SUMX(Sales, Sales[Qty] * Sales[UnitPrice])` · `Margin % = DIVIDE([Margin], [Total Sales])` · `Sales LY = CALCULATE([Total Sales], SAMEPERIODLASTYEAR('Date'[Date]))` · `West Only = CALCULATE([Total Sales], KEEPFILTERS(Sales[Region] = "West"))`
- **Output shape:** the measure definitions plus a validation matrix: the measure evaluated at total level, at one slicer, and at two slicers, reconciled against a known-good SQL or Excel total. A measure that is right at the row level and wrong at the total level is the normal failure, so **always check the total**.
- **Traps:** (1) A **calculated column** is evaluated in row context at refresh and stored in the model: it inflates memory and **cannot react to a slicer**. A **measure** is evaluated in filter context at query time. Choosing a column where a measure belongs produces a number that is frozen and quietly wrong under filtering. (2) `CALCULATE` filter arguments **replace** the existing filter on the same column, they do not intersect it: `CALCULATE([Total Sales], Sales[Region] = "West")` returns West even when the user has sliced to East. Wrap in `KEEPFILTERS` when you mean "and also". (3) Never sum a calculated column of ratios; recompute the ratio from the summed numerator and denominator. (4) Use `DIVIDE` rather than `/` so a zero denominator yields blank instead of an error that poisons the visual. (5) Time-intelligence functions require a **contiguous, marked Date table**; on a fact-date column they return silently wrong periods.
- **Volatility:** MEDIUM (verify function behaviour against current docs)

## Excel Solver (linear-program setup)
- **When:** a small allocation, product mix, blending, or transportation problem with a linear objective and linear constraints.
- **Inputs:** decision cells, an objective cell that is a **formula referencing the decision cells**, constraint left-hand-side cells (also formulas), right-hand-side capacity values, and their units.
- **Formula:** objective `=SUMPRODUCT(margin_range, decision_range)` -> Max. Constraints `=SUMPRODUCT(usage_row, decision_range) <= capacity_cell` for each resource. Engine: **Simplex LP**. Tick "Make Unconstrained Variables Non-Negative".
- **Output shape:** the model layout (which cells are variables, objective, constraints), the solved values with units, the objective value with a currency unit, and the **Sensitivity Report** (shadow price and allowable increase/decrease per constraint). **SENSITIVITY: this allocates money. Report the shadow price of each binding constraint and the RHS range over which it holds; outside that range the shadow price is invalid and the marginal-value story you told is void.**
- **Traps:** (1) Selecting **GRG Nonlinear** on a model that is linear returns a **local** solution and no trustworthy sensitivity report; pick Simplex LP whenever the model is linear. (2) Forgetting non-negativity yields negative production quantities that look like a clever answer. (3) Adding an **integer or binary constraint makes the Sensitivity Report unavailable** - shadow prices are not defined for integer programs, so any "value of one more machine hour" claim built on one is fiction. (4) An objective cell containing a **constant** rather than a formula makes Solver report success without changing anything. (5) "Solver found a solution" is not "Solver found the optimum" for nonlinear engines. (6) Mismatched range sizes in `SUMPRODUCT` return `#VALUE!` only sometimes; more often they align wrongly and return a number.
- **Volatility:** MEDIUM (add-in availability and engine defaults vary by build)

## Pivot tables
- **When:** fast interactive aggregation over a clean, single-grain table.
- **Inputs:** a source formatted as a **Table** (so new rows enter the range automatically), no blank rows, no merged cells, one header row.
- **Formula:** Rows / Columns / Values / Filters. `Value Field Settings -> Sum | Count | Average`, `Show Values As -> % of Parent Total`. Reference a cell safely with `GETPIVOTDATA("Revenue", $A$3, "Region", "West")`.
- **Output shape:** the pivot plus a grand-total reconciliation against a plain `SUM` of the source column. If those two numbers differ, the pivot is wrong, not the sum.
- **Traps:** (1) A single **blank or text cell** in a numeric column flips the default aggregation from Sum to **Count**, and a count of 412 looks enough like a revenue figure to survive a meeting. (2) A pivot reads from a **cached copy**; edits to the source do nothing until Refresh, so yesterday's numbers keep rendering. (3) If the source came from a join that fanned out (see the join entry), every total is silently multiplied - the pivot faithfully sums duplicated rows. (4) **Distinct Count** is only available when the source is added to the Data Model. (5) Automatic date grouping invents a hierarchy that later breaks a formula referencing the old field name.
- **Volatility:** LOW

---

## pandas idioms: groupby, merge, pivot, and the SettingWithCopy trap
- **When:** any tabular transformation past a few thousand rows or past one manual pass.
- **Inputs:** a DataFrame with a declared grain, dtypes you have actually inspected (`df.dtypes`), a null audit (`df.isna().sum()`).
- **Formula:**
  ```python
  agg = (df.groupby(["region", "sku"], as_index=False, dropna=False)
           .agg(units=("qty", "sum"), orders=("order_id", "nunique")))

  out = agg.merge(prices, on="sku", how="left",
                  validate="many_to_one", indicator=True)
  assert (out["_merge"] == "left_only").sum() == 0, "unmatched sku in prices"

  wide = df.pivot_table(index="region", columns="month", values="qty",
                        aggfunc="sum", fill_value=0)
  ```
- **Output shape:** the snippet plus an assertion block that runs: row count before and after the merge (they must match for a `many_to_one` join), the unmatched-key count from `indicator=True`, and a sum reconciliation of the value column before and after.
- **Traps:** (1) **`groupby` drops NULL keys by default** - `dropna=False` is not the default, so rows with a missing key vanish and the totals no longer reconcile, with no warning. (2) A merge on a key that is **not unique on the right** silently fans out rows and multiplies every downstream sum; `validate="many_to_one"` converts that silent corruption into an exception, so pass it every time. (3) **SettingWithCopy**: `df[df.qty > 0]["flag"] = 1` assigns into a temporary and the original is never modified; you get a warning (sometimes) and no data. Write `df.loc[df.qty > 0, "flag"] = 1`. Take an explicit `.copy()` when you slice and intend to mutate. (4) `float` money columns accumulate representation error; use `Decimal` or integer minor units for anything invoiced. (5) Chained boolean masks need parentheses: `df[(df.a > 0) & (df.b < 5)]`. (6) `inplace=True` is not a performance win and is being wound down; assign the result instead.
- **Volatility:** MEDIUM (defaults and deprecations move; verify against the current release)

## numpy vectorization
- **When:** an element-wise or matrix computation currently written as a Python loop, or any numeric kernel in a hot path.
- **Inputs:** arrays with known `dtype` and `shape`; a clear statement of which axis means what.
- **Formula:**
  ```python
  import numpy as np
  z = (x - x.mean()) / x.std(ddof=1)      # sample z-score
  line_total = qty @ price                # matrix product, replaces the loop
  clipped = np.clip(demand - stock, 0, None)
  ```
- **Output shape:** the vectorized snippet, an equality check against the loop version on a small sample (`np.allclose(fast, slow)`), and the timing of both. A speed claim without both numbers is not a claim.
- **Traps:** (1) **`np.std` defaults to `ddof=0` (population), while `pandas.Series.std` defaults to `ddof=1` (sample).** The same column standard-deviated through the two libraries gives two different numbers, and both look right. Set `ddof` explicitly, always. (2) **Broadcasting** silently succeeds on shapes you did not intend: a `(n,1)` minus a `(1,n)` gives an `(n,n)` matrix instead of an error. Assert the output shape. (3) Integer arrays **overflow silently** and wrap around to negative values. (4) `np.nan` propagates through `sum`/`mean`; use `np.nansum` / `np.nanmean` deliberately, and never as a way to avoid asking why the NaN is there. (5) `==` on floats; use `np.isclose`.
- **Volatility:** MEDIUM

## statsmodels OLS and reading the summary table
- **When:** you need coefficients with **inference** (standard errors, p-values, confidence intervals), not just a prediction.
- **Inputs:** a dependent variable, regressors, a stated causal or descriptive claim, and a residual plan.
- **Formula:**
  ```python
  import statsmodels.api as sm
  X = sm.add_constant(df[["price", "promo"]])     # intercept is NOT automatic
  model = sm.OLS(df["units"], X).fit(cov_type="HC3")   # heteroskedasticity-robust SE
  print(model.summary())
  ```
- **Output shape:** the coefficient table (estimate, robust SE, t, p, 95% CI), R2 and adjusted R2, n, the F-test, and **one sentence per coefficient stating the unit** ("a Rp 1,000 price rise is associated with -3.2 units sold per week"). Plus a residual check. **SENSITIVITY: if a coefficient drives a pricing or budget decision, report the decision at the low and high end of its 95% confidence interval. A point estimate handed to finance without its interval is a guess in a lab coat.**
- **Traps:** (1) **`sm.OLS` adds no intercept.** Omit `add_constant` and you fit through the origin; the coefficients shift and the reported R2 becomes the **uncentered** R2, which is usually large and flattering. This is the classic silent wrong answer of the library. (2) Default standard errors assume homoskedasticity; with real business data they are usually too small, so p-values look better than they are. Use `cov_type="HC3"`, or `cov_type="cluster"` with groups when observations cluster. (3) R2 always rises when a regressor is added; never select variables on it. (4) Multicollinearity does not bias coefficients but inflates their SE, so a variable that matters can show p > 0.05; check VIF before dropping anything. (5) Time-series data violates the independence assumption: residual autocorrelation makes every p-value optimistic (check Durbin-Watson in the summary). (6) Association is not causation, and no `cov_type` fixes that.
- **Volatility:** MEDIUM

## scikit-learn: train/test split, leakage, cross-validation
- **When:** the deliverable is a **prediction** whose out-of-sample accuracy matters.
- **Inputs:** a feature matrix, a target, a clear statement of what will be known **at prediction time**, and the time ordering of the rows.
- **Formula:**
  ```python
  from sklearn.model_selection import train_test_split, cross_val_score, TimeSeriesSplit
  from sklearn.pipeline import Pipeline
  from sklearn.preprocessing import StandardScaler
  from sklearn.linear_model import LogisticRegression

  X_tr, X_te, y_tr, y_te = train_test_split(
      X, y, test_size=0.2, random_state=42, stratify=y)

  pipe = Pipeline([("scale", StandardScaler()),
                   ("clf", LogisticRegression(max_iter=1000))])
  scores = cross_val_score(pipe, X_tr, y_tr, cv=5, scoring="roc_auc")
  pipe.fit(X_tr, y_tr)      # test set touched exactly once, at the end
  ```
- **Output shape:** cross-validated mean and standard deviation of the metric, then the **single** held-out test score, a confusion matrix at the chosen threshold, and a baseline (majority class or last-value) to beat. A model that does not beat its baseline is a finding, and it must be reported as one.
- **Traps:** (1) **Leakage through preprocessing**: fitting a scaler, an imputer, or a target encoder on the full dataset before splitting leaks test statistics into training. Everything inside a `Pipeline`, always - that is what a Pipeline is for. (2) **Leakage through time**: a random split on time-ordered data lets the model see the future; use `TimeSeriesSplit` and split on a date. (3) **Leakage through the feature itself**: a column that is only populated after the event you predict (a "cancellation reason" when predicting cancellation) yields a suspiciously excellent score. A near-perfect AUC is evidence of a bug, not of a good model. (4) **Accuracy on imbalanced data is meaningless**: 99% accuracy on a 1% positive rate is achieved by predicting "no" forever. Use ROC-AUC, PR-AUC, or recall at a fixed precision. (5) Tuning hyperparameters against the test set turns it into a training set; use a nested or a separate validation split. (6) `random_state` unset makes results irreproducible.
- **Volatility:** MEDIUM (estimator defaults change; verify against the current release)

## PuLP and OR-Tools: LP and assignment setup
- **When:** allocation, product mix, blending, routing, scheduling, or assignment past the size Excel Solver handles.
- **Inputs:** decision variables (with domain: continuous / integer / binary), an objective coefficient per variable **with a unit**, constraints with right-hand sides and units, and a feasibility sanity check.
- **Formula:**
  ```python
  import pulp
  prob = pulp.LpProblem("product_mix", pulp.LpMaximize)
  x = pulp.LpVariable.dicts("x", products, lowBound=0, cat="Continuous")
  prob += pulp.lpSum(margin[p] * x[p] for p in products)          # objective first
  for m in machines:
      prob += (pulp.lpSum(hours[p][m] * x[p] for p in products)
               <= capacity[m], f"cap_{m}")                        # named constraint
  prob.solve(pulp.PULP_CBC_CMD(msg=False))
  print(pulp.LpStatus[prob.status], pulp.value(prob.objective))
  ```
  Assignment (one worker to one task) with OR-Tools CP-SAT:
  ```python
  from ortools.sat.python import cp_model
  model = cp_model.CpModel()
  x = {(w, t): model.NewBoolVar(f"x_{w}_{t}") for w in workers for t in tasks}
  for w in workers:
      model.AddExactlyOne(x[w, t] for t in tasks)
  for t in tasks:
      model.AddExactlyOne(x[w, t] for w in workers)
  model.Minimize(sum(cost[w][t] * x[w, t] for w in workers for t in tasks))
  solver = cp_model.CpSolver()
  status = solver.Solve(model)
  ```
- **Output shape:** the solver **status printed and checked** (`Optimal` / `Infeasible` / `Unbounded`), the objective value with a currency or time unit, the non-zero decision variables, and the binding constraints. **SENSITIVITY: this allocates money or capacity. Re-solve at +/-10% on each binding right-hand side and report the change in the objective (the shadow price). If the model has integer variables, say plainly that shadow prices do not exist for it and re-solve instead of interpolating.**
- **Traps:** (1) **Never read the objective without reading the status.** An infeasible or unbounded model still returns a number from `pulp.value`, and it is meaningless. (2) In PuLP, the objective is simply the **first bare expression** added with `+=`; adding a second bare expression later **silently replaces the objective** rather than adding a constraint. Every constraint must contain a comparison operator. (3) An unbounded LP nearly always means a missing capacity constraint; an infeasible one nearly always means a units mismatch (hours against minutes) or contradictory bounds. Print the units next to each constraint. (4) `cat="Integer"` on a model that does not need it can multiply solve time enormously, for no gain. (5) Floating-point equality constraints (`== 100.0`) can be marginally infeasible; use a tolerance band. (6) OR-Tools exposes both older CamelCase and newer snake_case method names across releases - **check the current docs before assuming either spelling**.
- **Volatility:** MEDIUM

---

## SQL JOIN semantics and the fan-out trap
- **When:** every time two tables meet. Also every time a total is wrong by a suspiciously round multiple.
- **Inputs:** the **grain** of each table stated out loud ("one row per order" vs "one row per order line"), the join key, and its uniqueness on each side.
- **Formula:**
  ```sql
  -- WRONG: freight is charged once per order but is summed once per LINE
  SELECT o.region, SUM(o.freight) AS freight, SUM(l.qty * l.unit_price) AS revenue
  FROM orders o JOIN order_lines l ON l.order_id = o.order_id
  GROUP BY o.region;

  -- RIGHT: collapse the many-side to the order grain first, then join
  WITH line_totals AS (
      SELECT order_id, SUM(qty * unit_price) AS revenue
      FROM order_lines GROUP BY order_id
  )
  SELECT o.region, SUM(o.freight) AS freight, SUM(lt.revenue) AS revenue
  FROM orders o LEFT JOIN line_totals lt ON lt.order_id = o.order_id
  GROUP BY o.region;
  ```
- **Output shape:** the query plus a grain proof: `SELECT COUNT(*), COUNT(DISTINCT join_key) FROM right_table` (equal = safe to join, unequal = fan-out risk), and the row count before and after the join.
- **Traps:** (1) **Fan-out / row multiplication** is the deadliest silent error in analytics: joining a one-row-per-order table to a many-rows-per-order table multiplies every order-level measure by the line count. The query succeeds, the report renders, freight is overstated by 3.7x, and nobody sees it because the number is still plausible. Aggregate the many-side to the target grain **before** joining. (2) A **`LEFT JOIN` with a `WHERE` predicate on the right table silently becomes an `INNER JOIN`**, because `WHERE right.col = 'x'` rejects the NULL-extended non-matching rows; put the predicate in the `ON` clause instead. (3) A missing `ON` clause (or `CROSS JOIN`) produces a cartesian product that on small tables just looks like more data. (4) Joining on a nullable key never matches NULL to NULL. (5) `SUM(DISTINCT col)` is not a fix for fan-out: it also collapses two genuinely equal values into one.
- **Volatility:** LOW

## SQL window functions
- **When:** ranking, deduplication, running totals, period-over-period change - any calculation that needs the row **and** its neighbours.
- **Inputs:** a partition key, a **deterministic** ordering key, and an explicit frame.
- **Formula:**
  ```sql
  SELECT
    customer_id,
    order_date,
    amount,
    ROW_NUMBER() OVER (PARTITION BY customer_id
                       ORDER BY order_date DESC, order_id DESC) AS rn,
    LAG(amount) OVER (PARTITION BY customer_id ORDER BY order_date) AS prev_amount,
    SUM(amount) OVER (PARTITION BY customer_id ORDER BY order_date
                      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total
  FROM orders;
  ```
- **Output shape:** the query, plus a spot-check of one partition printed in full so the running total and the lag can be read by eye against the raw rows.
- **Traps:** (1) **The default frame is `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`, not `ROWS`.** With `RANGE`, all rows sharing the same `ORDER BY` value are treated as one peer group, so a running total **jumps** by the whole day's amount on every tied date instead of accumulating row by row. Write `ROWS` explicitly whenever you mean row-by-row. This is a textbook silent wrong answer. (2) `ROW_NUMBER` with a non-unique `ORDER BY` is **nondeterministic**: a dedupe keyed on `rn = 1` returns a different row on each run. Always add a tiebreaker column. (3) `RANK` leaves gaps after ties (1,1,3); `DENSE_RANK` does not (1,1,2). Picking the wrong one shifts every "top N" boundary. (4) You **cannot filter on a window result in `WHERE`** - windows are evaluated after `WHERE`. Wrap the query in a CTE and filter outside. (5) `LAG` returns NULL for the first row of each partition; a downstream `prev - current` then quietly drops that row.
- **Volatility:** LOW

## CTEs and recursive CTEs
- **When:** naming an intermediate step so the query stays readable, or walking a hierarchy (org chart, bill of materials, category tree).
- **Inputs:** for a recursive CTE: an anchor (the base rows), a recursive term that joins back to the CTE, and a **termination guard**.
- **Formula:**
  ```sql
  WITH RECURSIVE org AS (
      SELECT employee_id, manager_id, 1 AS depth          -- anchor
      FROM employees
      WHERE manager_id IS NULL
    UNION ALL
      SELECT e.employee_id, e.manager_id, o.depth + 1     -- recursive term
      FROM employees e
      JOIN org o ON e.manager_id = o.employee_id
      WHERE o.depth < 20                                  -- cycle guard
  )
  SELECT * FROM org ORDER BY depth;
  ```
- **Output shape:** the query, the max depth reached, and a row count compared against `SELECT COUNT(*) FROM employees` (a tree walk that returns more rows than the table has is a cycle).
- **Traps:** (1) **A cyclic graph makes a recursive CTE loop until the server runs out of memory.** Real org and BOM data contains cycles far more often than anyone expects (a self-managing manager, a part that contains itself). The depth guard is not optional. (2) `UNION` in the recursive term deduplicates and can mask a cycle at a heavy cost; `UNION ALL` is faster but has no such safety net - keep `UNION ALL` and keep the guard. (3) The `RECURSIVE` keyword is required in PostgreSQL, SQLite, and MySQL, and **is not used** in SQL Server. Porting a query between them fails loudly, which is the good case. (4) A CTE is a **hint, not a guarantee, of materialization**: some optimizers inline it and re-execute it once per reference, turning a tidy query into a slow one. (5) Referencing a CTE twice does not compute it twice in every engine - do not rely on either behaviour for side effects.
- **Volatility:** LOW

## GROUP BY vs HAVING
- **When:** any aggregation with a filter, where the filter must be placed on the correct side of the grouping.
- **Inputs:** the grouping key, the aggregate, and a decision on whether each filter applies to **rows** or to **groups**.
- **Formula:**
  ```sql
  SELECT region, COUNT(*) AS orders, SUM(amount) AS revenue
  FROM orders
  WHERE order_date >= :start_date        -- row filter, applied BEFORE grouping
  GROUP BY region
  HAVING SUM(amount) > :min_revenue      -- group filter, applied AFTER grouping
  ORDER BY revenue DESC;
  ```
- **Output shape:** the query plus the count of groups before and after the `HAVING`, so the filter's effect is visible rather than assumed.
- **Traps:** (1) Logical evaluation order is `FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> LIMIT`. Moving a row-level predicate into `HAVING` still returns the right answer here but scans and aggregates everything first; moving a group-level predicate into `WHERE` fails outright. (2) A `SELECT` **alias cannot be used in `WHERE` or `HAVING`** in most engines (it can in `ORDER BY`), because `SELECT` is evaluated later. (3) **`COUNT(*)` counts rows including NULLs; `COUNT(col)` skips NULL `col`.** Two counts side by side in one report disagreeing by exactly the null count is the standard confused-stakeholder moment. (4) Non-aggregated, non-grouped columns in `SELECT`: strict engines reject it, MySQL historically returned an arbitrary row's value silently. (5) `HAVING COUNT(*) > 1` finds duplicates - use it as the standard duplicate probe before every join.
- **Volatility:** LOW

## SQL NULL semantics (three-valued logic)
- **When:** always. This is the single largest source of silently wrong SQL.
- **Inputs:** a null audit of every column touched: `SELECT COUNT(*) - COUNT(col) AS nulls FROM t`.
- **Formula:**
  ```sql
  -- WRONG: returns ZERO rows if blacklist.customer_id contains a single NULL
  SELECT * FROM orders
  WHERE customer_id NOT IN (SELECT customer_id FROM blacklist);

  -- RIGHT: NOT EXISTS is null-safe
  SELECT o.* FROM orders o
  WHERE NOT EXISTS (
      SELECT 1 FROM blacklist b WHERE b.customer_id = o.customer_id
  );
  ```
- **Output shape:** the query, the null count per joined/filtered column, and an explicit statement of what a NULL **means** in this dataset (not yet known / not applicable / zero). Those three are different, and only the third may be `COALESCE`d to 0.
- **Traps:** (1) `NULL = NULL` evaluates to **UNKNOWN**, not TRUE. Use `IS NULL`. (2) **`NOT IN` with a NULL anywhere in the subquery returns no rows at all** - not fewer rows, zero rows - because `x <> NULL` is UNKNOWN and never TRUE. The query runs, returns an empty set, and someone concludes the blacklist matched everyone. Use `NOT EXISTS`. (3) `WHERE status <> 'cancelled'` **excludes rows where status IS NULL**, so "everything not cancelled" silently loses the unknowns. Write `WHERE status IS DISTINCT FROM 'cancelled'` or add `OR status IS NULL`. (4) Aggregates **skip NULLs**: `AVG(col)` divides by the non-null count, so `AVG(col) <> SUM(col)/COUNT(*)` whenever nulls exist, and both are defensible depending on what NULL means. (5) `COALESCE(col, 0)` before an `AVG` changes the answer - decide deliberately. (6) A UNIQUE constraint permits **multiple NULLs** in most engines, so "unique" does not prevent duplicate unknowns. (7) String concatenation with NULL yields NULL in standard SQL; Oracle treats the empty string as NULL, so ports break quietly.
- **Volatility:** LOW

---

## Normalization: 1NF, 2NF, 3NF
- **When:** designing an OLTP schema, or diagnosing why an update corrupted half a table.
- **Inputs:** the entity list, the candidate keys, and the functional dependencies.
- **Formula:** **1NF** = atomic values, no repeating groups, no comma-separated lists in a cell. **2NF** = 1NF + no **partial** dependency (no non-key attribute depends on only part of a composite key). **3NF** = 2NF + no **transitive** dependency (no non-key attribute depends on another non-key attribute). Mnemonic: every non-key attribute depends on **the key, the whole key, and nothing but the key**. **BCNF** tightens 3NF for overlapping candidate keys.
- **Output shape:** the table list with primary and foreign keys, the functional dependencies that justified each split, and the normal form each table reaches, stated.
- **Traps:** (1) Storing `"red,blue,green"` in one column breaks 1NF and makes every future query a `LIKE '%blue%'` that cannot use an index and matches "blueish" too. (2) A **transitive dependency** (`order -> customer_id -> customer_city`) means the city is stored once per order; changing it updates some rows and not others, and the table now disagrees with itself - the update anomaly. (3) Normalizing an **analytics** schema to 3NF is the opposite error: a star schema wants denormalized dimensions (see below). Normal form is a rule for the write side. (4) Do not normalize a **point-in-time fact**: an invoice must store the price **as charged**, not a foreign key to a current price that will later change and restate history.
- **Volatility:** LOW

## ERD notation
- **When:** agreeing on a data model with humans before writing DDL.
- **Inputs:** entities, attributes, keys, relationships, and the **cardinality and optionality** of each relationship.
- **Formula:** Crow's-foot: a single bar = exactly one, a circle = zero (optional), a crow's foot = many. Read each relationship **in both directions** in a sentence: "each order belongs to exactly one customer; each customer places zero or many orders". Resolve every M:N with an **associative (junction) table** holding both foreign keys plus any attributes of the relationship itself (quantity, price at the time, valid_from).
- **Output shape:** the diagram plus a written sentence per relationship, in both directions, with cardinality **and** optionality. A diagram nobody can read aloud has not been agreed to.
- **Traps:** (1) Drawing an M:N relationship and never resolving it: it is not implementable, so someone will improvise a comma-separated column. (2) Ignoring **optionality** - "one" vs "zero or one" is the difference between a `NOT NULL` foreign key and a nullable one, which changes every downstream join to a `LEFT JOIN`. (3) The junction table's own attributes get forgotten, and then the quantity on a line item has nowhere to live. (4) Cardinality drawn from the wrong end (the crow's foot is on the "many" side).
- **Volatility:** LOW

## ACID
- **When:** any write path where a partial result would be worse than no result: money movement, inventory decrement, order placement.
- **Inputs:** the transaction boundary (what must succeed or fail together), and the failure modes you are actually protecting against.
- **Formula:** **A**tomicity (all or nothing) · **C**onsistency (the transaction moves the database from one state satisfying all constraints to another) · **I**solation (concurrent transactions do not see each other's partial work) · **D**urability (a committed write survives a crash).
- **Output shape:** the explicit transaction block (`BEGIN` / `COMMIT` / `ROLLBACK`), the constraints that enforce "consistency" named individually, and the isolation level chosen with a reason.
- **Traps:** (1) **"Consistency" means constraint consistency, not business correctness.** ACID will happily commit a fully atomic, durable, perfectly isolated transaction that debits the wrong account. (2) **DDL auto-commits in MySQL and Oracle**, so a migration script wrapped in a transaction is **not rollback-able** there, while it is in PostgreSQL. Discovering that mid-incident is a bad evening. (3) Autocommit is on by default in most clients: a "transaction" that was never opened commits statement by statement. (4) Atomicity does not extend across services; two databases and a message queue need an outbox or a saga, not hope. (5) Durability is settings-dependent (fsync / replication acknowledgement modes); a "committed" write can be lost if durability was tuned away for speed.
- **Volatility:** LOW

## Transaction isolation levels and their anomalies
- **When:** any concurrent read-then-write in application code (check stock, then decrement; read balance, then debit).
- **Inputs:** the concurrency scenario, the anomaly you cannot tolerate, and the engine's actual mapping of the level names.

| Level | Dirty read | Non-repeatable read | Phantom read |
|---|---|---|---|
| READ UNCOMMITTED | possible | possible | possible |
| READ COMMITTED | prevented | possible | possible |
| REPEATABLE READ | prevented | prevented | possible (per standard) |
| SERIALIZABLE | prevented | prevented | prevented |

- **Formula:** `SET TRANSACTION ISOLATION LEVEL READ COMMITTED;` · pessimistic lock: `SELECT qty FROM stock WHERE sku = :sku FOR UPDATE;` · optimistic lock: `UPDATE stock SET qty = qty - :n, version = version + 1 WHERE sku = :sku AND version = :v;` then check the affected row count is 1.
- **Output shape:** the level chosen, the anomaly it does and does **not** prevent, and the retry policy for serialization failures (a SERIALIZABLE workload **will** abort transactions; code that does not retry is broken by design).
- **Traps:** (1) **Read-modify-write in application code is not protected by any isolation level below SERIALIZABLE.** Reading the balance, computing `balance - amount` in the application, and writing it back is a lost update at READ COMMITTED. Do the arithmetic **in the UPDATE statement**, or take `FOR UPDATE`, or use a version check. (2) **Write skew**: snapshot isolation (what PostgreSQL calls REPEATABLE READ) lets two transactions each read a shared constraint, each decide their write is fine, and both commit into a violation ("at least one doctor must be on call" - both resign). Only SERIALIZABLE prevents it. (3) **The level names are not portable**: PostgreSQL's READ UNCOMMITTED behaves as READ COMMITTED; InnoDB's REPEATABLE READ blocks most phantoms via gap locks, unlike the standard. Never assume the name means the same thing on the next engine. (4) Higher isolation buys correctness with deadlocks and aborts; without a retry loop you have traded a rare wrong answer for a frequent error page.
- **Volatility:** LOW

## Indexing: B-tree, and when an index is NOT used
- **When:** a query is slow, or a table is about to grow past the point where a full scan is affordable.
- **Inputs:** the actual query predicates, the table's cardinality, the column selectivity, and the read/write ratio.
- **Formula:** `CREATE INDEX idx_orders_cust_date ON orders (customer_id, order_date DESC);` then **prove it**: `EXPLAIN ANALYZE SELECT ...;` and read whether the plan shows an index scan or a sequential scan.
- **Output shape:** the plan **before** and **after** the index, with the row estimate and the actual time from each. An index added without an execution plan is a guess with a write-cost attached.
- **Traps:** the index is silently ignored when: (1) the column is **wrapped in a function** - `WHERE YEAR(order_date) = :yr` cannot use an index on `order_date`; rewrite as a range `WHERE order_date >= :d1 AND order_date < :d2`, or build an expression index; (2) there is an **implicit type cast** (a `varchar` column compared to a number); (3) a **leading wildcard** `LIKE '%abc'`; (4) the predicate does not include the **leftmost column** of a composite index (an index on `(a, b)` does not serve a query filtering only on `b`); (5) **low selectivity** - if the predicate matches a large fraction of the table the planner correctly prefers a sequential scan, and forcing the index would be slower; (6) **stale statistics** make the planner mis-estimate and choose wrongly (run `ANALYZE`); (7) `OR` across different columns often defeats a composite index. Cost side: every index slows every `INSERT`/`UPDATE`/`DELETE` and consumes storage, so an unused index is pure tax - audit for them.
- **Volatility:** MEDIUM (planner behaviour is engine-specific; verify with an execution plan, never by assertion)

## Star schema vs snowflake
- **When:** modelling for analytics and BI rather than for transactions.
- **Inputs:** a **declared grain** for the fact table ("one row per order line per day"), the measures, and the dimensions to slice by.
- **Formula:** **Star** = one fact table of measures + foreign keys, surrounded by **denormalized** dimension tables (one hop per dimension). **Snowflake** = the same, but dimension hierarchies are normalized into sub-tables (product -> subcategory -> category), costing extra joins to save storage.
- **Output shape:** the grain sentence, the fact table columns (keys + measures), the dimension list, and each measure classified as **additive** / **semi-additive** / **non-additive**.
- **Traps:** (1) **Not declaring the grain first.** Every other error follows from this: mixed-grain facts (an order-level discount stored on a line-level fact) double-count on aggregation. (2) **Semi-additive measures**: an inventory balance or an account balance can be summed across products but **not across time** - summing twelve month-end balances gives a meaningless number that will nonetheless appear in a dashboard. (3) **Non-additive measures**: ratios and percentages must never be summed or averaged-of-averages; store the numerator and denominator and recompute the ratio at every level. (4) Snowflaking a small dimension buys a rounding error of storage and costs joins on every query. (5) Building the star on the natural key instead of a surrogate key breaks the moment a dimension attribute changes (see SCD).
- **Volatility:** LOW

## OLAP vs OLTP
- **When:** deciding where a workload belongs, or diagnosing why a report is strangling the production database.
- **Inputs:** the query pattern (few rows by key vs full-column scans), the concurrency, the write rate, and the freshness requirement.
- **Formula:** **OLTP** = row-oriented storage, normalized, short indexed transactions, high concurrency, writes matter, latency in milliseconds. **OLAP** = column-oriented storage, denormalized (star), long scans and aggregations, low concurrency, reads dominate, latency in seconds is fine.
- **Output shape:** the workload classified, the store chosen, and the **freshness contract** stated in explicit units ("the warehouse is loaded nightly; the dashboard is up to twenty-six hours stale at worst").
- **Traps:** (1) Running an analytical scan against the production OLTP database: the long-running snapshot holds resources, bloats the engine, and slows the checkout page - the outage is usually blamed on the checkout page. (2) Assuming the dashboard is live when the pipeline is nightly, then making an intraday decision on yesterday's number. **State the freshness on the artifact itself.** (3) Copying the normalized OLTP schema straight into the warehouse and wondering why every report needs nine joins. (4) Row-store indexes do not rescue a column-scan workload; the answer is a different store, not another index.
- **Volatility:** LOW

## Slowly changing dimensions (SCD)
- **When:** a dimension attribute changes over time (a customer moves segment, a product changes category) and history matters.
- **Inputs:** which attributes must retain history, the reporting policy ("restate history" vs "as it was at the time"), and a surrogate key strategy.
- **Formula:** **Type 0** keep the original, never update. **Type 1** overwrite in place - history is destroyed. **Type 2** insert a **new row** with a new surrogate key plus `valid_from`, `valid_to`, `is_current`; the fact joins to the surrogate key that was valid at the event date. **Type 3** add a `previous_value` column (one step of history only). **Type 4** move history to a separate table. **Type 6** hybrid of 1+2+3.
  ```sql
  SELECT f.order_date, d.segment, SUM(f.amount) AS amount
  FROM fact_sales f
  JOIN dim_customer d ON d.customer_sk = f.customer_sk   -- SURROGATE key, not the natural key
  GROUP BY f.order_date, d.segment;
  ```
- **Output shape:** the type chosen **per attribute** (not per table), the key strategy, and a proof query: for one changed entity, show that summing its facts across all its dimension versions still equals its total (no double count, no orphan).
- **Traps:** (1) **Joining the fact to the natural key instead of the surrogate key** silently restates history: last year's revenue moves to this year's segment, and both years' reports become unreproducible. (2) **Type 1 is a silent history rewrite**: a report run in March and re-run in June returns different numbers for the same past period, and nobody can explain the diff because the old value no longer exists anywhere. (3) `valid_to` **off-by-one**: use half-open intervals `[valid_from, valid_to)` and set `valid_to` of the closing row exactly equal to `valid_from` of the new row. Setting `valid_to` to "the day before" creates a one-day gap into which facts silently fall, and an inclusive `valid_to` equal to the next `valid_from` creates a one-day overlap that **double-counts** them. (4) Joining a Type 2 dimension without filtering to the correct version (or to `is_current = TRUE` when you meant point-in-time) fans out every fact by the number of versions - a fan-out wearing a different hat. (5) Choosing Type 2 for an attribute nobody wants history on just multiplies the dimension for no benefit.
- **Volatility:** LOW
