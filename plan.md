# Birthday surprise site — plan.md

## What this is
A private, single-use website built as a birthday surprise for the user's girlfriend. Flow: PIN lock → hint reveal → quiz → photo album → music → reward reveal → wish input → letter pages.

## Stack
- Next.js (React), single project
- No database/custom backend needed — all content is hardcoded/static, no user accounts
- **Exception:** the wish-input step (see below) submits via Formspree, a third-party form-to-email service — no server code of our own, but it is an external network call, unlike every other step.
- **animejs** (v4) — used for the reward reveal's box-open/ticket-spin/glitter sequence, and will be reused for the wish-input step's post-submit "Your wish shall be granted" starfield animation.
- **page-flip** (npm package for StPageFlip) — the photo album's page-turn mechanics.
- Deployed as a static/simple hosted site (hosting choice TBD — ask user before deciding)

## Asset locations
- User drops source images and audio into `source_file/images/` and `source_file/Audio/` respectively, at the project root.
- These are raw source files, not yet wired into the app — when building the photo album (step 3) and music (step 4), pull from these folders and move/reference the files into the Next.js project structure (e.g. `public/`) as needed.
- **Photo album organization**: within `source_file/images/`, photos are grouped into year subfolders (e.g. `2022/`, `2023/`), one subfolder per year. Within each year folder, photos are ordered by filename — user will name files to control order (e.g. `01.jpg`, `02.jpg`, ...).
- **Reward ticket image**: user is designing the "บัตรตามใจ" ticket as an image (instead of the current text-rendered version in `RewardReveal.tsx`) and will drop it in `source_file/ticket/`. Swap in once provided — replaces the text/border-dashed card, not the surrounding box-open/spin/glitter animation.

## Flow (in order)
1. **PIN screen** — she enters a 4-digit PIN. Wrong entry shakes the input and reveals one hint at a time (max 3 hints). Correct entry advances to the quiz.
2. **Quiz** — multiple-choice "about us" questions. No typing required, just tapping an option. Choice order is randomized/shuffled each time a question is opened or the page is refreshed (per-question, every load — not a fixed order). After she taps an option, a dramatic reveal plays: wrong answers shake the screen, correct answers get a celebratory sparkle/glow effect, alongside the text "เป็นคำตอบที่ถูกต้องนะค้าบบบบ" (correct) or "เป็นคำตอบที่ยังม่ายช่ายยยย" (wrong). Wrong answers block progress — she must retry the same question until she picks correctly before advancing.
3. **Photo album** — StPageFlip library, realistic page-turn animation, capped to a max width (440px) so it stays in single-page portrait mode on every screen size — StPageFlip switches to a two-page side-by-side spread past a width threshold, which on desktop was silently breaking page-turning entirely (only ever showed 2 pages side by side with nothing left to flip to). Hybrid mode: auto-flips on a timer but she can also swipe/tap to go faster or slower. **One page per year** (not one page per photo): all of a year's photos appear together on that year's page in a scattered/collage layout (slight overlaps and rotations, scrapbook feel), at 1.5x the originally-drafted photo size. The year number sits in its own fixed header row at the top of the page — photos scatter only in the space below it, never overlapping the year label. Photos are grouped by year (source folders `2022/`, `2023/`, etc. in `source_file/images/`), ordered by filename within each year. If a year has too many photos to fit well on one page (more than 8, the number of scatter slots), it spills onto an additional page for that year (page 1 and 2 of that year, shown as a small "1 / 2" indicator under the year label) rather than trimming photos.
   - **Auto-flip timer (built)**: once every photo on the active page has finished flying in, the page waits 4.5s then auto-advances — to the next page, or, if it was the last page overall, straight into the reward reveal (no manual "Continue" button anymore). She can still swipe/tap any page edge at any time to go faster/slower than the timer; a manual flip just retargets the same timer logic at the newly active page.
   - **Entrance animation**: each time a year's page is flipped to (every time, not just first view), its photos fly in and pin themselves into their scattered collage position, slower/more deliberate than a snappy UI animation. Each photo gets a small decorative pushpin/washi-tape-corner graphic once it lands, reinforcing the scrapbook feel. Staggering is **driven by the song's actual detected beats** (see step 4) rather than a fixed timer — each successive photo flies in on the next detected beat since that page became active, so the pacing follows the music live rather than a canned delay. The first photo in a page always appears immediately on activation (doesn't wait for a beat), so the page is never empty if beat detection stalls (e.g. autoplay blocked).
4. **Music** — plays in the background starting when the album opens (real playback, not just a later add-on — pulled forward into step 3's build since the photo entrance animation needs to analyze the actual audio in real time to sync to it). Loops. Uses the Web Audio API (`AnalyserNode` on the bass frequency bins) for lightweight real-time beat/onset detection — not true music-information-retrieval beat-tracking, just energy-threshold onset detection tuned to feel right, and it works with any song without needing hand-authored timestamps. **Known limitation**: browser autoplay policies may block playback starting automatically on some devices/browsers (especially iOS Safari) despite prior user interaction earlier in the flow — needs a real-device check; if blocked, the album still works, just without music/beat-synced entrances until she interacts with the page again.
5. **Reward reveal** — a closed present box sits on screen; she taps/clicks it to open it. On tap: a warm golden shining-light burst flashes out first as the lid opens, then one ticket pops out and spins 2–3 times around its vertical axis (card-flip style, not a flat clock-hand rotation — stays upright/readable at rest), with glitter/stars accompanying the reveal, at a deliberate/unhurried pace (not snappy). Once opened, gold stars gently fall in the background continuously/indefinitely for as long as she stays on the screen (ambient, not a one-off burst). Animated with anime.js (already a dependency from step 6) for the box-open/ticket-spin/glitter sequence; the falling stars run on a separate looping CSS animation since they're ambient/continuous rather than a one-shot timeline. The ticket reads "บัตรตามใจ" as the title, with the subtitle "สามารถใช้บัตรใบนี้เพื่อให้เราตาใจได้ บัตรใบนี้มีผล 24 ชั่วโมง วันหมดอายุ:ไม่มี" — text styling is open to interpretation/whatever fits the theme.
6. **Wish input** — after the reward reveal. She types a birthday wish for herself into a text box; on submit it's emailed to the user (poomfail2013@gmail.com) via Formspree. Not saved/displayed anywhere else — one-way send. After submit, an anime.js animation plays: a twinkling starfield behind the text "Your wish shall be granted", text rises in on top, then it settles into a calm end screen after a few seconds. **No longer the final step** — a "Continue →" button fades in on the settled end screen, advancing into the letter pages.
7. **Letter pages** — the true final step. A page-flip book (same StPageFlip mechanics as the photo album), 2-3 pages with 4-5 sentences each, written by the user as a birthday message to her. Sentences appear one at a time, line-by-line fade-in (reuses the existing `soft-reveal` CSS animation, staggered per sentence), replaying each time a page is flipped to. Navigation is manual swipe/tap on the page edge, same as the album — no auto-flip timer here (no audio to sync it to, and it's meant to be read at her own pace). Reached via a "Continue →" button on the reward reveal (appears once the box-open animation finishes) and another on the wish-input end screen. Content is placeholder text for now, swapped for the user's real message directly in `LetterPages.tsx` whenever ready.

## Confirmed content
- **PIN**: `0803`
- **Hints** (revealed in order, one per wrong attempt, Thai):
  1. เลขที่เธอก็รู้
  2. มีเลขซ้ำ 1 ตัว
  3. ครบรอบ
- **Song**: "Two Is Better Than One" — Boys Like Girls ft. Taylor Swift (user to upload own mp3 file)
- **Formspree endpoint** (wish-input step): `https://formspree.io/f/mjybrpwa` (recipient `poomfail2013@gmail.com` verified)
- **Wish-prompt copy** (wish-input step, Thai): "ถ้าขอพรอะไรก็ได้ในวันเกิดปีนี้ อ้วนอยากจะขออะไร"
- **Reward ticket copy** (reward reveal step, Thai): title "บัตรตามใจ", subtitle "สามารถใช้บัตรใบนี้เพื่อให้เราตาใจได้ บัตรใบนี้มีผล 24 ชั่วโมง วันหมดอายุ:ไม่มี"
- **Theme**: elegant & minimal, romantic
- **Design tokens** (from the PIN page draft):
  - Colors: ivory bg `#faf6ef`, wine `#6e2a3a` / `#4f1e2a`, gold `#b08d4f`, blush `#e9d3ce`, ink `#2a211d`, ink-soft `#7a6d63`
  - Fonts: Cormorant Garamond (display/serif), Jost (body/UI sans)
  - Signature visual: line-art seal with an infinity knot motif
  - Motion: gentle rise-in on load, shake on wrong PIN, soft reveal animation on hints
- **PIN entry input method**: on mobile (detected via `pointer: coarse`), the 4 digit boxes become read-only and a custom on-screen numeric keypad (styled to match the theme, no third-party library) is shown below them for entry — avoids the native OS keyboard popping up. On desktop, the boxes stay directly typeable via physical keyboard as before, no keypad shown.
- **Hint layout**: all 3 hint slots are reserved in the layout from the start (invisible until revealed) so that revealing a hint fades it in without shifting the PIN boxes/keypad upward.

## Pending content (needed from user before those sections can be finalized)
- [ ] Photos for the album (8–15, ideally in story order)
- [ ] Ticket image for the reward reveal (→ `source_file/ticket/`) — optional/nice-to-have, current text version already works
- [ ] Real letter-page sentences (2-3 pages, 4-5 lines each) to replace the placeholder text in `LetterPages.tsx`

## Open technical/product decisions (ask user, do not assume)
- Hosting/deployment target for the finished site

## Build order
1. PIN page — **done** (ported to Next.js/React)
2. Quiz page — **done** (3 questions from `Questions.md`, shuffled choices, shake/sparkle reveal, block-until-correct)
3. Photo album — **prototype built** with placeholder picsum.photos images (page-flip mechanics + year collage + beat-synced fly-in-pin animation, auto-flip timer, and overflow-to-extra-page-per-year all working); still needs real photos from `source_file/images/2022/`, `2023/`, etc. swapped in before this is final
4. Music integration — **basic playback done** (pulled forward into step 3's build — real mp3 plays/loops, drives beat detection); not yet real-device-tested for autoplay reliability
5. Reward reveal page — **built** (box tap → open → ticket pops/spins/settles → glitter, animejs timeline; now includes a "Continue →" button into wish input)
6. Wish input page (Formspree submission) — **built** (form + submit + starfield/text animejs animation + settled end screen with "Continue →" into letter pages); real-device Formspree delivery not yet confirmed
7. Letter pages — **prototype built** with placeholder text (page-flip mechanics reused from the album + line-by-line sentence fade-in); needs the user's real message swapped into `LetterPages.tsx`
8. End-to-end flow wiring + polish pass — flow is now fully wired PIN → quiz → album → reward → wish → letter pages; polish pass still pending
