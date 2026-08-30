---
name: digest-checkin
description: Jack's 5pm evening review — how the day actually went, and whether anything the morning digest claimed stopped being true.
---

This is the evening review for Jack, run automatically at 5pm. He is not present. Work autonomously.

**It replaced a 4pm correction-only check-in on 2026-08-24, because two evening pings is one too many.**
It does both jobs: *how did the day actually go*, and *did anything the morning digest claimed stop being true*.

**It is allowed to be quiet, but it is not silent by default.** A day where Jack worked has something
worth saying back to him. A day where nothing happened gets two lines saying so. Never pad.

**Where the output goes — this is the part that changed on 2026-08-26:**

| Surface | What it gets | Rule |
|---|---|---|
| **Today's Notion row** | A `## 🌙 How Today Went` section inserted into the **existing** page | **Never create a second page for a day.** |
| **Last Light** (artifact) | The full evening report | Always republish to the one stable URL |
| **Telegram** | A short ping linking to both | Short. He often reads only this. |

The morning digest is a forecast. This is the record. They belong on the same page.

---

## Step 1: What he actually worked on — the Claude Code sessions

```
cd ~/.claude/scheduled-tasks/daily-digest && bun claude-sessions.ts --hours 12
```

**This is the point of the 5pm run and the reason it exists.** Jack asked for it on 2026-08-24:
*"ideally it takes in these Claude Code conversations too, not just all the commits, because a lot
of context is shared here."*

It reads the local transcripts in `~/.claude/projects/` and prints his own prompts, per session,
with times. Commits tell you what landed; **these tell you what he was trying to do** — including
everything that never reached a commit: the debugging, the dead ends, the decisions made
mid-session, the thing he asked for at 2am and abandoned.

Read it for:

- **The arc of the session.** Where did it start, where did it end up, and did it get there? A
  session that opens with *"create a Mac app that runs locally"* and closes with *"it's still not
  working, I'm going to bed"* is a different day from one that closes with a release.
- **What he said he wanted and did not get.** These are the truest action items in the whole
  digest, because they are in his own words and he has already decided they matter.
- **Frustration and its cause.** *"This page just loves to come up"*, *"I don't know what's
  happening"* — recurring friction is worth naming once, with what it actually was.
- **Decisions.** Choosing Swift over Electron, dropping a feature, changing an approach. These
  rarely reach a commit message and are exactly what tomorrow's digest needs for continuity.
- `--full` prints untruncated prompts; `--json` for structure. `--hours 12` is right for a same-day view.

**Do not quote him back at himself at length.** Summarise the arc; quote at most one or two lines
where the exact words carry something a paraphrase would lose.

**A transcript's last line is not the outcome.** Sessions end when he goes to bed, not when the work
resolves — so the final entry is often a failure that was fixed in the next four minutes, off-camera,
in a browser. On 2026-08-25 the log ended on `STATE_ERROR.APP_DATA_USAGES_REQUIRED` and the app was
in Apple's review queue twenty minutes later. **Anything that has an authoritative external state,
check the state.** See Step 3b.

## Step 2: What landed

```
cd ~/.claude/scheduled-tasks/daily-digest && bun github-activity.ts --hours 12
```

Read `writtenBy`, never the author name — Claude Code commits under whichever git identity is
configured, so author "Jack Mielke" means an interactive session, not Jack typing.

**Fold Lovable's autosaves.** A run of `Changes` commits with one titled commit is *one* edit, not
fifteen. Report the real number and say so: "46 commits, 45 of them Lovable autosaves folding into
about eight real edits."

Pair it with Step 1: the interesting gap is between **what he asked for** and **what got committed.**

## Step 3: Did the morning's claims survive?

Fetch today's row from the **Daily Digest** database (data source `<data-source-id>`)
with `notion-fetch`. The date property is queried as `date:Date:start`:

```
SELECT id, url, "Title" FROM "collection://<data-source-id>"
WHERE "date:Date:start" >= '<today>'
```

Read the **⚡ Flagged** callout, **the one thing**, and the **top three actions** — that is your
watchlist. Then re-poll only the fast movers, since about 6am PT:

- **Wispr Flow** (`mcp__d31b7a96-…`): `search_meetings` and `search_scratchpad_notes` with `since`.
  Highest-yield source for a same-day change — a phone call that changes plans lands here.
  **Timestamps are UTC**; convert to Pacific.
- **Gmail**: `newer_than:1d`, and read anything from a party named in Flagged.
- **Telegram**: `cd ~/dev/telegram-cli-scripts && bun list-recent.ts`, then the 1:1s
  that relate to a flagged item.
- **Supabase**, only if a flagged item was a database fact. the client `<project-ref>`,
  Vibe `<project-ref>`. **Read-only, always.**

### Step 3b: Check the state, not the story

For anything with an authoritative external source, ask it rather than inferring from a transcript
or a commit message. Cheap, and it is the difference between reporting a day and guessing at one:

| Claim | How to actually check it |
|---|---|
| An app shipped / is in review | `asc --profile jack versions list --app <id>` — read `appStoreState` |
| A deploy went out | the repo's deploy surface, or the live URL |
| A sync ran | the sync-log table in Supabase, read-only |
| A fix works | run its verify script, or check the symptom outside the app |
| A message was sent | the thread itself, not the draft |

**Never report a fix as done because a session said it was.** Four separate FlowState "fixes" were
reported as done before the crackle was actually gone.

## Step 4: His replies

```
cd ~/dev/telegram-cli-scripts && bun read-digest-replies.ts
```

Anything he sent to the Wonder chat, text or voice, transcribed. **A reply outranks everything else
here** — if he asked something, answer it in this review rather than leaving it for tomorrow.

## Step 4b: Close the board

`Work Board`, data source `collection://<data-source-id>`.

**This is the step that makes the board trustworthy.** The morning digest opens rows; this
closes them, the same evening, while the evidence is fresh.

- Anything that landed today → **Complete**, with the evidence in `Closed by` — the commit,
  the sent message, the row that appeared. **Evidence or it stays open.**
- Anything he sent and is now waiting on → **Waiting on someone**, with the name.
- Anything that came back to him → **Blocked on me**.
- Never delete a row. Genuinely dead is **Dropped**, said once.

Report the movement in the evening message as one line: *"three closed, one came back to
you."* Not a list — he can open the board.

## Step 5: Check nothing already ran

**Before writing anything, confirm today's review has not already been sent.**

```
cd ~/dev/telegram-cli-scripts && bun read-messages.ts "Wonder" --limit 3
```

If a `🌙 How today went` message for today is already there, **stop — do not send a second.** The
Mac sleeps, the task fires late, and two runs can land minutes apart; on 2026-08-25 they landed one
minute apart. If the existing one is materially wrong, correct it in one short message that says
what changed. Otherwise say nothing and note it in your own output.

---

## Step 6: Write the evening section into today's Notion row

**Update the existing page. Never create a second row for a day.** Use `notion-update-page` with
`update_content`, inserting **before** the `## Since Yesterday` heading — which puts the review
directly under the ⚡ Flagged callout it is commenting on.

Fetch the page first, copy the `old_str` **verbatim** from what came back, then re-fetch to verify.
**A mismatched `old_str` silently no-ops** — it does not error, so an unverified edit reads as success.

If `## Since Yesterday` is absent (a quiet morning), anchor on `## Telegram Highlights`, then
`## Action Items`. If none exist, append at the end.

The block to insert:

```
---
## 🌙 How Today Went
*Filed at 5pm. Everything above this line is the morning's forecast; this is what actually
happened. [The full evening report on Last Light →](<stable artifact URL>)*

<columns>
	<column ratio="25">
		<callout icon="✅" color="green_bg">
			**1**
			app submitted for review
		</callout>
	</column>
	... three more, chosen for this day ...
</columns>

[One paragraph naming the day's actual shape, drawn from Step 1. Not a commit count.]

### Stopped being true
<callout icon="🔄" color="red_bg">
	**[The morning claim, in one line.]**
	**Now:** [what replaced it, and how it was verified.]
	*Changed at [time], after the digest was filed.*
</callout>

### Asked for, and not gotten
- **[Thing]** — *"[his words, one line]"* — [what actually happened to it, and what it costs.]

### What landed
[Table: repo / commits / what it amounts to. Fold the autosaves.]
```

**Notion markup traps, both learned the hard way on 2026-08-25:**

- **Inside `<table>` cells use markdown `**bold**`, never `<strong>`.** Notion escapes the HTML tag
  and renders a literal `\<strong\>` in the cell. The `<span color="green">…</span>` wrapper *is*
  supported in cells and is the way to colour a result.
- **Do not italicise a line that ends in a link** — the emphasis closes around the link text and the
  markers show. Put the link outside the italics.

**Say when something changed and that it changed after the digest was filed.** Never quietly
rewrite the morning's text — the correction is the useful part, and overwriting it destroys the
record of what he was told at 6:30am.

The only case for editing the morning's own words is a flagged item that is now **actively
misleading** — a deadline that passed, a person named who already replied. Then fix that line *and*
say so in the evening section.

## Step 7: Publish Last Light

The full report — the Notion section is the summary of it, not the other way round.

| Style | Template | Stable artifact URL — always publish to this |
|---|---|---|
| **Last Light** 🌙 | `templates/lastlight.html` | https://claude.ai/code/artifact/<data-source-id> |

Read `templates/README.md` before touching it — it lists what must not drift and which block earns
its place when. The short version:

1. **Copy the template into the scratchpad. Never edit it in place.**
2. **Replace the content only.** The `<style>`, the `<script>`, the nav markup and the `<title>`
   stay byte-identical.
3. **Publish with `url` set to the stable URL above**, favicon 🌙, so it updates in place instead of
   spawning a new page every evening.
4. **Drop a section, drop its nav link too** (`s1`…`s5`), or the link scrolls nowhere.

The template ships seeded with a real evening rather than lorem — read it for the shape.

**Register.** This is the one run that sees a whole day's work at once. Write it like someone who
watched the day happen: name the arc, name what broke, say plainly when it went well. Specific over
clever, and never congratulatory about a thing that did not finish.

## Step 8: One Telegram message

```
cd ~/.claude/scheduled-tasks/daily-digest && bun notify-telegram.ts \
  --title "How today went" \
  --url "<today's Notion digest URL>" \
  --icon "🌙" <<'EOF'
<the review>
EOF
```

Shape, and keep it short — he often reads only this:

- **What today was.** One or two sentences naming the day's actual shape, from Step 1 — not a commit count.
- **Anything that stopped being true**, with what replaced it.
- **What he wanted and did not get**, at most two, in his words.
- One line of numbers if they are interesting.
- The Last Light link, so the full report is one tap away.

Send **once**, after the Notion update is verified and Last Light is published. If either failed,
still send — link what exists and say which one failed. A silent failure is worse than a partial review.

**Send audio every evening.** Two tracks, via `speak-digest.ts` — same voice and register as the
morning set, which is the broadcaster reading it straight.

| Track | Holds | Target |
|---|---|---|
| **How today went** | What he actually did, what landed, what he wanted and did not get | 2:30–3:30 |
| **Tomorrow** | What survived from the morning, what is now due, and the one thing waiting on him | 1:30–2:30 |

**This used to say "audio only if the day earned it", and the reason it gave was an ElevenLabs quota
that has not applied since 24 August** — audio moved to OpenAI at about 1.5 cents a minute, so a
five-minute evening set costs under a dime. The rationing was real once and is now just a habit that
made the evening review worse than the morning one. Jack noticed: *"it doesn't really send me audio
recordings ever, and it's not nearly as good as the morning 6:00 a.m. digest."*

The same rules as the morning set apply: **write a new script for the ear**, never the page read
aloud. No URLs, no markdown, numbers spoken as words. **Each track under ~8,800 characters** (the
hard per-request cap). Each stands alone — he may play the second and not the first.

**A genuinely empty day gets one short track and says so**, rather than padding. But "he worked all
day and nothing broke" is not an empty day — that is the day worth telling him about.

## Tone

He has said directly that he does not want to be nagged. State what happened, name what did not, and
stop. If the day was good, say so plainly — a day that went well should be told to him.
