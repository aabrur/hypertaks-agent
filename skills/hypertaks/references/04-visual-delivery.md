# Visual Necessity and Delivery Router

Use this reference whenever a table, chart, diagram, UI mockup, or generated
image may improve a deliverable. The decision is based on information structure
and decision risk, not on whether a visual tool is available.

## 1. Necessity status

Assign one status before selecting a medium:

| Status | Test |
|---|---|
| **Required** | Without a visual, a material relationship, process, trend, topology, formula, scale, or comparison is likely to be misunderstood. Also Required whenever context explicitly or functionally calls for an infographic, formula, map, scale, diagram, table, or visual artifact. |
| **Recommended** | The visual materially improves comprehension speed or decision quality, but text can still carry the result. |
| **Optional** | The visual mainly improves presentation or brand polish. |
| **Not needed** | Text, code, or a compact table is clearer and cheaper. |

A required visual belongs in the contract and must produce a verified artifact. When the context warrants an infographic, mathematical formula, domain map, comparative scale, workflow diagram, data table, or illustrative media, the visual status must not be downgraded to optional.

## 2. Medium selection

| Information structure | Medium |
|---|---|
| exact values and lookup | table |
| category comparison | bar chart (Python Matplotlib) |
| trend over ordered time | line chart (Python Matplotlib) |
| distribution or outliers | histogram or box plot (Python Matplotlib) |
| relationship between numeric variables | scatter plot (Python Matplotlib) |
| comparative scale or metric range | scaled interval or range plot (Python Matplotlib) |
| mathematical or quantitative relations | KaTeX or LaTeX formula block |
| cumulative contribution | Pareto chart (Python Matplotlib) |
| sequential process | flowchart (Mermaid or SVG) |
| system components and interfaces | architecture diagram (Mermaid or SVG) |
| geographic, network, or domain map | topological map or graph diagram (Mermaid or SVG) |
| entity relationships | ERD (Mermaid) |
| dependencies over time | timeline or Gantt (Mermaid or table) |
| branching decision logic | decision tree (Mermaid) |
| screen behavior or interaction | wireframe, prototype, or UI state map |
| creative concept or illustrative media | generated image (generate_image tool) |

Do not use a pie chart when exact ranking matters, when categories exceed a
small set, or when the parts do not form one meaningful total.

## 3. Precision boundary

Use code or diagram tooling for precise information. Use image generation only
for image-native creative work. A generated image must never be the sole source
of a number, label, architecture connection, or operational instruction.

## 4. Visual contract fields

Record:

- `visual_status`: required, recommended, optional, or not_needed;
- `visual_type`: table, chart, process_diagram, architecture_diagram, erd,
  timeline, decision_tree, ui_mockup, generated_image, or none;
- `visual_purpose`: the decision or comprehension need served;
- `visual_owner`: role responsible;
- `visual_capability`: verified tool or core-code path;
- `visual_data_source`: source table, model, or brief;
- `visual_validation`: inspection and reconciliation method;
- `visual_exports`: required formats and destination.

## 5. Validation

Before delivery:

1. reconcile plotted values or labels with the source;
2. inspect the rendered artifact at its destination size;
3. verify that titles, labels, units, legends, and reading order are clear;
4. verify accessibility and non-color cues where relevant;
5. confirm that no generated text or invented value entered a precise visual;
6. record the artifact path, format, and validation evidence;
7. mark unavailable or unverified visuals honestly rather than substituting a
   decorative image.

## 6. Token and capability discipline

Do not load visual references or discover visual capabilities for a task whose
status is `not_needed`. Use one visual owner. Reuse the same validated source
data across table, chart, and narrative. Do not ask several agents to render
competing versions unless comparison itself is the approved deliverable.
