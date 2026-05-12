import { useState, useEffect, useCallback, useRef } from "react";
import type { Portal } from "../../types/Portal";
import { PortalCard } from "../../Components/PortalCard";
import "./BuscarPortales.css";  

 
interface SearchFilters {
  query: string;
  universidad: string;
  carrera: string;
}

 //mock
async function fetchPortales(filters: SearchFilters): Promise<Portal[]> {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.universidad) params.set("universidad", filters.universidad);
  if (filters.carrera) params.set("carrera", filters.carrera);
 
  const response = await fetch(`/api/portales/buscar?${params.toString()}`);
  if (!response.ok) throw new Error("Error al buscar portales");
  return response.json();
}
 

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);
 
const ChevronDownIcon = ({ open }: { open: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);
 
 
const BookIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4"
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);
 
const UniversityIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4"
  >
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);
 
const FilterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4"
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
 
const SkeletonCard = () => (
  <div className="portal-card animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <div className="h-5 bg-slate-700 rounded w-3/4 mb-2" />
        <div className="h-4 bg-slate-700/60 rounded w-1/2" />
      </div>
      <div className="h-5 w-16 bg-slate-700 rounded-full" />
    </div>
    <div className="flex gap-4 mb-5">
      <div className="h-4 bg-slate-700/60 rounded w-24" />
      <div className="h-4 bg-slate-700/60 rounded w-24" />
    </div>
    <div className="h-9 bg-slate-700 rounded-lg w-full" />
  </div>
);
 
 
const EmptyState = ({ hasFilters }: { hasFilters: boolean }) => (
  <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
    <div className="empty-icon-ring mb-5">
      <SearchIcon />
    </div>
    <p className="text-lg font-semibold text-slate-300 mb-1">
      No se encontraron resultados
    </p>
    <p className="text-sm text-slate-500 max-w-xs">
      {hasFilters
        ? "Intentá con otros términos o ajustá los filtros de búsqueda."
        : "Ingresá el nombre de una universidad o carrera para comenzar."}
    </p>
  </div>
);
 
 
export default function BuscarPortales() {
  const [query, setQuery] = useState("");
  const [universidadFilter, setUniversidadFilter] = useState("");
  const [carreraFilter, setCarreraFilter] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [portales, setPortales] = useState<Portal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
 
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
 
  const doSearch = useCallback(
    async (filters: SearchFilters) => {
      const isEmpty =
        !filters.query.trim() &&
        !filters.universidad.trim() &&
        !filters.carrera.trim();
 
      if (isEmpty) {
        setPortales([]);
        setHasSearched(false);
        setLoading(false);
        return;
      }
 
      setLoading(true);
      setError(null);
      setHasSearched(true);
 
      try {
        const results = await fetchPortales(filters);
        setPortales(results);
      } catch {
        setError("Ocurrió un error al buscar. Intentá nuevamente.");
        setPortales([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );
 
 
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
 
    debounceRef.current = setTimeout(() => {
      doSearch({
        query,
        universidad: universidadFilter,
        carrera: carreraFilter,
      });
    }, 300);
 
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, universidadFilter, carreraFilter, doSearch]);
 
  const handleSearchButton = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    doSearch({ query, universidad: universidadFilter, carrera: carreraFilter });
  };
 
  const clearAll = () => {
    setQuery("");
    setUniversidadFilter("");
    setCarreraFilter("");
    setPortales([]);
    setHasSearched(false);
  };
 
  const hasFilters =
    !!query.trim() || !!universidadFilter.trim() || !!carreraFilter.trim();
 
  return (
    <>
      <div className="buscar-root">
        {/* ── Page Header ── */}
        <header className="page-header">
          <div className="page-header-inner">
            <div className="page-eyebrow">
              <UniversityIcon />
              Portales académicos
            </div>
            <h1 className="page-title">
              Encontrá tu <em>portal</em>
            </h1>
            <p className="page-subtitle">
              Buscá por universidad, carrera o ambas para encontrar tu comunidad.
            </p>
          </div>
        </header>
 
        <div className="search-area">
     
          <div className="search-bar">
            <div className="search-input-wrap">
              <span className="search-icon-left">
                <SearchIcon />
              </span>
              <input
                type="text"
                className="search-input"
                placeholder="Buscar por universidad o carrera…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchButton()}
                aria-label="Campo de búsqueda principal"
              />
            </div>
            <button
              className="search-btn"
              onClick={handleSearchButton}
              disabled={loading}
              aria-label="Buscar portales"
            >
              {loading ? <span className="spinner" /> : <SearchIcon />}
              <span className="hidden sm:inline">Buscar</span>
            </button>
          </div>
 
        
          <div className="flex items-center gap-3 flex-wrap">
            <button
              className="advanced-toggle"
              onClick={() => setShowAdvanced((v) => !v)}
              aria-expanded={showAdvanced}
            >
              <FilterIcon />
              {showAdvanced ? "Ocultar filtros" : "Búsqueda avanzada"}
              <ChevronDownIcon open={showAdvanced} />
            </button>
 
            {hasFilters && (
              <button className="clear-btn" onClick={clearAll}>
                ✕ Limpiar
              </button>
            )}
          </div>
 
        
          <div className={`advanced-panel ${showAdvanced ? "open" : "closed"}`}>
            <div className="filter-grid">
              
              <div className="filter-input-wrap">
                <span className="filter-icon">
                  <UniversityIcon />
                </span>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="Filtrar por universidad…"
                  value={universidadFilter}
                  onChange={(e) => setUniversidadFilter(e.target.value)}
                  aria-label="Filtro por universidad"
                />
              </div>
 
              
              <div className="filter-input-wrap">
                <span className="filter-icon">
                  <BookIcon />
                </span>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="Filtrar por carrera…"
                  value={carreraFilter}
                  onChange={(e) => setCarreraFilter(e.target.value)}
                  aria-label="Filtro por carrera"
                />
              </div>
            </div>
          </div>
        </div>
 
        <hr className="divider" />
 
        <div className="results-area">
          {error && (
            <div className="error-banner" role="alert">
              ⚠ {error}
            </div>
          )}
 
          {hasSearched && !loading && !error && (
            <div className="results-header">
              <p className="results-count">
                {portales.length === 0 ? (
                  "Sin resultados"
                ) : (
                  <>
                    <strong>{portales.length}</strong>{" "}
                    {portales.length === 1 ? "portal encontrado" : "portales encontrados"}
                  </>
                )}
              </p>
            </div>
          )}
 
          {loading && (
            <div className="cards-grid" aria-busy="true" aria-label="Cargando resultados">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}
 
          {!loading && portales.length > 0 && (
            <div className="cards-grid" role="list" aria-label="Portales encontrados">
              {portales.map((portal) => (
                <div key={portal.id} role="listitem">
                  <PortalCard portal={portal} />
                </div>
              ))}
            </div>
          )}
 
          {!loading && hasSearched && portales.length === 0 && !error && (
            <EmptyState hasFilters={hasFilters} />
          )}
 
          {!loading && !hasSearched && (
            <EmptyState hasFilters={false} />
          )}
        </div>
      </div>
    </>
  );
}