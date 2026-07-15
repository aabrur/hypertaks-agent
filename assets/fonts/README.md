# Pinned Figure Font

`Roboto-Variable.ttf` is the Google Fonts Roboto variable font used by
`scripts/generate_figures.py` for deterministic figure rendering.

- Source: `https://github.com/google/fonts/tree/main/ofl/roboto`
- Font SHA-256: `d7598e12c5dbef095ff8272cfc55da0250bd07fbdecbac8a530b9b277872a134`
- License: SIL Open Font License 1.1, preserved in `OFL-Roboto.txt`

Install the pinned rendering packages and regenerate all figures with:

```text
python -m pip install -r scripts/requirements-figures.txt
python scripts/generate_figures.py
```
