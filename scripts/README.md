# scripts/

Three small pieces that are worth having regardless of how you build the rest. Everything
else in this repo is prose; these are the only things that actually run.

**Runtime: [Bun](https://bun.sh).** `curl -fsSL https://bun.sh/install | bash`. No
dependencies, no `package.json`, no install step — each file is standalone and reads a
`.env` sitting beside it.

```
TELEGRAM_BOT_TOKEN=123456:AA...     # from @BotFather
TELEGRAM_CHAT_ID=987654321          # from @userinfobot
OPENAI_API_KEY=sk-...               # for the audio only
```

| Script | What it does |
|---|---|
| `send-message.ts` | Sends you one plain text message. Body on stdin. **Start here** — if this works, delivery works. |
| `speak-digest.ts` | Turns a written script into audio and posts it as Telegram voice messages. Splits on `== Track name ==` lines, and **measures the rendered audio** rather than guessing its length. |
| `notify-telegram.ts` | A formatted "your digest is ready" ping with links. Only useful if you also publish the digest to a page somewhere. |
| `x-timeline.ts` | Reads your own X home timeline out of a browser you are already signed into. **macOS + [Arc](https://arc.net) only.** No key, no API, no $200/month. |

## x-timeline.ts, and why it's worth reading even if you don't use Arc

X walls the home timeline behind a login, so there is no free API route to your own feed.
The official one is `GET /2/users/:id/timelines/reverse_chronological` at **$200/month**.
xAI's X Search is cheaper but searches *public* X rather than your feed — a different
product.

What does work: read the page in a browser that already holds your session. Open
`x.com/home` in Arc once and **pin the tab**. The script finds that tab by URL, scrolls
it, and reads it. `--path /i/bookmarks` reads your bookmarks through the same tab; any
logged-in surface works the same way.

**Hidden tabs are throttled, and that is the whole design problem.** A background tab
freezes the feed at whatever it had already rendered: measured, `scrollHeight` stuck at
12,565 across six attempts, 11 articles, nothing new. Scrolling works. Spoofing the Page
Visibility API works — `document.hidden` genuinely flips to `false` — and X *still* will
not load more, so the gate is browser-level, not in the page. Select the tab and it comes
alive instantly: 12,565 → 26,182 → 40,365 → 54,607 → 67,766 across four passes, and the
read goes from 8 posts to 56.

So it borrows the foreground for about thirty seconds and gives it straight back.
**Only the tab *selection* changes — it never alters the URL of a tab you own.** That
distinction matters: an earlier version drove the active tab and nearly navigated over a
half-written post. `--quiet` skips the borrow and accepts the shallow read.

Four things in it are load-bearing, and all four cost real time to find:

- **Address the tab by URL, never by focus.** Arc's `execute` takes a tab specifier and
  any tab works. The widespread belief that Arc can only inject into the *active* tab is
  false; what is true is that a *newly made* tab is not reliably active, which is a
  different problem.
- **The feed is virtualised.** About five `article` elements are mounted at a time, so one
  read returns five posts no matter how long the feed is. Scroll and accumulate: 5 posts
  without the loop, 41 with it.
- **`eval` cannot `await`.** The injection goes through `eval(atob(...))`, where top-level
  `await` is a syntax error and an `async` IIFE returns `{}` through the bridge. So the
  scroll loop lives in TypeScript and the posts accumulate in a page-level global between
  calls.
- **osascript returns the result double-encoded** — a quoted JSON string containing JSON.
  One `JSON.parse` gives you a string whose `.url` is `undefined`, which reads exactly
  like landing on the wrong page. Parse twice.

Two Arc limits worth knowing before you adapt it: `make new tab` is in the dictionary but
**is not implemented** (returns `missing value`, creates nothing), which is why the tab is
pinned by hand once; and `tab i of window` cannot be used as a specifier — iterate
`every tab of w` and match on `URL of t`.

**The general lesson, which outlives Arc:** the cheapest path to a walled-garden feed is
usually a browser you are already signed into, read in the background. Chrome needs an
extension rather than osascript, and an isolated agent-owned browser profile is cleaner
still — but the shape is the same.

`send-message.ts` and `notify-telegram.ts` overlap on purpose: the first is for anything at
all, the second is specifically the daily "it's ready, here's the link" nudge.

## send-message.ts

```
echo "hello" | bun send-message.ts
bun send-message.ts --dry <<< "what would this look like"
```

Plain text only — it deliberately sends with no parse mode, so `*asterisks*` arrive as
asterisks. Use caps for headings and `•` for bullets. Telegram's cap is 4096 characters.

## speak-digest.ts

Reads tracks from stdin, split on `== Track name ==` lines, and posts each as its own
voice message so you can skip between them.

```
bun speak-digest.ts --set "Monday 1 Sep" --dry <<'EOF'
== Good morning ==
Today you have three things...

== The world ==
Bitcoin fell four percent...
EOF
```

**Always `--dry` first.** It prints the plan and the cost and spends nothing.

- `--voice fable|ballad|ash|onyx|nova|shimmer` — `fable` is the default; `ballad` is the
  other broadcast-sounding one.
- `--instructions "..."` — **this is where the accent lives.** Plain English direction:
  *"a British broadcaster reading a morning briefing, unhurried, never chummy"*. Worth more
  than the voice choice.
- `--provider elevenlabs` — better quality, ~9× the cost. Needs `ELEVENLABS_API_KEY`.
- `--out <dir>` — also save the mp3s. `--no-send` — render without posting.

**Two limits that will bite you.** Each track must be under **~8,800 characters** — over
that OpenAI returns a 400, and since every track renders before the first one sends,
*nothing* goes out. And reckon **~840 characters per spoken minute** when writing to length.

## Cost

OpenAI `gpt-4o-mini-tts` is about **1.5¢/minute**. Twenty minutes a day is roughly **$9 a
month**. ElevenLabs sounds slightly better at ~14¢/minute, which is ~$85/month for the same
thing. Both scripts print the cost of every set before spending.


## A note on durations, if you build your own

Guessing a track's length from its word count is wrong by more than you would expect. This
script used 150 wpm and overstated every set by about **15%** — one day was captioned 34:19
and was really 29:52, which nobody noticed for six weeks because the caption is the only
place the number appears.

You do not need `ffprobe` to fix it. OpenAI's TTS returns **128 kbps constant-bitrate mp3**,
so `bytes / 16000` is the duration in seconds — checked against `ffprobe` across twelve
tracks at **0.0% error on every one**. Measure the buffer you already have in memory.

For writing *to* a length before you render: reckon **~1,000 characters per spoken minute**.
