export default function SectorBadge({
  sector,
  muted = false,
}: {
  sector: string;
  /** Lighter text for an already-read article — see LatestNewsList. */
  muted?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-background px-2.5 py-1 text-xs font-medium transition-colors duration-300 ${
        muted ? "text-foreground/40" : "text-foreground/70"
      }`}
    >
      {sector}
    </span>
  );
}
