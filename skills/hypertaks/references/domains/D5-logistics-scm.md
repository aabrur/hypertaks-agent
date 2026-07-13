# D5 - Logistics and Supply Chain
Every entry: **when · inputs · formula · output shape · traps · volatility**

Read the Computation Shape Law in `references/frameworks.md` before applying anything
here. Naming a method obliges a computation block with substitution shown and a unit on
the result. A missing input stops the block: mark it `DATA UNAVAILABLE` and say what
would fill it. Never fabricate a number to complete the shape.

## Route by symptom

| The Boss says... | Go to |
|---|---|
| "we keep running out" | Safety Stock and Reorder Point -> Service level definitions |
| "we hold too much stock" | Inventory turnover / DIO -> ABC and XYZ -> Lot sizing rules |
| "how much should we order" | EOQ (bought) / EPQ (made) / Newsvendor (one shot) |
| "the plant is whipsawed" | Bullwhip Effect -> DRP |
| "we are short of cash" | Cash-to-Cash Cycle -> Inventory turnover |
| "our service is 95%" | Perfect Order Rate + Service level definitions (interrogate WHICH 95%) |
| "which supplier strategy" | Kraljic purchasing matrix |
| "component shortage again" | MRP logic -> BOM structure and explosion |
| "where do we put the warehouse" | Center of Gravity |
| "routing and truck cost" | Clarke-Wright Savings -> Load factor -> Freight cost per unit |
| "where is the problem at all" | The 7 Rights -> SCOR model |

## Unit conventions used throughout

Demand D is per YEAR unless the symbol is d_bar (per day). Holding cost H is per unit
per YEAR. Lead time L and all sigma_L are in DAYS. Mixing a per-day rate into a per-year
formula is the single most frequent arithmetic failure in this pack: convert first, then
substitute, and show the conversion in the computation block.

---

## The 7 Rights of logistics
- **When:** framing a logistics brief before any arithmetic, or diagnosing a service failure whose cause is not yet located. Use as the opening checklist that decides which of the later entries you actually need.
- **Inputs:** per order or per shipment - product (SKU), quantity (units), condition (pass/fail), place (destination code), time (delivery timestamp vs promised window), customer (correct consignee, yes/no), cost (currency per order vs target).
- **Formula:** `Delivery is correct IFF all 7 rights hold simultaneously (logical AND, never an average)`
- **Output shape:** 7-row checklist (right | measured value with unit | pass/fail | owning role) + the single failing right named as the diagnosis + a pointer to the quantitative entry that fixes it (late -> Safety Stock / ROP; wrong quantity -> MRP or lot sizing; wrong cost -> Freight cost per unit). SENSITIVITY: "right cost" is a money right, so state the cost per failed order in currency and the annual failure count - a right that fails cheaply and a right that fails expensively must not be ranked equally.
- **Traps:** the 7 Rights are a diagnostic frame, not a KPI. The moment you try to score them, you have built a Perfect Order Rate, so use that entry and its multiplication rule instead of averaging seven percentages. Practitioners also drop "right cost" and optimize the other six into a service level nobody is willing to pay for.
- **Volatility:** LOW

## SCOR model and its metric hierarchy
- **When:** the task needs a process map of the whole chain, a common vocabulary across functions, or a defensible KPI tree. Use it to decide WHERE a problem lives before choosing a formula.
- **Inputs:** process scope (plan, source, make, deliver, return), the five performance attributes (reliability, responsiveness, agility, cost, asset management), and one Level-1 metric per attribute with its unit.
- **Formula:** `Level 1 = strategic metric per attribute | Level 2 = process configuration | Level 3 = process element / diagnostic driver` and `Total cost to serve (%) = total supply chain cost (currency/yr) / revenue (currency/yr) x 100`
- **Output shape:** process table (plan | source | make | deliver | return) x (owner, Level-1 metric, current, target, gap) + a metric tree that drills the ONE failing Level-1 metric down to its Level-3 drivers. SENSITIVITY: a 1-point move in cost to serve, expressed in currency per year, so the gap is priced and not merely coloured red.
- **Traps:** reliability maps to Perfect Order Rate (multiplied), responsiveness to order fulfillment cycle time (days), agility to upside flexibility (days), cost to total cost to serve (%), asset management to cash-to-cash (days) - practitioners routinely put a cost metric under reliability and then wonder why the tree does not add up. SCOR is customer-facing and stops at the customer's customer; do not use it to model internal manufacturing detail. Benchmark percentiles quoted for SCOR metrics are subscription data: cite them, never recall them.
- **Volatility:** MEDIUM

## Kraljic purchasing matrix
- **When:** the task is procurement strategy across a category portfolio, and the question is which items deserve partnership versus which deserve a reverse auction.
- **Inputs:** per category - profit impact (annual spend in currency, % of total spend, or margin contribution %) and supply risk (number of qualified suppliers, lead time in days, substitutability, market scarcity), each scored 1-5 with the scoring rule written down.
- **Formula:** `Position = (profit impact score, supply risk score)` -> `Leverage = high impact, low risk | Strategic = high impact, high risk | Non-critical (routine) = low impact, low risk | Bottleneck = low impact, high risk`
- **Output shape:** 2x2 grid with every category plotted and its annual spend labelled + a strategy row per quadrant: Leverage -> tender, spot buy, exploit buying power, consolidate volume; Strategic -> long-term partnership, joint planning, dual-source, share forecasts; Bottleneck -> secure supply, safety stock, alternate specification, buy the risk down; Non-critical -> simplify, catalogue, automate, delegate. SENSITIVITY: show which categories move quadrant if the risk score shifts by +/-1, because those are the ones the strategy is fragile on.
- **Traps:** the axes get scored by gut feel and never written down, which makes the placement unarguable and therefore useless. Low spend does NOT mean low importance - a 50-cent bottleneck part stops the line exactly as hard as a strategic assembly. Leverage items get squeezed until the supplier exits and the item silently becomes a bottleneck. The matrix is a snapshot: it must be redrawn when the supply market changes, not annually out of habit.
- **Volatility:** LOW

## EOQ - Economic Order Quantity
- **When:** demand is roughly constant and known, replenishment is effectively instantaneous, and the trade is ordering cost against holding cost.
- **Inputs:** D = annual demand (units/yr); S = ordering or setup cost (currency/order); H = holding cost (currency/unit/yr); P = unit purchase price (currency/unit); i = holding rate (fraction of unit price per year, dimensionless).
- **Formula:** `Q* = sqrt(2DS/H)` ; `TC = (D/Q)S + (Q/2)H + PD` ; `orders per year = D/Q*` ; `cycle time = Q*/D (yr)`
- **Output shape:** computation block (inputs with units and sources, formula, substitution shown, result with unit) + total-cost table at Q*, 0.5Q*, and 2Q* to demonstrate flatness. SENSITIVITY: +/-20% on H and on S, showing the resulting Q* range and the (small) total-cost penalty.
- **Traps:** H is often quoted as a percentage of unit price, so convert first via `H = i x P` before substituting. EOQ is FLAT near the optimum - ordering 20% off Q* typically costs under 2% in total cost, so do not present false precision or round-trip a supplier over it. EOQ is INVALID under quantity discounts (run the discount comparison: evaluate TC at each price break's feasible quantity, not just at Q*). It is also invalid when replenishment is gradual - use EPQ.
- **Volatility:** LOW

## EPQ - Economic Production Quantity
- **When:** the lot is produced and consumed at the same time (in-house manufacturing, gradual replenishment) rather than arriving in one delivery. This is EOQ's manufacturing sibling.
- **Inputs:** D = annual demand (units/yr); d = demand rate (units/day); p = production rate (units/day), requires p > d; S = setup cost (currency/setup); H = holding cost (currency/unit/yr).
- **Formula:** `Q* = sqrt( 2DS / (H(1 - d/p)) )` ; `I_max = Q*(1 - d/p)` (units) ; `TC = (D/Q)S + (I_max/2)H` ; production run length = `Q*/p` (days)
- **Output shape:** computation block + inventory sawtooth described numerically (build-up phase, peak I_max, depletion phase) + the run schedule in days. SENSITIVITY: +/-20% on H and S, and the effect of p approaching d.
- **Traps:** EPQ differs from EOQ ONLY by the factor `(1 - d/p)`, which is always < 1, so EPQ's Q* is always LARGER than EOQ's and the average inventory is SMALLER - practitioners reverse this. Peak inventory is I_max, NOT Q*, because consumption happens during the build. d and p must be in the SAME time unit (both per day, or both per year) - mixing units per day with units per year is the most common arithmetic failure here. If p <= d the formula explodes; that is not a math error, it is capacity telling you the plant cannot meet demand.
- **Volatility:** LOW

## Safety Stock and Reorder Point
- **When:** demand and/or lead time are variable and a target service level must be held. Any conversation about stockouts starts here.
- **Inputs:** Z = service factor (dimensionless); d_bar = average demand (units/day); sigma_d = std deviation of daily demand (units/day); L = average lead time (days); sigma_L = std deviation of lead time (days).
- **Formula:** `sigma_dLT = sqrt( L x sigma_d^2 + d_bar^2 x sigma_L^2 )` ; `SS = Z x sigma_dLT` ; `ROP = d_bar x L + SS` . Z: 90% -> 1.28, 95% -> 1.65, 97.5% -> 1.96, 99% -> 2.33.
- **Output shape:** computation block + a service-level vs cost curve (rows: 90 / 95 / 97.5 / 99% -> Z, SS in units, SS carrying cost = SS x H in currency/yr) so the Boss buys the service level knowingly. SENSITIVITY: mandatory - show SS at sigma_L and at sigma_L +/- 50%, because lead-time variance is the input least likely to be measured honestly.
- **Traps:** the most common error is ignoring sigma_L; lead-time variability usually DOMINATES demand variability, and the `d_bar^2 x sigma_L^2` term is where it enters. Never use `SS = Z x sigma_d x sqrt(L)` unless lead time is genuinely constant - and say which of the two you assumed. Units must agree: if sigma_d is per day, L is in days. Z is NOT the service level - reporting "Z = 1.65 service" instead of "95%" is a category error. Z assumes normally distributed demand; for slow movers with lumpy demand the normal assumption fails and the number is decoration.
- **Volatility:** LOW

## Service level definitions - cycle service level vs fill rate
- **When:** anyone in the room says "our service level is 95%". Establish WHICH 95% before any inventory number is trusted. These are two different numbers and conflating them is the classic error of this domain.
- **Inputs:** Q = order quantity (units); sigma_dLT = std deviation of demand over lead time (units); z = service factor (dimensionless); G(z) = standard normal loss function (dimensionless).
- **Formula:** `CSL (cycle service level) = P(no stockout during a replenishment cycle)` = the probability the cycle survives. `Fill rate (unit fill rate, beta) = fraction of demand satisfied from stock on hand` = `1 - ESC/Q`, where expected shortage per cycle `ESC = sigma_dLT x G(z)` and `G(z) = phi(z) - z x (1 - Phi(z))` with phi = standard normal density, Phi = standard normal CDF.
- **Output shape:** computation block for BOTH numbers side by side + a two-column table (z | CSL % | fill rate %) making the gap visible. SENSITIVITY: show fill rate at Q and at Q/2, because fill rate depends on order size while CSL does not.
- **Traps:** CSL is a per-CYCLE probability, fill rate is a per-UNIT fraction, and fill rate is almost always the HIGHER number - a 90% CSL routinely delivers 98%+ fill rate at a normal order size. Customers experience fill rate; finance funds CSL. Setting safety stock from a fill-rate target using a CSL Z-table over-stocks, sometimes badly. Increasing Q raises the fill rate with NO extra safety stock, which is the cheapest service lever in the toolbox and the one everyone forgets. Item fill rate is also not order fill rate: an order of 10 lines with one line short is 90% item fill and 0% order fill.
- **Volatility:** LOW

## Newsvendor (single-period stocking)
- **When:** one ordering decision, perishable or one-shot demand, no second replenishment (fashion, fresh produce, event stock, print runs, seasonal goods).
- **Inputs:** Cu = underage cost per unit short (currency/unit, typically margin lost); Co = overage cost per unit left over (currency/unit, typically cost minus salvage); demand distribution (mean mu in units, sigma in units, or an empirical distribution).
- **Formula:** `critical ratio CR = Cu / (Cu + Co)` -> order at the CR-th percentile of the demand distribution: `Q* = mu + z_CR x sigma` for normal demand, where `z_CR = Phi^-1(CR)`
- **Output shape:** computation block + expected profit at 3 order quantities (Q*, a conservative Q, an aggressive Q) so the asymmetry is visible. SENSITIVITY: mandatory - Cu and Co are estimates, so show Q* across a plausible range of each, and state the salvage value assumed.
- **Traps:** Cu is the LOST MARGIN, not the selling price, and Co is cost MINUS salvage, not full cost - getting either wrong moves the critical ratio and therefore the order. Goodwill or stockout-reputation cost belongs in Cu; omitting it silently biases you toward under-ordering. A CR above 0.5 means order ABOVE the mean, which practitioners resist emotionally. Empirical demand data beats a fitted normal for lumpy or skewed items - use the actual percentile.
- **Volatility:** LOW

## ABC and XYZ analysis (and the ABC-XYZ matrix)
- **When:** the SKU count is too large to manage item by item and control policy must be differentiated. This is the routing step before you spend safety-stock or counting effort on anything.
- **Inputs:** per SKU - annual usage value `AUV_i = D_i (units/yr) x c_i (currency/unit)`; demand history per period for variability; CV = coefficient of variation (dimensionless).
- **Formula:** ABC: rank SKUs by AUV descending, take cumulative % of total value -> `A ~ first 80% of value (often ~20% of SKUs), B ~ next 15%, C ~ last 5%`. XYZ: `CV = sigma_demand / mean_demand` -> `X = CV < 0.5 (stable), Y = 0.5 <= CV <= 1.0 (variable), Z = CV > 1.0 (erratic)`.
- **Output shape:** Pareto table (SKU | AUV in currency/yr | % of value | cumulative % | class) + the 3x3 ABC-XYZ matrix with a named policy per cell: AX -> tight continuous review, low safety stock, JIT candidate; AZ -> high value AND erratic, the hardest cell, needs forecasting effort and hedged safety stock; CX -> bulk buy, big lots, cheap to over-stock; CZ -> make-to-order or a simple min/max, do not forecast it. SENSITIVITY: the class boundaries are chosen, not given, so show how many SKUs and how much annual value (currency/yr) migrate class when the A cut-off moves from 80% to 70% and the X cut-off from CV 0.5 to 0.4 - if the policy set is stable across that move, the classification is safe to act on.
- **Traps:** the 80/15/5 and 0.5/1.0 cut-offs are CONVENTIONS, not laws - state the cut-offs you used and be willing to move them. ABC on unit price instead of annual usage value is wrong: a cheap fast mover can be an A item. Criticality is not value - a low-value item that stops the line is an A item by policy override, so run ABC then apply a criticality override list. ABC alone tells you nothing about forecastability, which is exactly why XYZ exists; using ABC on its own leads to over-stocking stable C items and under-stocking erratic A items.
- **Volatility:** LOW

## Inventory turnover and Days Inventory Outstanding
- **When:** benchmarking inventory efficiency, sizing the working-capital prize, or feeding the cash-to-cash calculation.
- **Inputs:** COGS = cost of goods sold (currency/yr); average inventory at COST (currency) = (beginning + ending)/2, or a 12-month average when seasonality is real.
- **Formula:** `turns = COGS / average inventory (times per year)` ; `DIO = 365 / turns (days)` ; equivalently `DIO = (average inventory / COGS) x 365`
- **Output shape:** computation block + a trend line across periods + a peer or internal benchmark. SENSITIVITY: mandatory - price the improvement: `cash released = (DIO_now - DIO_target) x daily COGS`, and state that a 12-month average inventory can move the answer materially versus a two-point average.
- **Traps:** the numerator must be COGS, NOT sales revenue - using revenue inflates turns by exactly the gross margin and is the most common inventory lie in a management pack. Both terms must be at cost: inventory at cost against COGS. A two-point average across a seasonal business is meaningless; take monthly points. High turns are not automatically good - they can be a stockout machine, so always read turns next to fill rate. Turns computed on a total-inventory blob hides the truth; compute per ABC class, where C-class dead stock usually lives.
- **Volatility:** LOW

## Cash-to-Cash Cycle
- **When:** the question is working capital, supply chain finance, or how much cash the chain is swallowing.
- **Inputs:** DIO = days inventory outstanding (days); DSO = days sales outstanding (days); DPO = days payable outstanding (days); daily COGS (currency/day).
- **Formula:** `C2C = DIO + DSO - DPO (days)` ; `working capital impact = delta C2C (days) x daily COGS (currency/day) = currency`
- **Output shape:** computation block + 3-component bar (DIO, DSO, DPO) + benchmark + the working-capital impact in currency. SENSITIVITY: mandatory - value one day of C2C in currency so every proposed intervention can be priced against it. Cross-link: hand this to the Supply Chain Finance role, because this is the number that justifies factoring, reverse factoring, and dynamic discounting.
- **Traps:** a negative C2C is a business model, not an error (the customer pays before the supplier does). Stretching DPO to flatter C2C pushes financing cost onto suppliers, who price it back into your unit cost - report the supplier-cost side effect or the number is a trick. DIO must be computed on COGS (see the turnover entry); mixing a revenue-based DIO into C2C corrupts the whole cycle.
- **Volatility:** LOW

## Perfect Order Rate
- **When:** a single customer-facing reliability KPI is needed, and whenever someone claims a service percentage without decomposing it.
- **Inputs:** four component rates as fractions (dimensionless): on-time delivery, complete (in full), damage-free, correct documentation. Each measured over the same order population and the same period.
- **Formula:** `POR = on-time x complete x damage-free x correct-documentation`
- **Output shape:** computation block + 4-component waterfall showing each multiplication step + the weakest component named as the intervention target. SENSITIVITY: show the POR gain from fixing the worst component by 5 points versus fixing the best by 5 points, which makes the leverage obvious.
- **Traps:** these components are MULTIPLIED, not averaged. Four 95% components give 0.95^4 = 81.5%, not 95%. This single error is the most common KPI lie in logistics reporting, and it always flatters. The four components must be measured on the SAME order set - four rates from four systems over four periods multiply into a fiction. "On-time" must be defined against the CUSTOMER's promised window, not the shipping team's revised one.
- **Volatility:** LOW

## Bullwhip Effect
- **When:** upstream order variance exceeds downstream demand variance, inventory swings echo through the chain, or the plant is whipsawed by a stable retail demand.
- **Inputs:** order variance per echelon (units^2, or CV per echelon, dimensionless); end-customer demand variance (units^2); lot sizes (units); promotion calendar; allocation rules.
- **Formula:** `amplification ratio at echelon k = Var(orders at k) / Var(end demand)` ; ratio > 1 at any echelon = bullwhip present
- **Output shape:** variance amplification table by echelon (retailer -> distributor -> manufacturer -> supplier, each with CV and ratio) + ranked cause list + exactly ONE intervention per cause. SENSITIVITY: estimate the inventory currency held to absorb the amplification, so the cure has a budget to argue against.
- **Traps:** the four causes are demand signal processing (forecasting on orders instead of end demand), order batching, price fluctuation (promotions and forward buying), and rationing or shortage gaming. Each has its own cure - information sharing and POS visibility, VMI and CPFR, EDLP, smaller and more frequent lots, allocation by past sales rather than by current orders - and applying the wrong cure to the right cause changes nothing. Bullwhip is a SYSTEM property: blaming the sales team's forecast when the true driver is a quarter-end discount is the standard misdiagnosis. Measure amplification with CV, not raw variance, when echelon volumes differ.
- **Volatility:** LOW

## MRP logic
- **When:** dependent demand - components whose need is DERIVED from a parent schedule, not forecast independently.
- **Inputs:** gross requirements per period (units); on-hand (units); scheduled receipts (units); lead time (periods); lot-size rule; BOM with quantity-per; low-level code per item.
- **Formula:** `Net requirement = Gross requirement - On-hand - Scheduled receipts` (floor at 0) ; then apply the lot-size rule ; then offset backwards by lead time -> `planned order release`
- **Output shape:** MRP grid per item, per BOM level: period x [gross requirements, scheduled receipts, projected on-hand, net requirement, planned order receipt, planned order release]. SENSITIVITY: show the planned-order schedule under two lot-size rules, because the rule, not the arithmetic, drives the cost.
- **Traps:** MRP must run LEVEL BY LEVEL (0 -> 1 -> 2 ...), because a level-1 planned order release IS the level-2 gross requirement - running items in alphabetical order produces a plausible, wrong grid. Use low-level coding when an item appears at two levels, or you will plan it twice. Lot sizing changes the answer materially: L4L vs EOQ vs POQ vs Wagner-Whitin give different releases from identical inputs. MRP assumes INFINITE capacity: a feasible-looking grid can be unbuildable, which is what capacity requirements planning exists to catch. Garbage BOM or garbage on-hand accuracy produces garbage releases with full confidence.
- **Volatility:** LOW

## BOM structure and explosion
- **When:** translating a parent production plan into component requirements, costing a product from its parts, or auditing why a component shortage appeared.
- **Inputs:** parent planned order release (units/period); quantity-per (units of child per unit of parent, dimensionless); scrap or yield loss s (fraction, dimensionless); BOM level and low-level code.
- **Formula:** `Gross requirement (child, period t) = SUM over all parents [ planned order release (parent, t) x quantity-per ] / (1 - s)` ; multi-level explosion applies this recursively down the levels ; `standard cost (parent) = SUM over children [ quantity-per x standard cost (child) ] + conversion cost`
- **Output shape:** indented BOM (level, item, quantity-per, unit of measure) + explosion table (item | quantity-per | parent quantity | gross requirement with unit) + total per-level roll-up. SENSITIVITY: since cost rolls up through this structure, show the parent-cost impact of a +/-10% move in the highest-value child.
- **Traps:** quantity-per is per ONE parent unit, not per order - multiplying by the order quantity twice is a real and expensive error. Scrap DIVIDES (`/(1-s)`), it does not multiply by `(1+s)`; the two agree only for small s and diverge exactly when scrap matters. A component used at two levels must share a low-level code or it gets planned twice. Phantom (transient) assemblies must be blown through, not stocked. Unit of measure changes across a level (each -> kg, kg -> m) are a silent, chronic source of order errors.
- **Volatility:** LOW

## Lot sizing rules compared
- **When:** an MRP or DRP net-requirement row exists and the question is how much to release per period. The rule, not the netting arithmetic, is what drives cost.
- **Inputs:** net requirement per period (units/period); S = setup or ordering cost (currency/order); H = holding cost (currency/unit/period); planning horizon (periods).
- **Formula:** L4L: `order = net requirement of that period` (zero holding, maximum setups). EOQ: `Q* = sqrt(2DS/H)` applied to a period-averaged D (ignores lumpiness). POQ: `P = round( Q*_EOQ / average net requirement per period )` periods of cover -> `order = sum of net requirements over the next P periods`. Wagner-Whitin: dynamic programme minimizing total setup + holding over the horizon; optimal for known, finite, deterministic demand, and it orders only when projected on-hand is 0, always covering a whole number of periods. Silver-Meal heuristic: extend the cover while `total relevant cost(T) / T` keeps falling.
- **Output shape:** side-by-side comparison table (rule | releases per period | number of setups | total setup cost | total holding cost | TOTAL cost, all in currency) over the same horizon. SENSITIVITY: mandatory - re-run the comparison at S x2 and H x2, because the winner flips on the S/H ratio, not on preference.
- **Traps:** L4L is not "lean", it is "maximum setups" - it wins only when S is genuinely near zero. EOQ applied to LUMPY dependent demand violates its own constant-demand assumption and is the standard misuse in an MRP grid. Wagner-Whitin is optimal only for the horizon you gave it; a rolling horizon degrades it, so a horizon-end effect must be checked. Never compare rules on setup count alone - compare on TOTAL cost with both terms shown.
- **Volatility:** LOW

## DRP - Distribution Requirements Planning
- **When:** finished goods must be time-phased ACROSS a distribution network (central DC -> regional DC -> branch), rather than exploded down a BOM. DRP is MRP's mirror: the network replaces the bill of materials.
- **Inputs:** per node - forecast demand per period (units); on-hand (units); in-transit / scheduled receipts (units); transit lead time (periods); safety stock (units); shipping lot size (units, often a full pallet or full truck).
- **Formula:** `Net requirement (node, t) = Forecast demand - On-hand - In-transit + Safety stock` (floor at 0) ; apply the shipping lot rule ; offset backwards by transit lead time -> `planned shipment release` ; then `Gross requirement (supplying node, t) = SUM of planned shipment releases of all nodes it serves in t`
- **Output shape:** DRP grid per node (period x [forecast, in-transit, projected on-hand, net requirement, planned receipt, planned shipment release]) + the aggregation table showing how downstream releases become the central DC's gross requirements + the resulting master production schedule hand-off. SENSITIVITY: show the central-DC requirement profile under +/-10% forecast error at the branches, since branch error aggregates upward.
- **Traps:** DRP PULLS from actual downstream need; pushing central stock outward by allocation rule is a different (and bullwhip-generating) system, so do not label it DRP. Transit lead time is not order lead time - it excludes order processing and it varies by lane and by season. Aggregating branch forecasts upward without accounting for the risk-pooling effect over-states central safety stock. Full-truck shipping lots create lumpy upstream demand, which is a lot-sizing decision (see the lot sizing entry), not an act of nature.
- **Volatility:** LOW

## Center of Gravity (facility location)
- **When:** siting a warehouse, DC, or plant relative to demand or supply points, as the FIRST cut only.
- **Inputs:** per location i - dx_i, dy_i = coordinates (km, or degrees converted to a planar grid); V_i = volume or weight moved (tonnes/yr, units/yr, or shipments/yr); optionally R_i = transport rate (currency/tonne-km).
- **Formula:** `X* = SUM(dx_i x V_i) / SUM(V_i)` ; `Y* = SUM(dy_i x V_i) / SUM(V_i)` ; rate-weighted variant substitutes `V_i x R_i` for `V_i` in both numerator and denominator
- **Output shape:** computation block + candidate-site table (site | distance to X*,Y* in km | estimated annual transport cost in currency | land or rent cost | labour availability | total score). SENSITIVITY: mandatory - transport cost is money, so show total annual transport cost at the COG point versus at the 2 or 3 real candidate sites; if the spread is small, the decision is not a transport decision at all.
- **Traps:** COG is a STARTING POINT, never the answer - it ignores roads, rivers, rent, labour, zoning, and the fact that no warehouse can be built in the middle of a lake. It minimizes straight-line weighted distance, not road distance and not cost, unless you use the rate-weighted variant. Latitude/longitude are not a Cartesian plane; project them or accept the distortion knowingly. A single dominant-volume location will drag the COG on top of itself, which is a result, not an insight.
- **Volatility:** LOW

## Clarke-Wright Savings (VRP)
- **When:** many stops must be served from one depot by capacity-limited vehicles, and an exact VRP solve is not warranted.
- **Inputs:** d(0,i) = depot-to-stop distance (km); d(i,j) = stop-to-stop distance (km); q_i = demand per stop (units, kg, or m3); vehicle capacity (same unit as q_i); vehicle fixed cost (currency/trip) and variable cost (currency/km).
- **Formula:** `S(i,j) = d(0,i) + d(0,j) - d(i,j)` -> sort savings descending -> merge routes i and j if both stops are still route endpoints, they are on different routes, and the merged load <= capacity
- **Output shape:** savings matrix (top pairs) + final route list (sequence, stops, load, distance) + load factor per vehicle (%) + total distance and vehicle count BEFORE and AFTER. SENSITIVITY: distance converts to money, so price the saving: `saved distance (km) x variable cost (currency/km) + saved trips x fixed cost (currency/trip)`.
- **Traps:** savings can be negative (when d(i,j) exceeds the two depot legs), and those pairs must never be merged. Capacity must be checked at EVERY merge, not only at the end. Clarke-Wright is a HEURISTIC: it gives a good route set, not the optimum, so never present it as optimal. Straight-line distance under-states road distance by a factor that is route-specific (a detour index of roughly 1.2-1.4 is a common planning convention, not a law) - use a real road matrix when the money is real. Time windows and driver-hour limits are NOT in the model; a feasible savings route can be an illegal shift.
- **Volatility:** LOW

## Cross-docking and milk runs
- **When:** deciding the inbound or outbound flow design: hold nothing and re-sort in hours (cross-dock), or consolidate many small pickups into one loop (milk run), or ship direct.
- **Inputs:** number of suppliers or stops n; d_i = one-way depot-to-stop distance (km); route distance of the consolidated loop (km); F = fixed cost per trip (currency/trip); c = variable cost (currency/km); handling cost at the dock (currency/unit); inventory holding cost avoided (currency/unit/yr); demand stability (CV, dimensionless).
- **Formula:** milk run pays when `[ n x (F + 2 c d_i averaged) ] > [ F + c x route distance ]`, i.e. the saving is `F(n - 1) + c x (SUM of 2 d_i - route distance)` (currency/trip). Cross-dock pays when `handling + facility cost per unit < inventory holding cost avoided per unit + LTL-to-FTL freight saving per unit` (currency/unit).
- **Output shape:** cost-per-unit comparison table (direct | milk run | cross-dock) with every cost line named, plus the breakeven volume or breakeven stop count. SENSITIVITY: mandatory - this is a network capex-adjacent decision, so vary volume +/-30% and fuel/variable cost +/-20% and show where the ranking flips.
- **Traps:** cross-docking trades INVENTORY for SCHEDULING PRECISION - it requires stable, predictable, pre-sorted inbound and a reliable carrier, so applying it to erratic (Z-class) demand converts a warehouse problem into a truck-yard problem. It pays for high-turn, high-volume, or perishable goods; it does not pay for slow movers. Milk runs pay when suppliers or customers are many, small, and geographically clustered, and when LTL rates are punitive versus consolidation; they stop paying the moment the loop grows long enough that transit time breaks the delivery window. Both designs move cost from inventory into transport and coordination - if you only count the inventory saving, every design looks brilliant.
- **Volatility:** LOW

## Vehicle load factor and cube utilization
- **When:** freight cost per unit looks wrong, trucks look full but weigh little (or vice versa), or a mode/vehicle choice must be justified.
- **Inputs:** actual payload (kg) and maximum payload (kg); loaded volume (m3) and usable deck volume (m3); cargo density (kg/m3).
- **Formula:** `weight utilization = actual payload / maximum payload x 100 (%)` ; `cube utilization = loaded volume / usable deck volume x 100 (%)` ; `density breakpoint = maximum payload (kg) / usable deck volume (m3) = kg/m3` -> if cargo density > breakpoint the load WEIGHS OUT (weight binds); if cargo density < breakpoint the load CUBES OUT (volume binds)
- **Output shape:** computation block for both utilizations + the binding constraint named explicitly + a per-vehicle table (vehicle | max payload | deck volume | breakpoint density | this load's density | binds on). SENSITIVITY: freight is money, so show cost per unit at current utilization versus at 90% of the binding constraint - that gap is the prize.
- **Traps:** reporting one utilization figure without saying WHICH constraint binds is meaningless: a truck at 45% weight and 98% cube is FULL. Chasing weight utilization on a cube-out load buys nothing and can break the axle limit on the next load. Usable deck volume is not nominal deck volume - pallet footprints, stacking rules, and load bars destroy 10-20% of it, and non-stackable freight can destroy far more. Axle-load and gross-vehicle-weight limits are regulatory and vary by jurisdiction: treat any specific legal limit as HIGH volatility and fetch it, never recall it. Empty-return (deadhead) km silently halve the real utilization of the round trip - report round-trip utilization when backhaul is empty.
- **Volatility:** MEDIUM

## Freight cost per unit shipped
- **When:** comparing carriers, modes, lanes, or shipment sizes; setting a landed-cost or a delivered-price; or proving that a logistics initiative actually saved money.
- **Inputs:** linehaul cost (currency/shipment); fuel surcharge (currency or % of linehaul); accessorials - detention, lift-gate, waiting, re-delivery (currency/shipment); units delivered (units/shipment); shipped weight (kg); shipped volume (m3); lane distance (km).
- **Formula:** `freight cost per unit = (linehaul + fuel surcharge + accessorials) / units delivered (currency/unit)` ; companions: `cost per kg = total freight / shipped weight` ; `cost per m3 = total freight / shipped volume` ; `cost per tonne-km = total freight / (tonnes x km)` for cross-lane comparison
- **Output shape:** cost-build table (line item | currency | % of total) + the per-unit, per-kg, and per-tonne-km figures side by side + a lane or carrier comparison. SENSITIVITY: mandatory - fuel surcharge and accessorials are the volatile lines, so show cost per unit at surcharge +/-20% and with accessorials excluded, which exposes how much of the "rate" is not the rate.
- **Traps:** dividing by units ORDERED instead of units DELIVERED flatters every damaged or short shipment. Accessorials are where the money hides and where quoted rates lie; a cheap linehaul with detention charges is not cheap. Carriers bill on CHARGEABLE weight, which is the greater of actual and dimensional weight - that conversion and its air/sea/road divisors live in D7 (trade and customs), so cross-link rather than guessing the divisor. Freight cost per unit is not comparable across lanes of different length: normalize to cost per tonne-km first. Duty, tax, and customs charges are NOT freight - do not fold them in here, and remember they are HIGH volatility and must be fetched and cited, never recalled.
- **Volatility:** MEDIUM

---

## Cross-links out of this pack

- Working capital, factoring, reverse factoring, dynamic discounting -> **D8 business-finance** (C2C is the number that opens that conversation).
- Chargeable weight, dimensional-weight divisors, Incoterms, customs duty, landed cost -> **D7 trade-customs**. Every duty and tax rate there is HIGH volatility: `DATA UNAVAILABLE` until fetched and cited.
- Forecasting (exponential smoothing, Holt-Winters, MAD/MAPE/tracking signal), capacity, OEE, line balancing -> **D6 operations-quality**. MRP and DRP both consume a forecast they do not produce.
- Transportation problem (VAM, MODI), assignment (Hungarian), LP formulation of the network, queueing at the dock -> **D1 quant-core**.
- Building the MRP grid, the savings matrix, or the ABC Pareto in a spreadsheet or in pandas/PuLP/OR-Tools -> **D3 data-tools**.
