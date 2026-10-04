export default function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border-subtle px-6 py-10 text-center">
      <p className="text-[14px] font-semibold text-foreground">{title}</p>
      {description ? (
        <p className="text-[13px] text-muted">{description}</p>
      ) : null}
    </div>
  );
}
