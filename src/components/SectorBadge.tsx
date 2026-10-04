export default function SectorBadge({ sector }: { sector: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-background px-2.5 py-1 text-xs font-medium text-foreground/70">
      {sector}
    </span>
  );
}
