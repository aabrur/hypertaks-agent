# D9 - Craft: Code, Design, Engineering Economy, Soft Skills
Every entry: **when · inputs · formula · output shape · traps · volatility**

Scope: the maker's arithmetic. Algorithms and structures (LOW volatility, recall is
fine), design and accessibility conventions (MEDIUM, editions move), engineering
economy and reliability (money and safety, so a SENSITIVITY line is mandatory), and
the soft-skill frames that decide whether the work is accepted.

---

## Big-O notation

- **When:** choosing between implementations, or explaining why something that ran in
  0.2 s on 1,000 rows takes 20 minutes on 100,000.
- **Inputs:** n = input size (units: elements/rows/nodes); the dominant repeated
  operation; whether the bound wanted is worst, average, or amortized.
- **Formula:** `T(n) = O(f(n))` means T(n) <= c*f(n) for all n >= n0, some constant
  c > 0. Divide and conquer: `T(n) = a*T(n/b) + f(n)` (Master theorem).
- **Growth ladder (memorize, do not re-derive):** O(1) < O(log n) < O(n) <
  O(n log n) < O(n^2) < O(n^3) < O(2^n) < O(n!).
- **Output shape:** a complexity table with one row per candidate approach, columns
  = time (best/avg/worst), extra space, stability or ordering guarantee, plus a
  one-line verdict tied to the actual n. State n. A complexity claim with no n behind
  it is decoration.
- **Traps:** treating Big-O as a speed measure (it hides constants: an O(n) scan of a
  contiguous array beats an O(log n) walk of a pointer-chasing tree at small n);
  quoting average when the SLA is set by worst case (hash map, quicksort); ignoring
  space (O(n) auxiliary memory can be the binding constraint); forgetting that
  amortized O(1) still has an O(n) individual call (dynamic array resize) which is
  fatal in a latency-critical path; adding complexities of nested loops instead of
  multiplying them.
- **Volatility:** LOW

## Core data structures

- **When:** the access pattern is known and the wrong container is the bottleneck.
  Pick by the operation performed most often, not by familiarity.
- **Inputs:** expected n (elements); read/write ratio; whether order matters; whether
  keys are hashable; memory budget (bytes).
- **Complexities (average, unless noted):**

| Structure | Access by index | Search | Insert | Delete | Space | Pick it when |
|---|---|---|---|---|---|---|
| Dynamic array | O(1) | O(n) | O(1) amortized at end, O(n) middle | O(n) middle | O(n) | Index access, cache locality, append-heavy |
| Linked list | O(n) | O(n) | O(1) at a held node | O(1) at a held node | O(n) | Splice-heavy with a held pointer; stable addresses |
| Hash map | n/a | O(1), worst O(n) | O(1) | O(1) | O(n) | Key lookup, no ordering needed |
| Balanced BST | O(log n) | O(log n) | O(log n) | O(log n) | O(n) | Ordered scan, range query, predecessor/successor |
| Binary heap | peek O(1) | O(n) | O(log n) | O(log n) pop-min | O(n) | Repeated "give me the smallest", scheduling, top-k |
| Graph (adj list) | n/a | BFS/DFS O(V+E) | O(1) add edge | O(deg) | O(V+E) | Relationships, paths, dependencies |

- **Output shape:** the table above, filtered to the candidates, with the chosen row
  marked and the dominant operation named (for example "lookup by order id, 50k
  entries, no range query -> hash map").
- **Traps:** a hash map for range queries or sorted output (it cannot do either;
  reach for a balanced BST or a sorted array); a linked list "because insertion is
  O(1)" while every insertion is preceded by an O(n) search for the node, so the real
  cost is O(n); worst-case O(n) hash collisions under adversarial keys (hash flooding
  is a denial-of-service vector, not a theory problem); a heap when full ordering is
  needed (a heap is only partially ordered - the root is the minimum, the rest is
  not sorted); adjacency matrix at O(V^2) space for a sparse graph.
- **Volatility:** LOW

## Sorting and searching complexity

- **When:** ordering data, or deciding whether to sort at all before searching.
- **Inputs:** n (elements); is the input nearly sorted; is stability required (equal
  keys keep input order); memory available for auxiliary space (bytes); key type
  (comparable only, or small integer range k).
- **Formula:** comparison-sort lower bound `Omega(n log n)`. Break it only by not
  comparing: counting sort `O(n + k)`, radix sort `O(d*(n + k))` for d digit passes.
- **Summary:**

| Algorithm | Best | Average | Worst | Space | Stable |
|---|---|---|---|---|---|
| Quicksort | O(n log n) | O(n log n) | O(n^2) | O(log n) | No |
| Mergesort | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes |
| Heapsort | O(n log n) | O(n log n) | O(n log n) | O(1) | No |
| Insertion sort | O(n) | O(n^2) | O(n^2) | O(1) | Yes |
| Binary search | O(1) | O(log n) | O(log n) | O(1) | requires sorted input |
| Linear search | O(1) | O(n) | O(n) | O(1) | no precondition |

- **Output shape:** the filtered table plus the decision line: how many searches will
  amortize the O(n log n) sort cost. Sorting to search once is a loss; sorting to
  search m times pays off once `m*log n < m*n / 2` in the crude case, so state m.
- **Traps:** binary search on unsorted input (returns a wrong answer silently, not an
  error); quicksort's O(n^2) worst case on already-sorted input with a naive pivot
  (use randomized or median-of-three pivots); assuming the language's built-in sort
  is stable when it is not; sorting a whole collection when a heap-based top-k in
  O(n log k) was the actual need; off-by-one in the binary search midpoint and the
  integer-overflow form `(lo + hi) / 2` (use `lo + (hi - lo) / 2`).
- **Volatility:** LOW

## SOLID principles

- **When:** reviewing or shaping object-oriented code that keeps breaking in the same
  place whenever a requirement changes.
- **Inputs:** the change history (which files are touched together), the class/module
  boundaries, the direction of the dependency arrows.
- **The five:**
  1. **S**ingle Responsibility - one reason to change. Test: name every actor that
     could demand a change to this class. More than one means split.
  2. **O**pen/Closed - open for extension, closed for modification. Adding a case
     should add a file, not edit a switch statement.
  3. **L**iskov Substitution - a subtype must be usable everywhere the base type is,
     with no surprise. A subclass that throws on an inherited method breaks it.
  4. **I**nterface Segregation - many small client-specific interfaces beat one fat
     one. No client should depend on methods it never calls.
  5. **D**ependency Inversion - high-level policy depends on an abstraction; the
     low-level detail also depends on that abstraction. The database is a plug-in to
     the business rules, never the other way around.
- **Output shape:** a violation table: principle | file:line | symptom observed |
  smallest fix. Never a lecture on the acronym.
- **Traps:** SRP used to justify anemic one-method classes (a "reason to change" is
  an actor or a business force, not a line of code); DIP performed as an interface
  with exactly one implementation, forever, which adds indirection and buys nothing;
  citing OCP to forbid ever editing a file; treating SOLID as a grading rubric rather
  than as a response to observed churn.
- **Volatility:** LOW

## Design patterns and the cargo-cult trap

- **When:** a recurring structural force is already visible in the code. The pattern
  is the answer to a force, never the starting point.
- **Inputs:** the force (what varies, what stays fixed), the change history, the cost
  of the indirection being proposed.
- **The load-bearing five:**
  - **Factory** - construction logic varies or is expensive; callers must not know
    the concrete class. Force: which class to build is a runtime decision.
  - **Strategy** - an algorithm must be swapped at runtime. Force: two or more real,
    coexisting algorithms.
  - **Observer** - one state change must notify many unknown listeners. Force: the
    publisher must not know the subscribers.
  - **Adapter** - two interfaces that must talk cannot be changed. Force: a third
    party owns one side.
  - **Repository** - domain code must not know the persistence mechanism. Force: a
    real intent to swap or to test the store in isolation.
- **Output shape:** pattern | the force that justifies it | what breaks without it |
  the indirection cost paid. If the "force" column is empty, do not apply the pattern.
- **Traps:** pattern-cargo-culting, the dominant failure here - a Strategy interface
  with exactly one strategy; a Factory that only ever calls `new`; a Repository
  wrapping an ORM that is already a repository, so every entity gets three files and
  zero new capability; an Observer chain that makes causality untraceable and leaks
  memory through listeners nobody unsubscribed; naming a class `AbstractManagerFactory`
  and calling that architecture. The pattern's name in a class name is not evidence
  the pattern applies.
- **Volatility:** LOW

## SDLC model selection

- **When:** committing to how a delivery will be phased and contracted.
- **Inputs:** requirement volatility (share of requirements expected to change,
  percent); cost of a late change (currency per change, or a scale); regulatory or
  contractual fixity; feedback latency (days to get a real user in front of it).
- **The models:**
  - **Waterfall** - sequential, phase-gated. Fits when requirements are frozen and
    verifiable up front, the cost of change late is enormous, and a contract or a
    regulator demands documented gates (civil works, avionics, tenders).
  - **V-model** - waterfall with each build phase paired to its verification phase.
    Fits safety-critical work where every requirement needs a traceable test.
  - **Iterative / incremental (spiral, unified process)** - repeated build-evaluate
    cycles, risk-driven. Fits large systems with known architecture but uncertain
    detail.
  - **Agile** - short cycles, working software as the progress measure, requirements
    discovered through feedback. Fits volatile requirements and cheap, fast feedback.
- **Output shape:** a selection table: model | requirement volatility it tolerates |
  cost-of-change assumption | gate/ceremony it imposes | verdict for this project,
  with the deciding factor named in one line.
- **Traps:** choosing agile where the cost of change is genuinely high and the
  requirement is legally fixed (a bridge does not get a sprint two); choosing
  waterfall where the requirement is a guess, which just defers the discovery of the
  guess to the most expensive moment; "agile" declared while gates, sign-offs, and a
  fixed scope-time-cost triangle are all retained, which is waterfall wearing a
  standup.
- **Volatility:** MEDIUM (method conventions and their published guides are revised;
  verify the current edition of any guide before quoting it as normative)

## Scrum shape and scrum-but failure modes

- **When:** running or repairing an agile delivery cadence.
- **Inputs:** team size (people, typically up to 10); sprint length (weeks, typically
  1-4); a real Product Owner with decision authority; a Definition of Done.
- **The shape:**
  - **Accountabilities:** Product Owner (owns the backlog and its ordering),
    Scrum Master (owns the effectiveness of the process), Developers (own the how and
    the increment).
  - **Events:** the Sprint (the container), Sprint Planning, Daily Scrum, Sprint
    Review, Sprint Retrospective.
  - **Artifacts and their commitments:** Product Backlog (Product Goal), Sprint
    Backlog (Sprint Goal), Increment (Definition of Done).
- **Output shape:** a diagnosis table: element | present as designed? | observed
  deviation | the failure mode it produces | correction. Plus a named verdict:
  functioning, or scrum-but.
- **Traps (the scrum-but catalog):** a proxy Product Owner with no authority, so
  every decision escalates and the sprint stalls; the Daily Scrum turned into a
  status report delivered to a manager instead of a re-plan among developers; scope
  injected mid-sprint, which destroys the Sprint Goal and the ability to forecast;
  velocity used as a cross-team productivity KPI, which guarantees estimate inflation
  and nothing else; a retrospective with no committed change, which trains the team
  that speaking up is theater; no Definition of Done, so "done" work accumulates a
  hidden tail of integration and test debt; the Scrum Master acting as a project
  manager assigning tasks; estimating in hours in order to build a Gantt chart behind
  the board.
- **Volatility:** MEDIUM (the guide has editions and the terminology shifts; verify
  the current edition before quoting roles or events as normative)

## Code review discipline

- **When:** every change that reaches a shared branch.
- **Inputs:** diff size (lines changed); review latency (hours from request to first
  response); the checklist; whether tests and a linter already ran.
- **Practice:** keep the diff small - review effectiveness falls off sharply on large
  changes, so target a few hundred changed lines and one hour of review at a sitting;
  the author annotates the diff before requesting review; the reviewer checks
  correctness, design, tests, naming, and security, in that order; formatting and
  style are a linter's job, never a human's; mark comments as blocking or as a nit so
  the author knows what actually gates the merge.
- **Output shape:** review comments as a table: file:line | severity (blocking / nit)
  | the defect | the suggested fix. Plus one explicit verdict line: approve, approve
  with nits, or request changes.
- **Traps:** the rubber-stamp approval on a diff too large to have been read;
  bikeshedding over naming while a race condition passes untouched; style debates a
  linter should have settled before the human looked; latency (a review that takes
  three days makes the author context-switch away, and the cost of the change
  compounds); reviewing only the added lines and never asking what the change failed
  to update; treating review as a status hierarchy rather than as a defect filter.
- **Volatility:** LOW

## Typography scale and hierarchy

- **When:** setting text on any surface: a deck, a report, a landing page, a UI.
- **Inputs:** base font size (px or pt); scale ratio (dimensionless); measure (line
  length, characters per line); line height (dimensionless multiplier).
- **Formula:** modular scale `size_n = base x r^n`, where n is the step above or
  below the body size. Common ratios r: 1.125 (major second), 1.200 (minor third),
  1.250 (major third), 1.333 (perfect fourth), 1.500 (perfect fifth), 1.618 (golden).
- **Targets:** body text 16 px minimum on screen; measure 45-75 characters per line
  (about 66 is the comfort centre); body line height 1.4-1.6; headings tighter, near
  1.1-1.25 because their line length is short.
- **Output shape:** a type scale table: role (display / h1 / h2 / h3 / body / caption)
  | computed size with the unit | line height | weight | measure. Show the ratio and
  at least one substitution so the scale is reproducible (for example base 16 px,
  r = 1.250, h2 = 16 x 1.250^3 = 31.25 px, rounded to 31 px).
- **Traps:** more than three or four sizes on one surface, which destroys the
  hierarchy the sizes were meant to create; a measure over 75 characters, where the
  eye loses the line-return; using weight and size and colour and caps all at once on
  the same element, so nothing reads as more important than anything else; rounding
  the scale until adjacent steps are 2 px apart and therefore indistinguishable.
- **Volatility:** LOW

## WCAG contrast requirements

- **When:** any text or UI component rendered on a background, and always before
  shipping a colour palette.
- **Inputs:** foreground colour (sRGB); background colour (sRGB); text size (px or
  pt) and weight; the conformance level targeted (AA or AAA).
- **Formula:** `contrast ratio = (L1 + 0.05) / (L2 + 0.05)`, where L1 is the relative
  luminance of the lighter colour and L2 that of the darker. Relative luminance
  `L = 0.2126*R + 0.7152*G + 0.0722*B`, where for each channel with c = channel/255:
  `c_lin = c/12.92 if c <= 0.03928, else ((c + 0.055)/1.055)^2.4`. The ratio runs
  from 1:1 (identical) to 21:1 (black on white).
- **Thresholds (stable across recent editions, but confirm against the current
  edition rather than trusting recall):**
  - AA, normal text: **4.5:1**
  - AA, large text: **3:1** (large = 18 pt / about 24 px, or 14 pt / about 18.7 px
    when bold)
  - AAA, normal text: **7:1**; AAA, large text: **4.5:1**
  - Non-text (UI component boundaries, icons, graphical objects carrying meaning):
    **3:1**
- **Output shape:** a computation block per colour pair: the two hex values, the two
  relative luminances, the substituted ratio, the threshold it is tested against, and
  PASS or FAIL. A palette-wide pass/fail matrix when more than one pair exists.
- **Traps:** eyeballing contrast (perception is not luminance; mid-tone greys fail
  constantly while looking fine to the designer who chose them); testing only the
  hero pairing and shipping a failing placeholder, disabled state, or hover state;
  forgetting non-text contrast, so a 1 px hairline input border fails at 1.4:1; text
  over a photograph or gradient, where the ratio changes per pixel and the worst
  region is the one that governs; assuming brand colours are exempt (they are not);
  quoting a threshold from memory without naming the edition and level.
- **Volatility:** MEDIUM (the standard has editions and success criteria are
  renumbered; verify the current edition before citing it as a compliance claim)

## Nielsen's 10 usability heuristics

- **When:** an expert (discount) evaluation of an interface, without users, before or
  instead of a costly usability test.
- **Inputs:** the interface (screens or a live build), 3-5 independent evaluators, a
  severity scale.
- **The ten:** (1) visibility of system status; (2) match between the system and the
  real world; (3) user control and freedom; (4) consistency and standards; (5) error
  prevention; (6) recognition rather than recall; (7) flexibility and efficiency of
  use; (8) aesthetic and minimalist design; (9) help users recognize, diagnose, and
  recover from errors; (10) help and documentation.
- **Output shape:** a findings table: heuristic violated | screen/element | what the
  user would experience | severity 0-4 (0 = not a problem, 4 = usability
  catastrophe, fix before release) | recommended fix. Sort by severity, never by
  heuristic number.
- **Traps:** one evaluator (a single pass finds only a fraction of the issues; the
  method assumes several independent evaluators whose findings are then merged);
  reporting a heuristic name as if it were the finding ("violates consistency") with
  no described user consequence; severity assigned by the person who has to fix it;
  treating a heuristic evaluation as a substitute for observing real users, which it
  is not - it is the cheap pre-filter that stops real sessions being wasted on
  obvious defects.
- **Volatility:** LOW

## Grid systems and layout

- **When:** laying out any fixed or responsive surface: page, slide, dashboard, app.
- **Inputs:** canvas width (px or mm); number of columns; gutter (px); outer margin
  (px); base spacing unit (px, commonly 4 or 8).
- **Formula:** `content width = n*column + (n - 1)*gutter`, so
  `column = (canvas - 2*margin - (n - 1)*gutter) / n`. All spacing values are
  multiples of the base unit.
- **Output shape:** a grid spec with the substitution shown (for example: canvas
  1,440 px, margin 96 px, 12 columns, gutter 24 px -> column = (1,440 - 192 - 264)/12
  = 82 px), plus a placement map naming which element spans which columns at each
  breakpoint.
- **Traps:** choosing a column count that does not divide cleanly (12 is the default
  because it splits into 2, 3, 4, and 6; 10 cannot give thirds); a grid declared and
  then broken by ad-hoc pixel nudges, which is the same as having no grid; spacing
  values off the base unit (a 13 px gap among 8 px multiples reads as a mistake even
  when nobody can name why); ignoring the vertical rhythm entirely and grid-aligning
  only horizontally; a responsive grid whose breakpoints were chosen from device
  names rather than from where the content actually breaks.
- **Volatility:** LOW

## Visual hierarchy

- **When:** any surface where the viewer must be told what to look at first.
- **Inputs:** the ranked list of messages (rank 1 = the single thing that must land
  if nothing else does); the available differentiators; the viewing distance and
  duration (seconds).
- **The levers, in descending strength:** position (top-left in a left-to-right
  reading culture, or the optical centre), size, weight, colour and contrast,
  whitespace (isolation promotes an element more reliably than enlarging it), and
  alignment/grouping.
- **Output shape:** a hierarchy map: rank | element | the lever(s) used to elevate it
  | the squint-test result (blur the surface: the rank-1 element must still be the
  first thing that emerges). Levels beyond three or four are not a hierarchy.
- **Traps:** promoting everything, which promotes nothing (three "primary" buttons is
  zero primary buttons); using colour as the only differentiator, which fails for
  colour-blind viewers and in greyscale print; decorative contrast that competes with
  the message; hierarchy asserted in a spec and never checked by squinting at the
  real render at the real size.
- **Volatility:** LOW

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

## Negotiation: BATNA, ZOPA, reservation price, anchoring

- **When:** preparing for any negotiation, before any number is spoken.
- **Inputs:** your BATNA (best alternative to a negotiated agreement, valued in
  currency or in a comparable unit); your reservation price (the walk-away value);
  your estimate of the counterparty's BATNA and reservation price; your target.
- **Formula:** your reservation price is derived from your BATNA (roughly: the value
  of the BATNA, adjusted for the switching cost and the risk of not closing).
  `ZOPA = [seller's reservation price, buyer's reservation price]`, which exists only
  when `buyer's max >= seller's min`. Its width is
  `buyer's max - seller's min` (currency). No overlap means no deal, and the correct
  move is to leave, or to change the deal's shape until an overlap exists.
- **Output shape:** a preparation table: my BATNA | my reservation price | my target |
  their estimated BATNA | their estimated reservation price | the inferred ZOPA (with
  currency) | the opening anchor and its justification | the tradeable variables
  ranked by (value to me / cost to them).
- **Traps:** confusing the target with the reservation price, so the walk-away point
  drifts upward under pressure and the deal is signed below it; entering with no
  BATNA and calling optimism a strategy (leverage comes from the alternative, not
  from the argument - improving the BATNA is the only reliable way to gain power);
  negotiating against their anchor by inching away from it, which concedes its frame -
  counter-anchor instead, with a basis; an aggressive anchor with no defensible
  rationale, which costs credibility and can end the conversation; assuming a fixed
  pie and never trading across differently-valued issues, which is how a positive ZOPA
  ends in no deal.
- **Volatility:** LOW

## Eisenhower matrix

- **When:** a task list has outgrown the available hours and a triage rule is needed.
- **Inputs:** the task list; for each task an importance judgement (does it advance a
  stated goal) and an urgency judgement (is there a real deadline), plus its estimated
  effort (hours).
- **The quadrants:** Q1 urgent + important -> **do now**. Q2 not urgent + important ->
  **schedule** (this is the leverage quadrant; the work that prevents future Q1s
  lives here). Q3 urgent + not important -> **delegate**. Q4 neither -> **delete**.
- **Output shape:** a 2x2 grid with every task placed, each carrying its owner and its
  next date. Plus one honest line: the share of hours currently going to Q2. If that
  share is near zero, the system is in permanent firefighting and the matrix has
  diagnosed it.
- **Traps:** urgency treated as a proxy for importance, which is the exact confusion
  the matrix exists to break (a ringing phone is urgent and usually unimportant);
  every task rated important, because the rater is the person who created them; Q2
  perpetually deferred, since nothing forces it, which manufactures next month's Q1;
  delegating without transferring authority, so the Q3 task boomerangs; refusing to
  delete Q4, which leaves the list too long to act on.
- **Volatility:** LOW

## The Pyramid Principle

- **When:** any communication to a decision-maker: memo, deck, report, or a two-minute
  verbal update.
- **Inputs:** the question actually being asked; the answer; the supporting arguments;
  the evidence under each argument.
- **The structure:** **the answer first** (the governing thought), then the grouped
  supporting arguments beneath it, then the evidence beneath those. Every level
  **summarizes** the level below it. The groups at each level must be **MECE**:
  mutually exclusive (no overlap) and collectively exhaustive (nothing relevant left
  out). Introduce with **SCQA**: Situation, Complication, Question, Answer.
- **Output shape:** a tree. Root = the one-sentence answer. Level 2 = three to five
  MECE supporting arguments. Level 3 = the evidence for each. Then, and only then,
  linearize the tree into prose or slides. If the tree does not stand up, no amount of
  writing will save the document.
- **Traps:** narrating the process instead of the answer ("first we gathered the data,
  then we interviewed..."), which buries the conclusion where a busy reader will never
  reach it; supporting arguments that overlap, so the same point is counted twice and
  the reader senses padding; a group that is missing the obvious fourth item, which is
  the first thing an expert reader will notice and the fastest way to lose the room;
  a summary line that lists the topics below it instead of stating what they add up to
  ("three findings on churn" is a label, not a governing thought); more than five
  items in a group.
- **Volatility:** LOW

## SBI feedback model

- **When:** delivering feedback, praise or corrective, to a person.
- **Inputs:** a specific, recent, **observed** incident. Not a pattern, not a rumour,
  not an inference about intent.
- **The structure:** **Situation** (when and where, concretely) -> **Behavior** (what
  was observed, in terms a camera could have recorded) -> **Impact** (the effect on
  you, the team, or the work). Optionally close with an inquiry into intent, which
  turns a verdict into a conversation.
- **Output shape:** three named sentences, in order, then a pause for the other
  person. Written form: Situation | Behavior | Impact | (Intent inquiry) | the
  agreed next step.
- **Traps:** stating an inference as a behavior ("you were dismissive" is a judgement;
  "you interrupted the client twice before she finished" is a behavior, and only the
  second one is arguable against evidence); generalizing ("you always...", "you
  never..."), which invites a defence of the counterexample and buries the point;
  delayed feedback, where the situation is now too fuzzy to be recalled honestly by
  either party; the praise sandwich compressed so hard that the recipient hears only
  the bread and leaves the room believing everything is fine; delivering impact as a
  team consensus ("people feel...") instead of an owned observation, which makes it
  unanswerable and cowardly.
- **Volatility:** LOW
