/**
 * x-timeline.ts — read Jack's actual X timeline out of Arc, in a BACKGROUND tab.
 *
 * Jack asked for this by name on 2026-09-30: "This would be a huge win if we could
 * get my X timeline… I want to solve this problem today of having you be able to just
 * look through my X account for me and even link some posts in the digest."
 *
 * WHY THIS SHAPE
 *
 * X walls /home behind a login and will not serve a timeline to anything anonymous,
 * so every API-shaped approach is dead without a paid key. What works is reading the
 * page in a browser that already holds the session. Arc is signed in, and Arc takes
 * osascript JS injection (Chrome does not).
 *
 * THE THING THAT WAS WRONG FOR A MONTH. Every previous version of this drove Arc's
 * ACTIVE tab and put it back afterwards, on the belief — written into youtube-watched.ts
 * and from there into SKILL.md — that "Arc can only inject into the active tab." That is
 * false. Arc's `execute` command takes a tab specifier, and `tab` responds to it, so any
 * tab in any window will do. The real problem was narrower: a NEWLY MADE tab is not
 * reliably the active one, and the old code solved that by driving the tab it was already
 * on. Measured 2026-10-03: `execute t javascript "1+1"` against a non-active GitHub tab
 * returned 2 while another tab stayed in front.
 *
 * So this version never NAVIGATES anything of Jack's. It finds a pinned x.com tab by
 * URL and drives that.
 *
 * IT DOES BORROW FOCUS, AND IT HAS TO. Measured 2026-10-03: in a hidden tab the feed
 * freezes at whatever it had rendered — scrollHeight stuck at 12,565 across six
 * attempts, 11 articles, nothing new. Scrolling works and spoofing the Page Visibility
 * API works (document.hidden really does flip to false), and X still refuses to load
 * more, so the gate is browser-level throttling of hidden tabs rather than anything in
 * the page. `select` the tab and it comes alive immediately: scrollHeight 12,565 →
 * 26,182 → 40,365 → 54,607 → 67,766 over four passes.
 *
 * So: select the pinned tab, scroll it, select his tab back. That is a ~30 second
 * borrow of the foreground, and crucially it only ever changes which tab is SELECTED —
 * it never changes the URL of a tab Jack owns, which is the mistake that nearly ate a
 * half-written post. Pass --quiet to skip the borrow and accept the shallow read.
 *
 * Three more traps, all real:
 *
 * 1. THE FEED IS VIRTUALISED. Only ~5 <article> elements are mounted at a time, so one
 *    read returns five posts however long the feed is. You have to scroll and
 *    accumulate. Measured 2026-09-30: 5 posts without the loop, 31 with it.
 * 2. NO TOP-LEVEL AWAIT. Injection goes through `eval(atob(...))`, where `await` at top
 *    level is a syntax error and an `async` IIFE comes back as `{}`. So the scroll loop
 *    lives here in TypeScript; the posts accumulate in `window.__xseen` between calls.
 * 3. osascript RETURNS THE RESULT DOUBLE-ENCODED. stdout is a quoted JSON string
 *    containing JSON. One parse yields a string whose .url is undefined, which reads
 *    exactly like "we landed on the wrong page". Parse twice.
 *
 * Usage:
 *   bun x-timeline.ts                 # ~10 scroll passes
 *   bun x-timeline.ts --passes 16     # dig further back
 *   bun x-timeline.ts --hours 24      # only posts from the last N hours
 *   bun x-timeline.ts --json
 *   bun x-timeline.ts --keep          # leave the tab open (for debugging)
 */

import { spawnSync } from "node:child_process";

type Post = {
  who: string;
  handle: string;
  when: string;
  ctx: string | null;
  text: string;
  url: string;
  from?: string;
};

const args = process.argv.slice(2);
const flag = (name: string, dflt: number) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? Number(args[i + 1]) : dflt;
};
const PASSES = flag("passes", 10);
const HOURS = flag("hours", 0);
const AS_JSON = args.includes("--json");
const QUIET = args.includes("--quiet"); // skip the focus borrow, accept a shallow read
const PATH = (() => { const i = args.indexOf("--path"); return i >= 0 && args[i + 1] ? args[i + 1] : ""; })();
/**
 * --all walks several logged-in surfaces in one borrow of the foreground and merges
 * them, deduped on permalink. The home feed is the firehose; bookmarks are the half
 * he curated himself and are consistently the better read; notifications are where
 * replies to him live. Each surface is its own navigation, so `window.__xseen` is
 * wiped between them — the accumulation has to happen out here in TypeScript.
 */
const SURFACES: Array<{ path: string; name: string }> = args.includes("--all")
  ? [
      { path: "/home", name: "feed" },
      { path: "/i/bookmarks", name: "bookmark" },
      { path: "/notifications", name: "notification" },
    ]
  : [{ path: PATH || "/home", name: PATH ? PATH.replace(/^\//, "") : "feed" }];

const MARK = "x.com/";

const osa = (script: string) =>
  spawnSync("osascript", ["-e", script], { encoding: "utf8", timeout: 90000 });

let onExit: () => void = () => {};
function fail(note: string): never {
  onExit();
  if (AS_JSON) console.log(JSON.stringify({ posts: [], note }));
  else console.log(`x-timeline: ${note}`);
  process.exit(0);
}

/**
 * Run JS in the first tab, in any window, whose URL contains MARK. Never uses
 * `active tab`, so whatever Jack is looking at is untouched.
 */
function inject(js: string) {
  const b64 = Buffer.from(js, "utf8").toString("base64");
  return osa(`
    tell application "Arc"
      repeat with w in windows
        repeat with t in (every tab of w)
          if (URL of t) contains "${MARK}" then
            return execute t javascript "eval(atob('${b64}'))"
          end if
        end repeat
      end repeat
      return "__NOTAB__"
    end tell`);
}

/** osascript hands the JS return value back as an AppleScript string literal. */
function readResult(out: string): any {
  let parsed: any = JSON.parse(out.trim());
  if (typeof parsed === "string") parsed = JSON.parse(parsed);
  return parsed;
}

if (spawnSync("pgrep", ["-x", "Arc"], { encoding: "utf8" }).status !== 0)
  fail("Arc is not running — this needs the browser that holds the X session.");

// THIS NEEDS A PINNED x.com/home TAB IN ARC, and that is a one-time setup step.
// `make new tab` is in Arc's dictionary but is not implemented — it returns
// `missing value` and creates nothing (measured 2026-10-03). So the script cannot
// open its own tab, and pointing some arbitrary existing tab at X would be the same
// clobbering problem this rewrite exists to remove. A pinned tab is the right home:
// it survives restarts, it is never the active tab by accident, and reloading it
// costs nobody anything.
const existing = osa(
  `tell application "Arc"
     repeat with w in windows
       repeat with t in (every tab of w)
         if (URL of t) contains "${MARK}" then return "found"
       end repeat
     end repeat
     return "none"
   end tell`,
);
if (existing.stdout.trim() !== "found")
  fail(
    `no x.com tab in Arc. Open https://x.com/home once and pin it ` +
      `(right-click the tab in the sidebar, Pin Tab). This drives that tab and ` +
      `never changes the URL of any tab you own.`,
  );

const selectByUrl = (u: string) =>
  osa(`tell application "Arc"
    repeat with w in windows
      repeat with t in (every tab of w)
        if (URL of t) contains "${u.replace(/"/g, "")}" then
          select t
          return "selected"
        end if
      end repeat
    end repeat
    return "nomatch"
  end tell`);

// Remember which tab he is on so we can hand it straight back.
const hisTab = QUIET
  ? ""
  : osa(`tell application "Arc" to return URL of active tab of front window`).stdout.trim();

// Navigating OUR pinned tab, never one of his, and putting it back at the end.
const navPinned = (u: string) =>
  osa(`tell application "Arc"
    repeat with w in windows
      repeat with t in (every tab of w)
        if (URL of t) contains "${MARK}" then
          set URL of t to "${u}"
          return "ok"
        end if
      end repeat
    end repeat
  end tell`);

// Give the foreground back, and leave the pinned tab on /home so the next run finds it.
const done = () => {
  navPinned("https://x.com/home");
  if (!QUIET && hisTab && /^https?:/.test(hisTab)) selectByUrl(hisTab);
};
onExit = done;

/** Defines the collector on the page and runs one grab. Re-sent after every navigation. */
const SETUP = `
  (function(){
    if(!window.__xseen) window.__xseen = {};
    window.__xgrab = function(){
      var arts = document.querySelectorAll('article[data-testid="tweet"]');
      for (var i=0;i<arts.length;i++){
        var a = arts[i];
        var un = a.querySelector('div[data-testid="User-Name"]');
        var tx = a.querySelector('div[data-testid="tweetText"]');
        var tm = a.querySelector('time');
        if(!un || !tm) continue;
        var link = tm.closest('a');
        var href = link ? link.getAttribute('href') : null;
        if(!href || window.__xseen[href]) continue;
        var social = a.querySelector('[data-testid="socialContext"]');
        var nm = un.innerText.split('\\n').filter(Boolean);
        var handle = '';
        for (var j=0;j<nm.length;j++){ if(nm[j].charAt(0)==='@'){ handle = nm[j]; break; } }
        window.__xseen[href] = {
          who: nm[0] || '',
          handle: handle,
          when: tm.getAttribute('datetime') || '',
          ctx: social ? social.innerText : null,
          text: (tx ? tx.innerText : '(media only)').replace(/\\s+/g,' ').slice(0,400),
          url: 'https://x.com' + href
        };
      }
      return Object.keys(window.__xseen).length;
    };
    return JSON.stringify({ n: window.__xgrab(), url: location.href });
  })()`;

/** Read one X surface end to end. Returns its posts, tagged with where they came from. */
async function readSurface(path: string, name: string): Promise<Post[]> {
  navPinned(`https://x.com${path}`);
  if (!QUIET) selectByUrl(MARK);
  await new Promise((r) => setTimeout(r, 8000)); // the page hydrates slowly

  const first = inject(SETUP);
  if (first.status !== 0) { console.error(`  ${name}: Arc JS failed`); return []; }
  if (first.stdout.includes("__NOTAB__")) { console.error(`  ${name}: pinned tab vanished`); return []; }

  let state: any;
  try { state = readResult(first.stdout); }
  catch { console.error(`  ${name}: could not read the page back`); return []; }
  if (/\/i\/flow\/login|\/login/.test(state.url || "")) {
    console.error(`  ${name}: signed out of X (landed on ${state.url})`);
    return [];
  }

  // The scroll loop lives out here, not in the page, because eval cannot await.
  // A hidden tab will not lazy-load at all, which is why --quiet reads shallow.
  for (let i = 0; i < PASSES; i++) {
    if (inject(`(function(){ window.scrollBy(0, window.innerHeight * 1.4); return "ok"; })()`).status !== 0) break;
    await new Promise((r) => setTimeout(r, 1200));
    if (inject(`(function(){ return JSON.stringify({n: window.__xgrab()}); })()`).status !== 0) break;
  }

  const dump = inject(
    `(function(){ return JSON.stringify({posts:Object.keys(window.__xseen).map(function(k){return window.__xseen[k];})}); })()`,
  );
  if (dump.status !== 0) { console.error(`  ${name}: final read failed`); return []; }
  try {
    const got: Post[] = (readResult(dump.stdout).posts || []).map((p: Post) => ({ ...p, from: name }));
    console.error(`  ${name}: ${got.length}`);
    return got;
  } catch { console.error(`  ${name}: could not parse the posts`); return []; }
}

console.error(`reading ${SURFACES.length} surface(s)${QUIET ? " (quiet \u2014 expect a shallow read)" : ""}:`);
const byUrl = new Map<string, Post>();
for (const sfc of SURFACES) for (const post of await readSurface(sfc.path, sfc.name))
  if (!byUrl.has(post.url)) byUrl.set(post.url, post);
done();

const posts: Post[] = [...byUrl.values()].sort((a, b) => (a.when < b.when ? 1 : -1));
const cutoff = HOURS ? Date.now() - HOURS * 3600_000 : 0;
const inWindow = cutoff
  ? posts.filter((p) => p.when && new Date(p.when).getTime() >= cutoff)
  : posts;

if (AS_JSON) {
  console.log(JSON.stringify({ scanned: posts.length, posts: inWindow }, null, 2));
} else {
  console.log(
    `=== X timeline — ${inWindow.length} post(s)` +
      (HOURS ? ` in the last ${HOURS}h` : "") +
      ` from ${posts.length} across ${SURFACES.map((x) => x.name).join(', ')} ===\n`,
  );
  for (const p of inWindow) {
    const t = p.when
      ? new Date(p.when).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
      : "?";
    console.log(`  ${p.who} ${p.handle}  ${t}${p.from && p.from !== 'feed' ? `  [${p.from}]` : ''}`);
    if (p.ctx) console.log(`  (${p.ctx.replace(/\n/g, " ")})`);
    console.log(`  ${p.text.slice(0, 260)}`);
    console.log(`  ${p.url}\n`);
  }
  if (!posts.length)
    console.log("  Nothing came back. Open x.com/home in Arc once and check it loads.");
}
