#!/usr/bin/env bun
/**
 * Ping yourself on Telegram via your own bot when the daily
 * digest is ready, with an overview and a link to the Notion page.
 *
 * The body is read from stdin so the digest never has to shell-quote prose:
 *
 *   bun notify-telegram.ts \
 *     --title "VibeCoin treasury gets a blueprint" \
 *     --url "https://app.notion.com/p/..." <<'EOF'
 *   One-sentence TL;DR.
 *
 *   ⚡ Flagged
 *   • First urgent thing
 *   • Second urgent thing
 *   EOF
 *
 * Flags:
 *   --title     headline (the digest row's Title)   [required]
 *   --url       Notion page URL                     [required]
 *   --almanac   Almanac artifact URL                [optional]
 *   --dispatch  Dispatch artifact URL               [optional]
 *   --icon      emoji prefix (default 🔮)
 *   --dry       print the payload without sending
 *
 * When an artifact URL is passed, the footer becomes a row of links so you can
 * pick a reading style from the message itself:
 *
 *   Read it → Almanac · Dispatch · Notion
 *
 * Auth: TELEGRAM_BOT_TOKEN, from the environment or from `.env` beside this file.
 * The token is never logged, including in --dry runs.
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
const ENV_FILE = new URL(".env", import.meta.url).pathname;

const args = process.argv.slice(2);
const flag = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? undefined : args[i + 1];
};

const title = flag("title");
const url = flag("url");
const almanac = flag("almanac");
const dispatch = flag("dispatch");
const icon = flag("icon") ?? "🔮";
const dry = args.includes("--dry");

if (!title || !url) {
  console.error(
    "Usage: bun notify-telegram.ts --title <t> --url <notion-url>" +
      " [--almanac <url>] [--dispatch <url>] [--icon <emoji>] [--dry] < body",
  );
  process.exit(1);
}

async function loadToken(): Promise<string> {
  if (process.env.TELEGRAM_BOT_TOKEN) return process.env.TELEGRAM_BOT_TOKEN;

  const file = Bun.file(ENV_FILE);
  if (await file.exists()) {
    for (const line of (await file.text()).split("\n")) {
      const m = line.match(/^\s*TELEGRAM_BOT_TOKEN\s*=\s*(.+?)\s*$/);
      if (m) return m[1].replace(/^["']|["']$/g, "");
    }
  }

  console.error(
    `No TELEGRAM_BOT_TOKEN found.\n` +
      `Add it with (token comes from @BotFather for your bot):\n` +
      `  echo 'TELEGRAM_BOT_TOKEN=<token>' >> ${ENV_FILE}`,
  );
  process.exit(1);
}

/** Telegram's HTML parse mode only needs these three escaped in text nodes. */
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const body = await Bun.stdin.text();

const today = new Date().toLocaleDateString(undefined, {
  weekday: "long", month: "long", day: "numeric",
});

/** Footer links, in reading-preference order: the two styled pages, then Notion. */
const reads: Array<[string, string]> = [];
if (almanac) reads.push(["Almanac", almanac]);
if (dispatch) reads.push(["Dispatch", dispatch]);
reads.push(["Notion", url]);

const footer =
  reads.length > 1
    ? "Read it → " + reads.map(([l, u]) => `<a href="${esc(u)}">${esc(l)}</a>`).join(" · ")
    : `<a href="${esc(url)}">Read the full digest →</a>`;

const message = [
  `${icon} <b>${esc(title)}</b>`,
  `<i>${esc(today)}</i>`,
  "",
  esc(body.trim()),
  "",
  footer,
].join("\n");

if (dry) {
  console.log("--- would send to chat", chatId(), "---");
  console.log(message);
  process.exit(0);
}

const token = await loadToken();
const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    chat_id: chatId(),
    text: message,
    parse_mode: "HTML",
    link_preview_options: { is_disabled: true },
  }),
});

const json: any = await res.json();
if (!json.ok) {
  // Redact the token in case Telegram echoes the request path back.
  console.error("Telegram send failed:", JSON.stringify(json).replaceAll(token, "<redacted>"));
  process.exit(1);
}
console.log(`Sent to Telegram (message_id ${json.result.message_id}).`);
