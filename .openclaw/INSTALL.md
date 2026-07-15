# Installing Hypertaks for OpenClaw

OpenClaw discovers skills from a **skills directory** it scans on startup - the
location is whatever *your* OpenClaw setup points at (everyone runs their own
flow). There is no marketplace manifest to install; you just make the skill
visible in that directory.

## Generic install (any OpenClaw setup)

1. Clone this repo somewhere:

   ```bash
   git clone https://github.com/aabrur/hypertaks-agent.git
   ```

2. Make `skills/hypertaks` from this repo appear inside your OpenClaw skills
   directory. Pick whichever fits your flow:

   - **Copy:**
     ```bash
     cp -r hypertaks-agent/skills/hypertaks <your-openclaw-skills-dir>/hypertaks
     ```
   - **Symlink / junction** (so it stays in sync with the repo):
     ```bash
     # macOS/Linux
     ln -s "$(pwd)/hypertaks-agent/skills/hypertaks" <your-openclaw-skills-dir>/hypertaks
     ```
     ```powershell
     # Windows (PowerShell, run as admin or with Developer Mode)
     New-Item -ItemType Junction -Path "<your-openclaw-skills-dir>\hypertaks" -Target "<path>\hypertaks-agent\skills\hypertaks"
     ```

3. Restart OpenClaw. Verify: *"Hypertaks, analyze why our churn is high."* - it
   should run the intake gate, announce the tier (Prime for this task), then
   spawn the tier's specialist agents.

## Updating safely

Hypertaks does not update itself in the background. For a symlink or junction
pointing at a clean Git clone, review the update and run `git pull --ff-only`
only after explicit approval. For a copied skill directory, reinstall it from
a trusted release source, then restart OpenClaw. Never overwrite local changes.

> Replace `<your-openclaw-skills-dir>` with your own path. This repo does not
> assume any particular workspace layout.
