// components/common/PortalAvatar.tsx
// Componente centralizado para renderizar la identidad visual de un Portal.
// Lógica: si logoUrl tiene valor → imagen. Si no → ícono sobre colorPortal.
// Si ninguno → fallback con gradiente y la inicial de la carrera.
// Usado tanto en las cards de búsqueda como en el dashboard y el sidebar del portal.

import {
  GraduationCap, BookOpen, Code, Briefcase, FlaskConical,
  Calculator, Languages, Network, BarChart2, Rocket, Cpu, Terminal,
  type LucideIcon
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  GraduationCap,
  BookOpen,
  Code,
  Briefcase,
  FlaskConical,
  Calculator,
  Languages,
  Network,
  BarChart2,
  Rocket,
  Cpu,
  Terminal,
};

interface PortalAvatarProps {
  logoUrl?: string | null;
  iconoPortal?: string | null;
  colorPortal?: string | null;
  carrera: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP = {
  sm: { container: "w-8 h-8", icon: "w-4 h-4", text: "text-sm" },
  md: { container: "w-12 h-12", icon: "w-6 h-6", text: "text-base" },
  lg: { container: "w-16 h-16", icon: "w-8 h-8", text: "text-xl" },
};

export function PortalAvatar({
  logoUrl,
  iconoPortal,
  colorPortal,
  carrera,
  size = "md",
  className = "",
}: PortalAvatarProps) {
  const sizes = SIZE_MAP[size];
  const baseClasses = `${sizes.container} rounded-sm flex items-center justify-center flex-shrink-0 overflow-hidden ${className}`;

  if (logoUrl) {
    return (
      <div className={baseClasses}>
        <img
          src={logoUrl}
          alt={`Logo de ${carrera}`}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const Icon = iconoPortal ? (ICON_MAP[iconoPortal] ?? GraduationCap) : null;
  const bgColor = colorPortal ?? "#3B82F6";

  if (Icon) {
    return (
      <div
        className={baseClasses}
        style={{ backgroundColor: bgColor }}
      >
        <Icon className={`${sizes.icon} text-white`} />
      </div>
    );
  }

  // Fallback: inicial de la carrera sobre gradiente neutro
  return (
    <div
      className={`${baseClasses} bg-gradient-to-br from-primary to-primary-dim`}
    >
      <span className={`${sizes.text} font-bold text-white select-none`}>
        {carrera.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}