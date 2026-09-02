# A daily digest, made for anyone

Every morning something reads my own tools — chat, email, calendar, the code I wrote
yesterday, the meetings I sat in — researches the handful of things I actually care about,
and hands it back as a page I read and about twenty minutes of audio I listen to on a walk.

It's been running daily since August 2026. This is the method, in one file.

## Start here

**[`SKILL.md`](SKILL.md)** — the whole thing. Give it to your agent, answer the four
questions it asks you, and let it write you your own.

**[`SETUP.md`](SETUP.md)** — twenty minutes: a Telegram bot, an API key for the voice, and
one test message on your phone before anything else.

That's it. 

## What you need

- **An agent.** Claude Code, Cowork, Codex, whatever you use — these are plain markdown
  files, not code that only runs one place. A cloud agent means it runs without your laptop
  being open, which is the version I'd recommend to start.
- **An API key for the audio**, and this is the one thing worth being precise about: your
  agent does the thinking, and the key is *only* for turning the finished script into
  speech. OpenAI's `gpt-4o-mini-tts` is about **1.5¢ a minute**, so twenty minutes a day is
  roughly **$9 a month**. ElevenLabs sounds a little better and is about **14¢ a minute** —
  nine times more, which for a daily habit is the difference between not thinking about it
  and thinking about it.
- **A Telegram bot**, or any other way to get it onto your phone. Ten minutes with
  `@BotFather`.

## The parts worth stealing, even if you build your own

- **Never write like a ledger.** Nothing is *owed*, *overdue*, or *finally* done. This one
  rule did more for how it reads than everything else combined.
- **A story runs once.** A repeat has to say what changed. The topics you care about most
  are the ones it will restate most.
- **Rank your date sources: written confirmation > calendar > transcript.** Most of a life
  gets rescheduled in channels a script cannot see.
- **Let it edit its own instructions from your feedback.** Without that loop it drifts and
  you never find out why.
- **Watch the file grow.** Mine reached 124KB and ~400 prohibitions by only ever being
  appended to, and the output went flat and careful. If an edit makes it longer, look for
  what it supersedes.

## What's not here

The scrapers for my own accounts — Telegram, Granola, Gmail, Notion, GitHub, Supabase, a
company drive. They're wired to me and would do you no good. What `SKILL.md` gives you
instead is what each source *returns* and what it *gets wrong*, which is the part worth
copying. Your agent can write its own in an afternoon.

`PRIVATE.md` isn't here either — see [`PRIVATE.example.md`](PRIVATE.example.md) for the
shape. Wherever a skill says *see PRIVATE.md*, that's a value you fill in with your own.

## How this repo stays honest

These are byte-for-byte the files that ran this morning, pushed automatically by a hook on
every commit — not a cleaned-up copy. A verifier refuses the push if it finds an identifier,
address, phone number or home path that should have stayed private. It has already caught a
friend's phone number and someone's email that would otherwise have gone out.

## Licence

Do what you like with it. If you build something better, I'd like to see it.
