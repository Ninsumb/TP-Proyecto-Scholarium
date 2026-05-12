import { useState } from "react";
import { X, Plus, Trash2, Eye, Save, ChevronUp, ChevronDown, Heading, BarChart3, FileText, List, FileCode, ImageIcon, Megaphone } from "lucide-react";
import type {
  Block,
  HeaderBlock,
  StatsBlock,
  TextSectionBlock,
  InfoListBlock,
  RichTextBlock,
  ImageTextBlock,
  CTABlock,
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
];

// Formularios de edición para cada tipo de bloque
function HeaderBlockForm({ data, onChange }: { data: HeaderBlock['data']; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-2 text-sm font-medium">Título</label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          className="w-full px-3 py-2 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          style={{ borderRadius: 'var(--radius)' }}
        />
      </div>
      <div>
        <label className="block mb-2 text-sm font-medium">Descripción</label>
        <textarea
          rows={4}
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          className="w-full px-3 py-2 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none"
          style={{ borderRadius: 'var(--radius)' }}
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
        <label className="text-sm font-medium">Estadísticas</label>
        <button
          onClick={addStat}
          className="p-1.5 hover:bg-accent transition-colors"
          style={{ borderRadius: 'var(--radius)' }}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {data.stats.map((stat, index) => (
        <div key={index} className="border border-border p-3 space-y-2" style={{ borderRadius: 'var(--radius)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">Estadística {index + 1}</span>
            <button
              onClick={() => removeStat(index)}
              className="p-1 hover:bg-destructive/10 text-destructive"
              style={{ borderRadius: 'var(--radius)' }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <select
            value={stat.icon}
            onChange={(e) => updateStat(index, 'icon', e.target.value)}
            className="w-full px-2 py-1.5 border border-border bg-input-background text-foreground text-sm"
            style={{ borderRadius: 'var(--radius)' }}
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
            className="w-full px-2 py-1.5 border border-border bg-input-background text-foreground text-sm"
            style={{ borderRadius: 'var(--radius)' }}
          />
          <input
            type="text"
            placeholder="Label"
            value={stat.label}
            onChange={(e) => updateStat(index, 'label', e.target.value)}
            className="w-full px-2 py-1.5 border border-border bg-input-background text-foreground text-sm"
            style={{ borderRadius: 'var(--radius)' }}
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
        <label className="block mb-2 text-sm font-medium">Título</label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          className="w-full px-3 py-2 border border-border bg-input-background text-foreground text-sm"
          style={{ borderRadius: 'var(--radius)' }}
        />
      </div>
      <div>
        <label className="block mb-2 text-sm font-medium">Contenido</label>
        <textarea
          rows={6}
          value={data.content}
          onChange={(e) => onChange({ ...data, content: e.target.value })}
          className="w-full px-3 py-2 border border-border bg-input-background text-foreground text-sm resize-none"
          style={{ borderRadius: 'var(--radius)' }}
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
        <label className="block mb-2 text-sm font-medium">Título</label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          className="w-full px-3 py-2 border border-border bg-input-background text-foreground text-sm"
          style={{ borderRadius: 'var(--radius)' }}
        />
      </div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Items</label>
        <button
          onClick={addItem}
          className="p-1.5 hover:bg-accent transition-colors"
          style={{ borderRadius: 'var(--radius)' }}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {data.items.map((item, index) => (
        <div key={index} className="border border-border p-3 space-y-2" style={{ borderRadius: 'var(--radius)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">Item {index + 1}</span>
            <button
              onClick={() => removeItem(index)}
              className="p-1 hover:bg-destructive/10 text-destructive"
              style={{ borderRadius: 'var(--radius)' }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <select
            value={item.icon}
            onChange={(e) => updateItem(index, 'icon', e.target.value)}
            className="w-full px-2 py-1.5 border border-border bg-input-background text-foreground text-sm"
            style={{ borderRadius: 'var(--radius)' }}
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
            className="w-full px-2 py-1.5 border border-border bg-input-background text-foreground text-sm"
            style={{ borderRadius: 'var(--radius)' }}
          />
          <input
            type="text"
            placeholder="Valor"
            value={item.value}
            onChange={(e) => updateItem(index, 'value', e.target.value)}
            className="w-full px-2 py-1.5 border border-border bg-input-background text-foreground text-sm"
            style={{ borderRadius: 'var(--radius)' }}
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
        <label className="block mb-2 text-sm font-medium">Título</label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          className="w-full px-3 py-2 border border-border bg-input-background text-foreground text-sm"
          style={{ borderRadius: 'var(--radius)' }}
        />
      </div>
      <div>
        <label className="block mb-2 text-sm font-medium">Contenido (Markdown)</label>
        <textarea
          rows={8}
          value={data.markdown}
          onChange={(e) => onChange({ ...data, markdown: e.target.value })}
          className="w-full px-3 py-2 border border-border bg-input-background text-foreground text-sm resize-none font-mono"
          style={{ borderRadius: 'var(--radius)' }}
        />
      </div>
    </div>
  );
}

function ImageTextBlockForm({ data, onChange }: { data: ImageTextBlock['data']; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-2 text-sm font-medium">Posición de Imagen</label>
        <select
          value={data.imagePosition}
          onChange={(e) => onChange({ ...data, imagePosition: e.target.value })}
          className="w-full px-3 py-2 border border-border bg-input-background text-foreground text-sm"
          style={{ borderRadius: 'var(--radius)' }}
        >
          <option value="left">Izquierda</option>
          <option value="right">Derecha</option>
        </select>
      </div>
      <div>
        <label className="block mb-2 text-sm font-medium">URL de Imagen</label>
        <input
          type="text"
          value={data.imageUrl}
          onChange={(e) => onChange({ ...data, imageUrl: e.target.value })}
          className="w-full px-3 py-2 border border-border bg-input-background text-foreground text-sm"
          style={{ borderRadius: 'var(--radius)' }}
          placeholder="https://..."
        />
      </div>
      <div>
        <label className="block mb-2 text-sm font-medium">Título</label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          className="w-full px-3 py-2 border border-border bg-input-background text-foreground text-sm"
          style={{ borderRadius: 'var(--radius)' }}
        />
      </div>
      <div>
        <label className="block mb-2 text-sm font-medium">Contenido</label>
        <textarea
          rows={4}
          value={data.content}
          onChange={(e) => onChange({ ...data, content: e.target.value })}
          className="w-full px-3 py-2 border border-border bg-input-background text-foreground text-sm resize-none"
          style={{ borderRadius: 'var(--radius)' }}
        />
      </div>
    </div>
  );
}

function CTABlockForm({ data, onChange }: { data: CTABlock['data']; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-2 text-sm font-medium">Texto Principal</label>
        <input
          type="text"
          value={data.text}
          onChange={(e) => onChange({ ...data, text: e.target.value })}
          className="w-full px-3 py-2 border border-border bg-input-background text-foreground text-sm"
          style={{ borderRadius: 'var(--radius)' }}
        />
      </div>
      <div>
        <label className="block mb-2 text-sm font-medium">Texto del Botón</label>
        <input
          type="text"
          value={data.buttonText}
          onChange={(e) => onChange({ ...data, buttonText: e.target.value })}
          className="w-full px-3 py-2 border border-border bg-input-background text-foreground text-sm"
          style={{ borderRadius: 'var(--radius)' }}
        />
      </div>
      <div>
        <label className="block mb-2 text-sm font-medium">Enlace del Botón</label>
        <input
          type="text"
          value={data.buttonLink}
          onChange={(e) => onChange({ ...data, buttonLink: e.target.value })}
          className="w-full px-3 py-2 border border-border bg-input-background text-foreground text-sm"
          style={{ borderRadius: 'var(--radius)' }}
          placeholder="/portal/..."
        />
      </div>
    </div>
  );
}

interface BlockEditorProps {
  blocks: Block[];
  onSave: (blocks: Block[]) => void;
  onCancel: () => void;
}

export function BlockEditor({ blocks: initialBlocks, onSave, onCancel }: BlockEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

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
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Topbar */}
      <div className="bg-surface-container-high border-b border-border px-6 py-3 flex items-center justify-between">
        <h2 className="text-foreground">Editor de Bloques - Página de Inicio</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center gap-2 px-4 py-2 border border-border hover:bg-accent transition-colors"
            style={{ borderRadius: 'var(--radius)' }}
          >
            <Eye className="w-4 h-4" />
            {isPreview ? 'Editar' : 'Preview'}
          </button>
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 border border-border hover:bg-accent transition-colors"
            style={{ borderRadius: 'var(--radius)' }}
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
          <button
            onClick={() => onSave(blocks)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors"
            style={{ borderRadius: 'var(--radius)' }}
          >
            <Save className="w-4 h-4" />
            Guardar
          </button>
        </div>
      </div>

      {/* Layout del Editor */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Izquierdo - Bloques Disponibles */}
        {!isPreview && (
          <aside className="w-64 bg-surface-container-low border-r border-border p-4 overflow-y-auto">
            <h3 className="mb-4 text-foreground text-sm font-semibold">Bloques Disponibles</h3>
            <div className="space-y-2">
              {availableBlocks.map((block) => {
                const Icon = block.icon;
                return (
                  <button
                    key={block.type}
                    onClick={() => addBlock(block.type)}
                    className="w-full p-3 border border-border bg-surface-container-lowest hover:bg-surface-container hover:shadow-sm transition-all text-left flex items-start gap-3 group"
                    style={{ borderRadius: 'var(--radius)' }}
                  >
                    <div
                      className="flex-shrink-0 w-10 h-10 bg-primary/10 group-hover:bg-primary/15 flex items-center justify-center transition-colors"
                      style={{ borderRadius: 'var(--radius)' }}
                    >
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground text-sm">{block.label}</div>
                      <div className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">{block.description}</div>
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
              <div className="text-center py-16 text-on-surface-variant">
                <p className="mb-2">No hay bloques aún</p>
                <p className="text-sm">Selecciona un bloque de la izquierda para comenzar</p>
              </div>
            )}
            {blocks.map((block, index) => (
              <div
                key={block.id}
                onClick={() => !isPreview && setSelectedBlockId(block.id)}
                className={`relative group ${!isPreview && selectedBlockId === block.id ? 'ring-2 ring-primary' : ''} ${!isPreview ? 'cursor-pointer' : ''}`}
                style={{ borderRadius: 'var(--radius)' }}
              >
                {!isPreview && (
                  <div className="absolute -top-3 right-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveBlock(block.id, 'up');
                      }}
                      className="p-1.5 bg-surface-container-lowest border border-border hover:bg-surface-container shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ borderRadius: 'var(--radius)' }}
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
                      className="p-1.5 bg-surface-container-lowest border border-border hover:bg-surface-container shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ borderRadius: 'var(--radius)' }}
                      disabled={index === blocks.length - 1}
                      title="Mover abajo"
                    >
                      <ChevronDown className="w-4 h-4 text-foreground" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeBlock(block.id);
                      }}
                      className="p-1.5 bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 text-destructive shadow-sm"
                      style={{ borderRadius: 'var(--radius)' }}
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
          <aside className="w-80 bg-surface-container-low border-l border-border p-4 overflow-y-auto">
            <h3 className="mb-4 text-foreground font-semibold">Editar Bloque</h3>
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
          </aside>
        )}
      </div>
    </div>
  );
}
