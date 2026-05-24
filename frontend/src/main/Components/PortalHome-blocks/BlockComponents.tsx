import { Users, BookOpen, TrendingUp, Calendar, MapPin, Mail, Globe, Phone, Clock, Award } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

export interface ImageOnlyBlock {
  type: 'imageOnly';
  id: string;
  data: {
    imageUrl: string;
    title?: string;
    caption?: string;
  };
}

export type Block = HeaderBlock | StatsBlock | TextSectionBlock | InfoListBlock | RichTextBlock | ImageTextBlock | CTABlock | ImageOnlyBlock;

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
      <h1 className="mb-3 text-foreground break-words">{data.title}</h1>
      <p className="text-lg text-foreground leading-relaxed max-w-4xl whitespace-pre-line break-words min-w-0">
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
            <div className="text-2xl font-semibold text-foreground mb-1 min-w-0 overflow-wrap-anywhere">{stat.value}</div>
            <div className="text-sm text-foreground min-w-0 overflow-wrap-anywhere">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
}

// Componente Text Section Block
export function TextSectionBlockComponent({ data }: { data: TextSectionBlock['data'] }) {
  return (
    <div className="mb-8 min-w-0 overflow-wrap-anywhere">
      <h2 className="mb-4 text-foreground break-words">{data.title}</h2>
      <p className="text-foreground leading-relaxed whitespace-pre-line break-words min-w-0">{data.content}</p>
    </div>
  );
}

// Componente Info List Block
export function InfoListBlockComponent({ data }: { data: InfoListBlock['data'] }) {
  return (
    <div
      className="bg-surface-container-lowest p-6 shadow-sm mb-8 min-w-0 overflow-wrap-anywhere"
      style={{ borderRadius: 'var(--radius)' }}
    >
      <h3 className="mb-4 text-foreground break-words">{data.title}</h3>
      <div className="space-y-4">
        {data.items.map((item, index) => {
          const Icon = iconMap[item.icon] || Mail;
          return (
            <div key={index} className="flex items-start gap-3 min-w-0 overflow-wrap-anywhere">
              <Icon className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">{item.label}</div>
                <div className="text-sm text-foreground">{item.value}</div>
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
      className="bg-surface-container-lowest p-6 shadow-sm mb-8 min-w-0 overflow-wrap-anywhere text-foreground"
      style={{ borderRadius: 'var(--radius)' }}
    >
      <h3 className="mb-4 text-foreground break-words">{data.title}</h3>
      <div className="prose prose-sm max-w-none dark:prose-invert
      [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2
      [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2
      [&_li]:my-1
      [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:mb-3
      [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-2
      [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mb-2
      [&_p]:mb-3 [&_p]:leading-relaxed
      [&_strong]:font-semibold
      [&_em]:italic
      [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground
      [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
      [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto
      [&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary/80
      [&_hr]:border-border [&_hr]:my-4
      [&_table]:w-full [&_table]:border-collapse
      [&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-medium [&_th]:bg-muted
      [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2
      [&_input[type=checkbox]]:mr-2">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {data.markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}

// Componente Image+Text Block
export function ImageTextBlockComponent({ data }: { data: ImageTextBlock['data'] }) {
  return (
    <div className={`flex ${data.imagePosition === 'right' ? 'flex-row-reverse' : 'flex-row'} gap-8 items-center mb-8 `}>
      <div className="flex-1 min-w-0 overflow-wrap-anywhere">
        <div
          className="w-full aspect-video bg-surface-container-low flex items-center justify-center text-foreground"
          style={{ borderRadius: 'var(--radius)' }}
        >
          {data.imageUrl ? (
            <img src={data.imageUrl} alt={data.title} className="w-full h-full object-cover" style={{ borderRadius: 'var(--radius)' }} />
          ) : (
            <span className="text-sm">Imagen</span>
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0 overflow-wrap-anywhere">
        <h2 className="mb-3 text-foreground break-words">{data.title}</h2>
        <p className="text-foreground leading-relaxed break-words min-w-0">{data.content}</p>
      </div>
    </div>
  );
}

// Componente CTA Block
export function CTABlockComponent({ data }: { data: CTABlock['data'] }) {
  return (
    <div
      className="bg-primary text-primary-foreground p-8 text-center mb-8 shadow-sm min-w-0 overflow-wrap-anywhere"
      style={{ borderRadius: 'var(--radius)' }}
    >
      <h2 className="text-2xl font-semibold mb-3 break-words">{data.text}</h2>
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

export function ImageOnlyBlockComponent({ data }: { data: ImageOnlyBlock['data'] }) {
  return (
    <div className="mb-8 min-w-0">
      {data.title && (
        <h3 className="mb-3 text-foreground font-medium break-words">{data.title}</h3>
      )}
      <div
        className="w-full bg-surface-container-low flex items-center justify-center overflow-hidden"
        style={{ borderRadius: 'var(--radius)' }}
      >
        {data.imageUrl ? (
          <img
            src={data.imageUrl}
            alt={data.title || data.caption || 'Imagen'}
            className="w-full h-auto object-cover"
            style={{ borderRadius: 'var(--radius)' }}
          />
        ) : (
          <div className="w-full aspect-video flex items-center justify-center text-muted-foreground text-sm">
            Sin imagen
          </div>
        )}
      </div>
      {data.caption && (
        <p className="mt-2 text-sm text-muted-foreground text-center break-words">{data.caption}</p>
      )}
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
    case 'imageOnly':
      return <ImageOnlyBlockComponent key={block.id} data={block.data} />;
    default:
      return null;
  }
}
