# One morning, end to end

This is what a single day actually looks like: what it read, what it filed, what it
published, and what arrived on the phone. Everything private has been swapped for an
invented Tuesday — **14 October 2026** — but nothing about the *shape* is invented. Same
sections, same length, same order, same four outputs.

Read this with [`SKILL.md`](SKILL.md) open and it'll be obvious what each rule is for.

Four things happen every morning, in this order:

| | | |
|---|---|---|
| **1. It reads** | your own tools | ~6 minutes |
| **2. It files** | a Notion row — the archive | the full digest |
| **3. It publishes** | an HTML page — the thing you read | same words, better typeset |
| **4. It speaks** | 3–5 audio tracks | ~20 minutes, for a walk |

Then a Telegram message with links to all four, so you get the gist without opening
anything.

---

## 1. What it read

This is the part people are surprised by: it isn't a news feed with your name on it. It
reads **your** last 24 hours first, and the world second.

| Source | What it actually pulled that morning |
|---|---|
| Group chats | 41 messages across 6 chats. Three mattered: a payment marked sent that hasn't landed, a question aimed at you, and a room arguing about an outage |
| Meeting transcripts | 2 recordings, read **verbatim** — not the summaries. One was auto-titled "Internet outage impact review" and was actually a two-hour argument about infrastructure |
| Voice notes | 4 minutes dictated while walking. Unedited, and usually the most honest signal in the day |
| Email | 19 threads, 2 needing a reply, 1 phishing attempt named as such |
| Calendar | every calendar, not just the primary one. 3 events, 2 holds expiring at midnight |
| Git | 17 commits across 3 repos, 16 of them one story |
| Notes / docs | 8 pages edited, grouped into what you were actually working on |
| Database | the nightly importer wrote **0 rows** where 57 were expected |
| Health | 5h27 sleep, score 55 |
| Photos | 3 from the camera roll, timestamped and captioned |
| The web | one search per topic you said you cared about — 6 topics, 3–6 linked bullets each |

Two rules do most of the work here:

- **Report decisions, blockers, and things aimed at you** — not everything that happened.
  A notification is noise; a person saying "I can't do this" is not.
- **Rank your date sources: written confirmation > calendar > transcript.** Most of a
  life gets rescheduled in channels a script cannot see, so a date heard once in a
  meeting is a snapshot of what was true when somebody said it.

Nothing here is scraped from the open internet about you. It's your own accounts, read
with your own credentials, by an agent running on your own machine or your own cloud
account. The scrapers aren't in this repo — see [what's not here](README.md#whats-not-here).

---

## 2. What it files in Notion

Every day is one row in one database. A year of rows is the archive, and the titles are
what make it worth keeping.

### The row

| Property | Value |
|---|---|
| **Title** | `The importer stops eating rows, and a stranger finds the sign-up form` |
| **Date** | `2026-10-14` |
| **TL;DR** | An overnight job failed silently for the second night; the first unprompted sign-up arrived. |
| **Themes** | `Agent infra` · `Money` · `Health / sport` |
| **Needs Attention** | ✅ |
| **Open Actions** | `3` |
| **Meetings** | `2` |
| **Icon** | 🛠️ |

The title is the whole point of the database. **Name the two or three things the day was
actually about**, biggest first, so you can scan a year and remember each day. Never
"Daily Digest — 14 October" — the date has its own column.

### The page, as it prints

Notion gets a visual header first — four stat callouts, chosen for what actually
characterised the day, not a fixed set:

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ 📉  0        │ ⚙️  17       │ 🗓️  2        │ 🌙  5h27     │
│ rows written │ commits      │ meetings     │ sleep · 55   │
│ (57 expected)│ shipped      │ captured     │              │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

Then a table of contents beside a single grey callout — **the one thing**, if you do
nothing else today. Then the sections, in this order, each omitted on a day it has
nothing to say:

```
⚡ Flagged                  the 2–5 genuinely urgent things, and nothing else
Three questions for you     answerable in one clause while walking
Since yesterday             what moved on threads from recent digests
Chat highlights             by conversation, action items called out
From your own notes         the voice memos, unedited
Meeting notes              decisions and actions, read from the transcripts
The day, reconstructed      a narrative of yesterday, hour by hour
Email                       including the phishing, named
What you shipped            17 commits as one story, not 17 bullets
Sharpening                  one technique, aimed at something you did this week
Action items                three, in the open
Comedy                      the three funniest things, verbatim, speaker named
Five new ideas              mechanisms, not suggestions
Today in AI & tech          your stack first, then the wider conversation
Sports · Adventure          a scoreboard table, then one thing you could do this weekend
The world                   3–5 bullets, even-handed, each with why it matters
Markets                     a table, reported — never advice
```

Two of those sections are the reason it gets opened at all, and neither is a recap:

> ## Comedy
>
> **1.** In the middle of the outage argument, somebody said *"okay but who owns the
> thing that owns the thing"* and the room went quiet for four seconds.
>
> **Best quote of the day** — your own voice note, 07:12: *"I think I've built a machine
> that reads my whole life and its main hobby is telling me I didn't sleep."*
>
> **Most absurd fact** — the parser that returned zero rows has run 1,190 times and
> exited `0` every single time, including the 47 times it did nothing at all.

Quoted verbatim, speaker named, never cleaned up — the stumbles *are* the joke, and a
fabricated quote poisons the one section read purely for pleasure.

> ## Five new ideas
>
> **Ship the failure as the feature.** Put a one-line "last run wrote N rows" badge at
> the top of the internal dashboard. Trigger: every nightly run. Size: an afternoon.
> Second-order effect: a job that succeeds at doing nothing becomes visible to whoever
> looks at the dashboard first, which is not you. What kills it: nobody opens the
> dashboard, in which case the badge belongs in the morning message instead.

Mechanisms, not suggestions: name the surface, the trigger, the size, the second-order
effect, and the thing that would kill it. "Make content about the robot" is not an idea.

---

## 3. The page it publishes

The Notion row is the archive. **This** is what actually gets read in the morning — the
same words, typeset like a newspaper, on one stable URL that republishes every day.

**→ [`templates/digest.html`](templates/digest.html) is the real template, seeded with
this same invented Tuesday.** Download it and open it in a browser, or
[view it rendered](https://htmlpreview.github.io/?https://github.com/jackmielke/daily-digest/blob/main/templates/digest.html).

It's one self-contained file — no build, no server, no dependencies — and it carries:

- **A masthead and a deck.** One sentence on what the day *was*. Not a list of sources;
  the margin already says where each entry came from.
- **A ledger of four numbers**, the same four as the Notion header.
- **Marginalia.** Every entry carries its source and its timestamp in the left margin,
  so you can see at a glance whether a claim came from a transcript or a guess.
- **A photo strip** that fills itself from the photos already inline, and a lightbox on
  click — full-screen on a laptop, swipe on a phone.
- **Four skins** — Almanac (sage paper), Broadsheet (newsprint, one red for alarms),
  Dispatch (two-ink risograph), Night. The choice persists; it deliberately ignores your
  OS dark mode, because a theme you didn't pick is worse than one you did.
- **A nav strip** with a scroll spy, and a mobile picker under 760px.

One warning that cost a day to learn: **photos have to be inlined as `data:` URIs.** If
you publish this inside an artifact viewer, its CSP blocks every hotlinked image, so
YouTube thumbnails and external photos render as broken boxes. Images are fine on the
Notion page. See [`templates/README.md`](templates/README.md) for the rest of the
things in there that look arbitrary and aren't.

---

## 4. The audio

The part that turns it into a habit rather than a tab. Three tracks that morning, about
nineteen minutes:

| Track | Minutes | What's in it |
|---|---|---|
| 1 — What needs you | 5:10 | the importer, the payment, the two expiring holds |
| 2 — Your day and what you built | 7:40 | the reconstruction, the meetings, the 17 commits |
| 3 — The world, and one tangent | 6:20 | the six research topics, then the eulogy for a retired model |

It is **a new script written for the ear**, not the page read aloud. No URLs, no
markdown, no tables, and numbers as spoken words — "a hundred and twenty-six commits".
Each track stands alone so you can skip. The opening line of track one:

> Morning. I went through the messages, and there's one real thing before anything else:
> the importer ran at two and wrote nothing at all — second night in a row — and it still
> told us it succeeded.

A narrator can have a name but **not a biography**. What works is closing the distance —
contractions, an occasional "I went through the messages this morning". What fails is the
costume: the moment the narrator starts narrating itself, the persona eats the
observation.

Keep each track under ~8,800 characters. Over that, the text-to-speech API returns a
400 — and because every track renders before the first one sends, *nothing* goes out.
Reckon ~840 characters per spoken minute.

---

## 5. The message on the phone

```
🌿 The importer stops eating rows, and a stranger finds the sign-up form

An overnight job failed silently for the second night; the first
unprompted sign-up arrived.

⚡ The 02:00 importer wrote 0 rows where 57 were expected — and
exited 0, so nothing alerted.

Read it → Page · Notion        🎧 3 tracks · 19 min
```

You reply to that message in your own words — *"less crypto"*, *"the joke section is the
best part"*, *"stop telling me what I haven't done"* — and the agent edits its own
instructions from what you said. That loop is the difference between a thing that
improves and a thing that drifts.

---

## What it costs, honestly

| | |
|---|---|
| Audio | ~1.5¢/minute with OpenAI's `gpt-4o-mini-tts` → **about $9/month** for 20 min/day |
| The agent | whatever your existing plan is; a morning run is a few cents of tokens |
| Your time | 20 minutes to set up, then about 90 seconds a day replying to it |

The overnight run on the invented Tuesday cost **11 cents**.

---

## The failure you'll actually hit

Not a crash. **It becomes annoying.** It nags about a backlog, restates yesterday's news,
and reads like a chore list. That's week two, not a rare edge.

The fixes, in order: **cut the action list to three**, **delete a whole section rather
than shortening it**, and **omit anything you have nothing new to say about.**

A shorter digest you read beats a complete one you skip.

---

Next: [`SKILL.md`](SKILL.md) is the one file to hand your agent.
[`SETUP.md`](SETUP.md) is the twenty minutes of plumbing.
