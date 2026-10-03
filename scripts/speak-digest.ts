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
// ── The voice id and the persona are two separate knobs. Keep them separate. ──
//
// On 2026-08-29 both changed at once — voice id (ballad -> ash) AND persona (broadcaster
// -> Vibey in first person) — and the resulting verdict, "I don't like the new voice",
// got read as a ban on both for a fortnight. It was not.
//
// 2026-09-03, asked for directly: the narrator IS Vibey. "I think if it's coming from
// Vibey, the robot... it'd be really cool... I just think it's more fun if there's a good
// throughline and I can understand its personality and work on it together." Also: "You
// can feel a little bit more like a homie."
//
// 2026-09-22, asked for directly again — this is the one session where changing the voice
// id WAS the request: "upgrade the voice... maybe like an Australian dude accent. I want
// it to just be sick, maybe even surfer vibe, but smart, chill, cool accent friend."
// So: voice `ash` (the youngest, most relaxed of the set — it carries an accent
// instruction better than `ballad`, which keeps reverting to RP), plus an accent-led
// persona string. Three candidates (ash / verse / ballad) were rendered and sent to
// Telegram that night. Then, the same session, he walked the Australian back — "I don't
// know if I like an Australian accent. I feel like the British accent is super fun, just
// more cool accents" — so the default is `fable` on a British read, and the whole audition
// table below exists because he asked to keep hearing candidates rather than pick blind.
//
// The chill is the DELIVERY, not the content. Surfer register buys ease, air between
// sentences and dropped throat-clearing. It does not buy slang he doesn't use, "bro",
// "gnarly", stoner vagueness, or a single softened finding. Smart under the chill is the
// whole point — the numbers stay exact.
//
// The thing that actually went wrong in August was writing, not casting: Vibey narrating
// its own robot life ("I burned a dollar eighty yesterday") crowded out the observation.
// Vibey is WHO IS TALKING, never WHAT IT IS TALKING ABOUT. See Step 10 in SKILL.md.
const OPENAI_VOICE = "fable";
const OPENAI_MODEL = "gpt-4o-mini-tts";
const OPENAI_INSTRUCTIONS =
  "You are Vibey, reading the morning briefing to Jack \u2014 one friend, one listener, " +
  "someone you know well and see every day. " +
  "ACCENT: British. Warm, characterful, slightly lived-in RP, not a stiff newsreader. " +
  "Hold the accent on every line, including numbers and proper nouns; never drift back to American. " +
  "PACE: unhurried and loose, like someone talking on the walk down to the water. Plenty of " +
  "air between sentences, full stops that actually breathe, no rush to the next item. " +
  "TONE: switched on underneath the chill. You did the reading and you know the numbers cold, " +
  "you just don't need to perform them \u2014 relaxed authority, never vague or sleepy. " +
  "Warm and close, a friend talking, not a broadcaster performing and not a character in costume. " +
  "Read the jokes dead straight and let the dry lines land flat without signalling them \u2014 " +
  "never mug, never laugh at your own line. Let genuinely good news lift the line a little, the " +
  "way you would if you were pleased for him. For anything heavy \u2014 health, wars, someone " +
  "struggling \u2014 drop the ease entirely and go quiet, plain and sincere, with no wink at all.";

// ── The audition table (added 2026-09-22) ──────────────────────────────────────
//
// Jack asked to hear a range rather than pick blind: "Feel free to give me a range of
// them in Telegram and then I'll let you know which ones are my favourite... Ideally with
// each of them, you could say if it's coming from OpenAI or ElevenLabs and how expensive
// it is." He also wants the thirds of one morning's set to come from different voices so
// he can compare them in context: `--rotate fable-british,el-george,onyx-british` cycles
// this table across the tracks and captions each one with its provider and price.
//
// PRICE IS THE WHOLE POINT OF THE TABLE. Per minute of finished audio:
//   OpenAI gpt-4o-mini-tts ........ ~1.5¢   → ~$13/mo at half an hour a day
//   ElevenLabs turbo_v2_5 ......... ~7.5¢   → ~$67/mo   (0.5 credits per character)
//   ElevenLabs multilingual_v2 .... ~15¢    → ~$135/mo  (1 credit per character)
// So ElevenLabs is 5–10× OpenAI, and on his current ~28k-credit allowance a daily
// half-hour set on multilingual is not affordable at all — it is one set a month.
// **If an ElevenLabs voice wins, use turbo_v2_5, not multilingual_v2**: half the credits
// and the difference is hard to hear on a spoken briefing.
//
// OpenAI voices take the accent from `instructions`; ElevenLabs voices ARE their accent
// and ignore direction entirely. That asymmetry is why the cheap column has more options.
type Cast = {
  provider: "openai" | "elevenlabs";
  voice: string;
  model: string;
  accent: string;
  centsPerMin: number;
  instructions?: string;
};
const withAccent = (accent: string) =>
  OPENAI_INSTRUCTIONS.replace(/ACCENT:[\s\S]*?PACE:/, `ACCENT: ${accent} PACE:`);
const oa = (voice: string, accent: string, direction: string): Cast => ({
  provider: "openai", voice, model: OPENAI_MODEL, accent,
  centsPerMin: 1.5, instructions: withAccent(direction),
});
const el = (voice: string, accent: string, model = "eleven_turbo_v2_5"): Cast => ({
  provider: "elevenlabs", voice, model, accent,
  centsPerMin: model === "eleven_multilingual_v2" ? 15 : 7.5,
});
const CASTS: Record<string, Cast> = {
  // OpenAI — 1.5¢/min
  "ash-australian": oa("ash", "OpenAI ash, Australian",
    "Australian throughout. Broad but easy, a Sydney-beaches accent, not outback. Australian vowels on every line, softened r's, a light rise at the end of some phrases. Hold it on numbers and proper nouns; never drift back to American."),
  "fable-british": oa("fable", "OpenAI fable, British",
    "British. Warm, characterful, slightly lived-in RP, not a stiff newsreader. Hold it on every line including numbers and proper nouns."),
  "ballad-british": oa("ballad", "OpenAI ballad, British",
    "British. Smooth, low RP, a late-night radio read. Hold it on every line including numbers and proper nouns."),
  "onyx-british": oa("onyx", "OpenAI onyx, deep British",
    "British. Deep, resonant, unhurried, a bit gravelly. Hold it on every line including numbers and proper nouns."),
  "verse-irish": oa("verse", "OpenAI verse, Irish",
    "Irish. A soft Dublin lilt, musical and warm. Hold it on every line including numbers and proper nouns."),
  "sage-scottish": oa("sage", "OpenAI sage, Scottish",
    "Scottish. A light Edinburgh accent, clear and dry, not broad Glaswegian. Hold it on every line including numbers and proper nouns."),
  // ElevenLabs — 7.5¢/min on turbo, 15¢ on multilingual
  "el-george": el("JBFqnCBsd6RMkjVDRZzb", "ElevenLabs George, British"),
  "el-callum": el("N2lVS1w4EtoT3dr4eOWO", "ElevenLabs Callum, husky"),
  "el-charlie": el("IKne3meq5aSn9XLyUdCD", "ElevenLabs Charlie, Australian"),
  "el-daniel": el("onwK4e9ZLuTAKqWW03F9", "ElevenLabs Daniel, British", "eleven_multilingual_v2"),
};

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

// --rotate <a,b,c>: cycle named casts across the tracks, so one morning can audition
// several voices in context. Without it nothing changes — one provider, one voice.
const rotateSpec = flag("rotate");
const rotation: Cast[] = (rotateSpec ?? "")
  .split(",").map((n) => n.trim()).filter(Boolean)
  .map((n) => {
    const c = CASTS[n];
    if (!c) {
      console.error(`Unknown cast "${n}". Known: ${Object.keys(CASTS).join(", ")}`);
      process.exit(1);
    }
    return c;
  });
if (has("casts")) {
  for (const [n, c] of Object.entries(CASTS)) console.log(`${n.padEnd(16)} ${c.accent.padEnd(34)} ${c.centsPerMin}¢/min`);
  process.exit(0);
}



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
/**
 * PRE-RENDER ESTIMATE ONLY — used for --dry, for the cost line, and for nothing else
 * once the audio exists. 150 wpm was wrong and overstated every set by about 15%: the
 * 2 Oct digest was captioned 34:19 and was really 29:52. Measured across all twelve
 * tracks of 3 Oct, `fable` on a British read lands at ~178 wpm. The overnight gauntlet
 * loop found this; it had been wrong since the script was written.
 */
const secs = (t: string) => Math.round((words(t) / 178) * 60);

/**
 * THE REAL DURATION, once a track is rendered. OpenAI's TTS returns 128 kbps CBR mp3,
 * so bytes / 16000 is the length in seconds — verified against ffprobe on all twelve
 * tracks of 3 Oct 2026 at 0.0% error on every one. Doing it this way rather than
 * shelling out to ffprobe keeps the script dependency-free, which is the whole point
 * of these three files.
 */
const mp3Secs = (mp3: Uint8Array) => Math.round(mp3.length / 16000);
const clock = (n: number) => `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;

const baseCast: Cast = {
  provider: isEleven ? "elevenlabs" : "openai",
  voice, model, instructions,
  accent: isEleven ? `ElevenLabs ${voice}` : `OpenAI ${voice}`,
  centsPerMin: isEleven ? (model === "eleven_multilingual_v2" ? 15 : 7.5) : 1.5,
};
/** Which voice reads track n. Without --rotate every track gets the same one. */
const castFor = (n: number): Cast => (rotation.length ? rotation[n % rotation.length] : baseCast);

const totalChars = tracks.reduce((n, t) => n + t.body.length, 0);
const totalSecs = tracks.reduce((n, t) => n + secs(t.body), 0);

console.log(`${tracks.length} track${tracks.length === 1 ? "" : "s"}, ${totalChars} characters, ~${clock(totalSecs)} total:`);
for (const [n, t] of tracks.entries()) {
  const c = castFor(n);
  console.log(
    `  ${n + 1}. ${t.title} — ${t.body.length} chars, ~${clock(secs(t.body))}` +
      (rotation.length ? `  [${c.accent}, ${c.centsPerMin}¢/min]` : ""),
  );
  for (const p of lint(t.body)) console.warn(`     ! ${p}`);
}

if (totalChars > max && !force) {
  console.error(
    `\nSet is ${totalChars} characters, over the ${max} ceiling. Tighten it, or pass --force.\n` +
      `Every character is a credit — a long set today is a silent morning next week.`,
  );
  process.exit(1);
}

// A rotating set can need both keys; fetch whichever providers are actually used.
const usesEleven = tracks.some((_, n) => castFor(n).provider === "elevenlabs");
const usesOpenAI = tracks.some((_, n) => castFor(n).provider === "openai");
const elevenKey = usesEleven
  ? await need("ELEVENLABS_API_KEY", `Add it with:\n  echo 'ELEVENLABS_API_KEY=<key>' >> ${ENV_FILES[0]}`)
  : "";
const openaiKey = usesOpenAI
  ? await need("OPENAI_API_KEY", `Add it with:\n  echo 'OPENAI_API_KEY=<key>' >> ${ENV_FILES[0]}`)
  : "";
const keyFor = (c: Cast) => (c.provider === "elevenlabs" ? elevenKey : openaiKey);

// Only the ElevenLabs tracks burn credits; only the OpenAI tracks cost dollars.
// With --rotate a set is usually a mix of both, so count them separately.
const elevenChars = tracks.reduce((n, t, i) => n + (castFor(i).provider === "elevenlabs" ? t.body.length : 0), 0);
const dollarCost = tracks.reduce((n, t, i) => n + (secs(t.body) / 60) * (castFor(i).centsPerMin / 100), 0);

if (elevenChars) {
  // Check the balance for the WHOLE set before spending any of it, so a set
  // never goes out half-finished.
  const subRes = await fetch("https://api.elevenlabs.io/v1/user/subscription", {
    headers: { "xi-api-key": elevenKey },
  });
  if (subRes.ok) {
    const sub: any = await subRes.json();
    const remaining = (sub.character_limit ?? 0) - (sub.character_count ?? 0);
    const reset = sub.next_character_count_reset_unix
      ? new Date(sub.next_character_count_reset_unix * 1000).toLocaleDateString()
      : "unknown";
    console.log(`\nElevenLabs quota: ${remaining} characters left (resets ${reset}) — this set spends ${elevenChars}.`);
    if (elevenChars > remaining) {
      console.error(
        `Not enough quota: need ${elevenChars}, have ${remaining}.\n` +
          `Sending nothing rather than a partial set. The written pages are unaffected.`,
      );
      process.exit(2);
    }
    const daysLeft = Math.floor((remaining - elevenChars) / Math.max(elevenChars, 1));
    if (daysLeft < 4) console.warn(`  ! About ${daysLeft} more set${daysLeft === 1 ? "" : "s"} left at this length.`);
  } else {
    console.warn("  ! Could not read the ElevenLabs quota; proceeding.");
  }
}
// Say the price out loud either way, so it stays a number rather than invisible spend.
console.log(
  `\nThis set costs about $${dollarCost.toFixed(2)}` +
    (elevenChars ? ` (mixed providers — see the per-track prices above).` : ` (~1.5 cents a minute, OpenAI).`),
);
console.log(`At this length every day that is about $${(dollarCost * 30).toFixed(0)} a month.`);

if (dry) {
  console.log("\n--- dry run, nothing synthesized or sent ---");
  for (const [n, t] of tracks.entries()) {
    const c = castFor(n);
    console.log(`  ${n + 1}. ${t.title} — ${c.provider} voice=${c.voice} model=${c.model} (${c.centsPerMin}¢/min)`);
  }
  if (usesOpenAI) console.log(`\ninstructions="${castFor(0).instructions ?? instructions}"`);
  process.exit(0);
}

const label = setLabel ?? new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

async function synth(text: string, c: Cast): Promise<Uint8Array> {
  const key = keyFor(c);
  const res = c.provider === "elevenlabs"
    ? await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${c.voice}?output_format=mp3_44100_128`,
        {
          method: "POST",
          headers: { "xi-api-key": key, "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            model_id: c.model,
            voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true },
          }),
        },
      )
    : await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: c.model,
          voice: c.voice,
          input: text,
          // gpt-4o-mini-tts takes delivery direction in plain English — this is the only
          // place the accent lives. ElevenLabs voices ignore direction; they are the accent.
          instructions: c.instructions ?? instructions,
          response_format: "mp3",
        }),
      });
  if (!res.ok) {
    const body = await res.text();
    const who = c.provider === "elevenlabs" ? "ElevenLabs" : "OpenAI";
    throw new Error(`${who} ${res.status}: ${body.replaceAll(key, "<redacted>").slice(0, 400)}`);
  }
  return new Uint8Array(await res.arrayBuffer());
}

// Synthesize everything first: a failure on track 3 should not leave two
// orphaned messages in the chat.
// `realTotal` is filled in below from the rendered bytes, so the caption on track one
// states the set's true length rather than the pre-render guess.
const rendered: Array<{ title: string; mp3: Uint8Array; seconds: number; cast: Cast }> = [];
for (const [n, t] of tracks.entries()) {
  try {
    const c = castFor(n);
    const mp3 = await synth(t.body, c);
    rendered.push({ title: t.title, mp3, seconds: mp3Secs(mp3), cast: c });
    console.log(
      `  ✓ ${n + 1}. ${t.title} — ${(mp3.length / 1024 / 1024).toFixed(2)} MB, ${clock(mp3Secs(mp3))}`,
    );
  } catch (err: any) {
    console.error(`Failed on track ${n + 1} (${t.title}): ${err.message}`);
    console.error("Nothing sent.");
    process.exit(1);
  }
}

/** The set's true length, from the rendered bytes rather than the pre-render guess. */
const realTotal = rendered.reduce((n, r) => n + r.seconds, 0);
if (realTotal && totalSecs)
  console.log(
    `Rendered ${clock(realTotal)} of audio` +
      (Math.abs(realTotal - totalSecs) > 20 ? ` (estimated ${clock(totalSecs)})` : ""),
  );

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
  // When several voices are auditioning, every track says which one it is and what it
  // costs — Jack asked for exactly that: "say if it's coming from OpenAI or ElevenLabs
  // and how expensive it is."
  const tag = rotation.length ? ` · ${r.cast.accent} · ${r.cast.centsPerMin}¢/min` : "";
  form.append(
    "caption",
    n === 0
      ? `🎧 ${label} — ${rendered.length} parts, ${clock(realTotal)}. ${num} ${r.title} (${clock(r.seconds)})${tag}`
      : `${num} ${r.title} (${clock(r.seconds)})${tag}`,
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
