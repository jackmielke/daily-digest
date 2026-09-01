# Setting this up for yourself

**Read this before pointing an agent at the skill files.** They describe a system that has
been running daily since August 2026, and they are written for *that* system — they name
tools, connectors and habits that are mine. The value here is the method, not a turnkey
install.

**Start much smaller than what's in here.** Three sources and a written page is a real
product. Mine began as one Telegram scrape and a Notion page. Everything else — the audio,
the photos, the feedback loop — came later, and only because the small version was already
worth reading.

---

## The 20-minute version

You need three things.

**An agent** — Claude Code, Cowork, Codex, whatever you use. These are plain markdown
files. **A cloud agent is the easier start**, because it runs without your laptop being
open, and you can set the whole thing up from your phone.

**An API key for the voice.** Worth being precise, because it confuses people: your agent
does all the thinking and writing. The key is *only* for turning the finished script into
speech. OpenAI's `gpt-4o-mini-tts` is ~1.5¢/minute — twenty minutes a day is about **$9 a
month**. ElevenLabs sounds slightly better at ~14¢/minute, **nine times more**. Either
works; `--provider elevenlabs` switches.

**A Telegram bot.** Ten minutes, and it's the fastest way onto your phone.

### 1. A bot, and your chat id

- Message `@BotFather`, send `/newbot`, follow it, keep the token.
- Message `@userinfobot`; it replies with your numeric user id.
- **Message your new bot once.** A bot cannot open a conversation with you.

### 2. Config

```
git clone https://github.com/jackmielke/daily-digest
cd daily-digest/scripts
```

Create `.env` beside the scripts with three lines:

```
TELEGRAM_BOT_TOKEN=123456:AA...
TELEGRAM_CHAT_ID=987654321
OPENAI_API_KEY=sk-...
```

Then:

```
echo "hello from my digest" | bun reply-to-jack.ts
```

If that arrives on your phone, delivery works. **Get that far before anything else.**

### 3. The audio

`speak-digest.ts` reads tracks from stdin, split on `== Track name ==` lines. Run it with
`--dry` first: it prints the plan and the cost and spends nothing.

Voice defaults to `ballad`. `--voice ash|onyx|fable|nova|shimmer` are alternatives, and
`--instructions "..."` steers accent and delivery in plain English — that's how you get a
particular kind of reader rather than a generic one. Mine is a British broadcaster reading
it straight.

**The hard limit: ~8,800 characters per track.** Over that you get a 400 from OpenAI, and
because every track renders before the first one sends, *nothing* goes out. Reckon ~840
characters per spoken minute.

### 4. Tell your agent what you actually want

Point it at **`SKILL.md` in the repo root** — that's the whole method, one file. It will
ask you four questions about your own sources and interests, then write you your own
version.

**`advanced/` is optional and mostly specific to me.** Don't start there. In particular
don't point an agent at `advanced/daily-digest/SKILL.md` and say "do this" — it's 1,800
lines about my life and it will try to read my client's Slack.

---

## What's here, and what isn't

| | |
|---|---|
| `SKILL.md` | **The whole thing.** Start and probably finish here. |
| `scripts/` | The three reusable pieces: audio, and two ways to message yourself |
| `advanced/` | Six elaborations I added later. Optional. See `advanced/README.md` for what each adds and when you'd want it. |

**Not here:** the scrapers for my Telegram, Granola, Gmail, Notion, GitHub, Supabase and
the company drive. They're wired to my accounts and would be useless to you. What the skill
files *do* give you is what each one returns and what it gets wrong, which is the part
worth copying — your agent can write its own against your tools in an afternoon.

`PRIVATE.md` is not here either. See `PRIVATE.example.md` for the shape. Wherever a skill
says *see PRIVATE.md*, that's a value you fill in with your own.

---

## The things that will actually make or break it

Six lessons that each cost a bad digest. There are more in `SKILL.md`.

1. **Never write like a ledger.** Nothing is *owed*, *overdue*, or *finally* done. Ban the
   whole family — "you finally", "still hasn't", "it's been N days and". This one rule did
   more for how mine reads than everything else combined.
2. **A story runs once.** Keep a record of what you've already reported and check it before
   writing. The topics you care about most are the ones it will restate most, because it
   keeps reaching for them and there's rarely new news.
3. **Rank your date sources: written confirmation > calendar > transcript.** Most of a life
   gets rescheduled in channels a script cannot see. A date heard once in a meeting is a
   snapshot of what was true when someone said it.
4. **Build the feedback loop early.** Mine reads my replies and edits its own instructions,
   commits, and tells me what changed. Without it a skill drifts and you never find out why.
5. **Watch the file grow.** Mine reached 124KB and ~400 prohibitions by only ever being
   appended to, and the output went flat and careful — correct and lifeless. If an edit
   makes the file longer, look again for what it supersedes.
6. **Write the audio as its own script.** Not the page read aloud: no URLs, no markdown,
   numbers spoken as words. It's the part you'll actually use, so it deserves its own pass.

---

## If it becomes annoying

That's the normal failure, not a rare one. It will nag you about a backlog, restate
yesterday's news, and read like a chore list.

The fixes, in order: **cut the action list to three items**, **delete a whole section
rather than shortening it**, and **tell it to omit anything it has nothing new to say
about**. A shorter digest you read beats a complete one you skip.

If it says something that isn't true, tell it — and make it write the correction into its
own file. That's the loop that makes it get better instead of just getting longer.
