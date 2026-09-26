---
name: weekly-invoice-drafts
description: Every Thursday 6pm: draft one invoice per active client for the week's work into Notion, update the Value Ledger, ping Telegram with the links.
---

You are drafting Jack Mielke's weekly client invoices. Jack has RSI and reads by voice — keep every message under ~150 words, lead with results, no preamble. Nothing you produce is sent to a client; you create DRAFTS for Jack to approve on Monday.

## Context you need (self-contained — do not assume prior conversation)

- Invoices live in one Notion database, "Invoices", under "The Mielke Way" — **database and data-source ids are in `PRIVATE.md`**. Properties: Invoice (title), Number (text, sequential like "0237"), Client (relation to the Projects & Collabs data source, id also in `PRIVATE.md`), Status (Draft/Approved/Sent/Paid/Overdue/Void), Issue Date, Period Start, Period End, Hours, Rate, Amount, Paid Date, Est. Value Delivered, PDF.
- **Known client pages in Projects & Collabs, with their page ids and rates: see `PRIVATE.md`.** Search Projects & Collabs for any other client before creating a row.
- Ravishing Radish's Lovable repo is at `~/dev/active/radish/ravishing-radish` (commits come from `gpt-engineer-app[bot]`; commit titles are the deliverable list, ignore ones titled "Changes", "Update plan", "Retried…", "Work in progress"). Scan `~/dev/active/` for any other repo with commits this week.
- Jack's long-form notes on this system: `~/.claude/projects/-Users-jackmielke/memory/invoicing_system.md`. Read it first.
- The Value Ledger is a Claude artifact — **its url is in `PRIVATE.md`**. Read it with the Artifact tool (action "read", that url), add the new invoice rows to the `DATA` array in the same shape as the existing entries, and republish to the same url.

## Two column rules that are easy to get wrong
- `Amount` is THIS INVOICE ONLY — never a running balance. Carried balances go in the page body as an "Account summary" section.
- `Est. Value Delivered` is the INCREMENTAL first-year value of this period's work only, so rows stay comparable and later periods don't re-count earlier work.

## Steps

1. **Define the period.** Friday of last week through today (Thursday). Issue date = tomorrow (Friday). Next invoice number = (highest existing `Number` in the database) + 1, zero-padded to four digits.

2. **Gather the week's work per client.**
   - Git: for each repo under `~/dev/active/` with commits in the period, list substantive commit titles grouped by theme.
   - Hours from git: group commit timestamps into sessions using a 45-minute gap threshold, sum each session's span, add 20 minutes lead-in per session. (Do NOT count distinct clock-hours — that overcounts ~40%.)
   - Meetings: Granola `list_meetings` (this_week) and Wispr Flow `search_meetings` (since period start). Keep the ones with a client; note each meeting's Wispr `share_link` for the reference-notes section.
   - Add meeting durations to the git hours; round to a whole number.

3. **For each client with work this week, create one Draft page** in the Invoices data source, mirroring the structure of Invoice #0236 (fetch it — page id in `PRIVATE.md`) — callout header, From/Bill To, Project, Account summary (any still-open prior invoices for that client), "What got done" grouped by area, "Value delivered" table with a per-line estimate AND the assumption behind it (ops labour $35/hr loaded, planner time $40/hr, annualised), a single flat line item with hours shown as context, Reference notes (Wispr/Granola links), Payment block (copy from #0236), Notes, and a final internal "remove before sending" callout listing anything Jack must verify.
   - Ravishing Radish: family rate is $50/hr but Jack prefers a flat per-period figure with hours as context. Propose the flat amount at roughly $50 × hours, rounded to a clean number, and say so in the internal callout.
   - Other clients: use whatever rate their last invoice used; if none, use $105/hr and flag it.
   - Fill every property: Number, Client, Status=Draft, Issue Date, Period Start/End, Hours, Rate, Amount, Est. Value Delivered.
   - If a client had no work this week, create nothing for them.

4. **Update the Value Ledger artifact** with the new rows (deliverables, per-line values, verdict), keeping it in the same style. Republish to the same url.

5. **Ping Jack on Telegram** so he gets the link on his phone, the same way the daily digest does. Run from `~/dev/scheduled-tasks/daily-digest/` (its `.env` holds the bot token and chat id):

   ```
   bun notify-telegram.ts --icon 🧾 --title "<one-line themed headline for the week>" --url "<Notion URL of the largest draft, or the Invoices database if several>" --ledger "<the Value Ledger url from PRIVATE.md>" <<'EOF'
   <one line per drafted invoice: #number · client · hours · $amount · capture %>

   ⚠️ Verify
   • <anything flagged in the internal callouts>
   EOF
   ```
   The body is plain text, under ~600 characters. If the send fails, say so in the recap and continue.

6. **Post the recap** as your final message: one line per drafted invoice — number, client, period, hours, amount, est. value, capture % (amount ÷ value) — plus a two-line work recap for the week and any items flagged for verification. Link each Notion draft and the ledger. Then stop. Do not mark anything Approved or Sent, and do not email anyone.

If a connector you need (Notion, Granola, Wispr Flow) is unavailable, say which one and produce what you can from git alone.