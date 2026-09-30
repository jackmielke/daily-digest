# The digest page template

One page, `digest.html`, published every morning to a stable URL:

**<your stable artifact URL — see PRIVATE.md>**

The old Dispatch URL (`<an older URL that now serves a redirect notice>`) now serves a short "this moved" notice. Leave it
alone unless Jack says otherwise — it catches an old bookmark.

## How to use it

1. **Copy the template into the scratchpad. Never edit it in place.**
2. **Replace the content only.** The `<style>` block, all three `<script>` blocks, the
   index-bar markup and the `<title>` stay byte-identical. Update the date in the
   `.home` nav link (`>30 Aug ↑<`) and everything from `<header class="record">` down.
3. **Strip external `<img>` tags** — the artifact viewer's CSP blocks every one,
   YouTube thumbnails included, so they render as broken boxes. Images are fine on the
   Notion page and nowhere else.
4. **Publish with `url` set to the stable URL above** and `force: true` (prior runs own
   the version history). Favicon 🌿, title `The Daily Digest`.

## The deck line — no source lists

**Removed 2026-09-22 at Jack's request.** The header deck used to read "Every entry below
carries where it came from in the margin…" and list the sources. It is gone and it does not
come back. The margin already says where each entry came from; saying so again in the deck is
the page explaining its own furniture.

The deck is **one sentence about what the day actually was**, or nothing at all. The sources
still belong in the colophon at the foot of the page, where they read as a record rather than
an explanation.

## The four skins — added 2026-08-30

Jack: *"I just want to be able to change the theme… I really like the newspaper type of
vibe, almost like a New York Times type of aesthetic."*

| Skin | What it is |
|---|---|
| **Almanac** | The default and unchanged. Sage paper, Newsreader, forest accent. |
| **Broadsheet** | Newsprint. Source Serif 4 + Libre Franklin, no colour accent at all, one red for alarms, a single drop cap. |
| **Dispatch** | The old second page as a skin — two-ink risograph, Big Shoulders masthead. |
| **Night** | The Almanac after dark. |

Each is a **complete token set** under `:root[data-skin="…"]`. To add or change one,
redefine the tokens — never style a component inside the skin block unless the change is
structural (weight, letterspacing, a masthead face).

**It deliberately ignores `prefers-color-scheme`.** The page used to flip to dark
whenever the OS was dark, which is how Jack kept getting a theme he had not chosen. The
default is now Almanac regardless of the OS, Night is an explicit pick, and the choice
persists in `localStorage['digest-skin']`. An inline script in the head sets `data-skin`
before first paint so there is no flash. **Do not reintroduce the media query.**

## The photo reel

The reel at the top is **empty in the markup** and filled at runtime by cloning every
`figure.plate` already on the page. Put photos inline once, in the section they belong
to; the reel is a view of them, not a second copy. Hand-copying them into the reel
doubles every data: URI and took the page from 600KB to 1.6MB.

Four things in here look arbitrary and are not:

- **No `scroll-behavior: smooth` on the track.** It makes every programmatic scroll
  animate, including a plain `scrollLeft =`, which is surprising and hard to debug.
- **The arrows verify their own scroll.** A smooth `scrollTo`/`scrollBy` is silently
  *dropped* — not slowed, dropped — on a `scroll-snap-type: mandatory` container in some
  engines, so the arrows do nothing at all. They hard-set 60ms later if nothing moved.
- **`sync()` is called directly after a click**, not left to the scroll event, so the
  disabled states are right even where scroll events are unreliable.
- **The track has no horizontal padding.** Mandatory snap resolves against the padding
  edge, so inline padding leaves a resting `scrollLeft` that never returns to 0 and the
  Prev button never disables.

**If you add a second reel implementation, delete the first.** Two of them shipped
together once: the later CSS overrode the earlier, and the surviving script found markup
it did not recognise and called `reel.remove()` — so the photos vanished entirely from a
page whose HTML was perfectly valid. `DOMParser` showed all of them; a real load showed
none.

## The viewport meta — added 2026-09-27, never remove it

Jack, on his phone: *"It doesn't work on mobile. You can scroll horizontally, which is not
ideal."* Two causes, both fixed in the template:

1. **The page had no `<meta name="viewport">` and the artifact wrapper does not add one.**
   It injects a charset and nothing else. Without the viewport meta iOS lays the page out at
   its 980px fallback width and the whole thing pans sideways. Measured in the browser pane:
   `document.documentElement.clientWidth` came back **980 inside a 375px viewport**.
2. **One long unbreakable token widened the grid.** A line of code in an entry —
   `window.addEventListener('vite:preloadError', …)` — took the document to 430px inside 375.
   Fixed with `overflow-wrap:anywhere` on `code`, `overflow-wrap:break-word` inherited from
   `.body`, and `min-width:0` on `.marg` and `.body` so an over-wide child can no longer
   stretch its grid track.

**The second one will come back** the first time a draft or an entry carries a long token in
a context the rules don't reach. The check is one line in the browser pane at 375px:

```js
document.documentElement.scrollWidth > document.documentElement.clientWidth
```

If that is ever true, find it by walking `.page *` for `getBoundingClientRect().right > clientWidth`,
ignoring anything inside `.reel-track` or `.tw` — those are designed horizontal scrollers.

## The lightbox — added 2026-09-27

*"It'd just be dope if we could click on each of the photos and get a more full-screen look,
both when we're on laptop and mobile."* Every photo now opens full-screen on click, with its
caption, arrow keys and on-screen arrows on a laptop, and swipe on a phone. Escape, the ×, a
backdrop click or a downward swipe close it.

**There are now FOUR `<script>` blocks, not three.** The fourth is the lightbox. Any build
assertion that counts them needs to expect four.

Four things in it are deliberate:

- **The overlay is created in JS, not written into the page.** A daily build replaces
  everything from `<header class="record">` down, so markup would have to be remembered every
  morning. This way it cannot be forgotten, and it returns early on a photo-less day.
- **It reuses the thumbnail's own `src`.** The photos are already data: URIs in the DOM, so
  opening one transfers nothing. Never "upgrade" it to a second full-size copy — that doubles
  the page, the same mistake the reel comment warns about.
- **The gallery is built from the inline plates only, deduped.** The reel holds clones of the
  same figures, so counting both would list every photo twice. A click on a reel clone is
  matched back to its inline original by `src`.
- **There is no fade, on purpose.** Both ways of doing one — a class added in
  `requestAnimationFrame`, or a CSS animation from `opacity:0` — leave the overlay fully
  transparent if frames are throttled, and a transparent overlay still swallows every click on
  the page underneath. Measured in the browser pane: opacity was still `0` a quarter-second
  after opening. Do not add the fade back.

## What must not drift

- **`<title>`** — `The Daily Digest`. Day-agnostic: the page republishes daily to the
  same URL, so anything naming a weekday or a story goes stale by morning. The masthead
  carries the date; the title never does.
- **Favicon** 🌿 — Jack finds the tab by its icon.
- **Section ids and nav links move together.** The nav points at them, so drop a section
  on a quiet day and drop its link too, or the link scrolls nowhere. Ids are `p1`, `p2`…
  in page order; a section added mid-page after publishing can take a suffixed id
  (`p1b`) rather than forcing a renumber.
- **The world is FOUR parts with four nav links, never one.** Changed 2026-09-29 when Jack
  asked for segments: *"the more segments, the better."* The parts are **Sports**, **The
  city**, **Tech and the world**, **The fun stuff**, in that order, and each one is also its
  own audio track. Any of the four can be dropped on an empty day — drop its nav link with
  it, or it scrolls nowhere.

  This replaces the two-part split (`The world` / `Tech, sport and the city`) that was in
  force from 8 September, which itself replaced a single catch-all. The original reason
  still holds and is why this keeps getting split rather than merged: Jack, scanning the
  nav on 8 September, *"I'm also not seeing anything about the world. I definitely liked
  when we had that be a section as well."* **A section present on the page but invisible in
  the nav is the same as absent.** The more the research grows, the more nav links it gets.
- **The nav script.** Two things look over-engineered and are not: jumps go through
  `scrollIntoView` rather than hand-rolled scroll math (the artifact viewer frames the
  page, so the scrolling box is sometimes an ancestor and sometimes the document — the
  browser never has to guess); and the spy listens for `scroll` on `document` in the
  **capture** phase, because scroll events don't bubble but do capture.
- **Long jumps skip the animation** — top-to-bottom is ~23,000px, which smooth-scrolls
  for about five seconds and reads as a hang.
- **The mobile picker (≤760px)** replaces the nav strip, and reserves 56px of right
  padding so its caret clears the skin button. Both were measured; don't remove either.

## Images

Verify before embedding, and remember it only matters for Notion:

```bash
curl -s -o /dev/null -w "%{http_code} %{content_type}" -L --max-time 15 "<url>"
```
