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
| `speak-digest.ts` | Turns a written script into audio and posts it as Telegram voice messages. |
| `notify-telegram.ts` | A formatted "your digest is ready" ping with links. Only useful if you also publish the digest to a page somewhere. |

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

- `--voice ballad|ash|onyx|fable|nova|shimmer` — `ballad` is the default and the most
  broadcast-sounding.
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
