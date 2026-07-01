# Installing Hypertaks for Hermes

Hermes discovers skills from a **skills directory** it scans on startup — the
location is whatever *your* Hermes setup points at (everyone runs their own
flow). There is no marketplace manifest to install; you just make the skill
visible in that directory.

## Generic install (any Hermes setup)

1. Clone this repo somewhere:

   ```bash
   git clone https://github.com/aabrur/hypertaks-agent.git
   ```

2. Make `skills/hypertaks` from this repo appear inside your Hermes skills
   directory. Pick whichever fits your flow:

   - **Copy:**
     ```bash
     cp -r hypertaks-agent/skills/hypertaks <your-hermes-skills-dir>/hypertaks
     ```
   - **Symlink / junction** (so it stays in sync with the repo):
     ```bash
     # macOS/Linux
     ln -s "$(pwd)/hypertaks-agent/skills/hypertaks" <your-hermes-skills-dir>/hypertaks
     ```
     ```powershell
     # Windows (PowerShell, run as admin or with Developer Mode)
     New-Item -ItemType Junction -Path "<your-hermes-skills-dir>\hypertaks" -Target "<path>\hypertaks-agent\skills\hypertaks"
     ```

3. Restart Hermes. Verify: *"Hypertaks, analyze why our churn is high."* — it
   should run the intake gate, then spawn 5 specialist agents.

> Replace `<your-hermes-skills-dir>` with your own path. This repo does not
> assume any particular workspace layout.
