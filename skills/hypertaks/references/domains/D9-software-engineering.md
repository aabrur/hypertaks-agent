# D9 - Software Engineering & Architecture
Every entry: **when · inputs · formula · output shape · traps · volatility**


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
  search m times pays off once `n log n + m log n < m * n / 2` in the crude case, so state m.
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
