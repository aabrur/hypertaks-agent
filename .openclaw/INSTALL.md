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
   directory:

   - **Recommended: managed symlink / junction**
     ```bash
     # macOS/Linux
     ln -s "$(pwd)/hypertaks-agent/skills/hypertaks" <your-openclaw-skills-dir>/hypertaks
     ```
     ```powershell
     # Windows (PowerShell, run as admin or with Developer Mode)
     New-Item -ItemType Junction -Path "<your-openclaw-skills-dir>\hypertaks" -Target "<path>\hypertaks-agent\skills\hypertaks"
     ```
   - **Legacy/manual copy:**
     ```bash
     cp -r hypertaks-agent/skills/hypertaks <your-openclaw-skills-dir>/hypertaks
     ```
     A copy has no automatic update channel. Migrate it once to the managed
     link above before expecting future releases without another copy step.

3. Restart OpenClaw. Verify: *"Hypertaks, analyze why our churn is high."* - it
   should run the intake gate, announce the tier (Prime for this task), then
   spawn the tier's specialist agents.

## Automatic updates

Run the managed-checkout updater from the canonical clone:

```bash
python scripts/update_hypertaks.py --check-only
python scripts/update_hypertaks.py
```

To remove recurring manual update steps, opt in once by configuring an existing
scheduler or trusted host automation to run the second command. The updater
only fast-forwards a canonical, clean `main` checkout. Dirty, diverged,
detached, wrong-remote, unreachable, or unreconciled states return `blocked`
without resetting or overwriting user work.

For an existing copied skill, preserve any local changes and migrate the folder
once to the managed symlink or junction. Restart OpenClaw after a successful
update; an active session does not change in place.

> Replace `<your-openclaw-skills-dir>` with your own path. This repo does not
> assume any particular workspace layout.
