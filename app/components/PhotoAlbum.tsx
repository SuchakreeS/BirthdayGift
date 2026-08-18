"use client";

import { useEffect, useRef, useState } from "react";
import YearPage, { SLOTS_PER_PAGE } from "./YearPage";
import { useWarpTransition } from "./useWarpTransition";
import { useMusicBeat } from "./MusicProvider";

type YearData = { year: number; photos: string[] };
type PageData = {
  year: number;
  photos: string[];
  pageInYear: number;
  totalPagesInYear: number;
};

// Real photos, grouped by year — copied from source_file/images/<year>/ into
// public/images/<year>/, ordered by filename within each year per plan.md.
const YEARS: YearData[] = [
  { year: 2020, photos: ["/images/2020/812413.jpg"] },
  {
    year: 2021,
    photos: [
      "/images/2021/812416_0.jpg",
      "/images/2021/812417_0.jpg",
      "/images/2021/812418_0.jpg",
    ],
  },
  {
    year: 2022,
    photos: [
      "/images/2022/812419_0.jpg",
      "/images/2022/812420_0.jpg",
      "/images/2022/812421_0.jpg",
      "/images/2022/812422_0.jpg",
    ],
  },
  {
    year: 2023,
    photos: [
      "/images/2023/812423_0.jpg",
      "/images/2023/812424_0.jpg",
      "/images/2023/812426_0.jpg",
      "/images/2023/812427_0.jpg",
      "/images/2023/812428_0.jpg",
    ],
  },
  {
    year: 2024,
    photos: [
      "/images/2024/812429_0.jpg",
      "/images/2024/812430_0.jpg",
      "/images/2024/812431_0.jpg",
      "/images/2024/812432_0.jpg",
      "/images/2024/812433_0.jpg",
      "/images/2024/812434_0.jpg",
    ],
  },
  {
    year: 2025,
    photos: [
      "/images/2025/812438_0.jpg",
      "/images/2025/812439_0.jpg",
      "/images/2025/812440_0.jpg",
      "/images/2025/812441_0.jpg",
      "/images/2025/812442_0.jpg",
      "/images/2025/812443_0.jpg",
    ],
  },
  {
    year: 2026,
    photos: [
      "/images/2026/812448_0.jpg",
      "/images/2026/812449_0.jpg",
      "/images/2026/812450_0.jpg",
      "/images/2026/812451_0.jpg",
      "/images/2026/812452_0.jpg",
      "/images/2026/812453_0.jpg",
    ],
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

// Hybrid auto-advance: once every photo on the active page has flown in,
// wait this long (so she has time to actually look at them) then warp to
// the next page. She can still tap Next/Back any time — a manual nav click
// just retargets this same effect against the newly active page.
const AUTO_FLIP_DELAY_MS = 4500;

export default function PhotoAlbum({ onContinue }: { onContinue: () => void }) {
  // Audio playback + beat detection live in MusicProvider (mounted once,
  // higher up in page.tsx) so the song keeps playing across the rest of the
  // site instead of stopping when this component unmounts.
  const beatCount = useMusicBeat();
  const { starsLayer, flashLayer, contentRef, warp, warping } = useWarpTransition();
  const [animKeys, setAnimKeys] = useState<number[]>(() => PAGES.map(() => 0));
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

  // First page's entrance plays as soon as beats start arriving.
  useEffect(() => {
    activatePage(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep a ref mirror of beatCount so navigation (which can fire from a
  // timer/callback) always reads the latest value.
  const beatCountRef = useRef(0);
  useEffect(() => {
    beatCountRef.current = beatCount;
  }, [beatCount]);

  function goTo(nextIndex: number) {
    if (nextIndex < 0 || nextIndex >= PAGES.length || warping) return;
    warp(() => {
      setCurrentIndex(nextIndex);
      activatePage(nextIndex, beatCountRef.current);
    });
  }

  // Hybrid auto-advance between pages. Once the active page's last photo has
  // flown in, wait AUTO_FLIP_DELAY_MS then warp to the next page. Recomputed
  // whenever the active page or its completion state changes, so a manual
  // Next/Back tap (which changes currentIndex) naturally cancels/reschedules
  // against the new page. Does NOT apply to the last page — advancing from
  // the album into the reward reveal is a manual tap (see the button below),
  // not an automatic timer.
  const currentPage = PAGES[currentIndex];
  const isLastPage = currentIndex >= PAGES.length - 1;
  const currentVisibleCount = currentPage
    ? Math.min(
        1 + Math.max(0, beatCount - activationBeats[currentIndex]),
        currentPage.photos.length,
      )
    : 0;
  const currentPageComplete =
    !!currentPage && currentVisibleCount >= currentPage.photos.length;

  useEffect(() => {
    if (!currentPageComplete || isLastPage) return;
    const timer = setTimeout(() => {
      goTo(currentIndex + 1);
    }, AUTO_FLIP_DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPageComplete, currentIndex, isLastPage]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden px-4 py-10 animate-rise-in">
      {starsLayer}
      {flashLayer}

      {/* Widened from the old book's 440px cap so the 3-column grid gives
          each photo real room to be bigger, not just re-cropped smaller
          copies of the old size. Aspect ratio kept the same as before
          (300/380) so it just scales up proportionally. */}
      <div
        ref={contentRef}
        className="relative z-10 mx-auto w-full max-w-140 overflow-hidden rounded-md bg-ivory shadow-lg aspect-300/380"
      >
        {currentPage && (
          <YearPage
            year={currentPage.year}
            photos={currentPage.photos}
            animKey={animKeys[currentIndex]}
            visibleCount={currentVisibleCount}
            pageInYear={currentPage.pageInYear}
            totalPagesInYear={currentPage.totalPagesInYear}
          />
        )}
      </div>

      <div className="relative z-10 flex items-center gap-8">
        <button
          type="button"
          onClick={() => goTo(currentIndex - 1)}
          disabled={currentIndex === 0 || warping}
          className="font-body text-sm text-gold underline underline-offset-4 disabled:opacity-30"
        >
          ← Back
        </button>
        {!isLastPage && (
          <button
            type="button"
            onClick={() => goTo(currentIndex + 1)}
            disabled={warping}
            className="font-body text-sm text-gold underline underline-offset-4 disabled:opacity-30"
          >
            Next →
          </button>
        )}
      </div>

      {/* Manual advance out of the album, shown as soon as she's on the last
          page — deliberately NOT gated on all its photos having flown in
          (that depends on beat detection, which can stall for good reason:
          blocked autoplay, a quiet stretch of the song, etc. — the button
          must never be stuck unreachable because of that). No timer here,
          she taps when ready. */}
      {isLastPage && (
        <button
          type="button"
          onClick={onContinue}
          className="relative z-10 animate-soft-reveal font-body text-sm text-gold underline underline-offset-4"
        >
          Continue to your surprise →
        </button>
      )}
    </div>
  );
}
