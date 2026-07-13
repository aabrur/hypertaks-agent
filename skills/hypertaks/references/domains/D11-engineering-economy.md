# D11 - Engineering Economy & Reliability
Every entry: **when · inputs · formula · output shape · traps · volatility**


## Present worth (PW)

- **When:** comparing alternatives, or accepting/rejecting one, on a common date
  (t = 0), with a known discount rate.
- **Inputs:** cash flows A_t (currency per period t, signed: costs negative, benefits
  positive); discount rate i (decimal per period, for example 0.12 per year); horizon
  N (periods); salvage S (currency at t = N).
- **Formula:** `PW = sum over t=0..N of A_t / (1 + i)^t`. Uniform series:
  `(P/A, i, N) = [(1 + i)^N - 1] / [i * (1 + i)^N]`. Single sum:
  `(P/F, i, N) = 1 / (1 + i)^N`.
- **Output shape:** a full computation block (METHOD, INPUTS with units and source,
  FORMULA, SUBSTITUTION, RESULT with currency, SENSITIVITY, INTERPRETATION,
  ASSUMPTIONS). **SENSITIVITY is mandatory:** re-run PW at i +/- 2 to 3 percentage
  points and at the most uncertain cash flow +/-20 percent, and state the switching
  value of i where the decision flips.
- **Traps:** comparing alternatives with unequal lives by PW (invalid without a
  common horizon - either use the least common multiple of lives, or switch to
  annual worth / EAC, which handles unequal lives natively); mixing nominal cash
  flows with a real discount rate (inflation must be on one side only, not both and
  not neither); using an accounting rate instead of a hurdle rate; discounting
  depreciation, which is not a cash flow.
- **Volatility:** LOW (the mathematics). The **rate** i is an input and, when it comes
  from a policy or a market source, treat that number as HIGH: fetch and cite it.

## Annual worth and equivalent annual cost (EAC)

- **When:** comparing assets or alternatives with **different lifespans**. This is the
  correct method for that case, and the reason the method exists.
- **Inputs:** initial cost P (currency at t = 0); annual operating cost AOC (currency
  per year); salvage S (currency at end of life); life N (years); rate i (decimal per
  year).
- **Formula:**
  `EAC = P*(A/P, i, N) - S*(A/F, i, N) + AOC`
  where the capital recovery factor `(A/P, i, N) = i*(1 + i)^N / [(1 + i)^N - 1]`
  and the sinking fund factor `(A/F, i, N) = i / [(1 + i)^N - 1]`.
  Equivalently `EAC = (P - S)*(A/P, i, N) + S*i + AOC`, and in general
  `AW = PW * (A/P, i, N)`.
- **Output shape:** one computation block per alternative, then a comparison table:
  alternative | N (years) | EAC (currency per year) | rank. **SENSITIVITY is
  mandatory:** vary i and the salvage S, and report the EAC gap between the top two
  alternatives. If the gap is inside the noise of the inputs, say the alternatives are
  indistinguishable rather than declaring a winner by the third decimal.
- **Traps:** comparing a 5-year asset and a 12-year asset by total cost, or by present
  worth over mismatched horizons - this is the single most common engineering economy
  error, and EAC exists precisely to correct it; dropping the salvage term; using the
  A/P factor where A/F belongs (they differ by exactly i, so the mistake is small
  enough to survive a casual check and large enough to flip a close decision);
  assuming the asset is replaced identically forever (EAC's implicit assumption - if
  the technology or price will change, say so in ASSUMPTIONS); comparing an EAC
  against a PW.
- **Volatility:** LOW (mathematics); the rate i is an input, and if sourced from a
  policy or market rate it is HIGH: fetch and cite.

## Rate of return (ROR / IRR)

- **When:** the decision is stated as a percentage hurdle ("we need better than 15
  percent"), or a sponsor demands a return figure.
- **Inputs:** the signed cash flow series (currency per period); MARR, the minimum
  acceptable rate of return (decimal per period).
- **Formula:** i* is the rate solving `sum over t=0..N of A_t / (1 + i*)^t = 0`.
  Decision rule: accept when `i* >= MARR`. For mutually exclusive alternatives, rank
  by **incremental** analysis: order by increasing investment, then compute the
  incremental ROR on each defender-to-challenger difference and accept the challenger
  only when its incremental ROR >= MARR.
- **Output shape:** a computation block showing the trial rates and the interpolation
  or solver result, RESULT as a percentage per period, plus the MARR comparison.
  **SENSITIVITY is mandatory:** report how i* moves under +/-20 percent on the
  largest cash flow, and state whether the accept/reject verdict survives.
- **Traps:** multiple roots - a series with more than one sign change can have more
  than one i*, and then the bare IRR is meaningless (check the sign changes first;
  fall back to PW at the MARR, which always has a single unambiguous answer);
  ranking mutually exclusive alternatives by their standalone IRR, which reliably
  picks the small project (the high-percentage-on-a-tiny-base fallacy) and is exactly
  what incremental analysis prevents; the reinvestment assumption baked into IRR
  (intermediate cash is assumed to earn i*, which is optimistic when i* is high - use
  the modified rate of return when this bites); an IRR quoted with no horizon.
- **Volatility:** LOW (mathematics); MARR is a supplied input.

## Benefit-cost ratio (BCR)

- **When:** public-sector or grant-funded projects, where the test is whether the
  benefits to the public justify the cost to the sponsor.
- **Inputs:** benefits B (currency, to the public); disbenefits D (currency, negative
  consequences to the public); initial investment I (currency); operating and
  maintenance cost M&O (currency per year); salvage S (currency); rate i (decimal);
  horizon N (years). Every term must be converted to the **same** equivalence basis:
  all PW, or all AW. Never a mix.
- **Formula:**
  Conventional: `B/C = (B - D) / (I + M&O - S)`
  Modified: `B/C = (B - D - M&O) / (I - S)`
  Decision rule: accept when `B/C >= 1.0`. The two forms give different magnitudes but
  the same accept/reject verdict. For mutually exclusive alternatives, use the
  **incremental** B/C on the ordered differences, exactly as with ROR.
- **Output shape:** a computation block per alternative with the equivalence basis
  stated explicitly, plus the ratio and the verdict. **SENSITIVITY is mandatory:**
  public benefit figures are the softest number in the whole calculation, so show the
  ratio at the low, central, and high benefit estimates, and name the benefit value at
  which B/C crosses 1.0.
- **Traps:** mixing PW terms into an AW denominator, which silently produces a
  meaningless ratio; sliding a disbenefit into the denominator as a cost (it belongs
  in the numerator, subtracted from benefits - the ratio changes, and someone will
  choose the placement that gets the project approved); ranking alternatives by
  standalone B/C instead of incrementally; monetized benefits with no stated basis,
  which is where the fabrication risk lives - an unsourced benefit figure is
  `DATA UNAVAILABLE`, not an assumption.
- **Volatility:** LOW (mathematics); benefit valuations and the social discount rate
  are external inputs, and any officially mandated discount rate is HIGH: fetch and
  cite.

## Work study and time standards

- **When:** setting a labour standard, costing a job, sizing a crew, or balancing a
  line.
- **Inputs:** observed time OT (minutes per cycle, averaged over n timed cycles);
  rating factor RF (decimal, where 1.00 = the pace of a qualified worker at standard
  effort; 1.10 = 10 percent faster than standard); allowance fraction A (decimal:
  personal, fatigue, and unavoidable delay); number of cycles observed n.
- **Formula:**
  `Normal time NT = OT x RF`
  `Standard time ST = NT x (1 + A)`
  Cycles needed for a target precision:
  `n = (z * s / (k * mean))^2`, where s = sample standard deviation of the observed
  times (minutes), k = allowed error as a fraction of the mean, z = the normal
  deviate for the confidence level.
- **Output shape:** a computation block per element: observed times (list, minutes),
  mean OT, RF with the rater's justification, NT, A with its breakdown by category,
  ST in minutes per unit, and the derived capacity in units per hour. **SENSITIVITY
  is mandatory** because this number sets pay, cost, and headcount: show ST at
  RF +/- 0.05 and at A +/- 5 percentage points.
- **Traps:** the two allowance conventions - the formula above puts the allowance on
  the **work time** basis (`ST = NT x (1 + A)`); when the allowance is instead defined
  as a fraction of the **total shift time**, the correct expression is
  `ST = NT / (1 - A)`, which yields a larger standard. State which basis is in use,
  because the two disagree, and the gap grows with A; rating a worker who knows they
  are being timed (the observed pace is not the normal pace); timing too few cycles
  and quoting the mean as if it were precise; a standard set on the best operator,
  which is unattainable by the crew and will be quietly ignored; applying a standard
  time built for one method after the method changed, which is the most common way a
  standard becomes a lie.
- **Volatility:** LOW

## System reliability (series and parallel)

- **When:** any availability, uptime, or safety claim about a system built from parts.
  This entry frequently feeds a safety case, so it carries the highest evidential bar
  in this pack.
- **Inputs:** component reliabilities R_i (dimensionless probability in [0, 1]) over a
  **stated mission time** t (hours), or failure rates lambda_i (failures per hour), or
  MTBF_i (hours). Independence of failures must be asserted explicitly.
- **Formula:**
  **Series** (every component must work for the system to work):
  `R_s = R1 x R2 x ... x Rn`
  Reliability **multiplies**, so a series system is **always less reliable than its
  weakest component**. Ten components at 0.99 give 0.99^10 = 0.904, not 0.99.
  **Parallel / active redundancy** (the system works if **at least one** works):
  `R_p = 1 - (1 - R1)(1 - R2) ... (1 - Rn)`
  That is: one minus the product of the failure probabilities. For n identical units,
  `R_p = 1 - (1 - R)^n`. Two units at 0.90 give 1 - (0.10)(0.10) = 0.99.
  **Exponential (constant hazard only):** `R(t) = e^(-lambda*t)`, with
  `lambda = 1 / MTBF`. For components in series, **failure rates add**:
  `lambda_s = sum of lambda_i`, so `MTBF_s = 1 / sum(lambda_i)`.
  **Availability:** `A = MTBF / (MTBF + MTTR)`.
- **Output shape:** a reliability block diagram (which parts are series, which are
  parallel), then a computation block with every R_i, the mission time in hours, the
  substitution shown, and the system R as a dimensionless probability at that mission
  time. **SENSITIVITY is mandatory:** re-run with each R_i degraded by a realistic
  margin, identify the component the system result is most sensitive to (in series
  that is always the weakest link), and state the result under the failure of the
  independence assumption.
- **Traps:** adding or averaging reliabilities in series instead of multiplying, which
  overstates the system every single time; writing the parallel case as
  `R = R1 + R2` (that exceeds 1.0 for any pair above 0.50 and is nonsense as a
  probability - the parallel formula is `1 - (1 - R1)(1 - R2)`, always); adding MTBFs
  for a series system (failure **rates** add, not MTBFs, and the two are reciprocals,
  so the error is not small); assuming independence when a shared power supply, a
  shared bus, a shared design defect, or a shared maintenance crew is a common-cause
  failure that defeats the redundancy on paper; forgetting that active redundancy
  needs a detector and a switch, and that the switch is itself a series component;
  applying `R = e^(-lambda*t)` in the wear-out region, where the hazard rate is not
  constant and the exponential model does not hold; quoting a reliability with no
  mission time (R is meaningless without the t it is measured over).
- **Volatility:** LOW (the mathematics). Component reliability data taken from a
  vendor or a standard is an input: fetch and cite it, never recall it.
