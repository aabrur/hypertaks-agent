# D7 - Trade, Freight, Customs, E-Logistics
Every entry: **when · inputs · formula · output shape · traps · volatility**

## Volatility protocol for this pack

This pack computes numbers that land on a real customs declaration. A wrong number here is a wrong tax bill, a penalty, or a seized shipment. This rule is not waivable, even under explicit pressure from the Boss to provide a rough estimate. Import charges are NEVER low-stakes.

1. **Never state an import duty rate, VAT/GST rate, withholding-tax rate, excise rate, or de-minimis threshold from memory. Do not estimate them, even if the Boss asks for a rough number or claims a tight deadline.** Every one is `DATA UNAVAILABLE` until fetched from an authoritative source and cited with a retrieval date.
2. **If a web/search/fetch tool is present**, fetch from the authoritative national source (customs authority, single-window portal, official tariff schedule). Cite the source and retrieval date.
3. **If no tool is present**, return the **formula skeleton with every rate as a named variable**, tell the Boss exactly which numbers to fill and explicitly name the **TYPE of source** to fetch them from (e.g., the national customs authority, the official tariff schedule, or the single-window portal), and **STOP**. Do not give a final estimated landed cost.
4. **Structure is stable; numbers are not.** The order of the charge stack and the base each charge is applied to is `volatility: LOW`. Every rate and threshold is `volatility: HIGH`.
5. **A landed-cost figure without a `source` column is not a deliverable.**

### The import charge skeleton (structure only)
Customs value (CIF) = Cost + Insurance + Freight
Import duty         = CIF x [duty_rate -> LOOKUP by HS code in the official tariff schedule]
Import VAT/GST      = (CIF + duty) x [vat_rate -> LOOKUP]
Withholding tax     = (CIF + duty) x [wht_rate -> LOOKUP]
Possible additions  : anti-dumping duty, safeguard duty, excise
TOTAL LANDED COST   = CIF + duty + VAT + WHT + handling + inland

**Output shape for any landed-cost question:** A table (charge | base | rate | amount | **source**). Every rate cell is either a cited lookup or `DATA UNAVAILABLE`.

---

## Incoterms (the eleven terms)
- **When:** Any cross-border sale to determine cost, risk, and customs responsibilities.
- **Inputs:** The term, named place, transport mode, edition assumed.
- **Formula:** None. This is a rule set.
- **Output shape:** 3-column table: Term | Risk transfers at | Cost transfers at | Insurance borne by.
- **Traps:**
  - **Risk transfer point is NOT the cost transfer point.** Under CIF/CIP, seller pays freight to destination, but **risk passes to the buyer** at shipment.
  - EXW and DDP put clearance duties on non-resident parties, making them often unworkable.
  - A term without a named place is unusable.
- **Volatility:** MEDIUM. Revised roughly every decade. State assumed edition.

## Chargeable weight (air) - actual vs volumetric
- **When:** Quoting or auditing air freight charges.
- **Inputs:** L, W, H per piece in **cm**; actual gross weight in **kg**; piece count; divisor.
- **Formula:** `volumetric kg = (L x W x H in cm) / air_divisor` (usually 6000). `chargeable weight = MAX(actual kg, volumetric kg)`.
- **Output shape:** A computation block showing both candidates and the winner.
- **Traps:**
  - Show both actual and volumetric candidates to maintain auditability.
  - Measure outer packed dimensions, not product dimensions.
- **Volatility:** LOW for method, MEDIUM for divisor (varies by carrier).

## Chargeable weight (sea LCL) - the W/M revenue ton
- **When:** Quoting less-than-container-load sea freight (W/M).
- **Inputs:** volume in **CBM**, gross weight in **tonnes**, rate per RT.
- **Formula:** `revenue ton (RT) = MAX(volume in CBM, weight in tonnes)`; `freight = RT x rate_per_RT`.
- **Output shape:** A computation block showing both candidates and the winner.
- **Traps:** LCL quotes contain fixed per-shipment charges that do not scale with RT. Volume includes pallets/packaging.
- **Volatility:** LOW for method, MEDIUM for equivalence rules and surcharges.

## Customs valuation basis (CIF vs FOB)
- **When:** Determining the base value before computing duty.
- **Inputs:** Invoice value, freight, insurance, importing country's declared basis.
- **Formula:** `customs value = Cost + Insurance + Freight` (CIF basis) or `customs value = Cost` (FOB basis). Additions/deductions via `LOOKUP`.
- **Output shape:** Valuation table: element | included? | amount | **source**.
- **Traps:** The importing country's law chooses the basis, NOT the invoice Incoterm.
- **Volatility:** LOW for method, HIGH for included elements per jurisdiction.

## HS code classification
- **When:** Always, before any duty figure exists. It dictates the tax bill.
- **Inputs:** Product material, function, processing stage, packing, full tariff line.
- **Formula:** None. chapter (2) -> heading (4) -> subheading (6) -> national tariff line (8+).
- **Output shape:** Classification block: considered codes | GRI applied | chosen code | cited tariff line | **source**.
- **Traps:**
  - A wrong HS code is a wrong tax bill.
  - GRIs must be applied **in order**.
  - Only the first 6 digits are internationally harmonized.
- **Volatility:** MEDIUM for structure/GRIs, HIGH for attached rates.

## Import declaration flow
- **When:** Planning clearance timelines or diagnosing delays.
- **Inputs:** Declaration, invoice, packing list, B/L or AWB, certificates, permits.
- **Formula:** None. Sequence.
- **Output shape:** Numbered flow of steps with responsible party and unlocking document.
- **Traps:** Physical arrival is not legal release. Missing other-agency permits are the commonest cause of stuck shipments.
- **Volatility:** LOW for general flow, HIGH for specific forms/deadlines.

## National single window (the concept)
- **When:** Identifying where declarations/permits are lodged.
- **Inputs:** Importing country's name.
- **Formula:** None.
- **Output shape:** Brief description and authoritative source to consult.
- **Traps:** It is a concept. Do not state specific portals, URLs, or fees from memory; always look them up.
- **Volatility:** HIGH for specifics, LOW for concept.

## Bonded zone / bonded warehouse
- **When:** Importing to re-export, process, or defer cash outflow.
- **Inputs:** Goods' fate, storage period, facility licence type.
- **Formula:** None. Mechanism is **duty suspension**, crystallized on domestic release.
- **Output shape:** Decision block: fate | duty event | guarantee holder | cash-flow effect.
- **Traps:** This is a cash-flow tool, not a discount. Look up storage periods and bond rules.
- **Volatility:** LOW for mechanism, HIGH for eligibility and limits.

## Bill of Lading vs Air Waybill
- **When:** Determining who can claim goods and against what document.
- **Inputs:** Transport document type and consignee field.
- **Formula:** None.
- **Output shape:** Comparison table: document | negotiable? | title? | release mechanism.
- **Traps:**
  - A **negotiable B/L** is a document of title transferred by endorsement.
  - An **Air Waybill is NEVER negotiable and NOT a document of title**.
- **Volatility:** LOW.

## FIATA documents
- **When:** A freight forwarder issues the paperwork.
- **Inputs:** Forwarder's role (agent vs principal).
- **Formula:** None.
- **Output shape:** Document list stating negotiability and liability assumed.
- **Traps:** A receipt proves takeover; a multimodal B/L makes the forwarder a principal carrier.
- **Volatility:** MEDIUM.

## Letter of Credit (documentary credit)
- **When:** Buyer/seller require bank security for shipment.
- **Inputs:** Credit terms, document list, dates, required fields.
- **Formula:** None. Payment is **against documents**, not goods.
- **Output shape:** Checklist: required document | as-presented | conforms? | discrepancy.
- **Traps:**
  - **Strict compliance**: banks reject on trivial document discrepancies.
  - Seller's real deadline is the presentation period or credit expiry.
- **Volatility:** MEDIUM.

## LCL vs FCL, and the break-even between them
- **When:** Choosing between consolidation and a full container.
- **Inputs:** CBM, tonnes, `rate_per_RT`, `flat_container_rate`, fixed charges.
- **Formula:**
  `LCL total = MAX(CBM, tonnes) x rate_per_RT + LCL fixed charges`
  `FCL total = flat_container_rate + FCL fixed charges`
  Break-even volume: `V* = (FCL total - LCL fixed) / rate_per_RT` in RT.
- **Output shape:** Cost comparison stating break-even in CBM, plus sources.
- **Traps:** FCL is often chosen near break-even for faster transit and less damage risk.
- **Volatility:** LOW for method, HIGH for rates.

## Container types and capacities
- **When:** Checking cargo fit and payload limits.
- **Inputs:** Cargo CBM, gross kg, container's CSC plate specs.
- **Formula:** `utilization = cargo CBM / container internal CBM`; binding constraint is `MIN(volume headroom, payload headroom)`.
- **Output shape:** Fit check showing both volume and payload constraints.
- **Traps:** Capacities vary by carrier/build. Road weight limits often bind before container payload limits.
- **Volatility:** MEDIUM.

## ULD types (air)
- **When:** Planning air cargo build-up or per-ULD quotes.
- **Inputs:** Aircraft type/deck, ULD code, cargo footprint.
- **Formula:** None.
- **Output shape:** Fit check: code | contour | usable volume | payload | verify against spec.
- **Traps:** ULDs must match aircraft contours. Check pivot weights for over-pivot charges.
- **Volatility:** MEDIUM.

## MTO / NVOCC / freight forwarder / customs broker
- **When:** Determining contracting parties and liability.
- **Inputs:** Contract and document issued.
- **Formula:** None.
- **Output shape:** Role table: party | acts as | issues | liability assumed.
- **Traps:** The issued document defines the role (e.g., house vs master B/L). Brokers don't assume importer liability.
- **Volatility:** LOW.

## Dangerous goods (IMDG for sea, IATA DGR for air)
- **When:** Cargo might be hazardous (batteries, chemicals).
- **Inputs:** UN number, class, packing group, net quantity.
- **Formula:** None.
- **Output shape:** UN number | proper name | class | packing group | spec | marks | declaration | **source entry**.
- **Traps:** **Never classify from memory.** Consult the current IMDG/IATA DGR list. Sea and air rules differ significantly.
- **Volatility:** MEDIUM for classes, HIGH for specific entries.

## Quarantine and SPS requirements
- **When:** Shipping food, plants, animals, or untreated wood packaging.
- **Inputs:** Commodity, origin, destination SPS conditions.
- **Formula:** None.
- **Output shape:** Checklist: certificate | issuer | treatment | inspection | **source**.
- **Traps:** SPS clearance is separate from customs. Certificates must typically be issued at origin. Untreated wood packaging is regulated regardless of contents.
- **Volatility:** HIGH.

## WMS and TMS
- **When:** Designing/auditing e-logistics systems.
- **Inputs:** Order profile, throughput, fleet size.
- **Formula:**
  `picking accuracy = correct lines picked / total lines picked`
  `dock-to-stock time = stock-available timestamp - receipt timestamp`
  `vehicle load factor = load carried / vehicle capacity`
- **Output shape:** System-boundary map: process | owning system | master data.
- **Traps:** WMS owns inside the 4 walls; TMS owns outside. Failures usually happen at the handoff.
- **Volatility:** LOW for boundary, MEDIUM for claims.

## RFID vs barcode
- **When:** Choosing auto-ID technology.
- **Inputs:** Read volume, line-of-sight, item value, tag cost.
- **Formula:** payback = `incremental tag and reader cost / labour and error cost avoided per period`.
- **Output shape:** Comparison table with a break-even metric.
- **Traps:** Barcodes need line of sight; RFID doesn't, but costs more and degrades near metal/liquids.
- **Volatility:** MEDIUM.

## Last-mile delivery and track-and-trace KPIs
- **When:** Measuring e-logistics performance.
- **Inputs:** Order/event data with timestamps.
- **Formula:**
  `OTIF (on-time in-full) = orders delivered on time AND complete / total orders`
  `first-attempt delivery rate = deliveries succeeding on the first attempt / total delivery attempts made`
  `cost per drop = total last-mile cost / successful deliveries`
  `drop density = successful deliveries / route-hour`
- **Output shape:** KPI table: metric | formula | period | value | target | data source.
- **Traps:** OTIF requires both conditions met together. Failed first attempts drive up costs. Timestamps are strictly required.
- **Volatility:** LOW.
