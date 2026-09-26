# digest-remix — the day in other mediums

The daily digest is an article and a podcast. This folder turns the same day into things
that are not: a song, a four-panel comic, a short TV episode, a playable game. Jack asked
for it on 19 Sep 2026: *"switch it up from just the typical article and podcast-style
thing… crank on as much as possible."* Each medium is one script; each script falls back
gracefully when a key is missing, so nothing in here can silently produce nothing.

Everything reads the morning digest that already exists (`daily-digest/context/<date>-status.md`,
the Notion row, the Comedy section) and never re-gathers. The digest is the source; this is
the remix.

## The mediums

| Medium | Script | Needs | Output |
|---|---|---|---|
| **Song lyrics** | write by hand into `lyrics/<date>-<style>.md` (title line, `Style prompt for Suno:` line, lyrics) | nothing | the file |
| **Song audio** | `bun suno.ts lyrics/<date>-*.md` | `SUNO_API_KEY` (sunoapi.org gateway shape; `SUNO_API_BASE`/`SUNO_MODEL` override) | `out/<lyrics>-N.mp3`, sent to Telegram. **No key → sends the paste-ready block to Telegram instead.** |
| **Comic** | `bun comic.ts --date <date>` reads `out/<date>-panels.json` (`[{caption, scene}]`) | `OPENAI_API_KEY` (gpt-image-1, ~$0.05/panel medium) | `out/<date>-panel-N.png` |
| **Vibe TV** | `bun tv.ts --date <date> --audio out/audio/<track>.mp3` | ffmpeg + `caption.swift` (AppKit renders text, because this ffmpeg has no drawtext) | `out/<date>-tv.mp4` 1280×720 |
| **Panel motion** | `bun higgsfield.ts out/<date>-panel-N.png` | `HIGGSFIELD_API_KEY` | `out/<date>-panel-N.mp4`; tv.ts uses it if present, else Ken Burns |
| **Game** | a single HTML artifact written per day (see `games/`) | nothing | a claude.ai artifact URL |
| **Delivery** | `bun deliver.ts --text/--panels/--video/--audio` | `WONDER_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Telegram messages |

Get one narrated track as a file with `bun ../daily-digest/speak-digest.ts --no-send --out out/audio/comedy.mp3 < comedy.txt`
(`--out` wants a file path, not a directory).

## Voice, same as the digest

Vibey. Funny because the material is funny, verbatim where it quotes, never explaining the
joke. Lyrics rhyme the real day (the affogato both recorders heard as an avocado, the Dairy
Queen potty, the plist never installed); they do not invent events. The comic panels carry
no text in the image (captions are burned in by tv.ts, so the panel stays reusable). Vibey
appears in every panel as an observer, never the subject.

## Style prompts that have worked
- Country: *outlaw country ballad, warm baritone, acoustic guitar and pedal steel, brushed drums, fiddle on the chorus, 92 bpm, Zach Bryan meets Willie Nelson, no autotune*
- Hip-hop: *boom-bap, dusty jazz sample, 88 bpm, laid-back male rap with a sung hook, Anderson .Paak meets Little Simz*
- Shanty: *rowdy sea shanty, male group call-and-response, stomps and claps, accordion and fiddle, 3/4 swing, The Longest Johns*
- Comic: *flat two-colour risograph in sage green and rust orange on cream, thick ink lines, deadpan, no text in image*

## Keys still missing (19 Sep 2026)
`SUNO_API_KEY` and `HIGGSFIELD_API_KEY`. Put them in `digest-remix/.env`. Until then the
song ships as a paste block and the video uses stills.

## Firsts
- 19 Sep 2026: three lyric sets (country, hip-hop, shanty), four panels, one 3-minute TV
  episode over the Comedy track, one side-scroller (*Twenty Miles to Sausalito*).
