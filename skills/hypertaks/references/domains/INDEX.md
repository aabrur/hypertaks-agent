# Domain Pack Index - route by keyword, read at most 2 packs

The packs carry the arithmetic: formulas, symbols, units, traps, and a volatility
flag. They exist so that "Hypertaks computes EOQ" means a real number with the
substitution shown, not a formula name dropped into a paragraph.

**Read this file, not the packs.** It is small by design so a harness with no grep
can still route. Match the task's vocabulary against a row, then read **at most 2**
packs. On Standard or below read **at most 1**, and only if the task is genuinely
quantitative.

| Pack | Read when the task mentions... |
|---|---|
| **D1 quant-core** | mean, variance, t-test, ANOVA, chi-square, regression, R2, sample size, Slovin, Cronbach, MAD, MAPE, RMSE, tracking signal, optimization, derivative, Lagrange, matrix, LP, simplex, transportation, VAM, MODI, Hungarian, assignment, CPM, PERT, critical path, queue, M/M/1, Little's Law, EMV, EVPI, decision tree, Markov, Monte Carlo, game theory |
| **D2 economics** | elasticity, MR=MC, monopoly, break-even (micro), consumer surplus, GDP, multiplier, MPC, inflation, CPI, Phillips, IS-LM, Solow, exchange rate, BOP, policy rate, statistical agency series |
| **D3 data-tools** | Excel, XLOOKUP, INDEX MATCH, Power Query, DAX, Solver, NORM.S.INV, pandas, numpy, statsmodels, scikit-learn, PuLP, OR-Tools, SQL, window function, CTE, normalization, ERD, ACID, star schema, OLAP |
| **D4 research-method** | research design, hypothesis, population, sampling, purposive, SEM, PLS, validity, reliability, triangulation, qualitative coding, APA, thesis structure |
| **D5 logistics-scm** | 7 rights, center of gravity, SCOR, bullwhip, cash-to-cash, perfect order, Kraljic, EOQ, EPQ, ROP, safety stock, service level, newsvendor, ABC/XYZ, inventory turnover, MRP, BOM, lot sizing, DRP, cross-dock, milk run, VRP, savings algorithm, load factor |
| **D6 operations-quality** | productivity, capacity, utilization, takt time, line balancing, scheduling, SPT, EDD, Johnson, forecasting, exponential smoothing, Holt-Winters, TIMWOODS, 5S, VSM, OEE, kanban, SMED, PDCA, DMAIC, DPMO, Cp/Cpk, control chart, FMEA, RPN, depreciation, TCO, MTBF, MTTR, availability, RCM, ISO 55000 |
| **D7 trade-customs** | Incoterms, FOB, CIF, DDP, B/L, AWB, FIATA, L/C, LCL, FCL, CBM, chargeable weight, revenue ton, MTO, freight forwarder, NVOCC, customs broker, dangerous goods, IMDG, IATA, ULD, HS code, import duty, VAT on import, bonded zone, quarantine, WMS, TMS, RFID, last-mile, track and trace |
| **D8 business-finance** | NPV, IRR, payback, WACC, CAPM, DOL/DFL, DuPont, ROE, cash conversion cycle, CAR, NPL, LDR, NIM, BOPO, bank capital rules, ADDIE, Kirkpatrick, Balanced Scorecard, turnover rate, BMC, TAM/SAM/SOM, LTV/CAC, burn rate, runway, cap table |
| **D9 craft** | Big-O, data structure, SOLID, design pattern, SDLC, Scrum, typography, WCAG, Nielsen heuristics, grid, engineering economy, work study, reliability (series/parallel), BATNA, ZOPA, Eisenhower, Pyramid Principle, SBI |

## Cost discipline

Each pack is a few hundred lines. Reading 2 packs is roughly a **Prime-tier expense**
(`references/token-discipline.md` §1). Reading all nine because the task "sounds
quantitative" is context pollution, and it is a named waste pattern.

## The three laws every pack obeys

1. **Computation Shape Law** (`references/frameworks.md`). Naming a method obliges a
   computation block: inputs with sources and units, formula, **substitution shown**,
   result **with a unit**, assumptions. A result without a unit is not a result. A
   result without substitution is not computed.

2. **Missing input stops the block.** Mark it `DATA UNAVAILABLE` and say what would
   fill it. Never invent a plausible number to complete the shape. The arithmetic
   around a fabricated input still checks out, which is exactly what makes it
   dangerous: it arrives wearing the costume of a verified result.

3. **Volatility flag decides whether memory is allowed.**
   - `LOW` - mathematical or definitional. Stable. Recall is fine.
   - `MEDIUM` - revised occasionally (standard editions, library APIs). Recall, then
     say which version you assumed.
   - `HIGH` - **duty rates, tax rates, statutory thresholds, regulatory limits,
     policy rates.** These are `DATA UNAVAILABLE` **until fetched and cited**. Never
     from memory, at any tier, under any deadline. Structure is stable; numbers are
     not. A landed cost computed with a remembered tariff is a real invoice built on
     a guess.

If the harness cannot grep and cannot read the packs, equip from model knowledge and
**declare it** (`references/plugins-and-mcp.md` failure ladder). Never invent a
catalog entry: an invented formula is worse than an absent one.
