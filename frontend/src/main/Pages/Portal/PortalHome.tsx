import { useState } from "react";
import { useParams, useOutletContext } from "react-router";
import { Edit2 } from "lucide-react";
import type { Block } from "../../Components/PortalHome-blocks/BlockComponents";
import { renderBlock } from "../../Components/PortalHome-blocks/BlockComponents";
import { BlockEditor } from "../../Components/PortalHome-blocks/BlockEditor";

interface PortalContext {
  isMember: boolean;
  isAdmin: boolean;
}

// Bloques por defecto para cada portal
const defaultBlocks: Record<string, Block[]> = {
  "ingenieria-informatica": [
    {
      type: 'header',
      id: '1',
      data: {
        title: 'Ingeniería Informática',
        description: 'La carrera de Ingeniería Informática forma profesionales capaces de diseñar, desarrollar e implementar soluciones tecnológicas innovadoras. Nuestro programa combina teoría y práctica para preparar ingenieros con sólidas bases en programación, sistemas, redes y desarrollo de software.',
      },
    },
    {
      type: 'stats',
      id: '2',
      data: {
        stats: [
          { icon: 'users', value: '1,247', label: 'Estudiantes Activos' },
          { icon: 'bookOpen', value: '42', label: 'Materias Disponibles' },
          { icon: 'trendingUp', value: '3,891', label: 'Materiales Compartidos' },
        ],
      },
    },
    {
      type: 'textSection',
      id: '3',
      data: {
        title: 'Nuestra Visión',
        content: 'Ser un referente nacional en la formación de ingenieros informáticos altamente capacitados para enfrentar los desafíos tecnológicos del siglo XXI.',
      },
    },
    {
      type: 'infoList',
      id: '4',
      data: {
        title: 'Información de la Carrera',
        items: [
          { icon: 'calendar', label: 'Duración', value: '5 años' },
          { icon: 'bookOpen', label: 'Modalidad', value: 'Presencial' },
          { icon: 'mapPin', label: 'Ubicación', value: 'Ciudad Universitaria, Campus Norte' },
          { icon: 'mail', label: 'Email', value: 'info.informatica@universidad.edu' },
          { icon: 'globe', label: 'Sitio Web', value: 'www.informatica.universidad.edu' },
        ],
      },
    },
  ],
  "administracion": [
    {
      type: 'header',
      id: '1',
      data: {
        title: 'Administración de Empresas',
        description: 'Formamos líderes empresariales capaces de gestionar organizaciones con visión estratégica, ética profesional y responsabilidad social.',
      },
    },
    {
      type: 'stats',
      id: '2',
      data: {
        stats: [
          { icon: 'users', value: '980', label: 'Estudiantes Activos' },
          { icon: 'bookOpen', value: '38', label: 'Materias Disponibles' },
          { icon: 'trendingUp', value: '2,456', label: 'Materiales Compartidos' },
        ],
      },
    },
  ],
};

export function HomeWithBlocks() {
  const { portalId } = useParams();
  const context = useOutletContext<PortalContext>();
  const isAdmin = context?.isAdmin || false;

  const [blocks, setBlocks] = useState<Block[]>(
    defaultBlocks[portalId || 'ingenieria-informatica'] || []
  );
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (newBlocks: Block[]) => {
    setBlocks(newBlocks);
    setIsEditing(false);
    // Aquí se guardarían los bloques en la base de datos
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isEditing) {
    return <BlockEditor blocks={blocks} onSave={handleSave} onCancel={handleCancel} />;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Botón de edición para admins */}
      {isAdmin && (
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors shadow-sm"
            style={{ borderRadius: 'var(--radius)' }}
          >
            <Edit2 className="w-4 h-4" />
            Editar Página
          </button>
        </div>
      )}

      {/* Renderizar bloques */}
      {blocks.map((block) => renderBlock(block))}

      {/* Mensaje si no hay bloques */}
      {blocks.length === 0 && (
        <div className="text-center py-16 text-on-surface-variant">
          <p className="mb-4">Esta página aún no tiene contenido configurado</p>
          {isAdmin && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors"
              style={{ borderRadius: 'var(--radius)' }}
            >
              Configurar Página de Inicio
            </button>
          )}
        </div>
      )}
    </div>
  );
}
