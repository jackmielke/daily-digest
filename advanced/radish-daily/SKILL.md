---
name: radish-daily
description: A team-facing operations digest for the whole catering company — today's event, the week ahead, kitchen and order changes — drafted daily into the private #daily-digest Slack channel for Jack to send.
---

Write **The Radish Daily** — a short operations digest about the whole catering company,
**sent to Jack on Telegram.**

**Written for the team, delivered to Jack.** That is the point of it: it is drafted as if
the kitchen were reading it, which is what keeps it operational instead of drifting into
Jack's personal digest. He reads it, and one day it may go to a channel. Until he says so
it is a Telegram message and nothing else — **do not draft it as a Slack post, do not
format it for Slack, and do not post it anywhere.**

Read `~/dev/scheduled-tasks/daily-digest/PRIVATE.md` for the Slack channel ids,
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
- **Any dollar figure.** Vendor invoice amounts, client invoice or contract totals,
  payroll, pay rates, hours, margins, cash position, who is owed what. Vendor spend by
  name plus a client's invoice total is enough for anyone to back out gross margin, so
  neither side goes in. Invoice *revision numbers* are fine; the amount on them is not.
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
2. **The shared drive** — `cd ~/dev/scheduled-tasks/daily-digest && bun radish-net.ts
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

**ORDERS** — how many vendor invoices were filed in the last 7 days and which vendors
delivered. No amounts, per vendor or in total (see the never-include list). No commentary
about whether it is a lot.

**FROM THE PATCH** — one genuinely funny thing from the jokes channel, quoted, with the
person named. Skip it rather than reach. This is what makes people open it.

## Tone

Warm, plain, useful. Written for a kitchen manager reading it on their phone before they
drive in. **Not corporate**: no "team", no "let's crush it", no exclamation marks that
aren't in a quote. **Never instruct anyone** — say what is true and let people act.

### The 6 September correction: stop sounding like this

Jack, on the first draft: *"Everything has the same type of way of talking. It says one
thing, 'worth 30 seconds,' and says, 'genuinely new.' There's this way of talking that's
just getting on my nerves."*

He is right, and the problem is bigger than two phrases.

**1. Kill the formula labels.** *"One thing worth thirty seconds."* *"Here's the thing."*
*"Two things worth knowing."* *"The one that matters."* These announce that something
important is coming instead of just saying it. **Delete the announcement and keep the
sentence.** If the Saturday party has no menu in the Hub, write that — do not build a
little stage for it first.

**2. The filler-word ban from the personal digest applies here and never got copied
across.** *genuinely, actually, truly, really, in fact, quite, very, simply, just,
honestly, certainly, definitely, clearly.* "Two genuinely new inquiries" is "two new
inquiries". Delete on sight; do not swap in a synonym.

**3. Vary the shape, and mostly have no shape at all.** The draft delivered every single
item the same way: bold claim, gloss, wry aside. That is a voice, and running it over a
shift count and a missing menu at identical volume is what makes it grating. **Most lines
in an ops digest are just facts and need no commentary.** "Friday: Hulseman 140 and
Vicente 124, thirty shifts across both." Done. No observation attached.

**Commentary is a scarce resource. Spend it once**, on the thing that actually needs a
human to act, and let everything else be plain.

**4. No self-correction in this channel.** Notes like *"I had that wrong yesterday"*
belong in Jack's own digest. The team does not need the digest's internal history.

**The test: read it back and count how many sentences have an opinion in them.** More than
one or two in a short ops post means it is performing rather than reporting.

## Never repeat yourself

Also from 6 September: *"It shouldn't repeat. It should only reference useful info. If
things change, it doesn't need to give all this info every single time. It should be able
to read the prior digests for the Radish."*

**The prior digests are in the channel.** The same `slack_read_channel` call that fetches
feedback fetches them — read the last several before writing, and diff against them.

- **A standing fact gets stated once, when it lands, and then only when it changes.** If
  yesterday said Friday is Hulseman 140 and Vicente 124, today does not repeat it. Today
  says what moved: a guest count firmed, a menu went final, a shift got filled.
- **An unresolved gap gets raised once, then goes quiet** until it either closes or
  becomes urgent because the date is near. Repeating it daily is nagging, and it is the
  fastest way to make a channel unreadable.
- **On a day when nothing changed, say so and stop.** Three lines is a fine digest. The
  padding instinct — restating the week because the section exists — is exactly what he is
  objecting to.
- **The week-ahead table earns a full restatement about once a week**, or when the shape
  of the week actually changes. Not daily.

## Deliver

**Authorized for Slack on 2026-09-06.** Jack created a private channel for it and said:
Jack, on shipping v1 to Slack: it is only him and the ops lead in the channel so far, so
there is nobody to embarrass. The channel id is in **`PRIVATE.md`**. The long-standing "do not post to Slack" rule is
lifted **for this channel only** — not for any other channel, and not for DMs.

**On 9 September he asked for it to post itself, and for the spoken version to go there
too.** Drafts are gone; this posts.

1. **Post it to the channel.** From `~/dev/scheduled-tasks/radish-brief`:

   ```
   bun send-slack.ts --channel daily-digest < digest.md
   ```

   That goes through the Hub's `radish-slack-send` edge function, which holds
   `SLACK_BOT_TOKEN` and allow-lists exactly one channel id, so this cannot be pointed
   anywhere else even by passing a raw id. It posts as **Radish Hub**, not as Jack.
   **Slack renders standard markdown here**, unlike the Telegram path — `*bold*`, bullets
   and headings all work. Use them.

   `--dry` prints instead of posting. Do not use `slack_send_message_draft` any more.

2. **Record the spoken version and attach it to the same message.** Same script style as
   the morning digest's Radish track — see WRITING THE SCRIPT in `speak-digest.ts`: no
   URLs, no markdown, no bullet characters, numbers spelled the way you would say them.

   ```
   cd ~/dev/scheduled-tasks/daily-digest
   bun speak-digest.ts --provider elevenlabs --no-send --out /tmp/radish-daily.mp3 \
     --set "Radish Daily <date>" --title "The Radish Daily" < script.txt
   cd ~/dev/scheduled-tasks/radish-brief
   bun send-slack.ts --channel daily-digest --audio /tmp/radish-daily.mp3 --audio-only \
     --audio-title "The Radish Daily — <date>"
   ```

   Pass `--audio` alongside stdin to do both in one call; the text lands first either way.
   The bytes go straight from the laptop to Slack's pre-signed URL — the Hub only brokers
   the handshake, so the mp3 never passes through Supabase.

   **ElevenLabs, deliberately** — Jack asked for that voice specifically for this one. It
   bills a credit per character on a ~37.5k monthly allowance, and a two-minute read is
   about 1,750. So **keep the spoken script to roughly two minutes**, and if the allowance
   is short (`--dry` prints the balance), fall back to `--provider openai` rather than
   skipping the audio.

   The spoken version is **not** the written one read aloud. Same facts, said the way a
   person would say them.

   > **Unblocked 10 September.** Jack added `files:write` to the bot token and
   > reinstalled the app, and the first upload landed. `--audio` works; the audio goes
   > to Slack and Telegram both. No need to test the scope first.

3. **Also send the text to Jack on Telegram** via `bun send-message.ts`, in the plain-text
   formatting described above, so he has it on his phone without opening Slack. The audio
   goes to Telegram too whenever the Slack upload is still blocked.

4. If the Slack connector or the drive is unavailable, say so in one line rather than
   quietly shipping a thinner digest.

## The feedback loop

Jack asked for this to work the way his personal digest does: *"It would be cool to have
a way of giving digest feedback... so we can just message in there."*

**Before writing anything, read the channel.** `slack_read_channel` on the channel id in
`PRIVATE.md`,
twenty messages. Anything either of them has posted since the last digest is feedback and
**outranks every other input in this skill**, exactly as a Telegram reply does in the
morning digest. Concretely:

- **A correction gets fixed and acknowledged in one clause** at the top of the next one.
- **"Stop doing X" is permanent** — write it into this file the same day. A preference he
  has to repeat is a preference this skill failed to record.
- **The ops lead's feedback carries the most weight of anything here** (see `PRIVATE.md`), because she is the
  reader this is actually written for and the only person outside Jack who sees it. If she
  replies at all, that is the signal — most channels of this kind die unanswered.
- **Silence is data too.** If neither of them has said anything for several days running,
  say so once in Jack's own digest rather than in this one, and ask whether it should
  change shape or stop.

## What the audience means right now

The channel is Jack and the ops lead today and is meant to grow to the team. **Write it for the
team from the start** — the confidentiality rules above are not relaxed because only two
people can currently see it. The one nuance: an **aggregate** operational number is fine
(*"eight of ninety-eight shifts aren't linked to a person in the Hub"*); the same fact
with a name on it is not.

## The durable version, when the content settles

Posting will eventually come from the Hub itself rather than from this skill — the Radish
project already has `radish-slack-send`, `slack-notify` and a `radish-morning-brief`
function, and a live `SLACK_BOT_TOKEN`. **`radish-slack-send` is DM-only today** and
allow-listed to Jack and the ops lead; a channel version needs an optional allow-listed
`channel` argument, plus **the Hub's Slack bot invited into that channel, which is
private and will silently fail otherwise.**

**Do not build that yet.** The point of the draft phase is finding out what the ops lead reads.
Shipping a cron that posts something nobody opens is the expensive mistake, and the only
way to avoid it is to watch which parts get a reply first.
