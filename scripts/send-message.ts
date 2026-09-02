#!/usr/bin/env bun
/**
 * Send yourself one plain message on Telegram via your own bot.
 *
 * This is the digest talking BACK to him — the other half of read-digest-replies.ts.
 * He replies to the digest; `digest-feedback` acts on it; this confirms what changed.
 *
 *   bun reply-to-jack.ts <<'EOF'
 *   Changed: crypto is now every few days, not daily.
 *   commit a1b2c3d
 *   EOF
 *
 *   bun reply-to-jack.ts --dry <<< "test"     # print without sending
 *
 * Body comes from stdin so callers never have to shell-quote prose.
 * Auth: TELEGRAM_BOT_TOKEN, from the environment or `.env` beside this file.
 * The token is never logged.
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
const dry = process.argv.includes("--dry");

function token(): string {
  if (process.env.TELEGRAM_BOT_TOKEN) return process.env.TELEGRAM_BOT_TOKEN;
  try {
    for (const line of require("fs").readFileSync(ENV_FILE, "utf-8").split("\n")) {
      const m = line.match(/^\s*TELEGRAM_BOT_TOKEN\s*=\s*(.+?)\s*$/);
      if (m) return m[1].replace(/^["']|["']$/g, "");
    }
  } catch {}
  console.error(
    `No TELEGRAM_BOT_TOKEN found.\n` +
      `  export TELEGRAM_BOT_TOKEN=<token>   or\n` +
      `  echo 'TELEGRAM_BOT_TOKEN=<token>' >> ${ENV_FILE}`,
  );
  process.exit(1);
}

const body = (await Bun.stdin.text()).trim();
if (!body) {
  console.error("Nothing to send — the message body was empty on stdin.");
  process.exit(1);
}
if (body.length > 4096) {
  console.error(`Message is ${body.length} chars; Telegram's limit is 4096. Shorten it.`);
  process.exit(1);
}

if (dry) {
  console.log(`--- dry run, not sent ---\nto: ${chatId()}\n\n${body}`);
  process.exit(0);
}

const res = await fetch(`https://api.telegram.org/bot${token()}/sendMessage`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ chat_id: chatId(), text: body, disable_web_page_preview: true }),
});
const json: any = await res.json();
if (!json.ok) {
  console.error(`Telegram rejected the message: ${json.description ?? res.status}`);
  process.exit(1);
}
console.log(`Sent (message_id ${json.result.message_id}).`);
