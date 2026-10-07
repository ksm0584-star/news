import Link from "next/link";
import { trackClick } from "@/lib/mixpanel";

export default function FabButton({
  onRequireLogin,
}: {
  /** Return true to block navigation (e.g. show a login prompt instead). */
  onRequireLogin?: () => boolean;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40">
      <div className="relative mx-auto max-w-[430px] px-5">
        <Link
          href="/record/new"
          onClick={(e) => {
            trackClick("write_fab");
            if (onRequireLogin?.()) {
              e.preventDefault();
            }
          }}
          className="pointer-events-auto absolute right-5 bottom-0 flex items-center gap-1.5 rounded-full bg-point px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-point/30 active:bg-point-dark"
        >
          <span className="text-base leading-none">+</span>
          기록하기
        </Link>
      </div>
    </div>
  );
}
