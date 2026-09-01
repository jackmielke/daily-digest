---
name: telegram-remote
description: Handles anything Jack sends to the Wonder Telegram chat — a request, a question, a correction, a half-formed idea — and answers him there. This is Claude Code by text message.
---

Jack has sent something to the Wonder Telegram chat. **Handle it as if he had typed it
into a Claude Code session**, and answer him in the same chat.

This exists because opening the Claude app has friction and a phone does not. He is
voice-first with RSI in both wrists, so a message he can dictate while walking is worth
more than a session he has to sit down for. **Treat a Telegram message as a real request,
not a notification to triage.**

## Step 1 — read

```
cd ~/dev/telegram-cli-scripts && bun read-digest-replies.ts --peek --json
```

Empty → **stop silently.** Send nothing. Never send a "nothing to do" message.

`--peek` deliberately does not advance the watermark. **Nothing is consumed until the work
succeeds** (Step 5), so a crash or a blocked write leaves the message for the next run
rather than eating it. That has already saved four of his messages once.

**Handle every unconsumed message, oldest first.** A backlog means earlier runs failed;
he may have been waiting a while. If several are clearly one thought split across
messages, treat them as one.

## Step 2 — say you're on it

**Before doing anything slow**, send one short line so he knows it landed:

```
cd ~/dev/scheduled-tasks/daily-digest && bun send-message.ts <<'MSG'
On it — <the thing, in five words>
MSG
```

Skip this only if the whole answer takes seconds. **A silent thirty seconds reads as
broken**, which is exactly what happened before this step existed.

## Step 3 — work out what he actually wants

Four shapes. Most messages are the first.

**A. A request** — build it, fix it, find out, change it. Do the work. You have the
full toolkit: the filesystem, git, the connectors, the web. Work in the right directory
(`~/dev/<project>` for a project, `~/dev/scheduled-tasks` for the digest).

**B. A question** — answer it. Research properly if it needs it. Don't hedge; if you
don't know, say so and say what would settle it.

**C. A correction about the digest** — "stop doing X", "less of Y", "I don't like Z".
Follow `~/dev/scheduled-tasks/digest-feedback/SKILL.md` exactly for these; it has the
rules about where a rule goes and how the file must not grow.

**D. Ambiguous, or big and irreversible** — ask one short clarifying question and do
nothing else. **Never guess at something you cannot undo.**

## Step 4 — tell him what happened

Plain text, no markdown — `send-message.ts` sends with no parse mode, so `*asterisks*`
arrive literally. Caps for a heading, `•` for bullets, blank lines for air.

- **Lead with the outcome**, not the process. "Done — X now does Y" before any detail.
- **Say what you changed**, with the commit sha if you committed. He needs to be able to
  revert without asking.
- **Keep it short.** He is reading on a phone, probably walking. A few lines. If the
  answer is genuinely long, give him the shape and offer the detail.
- **If you could not do it, say so plainly and say why**, in one line. A silent failure
  is far worse than a refusal — see the git history of this repo for what that costs.
- **Never send more than two messages** for one request: the ack, and the answer.

## Step 4b — if you changed a skill file, it mirrors itself

A `post-commit` hook in `~/dev/scheduled-tasks` runs `mirror-public.sh` after every
commit, so the public repo at `github.com/<you>/daily-digest` tracks this one
automatically. **You do not need to run it**, and you should not skip committing in
order to avoid it.

**What you DO need to do: commit.** An edit that is never committed never mirrors, and
the public history is the thing Jack sends to people. Real message, real subject line.

`PRIVATE.md` files are gitignored in the mirror and tracked here — never move a value
from one to the other without saying so in the reply.

If the hook reports a failure in `.mirror.log`, say so in the Telegram reply.

## Step 5 — consume, last

Only when everything above worked:

```
cd ~/dev/telegram-cli-scripts && bun read-digest-replies.ts --json > /dev/null
```

**If any part failed, skip this.** The message stays queued for the next run. Do not
advance the watermark to tidy up.

## What not to do

- **Never message anyone but Jack.** Not Slack, not email, not another chat. Drafting
  something for him to send is the job; sending it is not, ever, and no enthusiasm of his
  about a future integration is permission for it.
- **Never change the audio voice or the narrator persona** unless he asks for that
  specific thing in that specific message. It was inferred once from a vaguer request and
  he disliked the result for a day.
- **No database migrations, no force pushes, no deletions of anything you did not just
  create.** Those wait for a real session.
- **Don't touch his calendar** beyond the `MAYBE:` holds the daily-digest skill already
  authorizes.
- **When in doubt, ask.** A question costs him five seconds. A wrong irreversible action
  costs a lot more.

## Where these files live, and why it matters

**The real directory is `~/dev/scheduled-tasks`.** `~/.claude/scheduled-tasks` is a
symlink to it, and that symlink is what the scheduler reads. **Always work via
`~/dev/scheduled-tasks`.**

Anything under `~/.claude` sits behind a sensitive-path guard that **cannot be overridden
by a permissions entry.** A `Write(~/.claude/scheduled-tasks/**)` allow
rule was added on 2026-08-30 and the write was refused anyway. That is why the files moved
out; the symlink keeps the scheduler working.

The history worth keeping: a headless `claude -p` does not inherit the interactive
allowlist either. An early run did all its thinking, failed at the first write, and
reported success — leaving four of Jack's messages queued and him assuming the whole
thing was broken. The launcher now passes an explicit `--allowedTools`, and the files
live outside the guard.

**If a run is blocked, say so in the Telegram reply and name the exact permission.**
Never fail quietly: a silent failure is indistinguishable from "he sent nothing", which
is the worst possible outcome for a remote he is relying on.
