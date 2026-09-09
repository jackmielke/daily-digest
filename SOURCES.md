# The sources

Every tool this thing reads, what each one actually returns, and — more usefully — what each
one gets wrong.

**Read this as a menu, not a requirements list.** Nobody has all of these and nobody needs
them. The digest was good with four. What follows is roughly the order I'd add them in, and
the failure modes are the part worth copying even if you wire up something completely
different.

Two things to know before the table:

- **Connected is not the same as used.** Six of the tools below were connected for weeks
  before the skill ever mentioned them, so the digest simply never opened them. That is the
  single most common failure here and it is invisible — a source the instructions don't name
  looks exactly like a source with nothing in it. There's a section at the bottom on how to
  catch it.
- **A tool that silently fails looks like a quiet day.** The contact resolver in this repo
  timed out on every single call for a fortnight, and every digest in that fortnight said
  "the name wouldn't resolve" as though that were a fact about the world. It was a fact about
  a timeout. **When a source keeps coming back empty, test the tool before you believe it.**

---

## Tier 1 — start here

These four are most of the value. If you only do this section you have a real digest.

| Source | What it gives you | What it gets wrong |
|---|---|---|
| **Calendar** | The day's shape, and the week ahead | **Defaults to one calendar.** Mine has eighteen. Telling someone they're free when they aren't is the worst error this makes — enumerate every calendar and merge, or say nothing about availability |
| **Email** | Confirmations, invoices, the things with dates attached | Mostly marketing. Search a 24-hour window and read maybe six. Flag phishing explicitly rather than summarising it as mail |
| **Chat** (Telegram, Slack, iMessage…) | What people actually said to you | Skip large group backlogs — hundreds of unread is a backlog, not a day. Report decisions, blockers, and things aimed at you |
| **Git / your code host** | What you built | **The author field does not tell you who wrote it.** An agent commits under your git identity. Classify by the agent's trailer instead, and never call something hand-written unless you've checked |

## Tier 2 — the ones that made it good

| Source | What it gives you | What it gets wrong |
|---|---|---|
| **Meeting recorders** (Granola, Wispr Flow) | The texture — what was decided, and every joke | **Read the verbatim transcript, not the summary.** Summaries are written to be useful, which is exactly what strips out the personality. Auto-generated titles are guesses: one filed a two-hour architecture argument as "Internet outage impact review". Speaker labels collapse voices — only name someone when you're certain |
| **Your own agent transcripts** | What you were *trying* to do, including everything that never reached a commit | Session-based tools often hand you the whole session when you ask for a window — a resumed session will give you three weeks of history labelled as yesterday. Filter by timestamp yourself |
| **Your product's database** | What people did with the thing you built | A zero often means "wrong column name", not "quiet". Check the table's actual timestamp column before reporting silence. And preview/staging traffic is not user traffic |
| **Notes / docs / a shared drive** | What the org actually knows | Cloud-synced drives are placeholder files: metadata is free, reading downloads. Never sweep — list what changed, open the one file that matters |

## Tier 3 — the personal ones

| Source | What it gives you | What it gets wrong |
|---|---|---|
| **Strava** | Distance, time, elevation, PRs | **No physiology unless a watch is syncing.** Phone-recorded activities have no heart rate at all. Never carries sleep, HRV or resting heart rate under any configuration |
| **Garmin** | Sleep + sleep score, resting heart rate, stress, steps, body battery | No consumer API — the unofficial library everyone's dashboard runs on, which breaks whenever Garmin changes auth. **Weekly, never daily**: a single night's score is noise you'd start believing |
| **Bank feed** (SimpleFIN) | Balances and transactions, genuinely read-only | The most sensitive thing here by a wide margin — see the rules below. Most days it should produce no line at all |
| **Watch history** (YouTube etc.) | The least filtered signal about what you actually want | Browser history misses phone and TV entirely. It shows what was *opened*, not finished. Many videos have captions disabled — say so rather than summarising from the title |
| **Photos** | What the day looked like | Orientation metadata gets stripped, and nothing can infer it. Look at them before publishing; a sideways photo at the top of the page is the most visible possible defect |

## The money rules

The bank feed is the one source where getting it wrong is not just embarrassing. Three rules:

1. **Never print a transaction list.** The page is a URL and the audio is a chat message.
   Merchant-level detail is a map of where you were and who you were with.
2. **Report the shape, not the ledger.** "Twenty-four transactions, $415 out" is a fact about
   the week. The individual coffee is not.
3. **Never advise.** No budgeting, no "you spent a lot on X". Same standing rule as markets.

What actually earns a line: a charge you wouldn't recognise, a duplicate, a subscription
renewing that you've already said you want cancelled, or a balance that moved hard against
its own baseline. Everything else is noise.

## The rest of the surface

Connected here and mostly **unused by the digest**, listed because they're the obvious next
moves rather than because they're wired in:

- **Accounting** (QuickBooks) — real P&L, AR aging, invoices, payroll. The single biggest
  unopened box: the digest reports a company's operations daily while its actual finances sit
  one tool away.
- **Your deploy platform** (Vercel) — build logs and runtime errors. Mine flagged "deploys
  have been failing since Monday" on two consecutive mornings without ever asking the
  platform *why*, which it could have answered in one call.
- **An app's own MCP**, if the thing you built has one. Mine exposes a clean
  `menu_status: "Full Menu Finalized"` while the digest was counting rows in the database
  underneath to infer the same fact, badly.
- **Job boards, design tools, cloud drives, browser automation, a music player, an iOS
  simulator, a memory layer.** Each is a lane you can turn on the day it earns a section.

**Don't wire these up because they exist.** Every source you add is more to read every
morning and more that can silently break. Add one when you can name the line it would have
written.

## Catching the tool you forgot you had

The gap this repo hit repeatedly: a tool gets connected, the instructions never mention it,
and it goes unread for weeks while the digest looks perfectly healthy.

Two cheap habits fix it:

- **Keep the source list in the file itself**, and print a coverage line in the digest — how
  many files, messages, or rows each source returned this run. A source that silently drops
  to zero becomes visible to *you*, not just to the next run.
- **Re-enumerate your connected tools every few weeks and diff against what the file names.**
  It takes two minutes and it is how all six of the unused ones above got found — the person
  reading the digest noticed before the thing writing it did.
