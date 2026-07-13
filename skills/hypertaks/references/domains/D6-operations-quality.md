# D6 - Operations, Lean, Quality, Assets
Every entry: **when · inputs · formula · output shape · traps · volatility**

**Cross-cutting law of this pack - components MULTIPLY.** OEE, first-pass yield,
rolled throughput yield, and Perfect Order Rate (D5) are products, not averages.
Three components at 90% give 0.9 x 0.9 x 0.9 = **72.9%**, not 90%. Any report that
averages them is overstating the plant. State the product, then the weakest factor.

---

## Productivity (single-factor and multifactor)
- **When:** you must say whether the operation is getting more out of what it puts in, across periods or against a peer.
- **Inputs:** `Output` = units/period or Rp/period | `Input_labor` = labor-hours/period | `Input_i` = each resource, converted to one currency unit (Rp/period).
- **Formula:** `Single-factor = Output / Input_one` ; `Multifactor (MFP) = Output / (labor + material + energy + capital + other)` ; `Productivity growth % = (P_t - P_t-1) / P_t-1 x 100`
- **Output shape:** computation block (INPUTS with source and units -> FORMULA -> SUBSTITUTION SHOWN -> RESULT with unit -> ASSUMPTIONS), plus a 2-column table: single-factor vs multifactor for the same period, and the delta between them.
- **Traps:** reporting labor productivity as if it were total productivity - it rises whenever labor is swapped for capital, so it measures substitution, not improvement. Mixing nominal and real currency across periods (deflate first, or the number is inflation). Output measured in units when the product mix shifted; convert to a common denominator (standard hours or Rp).
- **Volatility:** LOW

## Capacity, utilization, efficiency
- **When:** an "we are at 100% capacity" claim needs auditing, or a capacity investment is on the table.
- **Inputs:** `Design capacity` = units/period (theoretical maximum under ideal conditions) | `Effective capacity` = units/period (design capacity minus structural allowances: changeovers, planned maintenance, breaks, product mix) | `Actual output` = units/period.
- **Formula:** `Utilization = Actual output / Design capacity` ; `Efficiency = Actual output / Effective capacity` ; `Expected output = Effective capacity x Efficiency`
- **Output shape:** computation block, plus a 3-row ladder (design -> effective -> actual) with the loss between each rung named and quantified in units/period.
- **Traps:** quoting efficiency (denominator = effective) as utilization (denominator = design) - efficiency always looks better, and this is the single most common way a plant flatters itself. Treating effective capacity as a fixed constant when it moves with product mix. Sizing a line to peak demand when the bottleneck sets the system capacity: the system's capacity is the bottleneck's capacity, not the average station's.
- **Volatility:** LOW

## Takt time
- **When:** you are pacing a process to actual customer demand rather than to what the machines can do.
- **Inputs:** `Available time` = seconds/shift (net working time after breaks and planned stops) | `Customer demand` = units/shift.
- **Formula:** `Takt = Available time / Customer demand`  [seconds per unit]
- **Output shape:** computation block, plus a comparison line: takt vs current cycle time, and the verdict (cycle time > takt = the line cannot meet demand; cycle time << takt = overproduction).
- **Traps:** putting gross shift time in the numerator instead of net available time (breaks, meetings, planned maintenance are not available). Recomputing takt daily against a noisy demand signal - takt should be reset on a demand plan, not on yesterday's orders. Takt is a demand fact, not a performance target: you cannot "improve" takt, only the cycle time that must fit inside it.
- **Volatility:** LOW

## Cycle time vs lead time vs throughput time
- **When:** somebody says "our time is 3 days" and it is unclear which clock is running.
- **Inputs:** `Cycle time` = time between two successive units leaving the process (sec/unit) | `Throughput (flow) time` = time one unit spends inside the process, start to finish (hours) | `Lead time` = customer-order receipt to delivery (days), which contains queue and wait time.
- **Formula:** `Throughput time = WIP / Throughput rate` (Little's Law) ; `Line cycle time = max(station time)` ; `Lead time = order processing + queue + throughput time + delivery`
- **Output shape:** computation block for each of the three clocks, side by side, with the same unit basis, plus a one-line statement of which clock the customer actually feels.
- **Traps:** improving cycle time and telling the customer their lead time improved - if the unit then waits 6 days in a finished-goods queue, the customer feels nothing. Ignoring Little's Law: cutting WIP cuts flow time, and this is the cheapest lever most plants never pull. Calling the bottleneck station time the "cycle time" of a single unit; it is the interval between units, not the time to make one.
- **Volatility:** LOW

## Line balancing
- **When:** assigning tasks to stations on an assembly line so the work is evenly spread and paced to takt.
- **Inputs:** `t_i` = task times (seconds) with precedence relations | `Takt (or target cycle time) C` = seconds/unit | `N_actual` = stations actually used.
- **Formula:** `N_min = ceiling( SUM(t_i) / C )` ; `Efficiency = SUM(t_i) / (N_actual x C)` ; `Balance delay = 1 - Efficiency` ; `Idle time per cycle = (N_actual x C) - SUM(t_i)`
- **Output shape:** computation block, plus a station table (station | assigned tasks | station time (s) | idle (s)) and the bottleneck station flagged.
- **Traps:** forgetting `N_min` is a floor and must be rounded **up**, then reporting it as if it were achievable - precedence and zoning constraints usually make the real N larger. Balancing to the machine's fastest cycle instead of to takt, which builds a line that overproduces. Reporting efficiency against the achieved cycle time rather than the target takt, which hides the demand gap.
- **Volatility:** LOW

## Sequencing rules (SPT, EDD, FCFS, CR)
- **When:** n jobs queue at one work center and you must choose the order.
- **Inputs:** `p_j` = processing time of job j (hours) | `d_j` = due date (day) | arrival order | `Today` = current day.
- **Formula:** `Flow time F_j = completion time of j` ; `Average flow time = SUM(F_j) / n` ; `Lateness L_j = F_j - d_j` ; `Tardiness T_j = max(0, L_j)` ; `Critical ratio CR = (d_j - today) / work remaining`
- **Output shape:** computation block, plus one Gantt-style sequence table per rule (job | p_j | flow time | due date | tardiness) and a comparison row: average flow time, average tardiness, maximum tardiness, average number of jobs in system.
- **Traps:** SPT minimizes **average** flow time, average lateness, and average WIP - and it does so by starving long jobs, which can sit forever (job starvation). EDD minimizes **maximum** lateness, not average lateness, and not total tardiness. FCFS optimizes nothing except perceived fairness. CR < 1 means already behind. Picking a rule then reporting the metric it happens to win, without showing the metric it loses.
- **Volatility:** LOW

## Johnson's rule (2 machines, n jobs, flow shop)
- **When:** every job passes machine 1 then machine 2 in the same order, and you want the shortest makespan.
- **Inputs:** `p_1j` = time of job j on machine 1 (hours) | `p_2j` = time of job j on machine 2 (hours).
- **Formula:** procedure - (1) find the smallest unscheduled time across both machines; (2) if it is on machine 1, place that job in the **earliest** open slot; if on machine 2, place it in the **latest** open slot; (3) remove the job, repeat. `Makespan = completion time of the last job on machine 2`.
- **Output shape:** computation block showing each selection step, plus a two-row Gantt (M1 / M2) with idle gaps marked and the makespan stated in hours.
- **Traps:** applying it when the machine order differs by job - it is only valid for a 2-machine flow shop with a common route. Assuming it minimizes flow time or tardiness; it minimizes **makespan only**. Ignoring machine-1 idle at the start and machine-2 idle in the middle, which is where the real schedule loss lives.
- **Volatility:** LOW

## Moving average and weighted moving average
- **When:** demand is flat with noise and no trend or season, and you want a fast, defensible baseline.
- **Inputs:** `A_t` = actual demand in period t (units) | `n` = periods in the average | `w_i` = weights, `SUM(w_i) = 1`.
- **Formula:** `MA(n) F_t+1 = ( A_t + A_t-1 + ... + A_t-n+1 ) / n` ; `WMA F_t+1 = SUM( w_i x A_t-i+1 )`
- **Output shape:** computation block, plus an accuracy row: MAD, MAPE, bias (mean error), and the tracking signal - and a comparison against the naive forecast `F_t+1 = A_t`. A forecast that cannot beat naive is not a forecast.
- **Traps:** a moving average always **lags** a trend and will under-forecast a rising series every single period - the bias term will show it, so compute the bias. Weights that do not sum to 1 (the forecast is then scaled wrong). Large n smooths noise but buries a real level shift.
- **Volatility:** LOW

## Exponential smoothing (single)
- **When:** demand has a level with noise, no trend, and you want a one-parameter model with minimal data retention.
- **Inputs:** `A_t` = actual in period t (units) | `F_t` = forecast for period t (units) | `alpha` = smoothing constant, 0 < alpha < 1 (dimensionless).
- **Formula:** `F_t+1 = alpha x A_t + (1 - alpha) x F_t` ; equivalently `F_t+1 = F_t + alpha x (A_t - F_t)`
- **Output shape:** computation block, plus a sensitivity row on alpha (test at least alpha = 0.1 / 0.3 / 0.5 and report MAD or MSE for each), plus the tracking signal.
- **Traps:** it **cannot follow a trend** - on a trending series it lags permanently and the error is systematically one-sided; the tracking signal will drift past its control limits (commonly +/-4 MAD) and that is the signal to move to Holt. Choosing alpha by taste instead of by minimizing MSE on holdout data. Seeding `F_1` with a guess and never disclosing it (say what you seeded).
- **Volatility:** LOW

## Holt (trend) and Holt-Winters (trend + seasonality)
- **When:** the series trends (Holt), or trends and repeats a seasonal pattern of length s (Holt-Winters).
- **Inputs:** `A_t` = actual (units) | `L_t` = level (units) | `T_t` = trend (units/period) | `S_t` = seasonal factor (dimensionless, multiplicative) | `alpha, beta, gamma` = smoothing constants in (0,1) | `s` = season length (periods) | `m` = forecast horizon (periods).
- **Formula:** Holt - `L_t = alpha x A_t + (1 - alpha)(L_t-1 + T_t-1)` ; `T_t = beta (L_t - L_t-1) + (1 - beta) T_t-1` ; `F_t+m = L_t + m x T_t`. Holt-Winters multiplicative - `L_t = alpha x (A_t / S_t-s) + (1 - alpha)(L_t-1 + T_t-1)` ; `T_t = beta (L_t - L_t-1) + (1 - beta) T_t-1` ; `S_t = gamma (A_t / L_t) + (1 - gamma) S_t-s` ; `F_t+m = (L_t + m x T_t) x S_t-s+m`
- **Output shape:** computation block showing the level, trend, and seasonal updates for the last period explicitly, plus a forecast table for the horizon and a holdout accuracy row (MAPE and bias).
- **Traps:** initializing the seasonal factors from a single cycle - Holt-Winters needs at least 2 full seasons (2s periods) to initialize honestly, and more to be stable. Using the multiplicative form when a series contains zeros (division by `L_t` or by `S_t-s` explodes); use the additive form. Letting an unconstrained trend extrapolate a straight line 12 periods out - damp it. Fitting alpha, beta, and gamma on the same data you then report accuracy on.
- **Volatility:** LOW

## Seasonal index (classical decomposition)
- **When:** you must strip a repeating pattern out of demand before judging whether the underlying business grew.
- **Inputs:** `A_ij` = actual demand in season i of cycle j (units) | `s` = number of seasons per cycle.
- **Formula:** `Seasonal index SI_i = (average demand of season i) / (average demand of all seasons)` ; `Deseasonalized demand = A_i / SI_i` ; `Reseasonalized forecast = (trend forecast) x SI_i` ; the indices must satisfy `SUM(SI_i) = s`.
- **Output shape:** computation block, plus a seasonal-index table (season | mean | index | normalized index) with the sum-to-s check shown as an explicit line.
- **Traps:** not normalizing so the indices sum to s (they then quietly add or remove volume from the annual total). Computing the index on a trending series without detrending first, which loads the trend into the seasonal factor. Reading a December spike as demand when it is really a channel-stuffing or holiday-shipping artifact.
- **Volatility:** LOW

## The 8 wastes (TIMWOODS)
- **When:** walking a process to find non-value-adding activity before you optimize anything.
- **Inputs:** observed process steps | time per step (minutes) | classification of each step as value-added (VA), non-value-adding but necessary (NNVA), or waste.
- **Formula:** `Transport, Inventory, Motion, Waiting, Overproduction, Overprocessing, Defects, Skills (unused talent)` ; `Waste time % = SUM(waste step time) / total lead time x 100`
- **Output shape:** computation block for the waste-time percentage, plus a waste table (step | waste type | time (min) | Rp/year impact | proposed countermeasure).
- **Traps:** attacking the visible wastes (motion, transport) while overproduction - the waste that generates the others - runs untouched. Calling every queue "inventory waste" without asking whether it is buffering real variability, in which case removing it starves the line. Classifying inspection as value-added; the customer does not pay for you to check your own work.
- **Volatility:** LOW

## 5S
- **When:** the workplace itself is the constraint: things cannot be found, standards do not hold, abnormality is invisible.
- **Inputs:** area under audit | 5S audit score per S (0-5 scale) | search time before and after (minutes/shift).
- **Formula:** `Sort (remove what is not needed)` -> `Set in order (a place for everything)` -> `Shine (clean as inspection)` -> `Standardize (make the first three a written standard)` -> `Sustain (audit and hold)`
- **Output shape:** computation block for the recovered time (minutes/shift x shifts/year x Rp/hour), plus a radar or 5-row scorecard (S | score 0-5 | evidence | gap).
- **Traps:** treating 5S as a cleaning campaign - Shine is inspection, and its output is a list of leaks, cracks, and loose bolts, not a tidy floor. Skipping Sustain, which is why the fifth S is the only one that fails. Scoring a photo instead of a standard.
- **Volatility:** LOW

## Value Stream Mapping and process cycle efficiency
- **When:** you need the whole door-to-door flow, information and material, before choosing where to improve.
- **Inputs:** `VA time` = value-added processing time (minutes) | `Total lead time` = door-to-door elapsed time (minutes or days, converted to one unit) | inventory between steps (units) | `Throughput rate` (units/day).
- **Formula:** `Process cycle efficiency (PCE) = Value-added time / Total lead time x 100` ; queue time between steps via Little's Law: `Wait = WIP / Throughput rate`
- **Output shape:** computation block for PCE with both times in the **same unit**, plus the current-state timeline (VA bar / NVA bar per step) and a future-state target with the specific step that closes the gap.
- **Traps:** the classic unit error - VA in minutes, lead time in days, giving a PCE 1,440x too high; convert first. A PCE of 1-5% is normal, so a computed 60% almost always means wait time was omitted. Mapping the future state before anyone has walked the current state backwards from the customer.
- **Volatility:** LOW

## OEE (Overall Equipment Effectiveness)
- **When:** one asset or line is the constraint and you must decompose its loss into the three families.
- **Inputs:** `Planned production time` = minutes (scheduled time minus planned shutdowns) | `Run time` = planned production time - unplanned stop time (minutes) | `Ideal cycle time` = minutes/unit (the fastest sustained rate, from the nameplate) | `Total count` = units produced | `Good count` = units passing first time.
- **Formula:** `Availability = Run time / Planned production time` ; `Performance = (Ideal cycle time x Total count) / Run time` ; `Quality = Good count / Total count` ; **`OEE = Availability x Performance x Quality`**
- **Output shape:** computation block showing each of the three factors substituted separately, then the **product**, plus a six-big-losses table (breakdown, setup/adjustment, small stops, reduced speed, startup rejects, process defects) with minutes lost against each.
- **Traps:** **the multiplication trap - the three factors MULTIPLY, they do not average.** 90% x 90% x 90% = 72.9%, not 90%. An OEE reported as the mean of the three is a fabricated number, and it will be roughly 17 points too high at that level. Also: excluding a loss from planned production time to flatter Availability (an "unplanned" changeover moved into "planned" makes OEE rise while the plant makes nothing new). Setting ideal cycle time to the historical average rather than the nameplate best, which caps Performance at ~100% by construction. Performance above 100% is a data error, not a record. Quality must be **first-pass** yield: reworked units are not good units.
- **Volatility:** LOW

## Kanban card calculation
- **When:** sizing a pull system: how many cards, therefore how much WIP, the loop is allowed to hold.
- **Inputs:** `D` = demand rate (units/period) | `LT` = replenishment lead time (same period unit) | `safety` = safety factor (dimensionless, e.g. 0.20 for 20%) | `C` = container size (units/container).
- **Formula:** `N = ( D x LT x (1 + safety) ) / C`  [containers, round up]
- **Output shape:** computation block, plus the WIP cap implied by the answer (`N x C` = maximum units in the loop) and a sensitivity row on lead time (`LT +/-50%`, because LT is the least reliable input).
- **Traps:** D and LT in different time units - the arithmetic still works, and the answer is wrong by the ratio between them; this is the most common kanban error there is. Rounding down (the loop then starves). Treating the safety factor as a permanent right rather than as visible, deliberate debt: the whole point of kanban is that N is ratcheted **down** until a problem surfaces, then the problem is fixed. Adding cards to "fix" a stockout that was really a lead-time variability problem.
- **Volatility:** LOW

## SMED (Single-Minute Exchange of Die)
- **When:** changeover time is why batches are large, and large batches are why lead time and inventory are large.
- **Inputs:** `Setup time` = minutes (last good part to next good part) | element list with each element timed and classified internal (machine must be stopped) or external (can be done while running).
- **Formula:** stage 1 separate internal from external -> stage 2 **convert** internal to external -> stage 3 streamline what remains (parallel work, one-turn fasteners, no adjustment). `Setup reduction % = (T_before - T_after) / T_before x 100`. EOQ link: `Q* = sqrt(2 D S / H)` - cutting setup cost S by 75% cuts the economic batch by half (sqrt of 0.25 = 0.5).
- **Output shape:** computation block for the setup reduction, plus an element table (element | minutes | internal/external | after-conversion class) and the batch-size consequence computed, not asserted.
- **Traps:** buying a faster machine before separating internal from external work, which is the free half of the gain. Measuring setup from "tool down" instead of last good part to next good part, which hides the trial-and-adjust tail where most of the time actually is. Reducing setup and then not shrinking the batch - the entire economic benefit sits in the smaller batch, so if the batch does not move, nothing was gained.
- **Volatility:** LOW

## PDCA
- **When:** any improvement whose effect must be proved rather than claimed.
- **Inputs:** problem statement | baseline metric with unit | target with unit and date | countermeasure | verification method.
- **Formula:** `Plan (grasp the situation, set a target, find root cause) -> Do (run the countermeasure, small and reversible) -> Check (measure against the baseline) -> Act (standardize if it held, or re-enter Plan if it did not)`
- **Output shape:** computation block comparing baseline vs post-change metric in the same unit with the delta and its Rp/year value, plus a one-page A3 shape (background | current state | target | analysis | countermeasures | check | follow-up).
- **Traps:** skipping Check, which converts PDCA into a to-do list. Standardizing a change whose measured effect is inside the noise band of the process - run the control chart first, or you will lock in a coincidence. Setting a target with no unit and no date.
- **Volatility:** LOW

## DMAIC
- **When:** an existing process underperforms, the cause is unknown, and the effect must be statistically demonstrated.
- **Inputs:** `Y` = output metric with unit | `Xs` = candidate drivers | baseline capability (Cpk or sigma level) | target | measurement system.
- **Formula:** `Define (charter, CTQ, scope) -> Measure (validate the measurement system, baseline the capability) -> Analyze (find the vital few Xs with data, not opinion) -> Improve (change the Xs, verify with a designed test) -> Control (control plan, chart, handover)`
- **Output shape:** computation block for the baseline capability and the post-improvement capability (same formula, same sigma estimator), plus a tollgate table (phase | deliverable | decision | date).
- **Traps:** skipping the measurement system analysis in Measure - if gauge R&R eats 30% of the tolerance, every downstream conclusion is noise. Jumping to Improve with a favorite solution, then using Analyze to justify it. No Control phase, so the gain evaporates within two quarters and nobody notices because the chart was never installed.
- **Volatility:** LOW

## DPMO and sigma level
- **When:** comparing defect performance across processes with different complexity, or reporting a six-sigma baseline.
- **Inputs:** `Defects` = count | `Units` = count | `Opportunities` = defect opportunities per unit (count, defined once and frozen).
- **Formula:** `DPU = Defects / Units` ; `DPO = Defects / (Units x Opportunities)` ; `DPMO = DPO x 1,000,000` ; `Sigma level (long-term, 1.5-sigma shift convention) = 0.8406 + sqrt( 29.37 - 2.221 x ln(DPMO) )`
- **Output shape:** computation block, plus the anchor table: 2 sigma = 308,537 DPMO | 3 sigma = 66,807 | 4 sigma = 6,210 | 5 sigma = 233 | 6 sigma = 3.4 DPMO. State explicitly whether the 1.5-sigma shift is applied.
- **Traps:** inflating the opportunity count to lower DPMO - it is the one input nobody audits, and doubling opportunities halves DPMO with no change on the floor. Freeze and publish the opportunity definition or the metric is theatre. Comparing DPMO across sites that counted opportunities differently. Confusing defects with defectives: one unit can carry several defects, so DPU can exceed 1 while yield is not negative.
- **Volatility:** LOW

## Process capability: Cp and Cpk
- **When:** the process is in statistical control and you must state whether it can meet the specification.
- **Inputs:** `USL`, `LSL` = spec limits (in the characteristic's unit, e.g. mm) | `mu` = process mean (mm) | `sigma` = **within-subgroup** standard deviation (mm), estimated as `sigma = R-bar / d2`.
- **Formula:** `Cp = (USL - LSL) / (6 x sigma)` ; `Cpk = min[ (USL - mu) / (3 x sigma) , (mu - LSL) / (3 x sigma) ]` ; always `Cpk <= Cp`, with equality only when `mu` sits exactly at the midpoint. Long-term counterparts use overall sigma: `Pp`, `Ppk`.
- **Output shape:** computation block for Cp **and** Cpk, both substituted, plus the centering line: `k = |midpoint - mu| / ((USL - LSL)/2)` and `Cpk = Cp x (1 - k)`. Add a histogram-vs-spec sketch. Common gates: Cpk >= 1.33 capable, >= 1.67 for safety-critical characteristics.
- **Traps:** **Cp alone is a lie whenever the process is off-center.** Cp only measures whether the spread *could* fit inside the spec; it is blind to where the distribution actually sits. A process with Cp = 2.0 whose mean has drifted to the USL has Cpk near 0 and is producing scrap at half the output while the Cp report still says "world class". Always report both, and if only one number is allowed, report Cpk. Second trap: computing capability on an out-of-control process - capability is undefined until the chart is stable, because there is no single sigma to speak of. Third: using the overall standard deviation of all the data in the Cp/Cpk formula (that is Pp/Ppk) and labeling it Cpk. Fourth: capability on non-normal data without a transformation.
- **Volatility:** LOW

## Control charts (x-bar and R, p, c) and the Western Electric rules
- **When:** separating common-cause noise from special-cause signal, so you tamper only when there is something to tamper with.
- **Inputs:** `x-bar-bar` = grand mean | `R-bar` = mean subgroup range | `n` = subgroup size | `p-bar` = mean proportion defective | `c-bar` = mean defects per unit. Units follow the characteristic.
- **Formula:** x-bar chart - `UCL = x-bar-bar + A2 x R-bar` ; `LCL = x-bar-bar - A2 x R-bar`. R chart - `UCL = D4 x R-bar` ; `LCL = D3 x R-bar`. p-chart - `UCL/LCL = p-bar +/- 3 x sqrt( p-bar (1 - p-bar) / n )`. c-chart - `UCL/LCL = c-bar +/- 3 x sqrt(c-bar)`. Constants: n=2 (A2 1.880, D3 0, D4 3.267) | n=3 (1.023, 0, 2.574) | n=4 (0.729, 0, 2.282) | n=5 (0.577, 0, 2.114) | n=6 (0.483, 0, 2.004).
- **Output shape:** computation block for the limits (substituted with the constant for the stated n), plus the chart with center line and both limits, plus an out-of-control log applying the **Western Electric rules**: (1) one point beyond 3 sigma; (2) two of three consecutive points beyond 2 sigma on the same side; (3) four of five consecutive points beyond 1 sigma on the same side; (4) eight consecutive points on one side of the center line.
- **Traps:** drawing the **specification** limits on a control chart. Spec limits come from the customer; control limits come from the process. Putting them on the same chart is the single most destructive habit in SPC, because it invites reaction to points that are inside the spec but out of control (missed signal) and to points outside spec but in control (tampering, which adds variance). Second: negative LCL on a p-chart or c-chart - clamp it at 0, do not report a negative proportion. Third: recomputing limits every week so they chase the drift they exist to detect; freeze limits once the process is stable. Fourth: reading the x-bar chart while the R chart is out of control - the R chart must be stable first, or the x-bar limits are built on a moving sigma.
- **Volatility:** LOW

## FMEA and RPN
- **When:** a design or process must be risk-ranked before failure, especially where a failure has a safety consequence.
- **Inputs:** `S` = severity (1-10 ordinal) | `O` = occurrence likelihood (1-10 ordinal) | `D` = detection, where **10 means it will not be detected** (1-10 ordinal).
- **Formula:** `RPN = S x O x D` (range 1-1000) ; `Criticality = S x O` ; AIAG-VDA replaces the RPN ranking with an **Action Priority (AP)** lookup on the (S, O, D) triple, which respects severity dominance.
- **Output shape:** computation block per failure mode, plus the FMEA table (function | failure mode | effect | S | cause | O | current control | D | RPN | AP | action | owner | date | post-action S/O/D). **SENSITIVITY (safety):** show the RPN when each of S, O, D moves +/-2 ranks, because the ranks are judgments; and list every mode with S >= 9 regardless of RPN.
- **Traps:** **the standard criticism of RPN ranking - S, O, and D are ordinal ranks, so their product is not a ratio-scale number.** The same RPN arises from utterly different risks: S=10, O=1, D=1 gives RPN 10, and so does S=2, O=5, D=1. Ranking by RPN therefore buries a catastrophic-but-rare failure below a trivial-but-frequent one. The RPN scale is also full of holes (only 120 of the 1,000 values are attainable), so a "threshold of 100" is arbitrary. Rule: **severity 9-10 is actioned on severity alone, never on RPN.** Second trap: a detection rating that credits an inspection the operator does not actually perform. Third: an FMEA written once at launch and never touched, which is a document, not a control.
- **Volatility:** MEDIUM

## Depreciation (straight-line, declining balance, units of production, SYD)
- **When:** allocating an asset's cost across the periods that consume it, for costing, tax, or an asset-replacement case.
- **Inputs:** `C` = acquisition cost (Rp) | `S` = salvage value (Rp) | `N` = useful life (years) | `U_t` = units produced in period t | `U_total` = lifetime units | `BV_t-1` = book value at start of period (Rp).
- **Formula:** straight-line `D = (C - S) / N` ; declining balance `D_t = BV_t-1 x r`, with `r = k / N` (double-declining k = 2) and **salvage is NOT subtracted from the base**; stop when `BV = S` ; units of production `D_t = (C - S) x (U_t / U_total)` ; sum-of-years-digits `D_t = (C - S) x (remaining life at start of year t / SYD)` where `SYD = N (N + 1) / 2`.
- **Output shape:** computation block, plus the full schedule table (year | opening BV | depreciation | closing BV) for the chosen method. **SENSITIVITY (money):** re-run with useful life `N +/-20%` and salvage `S +/-30%`, and report the swing in annual depreciation (Rp/year) and in the resulting unit cost (Rp/unit).
- **Traps:** subtracting salvage from the declining-balance base (it is not, unlike every other method here) and then over-depreciating below salvage. Forgetting to stop declining balance at salvage, or forgetting the customary switch to straight-line in the final years. Treating the book depreciation schedule as the cash flow in an NPV: depreciation is non-cash, and it enters the NPV only through the tax shield (`depreciation x tax rate`). Using a tax-driven life for a make-or-buy decision that needs the economic life. Statutory rates and allowed lives are jurisdiction-specific - those are HIGH volatility and must be fetched, never recalled.
- **Volatility:** MEDIUM

## TCO and life-cycle cost
- **When:** comparing assets or suppliers whose purchase prices differ but whose running costs differ more.
- **Inputs:** `C_acq` = acquisition (Rp) | `C_op` = operating, energy, consumables (Rp/year) | `C_maint` = planned and corrective maintenance (Rp/year) | `C_down` = downtime cost (Rp/hour x expected hours/year) | `C_train` (Rp) | `C_disp` = disposal cost or salvage recovery (Rp, at year N) | `r` = discount rate (%/year) | `N` = life (years).
- **Formula:** `LCC (present value) = C_acq + SUM over t=1..N [ (C_op,t + C_maint,t + C_down,t) / (1 + r)^t ] + C_disp / (1 + r)^N` ; `Equivalent annual cost EAC = LCC x r / (1 - (1 + r)^-N)` [Rp/year] - use EAC when the options have **different lives**.
- **Output shape:** computation block, plus a side-by-side cost-element table per option and the crossover analysis (at what running-hours per year does the cheaper-to-buy option lose). **SENSITIVITY (money):** vary `r +/-2 points`, energy price `+/-30%`, and downtime hours `+/-50%`; report which option wins in each cell and state whether the ranking is stable or flips.
- **Traps:** comparing raw undiscounted totals across options with different lives, which systematically favors the short-lived cheap asset - use EAC. Omitting downtime cost, which is usually the largest term for a bottleneck asset and the only one nobody has an invoice for. Double-counting depreciation inside a cash-flow LCC (depreciation is an allocation of C_acq, not a cash outflow on top of it). Using the supplier's maintenance estimate as the input.
- **Volatility:** MEDIUM

## MTBF, MTTR, availability
- **When:** setting maintenance policy, sizing spares, or writing an uptime commitment.
- **Inputs:** `Total operating time` = hours (uptime only) | `Number of failures` = count | `Total repair time` = hours (including logistics delay if you say so) | `Number of repairs` = count.
- **Formula:** `MTBF = Total operating time / Number of failures` [hours] (repairable items; use **MTTF** for non-repairable) ; `MTTR = Total repair time / Number of repairs` [hours] ; **`Inherent availability A = MTBF / (MTBF + MTTR)`** [dimensionless] ; `Failure rate lambda = 1 / MTBF` [failures/hour] ; with a constant hazard rate, `Reliability R(t) = e^(-t / MTBF)`.
- **Output shape:** computation block for MTBF, MTTR, and A, each substituted, plus the annual downtime this implies in hours/year (`(1 - A) x 8,760`) and the Rp/year that downtime costs. **SENSITIVITY (money and safety):** MTTR `+/-50%` (spare-part availability is the usual swing factor), and state the downtime-hour and Rp consequence of each. Series systems: `A_system = A_1 x A_2 x ... x A_n` - **these MULTIPLY**, so five links at 99% give 95.1%, not 99%.
- **Traps:** MTBF is not a lifetime. An MTBF of 100,000 hours (11 years) on a part rated for 5 years of service does not mean the part lasts 11 years; it is a failure rate in the flat part of the curve, not a promise of longevity. Second: the `R(t) = e^(-t/MTBF)` form assumes a **constant** failure rate; it is invalid during infant mortality and wear-out, which is exactly where the interesting failures live. Third: quoting inherent availability (repair time only) as if it were operational availability, which must include logistics delay, waiting for a spare, and waiting for a technician - the gap between the two is often 3x. Fourth: averaging availability across a series system instead of multiplying.
- **Volatility:** LOW

## Reliability-Centred Maintenance (RCM)
- **When:** deciding **what** maintenance an asset should get, rather than doing more of what it already gets.
- **Inputs:** asset functions and performance standards | functional failures | failure modes | failure effects | consequence category | `P-F interval` = hours from detectable potential failure to functional failure.
- **Formula:** the seven questions - (1) functions and standards, (2) functional failures, (3) failure modes, (4) failure effects, (5) failure **consequences**, (6) proactive task, (7) default action if no proactive task is applicable. Consequences sort into hidden / safety and environmental / operational / non-operational. Task-interval rule: `Inspection interval <= P-F interval / 2` (so at least two chances to catch it). Reference standard: SAE JA1011.
- **Output shape:** computation block for the inspection interval from the P-F interval, plus the RCM decision table (function | functional failure | mode | effect | consequence class | task | interval | default action). **SENSITIVITY (safety):** for any mode with a safety or environmental consequence, show the interval at P-F `-50%` and adopt the shorter one; a safety consequence never accepts a "run to failure" default.
- **Traps:** applying RCM as a scheduled-overhaul generator. Most failure modes are **not** age-related, so a time-based overhaul on a random-failure mode adds infant-mortality risk and buys nothing - this is RCM's central empirical finding, and it is routinely ignored. Second: choosing an inspection interval equal to the P-F interval, which means half the failures are caught after they have already happened. Third: skipping the consequence question and prioritizing by failure frequency, which puts effort on cheap frequent failures and leaves the rare catastrophic one unmanaged. Fourth: forgetting hidden failures (a protective device whose failure is invisible until you need it) - these need failure-finding tasks, not condition monitoring.
- **Volatility:** MEDIUM

## ISO 55000 asset-management shape
- **When:** an organization must show that its asset decisions are systematic, auditable, and traceable to what the business is trying to achieve.
- **Inputs:** organizational objectives | asset portfolio and criticality register | SAMP | asset management objectives (measurable, with units) | asset management plans | performance and condition data.
- **Formula:** the family - **ISO 55000** (overview, principles, vocabulary), **ISO 55001** (requirements for an asset management system, the auditable one), **ISO 55002** (application guidance). The structural spine is the **line of sight**: `organizational objectives -> SAMP (Strategic Asset Management Plan) -> asset management objectives -> asset management plans -> life-cycle activities -> performance evaluation -> improvement`, all wrapped in Plan-Do-Check-Act. Four fundamentals: value, alignment, leadership, assurance.
- **Output shape:** a line-of-sight table (organizational objective | asset objective with unit and target | plan | asset | responsible | measure), plus a criticality-ranked asset register and the gap list against the 55001 clauses. **SENSITIVITY (money and safety):** for the top-decile critical assets, show the cost of the maintenance plan against the consequence of its failure (Rp and safety class), because that ratio is what the standard actually asks you to defend.
- **Traps:** certifying the **management system** and calling it asset management - 55001 audits whether you have a coherent system, not whether your assets are in good condition. Writing a SAMP that no asset plan traces back to, which breaks the line of sight and is the most common audit finding. Confusing an asset register (a list) with a criticality assessment (a ranking against consequence). Clause numbering and edition details are MEDIUM volatility: name the edition you are working against rather than reciting clause numbers from memory.
- **Volatility:** MEDIUM
