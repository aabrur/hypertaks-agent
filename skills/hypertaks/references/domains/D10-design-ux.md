# D10 - Design & UX
Every entry: **when · inputs · formula · output shape · traps · volatility**


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
