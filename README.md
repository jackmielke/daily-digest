# A daily digest, made for anyone

Every morning something reads my own tools — chat, email, calendar, the code I wrote
yesterday, the meetings I sat in — researches the handful of things I actually care about,
and hands it back three ways: **a message on my phone**, **a page I read**, and **about
half an hour of audio in segments I listen to on a walk.** Then it does a shorter version
in the evening that corrects whatever the morning got wrong.

It has run every day since **21 August 2026**. In that time it has produced
**460 audio tracks — 26 hours of them**, averaging 33 minutes a day. I have replied to it
with **80 voice notes**, and those replies are the reason it is still worth opening.

It is plain markdown, so it runs on whatever agent you already use — Claude Code, Codex,
anything. The more tools that agent can reach, the better it gets.

---

## Start here

Paste this to your agent:

```
Read https://raw.githubusercontent.com/jackmielke/daily-digest/main/SKILL.md
and set it up for me. I'm not Jack — ask me what I actually want in mine,
and which of my tools you can reach, before you build anything.
```

That is the whole entry point. The agent reads the file, asks you what yours should
contain, and the two of you cut it down from there. If you'd rather see what you're
signing up for first, read [EXAMPLE.md](EXAMPLE.md).

---

## The part that makes it work: it rewrites itself

Everything else in here is plumbing. This is the actual idea.

**The digest is delivered somewhere I can reply to it.** Mine arrives in a Telegram chat
that exists for nothing else, so any message I send back is unambiguously an instruction
to it — typed, or more often a voice note while I'm walking, transcribed automatically.

**Every reply is read before the next one is written**, once, off a watermark so nothing
gets surfaced twice. A reply outranks everything else in the gather, because every other
source is the agent guessing what matters to me and a reply is me saying it.

**And then the important bit: a correction gets written into the skill file the same day.**
Not remembered for the session. Edited into the instructions, with the date and my own
words next to it, so it survives into every future run. "Stop comparing the prep rows to
the guest counts" became a rule. "You say *actually* and *genuinely* too much" became a
rule. "Don't write like a ledger" became a rule, and it changed the voice of the whole
thing more than any other single edit.

That is why the file is 29,000 words and why it reads like a pile of scar tissue. It is
one. Forty-odd days of me saying *no, not like that* and the file growing a reason each
time. A rule you can see the reason for is one an agent can apply intelligently; a rule
without one gets followed stupidly — which is also why none of the old rules were ever
compressed into tidy bullet points.

**If you take one thing from this repo, take that loop.** Make replying trivial, read the
replies first, and treat "stop doing X" as a permanent edit rather than a note. A digest
that cannot be corrected gets muted in a week.

---

## Two files are the whole thing

### **[SKILL.md](SKILL.md)** — the skill

**The real one.** Not a starter, not a cleaned-up version for an audience: this is the
working file my agent reads every morning, with the account identifiers stripped out and
nothing else changed. About 29,000 words.

It is long on purpose. Almost every rule in it exists because something specific went
wrong once, and it carries the date and the quote that produced it. A rule you can see
the reason for is one an agent can apply intelligently; a rule without one gets followed
stupidly. Hand it to your agent, swap my name for yours, and cut what you don't use.

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
- **[scripts/](scripts/)** — the three small scripts it calls: send a message, send a voice
  note, render the audio. The only things here that actually run.

You need an **agent**, an **API key for the audio**, and **some way to reach your own
phone**. On the audio key: your agent does the thinking, and the key is *only* for turning
the finished script into speech. OpenAI's `gpt-4o-mini-tts` is about **1.5¢ a minute**, so
half an hour a day is roughly **$14 a month**. ElevenLabs sounds slightly better at about
**14¢ a minute** — nine times more, which for a daily habit is the difference between not
thinking about it and thinking about it.

## What changed in this version

This used to be a monorepo of twelve skill files, a distilled starter, a `reference/`
folder, a sources menu and an auto-sync that mirrored my private repo on every commit.
Eight of those files were specific to one catering company and meaningless to anyone else,
and the sanitising pass that was meant to keep private things out was never something I
fully trusted.

**Now it is one skill and one example.** The skill is the genuine article rather than a
summary of it, sanitised by hand, published deliberately. The scripts and the page
template still mirror automatically, because prose drifting is a curation choice and code
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
- **Make replying trivial and act on the replies the same day.** This is the whole thing —
  see [the section above](#the-part-that-makes-it-work-it-rewrites-itself), and Step 3 in
  `SKILL.md` for how the replies actually get read.

## What's not here

The scrapers that read my own accounts, the account identifiers
(see [PRIVATE.example.md](PRIVATE.example.md) for the shape), and anything about the
people in my life. Your agent's own connectors do that job — this repo is the method and
the delivery, not a pile of credentials.
