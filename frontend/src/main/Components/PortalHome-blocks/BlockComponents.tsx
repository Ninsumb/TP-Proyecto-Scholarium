import { Users, BookOpen, TrendingUp, Calendar, MapPin, Mail, Globe, Phone, Clock, Award } from "lucide-react";

// Tipos de bloques
export interface HeaderBlock {
  type: 'header';
  id: string;
  data: {
    title: string;
    description: string;
  };
}

export interface StatsBlock {
  type: 'stats';
  id: string;
  data: {
    stats: Array<{
      icon: string;
      value: string;
      label: string;
    }>;
  };
}

export interface TextSectionBlock {
  type: 'textSection';
  id: string;
  data: {
    title: string;
    content: string;
  };
}

export interface InfoListBlock {
  type: 'infoList';
  id: string;
  data: {
    title: string;
    items: Array<{
      icon: string;
      label: string;
      value: string;
    }>;
  };
}

export interface RichTextBlock {
  type: 'richText';
  id: string;
  data: {
    title: string;
    markdown: string;
  };
}

export interface ImageTextBlock {
  type: 'imageText';
  id: string;
  data: {
    imagePosition: 'left' | 'right';
    imageUrl: string;
    title: string;
    content: string;
  };
}

export interface CTABlock {
  type: 'cta';
  id: string;
  data: {
    text: string;
    buttonText: string;
    buttonLink: string;
  };
}

export type Block = HeaderBlock | StatsBlock | TextSectionBlock | InfoListBlock | RichTextBlock | ImageTextBlock | CTABlock;

// Mapeo de iconos
const iconMap: Record<string, React.ElementType> = {
  users: Users,
  bookOpen: BookOpen,
  trendingUp: TrendingUp,
  calendar: Calendar,
  mapPin: MapPin,
  mail: Mail,
  globe: Globe,
  phone: Phone,
  clock: Clock,
  award: Award,
};

// Componente Header Block
export function HeaderBlockComponent({ data }: { data: HeaderBlock['data'] }) {
  return (
    <div className="mb-8">
      <h1 className="mb-3 text-foreground">{data.title}</h1>
      <p className="text-lg text-on-surface-variant leading-relaxed max-w-4xl whitespace-pre-line">
        {data.description}
      </p>
    </div>
  );
}

// Componente Stats Block
export function StatsBlockComponent({ data }: { data: StatsBlock['data'] }) {
  const gridCols = data.stats.length === 1 ? 'grid-cols-1' : data.stats.length === 2 ? 'grid-cols-2' : 'grid-cols-3';
  return (
    <div className={`grid ${gridCols} gap-6 mb-8`}>
      {data.stats.map((stat, index) => {
        const Icon = iconMap[stat.icon] || Users;
        return (
          <div
            key={index}
            className="bg-surface-container-lowest p-6 text-center shadow-sm"
            style={{ borderRadius: 'var(--radius)' }}
          >
            <div
              className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 mb-3"
              style={{ borderRadius: 'var(--radius)' }}
            >
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <div className="text-2xl font-semibold text-foreground mb-1">{stat.value}</div>
            <div className="text-sm text-on-surface-variant">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
}

// Componente Text Section Block
export function TextSectionBlockComponent({ data }: { data: TextSectionBlock['data'] }) {
  return (
    <div className="mb-8">
      <h2 className="mb-4 text-foreground">{data.title}</h2>
      <p className="text-on-surface-variant leading-relaxed whitespace-pre-line">{data.content}</p>
    </div>
  );
}

// Componente Info List Block
export function InfoListBlockComponent({ data }: { data: InfoListBlock['data'] }) {
  return (
    <div
      className="bg-surface-container-lowest p-6 shadow-sm mb-8"
      style={{ borderRadius: 'var(--radius)' }}
    >
      <h3 className="mb-4 text-foreground">{data.title}</h3>
      <div className="space-y-4">
        {data.items.map((item, index) => {
          const Icon = iconMap[item.icon] || Mail;
          return (
            <div key={index} className="flex items-start gap-3">
              <Icon className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">{item.label}</div>
                <div className="text-sm text-on-surface-variant">{item.value}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Componente Rich Text Block
export function RichTextBlockComponent({ data }: { data: RichTextBlock['data'] }) {
  return (
    <div
      className="bg-surface-container-lowest p-6 shadow-sm mb-8"
      style={{ borderRadius: 'var(--radius)' }}
    >
      <h3 className="mb-4 text-foreground">{data.title}</h3>
      <div className="prose prose-sm max-w-none text-on-surface-variant">
        <p className="whitespace-pre-line">{data.markdown}</p>
      </div>
    </div>
  );
}

// Componente Image+Text Block
export function ImageTextBlockComponent({ data }: { data: ImageTextBlock['data'] }) {
  return (
    <div className={`flex ${data.imagePosition === 'right' ? 'flex-row-reverse' : 'flex-row'} gap-8 items-center mb-8`}>
      <div className="flex-1">
        <div
          className="w-full aspect-video bg-surface-container-low flex items-center justify-center text-on-surface-variant"
          style={{ borderRadius: 'var(--radius)' }}
        >
          {data.imageUrl ? (
            <img src={data.imageUrl} alt={data.title} className="w-full h-full object-cover" style={{ borderRadius: 'var(--radius)' }} />
          ) : (
            <span className="text-sm">Imagen</span>
          )}
        </div>
      </div>
      <div className="flex-1">
        <h2 className="mb-3 text-foreground">{data.title}</h2>
        <p className="text-on-surface-variant leading-relaxed">{data.content}</p>
      </div>
    </div>
  );
}

// Componente CTA Block
export function CTABlockComponent({ data }: { data: CTABlock['data'] }) {
  return (
    <div
      className="bg-primary text-primary-foreground p-8 text-center mb-8 shadow-sm"
      style={{ borderRadius: 'var(--radius)' }}
    >
      <h2 className="text-2xl font-semibold mb-3">{data.text}</h2>
      <a
        href={data.buttonLink}
        className="inline-block px-6 py-3 bg-background text-foreground hover:bg-background/90 transition-colors font-medium"
        style={{ borderRadius: 'var(--radius)' }}
      >
        {data.buttonText}
      </a>
    </div>
  );
}

// Renderizador de bloques
export function renderBlock(block: Block) {
  switch (block.type) {
    case 'header':
      return <HeaderBlockComponent key={block.id} data={block.data} />;
    case 'stats':
      return <StatsBlockComponent key={block.id} data={block.data} />;
    case 'textSection':
      return <TextSectionBlockComponent key={block.id} data={block.data} />;
    case 'infoList':
      return <InfoListBlockComponent key={block.id} data={block.data} />;
    case 'richText':
      return <RichTextBlockComponent key={block.id} data={block.data} />;
    case 'imageText':
      return <ImageTextBlockComponent key={block.id} data={block.data} />;
    case 'cta':
      return <CTABlockComponent key={block.id} data={block.data} />;
    default:
      return null;
  }
}
