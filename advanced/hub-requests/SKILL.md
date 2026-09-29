---
name: hub-requests
description: Every 15 minutes: pick up Hub requests approved in Slack, have Claude implement them, build-check, and push to ravishing-radish main.
---

Process any newly approved Radish Hub requests, one pass.

Run this with the Bash tool, in the background (run_in_background: true), because a request can take up to 25 minutes, and wait for it to finish:

    cd ~/dev/scheduled-tasks/radish-requests && bun watch-requests.ts --once

That script does all the work itself: it reads approved `feature_requests` rows from the Radish Supabase project, runs headless `claude -p` against its own clone of jackmielke/ravishing-radish, runs the build gate, pushes to main, marks the request done, and pings Jack on Telegram. Do not do any of that yourself, do not edit the repo, and do not re-run the script if it fails.

After it exits, read the new lines at the end of `~/dev/scheduled-tasks/radish-requests/.watch.log` (the ones from this run) and finish with ONE plain sentence:
- nothing approved: "No new requests."
- otherwise: what request was handled and the outcome (pushed with short sha, PR, needs_human, or failed plus the reason from the log).

Never print secrets or the service_role key. No other actions.