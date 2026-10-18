import Link from "next/link";

export default function EmptyState({
  title,
  description,
  action,
  titleClassName = "text-[14px] font-semibold text-foreground",
  descriptionClassName = "text-[13px] text-muted",
}: {
  title: string;
  description?: string;
  action?: { label: string; href: string };
  /** Overrides the title's type styling — e.g. 내 기록's larger 18px/semibold. Defaults to every other EmptyState's existing 14px/semibold. */
  titleClassName?: string;
  /** Overrides the description's type styling. Defaults to every other EmptyState's existing 13px/muted. */
  descriptionClassName?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border-subtle px-6 py-10 text-center">
      <p className={titleClassName}>{title}</p>
      {description ? (
        <p className={descriptionClassName}>{description}</p>
      ) : null}
      {action ? (
        <Link
          href={action.href}
          className="button-48 mt-2 rounded-xl bg-point px-5 type-button text-white active:bg-point-dark"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
