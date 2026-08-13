// Fixed, hand-tuned scatter positions/rotations so the collage always looks
// intentional rather than randomly overlapping badly. Cycles if a year has
// more photos than slots (overflow spills to a second page, handled by the
// caller — this just needs enough visual variety per page). Positions are
// relative to the photo area only (below the year header, see the layout
// below), not the whole page.
const SLOTS = [
  { top: "4%", left: "4%", rotate: -6 },
  { top: "0%", left: "40%", rotate: 4 },
  { top: "6%", left: "68%", rotate: -3 },
  { top: "44%", left: "14%", rotate: 5 },
  { top: "40%", left: "54%", rotate: -5 },
  { top: "0%", left: "68%", rotate: 3 },
  { top: "44%", left: "4%", rotate: -4 },
  { top: "40%", left: "68%", rotate: 6 },
];

// Exported so PhotoAlbum can chunk a year's photos into page-sized groups
// using the same number as there are scatter slots here.
export const SLOTS_PER_PAGE = SLOTS.length;

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

      <div className="relative flex-1">
        {photos.slice(0, visibleCount).map((src, i) => {
          const slot = SLOTS[i % SLOTS.length];
          return (
            <div
              key={`${animKey}-${i}`}
              className="animate-fly-in-pin absolute h-42 w-36 rounded-sm bg-white p-1.5 shadow-md"
              style={{
                top: slot.top,
                left: slot.left,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ["--rotate" as any]: `${slot.rotate}deg`,
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
          );
        })}
      </div>
    </div>
  );
}
