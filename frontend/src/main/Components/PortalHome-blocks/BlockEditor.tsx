import { useState } from "react";
import { X, Plus, Trash2, Eye, Save, ChevronUp, ChevronDown, Heading, BarChart3, FileText, List, FileCode, ImageIcon, Megaphone, Loader2, Layers, Settings2, LayoutTemplate, PencilRuler } from "lucide-react";
import type {
  Block,
  HeaderBlock,
  StatsBlock,
  TextSectionBlock,
  InfoListBlock,
  RichTextBlock,
  ImageTextBlock,
  CTABlock,
  ImageOnlyBlock
} from "./BlockComponents.tsx";
import { renderBlock } from "./BlockComponents.tsx";

// Bloques disponibles para arrastrar con iconos
const availableBlocks = [
  { type: 'header', label: 'Header', description: 'Título y descripción', icon: Heading },
  { type: 'stats', label: 'Estadísticas', description: '3 tarjetas con números', icon: BarChart3 },
  { type: 'textSection', label: 'Sección de Texto', description: 'Título + párrafo', icon: FileText },
  { type: 'infoList', label: 'Lista de Info', description: 'Íconos y valores', icon: List },
  { type: 'richText', label: 'Texto Enriquecido', description: 'Contenido Markdown', icon: FileCode },
  { type: 'imageText', label: 'Imagen + Texto', description: 'Imagen lateral con texto', icon: ImageIcon },
  { type: 'cta', label: 'Call to Action', description: 'Botón destacado', icon: Megaphone },
  { type: 'imageOnly', label: 'Imagen', description: 'Imagen con título y descripción opcionales', icon: ImageIcon },
];

// Clases reutilizables para inputs de los formularios de edición
const inputClass =
  "w-full px-3 py-2 border border-border/70 bg-input-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-colors";
const inputClassSm =
  "w-full px-2 py-1.5 border border-border/70 bg-input-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-colors";
const labelClass = "block mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground";

// Formularios de edición para cada tipo de bloque
function HeaderBlockForm({ data, onChange }: { data: HeaderBlock['data']; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Título</label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          className={inputClass}
          style={{ borderRadius: 'var(--radius-sm)' }}
        />
      </div>
      <div>
        <label className={labelClass}>Descripción</label>
        <textarea
          rows={4}
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          className={`${inputClass} resize-none`}
          style={{ borderRadius: 'var(--radius-sm)' }}
        />
      </div>
    </div>
  );
}

function StatsBlockForm({ data, onChange }: { data: StatsBlock['data']; onChange: (data: any) => void }) {
  const addStat = () => {
    onChange({
      ...data,
      stats: [...data.stats, { icon: 'users', value: '0', label: 'Nueva estadística' }],
    });
  };

  const removeStat = (index: number) => {
    onChange({
      ...data,
      stats: data.stats.filter((_, i) => i !== index),
    });
  };

  const updateStat = (index: number, field: string, value: string) => {
    const newStats = [...data.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    onChange({ ...data, stats: newStats });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-foreground">Estadísticas</label>
        <button
          onClick={addStat}
          className="p-1.5 bg-primary/10 hover:bg-primary/15 text-primary transition-colors"
          style={{ borderRadius: 'var(--radius-sm)' }}
          title="Agregar estadística"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {data.stats.map((stat, index) => (
        <div
          key={index}
          className="p-3 space-y-2.5 bg-card"
          style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--portal-shadow-card)' }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estadística {index + 1}</span>
            <button
              onClick={() => removeStat(index)}
              className="p-1 hover:bg-destructive/10 text-destructive transition-colors"
              style={{ borderRadius: 'var(--radius-sm)' }}
              title="Eliminar estadística"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <select
            value={stat.icon}
            onChange={(e) => updateStat(index, 'icon', e.target.value)}
            className={inputClassSm}
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            <option value="users">Usuarios</option>
            <option value="bookOpen">Libro</option>
            <option value="trendingUp">Tendencia</option>
            <option value="award">Premio</option>
          </select>
          <input
            type="text"
            placeholder="Valor"
            value={stat.value}
            onChange={(e) => updateStat(index, 'value', e.target.value)}
            className={inputClassSm}
            style={{ borderRadius: 'var(--radius-sm)' }}
          />
          <input
            type="text"
            placeholder="Label"
            value={stat.label}
            onChange={(e) => updateStat(index, 'label', e.target.value)}
            className={inputClassSm}
            style={{ borderRadius: 'var(--radius-sm)' }}
          />
        </div>
      ))}
    </div>
  );
}

function TextSectionBlockForm({ data, onChange }: { data: TextSectionBlock['data']; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Título</label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          className={inputClass}
          style={{ borderRadius: 'var(--radius-sm)' }}
        />
      </div>
      <div>
        <label className={labelClass}>Contenido</label>
        <textarea
          rows={6}
          value={data.content}
          onChange={(e) => onChange({ ...data, content: e.target.value })}
          className={`${inputClass} resize-none`}
          style={{ borderRadius: 'var(--radius-sm)' }}
        />
      </div>
    </div>
  );
}

function InfoListBlockForm({ data, onChange }: { data: InfoListBlock['data']; onChange: (data: any) => void }) {
  const addItem = () => {
    onChange({
      ...data,
      items: [...data.items, { icon: 'mail', label: 'Campo', value: 'Valor' }],
    });
  };

  const removeItem = (index: number) => {
    onChange({
      ...data,
      items: data.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...data.items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange({ ...data, items: newItems });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Título</label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          className={inputClass}
          style={{ borderRadius: 'var(--radius-sm)' }}
        />
      </div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-foreground">Items</label>
        <button
          onClick={addItem}
          className="p-1.5 bg-primary/10 hover:bg-primary/15 text-primary transition-colors"
          style={{ borderRadius: 'var(--radius-sm)' }}
          title="Agregar item"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {data.items.map((item, index) => (
        <div
          key={index}
          className="p-3 space-y-2.5 bg-card"
          style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--portal-shadow-card)' }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Item {index + 1}</span>
            <button
              onClick={() => removeItem(index)}
              className="p-1 hover:bg-destructive/10 text-destructive transition-colors"
              style={{ borderRadius: 'var(--radius-sm)' }}
              title="Eliminar item"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <select
            value={item.icon}
            onChange={(e) => updateItem(index, 'icon', e.target.value)}
            className={inputClassSm}
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            <option value="mail">Email</option>
            <option value="phone">Teléfono</option>
            <option value="mapPin">Ubicación</option>
            <option value="globe">Web</option>
            <option value="calendar">Calendario</option>
            <option value="clock">Reloj</option>
          </select>
          <input
            type="text"
            placeholder="Label"
            value={item.label}
            onChange={(e) => updateItem(index, 'label', e.target.value)}
            className={inputClassSm}
            style={{ borderRadius: 'var(--radius-sm)' }}
          />
          <input
            type="text"
            placeholder="Valor"
            value={item.value}
            onChange={(e) => updateItem(index, 'value', e.target.value)}
            className={inputClassSm}
            style={{ borderRadius: 'var(--radius-sm)' }}
          />
        </div>
      ))}
    </div>
  );
}

function RichTextBlockForm({ data, onChange }: { data: RichTextBlock['data']; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Título</label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          className={inputClass}
          style={{ borderRadius: 'var(--radius-sm)' }}
        />
      </div>
      <div>
        <label className={labelClass}>Contenido (Markdown)</label>
        <textarea
          rows={8}
          value={data.markdown}
          onChange={(e) => onChange({ ...data, markdown: e.target.value })}
          className={`${inputClass} resize-none font-mono`}
          style={{ borderRadius: 'var(--radius-sm)' }}
        />
      </div>
    </div>
  );
}

function ImageTextBlockForm({ data, onChange }: { data: ImageTextBlock['data']; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Posición de Imagen</label>
        <select
          value={data.imagePosition}
          onChange={(e) => onChange({ ...data, imagePosition: e.target.value })}
          className={inputClass}
          style={{ borderRadius: 'var(--radius-sm)' }}
        >
          <option value="left">Izquierda</option>
          <option value="right">Derecha</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>URL de Imagen</label>
        <input
          type="text"
          value={data.imageUrl}
          onChange={(e) => onChange({ ...data, imageUrl: e.target.value })}
          className={inputClass}
          style={{ borderRadius: 'var(--radius-sm)' }}
          placeholder="https://..."
        />
      </div>
      <div>
        <label className={labelClass}>Título</label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          className={inputClass}
          style={{ borderRadius: 'var(--radius-sm)' }}
        />
      </div>
      <div>
        <label className={labelClass}>Contenido</label>
        <textarea
          rows={4}
          value={data.content}
          onChange={(e) => onChange({ ...data, content: e.target.value })}
          className={`${inputClass} resize-none`}
          style={{ borderRadius: 'var(--radius-sm)' }}
        />
      </div>
    </div>
  );
}

function CTABlockForm({ data, onChange }: { data: CTABlock['data']; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Texto Principal</label>
        <input
          type="text"
          value={data.text}
          onChange={(e) => onChange({ ...data, text: e.target.value })}
          className={inputClass}
          style={{ borderRadius: 'var(--radius-sm)' }}
        />
      </div>
      <div>
        <label className={labelClass}>Texto del Botón</label>
        <input
          type="text"
          value={data.buttonText}
          onChange={(e) => onChange({ ...data, buttonText: e.target.value })}
          className={inputClass}
          style={{ borderRadius: 'var(--radius-sm)' }}
        />
      </div>
      <div>
        <label className={labelClass}>Enlace del Botón</label>
        <input
          type="text"
          value={data.buttonLink}
          onChange={(e) => onChange({ ...data, buttonLink: e.target.value })}
          className={inputClass}
          style={{ borderRadius: 'var(--radius-sm)' }}
          placeholder="/portal/..."
        />
      </div>
    </div>
  );
}

function ImageOnlyBlockForm({ data, onChange }: { data: ImageOnlyBlock['data']; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Título (opcional)</label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          className={inputClass}
          style={{ borderRadius: 'var(--radius-sm)' }}
          placeholder="Título de la imagen..."
        />
      </div>
      <div>
        <label className={labelClass}>URL de Imagen</label>
        <input
          type="text"
          value={data.imageUrl}
          onChange={(e) => onChange({ ...data, imageUrl: e.target.value })}
          className={inputClass}
          style={{ borderRadius: 'var(--radius-sm)' }}
          placeholder="https://..."
        />
      </div>
      <div>
        <label className={labelClass}>Descripción (opcional)</label>
        <input
          type="text"
          value={data.caption || ''}
          onChange={(e) => onChange({ ...data, caption: e.target.value })}
          className={inputClass}
          style={{ borderRadius: 'var(--radius-sm)' }}
          placeholder="Descripción breve de la imagen..."
        />
      </div>
    </div>
  );
}

interface BlockEditorProps {
  blocks: Block[];
  onSave: (blocks: Block[]) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function BlockEditor({ blocks: initialBlocks, onSave, onCancel, isSaving = false }: BlockEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);
  const selectedBlockMeta = availableBlocks.find(b => b.type === selectedBlock?.type);

  // ... (mantené todas las funciones addBlock, removeBlock, updateBlock, moveBlock exactamente como están)

  const addBlock = (type: string) => {
    const id = `block-${Date.now()}`;
    let newBlock: Block;

    switch (type) {
      case 'header':
        newBlock = { type: 'header', id, data: { title: 'Nuevo Título', description: 'Descripción del portal' } };
        break;
      case 'stats':
        newBlock = {
          type: 'stats',
          id,
          data: {
            stats: [
              { icon: 'users', value: '1,247', label: 'Estudiantes Activos' },
              { icon: 'bookOpen', value: '42', label: 'Materias Disponibles' },
              { icon: 'trendingUp', value: '3,891', label: 'Materiales Compartidos' },
            ],
          },
        };
        break;
      case 'textSection':
        newBlock = { type: 'textSection', id, data: { title: 'Título de Sección', content: 'Contenido de la sección...' } };
        break;
      case 'infoList':
        newBlock = {
          type: 'infoList',
          id,
          data: {
            title: 'Información de Contacto',
            items: [
              { icon: 'mail', label: 'Email', value: 'info@universidad.edu' },
              { icon: 'phone', label: 'Teléfono', value: '+54 11 1234-5678' },
            ],
          },
        };
        break;
      case 'richText':
        newBlock = { type: 'richText', id, data: { title: 'Contenido Enriquecido', markdown: '# Título\n\nContenido...' } };
        break;
      case 'imageText':
        newBlock = {
          type: 'imageText',
          id,
          data: { imagePosition: 'left', imageUrl: '', title: 'Título con Imagen', content: 'Contenido...' },
        };
        break;
      case 'cta':
        newBlock = { type: 'cta', id, data: { text: '¿Te interesa unirte?', buttonText: 'Solicitar Acceso', buttonLink: '#' } };
        break;
      case 'imageOnly':
        newBlock = { type: 'imageOnly', id, data: { imageUrl: '', title: '', caption: '' } };
        break;
      default:
        return;
    }

    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(id);
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
  };

  const updateBlock = (id: string, data: any) => {
    setBlocks(blocks.map(b => (b.id === id ? { ...b, data } : b)));
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(b => b.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;

    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col portal-scope">
      {/* Topbar */}
      <div
        className="bg-card px-6 py-3.5 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border)', boxShadow: 'var(--portal-shadow-card)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary"
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            <LayoutTemplate className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-foreground text-sm font-semibold leading-tight" style={{ fontFamily: 'Work Sans, sans-serif' }}>
              Editor de Bloques
            </h2>
            <p className="text-xs text-muted-foreground leading-tight">Página de Inicio del Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-card hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
            disabled={isSaving}
          >
            <Eye className="w-4 h-4" />
            {isPreview ? 'Editar' : 'Preview'}
          </button>
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-card hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
            disabled={isSaving}
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
          <button
            onClick={() => onSave(blocks)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed portal-hoverable"
            style={{
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 100%)',
              color: 'var(--primary-foreground)',
              boxShadow: 'var(--portal-shadow-card)',
            }}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Layout del Editor - mantené el resto del código exactamente igual */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Izquierdo - Bloques Disponibles */}
        {!isPreview && (
          <aside
            className="w-64 bg-surface-container-low p-4 overflow-y-auto"
            style={{ borderRight: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-foreground text-xs font-semibold uppercase tracking-wide">Bloques Disponibles</h3>
            </div>
            <div className="space-y-2">
              {availableBlocks.map((block) => {
                const Icon = block.icon;
                return (
                  <button
                    key={block.type}
                    onClick={() => addBlock(block.type)}
                    className="w-full p-3 bg-card hover:border-primary/40 transition-all text-left flex items-start gap-3 group portal-hoverable"
                    style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--portal-shadow-card)' }}
                  >
                    <div
                      className="flex-shrink-0 w-9 h-9 bg-primary/10 group-hover:bg-primary/15 flex items-center justify-center transition-colors"
                      style={{ borderRadius: 'var(--radius-sm)' }}
                    >
                      <Icon className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground text-sm">{block.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{block.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* Canvas Central */}
        <main className="flex-1 overflow-y-auto p-8 bg-background">
          <div className="max-w-4xl mx-auto">
            {blocks.length === 0 && (
              <div
                className="text-center py-16 px-8 text-muted-foreground"
                style={{ borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)', background: 'var(--muted)' }}
              >
                <Layers className="w-8 h-8 mx-auto mb-3 text-muted-foreground/60" />
                <p className="mb-1 text-foreground font-medium">No hay bloques aún</p>
                <p className="text-sm">Selecciona un bloque de la izquierda para comenzar</p>
              </div>
            )}
            {blocks.map((block, index) => (
              <div
                key={block.id}
                onClick={() => !isPreview && setSelectedBlockId(block.id)}
                className={`relative group mb-2 transition-shadow ${!isPreview ? 'cursor-pointer' : ''}`}
                style={{
                  borderRadius: 'var(--radius)',
                  boxShadow:
                    !isPreview && selectedBlockId === block.id
                      ? '0 0 0 2px var(--primary), var(--portal-shadow-lift)'
                      : undefined,
                }}
              >
                {!isPreview && (
                  <div
                    className="absolute -top-4 right-3 flex items-center gap-0.5 p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-card"
                    style={{ borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', boxShadow: 'var(--portal-shadow-lift)' }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveBlock(block.id, 'up');
                      }}
                      className="p-1.5 hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ borderRadius: 'var(--radius-sm)' }}
                      disabled={index === 0}
                      title="Mover arriba"
                    >
                      <ChevronUp className="w-4 h-4 text-foreground" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveBlock(block.id, 'down');
                      }}
                      className="p-1.5 hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ borderRadius: 'var(--radius-sm)' }}
                      disabled={index === blocks.length - 1}
                      title="Mover abajo"
                    >
                      <ChevronDown className="w-4 h-4 text-foreground" />
                    </button>
                    <div className="w-px h-4 bg-border mx-0.5" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeBlock(block.id);
                      }}
                      className="p-1.5 hover:bg-destructive/10 text-destructive transition-colors"
                      style={{ borderRadius: 'var(--radius-sm)' }}
                      title="Eliminar bloque"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {renderBlock(block)}
              </div>
            ))}
          </div>
        </main>

        {/* Panel Derecho - Edición */}
        {!isPreview && selectedBlock && (
          <aside
            className="w-80 bg-surface-container-low p-4 overflow-y-auto"
            style={{ borderLeft: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Settings2 className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-foreground text-xs font-semibold uppercase tracking-wide">Editar Bloque</h3>
            </div>
            {selectedBlockMeta && (
              <div className="flex items-center gap-1.5 mb-4 mt-2">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary"
                  style={{ borderRadius: 'var(--radius-sm)' }}
                >
                  <PencilRuler className="w-3 h-3" />
                  {selectedBlockMeta.label}
                </span>
              </div>
            )}
            <div
              className="p-3.5 bg-card"
              style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--portal-shadow-card)' }}
            >
              {selectedBlock.type === 'header' && (
                <HeaderBlockForm
                  data={selectedBlock.data}
                  onChange={(data) => updateBlock(selectedBlock.id, data)}
                />
              )}
              {selectedBlock.type === 'stats' && (
                <StatsBlockForm
                  data={selectedBlock.data}
                  onChange={(data) => updateBlock(selectedBlock.id, data)}
                />
              )}
              {selectedBlock.type === 'textSection' && (
                <TextSectionBlockForm
                  data={selectedBlock.data}
                  onChange={(data) => updateBlock(selectedBlock.id, data)}
                />
              )}
              {selectedBlock.type === 'infoList' && (
                <InfoListBlockForm
                  data={selectedBlock.data}
                  onChange={(data) => updateBlock(selectedBlock.id, data)}
                />
              )}
              {selectedBlock.type === 'richText' && (
                <RichTextBlockForm
                  data={selectedBlock.data}
                  onChange={(data) => updateBlock(selectedBlock.id, data)}
                />
              )}
              {selectedBlock.type === 'imageText' && (
                <ImageTextBlockForm
                  data={selectedBlock.data}
                  onChange={(data) => updateBlock(selectedBlock.id, data)}
                />
              )}
              {selectedBlock.type === 'cta' && (
                <CTABlockForm
                  data={selectedBlock.data}
                  onChange={(data) => updateBlock(selectedBlock.id, data)}
                />
              )}
              {selectedBlock.type === 'imageOnly' && (
                <ImageOnlyBlockForm
                  data={selectedBlock.data}
                  onChange={(data) => updateBlock(selectedBlock.id, data)}
                />
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
