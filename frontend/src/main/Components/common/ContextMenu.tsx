// Components/common/ContextMenu.tsx
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";

export interface ContextMenuProps {
  items: {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    danger?: boolean;
  }[];
}

// Portaled to #portal-overlay-root (see PortalLayout) so the dropdown is never
// clipped by an ancestor's overflow-hidden — position is computed from the
// trigger button instead of relying on CSS anchoring inside a relative parent.
export function ContextMenu({ items }: ContextMenuProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; right: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const openMenu = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    setCoords({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };
    const handleDismiss = () => setOpen(false);
    document.addEventListener("mousedown", handleClick);
    window.addEventListener("scroll", handleDismiss, true);
    window.addEventListener("resize", handleDismiss);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("scroll", handleDismiss, true);
      window.removeEventListener("resize", handleDismiss);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          open ? setOpen(false) : openMenu();
        }}
        className="p-1.5 hover:bg-surface-container rounded-sm text-muted-foreground hover:text-foreground transition-colors"
        title="Opciones"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open &&
        coords &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed bg-card rounded-sm z-50 min-w-[180px] py-1 portal-fade-up"
            style={{
              top: coords.top,
              right: coords.right,
              boxShadow: "var(--portal-shadow-lift)",
              border: "1px solid var(--border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {items.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  item.onClick();
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-surface-container-low text-left ${
                  item.danger ? "text-destructive hover:text-destructive" : "text-foreground"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>,
          document.getElementById("portal-overlay-root") ?? document.body,
        )}
    </>
  );
}
