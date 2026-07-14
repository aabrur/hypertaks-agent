# D2 - Economics
Every entry: **when · inputs · formula · output shape · traps · volatility**

Microeconomics (price, quantity, cost, market structure) and macroeconomics (output, prices, money, the external account). The pack carries the arithmetic, so "Hypertaks computes elasticity" means a number with the substitution shown, not a formula name dropped into a paragraph.

## Volatility protocol for this pack

**The structure of economics is LOW volatility. Every actual statistic is HIGH.** The elasticity formula has not changed and will not. The number you would plug into it changes every quarter, and the number a central bank publishes changes without warning.

**Never state from memory:**

- any current policy rate, central-bank rate, or benchmark interest rate
- any current inflation rate, CPI level, or CPI basket composition and weights
- any current GDP level, GDP growth rate, or deflator value
- any current exchange rate, spot or forward
- any current unemployment rate, NAIRU estimate, or output-gap estimate
- any national statistics-agency series, at any frequency, for any country

These are **DATA UNAVAILABLE until fetched and cited**. No tier, no deadline, and no "rough order of magnitude" unlocks them. A remembered policy rate inside a correct discount formula produces a wrong number wearing the costume of a verified one.

**What to do instead:** give the formula skeleton with the statistic as a **named variable**, state the **source type** to fetch it from, and stop.

```
METHOD:       real interest rate (Fisher)
INPUTS:       i    = nominal policy rate      [DATA UNAVAILABLE - fetch: central bank policy statement]
              pi_e = expected inflation       [DATA UNAVAILABLE - fetch: national statistics agency CPI release]
FORMULA:      r = ((1 + i) / (1 + pi_e)) - 1
SUBSTITUTION: blocked - both inputs unavailable
RESULT:       DATA UNAVAILABLE
```

Source types to name (never a remembered value): the **central bank** (policy rate, money aggregates, reserves, official exchange rate), the **national statistics agency** (CPI, GDP, unemployment, trade volumes), the **customs or trade authority** (import and export values), and **IMF / World Bank series** for cross-country comparison. Name the source type; the fetch is a separate, cited step.

Entries are marked LOW where the relationship is definitional, HIGH where applying it needs a live statistic. Where both apply, both are shown.

---

## Price elasticity of demand (own, cross, income)

- **When:** the Boss asks how quantity responds to your price move, a rival's price move, or a change in buyer income. Precedes any pricing decision.
- **Inputs:** `P1, P2` = price before/after [currency/unit] · `Q1, Q2` = quantity before/after [units/period] · `Py` = other good's price [currency/unit] · `I` = income [currency/period].
- **Formula:** `Ed = (%change in Qd) / (%change in P)`
  Arc/midpoint (use this whenever the change is not infinitesimal): `Ed = [(Q2 - Q1) / ((Q1 + Q2)/2)] / [(P2 - P1) / ((P1 + P2)/2)]`
  Cross: `Exy = (%change in Qx) / (%change in Py)` · Income: `Ei = (%change in Q) / (%change in I)`
- **Output shape:** computation block (METHOD / INPUTS with units and source / FORMULA / SUBSTITUTION / RESULT with unit / SENSITIVITY / ASSUMPTIONS), plus a classification line: `|Ed| > 1` elastic, `|Ed| < 1` inelastic, `|Ed| = 1` unit elastic; `Exy > 0` substitutes, `Exy < 0` complements; `Ei > 0` normal, `Ei < 0` inferior, `Ei > 1` luxury. SENSITIVITY required - elasticity sets price, and price is money.
- **Traps:** quoting `Ed` without its minus sign and then calling it elastic because it is "big" - declare whether you report signed `Ed` or `|Ed|`, then stay consistent. The simple `%change` form gives a different answer depending on which point is the base; killing that asymmetry is the entire reason the midpoint form exists. Elasticity is **not** the slope: it is unit-free, the slope is not. Elasticity varies **along** a straight-line demand curve (elastic at the top, inelastic at the bottom), so any estimate is local, never global. Assuming rivals held their price still while you moved yours.
- **Volatility:** LOW (formula) / HIGH (any published elasticity estimate for a real market - fetch and cite the study).

## Elasticity and total revenue

- **When:** deciding whether a price cut or a price rise raises revenue. The first question in almost every pricing brief.
- **Inputs:** `P` = price [currency/unit] · `Q` = quantity [units/period] · `Ed` = own-price elasticity [dimensionless].
- **Formula:** `TR = P x Q`
  `MR = P x (1 + 1/Ed)` = `P x (1 - 1/|Ed|)` for downward-sloping demand.
- **Output shape:** computation block + a three-row decision table: elastic (`|Ed| > 1`) -> cut price, TR rises; inelastic (`|Ed| < 1`) -> raise price, TR rises; unit elastic (`|Ed| = 1`) -> TR is at its maximum and `MR = 0`. SENSITIVITY required: re-run TR at `Ed` +/- 20%, because the **sign** of the revenue effect flips across `|Ed| = 1`.
- **Traps:** confusing **revenue** with **profit** - a cut in the elastic region raises TR and can still destroy profit once the variable cost of each extra unit is paid. `MR = 0` maximizes revenue; `MR = MC` maximizes profit; they are different quantities at different outputs. Applying an elasticity measured at today's price to a large price move.
- **Volatility:** LOW.

## Supply/demand equilibrium and comparative statics

- **When:** finding the clearing price and quantity, or predicting the direction of a move after a shock (input cost, subsidy, tax, income, tastes).
- **Inputs:** demand `Qd = a - bP`, supply `Qs = c + dP`, with `a, c` [units/period] and `b, d` [units per currency unit].
- **Formula:** set `Qd = Qs`, giving
  `P* = (a - c) / (b + d)`  [currency/unit]
  `Q* = (a x d + b x c) / (b + d)`  [units/period]
- **Output shape:** computation block + a comparative-statics table, one row per shock: `shock | curve that shifts | direction | effect on P* | effect on Q*`. SENSITIVITY required on `P*` (money): re-solve with `b` and `d` at +/- 20%.
- **Traps:** confusing a **shift** of a curve (some determinant other than price changed) with a **movement along** it (price changed). Shifting both curves and then asserting a definite sign for both `P*` and `Q*` - when both move, one of the two outcomes is always ambiguous, and the honest answer names which one. Forgetting that a **price floor** binds only above `P*` (creating surplus) and a **price ceiling** only below `P*` (creating shortage); a non-binding control does nothing at all.
- **Volatility:** LOW (mechanics) / HIGH (any estimated `a, b, c, d` for a real market).

## Consumer surplus and producer surplus

- **When:** valuing the welfare a market creates, or sizing what a tax, subsidy, tariff, or price control takes away, and from whom.
- **Inputs:** `P*` [currency/unit] · `Q*` [units/period] · `P_choke` = demand's price intercept, `a/b` [currency/unit] · `P_min` = supply's price intercept [currency/unit].
- **Formula:** linear curves:
  `CS = 0.5 x Q* x (P_choke - P*)`  [currency/period]
  `PS = 0.5 x Q* x (P* - P_min)`  [currency/period]
  General: `CS` = area under demand and above `P*`, out to `Q*`. `PS` = `P* x Q*` minus the area under supply out to `Q*`. `Total surplus = CS + PS`.
- **Output shape:** computation block + a before/after table whenever an intervention is scored: `CS | PS | government revenue | DWL | total`. SENSITIVITY required - surplus is money; bracket it at +/- 20% on the slope parameters.
- **Traps:** using the triangle formula on curves that are not linear - the triangle is a shortcut, the integral is the definition. Reading `P_min` off a supply curve whose price intercept is **negative**: the producer-surplus region is then a trapezoid, and the shortcut overstates PS. Reporting surplus with no **period** attached (surplus is a flow: per week, month, year). Counting government tax revenue as a loss - it is a **transfer**; only the triangle is destroyed.
- **Volatility:** LOW.

## Deadweight loss

- **When:** costing a tax, subsidy, quota, tariff, price control, or the output restriction imposed by a monopoly.
- **Inputs:** `t` = per-unit tax [currency/unit] · `Q*` = pre-intervention quantity · `Qt` = post-intervention quantity [units/period] · `Pb` = price buyers pay · `Ps` = price sellers keep [currency/unit] · `Ed`, `Es` = elasticities [dimensionless].
- **Formula:** `DWL = 0.5 x (Pb - Ps) x (Q* - Qt)` = `0.5 x t x (Q* - Qt)` for a per-unit tax.
  Small-tax elasticity approximation: `DWL = 0.5 x t^2 x [ (|Ed| x Es) / (|Ed| + Es) ] x (Q* / P*)`
- **Output shape:** computation block + the **tax incidence** split: buyer share = `Es / (Es + |Ed|)`, seller share = `|Ed| / (Es + |Ed|)`. SENSITIVITY required: DWL is money and scales with `t^2`, so a 20% error in `t` moves DWL by roughly 44%.
- **Traps:** forgetting DWL grows with the **square** of the tax - which is why one large tax destroys far more than several small ones raising the same revenue. Assigning incidence by who **remits** the tax: statutory incidence is not economic incidence, and the **more inelastic side bears more of the burden** whoever writes the cheque. Claiming DWL where the taxed side is perfectly inelastic (quantity does not fall, so DWL is zero). Stretching the small-tax approximation over a large tax.
- **Volatility:** LOW (formula) / HIGH (any real tax rate - fetch from the tax authority, never recall).

## MR = MC profit maximization

- **When:** choosing output, and therefore price, for any firm in any market structure. The decision rule underneath most pricing work.
- **Inputs:** `TR(Q)`, `TC(Q)` [currency/period] · `Q` [units/period] · `AVC`, `ATC` [currency/unit].
- **Formula:** `profit = TR(Q) - TC(Q)`
  First-order condition: `MR = MC`, where `MR = dTR/dQ` and `MC = dTC/dQ`.
  Second-order condition: `MC` must be **rising through** `MR` (otherwise the point is a profit **minimum**).
  Shutdown (short run): produce only if `P >= AVC`. Exit (long run) if `P < ATC`.
- **Output shape:** computation block solving `MR(Q) = MC(Q)` for `Q*`, then reading `P*` off the **demand curve** at `Q*`, then `profit = (P* - ATC) x Q*`. SENSITIVITY required on profit at +/- 20% on variable cost.
- **Traps:** solving `MR = MC` and then reporting `MR` as the price - wherever demand slopes down, `P > MR`, and the price comes from the demand curve at `Q*`. Checking only the first-order condition and landing on a minimum. Letting **fixed cost** into the short-run shutdown test: it is sunk and must not enter the decision. Using **average** cost where the rule requires **marginal**.
- **Volatility:** LOW.

## Monopoly pricing and the Lerner index

- **When:** a firm faces downward-sloping demand (any pricing power, not only legal monopoly) and you need the markup that follows from it.
- **Inputs:** `MC` [currency/unit] · `Ed` = elasticity at the chosen point [dimensionless] · `P` [currency/unit].
- **Formula:** Lerner index: `L = (P - MC) / P = 1 / |Ed|`  [dimensionless, 0 to 1]
  Inverse-elasticity pricing rule: `P = MC x ( |Ed| / (|Ed| - 1) )`, valid only for `|Ed| > 1`.
- **Output shape:** computation block + a markup ladder: `|Ed|` -> implied `L` -> implied `P` at the given `MC`. SENSITIVITY mandatory (this sets a price): show `P` across `|Ed|` at +/- 20%, and state that the markup **explodes** as `|Ed|` approaches 1.
- **Traps:** applying the rule at `|Ed| <= 1`: a profit-maximizing firm never operates on the inelastic part of its demand curve, because there `MR < 0` and cutting output raises revenue **and** cuts cost. Reading `L` as a measure of wrongdoing rather than of pricing power. Feeding a **category** elasticity into a **brand's** pricing decision - a brand's demand is far more elastic than its category's.
- **Volatility:** LOW.

## Price discrimination tiers

- **When:** the same good can be sold at different prices to different buyers, and resale between them can be blocked.
- **Inputs:** segment elasticities `E1, E2, ...` [dimensionless] · `MC` [currency/unit] · a separating signal (observable trait, self-selected version, or purchase quantity).
- **Formula:** third degree (segment pricing): set `MR1 = MR2 = ... = MC`, which yields `Pi = MC x ( |Ei| / (|Ei| - 1) )` per segment `i`. The **less elastic segment pays the higher price**.
- **Output shape:** a tier table - **first degree** (perfect: each buyer pays their willingness to pay, consumer surplus goes to zero, output is efficient) · **second degree** (self-selection: versions, bundles, block tariffs, quantity discounts; the seller cannot see who is who) · **third degree** (observable segments: student, region, time of day) - each row carrying `separation mechanism | arbitrage risk | price rule`, plus a computation block per segment. SENSITIVITY required on every segment price.
- **Traps:** discriminating without blocking **arbitrage** - if the cheap segment can resell into the dear one, the scheme collapses back to a single price. Calling a cost-to-serve difference "discrimination" (it is not). Assuming discrimination always lowers welfare: it can raise output and serve buyers a single price would have excluded. Ignoring legal limits on which traits may be used to segment - jurisdiction-specific, HIGH volatility, fetch it.
- **Volatility:** LOW (theory) / HIGH (legality of any given segmentation trait).

## Break-even and contribution margin (micro)

- **When:** sizing the volume a product must hit to cover fixed cost, or testing whether a price can work at all.
- **Inputs:** `FC` [currency/period] · `P` [currency/unit] · `VC` = variable cost per unit [currency/unit] · `target` = required profit [currency/period].
- **Formula:** `CM per unit = P - VC`  [currency/unit]
  `CM ratio = (P - VC) / P`  [dimensionless]
  `BEP (units) = FC / (P - VC)`  [units/period]
  `BEP (revenue) = FC / CM ratio`  [currency/period]
  `Q for target profit = (FC + target) / (P - VC)`  [units/period]
  `Margin of safety = (actual sales - BEP sales) / actual sales`  [%]
- **Output shape:** computation block + a break-even table across three price points, plus margin of safety at expected volume. SENSITIVITY mandatory: BEP is hyperbolic in `CM`, so a 10% fall in `CM per unit` raises BEP by **more** than 10%. Show BEP at `VC` +/- 20%.
- **Traps:** a **negative or near-zero contribution margin** makes BEP meaningless (infinite or negative) - the honest answer is "this price never breaks even", not a number. Mixing period lengths (monthly `FC` against a per-unit `CM`, reported as annual). Treating a **step-fixed** cost (a second shift, a second machine) as linear: it jumps, and the break-even chart has a discontinuity. Applying a single-product BEP to a product mix without a weighted `CM`.
- **Volatility:** LOW.

## Cost curves and economies of scale

- **When:** explaining why unit cost falls and then rises, sizing a plant, or justifying a volume strategy.
- **Inputs:** `FC` [currency/period] · `VC(Q)` [currency/period] · `Q` [units/period].
- **Formula:** `TC = FC + VC(Q)`
  `AFC = FC / Q` · `AVC = VC / Q` · `ATC = TC / Q = AFC + AVC`  [currency/unit]
  `MC = dTC/dQ`, discrete: `MC = (TC2 - TC1) / (Q2 - Q1)`  [currency/unit]
  Relationship: `MC` cuts **both** `AVC` and `ATC` at their **minimum points**, from below.
- **Output shape:** computation block + a cost schedule table (`Q | FC | VC | TC | AFC | AVC | ATC | MC`) and a one-line verdict on the scale region: **economies of scale** (long-run average cost falling), **constant returns** (flat), **diseconomies** (rising, usually coordination cost). SENSITIVITY required on `ATC` at the planned `Q`.
- **Traps:** confusing **economies of scale** (a long-run move down a falling LRAC with all inputs variable) with **spreading fixed cost** (a short-run fall in AFC) - identical on a chart, different phenomena, different strategic implications. Confusing economies of **scale** with economies of **scope** (cost saved by producing two goods together). Averaging when the decision is marginal. Forgetting there is **no fixed cost in the long run**, which is why shutdown and exit rules differ.
- **Volatility:** LOW.

## GDP accounting (expenditure approach)

- **When:** sizing an economy or a market, or tracing the demand-side impact of a policy or a shock.
- **Inputs:** `C` = household consumption · `I` = gross investment including the change in inventories · `G` = government consumption and investment · `X` = exports · `M` = imports. All [currency/period, same prices, same period].
- **Formula:** `GDP = C + I + G + (X - M)`
  Income-side identity check: `GDP = wages + rent + interest + profit + (indirect taxes - subsidies) + depreciation`
- **Output shape:** computation block + a contribution table (`component | level | share of GDP % | contribution to growth in percentage points`). SENSITIVITY required. **Every input here is HIGH volatility:** mark each `DATA UNAVAILABLE` until fetched from the national statistics agency, and cite the release and its vintage.
- **Traps:** double-counting **intermediate goods** - GDP counts value added and final goods only. Putting **transfer payments** (pensions, household subsidies) into `G`: they buy no output. Forgetting `M` is subtracted precisely because it is already sitting inside `C`, `I`, and `G`. Mixing **GDP** (produced inside the border) with **GNI** (earned by residents). Comparing **levels** across countries with no common currency and no purchasing-power adjustment. Quoting a figure from memory: the series gets revised, and the revision is often bigger than the story.
- **Volatility:** HIGH (every number) / LOW (the identity itself).

## Nominal vs real GDP and the deflator

- **When:** separating "we produced more" from "prices went up". Mandatory before any growth claim.
- **Inputs:** `NGDP` = nominal GDP at current prices · `RGDP` = real GDP at base-year prices [currency/period] · the base year, stated.
- **Formula:** `GDP deflator = (NGDP / RGDP) x 100`  [index points, base = 100]
  `RGDP = NGDP / (deflator / 100)`
  `real growth % = ((RGDP_t / RGDP_prev) - 1) x 100`
  Approximation: `real growth = nominal growth - inflation` - valid for small rates only; otherwise use the exact ratio.
- **Output shape:** computation block + a two-row table (`nominal | real`) with growth on each row and the base year stated explicitly. SENSITIVITY required. All input levels are `DATA UNAVAILABLE` until fetched from the national statistics agency.
- **Traps:** comparing a real series across a **rebasing** without splicing - the levels are not comparable. Using the subtraction approximation at high inflation, where it is badly wrong. Confusing the **GDP deflator** (everything produced domestically, floating weights) with the **CPI** (a fixed consumer basket, includes imports) - they diverge, and which one is correct depends entirely on the question asked.
- **Volatility:** HIGH (all levels and rates) / LOW (the deflator definition).

## The spending multiplier, MPC and MPS

- **When:** estimating how far an injection (government spending, investment, export demand) travels through income before it dies out.
- **Inputs:** `c = MPC` [fraction of each extra currency unit of income] · `MPS` · `t` = marginal tax rate · `m` = marginal propensity to import [fractions] · `dG` = the injection [currency/period].
- **Formula:** `MPC + MPS = 1`
  Closed economy, no tax: `k = 1 / (1 - MPC) = 1 / MPS`
  Open economy with tax: `k = 1 / (1 - c(1 - t) + m)`
  Tax multiplier: `k_tax = -MPC / (1 - MPC)`
  Balanced-budget multiplier: `= 1` (equal rises in `G` and `T` still raise `Y` by that amount)
  `change in Y = k x dG`  [currency/period]
- **Output shape:** computation block + a leakage table (`saving | tax | import` share of each round) and the resulting `k`. SENSITIVITY mandatory: `k` is hyperbolic in the leakage, so MPC of 0.8 versus 0.7 gives `k` of 5.0 versus 3.33 - a 12% input change moving the answer by 50%.
- **Traps:** using the closed-economy `k` in an open economy: imports leak, and the true multiplier is far smaller. Selling the multiplier as a policy promise - it assumes idle capacity, no crowding out, and no offsetting monetary reaction. Confusing the **tax** multiplier with the **spending** multiplier: the tax multiplier is negative and smaller in absolute value, because part of the first round is saved rather than spent. Quoting an MPC from memory - it is an estimate, HIGH volatility, fetch it.
- **Volatility:** LOW (algebra) / HIGH (any estimated MPC for a real economy).

## Inflation and the CPI

- **When:** deflating any currency figure, indexing a contract, or reading a price release.
- **Inputs:** `CPI_t`, `CPI_prev` = index levels [index points, base = 100] · basket cost [currency] · `i` = nominal rate [%/yr] · `pi` = inflation [%/yr].
- **Formula:** `CPI_t = (cost of the fixed basket in period t / cost of the same basket in the base period) x 100`  [index points]
  **Inflation rate between two CPI values:** `inflation % = ((CPI_t - CPI_prev) / CPI_prev) x 100`
  Real value of a nominal amount: `real = nominal / (CPI_t / CPI_base)`
  Fisher, exact: `(1 + i) = (1 + r)(1 + pi)` -> `r = ((1 + i) / (1 + pi)) - 1`
  Fisher, approximation (small rates only): `r = i - pi`
- **Output shape:** computation block + a table `period | CPI | inflation % | real value of the reference amount`. SENSITIVITY required whenever the result indexes money. Every CPI level and every inflation figure is `DATA UNAVAILABLE` until fetched from the national statistics agency and cited with its release date and base year.
- **Traps:** subtracting **index points** and calling the difference a percentage - a move from 110 to 115 is 5 **index points** and about 4.55%, not 5%. Chaining monthly rates by adding them instead of compounding `(1+m1)(1+m2)... - 1`. Confusing **disinflation** (inflation falling, still positive) with **deflation** (prices falling). Comparing a CPI series across a rebasing or a basket revision without splicing. Using `r = i - pi` at high inflation, where the exact Fisher form differs materially. Assuming the CPI basket matches the Boss's cost base - it rarely does; a firm's input inflation is a different index entirely.
- **Volatility:** HIGH (levels, rates, basket weights) / LOW (the formulas).

## The Phillips curve

- **When:** reasoning about the short-run trade-off between inflation and unemployment, or about why a stimulus may buy less output than promised.
- **Inputs:** `pi` = actual inflation · `pi_e` = expected inflation [%/yr] · `u` = unemployment rate · `u_n` = natural rate, NAIRU [%] · `s` = supply shock [%/yr] · `b` = slope coefficient [dimensionless, positive].
- **Formula:** expectations-augmented: `pi = pi_e - b x (u - u_n) + s`
  Long run: `u = u_n` regardless of `pi` - the long-run curve is **vertical** and there is no permanent trade-off.
- **Output shape:** computation block if parameters are supplied; otherwise the qualitative shape `short-run trade-off | expectation channel | supply-shock term | long-run verdict`. Any application to a real economy needs `u`, `u_n`, and `pi_e` fetched and cited - the NAIRU in particular is an **estimate with a wide band**, not an observation. SENSITIVITY required if any wage or price is set off the result.
- **Traps:** treating the short-run curve as a **menu** a policymaker may choose from permanently - once expectations adjust, the curve shifts and only the inflation is left. Dropping the supply-shock term `s`, which is the only reason stagflation (inflation **and** unemployment rising together) is possible at all. Quoting a NAIRU from memory. Plotting `pi` against `u` across decades, seeing a cloud, and declaring the relationship dead - a shifting curve traces exactly that cloud.
- **Volatility:** LOW (the relation) / HIGH (every parameter, the NAIRU above all).

## IS-LM basics

- **When:** working out how fiscal and monetary policy interact to set output and the interest rate in the short run, with the price level held fixed.
- **Inputs:** `c` = MPC · `t` = tax rate · `A0` = autonomous spending [currency/period] · `b` = investment sensitivity to the rate · `G`, `T` [currency/period] · `M/P` = real money supply [currency/period] · `k` = income sensitivity of money demand · `h` = rate sensitivity of money demand · `r` = interest rate [%].
- **Formula:** IS (goods market, `Y = C + I + G + NX`), linear form: `Y = [ 1 / (1 - c(1 - t)) ] x (A0 - b x r)` - downward-sloping in `(Y, r)` space.
  LM (money market, `M/P = L(r, Y)`), linear form: `M/P = k x Y - h x r`, so `r = (k x Y - M/P) / h` - upward-sloping.
  Equilibrium: solve the two together for `Y*` and `r*`.
- **Output shape:** computation block solving for `(Y*, r*)` + a policy table: `fiscal expansion -> IS shifts right -> Y up, r up (crowding out)`; `monetary expansion -> LM shifts right -> Y up, r down`. SENSITIVITY required on `Y*`. `M/P` and the policy rate are HIGH volatility - fetch from the central bank.
- **Traps:** using IS-LM where the **price level is not fixed** - it is a short-run model, and the long-run answer needs the aggregate-supply side. Forgetting **crowding out**: fiscal expansion lifts `r`, which subtracts investment from the headline gain. Assuming the central bank fixes the money supply when in practice it usually targets a **rate**, which flattens LM toward horizontal and changes every policy conclusion. Reading conclusions off the model with a remembered policy rate.
- **Volatility:** LOW (structure) / HIGH (all monetary inputs).

## Solow growth model

- **When:** the question is long-run growth: why economies converge, and why saving more raises the **level** of income but not its permanent **growth rate**.
- **Inputs:** `s` = saving rate [fraction] · `k` = capital per effective worker · `delta` = depreciation rate · `n` = population growth · `g` = technology growth [%/yr] · `alpha` = capital share of income [fraction].
- **Formula:** capital accumulation: `change in k = s x f(k) - (delta + n + g) x k`
  Steady state: `s x f(k*) = (delta + n + g) x k*`
  Cobb-Douglas (`y = k^alpha`): `k* = [ s / (n + g + delta) ]^(1 / (1 - alpha))` and `y* = [ s / (n + g + delta) ]^(alpha / (1 - alpha))`
  Golden rule: `f'(k_gold) = delta + n + g`
  Growth accounting: `growth in Y = growth in A + alpha x growth in K + (1 - alpha) x growth in L`
- **Output shape:** computation block for `k*` and `y*` + a convergence statement (below `k*` the economy grows toward it, above `k*` it shrinks toward it) and the central intuition: **in steady state, output per worker grows at `g` alone** - saving shifts the level, technology moves the rate. SENSITIVITY required on `y*` (income is money), with `s` at +/- 20%.
- **Traps:** claiming a higher saving rate raises the long-run **growth rate** - it raises the steady-state **level** and buys a temporary burst on the way there. Writing the golden rule as `f'(k) = delta` and dropping `n + g`. Mixing capital per **worker** with capital per **effective worker** - the units differ by the technology term. Reading convergence as a claim that all countries converge: the model predicts convergence **conditional** on the same `s`, `n`, `g`, and `delta`.
- **Volatility:** LOW (the model) / HIGH (any real `s`, `n`, `g`, `alpha` estimate).

## Exchange rates: nominal, real, and PPP

- **When:** pricing across currencies, judging competitiveness, or testing whether a currency looks misaligned.
- **Inputs:** convention first - here `e` = **units of domestic currency per 1 unit of foreign currency** (direct quote). `P` = domestic price level · `P_f` = foreign price level [index points] · `i_d`, `i_f` = nominal rates [%/yr] · `S` = spot, `F` = forward [domestic per foreign].
- **Formula:** real exchange rate: `RER = e x (P_f / P)`  [dimensionless]
  Absolute PPP: `e = P / P_f`
  Relative PPP: `% change in e = inflation_domestic - inflation_foreign`
  Covered interest parity: `F / S = (1 + i_d) / (1 + i_f)`
  Uncovered interest parity: `expected % change in e = i_d - i_f`
- **Output shape:** computation block + a direction line stating plainly which way is which: under this convention, **`e` rising = the domestic currency depreciating**. SENSITIVITY mandatory on any converted amount. Every `e`, `S`, `F`, `i_d`, `i_f` is `DATA UNAVAILABLE` until fetched from the central bank or a market data source and cited with its timestamp.
- **Traps:** **inverting the quote convention** and reporting depreciation exactly backwards - by far the most common error here, which is why the convention belongs in the INPUTS line every single time. Confusing **depreciation** (a market move) with **devaluation** (an official act under a peg). Expecting PPP to hold in the short run: it is a long-run anchor, and non-traded goods and trade costs break it. Comparing a nominal rate across time and calling it a competitiveness gain when domestic inflation already ate the move - correcting exactly that is what the RER is for.
- **Volatility:** HIGH (every rate) / LOW (the parities).

## Balance of payments structure

- **When:** reading a country's external position, or tracing where the money funding a trade deficit actually comes from.
- **Inputs:** current account components · capital account · financial account · reserve assets · net errors and omissions. All [currency/period].
- **Formula:** (conventions of the IMF balance of payments manual, sixth edition)
  `Current account = goods balance + services balance + primary income (wages, investment income) + secondary income (transfers, remittances)`
  Identity: `Current account + Capital account - Financial account + Net errors and omissions = 0`, with the financial account measured as **net lending (+) / net borrowing (-)**.
  Equivalently: a current-account deficit must be financed by net borrowing from the rest of the world or by running down reserves.
- **Output shape:** a BOP table (`account | sub-account | balance | sign`) with the identity shown closing to zero, plus a computation block for any derived ratio - current account as % of GDP, or reserve cover in months of imports = `reserves / average monthly imports`. SENSITIVITY required on any currency ratio. Every line item is `DATA UNAVAILABLE` until fetched from the central bank or the national statistics agency.
- **Traps:** the **sign convention is the trap** - the financial-account sign flipped between manual editions, so a reader applying the old convention gets the identity backwards. State which convention the source uses before adding anything up. Calling a current-account deficit a failure: it is a **financing** statement, not a verdict, and a fast-growing economy importing capital goods runs one by construction. Confusing the **capital account** (small: capital transfers, non-produced non-financial assets) with the **financial account** (large: direct, portfolio, and other investment). Dismissing **net errors and omissions** as noise when it is large - a big residual is itself the finding.
- **Volatility:** HIGH (every figure) / MEDIUM (the manual's conventions - state which edition you assumed).
