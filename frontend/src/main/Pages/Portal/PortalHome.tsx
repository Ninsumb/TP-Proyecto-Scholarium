import { useState, useEffect } from "react";
import { useParams, useOutletContext } from "react-router";
import { Edit2, Loader2, GraduationCap } from "lucide-react";
import type { Block } from "../../Components/PortalHome-blocks/BlockComponents";
import { renderBlock } from "../../Components/PortalHome-blocks/BlockComponents";
import { BlockEditor } from "../../Components/PortalHome-blocks/BlockEditor";
import { portalService } from "../../services/Portal/InternalPortalService";

interface PortalContext {
  isMember: boolean;
  isAdmin: boolean;
  isGuest: boolean;
  portal: {
    carrera: string;
    universidad: string;
    descripcion: string | null;
  };
}

export function HomeWithBlocks() {
  const { portalId } = useParams();
  const context = useOutletContext<PortalContext>();
  const isAdmin = context?.isAdmin || false;
  const portal = context?.portal;

  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlocks = async () => {
      if (!portalId) {
        setError("Portal ID no encontrado");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await portalService.getHomeBlocks(Number(portalId));
        setBlocks(response.blocks);
      } catch (err: any) {
        console.error("Error al cargar bloques:", err);
        setError(err.response?.data?.message || "Error al cargar la página de inicio");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlocks();
  }, [portalId]);

  const handleSave = async (newBlocks: Block[]) => {
    if (!portalId) {
      setError("Portal ID no encontrado");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      const response = await portalService.updateHomeBlocks(Number(portalId), newBlocks);
      setBlocks(response.blocks);
      setIsEditing(false);
    } catch (err: any) {
      console.error("Error al guardar bloques:", err);
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.error ||
                          "Error al guardar los cambios";
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-foreground">Cargando página de inicio...</p>
      </div>
    );
  }

  if (error && !isEditing) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div
          className="bg-destructive/10 border border-destructive/20 text-destructive p-4 mb-6"
          style={{ borderRadius: 'var(--radius)', boxShadow: 'var(--portal-shadow-card)' }}
        >
          <p className="font-medium">Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors portal-hoverable"
            style={{ borderRadius: 'var(--radius)' }}
          >
            Reintentar
          </button>
        )}
      </div>
    );
  }

  if (isEditing) {
    return (
      <>
        {error && (
          <div
            className="fixed top-4 right-4 z-[60] bg-destructive/10 border border-destructive/20 text-destructive p-4 shadow-lg max-w-md"
            style={{ borderRadius: 'var(--radius)' }}
          >
            <p className="font-medium">Error al guardar</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-xs underline"
            >
              Cerrar
            </button>
          </div>
        )}
        <BlockEditor
          blocks={blocks}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      </>
    );
  }

 return (
    <div className="max-w-6xl mx-auto px-6 py-8">

      {/* Header estático del portal — hero band */}
      <div
        className="portal-tab relative mb-8 pl-8 pr-8 py-10 sm:pl-12 sm:pr-12 portal-fade-up"
        style={{
          borderRadius: 'var(--radius-xl)',
          background: 'var(--primary)',
        }}
      >
        <GraduationCap className="w-5 h-5 mb-5" style={{ color: 'rgba(255,255,255,.5)' }} />
        <p className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,.6)' }}>
          {portal?.universidad}
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4 tracking-tight" style={{ color: '#ffffff', fontFamily: 'Work Sans, sans-serif' }}>
          {portal?.carrera}
        </h1>
        {portal?.descripcion && (
          <p className="text-lg leading-relaxed max-w-3xl" style={{ color: 'rgba(255,255,255,.72)' }}>
            {portal.descripcion}
          </p>
        )}
      </div>

      {/* Contenedor de bloques */}
      <div className="portal-fade-up-delay">
        {/* Botón editar — solo admins */}
        {isAdmin && (
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setIsEditing(true)}
              className="p-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors portal-hoverable"
              style={{ borderRadius: 'var(--radius-sm)', boxShadow: 'var(--portal-shadow-card)' }}
              title="Editar página"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Renderizar bloques */}
        {blocks.map((block) => renderBlock(block))}

        {/* Mensaje si no hay bloques */}
        {blocks.length === 0 && (
          <div
            className="text-center py-16 px-8 text-foreground"
            style={{
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--border-mid, var(--border))',
              background: 'var(--muted)',
            }}
          >
            <p className="mb-4 text-muted-foreground">Esta página aún no tiene contenido configurado</p>
            {isAdmin && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors portal-hoverable"
                style={{ borderRadius: 'var(--radius-sm)', boxShadow: 'var(--portal-shadow-card)' }}
              >
                Configurar Página de Inicio
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}