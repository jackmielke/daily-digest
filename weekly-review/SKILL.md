---
name: weekly-review
description: Sunday review: trends rather than events across the week — what moved, what only churned, the action-list audit, and the quote of the week.
---

This is the weekly review for Jack, run automatically on Sunday evening. He is not present. Work autonomously.

**The daily digest reports events. This reports trends.** Nothing in here should be a thing that happened once — the daily already covered that. Every claim should be a direction, a rate, a comparison, or a pattern that only becomes visible with seven days of data. If you find yourself writing "on Tuesday he…", stop and ask what the week says instead.

The reference edition is the trial run of 2026-08-21, published at
https://claude.ai/code/artifact/<data-source-id> — read it first
for the register and the depth. It is the standard to hit.

## Gather (a week, not a day)

1. **The week's digests.** `notion-query-data-sources` on data source `<data-source-id>` for the last 7 days: Title, date, TL;DR, Open Actions, Meetings, Needs Attention, Themes. The titles alone give you the week's arc.
2. **GitHub:** `cd ~/.claude/scheduled-tasks/daily-digest && bun github-activity.ts --hours 168 --json`. Read the **`writtenBy`** field on each commit, never the author name: `Lovable`, `Claude Code`, or `hand-written`. **A commit authored `Jack Mielke` is an interactive Claude Code session, not Jack typing** — he corrected this on 2026-08-21 after the trial run called 65 commits hand-written. Genuinely human commits are effectively nonexistent (zero of 1,171 that week). The useful distinction is Lovable vs Claude Code, and within Claude Code, author `Claude` = overnight autonomous runs vs author `Jack Mielke` = Jack driving. The script paginates now; before 2026-08-21 it truncated at 100 per repo and reported a 1,171-commit week as 288.
3. **Supabase trends**, not snapshots. the client is `<project-ref>`, Vibe is `<project-ref>`. Ask 9–10 day questions so the week has a before: distinct daily users on the Hub, writes per day, error counts per day. Read-only, always.
4. **Meetings:** Granola `list_meetings` and Wispr Flow `search_meetings` across the week. Count them, but more usefully: what did he keep talking about?
5. **Wispr Flow scratchpad notes** for the week — his own dictated thinking is the best evidence of what he actually cares about.
6. **Replies:** `cd ~/dev/telegram-cli-scripts && bun read-digest-replies.ts --peek --since 7d`. Anything he asked for during the week shapes this review. Use `--peek` so the Monday digest still sees them.

## The sections that matter

**The arc.** The seven daily titles in order, one line each, then a paragraph naming the through-line. There usually is one and it is usually not the loudest day.

**Trends, with real charts.** Inline SVG, hand-built, no libraries. Load the `dataviz` skill before writing any chart and follow it — in particular, validate the palette with its script rather than eyeballing it, and direct-label every series (the Almanac paper fails the 3:1 contrast check, so labels are the required relief). Three or four charts is plenty. Good candidates: commits per day by author, Hub daily actives over 9–10 days, open action items across the week.

**The action-list audit.** Compare the oldest and newest lists of the week item by item and sort every disappearance into **done** (with evidence), **expired** (deadline passed), or **vanished** (gone with no evidence). Report the counts. The recurring finding to test each week: things he can do alone at a keyboard get closed; things that need messaging a human get dropped. Also list anything older than a week with its age.

**Overheard.** The best quote of the week from a transcript, verbatim, with the speaker. Real ones only.

**What the dailies got wrong or missed.** Be honest and specific. A week of hindsight usually reveals at least one thing reported as three unrelated items that was actually one, or a number described as flat that was in fact climbing.

**What to watch next week.** Three to five things, each with a reason it is checkable next Sunday. Self-imposed deadlines count and should be named.

## Publish

Write it as an artifact in the **Almanac family** — same fonts (Newsreader + Spline Sans Mono), same green-grey paper, same theme-aware token structure — but chart-forward, since trends are the point. Title it **The Sunday Ledger**, favicon 📈. **Republish to the stable URL** https://claude.ai/code/artifact/<data-source-id> by passing it as `url`, so the link never changes.

Then send **one audio track**, 90–120 seconds, via
`cd ~/.claude/scheduled-tasks/daily-digest && bun speak-digest.ts --set "Week in review" --title "The week"`,
following the script rules in Step 10 of the daily-digest skill: no URLs, no markdown, numbers written the way they are said. The weekly track should be the *judgement*, not the data — what moved, what did not, what to do about it.

Finally a short Telegram note linking the page, via `notify-telegram.ts`.

**Quota:** the ElevenLabs allowance is shared with the daily digest and is tight — roughly a week of daily sets. Keep the weekly track under 1,200 characters. If `speak-digest.ts` exits 2 for quota, send the page and the text note without audio and say so.

## Tone

Jack has said he does not want to be nagged, and a weekly review is where nagging gets structural. State what the data says once, plainly, and let him draw the conclusion. Praise what genuinely moved — this is the one place that can see progress a daily cannot, and if the week was good it should say so without hedging.
