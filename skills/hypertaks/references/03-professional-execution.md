# Professional Execution Profiles

Use this reference for build, analysis, artifact, UI/UX, chart, diagram, and
creative-media work. Apply only the profile required by the approved
deliverable. Tool availability does not justify using a profile.

## 1. Python execution profile

Use Python for data analysis, parsing, computation, simulation, optimization,
validation, reproducible research, and artifact generation.

Every material Python task must include:

1. input and schema validation;
2. explicit data types and units;
3. null, duplicate, and range audit where tabular data is involved;
4. deterministic parameters or a stated random seed;
5. assertions or reconciliation checks;
6. the computation or transformation;
7. validation of the result against an independent invariant;
8. export paths and formats;
9. reproducibility notes;
10. truthful error handling that preserves the original failure.

Never present code that was not run as executed. State `NOT RUN` when the host
cannot execute it. Do not suppress warnings merely to make output look clean.

### Python evidence block

```text
RUNTIME: [interpreter and supplied version]
INPUTS: [files, rows, schema, units]
VALIDATION: [nulls, duplicates, ranges, assertions]
METHOD: [algorithm or transformation]
RESULT: [artifact or value with unit]
RECONCILIATION: [independent check]
EXPORTS: [paths and formats]
STATUS: [PASS / FAIL / NOT RUN]
```

## 2. Matplotlib profile

Use Matplotlib for data-backed charts when exact values, units, reproducibility,
and export control matter. Do not use generated images for numerical charts.

Requirements:

- one primary message per figure;
- one chart per figure unless a multi-panel layout is explicitly required by the
  question;
- source data reconciled to the table or computation that produced it;
- title, axis labels, units, legend, and date or freshness context where needed;
- readable category labels without silent truncation;
- no 3D effects, decorative gradients, or misleading area encoding;
- zero baselines for bars unless the exception is stated and justified;
- accessible contrast and no reliance on color alone;
- deterministic canvas size and export settings;
- PNG for broad compatibility and SVG or PDF for scalable professional output
  when the destination supports it;
- figure closed after export in automated runs;
- artifact opened or inspected before completion is claimed.

Choose chart by information structure:

| Information need | Preferred chart |
|---|---|
| category comparison or ranking | bar |
| ordered time trend | line |
| distribution | histogram, box, or violin when justified |
| numeric relationship | scatter |
| cumulative contribution | Pareto bar plus cumulative line |
| uncertainty | interval, band, or error bar |
| process, architecture, or data relationship | diagram, not a statistical chart |

## 3. TypeScript profile

Use TypeScript for plugin adapters, routing logic, state machines, production
applications, and typed integrations.

Required standards:

- `strict: true`;
- explicit public interfaces and return types;
- discriminated unions for state or operation variants;
- runtime validation at untrusted boundaries;
- no unchecked `any` in production paths;
- typed error categories that retain the original cause;
- exhaustive switches using a `never` guard;
- timeouts and cancellation for external asynchronous work;
- pure routing functions where practical;
- side effects isolated behind interfaces;
- unit tests for branch decisions;
- integration tests for adapters;
- type-check and production build evidence;
- no type assertion used as a substitute for input validation.

A TypeScript artifact is not done because it compiles. It must also demonstrate
its runtime behavior and failure path.

### TypeScript evidence block

```text
TYPECHECK: [command and result]
TEST: [command and result]
BUILD: [command and result]
RUNTIME CHECK: [command and result]
BOUNDARIES VALIDATED: [inputs, tool output, configuration]
STATUS: [PASS / FAIL / NOT RUN]
```

## 4. UI/UX profile

Use UI/UX methods when a deliverable affects a user-facing surface or workflow.
A professional UI output includes:

- user and job-to-be-done;
- primary task and success state;
- information hierarchy;
- navigation or flow;
- responsive layout behavior;
- loading, empty, error, permission, and success states;
- keyboard and focus behavior where interactive;
- contrast and non-color cues;
- content and error-message quality;
- design-system or component reuse;
- implementation constraints;
- usability risks and validation plan.

Do not call a visual attractive and treat that as UX evidence. Evaluate what the
user can understand, decide, and complete.

## 5. Image-generation profile

Use image generation only when the approved deliverable needs concept art,
creative direction, illustrative media, campaign imagery, character or product
visualization, or another image-native output.

Before generation, record:

- purpose and destination;
- subject and composition;
- aspect ratio and safe area;
- visual style and brand constraints;
- required text policy;
- identity or product-reference requirements;
- exclusions and negative prompt;
- required variations;
- acceptance criteria;
- post-production needs;
- disclosure or provenance requirements supplied by the destination.

Do not use image generation for:

- numerical charts;
- exact tables;
- technical diagrams requiring precise labels or topology;
- legal, financial, or operational evidence;
- a visual that can be created more accurately from source data or code.

Generated output must be inspected against the brief. A successful tool call is
not proof that the image is usable.

## 6. Execution selection

Select the minimum sufficient profile:

| Deliverable | Primary profile | Optional support |
|---|---|---|
| data analysis | Python | Matplotlib |
| reproducible chart | Python plus Matplotlib | UI/UX review for presentation |
| plugin adapter or typed router | TypeScript | Python for evaluation data |
| product interface | TypeScript plus UI/UX | image generation for non-functional concept imagery |
| technical architecture | TypeScript or engineering reasoning | diagram tool |
| creative campaign image | image generation | UI/UX or brand review |

Multiple profiles are allowed only when each serves a named deliverable or
material risk.
