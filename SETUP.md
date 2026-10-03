# Setting this up for yourself

**This is one file plus three scripts.** `SKILL.md` is the method, distilled from a digest
that has run every morning since August 2026. It is a method to adapt, not a turnkey
install — your agent reads it, asks you three questions, and writes you your own.

**Start much smaller than what's in here — on sources, not on outputs.** Three sources is
a real product; mine began as one Telegram scrape. But build all three outputs on day one
even if each is thin: **a page, audio tracks, and a message that links to both.**

That distinction matters more than anything else on this page. The written recap needs no
keys and no hosting, so it is the part an agent will happily ship on its own, and a digest
that is only a block of text in a chat window stops getting opened in about a week. The
audio is the part that turns it into a habit, and it is the part that gets quietly
dropped. If your agent hands you a lovely written sample and no sound, it has not finished.

---

## The 20-minute version

Six steps. You need three things.

**An agent** — Claude Code, Cowork, Codex, whatever you use. These are plain markdown
files. **A cloud agent is the easier start**, because it runs without your laptop being
open, and you can set the whole thing up from your phone.

**An API key for the voice. There is no way around this one.** Worth being precise,
because it confuses people: your agent does all the thinking and writing. The key is
*only* for turning the finished script into speech. OpenAI's `gpt-4o-mini-tts` is
~1.5¢/minute — twenty minutes a day is about **$9 a month**. ElevenLabs sounds slightly
better at ~14¢/minute, **nine times more**. Either works; `--provider elevenlabs` switches.

Two things that stall people here, both worth knowing before you start:

- **An OpenAI API key is not a ChatGPT subscription.** Different product, different site.
  Go to [platform.openai.com](https://platform.openai.com), add a payment method, put $5
  of credit on it, then create a key. Paying for ChatGPT Plus gets you nothing here, and
  a key with no credit behind it fails with an error that does not say so.
- **Your delivery channel has to be able to play voice messages**, not just text. Telegram
  sends them natively, which is the only reason this repo uses it. If you are delivering
  somewhere that cannot carry audio, you will quietly end up with a text-only digest —
  which is the failure this whole setup is trying to avoid. Post the audio where it can
  actually be played, even if that is a different place from the written briefing.

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
echo "hello from my digest" | bun send-message.ts
```

If that arrives on your phone, delivery works. **Get that far before anything else.**

### 3. The audio

`speak-digest.ts` reads tracks from stdin, split on `== Track name ==` lines. Run it with
`--dry` first: it prints the plan and the cost and spends nothing.

Voice defaults to `fable` on a British read. `--voice ballad|ash|onyx|nova|shimmer|coral`
are alternatives, and `--instructions "..."` steers accent and delivery in plain English —
that's how you get a particular kind of reader rather than a generic one.

Spend an evening on this one. We ran a blind audition of five casts across a real digest
and the winner was not the obvious one; the accent comes from `instructions`, not from the
voice id, so one voice can read British, Irish or Scottish. `--rotate a,b,c` cycles casts
track by track so you can compare them in context rather than in isolation.

**The hard limit: ~8,800 characters per track.** Over that you get a 400 from OpenAI, and
because every track renders before the first one sends, *nothing* goes out. Reckon ~840
characters per spoken minute.

### 4. Tell your agent what you actually want

Point it at **`SKILL.md` in the repo root** — that's the whole method, one file. It will
ask you three questions — what else it should read, what you want to know about the world
(work, but also sports, music, what's on where you live), and whether 6am and 5pm suits —
then write you your own version.


### 5. The page

The audio is for walking and Telegram is for glancing. The page is the one you actually
read, and it is the part most people never build because a wall of markdown in a chat
window feels like it should be enough. It isn't — you stop opening it by about day four.

`templates/digest.html` is the whole thing: one self-contained file, four reading styles the
reader picks and the page remembers, a swipeable strip of the day's photos, and a lightbox.
No build step, no framework, no network calls.

The loop each morning is:

1. Copy the template to a scratch file. **Never edit the template in place.**
2. Replace the body — everything from `<header class="record">` down — and the date in the
   nav. Leave the `<style>` block and all four `<script>` blocks byte-identical.
3. Publish it to **the same URL every day**, so the link in your pocket never changes.

How you publish depends on your agent. Claude Code has an Artifact tool that takes an HTML
file and gives you a private URL; republishing to that URL updates it in place. Anything
that can host a static file works just as well — a gist, a Vercel deploy, an S3 bucket.
**The only real requirement is that the URL is stable**, because the whole point is a
bookmark you open at breakfast.

Two traps that cost us real time, both fixed in the template and both easy to reintroduce:

- **Photos must be `data:` URIs.** Artifact viewers block hotlinked images, so anything
  pointing at a URL renders as a broken box. Embed them.
- **Keep the viewport meta tag.** Without it iOS lays the page out at 980px and the whole
  thing pans sideways under your thumb. The artifact wrapper does not add it for you.

`templates/README.md` has the rest, including the four skins and why the photo strip builds
itself from the photos already on the page rather than holding a second copy.

### 6. Make it actually run every day

**This is the step that turns it from a demo into the product**, and it's the one people
skip. A digest you have to ask for is just a chat.

How you do it depends on your agent, and the choice that matters is **whether it needs your
laptop awake**:

- **A cloud agent** (Claude Cowork, or any hosted agent with scheduling) — the easy answer.
  Ask it to run the skill on a schedule and it runs whether or not your machine is on. If
  you're starting fresh, start here.
- **Claude Code on your own machine** — it has scheduled tasks built in. Ask it: *"run this
  skill every morning at 6am."* Works well; only fires when the machine is awake.
- **Anything else** — a cron job calling your agent headlessly does it:
  `0 6 * * * cd ~/my-digest && claude -p "Follow SKILL.md and send me today's digest"`

**Whichever you pick, run it manually once first.** The first one is always wrong in some
specific way — a source it can't reach, a section that's empty, a tone that's off — and
that's much easier to fix at 2pm on purpose than at 6am by surprise.

**Then run it for a week before judging it.** The first few are bad. You're discovering
what you actually want, which is never what you said at the start.

---

## What's here, and what isn't

| | |
|---|---|
| `SKILL.md` | **The whole thing.** Start and probably finish here. |
| `scripts/` | The three reusable pieces: audio, and two ways to message yourself |

**Not here:** the scrapers for my Telegram, Granola, Gmail, Notion, GitHub, Supabase and
the company drive. They're wired to my accounts and would be useless to you. What the skill
files *do* give you is what each one returns and what it gets wrong, which is the part
worth copying — your agent can write its own against your tools in an afternoon.

`PRIVATE.example.md` shows where to keep your own ids, tokens and anything personal, so
they stay out of anything you share.

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
