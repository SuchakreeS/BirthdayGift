"use client";

import { useEffect, useRef, useState } from "react";
import type { PageFlip } from "page-flip";
import YearPage, { SLOTS_PER_PAGE } from "./YearPage";

type YearData = { year: number; photos: string[] };
type PageData = {
  year: number;
  photos: string[];
  pageInYear: number;
  totalPagesInYear: number;
};

// PLACEHOLDER CONTENT — picsum.photos, just to preview the fly-in/pin motion
// and page-flip mechanics before real photos land in source_file/images/.
// Swap for real photos (grouped by year subfolder) without touching the
// animation/layout logic below.
const YEARS: YearData[] = [
  {
    year: 2022,
    photos: Array.from(
      { length: 5 },
      (_, i) => `https://picsum.photos/seed/2022-${i}/300/380`,
    ),
  },
  {
    year: 2023,
    photos: Array.from(
      { length: 6 },
      (_, i) => `https://picsum.photos/seed/2023-${i}/300/380`,
    ),
  },
];

// Years with more photos than fit in one page's scatter slots spill onto an
// additional page for that year, rather than trimming photos — per plan.md.
function chunkIntoPages(years: YearData[]): PageData[] {
  const pages: PageData[] = [];
  for (const yearData of years) {
    const chunks: string[][] = [];
    for (let i = 0; i < yearData.photos.length; i += SLOTS_PER_PAGE) {
      chunks.push(yearData.photos.slice(i, i + SLOTS_PER_PAGE));
    }
    // A year with zero photos still gets one (empty) page rather than vanishing.
    if (chunks.length === 0) chunks.push([]);
    chunks.forEach((chunk, idx) => {
      pages.push({
        year: yearData.year,
        photos: chunk,
        pageInYear: idx + 1,
        totalPagesInYear: chunks.length,
      });
    });
  }
  return pages;
}

const PAGES: PageData[] = chunkIntoPages(YEARS);

// Beat detection tuning — energy-based onset detection on the bass frequency
// bins, not true beat-tracking. Good enough to make the fly-in feel like
// it's following the song's rhythm without needing hand-authored timestamps.
const MIN_BEAT_INTERVAL_MS = 320;
const ENERGY_THRESHOLD_MULT = 1.35;
const MIN_ENERGY = 40;

// Hybrid auto-flip: once every photo on the active page has flown in, wait
// this long (so she has time to actually look at them) then auto-advance to
// the next page. She can still swipe/tap to go faster/slower any time —
// manual flips just retrigger this same effect against the new page.
const AUTO_FLIP_DELAY_MS = 4500;

export default function PhotoAlbum({ onContinue }: { onContinue: () => void }) {
  const bookRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const pageFlipRef = useRef<PageFlip | null>(null);
  const [animKeys, setAnimKeys] = useState<number[]>(() => PAGES.map(() => 0));
  const [beatCount, setBeatCount] = useState(0);
  // Beat count recorded at the moment each page became active, so we can
  // derive "how many beats since this page was flipped to."
  const [activationBeats, setActivationBeats] = useState<number[]>(() =>
    PAGES.map(() => 0),
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  function activatePage(index: number, beatsAtActivation: number) {
    setAnimKeys((prev) => {
      const next = [...prev];
      next[index] = (next[index] ?? 0) + 1;
      return next;
    });
    setActivationBeats((prev) => {
      const next = [...prev];
      next[index] = beatsAtActivation;
      return next;
    });
  }

  // Page-flip setup.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { PageFlip } = await import("page-flip");
      if (cancelled || !bookRef.current) return;

      const pageFlip = new PageFlip(bookRef.current, {
        width: 300,
        height: 380,
        size: "stretch",
        minWidth: 240,
        maxWidth: 460,
        minHeight: 320,
        maxHeight: 560,
        showCover: false,
        usePortrait: true,
        maxShadowOpacity: 0.4,
        mobileScrollSupport: false,
      });

      const pages = bookRef.current.querySelectorAll<HTMLElement>(".photo-page");
      pageFlip.loadFromHTML(pages);
      pageFlip.on("flip", (e) => {
        const index = e.data as number;
        setCurrentIndex(index);
        activatePage(index, beatCountRef.current);
      });

      pageFlipRef.current = pageFlip;
      activatePage(0, 0); // first page's entrance plays as soon as beats start arriving
    })();

    return () => {
      cancelled = true;
      pageFlipRef.current?.destroy();
      pageFlipRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep a ref mirror of beatCount so the page-flip event handler (registered
  // once) always reads the latest value without re-subscribing.
  const beatCountRef = useRef(0);
  useEffect(() => {
    beatCountRef.current = beatCount;
  }, [beatCount]);

  // Audio playback + real-time beat detection via Web Audio API.
  //
  // `createMediaElementSource` can only ever be called once per <audio>
  // element for its whole lifetime (throws on a second call, even against a
  // fresh AudioContext) — React Strict Mode double-invokes effects in dev,
  // so the analyser/context are built once and cached in refs rather than
  // recreated on every effect run.
  const analyserRef = useRef<AnalyserNode | null>(null);
  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    if (!analyserRef.current) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const source = audioCtx.createMediaElementSource(audioEl);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
      analyserRef.current = analyser;
    }
    const analyser = analyserRef.current;

    audioEl.play().catch(() => {
      // Autoplay blocked by the browser — she'll just get the album without
      // music/beat-synced entrances until she interacts with the page.
    });

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let lastBeatTime = 0;
    let runningAvg = 0;
    let rafId: number;

    function tick() {
      analyser!.getByteFrequencyData(dataArray);
      const bassBins = dataArray.slice(0, 8);
      const energy = bassBins.reduce((a, b) => a + b, 0) / bassBins.length;
      runningAvg = runningAvg * 0.95 + energy * 0.05;

      const now = performance.now();
      if (
        energy > runningAvg * ENERGY_THRESHOLD_MULT &&
        energy > MIN_ENERGY &&
        now - lastBeatTime > MIN_BEAT_INTERVAL_MS
      ) {
        lastBeatTime = now;
        setBeatCount((c) => c + 1);
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      // Not closing the AudioContext here — Strict Mode's cleanup+rerun
      // needs the analyser to still exist for the next effect invocation.
      // The browser tears everything down on real page unload anyway.
    };
  }, []);

  // Hybrid auto-flip. Once the active page's last photo has flown in, wait
  // AUTO_FLIP_DELAY_MS then advance — to the next page, or to the reward
  // reveal if this was the last page. Recomputed whenever the active page
  // or its completion state changes, so a manual swipe (which changes
  // currentIndex) naturally cancels/reschedules against the new page.
  const currentPage = PAGES[currentIndex];
  const currentVisibleCount = currentPage
    ? Math.min(
        1 + Math.max(0, beatCount - activationBeats[currentIndex]),
        currentPage.photos.length,
      )
    : 0;
  const currentPageComplete =
    !!currentPage && currentVisibleCount >= currentPage.photos.length;

  useEffect(() => {
    if (!currentPageComplete) return;
    const timer = setTimeout(() => {
      if (currentIndex < PAGES.length - 1) {
        pageFlipRef.current?.flipNext();
      } else {
        onContinue();
      }
    }, AUTO_FLIP_DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPageComplete, currentIndex]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-10 animate-rise-in">
      <audio ref={audioRef} src="/audio/two-is-better-than-one.mp3" loop />

      <p className="font-body text-xs uppercase tracking-widest text-ink-soft">
        placeholder photos — real ones swap in later
      </p>

      {/* Capped width so the book never grows past StPageFlip's
          minWidth*2 portrait/landscape threshold — otherwise on wide
          desktop viewports it silently switches to a two-page side-by-side
          "spread" instead of turning one page at a time, and with only a
          couple of pages there'd be nothing left to flip to. */}
      <div className="w-full max-w-110">
        <div ref={bookRef}>
          {PAGES.map((pageData, i) => {
            // First photo shows as soon as the page activates even if beat
            // detection hasn't produced a beat yet (e.g. autoplay was
            // blocked) — the page should never sit fully empty.
            const beatsSinceActivated = Math.max(0, beatCount - activationBeats[i]);
            const visibleCount = Math.min(1 + beatsSinceActivated, pageData.photos.length);
            return (
              <div key={`${pageData.year}-${pageData.pageInYear}`} className="photo-page">
                <YearPage
                  year={pageData.year}
                  photos={pageData.photos}
                  animKey={animKeys[i]}
                  visibleCount={visibleCount}
                  pageInYear={pageData.pageInYear}
                  totalPagesInYear={pageData.totalPagesInYear}
                />
              </div>
            );
          })}
        </div>
      </div>

      <p className="font-body text-sm text-ink-soft">
        Swipe or tap the page edge to flip — it also turns on its own
      </p>
    </div>
  );
}
