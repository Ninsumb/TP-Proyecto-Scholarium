// Components/common/Modal.tsx
import { useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
}

// Portaled to #portal-overlay-root (see PortalLayout) so the modal is always
// centered on and blurs the real viewport, regardless of any clipping or
// transformed ancestor in the page — while staying inside .portal-scope/.dark
// so design tokens and theme still resolve correctly.
export function Modal({ onClose, children, maxWidth = "28rem", className = "" }: ModalProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(15, 23, 31, 0.5)",
        backdropFilter: "blur(10px) saturate(1.2)",
        WebkitBackdropFilter: "blur(10px) saturate(1.2)",
      }}
      onClick={onClose}
    >
      <div
        className={`bg-card w-full portal-fade-up ${className}`}
        style={{
          maxWidth,
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--portal-shadow-modal)",
          border: "1px solid var(--border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.getElementById("portal-overlay-root") ?? document.body,
  );
}
