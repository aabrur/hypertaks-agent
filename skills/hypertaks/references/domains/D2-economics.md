# D2 - Economics
Every entry: **when · inputs · formula · output shape · traps · volatility**

Microeconomics (price, quantity, cost, market structure) and macroeconomics
(output, prices, money, the external account). The pack carries the arithmetic so
that "Hypertaks computes elasticity" means a number with the substitution shown,
not a formula name dropped into a paragraph.

## Volatility protocol for this pack

**The structure of economics is LOW volatility. Every actual statistic is HIGH.**
The elasticity formula has not changed and will not. The number you would plug into
it changes every quarter, and the number a central bank publishes changes without
warning.

**Never state from memory:**

- any current policy rate, central-bank rate, or benchmark interest rate
- any current inflation rate, CPI level, or CPI basket composition/weights
- any current GDP level, GDP growth rate, or deflator value
- any current exchange rate, spot or forward
- any current unemployment rate, NAIRU estimate, or output-gap estimate
- any national statistics-agency series, at any frequency, for any country

These are **DATA UNAVAILABLE until fetched and cited**. There is no tier, no
deadline, and no "rough order of magnitude" that unlocks them. A remembered policy
rate inside a correct discount formula produces a wrong number wearing the costume
of a verified one.

**What to do instead:** give the formula skeleton with the statistic as a **named
variable**, state the **source type** to fetch it from, and stop.

```
METHOD:      real interest rate (Fisher)
INPUTS:      i = nominal policy rate  [DATA UNAVAILABLE - fetch: central bank,
             latest policy statement]
             pi_e = expected inflation  [DATA UNAVAILABLE - fetch: national
             statistics agency CPI release, or central bank survey]
FORMULA:     r = ((1 + i) / (1 + pi_e)) - 1
SUBSTITUTION: blocked - two inputs unavailable
RESULT:      DATA UNAVAILABLE
```

Source types to name (never a remembered value): the **central bank** (policy rate,
money aggregates, reserves, official exchange rate), the **national statistics
agency** (CPI, GDP, unemployment, trade volumes), the **customs/trade authority**
(import and export values), and the **IMF/World Bank series** for cross-country
comparison. Name the source type; the fetch is a separate, cited step.

Entries below are marked LOW where the relationship is definitional and HIGH where
applying the entry requires a live statistic.

---

## Price elasticity of demand (own, cross, income)

- **When:** the Boss asks how quantity responds to a price move, a rival's price
  move, or a change in buyer income. Precedes any pricing decision.
- **Inputs:** `P1, P2` = price before/after [currency/unit] · `Q1, Q2` = quantity
  before/after [units/period] · `Py` = other good's price [currency/unit] ·
  `I` = income [currency/period].
- **Formula:**
  `Ed = (%change in Qd) / (%change in P)`
  Arc/midpoint (use this when the change is not infinitesimal):
  `Ed = [(Q2 - Q1) / ((Q1 + Q2)/2)] / [(P2 - P1) / ((P1 + P2)/2)]`
  Cross: `Exy = (%change in Qx) / (%change in Py)`
  Income: `Ei = (%change in Q) / (%change in I)`
- **Output shape:** computation block (METHOD / INPUTS with units and source /
  FORMULA / SUBSTITUTION / RESULT with unit / SENSITIVITY / ASSUMPTIONS), plus a
  classification line: `|Ed| > 1` elastic, `|Ed| < 1` inelastic, `= 1` unit
  elastic; `Exy > 0` substitutes, `Exy < 0` complements; `Ei > 0` normal good,
  `Ei < 0` inferior, `Ei > 1` luxury. SENSITIVITY required (elasticity drives
  price, and price is money).
- **Traps:** reporting `Ed` without the minus sign and then treating it as elastic
  because it is "big" - state whether you quote signed `Ed` or `|Ed|` and stay
  consistent. Using the simple `%change` formula and getting a different answer
  depending on which point is the base: that asymmetry is exactly what the midpoint
  formula exists to kill. Elasticity is **not** the slope - it is unit-free, the
  slope is not. Elasticity varies **along** a straight-line demand curve (elastic
  at the top, inelastic at the bottom), so a single estimate is local, not global.
  Assuming a competitor's price held still while you moved yours.
- **Volatility:** LOW (formula) / HIGH (any published elasticity estimate for a
  real market - fetch and cite the study).

## Elasticity and total revenue

- **When:** deciding whether a price cut or a price rise raises revenue. This is the
  first question in almost every pricing brief.
- **Inputs:** `P` = price [currency/unit] · `Q` = quantity [units/period] ·
  `Ed` = own-price elasticity [dimensionless].
- **Formula:**
  `TR = P x Q`
  `MR = P x (1 + 1/Ed)` = `P x (1 - 1/|Ed|)` for downward-sloping demand.
- **Output shape:** computation block + a three-row decision table:
  elastic (`|Ed| > 1`) -> cut price, TR rises; inelastic (`|Ed| < 1`) -> raise
  price, TR rises; unit elastic (`|Ed| = 1`) -> TR is at its maximum, `MR = 0`.
  SENSITIVITY required: re-run TR at `Ed` +/- 20%, because the sign of the revenue
  effect can flip across `|Ed| = 1`.
- **Traps:** confusing **revenue** with **profit** - a price cut in the elastic
  region raises TR but can still destroy profit once variable cost per extra unit is
  paid. `MR = 0` maximizes revenue, `MR = MC` maximizes profit; they are different
  quantities. Applying an elasticity measured at the current price to a large price
  move.
- **Volatility:** LOW.

## Supply/demand equilibrium and comparative statics

- **When:** finding the clearing price and quantity, or predicting the direction of
  a move after a shock (input cost, subsidy, tax, income, tastes).
- **Inputs:** demand `Qd = a - bP` and supply `Qs = c + dP`, with `a, c` in
  [units/period] and `b, d` in [units per currency unit].
- **Formula:**
  Equilibrium: `Qd = Qs`
  `P* = (a - c) / (b + d)`   [currency/unit]
  `Q* = (a x d + b x c) / (b + d)`   [units/period]
- **Output shape:** computation block + a comparative-statics table with one row per
  shock: `shock | curve that shifts | direction | effect on P* | effect on Q*`.
  SENSITIVITY required on `P*` (money): re-solve with `b` and `d` at +/- 20%.
- **Traps:** confusing a **shift** of a curve (a determinant other than price
  changed) with a **movement along** it (price changed). Shifting both curves and
  then claiming a definite sign for both `P*` and `Q*` - when both curves move, one
  of the two outcomes is always ambiguous, and the honest answer names which.
  Forgetting that a binding **price floor** (above `P*`) creates surplus and a
  binding **price ceiling** (below `P*`) creates shortage; a non-binding control
  does nothing at all.
- **Volatility:** LOW (mechanics) / HIGH (any estimated `a, b, c, d` for a real
  market).

## Consumer surplus and producer surplus

- **When:** valuing the welfare a market creates, or sizing what a tax, subsidy,
  tariff, or price control takes away from whom.
- **Inputs:** `P*` = equilibrium price [currency/unit] · `Q*` = equilibrium quantity
  [units/period] · `P_choke` = demand's price intercept (`a/b`) [currency/unit] ·
  `P_min` = supply's price intercept [currency/unit].
- **Formula:** (linear curves)
  `CS = 0.5 x Q* x (P_choke - P*)`   [currency/period]
  `PS = 0.5 x Q* x (P* - P_min)`   [currency/period]
  General: `CS` = area under demand, above `P*`, up to `Q*`. `PS` = `P* x Q*` minus
  the area under the supply curve up to `Q*`.
  `Total surplus = CS + PS`
- **Output shape:** computation block + a before/after surplus table
  (`CS | PS | government revenue | DWL | total`) whenever an intervention is scored.
  SENSITIVITY required: surplus is money, so bracket it at +/- 20% on the slope
  parameters.
- **Traps:** using the triangle formula when the curves are not linear - the triangle
  is a shortcut, the integral is the definition. Reading `P_min` off a supply curve
  whose price intercept is negative: then the producer-surplus region is a trapezoid,
  not a triangle, and the shortcut overstates PS. Reporting surplus without a
  **period** (surplus is a flow, per week/month/year). Treating government revenue
  from a tax as a loss - it is a transfer, and only the triangle is destroyed.
- **Volatility:** LOW.

## Deadweight loss

- **When:** costing a tax, subsidy, quota, tariff, price control, or the output
  restriction of a monopoly.
- **Inputs:** `t` = per-unit tax [currency/unit] · `Q*` = pre-intervention quantity
  [units/period] · `Qt` = post-intervention quantity [units/period] ·
  `Pb` = price buyers pay · `Ps` = price sellers keep [currency/unit].
- **Formula:**
  `DWL = 0.5 x (Pb - Ps) x (Q* - Qt)` = `0.5 x t x (Q* - Qt)` for a per-unit tax.
  Elasticity approximation (small tax):
  `DWL = 0.5 x t^2 x [ (|Ed| x Es) / (|Ed| + Es) ] x (Q* / P*)`
- **Output shape:** computation block + a **tax incidence** split:
  buyer share = `Es / (Es + |Ed|)`, seller share = `|Ed| / (Es + |Ed|)`.
  SENSITIVITY required (DWL is money and it scales with `t^2`, so it is convex - a
  20% error in `t` moves DWL by about 44%).
- **Traps:** forgetting DWL grows with the **square** of the tax, which is why one
  large tax hurts far more than several small ones raising the same revenue.
  Assigning incidence by who **remits** the tax - statutory incidence is not
  economic incidence; the **inelastic side bears more of the burden**, whoever
  writes the cheque. Claiming DWL exists where the taxed side is perfectly inelastic
  (there, quantity does not fall and DWL is zero). Using the small-tax elasticity
  approximation on a large tax.
- **Volatility:** LOW (formula) / HIGH (any real tax rate - fetch from the tax
  authority, never recall).

## MR = MC profit maximization

- **When:** choosing output (and therefore price) for any firm in any market
  structure. This is the single decision rule underneath most pricing work.
- **Inputs:** `TR(Q)` = total revenue [currency/period] · `TC(Q)` = total cost
  [currency/period] · `Q` = output [units/period] · `AVC` = average variable cost
  [currency/unit].
- **Formula:**
  `profit = TR(Q) - TC(Q)`
  First-order condition: `MR = MC`, where `MR = dTR/dQ`, `MC = dTC/dQ`
  Second-order condition: `MC` must be **rising through** `MR` (else the point is a
  profit minimum, not a maximum).
  Shutdown rule (short run): produce only if `P >= AVC`; exit (long run) if
  `P < ATC`.
- **Output shape:** computation block solving `MR(Q) = MC(Q)` for `Q*`, then reading
  `P*` off the demand curve, then `profit = (P* - ATC) x Q*`. SENSITIVITY required
  on profit at +/- 20% on variable cost.
- **Traps:** solving `MR = MC` and reporting `MR` as the price - in any market with
  downward-sloping demand, `P > MR`, and the price comes from the **demand curve** at
  `Q*`. Checking only the first-order condition and landing on a minimum. Including
  **fixed cost** in the short-run shutdown test: fixed cost is sunk and must not
  enter the decision. Using **average** cost where the rule requires **marginal**.
- **Volatility:** LOW.

## Monopoly pricing and the Lerner index

- **When:** a firm faces downward-sloping demand (all pricing power, not just legal
  monopoly), and you need the markup that follows from it.
- **Inputs:** `MC` = marginal cost [currency/unit] · `Ed` = own-price elasticity at
  the chosen point [dimensionless] · `P` = price [currency/unit].
- **Formula:**
  Lerner index: `L = (P - MC) / P = 1 / |Ed|`   [dimensionless, 0 to 1]
  Inverse-elasticity pricing rule: `P = MC x ( |Ed| / (|Ed| - 1) )`, valid only for
  `|Ed| > 1`.
- **Output shape:** computation block + a markup ladder: `|Ed|` -> implied `L` ->
  implied `P` at the given `MC`. SENSITIVITY required (this sets a price): show `P`
  across `|Ed|` at +/- 20%, and state that the markup **explodes** as `|Ed|`
  approaches 1.
- **Traps:** applying the rule at `|Ed| <= 1`: a profit-maximizing firm never
  operates on the inelastic part of its demand curve, because there `MR < 0` and
  cutting output raises revenue **and** lowers cost. Reading `L` as a measure of
  wrongdoing rather than of pricing power. Using an economy-wide elasticity for one
  firm's brand: a **brand's** demand is far more elastic than its **category's**.
- **Volatility:** LOW.

## Price discrimination tiers

- **When:** the same good can be sold at different prices to different buyers, and
  resale between them can be blocked.
- **Inputs:** segment elasticities `E1, E2, ...` [dimensionless] · `MC`
  [currency/unit] · a signal that separates segments (observable trait, self-selected
  version, or purchase quantity).
- **Formula:**
  Third degree (segment pricing): set `MR1 = MR2 = ... = MC`, which gives
  `Pi = MC x ( |Ei| / (|Ei| - 1) )` for each segment `i`. The **less elastic segment
  pays the higher price**.
- **Output shape:** a tier table -
  `first degree` (perfect: each buyer pays their willingness to pay; consumer surplus
  goes to zero; output is efficient) ·
  `second degree` (self-selection: versions, bundles, block tariffs, quantity
  discounts; the seller does not know who is who) ·
  `third degree` (observable segments: student, region, time of day) -
  each row with `separation mechanism | arbitrage risk | price rule`, plus a
  computation block per segment. SENSITIVITY required per segment price.
- **Traps:** discriminating without blocking **arbitrage** - if the cheap segment can
  resell to the dear one, the scheme collapses to a single price. Calling a
  cost-driven price difference discrimination (different cost to serve is not price
  discrimination). Assuming discrimination always lowers welfare: it can raise output
  and serve buyers a single price would have excluded. Ignoring legal limits on which
  traits may be used to segment - jurisdiction-specific, and HIGH volatility: fetch,
  never recall.
- **Volatility:** LOW (theory) / HIGH (legality of any given segmentation trait).

## Break-even and contribution margin (micro)

- **When:** sizing the volume a product must hit to cover its fixed cost, or testing
  whether a price can work at all.
- **Inputs:** `FC` = fixed cost [currency/period] · `P` = price [currency/unit] ·
  `VC` = variable cost per unit [currency/unit] · `target` = required profit
  [currency/period].
- **Formula:**
  `CM per unit = P - VC`   [currency/unit]
  `CM ratio = (P - VC) / P`   [dimensionless]
  `BEP (units) = FC / (P - VC)`   [units/period]
  `BEP (revenue) = FC / CM ratio`   [currency/period]
  `Q for target profit = (FC + target) / (P - VC)`   [units/period]
  `Margin of safety = (actual sales - BEP sales) / actual sales`   [%]
- **Output shape:** computation block + a break-even table across three price points,
  plus the margin of safety at the expected volume. SENSITIVITY mandatory: BEP is
  hyperbolic in `CM`, so a 10% fall in `CM per unit` raises BEP by more than 10%.
  Show BEP at `VC` +/- 20%.
- **Traps:** a **negative or near-zero contribution margin** makes BEP meaningless
  (infinite or negative) - the answer there is "this price never breaks even", not a
  number. Mixing period lengths: `FC` per month against `CM` per unit and calling the
  result annual. Treating a step-fixed cost (a second shift, a second machine) as
  linear fixed cost - it jumps, and the break-even chart has a discontinuity.
  Applying a single-product BEP to a multi-product mix without a weighted `CM`.
- **Volatility:** LOW.

## Cost curves and economies of scale

- **When:** explaining why unit cost falls then rises, sizing a plant, or justifying
  a volume strategy.
- **Inputs:** `FC` [currency/period] · `VC(Q)` [currency/period] · `Q`
  [units/period].
- **Formula:**
  `TC = FC + VC(Q)`
  `AFC = FC / Q` · `AVC = VC / Q` · `ATC = TC / Q = AFC + AVC`   [currency/unit]
  `MC = dTC/dQ` (discrete: `MC = (TC2 - TC1) / (Q2 - Q1)`)   [currency/unit]
  Relationship: `MC` cuts `AVC` and `ATC` at **their minimum points**, from below.
- **Output shape:** computation block + a cost schedule table
  (`Q | FC | VC | TC | AFC | AVC | ATC | MC`) and a one-line verdict on the scale
  region: **economies of scale** (long-run average cost falling), **constant
  returns** (flat), **diseconomies** (rising, usually coordination cost).
  SENSITIVITY required on `ATC` at the planned `Q`.
- **Traps:** confusing **economies of scale** (a long-run move along a falling LRAC,
  all inputs variable) with **spreading fixed cost** (a short-run fall in AFC) -
  they look the same on a chart and are different phenomena. Confusing economies of
  **scale** with economies of **scope** (cost saved by producing two goods together).
  Averaging when the decision is marginal. Forgetting that in the **long run there is
  no fixed cost**, so shutdown and exit rules differ.
- **Volatility:** LOW.

## GDP accounting (expenditure approach)

- **When:** sizing an economy, a market, or the demand-side impact of a policy or a
  shock.
- **Inputs:** `C` = household consumption · `I` = gross investment (incl. change in
  inventories) · `G` = government consumption and investment · `X` = exports ·
  `M` = imports. All [currency/period, at the same prices, same period].
- **Formula:**
  `GDP = C + I + G + (X - M)`
  Identity check (income side): `GDP = wages + rent + interest + profit + (indirect
  taxes - subsidies) + depreciation`.
- **Output shape:** computation block + a contribution table
  (`component | level | share of GDP % | contribution to growth in percentage
  points`). SENSITIVITY required. **Every input here is HIGH volatility**: mark each
  `DATA UNAVAILABLE` until fetched from the national statistics agency, and cite the
  release and the vintage.
- **Traps:** counting **intermediate goods** twice - GDP counts value added and final
  goods only. Counting **transfer payments** (pensions, subsidies to households) in
  `G`: they are not purchases of output. Forgetting `M` is **subtracted** because it
  was already inside `C`, `I`, and `G`. Mixing **GDP** (produced inside the border)
  with **GNI/GNP** (earned by residents). Comparing a **level** across countries
  without a common currency and a purchasing-power adjustment. Quoting a figure from
  memory - the series is revised, and the revision is often larger than the story.
- **Volatility:** HIGH (every number; the identity itself is LOW).

## Nominal vs real GDP and the deflator

- **When:** separating "we produced more" from "prices went up". Mandatory before any
  growth claim.
- **Inputs:** `NGDP` = nominal GDP at current prices [currency/period] ·
  `RGDP` = real GDP at base-year prices [currency/period] · base year label.
- **Formula:**
  `GDP deflator = (NGDP / RGDP) x 100`   [index points, base = 100]
  `RGDP = NGDP / (deflator / 100)`
  `real growth % = ((RGDP_t / RGDP_t-1) - 1) x 100`
  Approximation: `real growth = nominal growth - inflation` (valid only for small
  rates; use the exact ratio otherwise).
- **Output shape:** computation block + a two-row table (`nominal | real`) showing
  growth in each, and the base year stated explicitly. SENSITIVITY required.
  All input levels are `DATA UNAVAILABLE` until fetched from the national statistics
  agency.
- **Traps:** comparing real series across a **base-year rebasing** without splicing -
  the levels are not comparable. Using the approximation at high inflation, where it
  is badly wrong. Confusing the **GDP deflator** (covers everything produced
  domestically, weights float) with the **CPI** (covers a fixed consumer basket,
  includes imports) - they diverge, and which one is right depends on the question.
- **Volatility:** HIGH (levels and rates) / LOW (the deflator definition).

## The spending multiplier, MPC and MPS

- **When:** estimating how far an injection (government spending, investment, export
  demand) travels through income before it dies out.
- **Inputs:** `c = MPC` = marginal propensity to consume [fraction of each extra
  currency unit of income] · `MPS` = marginal propensity to save · `t` = marginal
  tax rate · `m` = marginal propensity to import · `dG` = the injection
  [currency/period].
- **Formula:**
  `MPC + MPS = 1`
  Simple closed economy, no tax: `k = 1 / (1 - MPC) = 1 / MPS`
  Open economy with tax: `k = 1 / (1 - c(1 - t) + m)`
  Tax multiplier: `k_tax = -MPC / (1 - MPC)`
  Balanced-budget multiplier: `= 1` (equal rise in `G` and `T` still raises `Y` by
  that amount).
  `change in Y = k x dG`   [currency/period]
- **Output shape:** computation block + a leakage table (`saving | tax | import`
  shares of each round) and the resulting `k`. SENSITIVITY mandatory: `k` is
  hyperbolic in the leakage, so an MPC of 0.8 versus 0.7 is a multiplier of 5.0
  versus 3.33 - a 12% input change moving the answer by 50%.
- **Traps:** using the closed-economy `k` for an open economy: imports leak, and the
  real multiplier is much smaller. Treating the multiplier as a policy promise -
  it assumes idle capacity, no crowding out, and no offsetting monetary reaction.
  Confusing the **tax** multiplier with the **spending** multiplier (the tax
  multiplier is smaller in absolute value and negative, because the first round is
  saved in part). Quoting an MPC from memory: it is an estimate, HIGH volatility,
  fetch it.
- **Volatility:** LOW (algebra) / HIGH (any estimated MPC for a real economy).

## Inflation and the CPI

- **When:** deflating any currency figure, indexing a contract, or reading a price
  release.
- **Inputs:** `CPI_t`, `CPI_t-1` = index levels [index points, base = 100] · basket
  cost [currency] · `i` = nominal rate [%/yr] · `pi` = inflation [%/yr].
- **Formula:**
  `CPI_t = (cost of the fixed basket in period t / cost of the same basket in the
  base period) x 100`   [index points]
  **Inflation rate between two CPI values:**
  `inflation % = ((CPI_t - CPI_t-1) / CPI_t-1) x 100`
  Real value of a nominal amount: `real = nominal / (CPI_t / CPI_base)`
  Fisher (exact): `(1 + i) = (1 + r)(1 + pi)` -> `r = ((1 + i)/(1 + pi)) - 1`
  Fisher (approximation, small rates only): `r = i - pi`
- **Output shape:** computation block + a table `period | CPI | inflation % |
  real value of the reference amount`. SENSITIVITY required whenever the result
  indexes money. Every CPI level and every inflation figure is `DATA UNAVAILABLE`
  until fetched from the national statistics agency and cited with its release date
  and base year.
- **Traps:** subtracting **index points** and calling the difference a percentage -
  a move from 110 to 115 is 5 **index points** and about 4.55%, not 5%. Chaining
  monthly rates by adding them instead of compounding: `(1+m1)(1+m2)...-1`.
  Confusing **disinflation** (inflation falling but still positive) with
  **deflation** (prices falling). Comparing CPI series across a **rebasing** or a
  **basket revision** without splicing. Using `r = i - pi` at high inflation, where
  the exact Fisher form differs materially. Assuming the CPI basket matches the
  Boss's actual cost base - it rarely does; a firm's input inflation is a different
  index.
- **Volatility:** HIGH (levels, rates, basket weights) / LOW (the formulas).

## The Phillips curve

- **When:** reasoning about the short-run trade-off between inflation and
  unemployment, or about why a stimulus may buy less output than promised.
- **Inputs:** `pi` = actual inflation [%/yr] · `pi_e` = expected inflation [%/yr] ·
  `u` = unemployment rate [%] · `u_n` = natural rate / NAIRU [%] · `s` = supply
  shock [%/yr].
- **Formula:**
  Expectations-augmented: `pi = pi_e - b x (u - u_n) + s`, with `b > 0`.
  Long run: `u = u_n` regardless of `pi` - the long-run curve is **vertical**, and
  there is no permanent trade-off.
- **Output shape:** computation block if the parameters are supplied, otherwise a
  qualitative shape: `short-run trade-off | expectation channel | supply-shock term |
  long-run verdict`. Any use for a real economy needs `u`, `u_n`, and `pi_e` fetched
  and cited; the NAIRU in particular is an **estimate with a wide band**, not an
  observation. SENSITIVITY required if any wage or price is set off the result.
- **Traps:** treating the short-run curve as a **menu** a policymaker can pick from
  permanently - once expectations adjust, the curve shifts and only the inflation
  remains. Ignoring the supply-shock term `s`, which is why stagflation (rising
  inflation **and** rising unemployment) is possible at all. Quoting a NAIRU from
  memory. Reading a scatter of `pi` against `u` over decades and concluding the
  relationship is "dead" - a shifting curve traces a cloud.
- **Volatility:** LOW (the relation) / HIGH (every parameter, especially NAIRU).

## IS-LM basics

- **When:** working out how fiscal and monetary policy interact to set output and the
  interest rate in the short run, with the price level held fixed.
- **Inputs:** `c` = MPC · `t` = tax rate · `I0` = autonomous investment · `b` =
  investment sensitivity to the rate · `G`, `T` [currency/period] · `M/P` = real
  money supply [currency/period] · `k` = income sensitivity of money demand · `h` =
  rate sensitivity of money demand.
- **Formula:**
  IS (goods market, `Y = C + I + G + NX`), linear form:
  `Y = [1 / (1 - c(1 - t))] x (A0 - b x r)`, where `A0` collects autonomous spending.
  Downward-sloping in `(Y, r)` space.
  LM (money market, `M/P = L(r, Y)`), linear form:
  `M/P = k x Y - h x r`  ->  `r = (k x Y - M/P) / h`. Upward-sloping.
  Equilibrium: solve the two together for `Y*` and `r*`.
- **Output shape:** computation block solving for `(Y*, r*)` + a policy table:
  `fiscal expansion -> IS right -> Y up, r up (crowding out)`;
  `monetary expansion -> LM right -> Y up, r down`. SENSITIVITY required on `Y*`.
  `M/P` and the policy rate are HIGH volatility: fetch from the central bank.
- **Traps:** using IS-LM where the **price level is not fixed** - it is a short-run
  model, and the long-run answer needs the aggregate-supply side. Forgetting
  **crowding out**: fiscal expansion raises `r`, which subtracts investment from the
  gain. Assuming the central bank holds the money supply fixed when in practice it
  usually targets a **rate**, which flattens the LM curve toward horizontal. Reading
  policy conclusions off the model with a remembered policy rate.
- **Volatility:** LOW (structure) / HIGH (all monetary inputs).

## Solow growth model

- **When:** the question is long-run growth: why does an economy converge, and why
  does saving more raise the **level** of income but not its permanent **growth
  rate**?
- **Inputs:** `s` = saving rate [fraction] · `k` = capital per effective worker ·
  `delta` = depreciation rate [%/yr] · `n` = population growth [%/yr] · `g` =
  technology growth [%/yr] · `alpha` = capital share of income [fraction].
- **Formula:**
  Capital accumulation: `change in k = s x f(k) - (delta + n + g) x k`
  Steady state: `s x f(k*) = (delta + n + g) x k*`
  Cobb-Douglas (`y = k^alpha`):
  `k* = [ s / (n + g + delta) ]^(1 / (1 - alpha))`
  `y* = [ s / (n + g + delta) ]^(alpha / (1 - alpha))`
  Golden rule: `f'(k_gold) = delta + n + g`
  Growth accounting: `growth in Y = growth in A + alpha x growth in K + (1 - alpha) x
  growth in L`
- **Output shape:** computation block for `k*` and `y*` + a convergence statement
  (below `k*` the economy grows toward it; above `k*` it shrinks toward it), plus the
  central intuition: **in steady state, output per worker grows at `g` only** - saving
  more shifts the level, technology moves the rate. SENSITIVITY required on `y*`
  (income is money), with `s` at +/- 20%.
- **Traps:** claiming a higher saving rate raises the long-run **growth rate** - it
  raises the steady-state **level** and gives a temporary burst on the way there.
  Using `f'(k) = delta` for the golden rule and dropping `n + g`. Mixing capital per
  **worker** with capital per **effective worker** (the units differ by the
  technology term). Reading convergence as a prediction that all countries converge -
  the model predicts convergence **conditional** on the same `s`, `n`, `g`, `delta`.
- **Volatility:** LOW (model) / HIGH (any real `s`, `n`, `g`, `alpha` estimate).

## Exchange rates: nominal, real, and PPP

- **When:** pricing across currencies, judging competitiveness, or checking whether a
  currency looks misaligned.
- **Inputs:** convention first - here `e` = **units of domestic currency per 1 unit of
  foreign currency** (direct quote). `P` = domestic price level [index points] ·
  `P_f` = foreign price level [index points] · `i_d`, `i_f` = nominal rates [%/yr] ·
  `S` = spot, `F` = forward [domestic per foreign].
- **Formula:**
  Real exchange rate: `RER = e x (P_f / P)`   [dimensionless]
  Absolute PPP: `e = P / P_f`
  Relative PPP: `% change in e = inflation_domestic - inflation_foreign`
  Covered interest parity: `F / S = (1 + i_d) / (1 + i_f)`
  Uncovered interest parity: `expected % change in e = i_d - i_f`
- **Output shape:** computation block + a direction line stating plainly which way is
  which: under this convention, **`e` rising = the domestic currency depreciating**.
  SENSITIVITY mandatory on any converted amount. Every `e`, `S`, `F`, `i_d`, `i_f`
  is `DATA UNAVAILABLE` until fetched from the central bank or a market data source
  and cited with its timestamp.
- **Traps:** **inverting the quote convention** and getting the direction of
  depreciation exactly backwards - this is the single most common error here, so
  state the convention in the INPUTS line every time. Confusing **depreciation**
  (market move) with **devaluation** (official act under a peg). Expecting PPP to
  hold in the short run: it is a long-run anchor, and non-traded goods and trade
  costs break it. Comparing a nominal rate across time and calling it a
  competitiveness gain when domestic inflation ate the move - that is what the RER
  exists to correct.
- **Volatility:** HIGH (every rate) / LOW (the parities).

## Balance of payments structure

- **When:** reading a country's external position, or tracing where the money to fund
  a trade deficit comes from.
- **Inputs:** current account components [currency/period] · capital account ·
  financial account · reserve assets · errors and omissions.
- **Formula:** (conventions of the IMF balance of payments manual, sixth edition)
  `Current account = goods balance + services balance + primary income (wages,
  investment income) + secondary income (transfers, remittances)`
  Identity: `Current account + Capital account - Financial account + Errors and
  omissions = 0`, where the financial account is measured as **net lending (+) /
  net borrowing (-)**.
  Equivalently: a current-account deficit must be financed by net borrowing from the
  rest of the world or by drawing down reserves.
- **Output shape:** a BOP table (`account | sub-account | balance | sign`) with the
  identity shown to close to zero, plus a computation block for any derived ratio
  (current account as % of GDP, reserve cover in months of imports =
  `reserves / average monthly imports`). SENSITIVITY required on any currency ratio.
  Every line item is `DATA UNAVAILABLE` until fetched from the central bank or the
  national statistics agency.
- **Traps:** the **sign convention is the trap** - the financial-account sign flipped
  between manual editions, and a reader applying the old convention gets the identity
  backwards. Always state which convention the source uses before adding anything up.
  Calling a current-account deficit a failure: it is a **financing** statement, not a
  verdict; a fast-growing economy importing capital goods runs one by construction.
  Confusing the **capital account** (small: capital transfers, non-produced
  non-financial assets) with the **financial account** (large: direct, portfolio, and
  other investment). Treating **errors and omissions** as noise when it is large -
  a big residual is itself the finding.
- **Volatility:** HIGH (every figure) / MEDIUM (the manual's conventions - state the
  edition you assumed).
