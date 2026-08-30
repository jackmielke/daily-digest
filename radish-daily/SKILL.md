---
name: radish-daily
description: A team-facing operations digest for the whole catering company — today's event, the week ahead, kitchen and order changes — drafted for Slack, never posted automatically.
---

Write **The Radish Daily** — a short operations digest about the whole catering company,
**sent to Jack on Telegram.**

**Written for the team, delivered to Jack.** That is the point of it: it is drafted as if
the kitchen were reading it, which is what keeps it operational instead of drifting into
Jack's personal digest. He reads it, and one day it may go to a channel. Until he says so
it is a Telegram message and nothing else — **do not draft it as a Slack post, do not
format it for Slack, and do not post it anywhere.**

Read `~/.claude/scheduled-tasks/daily-digest/PRIVATE.md` for the Slack channel ids,
the Supabase project ref, and who the named people are.

## The one rule that matters most

**Jack's own Radish section is good because it carries confidences. This one cannot
carry any of them.**

His digest reports the owner saying in `#urgent` that she is stretched too thin and
making mistakes; the finance channel saying which bills cannot be paid; someone quitting
and asking for their job back. Those are the most useful lines in his digest and they are
**disqualifying** here. This goes to the whole company.

**The test before any line ships: would you be comfortable reading it aloud, to the whole
team, with the person it is about standing in the room?** If not, it does not go in. That
is not a softening of the digest — it is a different product with a different audience.

Specifically, never include:
- **Anything about a named person's state, performance or mistakes.** No "the owner is
  overwhelmed", no "X is behind", no "Y forgot".
- **Finance beyond vendor spend.** Payroll, margins, cash position, who is owed what.
- **Anything from a DM, or from a channel most of the team cannot see.**
- **Individual staffing gaps that single someone out** — an unmatched shift record is an
  admin detail for Jack, not a company broadcast.
- **Client complaints, or anything a client would not want repeated.**

When you cut something that matters, it does not vanish — **it belongs in Jack's own
digest tomorrow**, which is where it already goes.

## What to gather

Read-only, all of it.

1. **Supabase (the Hub).** Won events for the next 10 days: name, date, guest count,
   service style, venue, and offering count. Then `weekly_schedule_shifts` for the next 7
   days: shifts, roles, and the event label.
2. **The shared drive** — `cd ~/.claude/scheduled-tasks/daily-digest && bun radish-net.ts
   --recent 2` for what changed, and `--spend 7` for vendor invoices.
3. **Slack**, the channels in `PRIVATE.md`. Read `#the-radish-patch` for one warm human
   line. Read the ops channels for anything genuinely operational — a venue change, a
   tasting date, an equipment problem. **Read `#urgent` and the finance channel only to
   know what NOT to say.**

## The shape

Keep it under ~300 words of text. Sections, in this order:

**TODAY** — the event, guest count, venue, service style, who is on by role, and whether
the menu and paperwork are final. If there is no event, say what the day is instead
(prep, warehouse, a kitchen day) rather than nothing.

**THIS WEEK** — one line per day. Name the big one and say plainly that it is the big one.
**Say when something is fully staffed** — that is good news and it is worth telling people.

**KITCHEN** — menus that moved to FINAL, production notes that landed, anything the
kitchen would want to know before they arrive.

**The one thing worth catching** — at most one, and only when it is real and actionable
by someone reading. A won party inside a week with a final menu on the drive and nothing
in the Hub is the archetype: specific, fixable, and nobody's fault. **Phrase it as a gap
in the system, never as someone's failure.** No such thing on a clean day is a fine answer.

**ORDERS** — vendor invoices filed in the last 7 days, the total, and the top few by
vendor. Numbers only, no commentary about whether it is a lot.

**FROM THE PATCH** — one genuinely funny thing from the jokes channel, quoted, with the
person named. Skip it rather than reach. This is what makes people open it.

## Tone

Warm, plain, useful. Written for a kitchen manager reading it on their phone before they
drive in. **Not corporate**: no "team", no "let's crush it", no exclamation marks that
aren't in a quote. **Never instruct anyone** — say what is true and let people act. The
one exception is the catch, which can say "worth five minutes from whoever gets there
first."

## Deliver

1. **Send it to Jack on Telegram**, via
   `cd ~/.claude/scheduled-tasks/daily-digest && bun reply-to-jack.ts`.

   **Format for plain text.** `reply-to-jack.ts` sends with no parse mode, so `*bold*`
   and `_italic_` arrive as literal asterisks and underscores — they did in the first
   sample. Use what actually renders: a bare line of CAPS for a section head, `•` for
   bullets, `—` for breaks, blank lines for air. Nothing else.

   **Sending to Slack is not authorized and is not covered by any standing permission.**
   Jack's interest in eventually putting this in a channel is not that permission.
2. **Then the audio**, one track, 1:30–2:30, via `speak-digest.ts --set "Radish Daily"`.
   Same rules as the morning digest: written for the ear, no URLs, no markdown, numbers
   spoken as words. It is the same content, not a summary of it.
3. If the Slack connector or the drive is unavailable, say so in one line rather than
   quietly shipping a thinner digest.

## Later, when Jack says so

The intended home is a dedicated Slack channel people can join or leave. Until he
explicitly authorizes posting, this is a draft he reviews. Do not treat his enthusiasm
for the idea as permission to post.
