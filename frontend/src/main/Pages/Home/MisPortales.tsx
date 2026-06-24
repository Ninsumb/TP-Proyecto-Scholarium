// pages/Home/MisPortales.tsx

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Search, BookOpen, Plus, Users, ArrowRight, Sparkles } from "lucide-react";
import { usuarioService } from "../../services/UsuarioService";
import type { UsuarioPortalResponse } from "../../types/DashboardPortals/UsuarioPortalResponse";
import { authService } from "../../services/AuthService";
import { PortalAvatar } from "../../Components/common/PortalAvatar";

export function Home() {
  const [portales, setPortales] = useState<UsuarioPortalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userName = authService.getUserName() || "Usuario";
  const firstName = userName.split(" ")[0];

  useEffect(() => {
    const fetchPortales = async () => {
      try {
        setLoading(true);
        const data = await usuarioService.getMisPortales();
        setPortales(data);
      } catch (err) {
        console.error("Error al cargar portales:", err);
        setError("No se pudieron cargar los portales");
      } finally {
        setLoading(false);
      }
    };
    fetchPortales();
  }, []);

  return (
    <div className="scholarium-home">
      {/* ─── HERO SECTION ─── */}
      <section className="hero-section">
        {/* Paper grid texture overlay */}
        <div className="paper-grid" aria-hidden="true" />

        <div className="hero-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hero-content">
            {/* Eyebrow pill */}
            <div className="eyebrow-pill">
              <Sparkles className="eyebrow-icon" />
              <span>Tu espacio académico</span>
            </div>

            {/* Main heading */}
            <h1 className="hero-heading">
              Bienvenido,{" "}
              <span className="hero-name">{firstName}</span>
            </h1>

            <p className="hero-sub">
              Todo tu universo académico en un solo lugar. Foros, materiales
              y la comunidad de tu carrera, cuando los necesitás.
            </p>

            {/* CTA */}
            <Link to="/explorar-portales" className="hero-cta">
              <Search className="cta-icon" />
              Explorar portales
              <ArrowRight className="cta-arrow" />
            </Link>
          </div>

          {/* Floating stat cards */}
          <div className="hero-stats" aria-hidden="true">
            <div className="stat-card stat-card--1">
              <span className="stat-num">+2k</span>
              <span className="stat-label">Estudiantes activos</span>
            </div>
            <div className="stat-card stat-card--2">
              <span className="stat-num">150+</span>
              <span className="stat-label">Portales universitarios</span>
            </div>
            <div className="stat-card stat-card--3">
              <span className="stat-num">∞</span>
              <span className="stat-label">Recursos compartidos</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MIS PORTALES ─── */}
      <section className="portals-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Section header */}
        <div className="section-header">
          <div>
            <h2 className="section-title">Mis Portales</h2>
            <p className="section-sub">
              {portales.length > 0
                ? `Sos parte de ${portales.length} comunidad${portales.length > 1 ? "es" : ""} académica${portales.length > 1 ? "s" : ""}.`
                : "Todavía no te sumaste a ningún portal."}
            </p>
          </div>

          {portales.length > 0 && (
            <Link to="/explorar-portales" className="section-action">
              <Plus className="w-4 h-4" />
              Unirme a otro
            </Link>
          )}
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="state-container">
            <div className="skeleton-grid">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton-card" style={{ animationDelay: `${i * 120}ms` }} />
              ))}
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div className="state-container state-container--center">
            <div className="state-icon state-icon--error">!</div>
            <p className="state-message">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="state-btn"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && portales.length === 0 && (
          <div className="empty-state">
            <div className="empty-illustration" aria-hidden="true">
              <BookOpen className="empty-icon" />
              <div className="empty-dots">
                <span /><span /><span />
              </div>
            </div>
            <h3 className="empty-title">Tu biblioteca académica está esperando</h3>
            <p className="empty-sub">
              Encontrá el portal de tu carrera para acceder a foros, apuntes
              y la comunidad de tus compañeros.
            </p>
            <div className="empty-actions">
              <Link to="/explorar-portales" className="btn-primary">
                <Search className="w-4 h-4" />
                Explorar portales
              </Link>
              <Link to="/crear-portal" className="btn-ghost">
                <Plus className="w-4 h-4" />
                Crear nuevo portal
              </Link>
            </div>
          </div>
        )}

        {/* ── Grid de portales ── */}
        {!loading && !error && portales.length > 0 && (
          <div className="portals-grid">
            {portales.map((portal, index) => (
              <Link
                key={portal.id}
                to={`/portal/${portal.id}`}
                className="portal-card"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* Accent stripe — se colorea con el color del portal */}
                <div
                  className="portal-stripe"
                  style={{ background: portal.colorPortal ?? "var(--portal-stripe-fallback)" }}
                />

                <div className="portal-card-inner">
                  {/* Role badge */}
                  <div className="portal-badge-row">
                    {portal.rol === "ADMIN" ? (
                      <span className="badge badge--admin">Administrador</span>
                    ) : (
                      <span className="badge badge--member">Miembro</span>
                    )}
                  </div>

                  {/* Identity row */}
                  <div className="portal-identity">
                    <PortalAvatar
                      logoUrl={portal.logoUrl}
                      iconoPortal={portal.iconoPortal}
                      colorPortal={portal.colorPortal}
                      carrera={portal.carrera}
                      size="md"
                      className="portal-avatar"
                    />
                    <div className="portal-meta">
                      <h3 className="portal-name">{portal.carrera}</h3>
                      <p className="portal-university">{portal.universidad}</p>
                    </div>
                  </div>

                  {/* Footer row */}
                  <div className="portal-footer">
                    <div className="portal-members">
                      <Users className="w-3.5 h-3.5" />
                      <span>
                        {portal.cantidadMiembros}{" "}
                        {portal.cantidadMiembros === 1 ? "miembro" : "miembros"}
                      </span>
                    </div>
                    <span className="portal-enter">
                      Entrar
                      <ArrowRight className="w-3.5 h-3.5 portal-enter-arrow" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ─── INLINE STYLES ─── */}
      <style>{`
        /* ── Design tokens ── */
        .scholarium-home {
          --navy:        #2c4456;
          --navy-dim:    #1f3240;
          --amber:       #d4930f;
          --amber-light: #fdf3dc;
          --paper:       #f7f4ef;
          --ink:         #1e2a30;
          --ink-soft:    #566166;
          --surface:     #ffffff;
          --portal-stripe-fallback: #3a5f94;
          --radius-card: 0.75rem;
          --radius-pill: 999px;
          --shadow-card: 0 2px 8px rgba(44, 68, 86, 0.08), 0 0 0 1px rgba(44, 68, 86, 0.06);
          --shadow-hover: 0 12px 32px rgba(44, 68, 86, 0.14), 0 0 0 1px rgba(44, 68, 86, 0.10);
          background: var(--paper);
          min-height: 100vh;
        }

        /* ── Hero ── */
        .hero-section {
          position: relative;
          background: linear-gradient(135deg, var(--navy) 0%, var(--navy-dim) 100%);
          overflow: hidden;
          padding: 5rem 0 4rem;
        }

        /* Subtle square-paper grid overlay — marca de identidad de Scholarium */
        .paper-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
        }

        .hero-inner {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 3rem;
        }

        .hero-content {
          flex: 1;
          max-width: 580px;
          animation: fadeSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) both;
        }

        /* Eyebrow pill */
        .eyebrow-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.3rem 0.9rem;
          border-radius: var(--radius-pill);
          background: rgba(212, 147, 15, 0.18);
          border: 1px solid rgba(212, 147, 15, 0.35);
          color: #f5c842;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 1.25rem;
        }

        .eyebrow-icon {
          width: 13px;
          height: 13px;
        }

        /* Heading */
        .hero-heading {
          font-family: 'Work Sans', sans-serif;
          font-size: clamp(2rem, 5vw, 3.25rem);
          font-weight: 700;
          line-height: 1.15;
          color: #ffffff;
          margin: 0 0 1rem;
          letter-spacing: -0.02em;
        }

        .hero-name {
          color: #f5c842;
          position: relative;
        }

        .hero-name::after {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 0;
          right: 0;
          height: 2px;
          background: rgba(245, 200, 66, 0.45);
          border-radius: 2px;
        }

        .hero-sub {
          font-size: 1.05rem;
          color: rgba(255,255,255,0.72);
          line-height: 1.7;
          margin: 0 0 2rem;
          max-width: 460px;
        }

        /* CTA button */
        .hero-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.85rem 1.6rem;
          background: var(--amber);
          color: #ffffff;
          font-size: 0.92rem;
          font-weight: 600;
          border-radius: 0.375rem;
          text-decoration: none;
          transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
          box-shadow: 0 4px 16px rgba(212, 147, 15, 0.35);
        }

        .hero-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(212, 147, 15, 0.45);
          background: #c4870d;
        }

        .cta-icon { width: 17px; height: 17px; }
        .cta-arrow {
          width: 15px; height: 15px;
          transition: transform 0.18s ease;
        }
        .hero-cta:hover .cta-arrow {
          transform: translateX(3px);
        }

        /* Stat cards — decorativas, accesibles como aria-hidden */
        .hero-stats {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          flex-shrink: 0;
        }

        .stat-card {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-radius: 0.6rem;
          padding: 1.1rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          min-width: 170px;
        }

        .stat-card--1 { animation: fadeSlideUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both; }
        .stat-card--2 { animation: fadeSlideUp 0.6s 0.2s cubic-bezier(0.16,1,0.3,1) both; }
        .stat-card--3 { animation: fadeSlideUp 0.6s 0.3s cubic-bezier(0.16,1,0.3,1) both; }

        .stat-num {
          font-family: 'Work Sans', sans-serif;
          font-size: 1.7rem;
          font-weight: 700;
          color: #f5c842;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.78rem;
          color: rgba(255,255,255,0.6);
          font-weight: 500;
          letter-spacing: 0.01em;
        }

        @media (max-width: 768px) {
          .hero-stats { display: none; }
          .hero-section { padding: 3.5rem 0 3rem; }
        }

        /* ── Portals section ── */
        .section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .section-title {
          font-family: 'Work Sans', sans-serif;
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--ink);
          margin: 0 0 0.3rem;
          letter-spacing: -0.02em;
        }

        .section-sub {
          font-size: 0.9rem;
          color: var(--ink-soft);
          margin: 0;
        }

        .section-action {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.55rem 1.1rem;
          border-radius: 0.375rem;
          border: 1.5px solid rgba(44, 68, 86, 0.2);
          color: var(--navy);
          font-size: 0.85rem;
          font-weight: 600;
          text-decoration: none;
          background: transparent;
          transition: all 0.16s ease;
        }

        .section-action:hover {
          background: var(--navy);
          color: white;
          border-color: var(--navy);
        }

        /* ── Portal grid ── */
        .portals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.25rem;
        }

        /* ── Portal card ── */
        .portal-card {
          position: relative;
          display: flex;
          background: var(--surface);
          border-radius: var(--radius-card);
          box-shadow: var(--shadow-card);
          text-decoration: none;
          overflow: hidden;
          transition: transform 0.22s cubic-bezier(0.16,1,0.3,1), box-shadow 0.22s ease;
          animation: cardIn 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }

        .portal-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-hover);
        }

        /* La raya de color a la izquierda — como el sticker de la materia */
        .portal-stripe {
          width: 5px;
          flex-shrink: 0;
          background: var(--navy);
          transition: width 0.18s ease;
        }

        .portal-card:hover .portal-stripe {
          width: 7px;
        }

        .portal-card-inner {
          flex: 1;
          padding: 1.25rem 1.25rem 1.1rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          min-width: 0;
        }

        .portal-badge-row {
          display: flex;
          justify-content: flex-end;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-pill);
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .badge--admin {
          background: rgba(212, 24, 61, 0.08);
          color: #b01232;
          border: 1px solid rgba(212, 24, 61, 0.18);
        }

        .badge--member {
          background: rgba(44, 68, 86, 0.08);
          color: var(--navy);
          border: 1px solid rgba(44, 68, 86, 0.18);
        }

        .portal-identity {
          display: flex;
          align-items: center;
          gap: 0.9rem;
        }

        .portal-avatar {
          flex-shrink: 0;
          transition: transform 0.22s cubic-bezier(0.16,1,0.3,1);
        }

        .portal-card:hover .portal-avatar {
          transform: scale(1.06);
        }

        .portal-meta {
          flex: 1;
          min-width: 0;
        }

        .portal-name {
          font-family: 'Work Sans', sans-serif;
          font-size: 0.97rem;
          font-weight: 700;
          color: var(--ink);
          margin: 0 0 0.2rem;
          line-height: 1.3;
          transition: color 0.16s ease;
          /* Truncate long names */
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .portal-card:hover .portal-name {
          color: var(--navy);
        }

        .portal-university {
          font-size: 0.8rem;
          color: var(--ink-soft);
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .portal-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.65rem;
          border-top: 1px solid rgba(44, 68, 86, 0.07);
          margin-top: auto;
        }

        .portal-members {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.78rem;
          color: var(--ink-soft);
          font-weight: 500;
        }

        .portal-enter {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--navy);
          letter-spacing: 0.01em;
          text-transform: uppercase;
          opacity: 0;
          transition: opacity 0.18s ease;
        }

        .portal-card:hover .portal-enter {
          opacity: 1;
        }

        .portal-enter-arrow {
          transition: transform 0.18s ease;
        }

        .portal-card:hover .portal-enter-arrow {
          transform: translateX(3px);
        }

        /* ── Skeleton loading ── */
        .skeleton-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.25rem;
        }

        .skeleton-card {
          height: 148px;
          border-radius: var(--radius-card);
          background: linear-gradient(90deg, #e8edf1 25%, #f0f4f7 50%, #e8edf1 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }

        /* ── Empty state ── */
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: var(--surface);
          border-radius: var(--radius-card);
          box-shadow: var(--shadow-card);
        }

        .empty-illustration {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 1.5rem;
        }

        .empty-icon {
          width: 48px;
          height: 48px;
          color: var(--navy);
          opacity: 0.35;
        }

        .empty-dots {
          display: flex;
          gap: 5px;
        }

        .empty-dots span {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--amber);
          opacity: 0.5;
        }

        .empty-dots span:nth-child(2) { opacity: 0.3; }
        .empty-dots span:nth-child(3) { opacity: 0.15; }

        .empty-title {
          font-family: 'Work Sans', sans-serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--ink);
          margin: 0 0 0.5rem;
        }

        .empty-sub {
          font-size: 0.9rem;
          color: var(--ink-soft);
          max-width: 380px;
          margin: 0 auto 2rem;
          line-height: 1.65;
        }

        .empty-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          justify-content: center;
        }

        /* ── State container ── */
        .state-container {
          padding: 3rem 2rem;
        }

        .state-container--center {
          text-align: center;
        }

        .state-icon--error {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(212, 24, 61, 0.1);
          color: #b01232;
          font-size: 1.3rem;
          font-weight: 800;
          margin-bottom: 1rem;
        }

        .state-message {
          color: var(--ink-soft);
          margin-bottom: 1.25rem;
        }

        /* ── Shared buttons ── */
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.4rem;
          background: var(--navy);
          color: white;
          font-size: 0.87rem;
          font-weight: 600;
          border-radius: 0.375rem;
          text-decoration: none;
          transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
        }

        .btn-primary:hover {
          background: var(--navy-dim);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(44, 68, 86, 0.22);
        }

        .btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.4rem;
          background: transparent;
          color: var(--navy);
          font-size: 0.87rem;
          font-weight: 600;
          border-radius: 0.375rem;
          border: 1.5px solid rgba(44, 68, 86, 0.22);
          text-decoration: none;
          transition: all 0.18s ease;
        }

        .btn-ghost:hover {
          background: rgba(44, 68, 86, 0.06);
          border-color: rgba(44, 68, 86, 0.35);
        }

        .state-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.7rem 1.4rem;
          background: var(--navy);
          color: white;
          font-size: 0.87rem;
          font-weight: 600;
          border-radius: 0.375rem;
          border: none;
          cursor: pointer;
          transition: background 0.18s ease;
        }

        .state-btn:hover { background: var(--navy-dim); }

        /* ── Animations ── */
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }

        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ── Dark mode ── */
        .dark .scholarium-home {
          --paper:   #161b20;
          --ink:     #e4eaf0;
          --ink-soft:#8a9ba8;
          --surface: #1e2830;
          --shadow-card: 0 2px 8px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.05);
          --shadow-hover: 0 12px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08);
        }

        .dark .skeleton-card {
          background: linear-gradient(90deg, #243040 25%, #2c3c4e 50%, #243040 75%);
          background-size: 200% 100%;
        }

        .dark .portal-footer {
          border-top-color: rgba(255,255,255,0.07);
        }

        .dark .section-action {
          border-color: rgba(255,255,255,0.15);
          color: #a9c0d8;
        }

        .dark .section-action:hover {
          background: #5d8cc7;
          color: white;
          border-color: #5d8cc7;
        }

        .dark .badge--member {
          background: rgba(93,140,199,0.15);
          color: #7eb4e8;
          border-color: rgba(93,140,199,0.25);
        }

        /* ── Reduced motion ── */
        @media (prefers-reduced-motion: reduce) {
          .portal-card,
          .hero-content,
          .stat-card--1, .stat-card--2, .stat-card--3,
          .skeleton-card {
            animation: none;
          }
          .portal-card:hover,
          .hero-cta:hover,
          .btn-primary:hover {
            transform: none;
          }
        }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .portals-section { padding-top: 2.5rem; padding-bottom: 3rem; }
          .portals-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}