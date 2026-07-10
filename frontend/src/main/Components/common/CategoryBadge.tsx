// Components/common/CategoryBadge.tsx

// Categories are free-form and admin-created, so they intentionally all get
// the same treatment (no per-category color) — just a quieter one than a
// solid accent fill: a neutral pill with a small dot instead of a loud block
// of color.
export function CategoryBadge({ label, className = "" }: { label: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium whitespace-nowrap border border-border bg-surface-container-low text-foreground ${className}`}
      style={{ borderRadius: "var(--radius-sm)" }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--primary)" }} />
      {label}
    </span>
  );
}
