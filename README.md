# A daily digest, in the open

Four scheduled Claude Code tasks that read my own tools every morning — chat, meetings,
email, calendar, the company Slack, the codebase, the database — research the things I
actually care about, and hand it back as a written page, a Telegram message, and about
twenty minutes of audio I listen to on a run.

**These are the real files, not a writeup.** They are the exact instructions that ran
this morning, mirrored here automatically whenever I change them. The history is the
history: every commit is a thing that went wrong once and got fixed.

| Skill | When | What it does |
|---|---|---|
| [`daily-digest`](daily-digest/SKILL.md) | 06:01 daily | The briefing |
| [`digest-checkin`](digest-checkin/SKILL.md) | 17:05 daily | Did the morning's claims survive the day? |
| [`digest-feedback`](digest-feedback/SKILL.md) | on reply | Turns my Telegram replies into edits to these files |
| [`weekly-review`](weekly-review/SKILL.md) | Sundays | Trends, not events — and an audit of the action list |
| [`sync-skills`](sync-skills/SKILL.md) | nightly | Mirrors these into Notion |

## Reading this without copying it

`daily-digest/SKILL.md` is about 1,800 lines and most of it is specific to my life. If
you want to build your own, the parts worth stealing are:

- **Step 7d, the register.** Never write like a ledger — nothing is *owed*, *overdue* or
  *finally* done. This one rule did more for how the digest reads than everything else
  combined.
- **The anti-repetition rule.** A story runs once; a repeat has to say what changed. The
  topics you care about most are the ones it will restate most.
- **"Dates are provisional unless something wrote them down."** Ranked sources: written
  confirmation > calendar > transcript. Most of a life gets rescheduled in channels a
  script cannot see.
- **The feedback loop.** I reply in Telegram and the file edits itself, commits, and tells
  me what changed. Without it a skill drifts and you never find out why.
- **"How to read this file"** at the top. This document grew to 124KB and ~400
  prohibitions by only ever being appended to, and the output went flat and careful. The
  preamble exists to stop that happening again.

## What's redacted, and how

A script mirrors these from a private repo and **refuses to publish if it finds anything
it doesn't have a rule for** — long hex, uuids, api-key shapes, addresses, phone numbers,
absolute home paths. It fails closed, so a new integration breaks the mirror instead of
leaking through it. It has already caught a friend's phone number and a third party's
email address that I would have missed.

What's replaced: account and channel ids, calendar ids, project refs, my colleagues'
names, one medical detail, and the client's identity. What's kept: everything about how
it actually works — the techniques, the failure stories, the API gotchas, and my own
words about how I want to be written to.

Placeholders look like `<project-ref>`, `C0XXXXXXXXX`, `the client`, `a colleague`.

## Licence

Do what you like with it. If you build something better, I'd like to see it.
