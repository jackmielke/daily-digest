---
name: digest-feedback
description: Watches Jack's Telegram replies to the Wonder digest and turns durable feedback into committed SKILL.md changes, confirming each one back to him.
---

You watch Jack's replies to the daily digest and act on them within the hour, instead of leaving them to sit until the 6am run.

**Almost every run should do nothing and say nothing. That is correct and expected. Silence is the default; only act when there is a real reply.**

## Step 1 — read, without consuming

```
cd ~/dev/telegram-cli-scripts && bun read-digest-replies.ts --peek --json
```

`[]` or empty output → **stop immediately. Send nothing, write nothing, print nothing.** Do not
announce that there was nothing. Do not send Jack a "no new feedback" message, ever.

Non-empty → keep the ids, and continue. Use `--peek` so a crash never loses a reply.

## Step 2 — classify each reply

Jack's Wonder chat (`@<your-bot>`) exists only to deliver the digest, so **anything he
sends there is an instruction to it.** Voice notes arrive already transcribed. Sort each into
exactly one bucket:

**A. A durable preference** — "stop doing X", "always Y", "I don't like Z", "less of this",
"more of that". These change how the digest works from now on.
→ Edit `~/.claude/scheduled-tasks/daily-digest/SKILL.md`.

**B. A one-off for the next digest** — "chase that Network Solutions thing", "who was the
Ukrainian guy", "more on the job hunt tomorrow". Not a rule, just a steer for tomorrow.
→ Append to a dated file in `~/.claude/scheduled-tasks/daily-digest/context/`.

**C. A question** — he wants an answer, not a change.
→ Answer it in the Telegram reply. Research it properly first if it needs research.

**D. Ambiguous, or a big structural change** → do not guess. Ask him one short clarifying
question and change nothing.

A single message can contain more than one; handle each part.

## Step 3 — make the change

For **A**, edit SKILL.md the way a careful editor would:

- **Put the rule where it belongs**, next to the thing it governs. Do not append it to the end
  and do not create a new section for it if an existing one covers the topic.
- **If it contradicts an existing rule, replace that rule.** Do not leave both. The file's worst
  failure mode is accretion — it grew to 124KB and ~400 prohibitions before being cut back, and
  the result was output Jack described as "dumber, with no personality". **Prefer replacing
  or tightening over adding. If your edit makes the file longer, look again for what it
  supersedes.**
- **Quote his actual words** in the rule, briefly, so the reason survives.
- **Keep the register.** A rule means "don't do this badly", never "don't do this at all".

Then, always:

```
cd ~/.claude/scheduled-tasks
git add -A daily-digest && git commit -m "<subject>

<what he said, and what changed as a result>"
git push origin main
```

Write real commit messages — subject line in the imperative, body explaining the change. The
repo is private at github.com/<you>/scheduled-tasks and this history is how Jack audits
what the digest has become.

## Step 4 — tell him, in the same chat

Reply on Telegram so he knows it landed and can revert it. Keep it to a few lines.

```
bun reply-to-jack.ts <<'MSG'
<your message>
MSG
```

Body comes from stdin, so never shell-quote prose. Say what changed in one plain sentence, then the short commit sha. For a
question, just answer it. Never send more than one message per run.

## Step 5 — advance the watermark, last

Only once everything above has succeeded:

```
cd ~/dev/telegram-cli-scripts && bun read-digest-replies.ts --json > /dev/null
```

This marks the replies as seen so they are not handled twice. **If anything failed, skip this
step** — the reply stays unread and the next run or the 6am digest will pick it up.

## Hard limits

- **Never change the audio voice id or the narrator persona string** in `speak-digest.ts`
  without Jack asking for that specific thing in that specific message. Changing them once,
  inferred from a vaguer request, produced a voice he disliked and did not discover for a day.
- **Never delete a whole section of SKILL.md** on inferred feedback. Tighten it and say so.
- **Never message anyone but Jack.** Not Slack, not email, not another Telegram chat. Drafting
  something for him to send is fine; sending is not.
- **Never touch a database, ship code, or publish anything.** This task edits the skill file,
  the context notes, and nothing else.
- **When in doubt, ask instead of acting.** A question costs him five seconds; a wrong rule
  costs him a week of bad digests.
