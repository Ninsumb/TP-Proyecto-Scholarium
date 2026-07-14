// Components/common/Logo.tsx
//
// Marca Scholarium: tres cuadrados redondeados apilados en escalera.
// "default" es para fondos claros/transparentes; "on-dark" (blanco + dorado)
// es para fondos del azul de marca (headers, footers) — nunca uses "default"
// sobre un fondo azul, el cuadrado trasero (#243d63) se funde con el fondo.
type LogoVariant = "default" | "on-dark";

interface LogoMarkProps {
  variant?: LogoVariant;
  className?: string;
}

export function LogoMark({ variant = "default", className = "w-8 h-8" }: LogoMarkProps) {
  const isOnDark = variant === "on-dark";
  return (
    <svg viewBox="0 0 120 120" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="15" y="45" width="60" height="60" rx="16" fill={isOnDark ? "rgba(255,255,255,0.35)" : "#243d63"} />
      <rect x="35" y="25" width="60" height="60" rx="16" fill={isOnDark ? "#ffffff" : "#3a5f94"} />
      <rect x="55" y="5" width="45" height="45" rx="14" fill="#eab84e" />
    </svg>
  );
}

interface LogoProps {
  variant?: LogoVariant;
  markClassName?: string;
  textClassName?: string;
  className?: string;
}

export function Logo({
  variant = "default",
  markClassName = "w-8 h-8",
  textClassName = "text-xl",
  className = "",
}: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark variant={variant} className={markClassName} />
      <span
        className={`font-bold ${textClassName}`}
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          letterSpacing: "-0.01em",
          color: variant === "on-dark" ? "#ffffff" : "#3a5f94",
        }}
      >
        Scholarium
      </span>
    </span>
  );
}
