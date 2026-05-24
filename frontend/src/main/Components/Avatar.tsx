// ── Avatar de usuario ─────────────────────────────────────────────────────────

interface AvatarProps {
  nombre: string;
  fotoPerfil: string | null | undefined;
  size?: "sm" | "md";
}

export function Avatar({ nombre, fotoPerfil, size = "md" }: AvatarProps) {
  const dimension = size === "sm" ? "w-9 h-9" : "w-11 h-11";
  const textSize  = size === "sm" ? "text-xs"  : "text-sm";

  if (fotoPerfil) {
    return (
      <img
        src={fotoPerfil}
        alt={nombre}
        className={`${dimension} object-contain flex-shrink-0`}
        style={{ borderRadius: "var(--radius)" }}
      />
    );
  }

  return (
    <div
      className={`${dimension} bg-primary/15 flex items-center justify-center text-primary flex-shrink-0`}
      style={{ borderRadius: "var(--radius)" }}
    >
      <span className={`${textSize} font-medium`}>
        {nombre.slice(0, 2).toUpperCase()}
      </span>
    </div>
  );
}