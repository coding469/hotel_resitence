import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function AdminPageHeader({
  title,
  description,
  viewHref,
}: {
  title: string;
  description?: string;
  viewHref: string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-espresso/10 pb-6">
      <div>
        <h1 className="font-serif text-[26px] font-semibold">{title}</h1>
        {description && <p className="mt-1.5 max-w-xl text-sm text-espresso/60">{description}</p>}
      </div>
      <Link
        href={viewHref}
        target="_blank"
        rel="noopener noreferrer"
        className="flex shrink-0 items-center gap-1.5 rounded-lg border border-espresso/15 px-3.5 py-2 text-[13px] font-semibold text-espresso/70 transition-colors hover:border-terracotta/40 hover:text-terracotta"
      >
        Voir la page
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
