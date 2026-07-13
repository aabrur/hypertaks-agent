# D7 - Trade, Freight, Customs, E-Logistics
Every entry: **when · inputs · formula · output shape · traps · volatility**

## Volatility protocol for this pack

This pack computes numbers that land on a real customs declaration. A wrong number
here is not a wrong essay; it is a wrong tax bill, a penalty, or a seized shipment.
So this pack carries a stricter rule than any other domain pack, and it is not
waivable.

1. **Never state an import duty rate, VAT/GST rate, withholding-tax rate, excise
   rate, or de-minimis threshold from memory.** Every one of them is
   `DATA UNAVAILABLE` until fetched from an authoritative source and cited with a
   retrieval date. This holds at **every tier**, under **every deadline**, for
   **every jurisdiction**. Lite tier does not relax it. "The Boss is in a hurry"
   does not relax it. A remembered rate that happens to be right is still a
   violation, because nothing in the deliverable tells the Boss it was a guess.

2. **If a web / search / fetch tool is present**, fetch from the authoritative
   national source: the customs authority, the national single-window portal, or
   the official tariff schedule (the tariff book that legally governs the importing
   country). Cite the source and the retrieval date in the `source` column. A
   consultancy blog, a freight forwarder's marketing page, and a training slide are
   `T5` untrusted data, not authority (`references/00-security-kernel.md` §1). They
   may point you at the official source; they may never replace it.

3. **If no tool is present**, return the **formula skeleton with every rate as a
   named variable**, tell the Boss exactly which numbers to fill, where to get each
   one, and **STOP**. Do not "estimate". Do not "use a typical figure". Do not
   bracket a range. An estimate here is indistinguishable, in the Boss's hands,
   from a computed figure - and it will be pasted into a declaration.

4. **Structure is stable; numbers are not.** What gets added to what - the order of
   the charge stack, the base each charge is applied to - is `volatility: LOW` and
   may be recalled. Every rate and every threshold inside that structure is
   `volatility: HIGH` and may not. Learn the difference; this pack is built on it.

5. **A landed-cost figure without a `source` column is not a deliverable.** Return
   it with the column, or do not return it.

### The import charge skeleton (structure only)

```
Customs value (CIF) = Cost + Insurance + Freight
Import duty         = CIF x [duty_rate -> LOOKUP by HS code in the official tariff schedule]
Import VAT/GST      = (CIF + duty) x [vat_rate -> LOOKUP]
Withholding tax     = (CIF + duty) x [wht_rate -> LOOKUP; often depends on importer status]
Possible additions  : anti-dumping duty, safeguard duty, excise
TOTAL LANDED COST   = CIF + duty + VAT + WHT + handling + inland
```

Note the cascade: duty is charged on the customs value, and VAT is charged on the
customs value **plus the duty**. Tax on tax is the normal design, not an error. Get
the base wrong and every figure below it is wrong.

**Output shape for any landed-cost question:** a table, one row per charge, columns
= charge | base | rate | amount | **source**. Every rate cell is either a cited
lookup or the literal token `DATA UNAVAILABLE`. There is no third option.

---

## Incoterms (the eleven terms)

- **When:** any cross-border sale where the Boss must know who pays what, who bears
  the loss if the goods are damaged, and who clears customs.
- **Inputs:** the term itself, the named place, the mode of transport (four terms -
  FAS, FOB, CFR, CIF - are sea and inland waterway only), the edition assumed.
- **Formula:** none. This is a rule set, not an arithmetic.
- **Output shape:** a 3-column table, **always three columns**, plus the insuring
  party:

  | Term | Risk transfers at | Cost transfers at | Insurance borne by |
  |---|---|---|---|
  | EXW | seller's premises, goods placed at buyer's disposal | seller's premises | buyer (optional) |
  | FCA | delivery to the buyer's carrier at the named place | same point | buyer (optional) |
  | FAS | alongside the vessel at the port of shipment | same point | buyer (optional) |
  | FOB | on board the vessel at the port of shipment | same point | buyer (optional) |
  | CFR | on board the vessel at the port of shipment | port of destination (seller pays freight) | buyer (optional) |
  | CIF | **on board at the port of shipment** | **port of destination** | **seller buys it, for the buyer's benefit** |
  | CPT | delivery to the first carrier | named destination (seller pays carriage) | buyer (optional) |
  | CIP | **delivery to the first carrier** | **named destination** | **seller buys it, for the buyer's benefit** |
  | DAP | at destination, ready for unloading | destination, import duty excluded | seller (optional) |
  | DPU | at destination, once unloaded | destination, import duty excluded | seller (optional) |
  | DDP | at destination, ready for unloading | destination, **import duty included** | seller (optional) |

- **Traps:**
  - **THE TRAP, AND IT MUST ALWAYS BE FLAGGED: the risk transfer point is NOT the
    cost transfer point.** Under CIF and CIP the seller pays freight and insurance
    all the way to destination, yet **risk has already passed to the buyer** at
    shipment (CIF) or at the first carrier (CIP). Goods lost mid-ocean under CIF are
    the buyer's loss, and the buyer claims on the policy the seller bought. **Any
    Incoterms answer that does not separate those two columns is incomplete by
    definition** - collapse them and the Boss will believe the seller carries a risk
    the seller does not carry.
  - EXW puts export clearance on the buyer, who is often a non-resident and cannot
    legally file it. DDP puts import clearance and import taxes on the seller, who
    is often a non-resident and cannot legally file those either. Both ends of the
    range are the ones most likely to be unworkable in practice.
  - The insurance cover level required under CIF and CIP is not the same; do not
    assume one from the other. Verify in the edition in force.
  - A term without a named place is not a term. "FOB" alone is unusable.
- **Volatility:** MEDIUM. The rule set is revised roughly once a decade. **State
  which edition you assumed** (the 2020 edition is the one in force at the time this
  pack was written) and **tell the Boss to verify that the contract names the same
  edition**. A contract may lawfully invoke an older one.

## Chargeable weight (air) - actual vs volumetric

- **When:** quoting or auditing any air freight charge. This is the calculation
  juniors get wrong most often, and it always errs in the carrier's favour.
- **Inputs:** L, W, H per piece in **cm**; actual gross weight in **kg**; piece
  count; the divisor from the tariff being used.
- **Formula:** `volumetric kg = (L x W x H in cm) / air_divisor`, with
  `air_divisor = 6000` under the common IATA convention.
  `chargeable weight = MAX(actual kg, volumetric kg)`.
- **Output shape:** a computation block showing **both candidates and which one
  won**:

```
METHOD:       Air chargeable weight
INPUTS:       1 piece, 120 x 80 x 60 cm | actual gross 65 kg | divisor 6000 [source: carrier tariff, VERIFY]
FORMULA:      volumetric = (L x W x H) / divisor ; chargeable = MAX(actual, volumetric)
SUBSTITUTION: volumetric = (120 x 80 x 60) / 6000 = 576,000 / 6000 = 96 kg
              candidates: actual 65 kg vs volumetric 96 kg
RESULT:       chargeable weight = 96 kg   [unit: kg]  <- volumetric wins
SENSITIVITY:  a divisor of 5000 instead of 6000 raises volumetric to 115.2 kg,
              roughly a fifth more billed weight on identical cargo
ASSUMPTIONS:  dimensions are outer packed dimensions, not product dimensions
```

- **Traps:** printing only the winner hides the check and makes the number
  unauditable - **show both candidates**. Measure the packed carton, not the
  product. Round per the carrier's own rounding rule, not yours. Multi-piece
  consignments are normally assessed on the **total** of both candidates, not piece
  by piece; confirm in the tariff.
- **Volatility:** LOW for the method (take the greater of two candidates - this
  never changes). MEDIUM for the divisor: it is a carrier/IATA convention, express
  and courier tariffs commonly use a different one. **Confirm the divisor in the
  tariff actually being applied to this shipment.**

## Chargeable weight (sea LCL) - the W/M revenue ton

- **When:** quoting less-than-container-load sea freight, which is priced per
  "weight or measurement" (W/M).
- **Inputs:** volume in **CBM** (cubic metres), gross weight in **tonnes**, the
  rate per revenue ton in **currency/RT**.
- **Formula:** `revenue ton (RT) = MAX(volume in CBM, weight in tonnes)`;
  `freight = RT x rate_per_RT`. (The convention equates 1 CBM with 1 tonne; confirm
  the equivalence the carrier's tariff actually uses.)
- **Output shape:** the same both-candidates computation block:

```
METHOD:       Sea LCL revenue ton (W/M)
INPUTS:       volume 8.4 CBM | gross weight 6.1 tonnes | rate = [rate_per_RT -> LOOKUP in the quote]
FORMULA:      RT = MAX(CBM, tonnes) ; freight = RT x rate_per_RT
SUBSTITUTION: candidates: 8.4 (measurement) vs 6.1 (weight) -> RT = 8.4
RESULT:       8.4 revenue tons   [unit: RT]  <- measurement wins; cargo is light and bulky
SENSITIVITY:  freight is linear in RT; a 1 CBM measurement error moves the bill by
              exactly one rate_per_RT
```

- **Traps:** LCL quotes hide a long tail of fixed per-shipment charges (terminal
  handling, documentation, CFS, destination charges) that do **not** scale with RT
  and that dominate small shipments - a per-RT rate alone is not a quote. Volume is
  measured on the outer dimensions including the pallet.
- **Volatility:** LOW for the method. MEDIUM for the CBM-to-tonne equivalence and
  for which surcharges are in scope.

## Customs valuation basis (CIF vs FOB)

- **When:** before computing any duty. The base is chosen by the importing country's
  law, **not** by the Incoterm on the invoice.
- **Inputs:** invoice value, freight cost, insurance cost, the importing country's
  declared valuation basis, and its list of additions and deductions.
- **Formula:** `customs value = Cost + Insurance + Freight` where the country
  assesses on a CIF basis, or `customs value = Cost` (goods value at the point of
  export) where it assesses on an FOB basis. Additions (royalties, assists,
  commissions) and deductions (post-importation transport, installation) are
  jurisdiction-specific: `LOOKUP`.
- **Output shape:** a valuation table - element | included? | amount | **source**.
- **Traps:** most trading nations follow the transaction-value method as the primary
  basis, but the *additions* differ. A buyer negotiating FOB does not thereby get an
  FOB customs value; if the country assesses CIF, freight and insurance are added
  back whether or not the seller paid them. Related-party pricing invites a
  valuation challenge. Never assume the basis from the Incoterm.
- **Volatility:** LOW for the method's existence, **HIGH** for which elements a given
  country adds or deducts. `DATA UNAVAILABLE` until fetched from the national
  customs authority.

## HS code classification

- **When:** always, before any duty figure exists. The HS code **is** the tax bill.
- **Inputs:** what the product is made of, what it does, its stage of processing,
  its packing, and the importing country's full tariff line.
- **Formula:** none. Structure: **chapter** (first 2 digits) -> **heading** (4) ->
  **subheading** (6, internationally harmonized) -> **national tariff line** (8, 10,
  or more digits, set by the importing country and NOT harmonized).
- **Output shape:** a classification block - candidate codes considered | the General
  Rule of Interpretation (GRI) applied | the chosen code | the tariff line cited |
  **source**.
- **Traps:**
  - **A wrong HS code is a wrong tax bill.** Classification drives the duty rate,
    the preferential-origin eligibility, the anti-dumping exposure, the licensing
    requirement, and the prohibition list. Everything downstream inherits the error.
  - The GRIs are applied **in order**: GRI 1 (terms of the headings and the section
    or chapter notes) governs; the later rules apply only when the earlier ones do
    not resolve it. Reaching for "essential character" (GRI 3(b)) before exhausting
    GRI 1 is the classic amateur move.
  - Only the first 6 digits are internationally common. Two countries can classify
    the same good identically at 6 digits and differently at 8 or 10.
  - Where the stakes are large, the answer is not a better guess: it is a **binding
    ruling** from the importing country's customs authority. Say so.
- **Volatility:** MEDIUM for the structure and the GRIs (the nomenclature is revised
  on a multi-year cycle). **HIGH** for the rate attached to any code.

## Import declaration flow

- **When:** planning a clearance timeline, or diagnosing where a shipment is stuck.
- **Inputs:** the declaration form, invoice, packing list, transport document (B/L or
  AWB), certificate of origin where a preference is claimed, licences/permits,
  importer registration.
- **Formula:** none; it is a sequence.
- **Output shape:** a swimlane or numbered flow, one row per step, with the party
  responsible and the document that unlocks the next step:
  1. importer or broker lodges the declaration (electronically, via the national
     system);
  2. system validates and assigns a risk channel (documentary check / physical
     inspection / release without check - naming conventions vary by country);
  3. duties and taxes are assessed and paid;
  4. permits, quarantine, and other-agency clearances are satisfied;
  5. customs releases; the carrier or terminal issues the delivery order;
  6. goods leave the port or airport; documents are archived for the statutory
     retention period.
- **Traps:** the physical arrival of the goods and the legal release of the goods are
  different events, and demurrage and storage clocks run against the gap. Missing
  other-agency permits, not customs itself, are the most common cause of a stuck
  container. Retention periods for the file are statutory: `LOOKUP`.
- **Volatility:** LOW for the shape of the flow, **HIGH** for the specific system
  names, forms, channels, and deadlines of any given country.

## National single window (the concept)

- **When:** identifying where a declaration and its permits are actually lodged.
- **Inputs:** the importing country's name.
- **Formula:** none.
- **Output shape:** a one-paragraph description of the concept plus a named source to
  consult - never a portal name recalled from memory.
- **Traps:** a single window is a **concept**: one electronic entry point through
  which a trader submits standardized information once, and which distributes it to
  customs, quarantine, standards, and licensing agencies. **Do not assert a specific
  country's current portal name, URL, statute number, or fee.** These are renamed,
  merged, and replaced. Name the *type* of source (the national customs authority's
  own site) and fetch.
- **Volatility:** HIGH for every specific. LOW for the concept.

## Bonded zone / bonded warehouse

- **When:** the Boss imports to re-export, to process, or to defer cash outflow.
- **Inputs:** the goods' intended fate (re-export, domestic release, processing), the
  storage period, the facility's licence type.
- **Formula:** none. The mechanism: **duty suspension**, not duty exemption. Duties
  and import taxes are not assessed while the goods sit in the bonded area; the
  liability crystallizes on **release into the domestic customs territory**. Goods
  re-exported directly from bond may never attract the import duty at all.
- **Output shape:** a decision block - goods' fate | duty event | who holds the
  guarantee | cash-flow effect.
- **Traps:** suspension is a cash-flow instrument, and treating it as a discount is a
  material error in a landed-cost model. Maximum storage periods, guarantee or bond
  requirements, and permitted processing operations are all statutory: `LOOKUP`.
  Shrinkage and waste inside the zone are usually still dutiable.
- **Volatility:** LOW for the mechanism, **HIGH** for the periods, guarantees, and
  eligibility rules.

## Bill of Lading vs Air Waybill

- **When:** any question about who may claim the goods, and against what.
- **Inputs:** the transport document type and its consignee field.
- **Formula:** none.
- **Output shape:** a comparison table - document | negotiable? | title? | how goods
  are released.
- **Traps:** **this is a legal difference, not a formatting one.**
  - A **negotiable (order) B/L** is a document of title. It is consigned "to order"
    and is transferred by endorsement; the carrier releases the cargo **against
    surrender of an original**. Whoever holds a properly endorsed original controls
    the goods, which is exactly what makes it financeable under a letter of credit.
  - A **straight (non-negotiable) B/L** names a fixed consignee and is not
    transferable by endorsement.
  - An **Air Waybill is NEVER negotiable and is NOT a document of title.** The
    carrier releases to the named consignee on identification. Consign an air
    shipment to the buyer while still unpaid and the bank holds no security at all -
    this is why L/C air shipments are consigned to the issuing bank.
  - Releasing cargo without an original negotiable B/L exposes the carrier to
    misdelivery liability; letters of indemnity are a workaround, not a right.
- **Volatility:** LOW.

## FIATA documents

- **When:** a freight forwarder issues the paperwork rather than the carrier.
- **Inputs:** the forwarder's role in the transaction (agent vs principal).
- **Formula:** none.
- **Output shape:** a document list with, for each, whether it is negotiable and what
  liability the issuer assumes. The family includes forwarder's certificates of
  receipt and of transport, warehouse receipts, the negotiable multimodal transport
  bill of lading, and the shipper's declaration for dangerous goods.
- **Traps:** the documents differ sharply in effect. A **receipt** is evidence that
  the forwarder took the goods; a **negotiable multimodal transport B/L** makes the
  forwarder a contracting carrier with carrier liability. Do not treat one as the
  other because both carry the same logo. Banks accept some and not others under an
  L/C: check the credit's own terms.
- **Volatility:** MEDIUM (the forms are revised).

## Letter of Credit (documentary credit)

- **When:** buyer and seller do not trust each other enough to ship on open account.
- **Inputs:** the credit terms, the required document list, the expiry and the latest
  shipment date, the presentation period, and every field the credit specifies.
- **Formula:** none arithmetic. The mechanism: the issuing bank substitutes its own
  credit for the buyer's and pays **against documents**, not against goods.
- **Output shape:** a document-compliance checklist - required document | as-presented
  | conforms? | discrepancy - one row per document required by the credit.
- **Traps:**
  - **The doctrine of strict compliance.** Banks deal in documents alone. The goods
    can be perfect, delivered, and accepted, and the bank may still refuse to pay if
    a document does not conform on its face to the credit. **Discrepant documents are
    the number one cause of L/C non-payment**, and the commonest discrepancies are
    trivial in substance: late presentation, expired credit, a description that does
    not match the credit's wording, inconsistent data between documents, a missing
    endorsement.
  - The seller's real deadline is not the shipment date; it is the **presentation
    period** after shipment and the credit **expiry**, whichever bites first.
  - "Confirmed" adds a second bank's independent undertaking and is what protects
    against issuing-bank or country risk. Unconfirmed is not the same product.
  - Amendments require the beneficiary's consent. A buyer cannot unilaterally tighten
    the terms.
- **Volatility:** MEDIUM. The governing banking rules are periodically reissued; state
  which set the credit is expressed as subject to, and verify it in the credit itself.

## LCL vs FCL, and the break-even between them

- **When:** the Boss must decide whether to consolidate or to book a full container.
- **Inputs:** cargo volume in **CBM**, gross weight in **tonnes**, `rate_per_RT` for
  LCL, `flat_container_rate` for FCL, the fixed charges on each side, and time cost.
- **Formula:**
  `LCL total = MAX(CBM, tonnes) x rate_per_RT + LCL fixed charges`
  `FCL total = flat_container_rate + FCL fixed charges`
  Break-even volume: `V* = (FCL total - LCL fixed) / rate_per_RT` in RT.
  Above `V*`, FCL is cheaper; below it, LCL.
- **Output shape:** a two-column cost comparison with the break-even stated **in
  CBM**, plus a `source` column for every rate, plus the non-price factors below.
- **Traps:** the break-even is not purely price. LCL cargo is consolidated and
  deconsolidated at a CFS, which adds handling, transit days, and damage exposure;
  a shipper close to `V*` often books FCL for the **shorter transit and lower
  handling risk** even at a small cost premium. Also: a container has a volume limit
  **and** a payload limit, and dense cargo hits the payload limit long before the
  volume limit, so "it fits" is not the test.
  **SENSITIVITY:** rates on both sides are quotes with short validity; recompute the
  break-even whenever a quote is refreshed, and state the quote's validity date.
- **Volatility:** LOW for the method, HIGH for every rate in it.

## Container types and capacities

- **When:** checking that cargo actually fits, and does not exceed payload.
- **Inputs:** cargo volume in **CBM**, gross weight in **kg**, cargo dimensions in
  **cm**, and the specific container's own plate.
- **Formula:** `utilization = cargo CBM / container internal CBM`; the binding
  constraint is `MIN(volume headroom, payload headroom)`.
- **Output shape:** a fit check showing **both** constraints and which one binds -
  the same both-candidates discipline as chargeable weight.
- **Traps:** internal dimensions, internal volume, tare, and maximum payload **vary by
  container, by carrier, and by build**, and the legal figures are stamped on the
  container's own CSC plate. Typical families: 20 ft and 40 ft standard dry, 40 ft
  high-cube (extra height), reefer (refrigerated, with a thicker wall so less usable
  volume and less payload), open-top, flat-rack, tank. **State any capacity figure as
  typical and mark it verify-per-carrier;** never plan a shipment against a
  remembered internal volume. Road weight limits at origin or destination frequently
  bind before the container's own payload limit does.
- **Volatility:** MEDIUM (typical figures are stable, but per-unit and per-carrier
  variation is real, and the road limits are HIGH).

## ULD types (air)

- **When:** planning air cargo build-up, or reading an air quote priced per ULD.
- **Inputs:** the aircraft type and deck (main deck vs lower deck), the ULD code, the
  cargo footprint in **cm**.
- **Formula:** none.
- **Output shape:** a fit check: ULD code | contour/deck | usable volume | payload |
  **verify against the operating carrier's ULD spec**.
- **Traps:** ULDs are **certified aircraft parts**, not boxes: pallets with nets and
  contoured containers must match the aircraft's contour and the deck's loading
  limits. A pallet that fits a lower deck may not fit a narrow-body at all. The ULD
  identification code encodes type, size, and compatibility - read it rather than
  guess it. Pivot-weight pricing means cargo over the ULD's pivot weight is charged
  at a higher over-pivot rate: `LOOKUP` the pivot and both rates in the tariff.
- **Volatility:** MEDIUM.

## MTO / NVOCC / freight forwarder / customs broker

- **When:** deciding who the Boss is actually contracting with, and who is liable
  when cargo is lost.
- **Inputs:** the contract, and the document issued.
- **Formula:** none.
- **Output shape:** a role table - party | acts as | issues | liability assumed.
  - **Freight forwarder:** classically an **agent** arranging carriage on the
    shipper's behalf. Liability is for its own negligence in arranging, not for the
    carriage itself - unless it has issued a transport document as principal.
  - **NVOCC:** a **carrier** without ships. It issues its own (house) bill of lading,
    takes carrier liability toward the shipper, and buys space from the ocean carrier
    under a master bill.
  - **MTO (multimodal transport operator):** contracts as **principal for the whole
    door-to-door journey across two or more modes** on a single contract, and is
    liable throughout, including for segments it subcontracts.
  - **Customs broker:** licensed to lodge declarations with the customs authority on
    the importer's behalf. **The declaration's legal responsibility usually remains
    the importer's**, not the broker's.
- **Traps:** the same company often plays several of these roles across a single
  shipment, and its liability changes with the hat it wore. The **document issued**,
  not the company's marketing, decides the role. House B/L versus master B/L is the
  tell. And note the last point above: hiring a broker does not transfer the
  importer's liability for a wrong declaration.
- **Volatility:** LOW.

## Dangerous goods (IMDG for sea, IATA DGR for air)

- **When:** the cargo is, or might be, hazardous. Lithium batteries, aerosols,
  paints, magnets, fuels, and many chemicals are in scope, and shippers routinely do
  not realize it.
- **Inputs:** the safety data sheet, the substance's UN number, its class or division,
  its packing group, its net quantity per package.
- **Formula:** none.
- **Output shape:** classification + packing group + documentation:
  UN number | proper shipping name | class/division (the nine classes: 1 explosives,
  2 gases, 3 flammable liquids, 4 flammable solids, 5 oxidizers and organic peroxides,
  6 toxic and infectious, 7 radioactive, 8 corrosives, 9 miscellaneous) | packing
  group (I high, II medium, III low danger, where the class uses them) | packaging
  spec | marks and labels | the shipper's declaration | **the entry in the current
  list that this was read from**.
- **Traps:** **DG classification is NEVER done from memory.** The governing lists are
  reissued on a fixed cycle, entries change, and the sea and air rules differ - a good
  acceptable by sea may be forbidden by air, and quantity limits differ by aircraft
  type. **Consult the current edition of the applicable list for the actual UN entry**
  and cite it. A misdeclared dangerous good is a criminal matter and has sunk ships;
  no deadline justifies a recalled classification. The shipper signs the declaration,
  and the shipper carries the liability.
- **Volatility:** MEDIUM for the class structure (the nine classes are stable), **HIGH**
  for every specific entry, limit, exception, and packing instruction.

## Quarantine and SPS requirements

- **When:** the goods are food, plants, animals, animal products, timber, seeds, or
  soil-contactable, or the packaging is untreated wood.
- **Inputs:** the commodity, the origin country, the destination country's plant/animal
  health import conditions.
- **Formula:** none.
- **Output shape:** a requirements checklist - required certificate | issuing authority
  in the exporting country | treatment required | inspection point | **source**.
- **Traps:** SPS clearance is a **separate approval from customs clearance** and is a
  common reason a customs-cleared shipment still cannot leave the port. Phytosanitary
  and veterinary certificates must usually be issued in the **exporting** country
  before departure and cannot be obtained retroactively. Wood packaging (pallets,
  crates, dunnage) is itself regulated and must carry the treatment mark, even when
  the cargo inside is not regulated at all - this catches shippers constantly.
  Permitted commodities, treatments, and prohibited-origin lists are `LOOKUP`.
- **Volatility:** HIGH (pest and disease outbreaks change the lists without notice).

## WMS and TMS

- **When:** designing or auditing the e-logistics system layer.
- **Inputs:** order profile, SKU count, throughput, fleet size, network shape.
- **Formula:** none directly, but each system owns metrics:
  `picking accuracy = correct lines picked / total lines picked`;
  `dock-to-stock time = stock-available timestamp - receipt timestamp`;
  `vehicle load factor = load carried / vehicle capacity` (state the unit - weight
  or volume, not both).
- **Output shape:** a system-boundary map - process | owning system | master data |
  integration point.
- **Traps:** WMS owns what happens **inside the four walls** (receipt, putaway,
  slotting, picking, packing, inventory accuracy); TMS owns what happens **between
  them** (carrier selection, routing, consolidation, freight audit). The classic
  failure is not either system: it is the **handoff** between them and the ERP, where
  the same order carries three different identifiers and nobody owns the master
  record. Fix the master-data ownership before buying either.
- **Volatility:** LOW for the boundary, MEDIUM for vendor capability claims.

## RFID vs barcode

- **When:** choosing the auto-identification layer for a warehouse or a shipment.
- **Inputs:** read volume, line-of-sight conditions, item value, tag cost, the
  material being tagged.
- **Formula:** payback = `incremental tag and reader cost / labour and error cost
  avoided per period`. **SENSITIVITY:** RFID cases usually turn on the tag unit cost
  and the achieved read rate; vary both and state the break-even read rate, because a
  business case built on a 100 percent read assumption will not survive contact with
  metal and liquid.
- **Output shape:** a comparison table - dimension | barcode | RFID - plus a
  break-even.
- **Traps:** barcode needs **line of sight** and reads one item at a time, but the
  label is nearly free and it is universally supported. RFID reads **in bulk, without
  line of sight**, which is what makes whole-pallet and whole-cage reads possible, but
  tags cost real money per unit, metal and liquid degrade read rates severely, and
  read rates below 100 percent create phantom discrepancies that are worse than a slow
  manual scan. RFID is a **process change**, not a sticker swap; a deployment that
  does not redesign the process delivers nothing.
- **Volatility:** MEDIUM (tag economics move).

## Last-mile delivery and track-and-trace KPIs

- **When:** measuring e-logistics performance, or writing an SLA.
- **Inputs:** order and delivery event data, with timestamps.
- **Formula:**
  `OTIF (on-time in-full) = orders delivered on time AND complete / total orders`
  (both conditions, one metric - an order that is on time but short is a **fail**);
  `first-attempt delivery rate = deliveries succeeding on the first attempt / total
  delivery attempts made`;
  `cost per drop = total last-mile cost / successful deliveries`;
  `drop density = successful deliveries / route-hour`.
- **Output shape:** a KPI table - metric | formula | period | value **with its unit** |
  target | data source.
- **Traps:** OTIF is deliberately brutal because it multiplies two conditions: a
  supplier reporting a high on-time rate and, separately, a high in-full rate is
  **not** at that level of OTIF, since the two conditions compound. Report the joint
  metric, never the two marginals. Define "on time" against the **promised** date or
  the **requested** date and say which - suppliers quietly measure against the
  promise they themselves moved.
  Failed first attempts are the single largest controllable cost in last-mile, since
  every failure buys a second full delivery. Track-and-trace is worthless without
  event **timestamps**; a status without a time cannot compute any of these.
- **Volatility:** LOW.
