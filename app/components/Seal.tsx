export default function Seal() {
  return (
    <svg
      viewBox="0 0 120 120"
      className="h-16 w-16 text-gold"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r="52" strokeWidth="1" />
      <circle cx="60" cy="60" r="46" strokeWidth="0.5" />
      {/* infinity knot */}
      <path
        d="M42 60c0-8 6-14 14-14s14 12 14 14 6 14 14 14 14-6 14-14-6-14-14-14-14 12-14 14-6 14-14 14-14-6-14-14z"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}
