# D8 - Business Finance, Institutions, People
Every entry: **when · inputs · formula · output shape · traps · volatility**

Scope: corporate finance arithmetic, bank supervisory ratios, startup and venture
metrics, cap-table math, and the people-side frameworks (HR metrics, training design).

## Volatility protocol for this pack

Every entry here touches money, so **every entry carries a SENSITIVITY line** in its
computation block. That is not optional decoration: a single-point money number
implies a precision the inputs do not have.

The split that matters:

- **LOW** - the formula and the ratio **definition**. `WACC = E/V x Re + D/V x Rd x (1 - Tc)`
  is stable. `CAR = qualifying capital / RWA` is stable. `CCC = DIO + DSO - DPO` is
  stable. Recall these freely.
- **HIGH** - every **number a regulator, a tax authority, or a market sets**:
  minimum capital ratios, Basel buffer sizes, supervisory NPL and LDR limits, the
  statutory corporate tax rate `Tc`, the current risk-free rate `Rf`, the equity risk
  premium, policy rates. These are `DATA UNAVAILABLE` **until fetched and cited**,
  at every tier, under any deadline.

**Never write a specific country's current tax rate or capital requirement from
memory.** The formula around a remembered threshold still checks out, which is exactly
what makes it dangerous: it arrives wearing the costume of a verified result. A
compliance verdict ("the bank is above the minimum") built on a recalled threshold is
a fabricated verdict.

Rule of thumb for this pack: **if a supervisor, a parliament, or a market can change
the number overnight, it is HIGH.** If only a textbook can change it, it is LOW.

---

## Time value of money (PV, FV, annuities)

- **When:** any cash flow that arrives at a different date than another cash flow. This is the floor under every other entry in this pack.
- **Inputs:** `PV` = present value [currency] | `FV` = future value [currency] | `r` = periodic rate [% per period, as decimal] | `n` = number of periods [periods] | `PMT` = level payment per period [currency/period]
- **Formula:** `FV = PV x (1 + r)^n` | `PV = FV / (1 + r)^n` | ordinary annuity: `PV = PMT x [1 - (1 + r)^-n] / r`, `FV = PMT x [(1 + r)^n - 1] / r` | annuity due: multiply the ordinary result by `(1 + r)` | perpetuity: `PV = PMT / r` | growing perpetuity: `PV = PMT / (r - g)`, valid only when `r > g`
- **Output shape:** computation block (METHOD / INPUTS with units / FORMULA / SUBSTITUTION shown / RESULT with currency / SENSITIVITY / INTERPRETATION / ASSUMPTIONS). SENSITIVITY: re-run at `r` +/- 200 bps. Plus a timeline table: | period | cash flow | discount factor | PV |
- **Traps:** mixing a nominal annual rate with a monthly period (divide the nominal rate by 12 **and** multiply n by 12, both or neither); confusing the stated nominal rate with the effective rate `EAR = (1 + r_nom/m)^m - 1`; using ordinary-annuity formulas for payments made at period start (rent, lease, insurance premiums are annuities **due**); applying the growing-perpetuity formula when `g >= r`, which returns a negative or infinite value and is a signal the growth assumption is broken, not a number to report; discounting nominal cash flows at a real rate.
- **Volatility:** LOW (formulas). The rate `r` itself is HIGH if it is a market or policy rate.

## Net present value (NPV)

- **When:** the default accept/reject test for any investment, project, or acquisition. When NPV and any other criterion disagree, **NPV wins**.
- **Inputs:** `CF_t` = net cash flow in period t [currency] | `CF_0` = initial outlay [currency, negative] | `r` = discount rate, normally WACC or a project-risk-adjusted rate [% per period] | `n` = project life [periods]
- **Formula:** `NPV = sum_{t=0..n} CF_t / (1 + r)^t` (with `CF_0` typically negative)
- **Output shape:** computation block. **SENSITIVITY IS MANDATORY AND SPECIAL HERE: never report NPV at a single discount rate.** Always render an NPV profile table: | discount rate (r) | NPV | across at least 5 rates spanning the plausible range (for example WACC -400 bps to WACC +400 bps in 200 bps steps), plus the crossover rate where NPV = 0 (that is the IRR). Add a driver table: | assumption | base | low | high | NPV impact |
- **Traps:** discounting **accounting profit** rather than **free cash flow** (add back depreciation, subtract capex and the change in working capital); ignoring the working-capital release in the terminal period; forgetting that sunk costs stay out and opportunity costs stay in; using a company-wide WACC for a project whose risk profile differs from the firm's; mixing real cash flows with a nominal discount rate; treating a positive NPV computed at one assumed rate as a decision, when the sign flips inside the plausible rate range.
- **Volatility:** LOW (formula). The discount rate input is MEDIUM-to-HIGH.

## Internal rate of return (IRR) and MIRR

- **When:** communicating a return as a percentage to an audience that thinks in percentages. Useful as a **companion** to NPV, never as a replacement.
- **Inputs:** the same `CF_t` series [currency] | solved for `r` [% per period]
- **Formula:** `IRR = r such that sum_{t=0..n} CF_t / (1 + r)^t = 0` (solve numerically) | `MIRR = (FV of positive cash flows at reinvestment rate / |PV of negative cash flows at finance rate|)^(1/n) - 1`
- **Output shape:** computation block with the solved rate [% per period, and annualized if periods are not years], plus the **NPV profile chart/table** it comes from. SENSITIVITY: show NPV at rates on both sides of the IRR so the crossover is visible. State the sign-change count of the cash-flow series explicitly.
- **Traps:** **(1) Multiple IRRs.** A non-conventional cash-flow series (more than one sign change, for example a mine with a large end-of-life remediation outflow, or a project with a mid-life re-tooling spend) can have as many IRRs as it has sign changes, and can have none. Count the sign changes **before** quoting an IRR. If the count exceeds 1, quote MIRR or NPV instead and say why. **(2) The reinvestment assumption.** IRR implicitly assumes every interim cash flow is reinvested at the IRR itself, which is absurd for a project returning 60%. NPV assumes reinvestment at the discount rate, which is defensible. **(3) Scale blindness.** A 90% IRR on a small outlay loses to a 25% IRR on a large one in absolute value creation. **When IRR and NPV rank projects differently, follow NPV.** (4) Comparing IRRs across projects with different lives without annualizing.
- **Volatility:** LOW

## Payback period and discounted payback

- **When:** a fast liquidity and risk screen, especially under capital rationing or in a volatile environment where distant cash flows are not credible. A **screen**, not a decision rule.
- **Inputs:** `CF_0` = initial outlay [currency] | `CF_t` = net cash flow per period [currency] | `r` = discount rate [% per period] for the discounted variant
- **Formula:** `Payback = A + (B / C)` where `A` = last period with a negative cumulative cash flow, `B` = absolute unrecovered cost at the end of period A [currency], `C` = cash flow during the following period [currency] | Discounted payback: identical, but run the cumulation on `CF_t / (1 + r)^t`
- **Output shape:** computation block plus a cumulative table: | period | CF | cumulative CF | discounted CF | cumulative discounted CF |. SENSITIVITY: payback under low/base/high cash-flow scenarios, and the discounted payback at r +/- 200 bps. Always report **both** variants side by side.
- **Traps:** **plain payback ignores everything after the cutoff** - a project paying back in 2 years then collapsing to zero beats a project paying back in 3 years then earning for a decade, which is a ranking no one would defend out loud; plain payback also ignores the time value of money entirely inside the cutoff window (discounted payback fixes only that second flaw, not the first); the cutoff threshold itself is arbitrary and usually inherited without justification; interpolation assumes cash flows arrive evenly within a period. Never let payback overrule NPV.
- **Volatility:** LOW

## Profitability index (PI)

- **When:** ranking projects under **capital rationing**, where the constraint is budget, not opportunity. It converts NPV into value created per unit of capital committed.
- **Inputs:** `PV(future CF)` = present value of all cash inflows [currency] | `CF_0` = initial investment [currency, absolute value]
- **Formula:** `PI = PV(future cash flows) / |CF_0|` , equivalently `PI = 1 + NPV / |CF_0|`
- **Output shape:** computation block plus a ranking table: | project | outlay | NPV | PI | rank by NPV | rank by PI | cumulative capital consumed |. SENSITIVITY: PI recomputed at r +/- 200 bps, since PI inherits every discount-rate fragility NPV has.
- **Traps:** using PI when capital is **not** rationed (unconstrained, maximize total NPV, not NPV per dollar); PI cannot handle mutually exclusive projects of different scale; inconsistent treatment of later outflows (netting them into the numerator versus adding them to the denominator gives different PIs for the same project, so state the convention); a PI of 1.0 means NPV = 0, not "break-even profitable".
- **Volatility:** LOW

## Weighted average cost of capital (WACC)

- **When:** setting the discount rate for a firm-level valuation or a project of average firm risk; measuring whether returns clear the cost of the capital that funded them.
- **Inputs:** `E` = market value of equity [currency] | `D` = market value of debt [currency] | `V = E + D` [currency] | `Re` = cost of equity [% p.a., normally from CAPM] | `Rd` = pre-tax cost of debt [% p.a.] | `Tc` = marginal corporate tax rate [%]
- **Formula:** `WACC = (E/V) x Re + (D/V) x Rd x (1 - Tc)`
- **Output shape:** computation block with each weight and each component rate shown separately before the sum. SENSITIVITY IS MANDATORY: a table over | Re | Rd | D/V | -> WACC, and a WACC range, because the downstream NPV is more sensitive to this one input than to almost anything else. Carry the WACC **range** forward into the NPV profile, not a point estimate.
- **Traps:** using **book** values of equity instead of **market** values (the single most common error, and it silently overweights debt); applying the tax shield to the cost of equity (only `Rd` gets `(1 - Tc)`, because only interest is deductible); using the coupon rate on old debt instead of the **current yield** the firm would pay on new debt; forgetting preferred stock as a third component when it exists; recalling `Tc` from memory instead of fetching the statutory rate; assuming the capital structure is static when the project itself changes it.
- **Volatility:** LOW for the formula. `Tc` = **HIGH** (statutory, `DATA UNAVAILABLE` until fetched and cited). `Re`, `Rd` = HIGH (market-set).

## Cost of equity (CAPM)

- **When:** deriving `Re` for the WACC, or pricing the required return on an equity position.
- **Inputs:** `Rf` = risk-free rate [% p.a.] | `beta` = systematic risk of the asset relative to the market [dimensionless, x] | `Rm` = expected market return [% p.a.] | `(Rm - Rf)` = equity risk premium, ERP [% p.a.]
- **Formula:** `Re = Rf + beta x (Rm - Rf)`
- **Output shape:** computation block with `Rf`, `beta`, and ERP each carrying an explicit **source and as-of date**. SENSITIVITY MANDATORY: a table over | beta | ERP | -> Re, spanning at least the beta estimation error and an ERP range, then feed the resulting `Re` **range** into WACC.
- **Traps:** recalling `Rf` or the ERP from memory (both are HIGH, both move); mismatching the horizon of `Rf` against the cash-flow horizon (a 10-year project takes a long-dated government yield, not an overnight rate); using a raw regression beta without adjusting for the estimation noise, or using a levered comparable's beta without unlevering and relevering it to the target's capital structure (`beta_unlevered = beta_levered / [1 + (1 - Tc) x D/E]`); adding a country or size premium twice; using CAPM for a private firm without acknowledging that beta is an estimate borrowed from listed comparables.
- **Volatility:** LOW for the formula. `Rf`, `Rm`, ERP = **HIGH** (`DATA UNAVAILABLE` until fetched and cited).

## Operating leverage (DOL) and financial leverage (DFL)

- **When:** quantifying how a 1% move in sales amplifies into EBIT (operating) and then into EPS (financial). The core diagnostic for "why did a small revenue miss destroy earnings".
- **Inputs:** `Q` = units sold [units] | `P` = price per unit [currency/unit] | `V` = variable cost per unit [currency/unit] | `F` = fixed operating cost [currency/period] | `EBIT` [currency/period] | `I` = interest expense [currency/period] | `Dp` = preferred dividends [currency/period] | `Tc` = tax rate [%]
- **Formula:** `DOL = % change in EBIT / % change in sales = Q x (P - V) / [Q x (P - V) - F]` | `DFL = % change in EPS / % change in EBIT = EBIT / [EBIT - I - Dp/(1 - Tc)]` (drop the `Dp` term when there is no preferred stock) | `DTL = DOL x DFL`
- **Output shape:** computation block for each, plus a table: | sales change % | resulting EBIT change % | resulting EPS change % | at the current DOL and DFL. SENSITIVITY: recompute DOL and DFL at sales -20%, base, +20%, because **both degrees change as the base moves** and are only valid at the point where they were measured.
- **Traps:** quoting DOL as a constant property of the business (it is a **point elasticity**, it rises sharply as EBIT approaches zero and is undefined at break-even); mixing fixed and variable costs incorrectly (semi-variable costs must be split); ignoring the `Dp/(1 - Tc)` grossing-up on preferred dividends, which are paid after tax; treating high leverage as automatically bad (it is directional amplification, excellent on the way up); computing DFL when EBIT < I, which returns a nonsense negative.
- **Volatility:** LOW

## DuPont decomposition (3-step and 5-step)

- **When:** diagnosing **why** ROE moved. ROE alone tells you the score; DuPont tells you which player did it.
- **Inputs:** `NI` = net income [currency] | `Sales` = revenue [currency] | `TA` = average total assets [currency] | `E` = average shareholders' equity [currency] | `EBT` = earnings before tax [currency] | `EBIT` = earnings before interest and tax [currency]
- **Formula:** 3-step: `ROE = (NI / Sales) x (Sales / TA) x (TA / E)` = net profit margin [%] x asset turnover [x] x equity multiplier [x] | 5-step: `ROE = (NI / EBT) x (EBT / EBIT) x (EBIT / Sales) x (Sales / TA) x (TA / E)` = tax burden [x] x interest burden [x] x operating margin [%] x asset turnover [x] x equity multiplier [x]
- **Output shape:** computation block, plus a **bridge table across at least two periods**: | component | prior | current | delta | contribution to delta ROE (pp) |, so the driver of the move is named. SENSITIVITY: show ROE if each component alone reverts to its prior value, isolating the single component doing the work.
- **Traps:** using **year-end** assets and equity when the numerator is a full-year flow (use **averages**, or the ratio is biased by any mid-year balance-sheet move); reading a rising equity multiplier as strength when it is simply more debt (the 5-step version exposes this because the interest burden falls at the same time); comparing ROE across industries with structurally different asset intensity; negative equity making the multiplier meaningless; buybacks inflating ROE by shrinking the denominator with no operating improvement at all.
- **Volatility:** LOW

## Working capital and the cash conversion cycle (CCC)

- **When:** diagnosing why a profitable company has no cash; sizing the working-capital investment a growth plan silently requires.
- **Inputs:** `Inventory`, `AR` (receivables), `AP` (payables), all averages [currency] | `COGS` [currency/yr] | `Revenue` [currency/yr] | 365 [days/yr]
- **Formula:** `Net working capital = current assets - current liabilities` [currency] | `DIO = (average inventory / COGS) x 365` [days] | `DSO = (average AR / revenue) x 365` [days] | `DPO = (average AP / COGS) x 365` [days] | `CCC = DIO + DSO - DPO` [days]
- **Output shape:** computation block for each of DIO, DSO, DPO, then CCC. Plus a table: | component | days | change vs prior | cash released per day of improvement [currency/day] |, where cash released = (revenue or COGS) / 365 x days improved. SENSITIVITY MANDATORY: cash impact of +/- 10 days on each leg, which converts a days number into a currency number an operator can act on.
- **Traps:** the **sign on DPO is negative** (stretching payables shortens the cycle, and inverting this sign is the most common CCC error); using revenue in the DIO or DPO denominator instead of COGS (revenue carries margin, inventory and payables do not); using period-end balances during a seasonal peak; celebrating a falling CCC that was achieved by starving inventory into stockouts or by abusing suppliers who will reprice; forgetting that a **negative CCC** (customers pay before suppliers do) is a genuine financing source and that growth in such a model **generates** cash rather than consuming it.
- **Volatility:** LOW

## Break-even and margin of safety

- **When:** pricing decisions, go/no-go on a product line, sizing the volume risk in a plan.
- **Inputs:** `F` = total fixed cost [currency/period] | `P` = price per unit [currency/unit] | `V` = variable cost per unit [currency/unit] | `CM = P - V` = contribution margin per unit [currency/unit] | `S_actual` = actual or budgeted sales [currency or units]
- **Formula:** `BE units = F / (P - V)` [units] | `BE revenue = F / CM ratio`, where `CM ratio = (P - V) / P` [%] | `Units for a target profit = (F + target profit) / (P - V)` | `Margin of safety = (S_actual - S_breakeven) / S_actual x 100` [%]
- **Output shape:** computation block, plus a table: | price scenario | CM/unit | BE units | BE revenue | margin of safety at planned volume |. SENSITIVITY MANDATORY: BE units at V +/- 10% and at P +/- 10%, because break-even is hyperbolically sensitive to the contribution margin as CM approaches zero.
- **Traps:** treating a step-fixed cost (a second shift, a second machine, a second warehouse) as linear-fixed, which makes the break-even chart discontinuous and the single BE point wrong; using an average CM across a product mix and then assuming the mix holds at the break-even volume; forgetting that break-even is a **cash** question when fixed costs contain large non-cash depreciation (the cash break-even is lower); computing margin of safety against a budget nobody believes.
- **Volatility:** LOW

## Bank capital and asset quality: CAR, NPL

- **When:** assessing a bank's or a lender's solvency and loan-book health.
- **Inputs:** `Tier 1 capital`, `Tier 2 capital` [currency] | `RWA` = risk-weighted assets [currency] | `NPL` = non-performing loans, typically loans classified substandard, doubtful, and loss [currency] | `Total loans` [currency] | `Provisions` = loan-loss reserves [currency]
- **Formula:** `CAR = (Tier 1 + Tier 2 qualifying capital) / RWA x 100` [%] | `CET1 ratio = CET1 capital / RWA x 100` [%] | `Gross NPL ratio = NPL / total loans x 100` [%] | `Net NPL ratio = (NPL - provisions on NPL) / total loans x 100` [%] | `Coverage ratio = provisions / NPL x 100` [%]
- **Output shape:** computation block per ratio, plus a compliance table: | ratio | computed value | regulatory minimum/limit | source + as-of date | headroom (pp) |. **The "regulatory minimum" column starts as `DATA UNAVAILABLE` and stays that way until fetched and cited.** SENSITIVITY MANDATORY: CAR under a stress case (for example NPL +200 bps flowing through provisions into capital), and the RWA growth that would consume the headroom.
- **Traps:** **quoting a minimum capital ratio, a Basel buffer size, or a supervisory NPL cap from memory** - the definitions are stable, the thresholds are not, they differ by jurisdiction, by bank tier, and by systemic-importance designation, and they are revised on regulatory cycles; comparing CAR across jurisdictions with different RWA calculation methods (standardized versus internal-model banks are not comparable); reading gross NPL without the coverage ratio, since a high NPL with high coverage is a very different animal from a high NPL with none; ignoring restructured or special-mention loans sitting one classification step above NPL, which is where deterioration hides first.
- **Volatility:** **Definitions LOW. Every threshold, minimum, buffer, and supervisory limit = HIGH - fetch and cite, never recall.**

## Bank liquidity and earnings: LDR/LDF, NIM, cost-to-income

- **When:** assessing funding structure, intermediation margin, and operating efficiency of a bank.
- **Inputs:** `Total loans` [currency] | `Total deposits` (third-party funds) [currency] | `Interest income`, `Interest expense` [currency/period] | `Average earning assets` [currency] | `Operating expense`, `Operating income` [currency/period]
- **Formula:** `LDR = total loans / total deposits x 100` [%] | `LDF (loan-to-funding) = total loans / (deposits + qualifying securities issued + eligible borrowings) x 100` [%] | `NIM = (interest income - interest expense) / average earning assets x 100` [%] | `Cost-to-income (BOPO-style) = total operating expense / total operating income x 100` [%, lower is better]
- **Output shape:** computation block per ratio, plus a table: | ratio | computed | prior period | peer median | supervisory limit (fetched) | verdict |. SENSITIVITY MANDATORY: NIM at deposit cost +100 bps with lending yield held flat (the classic margin squeeze), and cost-to-income at operating income -10%.
- **Traps:** **the supervisory LDR/LDF corridor is HIGH-volatility and jurisdiction-specific** - do not recall it; using **average** earning assets is required for NIM (period-end balances distort it badly for a growing book); reading a high LDR as "efficient" when it is actually a liquidity risk; a cost-to-income ratio that improves only because a one-off gain inflated operating income; NIM comparisons across banks with different business mixes (a fee-heavy bank looks thin on NIM and is not therefore weaker).
- **Volatility:** **Definitions LOW. Supervisory corridors and limits = HIGH - fetch and cite.**

## Market sizing: TAM, SAM, SOM

- **When:** the first quantitative page of any venture case; sanity-checking whether a market can carry the return an investor needs.
- **Inputs:** `N` = total number of potential buyers in the universe [count] | `ASP` = average annual revenue per buyer [currency/buyer/yr] | reachability filters (geography, segment, channel) [%] | realistic share capture [%]
- **Formula:** `TAM = N x ASP` [currency/yr] | `SAM = TAM x % reachable by the current product, geography, and channel` | `SOM = SAM x realistically capturable share within the plan horizon` | prefer **bottom-up** (`SOM = achievable customers x ASP`) as the primary, and use top-down only to cross-check.
- **Output shape:** computation block with **both** a top-down and a bottom-up build shown side by side, and the gap between them named. Table: | layer | count | ASP | value [currency/yr] | filter applied | source |. SENSITIVITY MANDATORY: SOM at pessimistic/base/optimistic share and ASP, since the two multiply and the error compounds.
- **Traps:** the "1% of a huge market" argument, which is an assertion of a share, not a plan to win one; sourcing TAM from a vendor report with no methodology; counting **revenue** TAM when the business monetizes a fraction of the transaction (take rate); confusing an addressable market with a **budget that exists today** versus one that would have to be created; a SAM that is not actually reachable with the current channel and price point.
- **Volatility:** LOW (method). Market size figures themselves = MEDIUM-to-HIGH, cite the source and date.

## Customer lifetime value (LTV)

- **When:** deciding how much a customer is worth, which is the only honest input to how much may be spent acquiring one.
- **Inputs:** `ARPA` = average revenue per account [currency/month] | `GM%` = gross margin [%] | `c` = monthly customer churn rate [% per month, as decimal] | `d` = monthly discount rate [%] for the discounted form
- **Formula:** simple: `LTV = (ARPA x GM%) / c` [currency] | discounted (preferred): `LTV = (ARPA x GM%) / (c + d)` [currency] | average customer lifetime = `1 / c` [months]
- **Output shape:** computation block showing ARPA, GM%, and churn each with its measurement window. Table: | cohort | ARPA | GM% | monthly churn | implied lifetime (months) | LTV |. SENSITIVITY MANDATORY: LTV across churn -50 bps / base / +50 bps monthly, because LTV is a **reciprocal** of churn and therefore explodes as churn approaches zero.
- **Traps:** using **revenue** rather than **gross-margin** LTV, which overstates value by the entire cost of service; using a blended churn across cohorts with wildly different retention (the low-churn enterprise cohort carries the average and hides an unviable SMB cohort); the undiscounted formula on a 5-year lifetime, where money 5 years out is not worth its face value; extrapolating a lifetime longer than the company has existed; ignoring expansion revenue (net revenue retention above 100% changes the shape of the curve entirely, and the simple formula cannot represent it).
- **Volatility:** LOW (formula). Churn and ARPA inputs are company data, MEDIUM.

## Customer acquisition cost (CAC) and the LTV/CAC ratio

- **When:** testing whether growth spend creates or destroys value.
- **Inputs:** `S&M` = fully loaded sales and marketing spend in the period [currency/period] | `New customers` acquired in the period [count] | `LTV` [currency, from the entry above]
- **Formula:** `CAC = fully loaded S&M spend / number of NEW customers acquired` [currency/customer] | `LTV/CAC ratio = LTV / CAC` [x, dimensionless]
- **Output shape:** computation block, plus a channel table: | channel | spend | new customers | CAC | LTV | LTV/CAC | verdict |, because a blended CAC hides the channel that is losing money. SENSITIVITY MANDATORY: LTV/CAC at churn and CAC stress (+25% CAC, +50 bps churn simultaneously, the realistic joint downside).
- **Traps:** excluding salaries, tooling, and commissions from S&M and reporting a flattering **paid-media-only** CAC; dividing by **total** customers rather than **new** ones; a lag mismatch, where spend in one month acquires customers in the next and the ratio is computed on mismatched windows; counting organic and referral customers in the denominator while the numerator holds only paid spend (this deflates CAC and is very common); a blended LTV/CAC of 3x that is really one channel at 8x subsidizing another at 0.6x. The commonly cited 3x heuristic is a **rule of thumb, not a law**, and it is meaningless without the CAC payback period beside it.
- **Volatility:** LOW (formula). The 3x benchmark is a heuristic, MEDIUM.

## CAC payback period

- **When:** the cash-flow twin of LTV/CAC. LTV/CAC says whether growth is profitable; CAC payback says whether the company can survive the wait.
- **Inputs:** `CAC` [currency/customer] | `ARPA` [currency/month] | `GM%` = gross margin [%]
- **Formula:** `CAC payback (months) = CAC / (ARPA x GM%)`
- **Output shape:** computation block, plus a table: | segment | CAC | monthly gross profit per customer | payback (months) | months of runway required to fund it |. SENSITIVITY MANDATORY: payback at GM% -10 pp and ARPA -10%, and the resulting cash requirement to fund one month of acquisition at plan volume.
- **Traps:** computing payback on **revenue** rather than gross profit, which understates it by the cost of service; ignoring churn during the payback window (customers lost before payback never repay their CAC at all, so the effective payback is longer than the formula shows); a healthy LTV/CAC with a 30-month payback is a **financing problem** even though the unit economics are sound, because the company must fund the gap; ignoring that a long payback multiplies the cash burn of every acceleration in growth.
- **Volatility:** LOW

## Burn rate (gross vs net) and runway

- **When:** the single most consequential number on a startup's board deck. It answers: how long until the company dies without new money.
- **Inputs:** `Cash` = cash and equivalents on hand [currency] | `Gross burn` = total cash operating outflows per month [currency/month] | `Cash inflows` = cash actually collected per month [currency/month] | `Net burn = gross burn - cash inflows` [currency/month]
- **Formula:** `Net burn = gross burn - cash collected` [currency/month] | `Runway = cash on hand / net burn` [months] | if net burn <= 0, the company is cash-flow positive and runway is not defined by this formula
- **Output shape:** computation block, plus a month-by-month table: | month | cash in | cash out | net burn | closing cash |, run to zero. SENSITIVITY MANDATORY: runway at net burn +20% and at revenue -25% (the two shocks that actually co-occur), plus the fundraise-trigger date working backwards a full raise cycle from the zero-cash date.
- **Traps:** quoting **gross** burn as runway (flattering and wrong) or quoting net burn while ignoring that a single large customer's payment is what makes it look small; using **accrual revenue** rather than **cash collected** (a signed contract is not cash, and DSO decides when it becomes cash); ignoring lumpy outflows sitting outside the average (annual insurance, tax payments, hardware, severance); computing runway against a burn that is about to rise because of hiring already committed; forgetting that a raise takes months, so the **real** deadline is the zero-cash date minus the raise cycle, not the zero-cash date.
- **Volatility:** LOW

## The Rule of 40

- **When:** a single-line health check on a growth-stage software business, balancing growth against profitability.
- **Inputs:** `g` = year-over-year revenue growth rate [%] | `m` = profitability margin [%], stated explicitly as EBITDA margin, FCF margin, or operating margin
- **Formula:** `Rule of 40 score = g + m` [%], with the heuristic bar at `>= 40`
- **Output shape:** computation block, plus a table: | period | growth % | margin % (basis named) | score | trend |. SENSITIVITY MANDATORY: score under margin definitions side by side (EBITDA vs FCF), because the choice of margin basis can swing the score by 10-20 pp and is the number-one place this metric is gamed.
- **Traps:** not naming the margin basis (an EBITDA-margin score and an FCF-margin score are not comparable, and the flattering one is always the one that gets presented); applying it to an early-stage company where growth off a tiny base makes the score meaningless; treating 40 as a **regulation** rather than an investor heuristic that emerged from a particular software-market regime; ignoring that the two components are not interchangeable in the eyes of an acquirer even when the sum matches.
- **Volatility:** LOW (formula). The 40 bar is a MEDIUM heuristic, not a law.

## Cap-table math: pre-money, post-money, dilution

- **When:** any priced equity round, ESOP grant, or founder-ownership question.
- **Inputs:** `Pre` = pre-money valuation [currency] | `Inv` = investment amount [currency] | `Post` = post-money valuation [currency] | `S_pre` = fully diluted shares outstanding before the round [shares] | `PPS` = price per share [currency/share]
- **Formula:** `Post = Pre + Inv` | `Investor ownership % = Inv / Post x 100` | `PPS = Pre / S_pre(fully diluted)` | `New shares issued = Inv / PPS` | `Founder % after = Founder % before x (Pre / Post)` | dilution factor `= Pre / Post` [x]
- **Output shape:** computation block, plus a **before/after cap table**: | holder | shares before | % before | shares after | % after | dilution (pp) |, with the totals proving out to 100%. SENSITIVITY MANDATORY: founder ownership and investor ownership across a pre-money range, and the value per founder point at each.
- **Traps:** **confusing pre-money and post-money** ("we raised 2m at 8m" means 20% if 8m is post and 25% if 8m is pre, and the difference is real money); computing PPS on **issued** shares rather than **fully diluted** shares (which must include the existing option pool, warrants, and convertible notes); forgetting that **SAFEs and convertible notes convert at this round** and dilute alongside the founders, so a cap table that ignores an outstanding SAFE stack is simply wrong; assuming a valuation cap on a note is the conversion price when a discount produces a lower one; ignoring that liquidation preferences mean ownership percentage does not equal exit proceeds.
- **Volatility:** LOW

## The option pool shuffle

- **When:** every term sheet with an option-pool provision. **This is the single most misunderstood term in a term sheet**, and it is a valuation adjustment disguised as an administrative detail.
- **Inputs:** `Pre` = stated pre-money valuation [currency] | `Pool%` = new option pool as a % of the **post-money** fully diluted shares [%] | `Inv` [currency] | `S_pre` = existing fully diluted shares [shares]
- **Formula:** pool created **pre-money** (the standard investor ask): the new pool shares are added to the pre-money share count, so `PPS = Pre / (S_pre + new pool shares)`. The pool's value is carved **out of the pre-money valuation**, which means it dilutes **only the existing holders (founders), and not the incoming investor at all**. Effective pre-money to the founders `= Pre - (Pool% x Post)`. Pool created **post-money**: pool shares are added after the round and **both** founders and the new investor dilute pro rata.
- **Output shape:** computation block showing **both** treatments of the same round side by side, plus the comparison table: | scenario | PPS | founder % after | investor % after | pool % | effective pre-money to founders | founder value delta [currency] |. SENSITIVITY MANDATORY: founder ownership and founder value across a pool size range (for example 8% to 20%), which converts an abstract term into a currency number.
- **Traps:** accepting a large pre-money pool without negotiating, which is a **silent valuation cut** on the founders (a 15% pre-money pool on a stated pre-money valuation reduces the effective pre-money by 15% of the post-money, and the headline valuation never changes to reflect it); sizing the pool off a hiring plan the investor drafted rather than one the company actually needs; failing to net the **unallocated portion of the existing pool** against the new ask; carrying an oversized unused pool into the next round, where it dilutes again. The negotiable levers are the **pool size** and whether it sits **pre- or post-money**, and both are worth real money.
- **Volatility:** LOW

## Unit economics and contribution margin

- **When:** the foundation under LTV, CAC payback, break-even, and every claim that "it works at scale". If a unit loses money, scale is an accelerant, not a cure.
- **Inputs:** `P` = price per unit or per order [currency/unit] | `COGS/unit` [currency/unit] | `variable fulfilment, payment, and support cost per unit` [currency/unit] | `variable CAC allocated per unit` [currency/unit]
- **Formula:** `Contribution margin per unit = P - total variable cost per unit` [currency/unit] | `CM ratio = CM / P x 100` [%] | `Contribution after CAC = CM - CAC per unit` [currency/unit] | `Fixed-cost coverage = total CM / fixed costs` [x]
- **Output shape:** computation block, plus a **waterfall table** from price down to contribution: | line | currency/unit | % of price |, one row per cost layer. SENSITIVITY MANDATORY: CM at price -10%, at variable cost +10%, and the volume required to cover fixed costs in each case.
- **Traps:** hiding a variable cost in the fixed-cost bucket to make CM look positive (payment processing, support, and refunds are variable, and discounts and chargebacks are negative revenue, not marketing); computing CM before **discounts and returns**; a positive CM that turns negative once CAC is included and calling the business "profitable at the unit level"; assuming variable costs stay linear across the volume range in the plan.
- **Volatility:** LOW

## Business Model Canvas

- **When:** compressing a whole business, or a proposed pivot, onto one page so that the inconsistencies become visible.
- **Inputs:** the 9 blocks: customer segments, value propositions, channels, customer relationships, revenue streams, key resources, key activities, key partnerships, cost structure.
- **Formula:** not arithmetic. The **coherence test** is: does the cost structure fund the key resources and activities that deliver the value proposition, and does the revenue stream that the customer segment actually pays clear that cost structure? Any block that fails to connect to a revenue stream or a cost line is decoration.
- **Output shape:** the 9-block table (one row per block, with the specific claim and the evidence for it), **plus a quantitative footer that ties it to money**: contribution margin per unit and the fixed-cost base implied by the key activities. SENSITIVITY: name the **one block whose failure kills the model**, and what it would cost to test that block first.
- **Traps:** filling all 9 boxes with plausible nouns and calling it a strategy; a value proposition written as a feature list; listing every possible channel rather than the one that actually acquires; a cost structure that omits the cost of the key partnerships; using it as a static artifact rather than a hypothesis set to be tested in order of risk.
- **Volatility:** LOW

## Balanced Scorecard

- **When:** translating strategy into measures across four perspectives so that financial results are explained by their upstream drivers rather than reported in isolation.
- **Inputs:** strategic objectives per perspective, each with a measure [unit], a target [unit], and an initiative.
- **Formula:** not arithmetic. The four perspectives and their causal chain: **Learning and Growth** (people, systems, culture) drives **Internal Process** (what must be done excellently), which drives **Customer** (value delivered, satisfaction, retention), which drives **Financial** (revenue, margin, ROCE). The chain runs upward; the financial layer is the **lagging** indicator and the learning layer is the **leading** one.
- **Output shape:** a 4-perspective table: | perspective | objective | measure (with unit) | baseline | target | initiative | owner |. SENSITIVITY MANDATORY (this is a money framework): for each non-financial measure, state the **assumed transmission to the financial perspective** (for example: +5 pp retention -> +X currency of revenue, showing the arithmetic), and flag any measure with no traceable financial link.
- **Traps:** a scorecard with 40 measures, which is a dashboard, not a scorecard; measures with no owner; picking only lagging financial measures and re-labelling them across four boxes; asserting a causal link from a learning measure to a financial one without ever testing it; targets set where the data is easy rather than where the strategy is at risk.
- **Volatility:** LOW

## HR: turnover rate

- **When:** quantifying attrition, its cost, and whether a retention intervention paid for itself.
- **Inputs:** `Leavers` = separations during the period [count] | `Headcount_start`, `Headcount_end` [count] | `Average headcount = (start + end) / 2` [count]
- **Formula:** `Turnover rate = (leavers / average headcount) x 100` [% per period, name the period] | `Voluntary turnover` and `involuntary turnover` computed separately with the same denominator | `Retention rate = (employees present at start who are still present at end / headcount at start) x 100` [%] (this is **not** 100 minus turnover)
- **Output shape:** computation block, plus a segmented table: | segment (function, tenure band, manager, performance band) | leavers | avg headcount | turnover % | cost of that turnover [currency] |. SENSITIVITY MANDATORY: total attrition cost at replacement cost of 0.5x, 1.0x, and 2.0x annual salary, which turns an HR percentage into a finance number a CFO will act on.
- **Traps:** using **year-end** headcount as the denominator in a growing company, which understates turnover badly; blending voluntary and involuntary attrition and then treating the whole figure as a morale signal; not annualizing a monthly or quarterly rate before comparing it to an annual benchmark; assuming retention = 100 - turnover (it does not, because new hires who join and leave inside the period inflate turnover without affecting the starting cohort's retention); a healthy-looking company-wide rate that hides one team hemorrhaging its best people; ignoring **regretted vs non-regretted** attrition, which is the only cut that matters.
- **Volatility:** LOW

## HR: cost per hire

- **When:** budgeting recruitment, choosing between agency and in-house sourcing, or defending a talent-acquisition budget.
- **Inputs:** `External costs` = agency fees, job-board spend, advertising, referral bonuses, assessments, travel [currency] | `Internal costs` = recruiter salaries and benefits, ATS and tooling, allocated hiring-manager time [currency] | `H` = number of hires in the period [count]
- **Formula:** `Cost per hire = (total external costs + total internal costs) / number of hires` [currency/hire]
- **Output shape:** computation block, plus a table: | channel or role family | external cost | internal cost | hires | cost per hire | time to fill (days) | 12-month retention of those hires (%) |. SENSITIVITY MANDATORY: cost per hire at hire volume -30% (fixed recruiting cost per hire rises as volume falls), and the cost of a **vacancy day** [currency/day] compared against the cost of a faster, more expensive channel.
- **Traps:** counting only external costs and reporting a fictitiously low figure; ignoring the **cost of the vacancy itself** (lost output per open day), which usually dwarfs the cost of filling it; optimizing cost per hire while quality of hire collapses (the cheapest channel that produces 12-month leavers is the most expensive channel); allocating internal recruiter cost across a period with unusually lumpy hiring; comparing cost per hire across role families with entirely different market scarcity.
- **Volatility:** LOW

## ADDIE (instructional design)

- **When:** designing a training program, an onboarding curriculum, or an enablement track, so that it is built backwards from a performance gap rather than forwards from available content.
- **Inputs:** the performance gap [measurable, with a unit], learner population [count], constraints (budget [currency], time [hours/learner]).
- **Formula:** not arithmetic. Five phases: **Analyze** (what is the performance gap, and is it actually a training problem rather than an incentive, tooling, or process problem), **Design** (objectives, assessment, sequence), **Develop** (build the materials), **Implement** (deliver), **Evaluate** (measure against the phase-1 gap, and feed back).
- **Output shape:** a phase table: | phase | deliverable | owner | duration | cost [currency] |, **plus the money footer**: total program cost [currency], cost per learner [currency/learner], and the target improvement in the phase-1 gap metric expressed in currency. SENSITIVITY MANDATORY: program break-even, meaning the performance improvement (in the gap metric's own units) required for the program to pay for itself, and how likely that is.
- **Traps:** skipping Analyze and building training for a problem training cannot fix (this is the dominant failure: no amount of instruction cures a broken incentive or a missing tool); Evaluate degenerating into a satisfaction survey; treating the phases as a strictly linear waterfall when the analysis should be revisited after the first cohort; no baseline measurement taken before delivery, which makes any post-hoc claim of impact unfalsifiable.
- **Volatility:** LOW

## Kirkpatrick's four levels of training evaluation

- **When:** proving (or disproving) that a training investment changed anything. Pairs with ADDIE's Evaluate phase.
- **Inputs:** per level: an instrument, a baseline [unit], and a post-measure [unit].
- **Formula:** not arithmetic at levels 1-3. **Level 1 Reaction** (did they find it relevant and engaging), **Level 2 Learning** (did knowledge, skill, or confidence change, measured pre vs post), **Level 3 Behavior** (did on-the-job behavior change, measured 30-90 days later at the workplace, not in the classroom), **Level 4 Results** (did the business metric move). The frequently added **Level 5 (Phillips) ROI**: `Training ROI % = [(monetized program benefits - program costs) / program costs] x 100`.
- **Output shape:** a 4-level table: | level | instrument | baseline | post | delta | confidence |, **plus the level-4/5 money block**: benefit [currency], cost [currency], ROI [%], with the substitution shown. SENSITIVITY MANDATORY: ROI computed at conservative, base, and optimistic isolation factors (the fraction of the business-metric improvement genuinely attributable to the training rather than to seasonality, a pricing change, or a new tool), because that isolation factor is the assumption that carries the entire ROI claim.
- **Traps:** stopping at Level 1 and reporting a smile-sheet score as evidence of impact (the most common corporate training lie); a Level 2 gain with no Level 3 transfer, which means the classroom worked and the workplace did not; attributing a Level 4 business movement to training without an **isolation factor** or a control group; measuring Level 3 too early, before behavior has had a chance to change; monetizing a benefit with a made-up conversion factor, which fabricates the numerator of the ROI (mark it `DATA UNAVAILABLE` instead).
- **Volatility:** LOW
