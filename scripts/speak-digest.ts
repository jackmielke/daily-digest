#!/usr/bin/env bun
/**
 * Read the daily digest aloud: ElevenLabs TTS, delivered to Telegram as an
 * audio message from your own Telegram bot.
 *
 * The spoken script comes in on stdin so the digest never has to shell-quote
 * prose. It is a *different* text from the written digest — see WRITING THE
 * SCRIPT at the bottom of this comment.
 *
 * The digest goes out as SEVERAL short tracks so you can skip around, not one
 * long file. Separate them with a `== Title ==` line and they are sent in order,
 * numbered, each as its own Telegram audio message:
 *
 *   bun speak-digest.ts --set "Fri 21 Aug" <<'EOF'
 *   == First thing ==
 *   Good morning. Your procedure was cancelled...
 *
 *   == Radish ==
 *   Lead reports went live and were used sixty-one times...
 *
 *   == The world ==
 *   Anthropic published lab-validated results...
 *
 *   == Everything else ==
 *   The voice experiment became a product with a name...
 *   EOF
 *
 * With no `== ... ==` lines the whole of stdin is one track and --title names it.
 *
 * Flags:
 *   --set      Label for the whole set, used in captions (default: today's date)
 *   --title    Track title, single-track mode only
 *   --provider elevenlabs | openai (default: openai — see COST below)
 *   --voice    Voice id. ElevenLabs: a voice id. OpenAI: ballad|fable|onyx|ash|…
 *   --model    Model id (default per provider)
 *   --instructions  OpenAI only: steer accent/tone. Defaults to a British
 *                   broadcast delivery chosen to sit close to ElevenLabs' Daniel.
 *   --max      Character ceiling before it refuses (default 6000)
 *   --out      Also save the mp3 to this path
 *   --dry      Synthesize nothing, send nothing; print the plan and the budget
 *   --no-send  Synthesize and save, but don't post to Telegram
 *   --force    Proceed even if the script exceeds --max
 *
 * COST, and why the default provider changed on 2026-08-24.
 *   ElevenLabs bills one credit per character, ~840 chars per spoken minute, so
 *   about 14 cents a minute at every tier. Twenty minutes a day is ~511k
 *   characters a month, which needs the $99 Pro plan. The account was on a
 *   ~37.5k allowance — 1.5 minutes a day — so sets were capped by the plan, not
 *   by the writing.
 *   OpenAI gpt-4o-mini-tts is ~$0.015 a minute, roughly one ninth. The same
 *   twenty minutes a day is about $9 a month. So OPENAI IS NOW THE DEFAULT and
 *   length is no longer the binding constraint. `--provider elevenlabs` still
 *   works and still checks the ElevenLabs balance before spending any of it.
 *
 * Auth: OPENAI_API_KEY (or ELEVENLABS_API_KEY for that provider) and
 * TELEGRAM_BOT_TOKEN, from the environment or from a `.env` — this file's own
 * first, then ~/.config/digest/.env as a fallback. No key is ever logged.
 *
 * WRITING THE SCRIPT — this matters more than any flag here:
 *   - No URLs, no markdown, no tables, no bullet characters. They are read out.
 *   - Write numbers as they are said: "a hundred and twenty-six commits",
 *     "about fifty dollars", "nine oh six this morning".
 *   - Sections need spoken transitions, not headings.
 *   - Drafts, listings and the markets table do not work aloud. Leave them to
 *     the page and say "the rest is on the page" once, at the end.
 *   - Each track has to stand alone. A listener may play track three and nothing else,
 *     so don't open one with "meanwhile" or "the other thing".
 */

// Your Telegram user id. Message @userinfobot to get it, then put it in .env
// beside this file as TELEGRAM_CHAT_ID=<id>.
function chatId(): string {
  if (process.env.TELEGRAM_CHAT_ID) return process.env.TELEGRAM_CHAT_ID;
  try {
    for (const l of require("fs").readFileSync(new URL(".env", import.meta.url).pathname, "utf-8").split("\n")) {
      const m = l.match(/^\s*TELEGRAM_CHAT_ID\s*=\s*(.+?)\s*$/);
      if (m) return m[1].replace(/^["']|["']$/g, "");
    }
  } catch {}
  console.error("No TELEGRAM_CHAT_ID. Message @userinfobot on Telegram for your id, then:\n" +
    "  echo 'TELEGRAM_CHAT_ID=<id>' >> .env");
  process.exit(1);
}
const ELEVEN_VOICE = "onwK4e9ZLuTAKqWW03F9"; // Daniel — steady broadcaster, British
const ELEVEN_MODEL = "eleven_multilingual_v2";
// REVERTED 2026-08-30 at the owner's request: "the voice completely changed. I don't like
// the new voice! I liked the old voice we had."
//
// On 2026-08-29 two things changed at once — the voice id (ballad -> ash) and the
// persona (British broadcaster -> Vibey the desk robot). Both are reverted here.
// `ballad` is the voice that sits closest to ElevenLabs' Daniel, which is the sound
// you picked in the first place and has now asked for twice.
//
// The 29 Aug ask ("funny, chill and smart") was real and is NOT discarded — it just
// belongs in the WRITING, not in the voice. The script is allowed to be dry, warm and
// funny; the delivery is a broadcaster reading it straight, which is what makes a
// deadpan line land. Do not put a character costume back on the narrator.
const OPENAI_VOICE = "ballad";
const OPENAI_MODEL = "gpt-4o-mini-tts";
const OPENAI_INSTRUCTIONS =
  "You are a British broadcaster reading a personal morning briefing to one listener — " +
  "the measured, literate register of BBC Radio 4. Steady, unhurried, warm but never " +
  "chummy. Read it straight: trust the writing and let the dry lines land flat without " +
  "signalling them, never mug or laugh at a joke. Let full stops breathe, and let a " +
  "genuinely good piece of news lift the line a little. Go quiet, plain and sincere " +
  "for anything heavy — health, wars, someone struggling — with no wink at all.";

const ENV_FILES = [
  new URL(".env", import.meta.url).pathname,
  `${process.env.HOME}/.config/digest/.env`,
  `${process.env.HOME}/dev/vibey-robot/.env`,
  "/Users/jackmielke/dev/vibey-robot/.env",
];

const args = process.argv.slice(2);
const flag = (n: string) => {
  const i = args.indexOf(`--${n}`);
  return i === -1 ? undefined : args[i + 1];
};
const has = (n: string) => args.includes(`--${n}`);

const title = flag("title");
const setLabel = flag("set");
const provider = (flag("provider") ?? "openai").toLowerCase();
if (provider !== "openai" && provider !== "elevenlabs") {
  console.error(`Unknown --provider "${provider}". Use openai or elevenlabs.`);
  process.exit(1);
}
const isEleven = provider === "elevenlabs";
const voice = flag("voice") ?? (isEleven ? ELEVEN_VOICE : OPENAI_VOICE);
const model = flag("model") ?? (isEleven ? ELEVEN_MODEL : OPENAI_MODEL);
const instructions = flag("instructions") ?? OPENAI_INSTRUCTIONS;
// The old 6,000 ceiling existed to protect the ElevenLabs credit balance.
// On OpenAI a 20-minute set costs about thirty cents, so the ceiling only needs
// to catch a runaway, not to ration.
const max = Number(flag("max") ?? (provider === "elevenlabs" ? 6000 : 30000));
const outPath = flag("out");
const dry = has("dry");
const noSend = has("no-send");
const force = has("force");



async function fromEnvFiles(key: string): Promise<string | undefined> {
  for (const path of ENV_FILES) {
    const file = Bun.file(path);
    if (!(await file.exists())) continue;
    for (const line of (await file.text()).split("\n")) {
      const m = line.match(new RegExp(`^\\s*${key}\\s*=\\s*(.+?)\\s*$`));
      if (m) return m[1].replace(/^["']|["']$/g, "");
    }
  }
}

async function need(key: string, hint: string): Promise<string> {
  const v = process.env[key] ?? (await fromEnvFiles(key));
  if (v) return v;
  console.error(`No ${key} found.\n${hint}`);
  process.exit(1);
}

/** Catch formatting that would otherwise be read out loud, word by word. */
function lint(text: string): string[] {
  const problems: string[] = [];
  if (/https?:\/\/|www\./.test(text)) problems.push("contains a URL — it will be read aloud character by character");
  if (/^\s*[-*•]\s/m.test(text)) problems.push("contains bullet characters at line start");
  if (/[*_`#]{1,}\w|\w[*_`]{2,}/.test(text)) problems.push("looks like it still has markdown emphasis");
  if (/\|.*\|/.test(text)) problems.push("contains what looks like a table row");
  return problems;
}

const raw = (await Bun.stdin.text()).trim();
if (!raw) {
  console.error("Empty script on stdin.");
  process.exit(1);
}

/** Split `== Title ==` sections into ordered tracks. No markers = one track. */
function parseTracks(text: string): Array<{ title: string; body: string }> {
  const lines = text.split("\n");
  const marker = /^\s*==\s*(.+?)\s*==\s*$/;
  if (!lines.some((l) => marker.test(l))) {
    return [{ title: title ?? "Daily digest", body: text.trim() }];
  }
  const out: Array<{ title: string; body: string }> = [];
  let cur: { title: string; body: string[] } | null = null;
  for (const line of lines) {
    const m = line.match(marker);
    if (m) {
      if (cur) out.push({ title: cur.title, body: cur.body.join("\n").trim() });
      cur = { title: m[1], body: [] };
    } else if (cur) {
      cur.body.push(line);
    }
  }
  if (cur) out.push({ title: cur.title, body: cur.body.join("\n").trim() });
  return out.filter((t) => t.body.length > 0);
}

const tracks = parseTracks(raw);
if (!tracks.length) {
  console.error("No non-empty tracks found.");
  process.exit(1);
}

const words = (t: string) => t.split(/\s+/).filter(Boolean).length;
const secs = (t: string) => Math.round((words(t) / 150) * 60); // ~150 wpm narration
const clock = (n: number) => `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;

const totalChars = tracks.reduce((n, t) => n + t.body.length, 0);
const totalSecs = tracks.reduce((n, t) => n + secs(t.body), 0);

console.log(`${tracks.length} track${tracks.length === 1 ? "" : "s"}, ${totalChars} characters, ~${clock(totalSecs)} total:`);
for (const [n, t] of tracks.entries()) {
  console.log(`  ${n + 1}. ${t.title} — ${t.body.length} chars, ~${clock(secs(t.body))}`);
  for (const p of lint(t.body)) console.warn(`     ! ${p}`);
}

if (totalChars > max && !force) {
  console.error(
    `\nSet is ${totalChars} characters, over the ${max} ceiling. Tighten it, or pass --force.\n` +
      `Every character is a credit — a long set today is a silent morning next week.`,
  );
  process.exit(1);
}

const apiKey = isEleven
  ? await need(
      "ELEVENLABS_API_KEY",
      `Add it with:\n  echo 'ELEVENLABS_API_KEY=<key>' >> ${ENV_FILES[0]}`,
    )
  : await need(
      "OPENAI_API_KEY",
      `Add it with:\n  echo 'OPENAI_API_KEY=<key>' >> ${ENV_FILES[0]}`,
    );

if (isEleven) {
  // Check the balance for the WHOLE set before spending any of it, so a set
  // never goes out half-finished.
  const subRes = await fetch("https://api.elevenlabs.io/v1/user/subscription", {
    headers: { "xi-api-key": apiKey },
  });
  if (subRes.ok) {
    const sub: any = await subRes.json();
    const remaining = (sub.character_limit ?? 0) - (sub.character_count ?? 0);
    const reset = sub.next_character_count_reset_unix
      ? new Date(sub.next_character_count_reset_unix * 1000).toLocaleDateString()
      : "unknown";
    console.log(`\nQuota: ${remaining} characters left (resets ${reset}) — this set costs ${totalChars}.`);
    if (totalChars > remaining) {
      console.error(
        `Not enough quota for the whole set: need ${totalChars}, have ${remaining}.\n` +
          `Sending nothing rather than a partial set. The written pages are unaffected.`,
      );
      process.exit(2);
    }
    const daysLeft = Math.floor((remaining - totalChars) / Math.max(totalChars, 1));
    if (daysLeft < 4) console.warn(`  ! About ${daysLeft} more set${daysLeft === 1 ? "" : "s"} left at this length.`);
  } else {
    console.warn("  ! Could not read the ElevenLabs quota; proceeding.");
  }
} else {
  // No allowance to run down — just say what it costs, so the number stays
  // visible rather than becoming invisible spend.
  const cost = (totalSecs / 60) * 0.015;
  console.log(`\nOpenAI ${model}: this set costs about $${cost.toFixed(2)} (~1.5 cents a minute).`);
}

if (dry) {
  console.log("\n--- dry run, nothing synthesized or sent ---");
  console.log(`provider=${provider} voice=${voice} model=${model}`);
  if (!isEleven) console.log(`instructions="${instructions}"`);
  process.exit(0);
}

const label = setLabel ?? new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

async function synth(text: string): Promise<Uint8Array> {
  const res = isEleven
    ? await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`,
        {
          method: "POST",
          headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            model_id: model,
            voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true },
          }),
        },
      )
    : await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          voice,
          input: text,
          // gpt-4o-mini-tts takes delivery direction in plain English; this is
          // what gets it near a British broadcast read rather than a chirpy one.
          instructions,
          response_format: "mp3",
        }),
      });
  if (!res.ok) {
    const body = await res.text();
    const who = isEleven ? "ElevenLabs" : "OpenAI";
    throw new Error(`${who} ${res.status}: ${body.replaceAll(apiKey, "<redacted>").slice(0, 400)}`);
  }
  return new Uint8Array(await res.arrayBuffer());
}

// Synthesize everything first: a failure on track 3 should not leave two
// orphaned messages in the chat.
const rendered: Array<{ title: string; mp3: Uint8Array; seconds: number }> = [];
for (const [n, t] of tracks.entries()) {
  try {
    const mp3 = await synth(t.body);
    rendered.push({ title: t.title, mp3, seconds: secs(t.body) });
    console.log(`  ✓ ${n + 1}. ${t.title} — ${(mp3.length / 1024 / 1024).toFixed(2)} MB`);
  } catch (err: any) {
    console.error(`Failed on track ${n + 1} (${t.title}): ${err.message}`);
    console.error("Nothing sent.");
    process.exit(1);
  }
}

const stamp = new Date().toISOString().slice(0, 10);

if (outPath) {
  const dir = outPath.replace(/\/?$/, "");
  for (const [n, r] of rendered.entries()) {
    const slug = r.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const path = rendered.length === 1 ? dir : `${dir}/digest-${stamp}-${n + 1}-${slug}.mp3`;
    await Bun.write(path, r.mp3);
    console.log(`Saved ${path}`);
  }
}

if (noSend) process.exit(0);

const botToken = await need(
  "TELEGRAM_BOT_TOKEN",
  `Add it with (token comes from @BotFather for your bot):\n  echo 'TELEGRAM_BOT_TOKEN=<token>' >> ${ENV_FILES[0]}`,
);

for (const [n, r] of rendered.entries()) {
  const num = `${n + 1}/${rendered.length}`;
  const form = new FormData();
  form.append("chat_id", chatId());
  form.append("title", `${n + 1} · ${r.title}`.slice(0, 64));
  form.append("performer", `Wonder · ${label}`);
  form.append("duration", String(r.seconds));
  form.append(
    "caption",
    n === 0
      ? `🎧 ${label} — ${rendered.length} parts, ~${clock(totalSecs)}. ${num} ${r.title} (${clock(r.seconds)})`
      : `${num} ${r.title} (${clock(r.seconds)})`,
  );
  form.append("audio", new Blob([r.mp3], { type: "audio/mpeg" }), `digest-${stamp}-${n + 1}.mp3`);

  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendAudio`, { method: "POST", body: form });
  const tg: any = await res.json();
  if (!tg.ok) {
    console.error(`Telegram failed on ${num}:`, JSON.stringify(tg).replaceAll(botToken, "<redacted>"));
    process.exit(1);
  }
  console.log(`Sent ${num} · ${r.title} (message_id ${tg.result.message_id}).`);
  // Telegram can reorder rapid uploads; a short gap keeps the set in sequence.
  if (n < rendered.length - 1) await new Promise((r) => setTimeout(r, 500));
}
