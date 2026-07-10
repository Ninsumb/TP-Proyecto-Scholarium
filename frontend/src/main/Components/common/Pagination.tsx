// Components/common/Pagination.tsx
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number; // 1-indexed
  totalPages: number;
  onPageChange: (page: number) => void;
  /** "default": centered, numbered pages — for a primary list.
   *  "compact": left-aligned "X–Y de Z" strip — for subordinate/nested content
   *  (e.g. replies within a post) so it doesn't visually compete with a
   *  primary pagination elsewhere on the same screen. */
  variant?: "default" | "compact";
  /** Required for the "X–Y de Z" label in the compact variant. */
  totalItems?: number;
  pageSize?: number;
}

// Compact page list: always show first, last, current +/-1, and use "…" for gaps.
function getPageList(page: number, totalPages: number): (number | "…")[] {
  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  const result: (number | "…")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push("…");
    result.push(p);
    prev = p;
  }
  return result;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  variant = "default",
  totalItems,
  pageSize,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  if (variant === "compact") {
    const rangeLabel =
      totalItems !== undefined && pageSize !== undefined
        ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, totalItems)} de ${totalItems}`
        : `Página ${page} de ${totalPages}`;

    return (
      <div className="flex items-center gap-1 pt-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1 rounded-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs text-muted-foreground tabular-nums">{rangeLabel}</span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1 rounded-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Página siguiente"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-1.5 pt-2">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="p-2 rounded-sm text-muted-foreground hover:bg-surface-container-low hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        aria-label="Página anterior"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {getPageList(page, totalPages).map((p, idx) =>
        p === "…" ? (
          <span key={`gap-${idx}`} className="px-1.5 text-sm text-muted-foreground">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={`min-w-[2rem] h-8 px-2 text-sm font-medium rounded-sm transition-colors tabular-nums ${
              p === page
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-surface-container-low hover:text-foreground"
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="p-2 rounded-sm text-muted-foreground hover:bg-surface-container-low hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        aria-label="Página siguiente"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
