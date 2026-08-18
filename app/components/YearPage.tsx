// A real CSS grid (3 columns) instead of hand-placed absolute slots — cells
// can't overlap by construction, and each photo's size is relative to its
// grid cell rather than a fixed pixel box, so photos scale up with however
// much room the page actually has instead of a hardcoded size. A 6-photo
// year (the current max) reads as a clean 3-per-row x 2-row layout. Slight
// rotation on each photo keeps the scrapbook feel even though the
// underlying positions are now a tidy grid.
const ROTATIONS = [-6, 4, -3, 5, -5, 3, -4, 6];

// Exported so PhotoAlbum can chunk a year's photos into page-sized groups.
// Kept at 8 (matches the prior slot-based cap) — a year with more than 8
// photos still spills onto an additional page rather than overcrowding one.
export const SLOTS_PER_PAGE = 8;

export default function YearPage({
  year,
  photos,
  animKey,
  visibleCount,
  pageInYear,
  totalPagesInYear,
}: {
  year: number;
  photos: string[];
  animKey: number;
  /** How many photos (in order) should be flown-in/visible so far, driven by detected song beats. */
  visibleCount: number;
  /** 1-indexed page number within this year, for years that spill onto more than one page. */
  pageInYear: number;
  totalPagesInYear: number;
}) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-ivory">
      <div className="flex h-12 shrink-0 flex-col items-center justify-center">
        <p className="font-display text-xl tracking-widest text-wine-deep/60">
          {year}
        </p>
        {totalPagesInYear > 1 && (
          <p className="font-body text-[10px] tracking-widest text-ink-soft/60">
            {pageInYear} / {totalPagesInYear}
          </p>
        )}
      </div>

      <div className="grid flex-1 auto-rows-min grid-cols-3 content-start gap-4 p-4">
        {photos.slice(0, visibleCount).map((src, i) => (
          <div
            key={`${animKey}-${i}`}
            className="animate-fly-in-pin relative aspect-3/4 w-full rounded-sm bg-white p-1.5 shadow-md"
            style={{
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ["--rotate" as any]: `${ROTATIONS[i % ROTATIONS.length]}deg`,
            }}
          >
            <img
              src={src}
              alt=""
              className="h-full w-full object-cover"
              draggable={false}
            />
            <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-gold shadow" />
          </div>
        ))}
      </div>
    </div>
  );
}
