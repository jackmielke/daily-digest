# A daily digest, made for anyone

Every morning something reads my own tools — chat, email, calendar, the code I wrote
yesterday, the meetings I sat in — researches the handful of things I actually care about,
and hands it back three ways: **a message on my phone**, **a page I read**, and **about
half an hour of audio in segments I listen to on a walk.** Then it does a shorter version
in the evening that corrects whatever the morning got wrong.

It has run every day since **21 August 2026**. In that time it has produced
**387 audio tracks — 23 hours of them**, averaging 34 minutes a day. I have replied to it
with **80 voice notes**, and those replies are the reason it is still worth opening.

It is plain markdown, so it runs on whatever agent you already use — Claude Code, Codex,
Cowork. The more tools that agent can reach, the better it gets.

---

## Two files are the whole thing

### **[SKILL.md](SKILL.md)** — the skill

One file. Hand it to your agent, answer the three questions it asks you, and let it write
you your own. It covers the morning run, the evening run, the register that makes it worth
reading, and the feedback loop that keeps it from going stale.

### **[EXAMPLE.md](EXAMPLE.md)** — one morning, end to end

What it read, **the Notion row exactly as it prints**, the page it published, the audio,
and the message that arrived on my phone. A real day with the private parts swapped out.
Read this first if you want to know what you'd actually be getting.

The page it publishes is in here too — **[templates/digest.html](templates/digest.html)**,
one self-contained file with four reading styles, a photo strip and a lightbox, no build
step ([view it rendered](https://htmlpreview.github.io/?https://github.com/jackmielke/daily-digest/blob/main/templates/digest.html)).

That's it. Everything below is optional.

---

## Optional

- **[SETUP.md](SETUP.md)** — twenty minutes: a Telegram bot, an API key for the voice, and
  one test message on your phone before anything else.
- **[SOURCES.md](SOURCES.md)** — every tool it reads, what each returns, and what each gets
  wrong. **A menu, not a checklist** — it was good with four of them.
- **[scripts/](scripts/)** — the three small scripts it calls: send a message, send a voice
  note, render the audio. The only things here that actually run.
- **[reference/](reference/)** — a frozen snapshot of the two files that really ran on my
  machine on 29 September 2026: the 2,400-line morning brief and the evening check-in. Not
  synced, deliberately allowed to drift. Read `SKILL.md` first and raid these for the one
  rule you want.

You need an **agent**, an **API key for the audio**, and **some way to reach your own
phone**. On the audio key: your agent does the thinking, and the key is *only* for turning
the finished script into speech. OpenAI's `gpt-4o-mini-tts` is about **1.5¢ a minute**, so
half an hour a day is roughly **$14 a month**. ElevenLabs sounds slightly better at about
**14¢ a minute** — nine times more, which for a daily habit is the difference between not
thinking about it and thinking about it.

## What changed in this version

The repo used to mirror all twelve of my scheduled-task skill files into an `advanced/`
folder on every commit, eight of which were specific to a catering company and meaningless
to anyone else. It made a one-file starter look like a monorepo, and the sanitising pass
that was supposed to keep private things out of it was never something I fully trusted.

**So the syncing is gone.** The front door is hand-written for a stranger, `reference/`
is two frozen files, and nothing is auto-published from my private repo any more except
the scripts and the page template — because prose drifting is a curation choice and code
drifting is a bug.

## The parts worth stealing, even if you build your own

- **Never write like a ledger.** Nothing is owed, overdue, or finally done. That one rule
  changed the tone more than anything else in the file.
- **Three action items, maximum.** Nobody does eighteen. Eighteen makes it a chore list and
  chore lists get muted.
- **Read the verbatim transcript, not the summary.** Summaries are written to be useful,
  which is exactly what strips out the personality and the jokes.
- **Omit any section with nothing to say.** A shorter digest you read beats a complete one
  you skip.
- **The four sections nobody skips** are the generative ones: the three funniest things
  that happened, the invented ideas, the one technique, the three questions. The recap is
  the part you'd shorten; those are the part you'd forward.
- **Make replying trivial and act on the replies the same day.** This is the whole thing.
  See the feedback loop section in `SKILL.md`.

## What's not here

The scrapers that read my own accounts, the account identifiers
(see [PRIVATE.example.md](PRIVATE.example.md) for the shape), and anything about the
people in my life. Your agent's own connectors do that job — this repo is the method and
the delivery, not a pile of credentials.
