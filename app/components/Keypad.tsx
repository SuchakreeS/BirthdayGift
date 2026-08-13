const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "back"];

export default function Keypad({
  onDigit,
  onBackspace,
}: {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {KEYS.map((key, i) => {
        if (key === "") {
          return <div key={i} />;
        }
        if (key === "back") {
          return (
            <button
              key={i}
              type="button"
              aria-label="Backspace"
              onClick={onBackspace}
              className="flex h-14 w-14 items-center justify-center rounded-full font-body text-lg text-ink-soft transition-colors active:bg-blush"
            >
              ⌫
            </button>
          );
        }
        return (
          <button
            key={i}
            type="button"
            onClick={() => onDigit(key)}
            className="flex h-14 w-14 items-center justify-center rounded-full border border-blush bg-white font-display text-2xl text-ink transition-colors active:bg-blush active:border-gold"
          >
            {key}
          </button>
        );
      })}
    </div>
  );
}
