import { useState, useRef, useContext } from "react";
import { useNavigate } from "react-router";
import {
    ArrowLeft, Upload, Palette, X, Check, Search,
    GraduationCap, BookOpen, Code, Briefcase, FlaskConical,
    Calculator, Languages, Network, BarChart2, Rocket, Cpu,
    Terminal, Globe, Lock, Loader2, Users, Building2,
    Microscope, Atom, Music, Brush, Camera, Film,
    HeartPulse, Stethoscope, Pill, Dna, Brain,
    Scale, Landmark, Gavel, FileText, Library,
    TreePine, Leaf, Mountain, Sun, Droplets,
    Wrench, Settings, Hammer, HardHat, Zap,
    ChartBar, TrendingUp, Coins, Wallet, PiggyBank,
    Pen, Pencil, NotebookPen, Quote, Newspaper,
    Plane, Ship, Car, Train, Bus,
    Wheat, Apple, Fish, Beef, Coffee,
    Sparkles, Pipette,
    type LucideIcon,
} from "lucide-react";
import { portalService } from "../../services/PortalService";
import { PortalAvatar } from "../../Components/common/PortalAvatar";
import { MainContext } from "../../types/MainContext";
import { adminService } from "../../services/AdminService";
import apiClient from "../../services/apiClient";

const CATEGORIAS_ICONOS: {
    label: string;
    iconos: { value: string; label: string; Icon: LucideIcon }[];
}[] = [
    { label: "Académico", iconos: [
        { value: "GraduationCap", label: "Birrete",       Icon: GraduationCap },
        { value: "BookOpen",      label: "Libro",         Icon: BookOpen },
        { value: "Library",       label: "Biblioteca",    Icon: Library },
        { value: "NotebookPen",   label: "Apuntes",       Icon: NotebookPen },
        { value: "FileText",      label: "Documento",     Icon: FileText },
        { value: "Quote",         label: "Cita",          Icon: Quote },
        { value: "Pen",           label: "Pluma",         Icon: Pen },
        { value: "Pencil",        label: "Lápiz",         Icon: Pencil },
        { value: "Newspaper",     label: "Periódico",     Icon: Newspaper },
    ]},
    { label: "Tecnología", iconos: [
        { value: "Code",     label: "Código",        Icon: Code },
        { value: "Terminal", label: "Terminal",      Icon: Terminal },
        { value: "Cpu",      label: "CPU",           Icon: Cpu },
        { value: "Network",  label: "Redes",         Icon: Network },
        { value: "Rocket",   label: "Cohete",        Icon: Rocket },
        { value: "Globe",    label: "Web",           Icon: Globe },
        { value: "Settings", label: "Config.",       Icon: Settings },
        { value: "Zap",      label: "Eléctrico",     Icon: Zap },
    ]},
    { label: "Ciencias", iconos: [
        { value: "FlaskConical", label: "Lab.",       Icon: FlaskConical },
        { value: "Microscope",   label: "Micro.",     Icon: Microscope },
        { value: "Atom",         label: "Átomo",      Icon: Atom },
        { value: "Dna",          label: "ADN",        Icon: Dna },
        { value: "Brain",        label: "Cerebro",    Icon: Brain },
        { value: "Calculator",   label: "Calc.",      Icon: Calculator },
        { value: "BarChart2",    label: "Estadística",Icon: BarChart2 },
    ]},
    { label: "Salud", iconos: [
        { value: "HeartPulse",  label: "Cardio.",   Icon: HeartPulse },
        { value: "Stethoscope", label: "Medicina",  Icon: Stethoscope },
        { value: "Pill",        label: "Farmacia",  Icon: Pill },
    ]},
    { label: "Derecho y Sociales", iconos: [
        { value: "Scale",     label: "Justicia",   Icon: Scale },
        { value: "Landmark",  label: "Institución",Icon: Landmark },
        { value: "Gavel",     label: "Martillo",   Icon: Gavel },
        { value: "Languages", label: "Idiomas",    Icon: Languages },
        { value: "Users",     label: "Comunidad",  Icon: Users },
        { value: "Building2", label: "Edificio",   Icon: Building2 },
    ]},
    { label: "Economía", iconos: [
        { value: "Briefcase",  label: "Maletín",   Icon: Briefcase },
        { value: "TrendingUp", label: "Tendencia", Icon: TrendingUp },
        { value: "Coins",      label: "Monedas",   Icon: Coins },
        { value: "Wallet",     label: "Billetera", Icon: Wallet },
        { value: "PiggyBank",  label: "Finanzas",  Icon: PiggyBank },
        { value: "ChartBar",   label: "Gráfico",   Icon: ChartBar },
    ]},
    { label: "Arte y Diseño", iconos: [
        { value: "Brush",  label: "Pincel",    Icon: Brush },
        { value: "Camera", label: "Foto",      Icon: Camera },
        { value: "Film",   label: "Cine",      Icon: Film },
        { value: "Music",  label: "Música",    Icon: Music },
    ]},
    { label: "Ingeniería", iconos: [
        { value: "Wrench",  label: "Mecánica", Icon: Wrench },
        { value: "Hammer",  label: "Construc.", Icon: Hammer },
        { value: "HardHat", label: "Obra",     Icon: HardHat },
    ]},
    { label: "Naturaleza", iconos: [
        { value: "TreePine", label: "Bosque",   Icon: TreePine },
        { value: "Leaf",     label: "Ecología", Icon: Leaf },
        { value: "Mountain", label: "Montaña",  Icon: Mountain },
        { value: "Sun",      label: "Solar",    Icon: Sun },
        { value: "Droplets", label: "Agua",     Icon: Droplets },
    ]},
    { label: "Transporte", iconos: [
        { value: "Plane", label: "Aviación", Icon: Plane },
        { value: "Ship",  label: "Náutica",  Icon: Ship },
        { value: "Car",   label: "Auto",     Icon: Car },
        { value: "Train", label: "Tren",     Icon: Train },
        { value: "Bus",   label: "Bus",      Icon: Bus },
    ]},
    { label: "Alimentación", iconos: [
        { value: "Wheat",  label: "Agronomía", Icon: Wheat },
        { value: "Apple",  label: "Nutrición", Icon: Apple },
        { value: "Fish",   label: "Pesca",     Icon: Fish },
        { value: "Beef",   label: "Ganadería", Icon: Beef },
        { value: "Coffee", label: "Gastro.",   Icon: Coffee },
    ]},
];

const COLORES_PRESET = [
    { hex: "#1e3448", label: "Medianoche" },
    { hex: "#2c4456", label: "Navy"       },
    { hex: "#1d4ed8", label: "Azul"       },
    { hex: "#0e7490", label: "Teal"       },
    { hex: "#7c3aed", label: "Violeta"    },
    { hex: "#9333ea", label: "Púrpura"    },
    { hex: "#be185d", label: "Rosa"       },
    { hex: "#dc2626", label: "Rojo"       },
    { hex: "#ea580c", label: "Naranja"    },
    { hex: "#c8841a", label: "Ámbar"      },
    { hex: "#16a34a", label: "Verde"      },
    { hex: "#065f46", label: "Bosque"     },
];

type ModoVisual = "icono" | "imagen";

interface FormState {
    carrera: string;
    universidad: string;
    unidadAcademica: string;
    descripcion: string;
    tipoAcceso: "ABIERTO" | "CERRADO";
}

function hexLuminance(hex: string) {
    const r = parseInt(hex.slice(1,3),16)/255;
    const g = parseInt(hex.slice(3,5),16)/255;
    const b = parseInt(hex.slice(5,7),16)/255;
    const f = (c: number) => c <= 0.03928 ? c/12.92 : ((c+0.055)/1.055)**2.4;
    return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b);
}
const textOn = (hex: string) => hexLuminance(hex) > 0.3 ? "#000" : "#fff";

export function CreatePortal() {
    const navigate      = useNavigate();
    const { showToast } = useContext(MainContext);
    const fileInputRef  = useRef<HTMLInputElement>(null);
    const colorInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState<FormState>({
        carrera: "", universidad: "", unidadAcademica: "", descripcion: "", tipoAcceso: "CERRADO",
    });
    const [modoVisual, setModoVisual]               = useState<ModoVisual>("icono");
    const [iconoSeleccionado, setIconoSeleccionado] = useState("GraduationCap");
    const [colorSeleccionado, setColorSeleccionado] = useState("#2c4456");
    const [busquedaIcono, setBusquedaIcono]         = useState("");
    const [hexInput, setHexInput]                   = useState("2c4456");
    const [hexError, setHexError]                   = useState(false);
    const [imagenFile, setImagenFile]               = useState<File | null>(null);
    const [imagenPreviewUrl, setImagenPreviewUrl]   = useState<string | null>(null);
    const [loading, setLoading]                     = useState(false);
    const [errorDuplicado, setErrorDuplicado]       = useState<string | null>(null);

    const setColor = (hex: string) => {
        setColorSeleccionado(hex);
        setHexInput(hex.replace(/^#/, ""));
        setHexError(false);
    };

    const handleHexInput = (raw: string) => {
        const clean = raw.replace(/[^0-9a-fA-F]/g,"").slice(0,6);
        setHexInput(clean);
        if (clean.length === 6) { setColorSeleccionado(`#${clean}`); setHexError(false); }
        else setHexError(clean.length > 0);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(p => ({ ...p, [name]: value }));
        if (name === "universidad" || name === "carrera") setErrorDuplicado(null);
    };

    const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImagenFile(file);
        setImagenPreviewUrl(URL.createObjectURL(file));
    };

    const handleQuitarImagen = () => {
        setImagenFile(null);
        if (imagenPreviewUrl) URL.revokeObjectURL(imagenPreviewUrl);
        setImagenPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const q = busquedaIcono.toLowerCase().trim();
    const resultadosBusqueda = q
        ? CATEGORIAS_ICONOS.flatMap(c => c.iconos.filter(i => i.label.toLowerCase().includes(q)))
        : null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorDuplicado(null);
        if (!form.carrera.trim() || !form.universidad.trim()) return;
        setLoading(true);
        try {
            const response = await portalService.crearPortal({
                carrera: form.carrera.trim(), universidad: form.universidad.trim(),
                unidadAcademica: form.unidadAcademica.trim() || undefined,
                descripcion: form.descripcion.trim() || undefined,
                tipoAcceso: form.tipoAcceso,
                iconoPortal: modoVisual === "icono" ? iconoSeleccionado : undefined,
                colorPortal: modoVisual === "icono" ? colorSeleccionado : undefined,
                logoUrl: undefined,
            });
            if (modoVisual === "imagen" && imagenFile) {
                const fd = new FormData();
                fd.append("imagen", imagenFile);
                const imgRes = await apiClient.patch(`/portales/${response.id}/imagen`, fd,
                    { headers: { "Content-Type": "multipart/form-data" } });
                await adminService.actualizarPortal(response.id, { logoUrl: imgRes.data.logoUrl });
            }
            showToast("¡Portal creado exitosamente!", "success");
            navigate(`/portal/${response.id}`);
        } catch (err: any) {
            const msg = err.response?.data?.message || err.response?.data || "";
            if (typeof msg === "string" && msg.includes("Ya existe un portal")) {
                setErrorDuplicado("Ya existe un portal para esa universidad y carrera. Podés buscarlo en Explorar Portales.");
            } else {
                showToast("Ocurrió un error al crear el portal. Intentá de nuevo.", "error");
            }
        } finally { setLoading(false); }
    };

    const previewLogoUrl = modoVisual === "imagen" ? imagenPreviewUrl : null;
    const previewIcono   = modoVisual === "icono"  ? iconoSeleccionado : null;
    const previewColor   = modoVisual === "icono"  ? colorSeleccionado : null;
    const canSubmit      = !!form.carrera.trim() && !!form.universidad.trim() && !loading;
    const AccesoIcon     = form.tipoAcceso === "ABIERTO" ? Globe : Lock;

    const filledCount = [
        !!form.carrera.trim(), !!form.universidad.trim(), true,
        modoVisual === "icono" || !!imagenPreviewUrl,
    ].filter(Boolean).length;
    const progressPct = Math.round((filledCount / 4) * 100);

    return (
        <div className="cp-root">

        {/* ═══════════════════════════════════════════════════════════
            HEADER — Estética de atelieur / papel de borrador
            La idea: no un hero dark genérico sino una hoja en blanco
            con carácter tipográfico fuerte. Warm white, líneas de
            cuaderno, margen rojo clásico, tipografía serif pesada.
            El título no "grita" con fondos negros — IMPONE con escala.
            ═══════════════════════════════════════════════════════════ */}
        <header className="f-header">
            {/* Textura de fondo — papel ligeramente rugoso */}
            <div className="f-paper-texture" aria-hidden />
            {/* Líneas de cuaderno universitario horizontales */}
            <div className="f-ruled" aria-hidden />
            {/* Margen clásico — línea roja vertical */}
            <div className="f-margin" aria-hidden />
            {/* Manchas de tinta — atmosfera, no decoración */}
            <div className="f-ink f-ink-a" aria-hidden />
            <div className="f-ink f-ink-b" aria-hidden />

            <div className="f-header-inner max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Breadcrumb — minimalista, no botón */}
                <button type="button" onClick={() => navigate("/home")} className="f-back">
                    <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
                    <span>Mis Portales</span>
                </button>

                {/* Grid principal del header: copy izq + preview der */}
                <div className="f-header-grid">

                    {/* Columna izquierda: copy */}
                    <div className="f-copy">
                        {/* Número de folio — gesto editorial */}
                        <div className="f-folio" aria-hidden>
                            <span className="f-folio-n">§ 1</span>
                            <span className="f-folio-line" />
                            <span className="f-folio-txt">nueva comunidad</span>
                        </div>

                        {/* El título principal — serif, no sans */}
                        <h1 className="f-title">
                            <span className="f-title-verb">Crear</span>
                            <br />
                            <em className="f-title-noun">Portal</em>
                        </h1>

                        <p className="f-subtitle">
                            Dale nombre, identidad y carácter desde el primer momento.
                            Un portal reúne a toda una carrera en un solo espacio.
                        </p>

                        {/* Stepper como "índice del documento" — no píldoras flotantes */}
                        <ol className="f-index" aria-label="Secciones del formulario">
                            {[
                                { n: "I",   label: "Identidad",      done: !!form.carrera.trim() && !!form.universidad.trim() },
                                { n: "II",  label: "Acceso",         done: true },
                                { n: "III", label: "Visual",         done: modoVisual === "icono" || !!imagenPreviewUrl },
                            ].map(({ n, label, done }) => (
                                <li key={n} className={`f-index-item ${done ? "f-index-item--done" : ""}`}>
                                    <span className="f-index-n">{n}</span>
                                    <span className="f-index-dot" />
                                    <span className="f-index-label">{label}</span>
                                    {done && <Check className="f-index-check w-3 h-3" />}
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* Columna derecha: preview viva */}
                    <div className="f-preview-wrap" aria-label="Vista previa en tiempo real">
                        <p className="f-preview-label">
                            Vista previa
                            <span className="f-preview-live">en vivo</span>
                        </p>

                        <div className="f-preview-card">
                            {/* Franja de color — responde al color seleccionado */}
                            <div className="f-preview-stripe"
                                style={{ background: previewColor ?? "#2c4456" }} />
                            <div className="f-preview-body">
                                <div className="f-preview-avatar"
                                    style={{
                                        background: `${previewColor ?? "#2c4456"}15`,
                                        borderColor: `${previewColor ?? "#2c4456"}25`,
                                    }}>
                                    <PortalAvatar
                                        logoUrl={previewLogoUrl}
                                        iconoPortal={previewIcono}
                                        colorPortal={previewColor}
                                        carrera={form.carrera || "Portal"}
                                        size="md"
                                    />
                                </div>
                                <div className="f-preview-meta">
                                    <p className="f-preview-name">
                                        {form.carrera || <span className="f-ghost">Nombre de la carrera</span>}
                                    </p>
                                    <p className="f-preview-uni">
                                        {form.universidad || <span className="f-ghost">Universidad</span>}
                                    </p>
                                    {form.unidadAcademica && (
                                        <p className="f-preview-faculty">{form.unidadAcademica}</p>
                                    )}
                                </div>
                            </div>
                            <div className="f-preview-foot">
                                <span className={`f-access-chip ${form.tipoAcceso === "ABIERTO" ? "f-access-chip--open" : "f-access-chip--closed"}`}>
                                    <AccesoIcon className="w-3 h-3" />
                                    {form.tipoAcceso === "ABIERTO" ? "Acceso libre" : "Solicitud requerida"}
                                </span>
                            </div>
                        </div>

                        {/* Checklist compacto */}
                        <ul className="f-checks" aria-label="Progreso del formulario">
                            {[
                                { label: "Carrera",  done: !!form.carrera.trim() },
                                { label: "Uni.",     done: !!form.universidad.trim() },
                                { label: "Acceso",   done: true },
                                { label: "Visual",   done: modoVisual === "icono" || !!imagenPreviewUrl },
                            ].map(({ label, done }) => (
                                <li key={label} className={`f-check-item ${done ? "f-check-item--done" : ""}`}>
                                    <span className="f-check-box">{done && <Check className="w-2.5 h-2.5" />}</span>
                                    {label}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Barra de progreso — como páginas escritas de un cuaderno */}
                <div className="f-progress" role="progressbar"
                    aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
                    <div className="f-progress-bar">
                        <div className="f-progress-fill" style={{ width: `${progressPct}%` }} />
                    </div>
                    <span className="f-progress-label">
                        {progressPct === 100
                            ? "Listo para fundar"
                            : `${progressPct}% completado`}
                    </span>
                </div>
            </div>
        </header>

        {/* ═══════════════════════════════════════════════════════════
            BODY — formulario principal
            ═══════════════════════════════════════════════════════════ */}
        <div className="f-body max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <form onSubmit={handleSubmit} className="f-form" noValidate>

                {/* ── SECCIÓN I — Identidad ── */}
                <section className="f-section">
                    <div className="f-section-aside" aria-hidden>
                        <span className="f-aside-num f-aside-num--I">I</span>
                        <span className="f-aside-rule" />
                    </div>
                    <div className="f-section-card f-section-card--I">
                        <div className="f-section-head">
                            <h2 className="f-section-title">Identidad del portal</h2>
                            <p className="f-section-sub">
                                Los campos con <span className="f-req">*</span> son obligatorios.
                            </p>
                        </div>

                        <div className="f-fields">
                            {/* Carrera — el campo más importante, visualmente dominante */}
                            <div className="f-field">
                                <label className="f-label" htmlFor="carrera">
                                    Nombre de la carrera <span className="f-req">*</span>
                                </label>
                                <div className="f-input-wrap">
                                    <input
                                        id="carrera" name="carrera" type="text" required
                                        value={form.carrera} onChange={handleChange}
                                        placeholder="Ej: Ingeniería Informática"
                                        className="f-input f-input--lg"
                                        autoComplete="off"
                                    />
                                    {form.carrera.trim() && (
                                        <span className="f-input-tick">
                                            <Check className="w-3.5 h-3.5" />
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Universidad */}
                            <div className="f-field">
                                <label className="f-label" htmlFor="universidad">
                                    Universidad <span className="f-req">*</span>
                                </label>
                                <div className="f-input-wrap">
                                    <input
                                        id="universidad" name="universidad" type="text" required
                                        value={form.universidad} onChange={handleChange}
                                        placeholder="Ej: Universidad Nacional de San Martín"
                                        className="f-input f-input--lg"
                                        autoComplete="off"
                                    />
                                    {form.universidad.trim() && (
                                        <span className="f-input-tick">
                                            <Check className="w-3.5 h-3.5" />
                                        </span>
                                    )}
                                </div>
                            </div>

                            {errorDuplicado && (
                                <div className="f-error-box" role="alert">
                                    <X className="w-4 h-4 flex-shrink-0" />
                                    <span>{errorDuplicado}</span>
                                </div>
                            )}

                            {/* Fila 2 col: facultad + descripción */}
                            <div className="f-row-2">
                                <div className="f-field">
                                    <label className="f-label" htmlFor="unidadAcademica">
                                        Facultad / Unidad Académica
                                        <span className="f-opt">opcional</span>
                                    </label>
                                    <p className="f-hint">Ej: "Facultad de Ciencias Exactas"</p>
                                    <input
                                        id="unidadAcademica" name="unidadAcademica" type="text"
                                        value={form.unidadAcademica} onChange={handleChange}
                                        placeholder="Ej: Escuela de Ciencia y Tecnología"
                                        className="f-input"
                                    />
                                </div>
                                <div className="f-field">
                                    <label className="f-label" htmlFor="descripcion">
                                        Descripción breve
                                        <span className="f-opt">opcional</span>
                                    </label>
                                    <p className="f-hint">Aparece en búsquedas. Máx. 300 caracteres.</p>
                                    <div style={{ position: "relative" }}>
                                        <textarea
                                            id="descripcion" name="descripcion"
                                            rows={3} maxLength={300}
                                            value={form.descripcion} onChange={handleChange}
                                            placeholder="Describí brevemente la carrera..."
                                            className="f-input f-textarea"
                                        />
                                        <span className={`f-charcount ${form.descripcion.length > 260 ? "f-charcount--warn" : ""}`}>
                                            {form.descripcion.length}/300
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── SECCIÓN II — Acceso ── */}
                <section className="f-section">
                    <div className="f-section-aside" aria-hidden>
                        <span className="f-aside-num f-aside-num--II">II</span>
                        <span className="f-aside-rule" />
                    </div>
                    <div className="f-section-card f-section-card--II">
                        <div className="f-section-head">
                            <h2 className="f-section-title">Política de acceso</h2>
                            <p className="f-section-sub">Definí cómo se incorporan los estudiantes. Podés cambiarlo después.</p>
                        </div>

                        <div className="f-acceso-grid">
                            {/* CERRADO — recomendado */}
                            <button type="button"
                                onClick={() => setForm(p => ({ ...p, tipoAcceso: "CERRADO" }))}
                                className={`f-acceso-card f-acceso-card--cerrado ${form.tipoAcceso === "CERRADO" ? "f-acceso-card--on" : ""}`}
                                aria-pressed={form.tipoAcceso === "CERRADO"}>
                                {form.tipoAcceso === "CERRADO" && (
                                    <span className="f-acceso-tick f-acceso-tick--cerrado"><Check className="w-3 h-3" /></span>
                                )}
                                <div className={`f-acceso-icon ${form.tipoAcceso === "CERRADO" ? "f-acceso-icon--cerrado-on" : "f-acceso-icon--cerrado"}`}>
                                    <Lock className="w-5 h-5" />
                                </div>
                                <div className="f-acceso-text">
                                    <strong className="f-acceso-name">
                                        Solicitud requerida
                                        <span className="f-rec-pill">Recomendado</span>
                                    </strong>
                                    <p className="f-acceso-desc">Los estudiantes envían una solicitud que vos aprobás. Más control sobre quién entra.</p>
                                </div>
                            </button>

                            {/* ABIERTO */}
                            <button type="button"
                                onClick={() => setForm(p => ({ ...p, tipoAcceso: "ABIERTO" }))}
                                className={`f-acceso-card f-acceso-card--abierto ${form.tipoAcceso === "ABIERTO" ? "f-acceso-card--on" : ""}`}
                                aria-pressed={form.tipoAcceso === "ABIERTO"}>
                                {form.tipoAcceso === "ABIERTO" && (
                                    <span className="f-acceso-tick f-acceso-tick--abierto"><Check className="w-3 h-3" /></span>
                                )}
                                <div className={`f-acceso-icon ${form.tipoAcceso === "ABIERTO" ? "f-acceso-icon--abierto-on" : "f-acceso-icon--abierto"}`}>
                                    <Globe className="w-5 h-5" />
                                </div>
                                <div className="f-acceso-text">
                                    <strong className="f-acceso-name">Entrada libre</strong>
                                    <p className="f-acceso-desc">Cualquier estudiante puede unirse de inmediato, sin aprobación previa.</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </section>

                {/* ── SECCIÓN III — Visual ── */}
                <section className="f-section">
                    <div className="f-section-aside" aria-hidden>
                        <span className="f-aside-num f-aside-num--III">III</span>
                    </div>
                    <div className="f-section-card f-section-card--III">
                        <div className="f-section-head">
                            <h2 className="f-section-title">
                                Identidad visual
                                <span className="f-opt" style={{ fontWeight: 400 }}>opcional</span>
                            </h2>
                            <p className="f-section-sub">Ícono y color que aparecen en búsquedas, notificaciones y el feed de tus compañeros.</p>
                        </div>

                        {/* Tabs */}
                        <div className="f-tabs" role="tablist">
                            <button type="button" role="tab"
                                aria-selected={modoVisual === "icono"}
                                onClick={() => setModoVisual("icono")}
                                className={`f-tab ${modoVisual === "icono" ? "f-tab--on" : ""}`}>
                                <Palette className="w-3.5 h-3.5" /> Ícono y color
                            </button>
                            <button type="button" role="tab"
                                aria-selected={modoVisual === "imagen"}
                                onClick={() => setModoVisual("imagen")}
                                className={`f-tab ${modoVisual === "imagen" ? "f-tab--on" : ""}`}>
                                <Upload className="w-3.5 h-3.5" /> Subir imagen
                            </button>
                        </div>

                        {/* ── Panel ícono + color ── */}
                        {modoVisual === "icono" && (
                            <div className="f-visual-panel">

                                {/* COLOR PICKER — el corazón del diseño de esta sección */}
                                <div className="f-color-block">
                                    <div className="f-color-header">
                                        <label className="f-label">Color del portal</label>
                                        {/* Chip de color actual — tipografía mono */}
                                        <div className="f-color-current">
                                            <div className="f-color-current-dot"
                                                style={{ background: colorSeleccionado }} />
                                            <code className="f-color-current-code">
                                                #{hexInput.toUpperCase() || "------"}
                                            </code>
                                        </div>
                                    </div>

                                    {/* Grid de swatches — más grandes, con hover 3D */}
                                    <div className="f-palette" role="radiogroup" aria-label="Colores predefinidos">
                                        {COLORES_PRESET.map(({ hex, label }) => {
                                            const active = colorSeleccionado === hex;
                                            return (
                                                <button key={hex} type="button"
                                                    role="radio" aria-checked={active} aria-label={label}
                                                    onClick={() => setColor(hex)}
                                                    className={`f-swatch ${active ? "f-swatch--on" : ""}`}
                                                    style={{ "--sw": hex } as React.CSSProperties}>
                                                    <span className="f-swatch-fill" style={{ background: hex }} />
                                                    {active && (
                                                        <Check className="f-swatch-check"
                                                            style={{ color: textOn(hex) }} />
                                                    )}
                                                    <span className="f-swatch-tip">{label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Fila hex — diseño "terminal académico" */}
                                    <div className="f-hex-row">
                                        {/* Preview grande */}
                                        <div className="f-hex-preview"
                                            style={{ background: colorSeleccionado }} />
                                        {/* Input mono */}
                                        <div className={`f-hex-field ${hexError ? "f-hex-field--err" : ""}`}>
                                            <span className="f-hex-hash">#</span>
                                            <input
                                                type="text" value={hexInput}
                                                onChange={e => handleHexInput(e.target.value)}
                                                maxLength={6} placeholder="2c4456"
                                                className="f-hex-in"
                                                spellCheck={false}
                                                aria-label="Código hexadecimal"
                                                aria-invalid={hexError}
                                            />
                                        </div>
                                        {/* Cuentagotas */}
                                        <label className="f-eyedrop" title="Abrir selector del sistema"
                                            aria-label="Abrir selector de color">
                                            <Pipette className="w-4 h-4" />
                                            <input ref={colorInputRef} type="color"
                                                value={colorSeleccionado}
                                                onChange={e => setColor(e.target.value)}
                                                className="sr-only" />
                                        </label>
                                    </div>
                                    {hexError && (
                                        <p className="f-hex-err" role="alert">
                                            Ingresá 6 caracteres hexadecimales válidos (ej: 2c4456)
                                        </p>
                                    )}
                                </div>

                                {/* Divisor seccionador */}
                                <div className="f-divider"><span>Ícono del portal</span></div>

                                {/* BUSCADOR + GRID */}
                                <div className="f-icon-block">
                                    <div className="f-search-wrap">
                                        <Search className="f-search-icon" />
                                        <input type="text"
                                            placeholder="Buscar ícono..."
                                            value={busquedaIcono}
                                            onChange={e => setBusquedaIcono(e.target.value)}
                                            className="f-search-input"
                                            aria-label="Buscar ícono" />
                                        {busquedaIcono && (
                                            <button type="button" onClick={() => setBusquedaIcono("")}
                                                className="f-search-clear" aria-label="Limpiar">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="f-icon-browser" role="listbox">
                                        {resultadosBusqueda !== null ? (
                                            resultadosBusqueda.length > 0 ? (
                                                <div className="f-icon-grid">
                                                    {resultadosBusqueda.map(({ value, label, Icon }) => (
                                                        <IconBtn key={value} value={value} label={label} Icon={Icon}
                                                            selected={iconoSeleccionado === value}
                                                            color={colorSeleccionado} onSelect={setIconoSeleccionado} />
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="f-icon-empty">
                                                    <Search className="w-7 h-7 opacity-15" />
                                                    <span>Sin resultados para "<strong>{busquedaIcono}</strong>"</span>
                                                </div>
                                            )
                                        ) : (
                                            CATEGORIAS_ICONOS.map(cat => (
                                                <div key={cat.label} className="f-icon-cat">
                                                    <p className="f-icon-cat-label">{cat.label}</p>
                                                    <div className="f-icon-grid">
                                                        {cat.iconos.map(({ value, label, Icon }) => (
                                                            <IconBtn key={value} value={value} label={label} Icon={Icon}
                                                                selected={iconoSeleccionado === value}
                                                                color={colorSeleccionado} onSelect={setIconoSeleccionado} />
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Panel imagen ── */}
                        {modoVisual === "imagen" && (
                            <div className="f-visual-panel">
                                {imagenPreviewUrl ? (
                                    <div className="f-img-row">
                                        <div className="f-img-frame"
                                            style={{ borderColor: `${colorSeleccionado}50` }}>
                                            <img src={imagenPreviewUrl} alt="Preview" className="f-img-thumb" />
                                        </div>
                                        <div className="f-img-meta">
                                            <p className="f-img-name">{imagenFile?.name}</p>
                                            <p className="f-hint">Se usará como logo del portal.</p>
                                            <button type="button" onClick={handleQuitarImagen} className="f-img-remove">
                                                <X className="w-3.5 h-3.5" /> Quitar imagen
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="f-upload-zone">
                                        <div className="f-upload-icon"><Upload className="w-6 h-6" /></div>
                                        <span className="f-upload-primary">Hacé clic o arrastrá una imagen</span>
                                        <span className="f-upload-secondary">PNG, JPG, WEBP — máx. 2 MB</span>
                                    </button>
                                )}
                                <input ref={fileInputRef} type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    onChange={handleImagenChange} className="sr-only" />
                                <p className="f-hint" style={{ marginTop: ".4rem" }}>
                                    Si no subís imagen, el portal usa el ícono predeterminado.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* ── Acciones ── */}
                <div className="f-actions">
                    <button type="submit" disabled={!canSubmit} className="f-btn-submit">
                        {loading
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Creando portal…</>
                            : <><Sparkles className="w-4 h-4" /> Fundar portal</>
                        }
                    </button>
                    <button type="button" onClick={() => navigate("/home")} className="f-btn-cancel">
                        Cancelar
                    </button>
                </div>
            </form>

            {/* ── SIDEBAR sticky ── */}
            <aside className="f-sidebar" aria-label="Resumen y progreso">
                <div className="f-sidebar-inner">

                    <div className="f-sb-preview">
                        <div className="f-sb-stripe"
                            style={{ background: previewColor ?? "#2c4456" }} />
                        <div className="f-sb-body">
                            <PortalAvatar
                                logoUrl={previewLogoUrl}
                                iconoPortal={previewIcono}
                                colorPortal={previewColor}
                                carrera={form.carrera || "Portal"}
                                size="md"
                            />
                            <div className="f-sb-meta">
                                <p className="f-sb-name">
                                    {form.carrera || <span className="f-ghost">Nombre de la carrera</span>}
                                </p>
                                <p className="f-sb-uni">
                                    {form.universidad || <span className="f-ghost">Universidad</span>}
                                </p>
                                {form.unidadAcademica && <p className="f-sb-faculty">{form.unidadAcademica}</p>}
                                {form.descripcion && <p className="f-sb-desc">{form.descripcion}</p>}
                            </div>
                        </div>
                        <div className="f-sb-foot">
                            <span className={`f-access-chip ${form.tipoAcceso === "ABIERTO" ? "f-access-chip--open" : "f-access-chip--closed"}`}>
                                <AccesoIcon className="w-3 h-3" />
                                {form.tipoAcceso === "ABIERTO" ? "Acceso libre" : "Solicitud requerida"}
                            </span>
                        </div>
                    </div>

                    {/* Checklist */}
                    <div className="f-sb-checklist">
                        <p className="f-sb-checklist-title">Progreso</p>
                        <ul>
                            {[
                                { label: "Nombre de la carrera", done: !!form.carrera.trim() },
                                { label: "Universidad",           done: !!form.universidad.trim() },
                                { label: "Tipo de acceso",        done: true },
                                { label: "Identidad visual",      done: modoVisual === "icono" || !!imagenPreviewUrl },
                                { label: "Facultad",              done: !!form.unidadAcademica.trim(), opt: true },
                                { label: "Descripción",           done: !!form.descripcion.trim(), opt: true },
                            ].map(({ label, done, opt }) => (
                                <li key={label} className={`f-chk-item ${done ? "f-chk-item--done" : ""}`}>
                                    <span className="f-chk-dot">{done && <Check className="w-2.5 h-2.5" />}</span>
                                    <span>{label}{opt && <em className="f-chk-opt"> — opcional</em>}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="f-sb-note">
                        <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                        <p>Podés editar toda esta información desde la configuración del portal una vez creado.</p>
                    </div>
                </div>
            </aside>
        </div>


        {/* ═══════════════════════ ESTILOS ═══════════════════════ */}
        <style>{`

/* ── Tokens de diseño ── */
.cp-root, .f-header, .f-body {
    --c-navy:       #1e3448;
    --c-navy-mid:   #2c4456;
    --c-navy-lite:  #3a6080;
    --c-amber:      #b87d12;
    --c-amber-bg:   rgba(184,125,18,.1);
    --c-green:      #0d6e50;
    --c-green-bg:   rgba(13,110,80,.1);
    --c-red:        #b91c1c;
    --c-paper:      #f6f2ec;
    --c-paper-2:    #f0ebe3;
    --c-ruled:      rgba(26,37,48,.052);
    --c-margin:     rgba(200,30,60,.13);
    --c-ink:        #16202a;
    --c-ink-mid:    #344a58;
    --c-ink-soft:   #5a7080;
    --c-ink-ghost:  #8fa8b5;
    --c-surface:    #ffffff;
    --c-surface-2:  #f6f2ec;
    --c-border:     rgba(26,37,48,.1);
    --c-border-mid: rgba(26,37,48,.2);
    --sh-card:      0 1px 3px rgba(26,37,48,.07),
                    0 4px 18px rgba(26,37,48,.08),
                    0 0 0 1px rgba(26,37,48,.055);
    --sh-lift:      0 4px 24px rgba(26,37,48,.15),
                    0 0 0 1px rgba(26,37,48,.07);
    --r:            .85rem;
    --r-sm:         .45rem;
    --r-pill:       999px;
    font-family: 'Inter', system-ui, sans-serif;
}
/* Página completa */
.cp-root {
    background: var(--c-paper);
    min-height: 100vh;
}

/* ══════════════════════════════════════════
   HEADER — papel de atelieur académico
   No un hero dark. Luz cálida, carácter
   tipográfico, sin fondos negros genéricos.
   ══════════════════════════════════════════ */
.f-header {
    position: relative;
    background: #f9f5ee;
    border-bottom: 1.5px solid #e6dfd4;
    overflow: hidden;
    padding-bottom: 0;
}

/* Textura de papel — noise SVG inline */
.f-paper-texture {
    position: absolute; inset: 0; pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
    opacity: .03; mix-blend-mode: multiply;
}
/* Líneas de cuaderno — 32px pitch */
.f-ruled {
    position: absolute; inset: 0; pointer-events: none;
    background-image: repeating-linear-gradient(
        to bottom,
        transparent 0px, transparent 31px,
        var(--c-ruled) 31px, var(--c-ruled) 32px
    );
}
/* Margen rojo clásico */
.f-margin {
    position: absolute; top: 0; bottom: 0; left: 88px;
    width: 1.5px; background: var(--c-margin);
    pointer-events: none;
}
/* Manchas de tinta decorativas — atmosfera */
.f-ink {
    position: absolute; border-radius: 50%;
    filter: blur(52px); pointer-events: none;
}
.f-ink-a {
    width: 360px; height: 280px;
    top: -120px; right: 8%;
    background: radial-gradient(ellipse, rgba(184,125,18,.11) 0%, transparent 70%);
}
.f-ink-b {
    width: 280px; height: 180px;
    bottom: -70px; left: -40px;
    background: radial-gradient(ellipse, rgba(44,68,86,.09) 0%, transparent 70%);
}

.f-header-inner {
    position: relative;
    display: flex; flex-direction: column;
    padding-top: 2.1rem;
    gap: 0;
}

/* Breadcrumb — discreto, textual */
.f-back {
    display: inline-flex; align-items: center; gap: .4rem;
    font-size: .71rem; font-weight: 700; letter-spacing: .07em;
    text-transform: uppercase; color: var(--c-ink-ghost);
    background: none; border: none; cursor: pointer; padding: 0;
    margin-bottom: 1.8rem; width: fit-content;
    transition: color .14s;
}
.f-back:hover { color: var(--c-navy-mid); }

/* Grid del header */
.f-header-grid {
    display: grid;
    grid-template-columns: 1fr 290px;
    gap: 3rem;
    align-items: start;
    padding-bottom: 2rem;
}
@media (max-width: 800px) {
    .f-header-grid { grid-template-columns: 1fr; gap: 1.5rem; }
}

/* Columna copy */
.f-copy { max-width: 500px; }

/* Número de folio — alusión a libros académicos */
.f-folio {
    display: flex; align-items: center; gap: .6rem;
    margin-bottom: 1rem;
    font-size: .68rem; font-weight: 700;
    letter-spacing: .1em; text-transform: uppercase;
    color: var(--c-ink-ghost);
}
.f-folio-n {
    font-family: 'Georgia', 'Times New Roman', serif;
    font-style: italic; font-size: .85rem;
    color: var(--c-amber); font-weight: 700;
}
.f-folio-line {
    height: 1px; width: 22px; background: #c8bfb3; flex-shrink: 0;
}

/* TÍTULO — la joya del header */
/* Serif + escala dramática. No bold-sans-oscuro-genérico. */
.f-title {
    font-family: 'Georgia', 'Times New Roman', serif;
    line-height: 1.0; letter-spacing: -.025em;
    margin: 0 0 1rem; color: var(--c-ink);
}
.f-title-verb {
    display: block;
    font-size: clamp(2rem, 4.5vw, 3rem);
    font-weight: 400;
    color: var(--c-ink-mid);
}
.f-title-noun {
    display: block;
    font-size: clamp(3rem, 7vw, 5rem);
    font-weight: 700;
    font-style: italic;
    color: var(--c-navy);
    /* Sombra de tinta — textura */
    text-shadow:
        2px 2px 0 rgba(26,37,48,.06),
        4px 4px 12px rgba(26,37,48,.05);
}

.f-subtitle {
    font-size: .95rem; color: var(--c-ink-soft);
    line-height: 1.75; margin: 0 0 1.6rem;
    max-width: 410px;
}

/* Índice de secciones — inspirado en tabla de contenidos */
.f-index {
    list-style: none; padding: 0; margin: 0;
    display: flex; flex-direction: column; gap: .5rem;
}
.f-index-item {
    display: flex; align-items: center; gap: .55rem;
    font-size: .79rem; font-weight: 500; color: var(--c-ink-soft);
    transition: color .15s;
}
.f-index-item--done { color: var(--c-ink); }
.f-index-n {
    font-family: 'Georgia', serif; font-style: italic;
    font-size: .8rem; font-weight: 700;
    color: var(--c-navy-mid); width: 22px; flex-shrink: 0;
}
.f-index-dot {
    flex: 1; border-bottom: 1.5px dotted #c8bfb3; max-width: 40px;
}
.f-index-label { flex: 1; }
.f-index-check {
    color: var(--c-green);
}

/* Preview card en el header */
.f-preview-wrap {
    display: flex; flex-direction: column; gap: .55rem;
    animation: fIn .5s .1s cubic-bezier(.16,1,.3,1) both;
}
.f-preview-label {
    font-size: .67rem; font-weight: 700; letter-spacing: .08em;
    text-transform: uppercase; color: var(--c-ink-ghost);
    display: flex; align-items: center; gap: .4rem;
}
.f-preview-live {
    background: var(--c-green); color: white;
    font-size: .6rem; padding: .1rem .4rem;
    border-radius: var(--r-pill); letter-spacing: .06em;
}
.f-preview-card {
    background: var(--c-surface);
    border-radius: var(--r);
    box-shadow: var(--sh-card);
    overflow: hidden;
    border: 1px solid var(--c-border);
    transition: box-shadow .2s;
}
.f-preview-card:hover { box-shadow: var(--sh-lift); }
.f-preview-stripe { height: 4px; transition: background .3s; }
.f-preview-body {
    display: flex; align-items: center; gap: .85rem;
    padding: .9rem 1rem;
}
.f-preview-avatar {
    width: 48px; height: 48px; border-radius: .55rem;
    border: 1.5px solid; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    transition: background .3s, border-color .3s;
}
.f-preview-meta { flex: 1; min-width: 0; }
.f-preview-name {
    font-size: .88rem; font-weight: 700; color: var(--c-ink);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    margin: 0 0 .08rem;
}
.f-preview-uni {
    font-size: .73rem; color: var(--c-ink-soft);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0;
}
.f-preview-faculty { font-size: .68rem; color: var(--c-ink-ghost); margin: 0; }
.f-ghost { font-style: italic; color: var(--c-ink-ghost); font-weight: 400; }
.f-preview-foot {
    padding: .4rem 1rem .65rem;
    border-top: 1px solid rgba(26,37,48,.05);
}

/* Chips de acceso */
.f-access-chip {
    display: inline-flex; align-items: center; gap: .3rem;
    padding: .22rem .6rem; border-radius: var(--r-pill);
    font-size: .67rem; font-weight: 700; letter-spacing: .03em;
    transition: all .2s;
}
.f-access-chip--open  { background: rgba(13,110,80,.1);  color: #0a5a3e; border: 1px solid rgba(13,110,80,.2); }
.f-access-chip--closed { background: rgba(184,125,18,.1); color: #7a5000; border: 1px solid rgba(184,125,18,.2); }

/* Checklist compacto en header */
.f-checks {
    list-style: none; padding: 0; margin: 0;
    display: grid; grid-template-columns: 1fr 1fr; gap: .3rem .5rem;
}
.f-check-item {
    display: flex; align-items: center; gap: .35rem;
    font-size: .72rem; color: var(--c-ink-ghost); font-weight: 500;
}
.f-check-item--done { color: var(--c-ink-soft); }
.f-check-box {
    width: 14px; height: 14px; border-radius: 50%;
    border: 1.5px solid var(--c-border-mid);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; color: white;
    transition: background .15s, border-color .15s;
}
.f-check-item--done .f-check-box { background: var(--c-green); border-color: var(--c-green); }

/* Barra de progreso */
.f-progress {
    display: flex; align-items: center; gap: .85rem;
    padding: 0 0 .5rem;
    margin-top: .25rem;
}
.f-progress-bar {
    flex: 1; height: 2.5px;
    background: rgba(26,37,48,.1); border-radius: 3px; overflow: hidden;
}
.f-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--c-navy-mid), var(--c-amber));
    border-radius: 3px;
    transition: width .5s cubic-bezier(.25,.8,.25,1);
    min-width: 4px;
}
.f-progress-label {
    font-size: .66rem; font-weight: 700; letter-spacing: .06em;
    text-transform: uppercase; color: var(--c-ink-ghost);
    white-space: nowrap; flex-shrink: 0;
}

/* Animación de entrada */
@keyframes fIn {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
}

/* ══════════════════════════════════════════
   BODY — layout 2 columnas
   ══════════════════════════════════════════ */
.f-body {
    display: grid;
    grid-template-columns: 1fr 292px;
    gap: 2.5rem;
    align-items: start;
}
@media (max-width: 920px) {
    .f-body { grid-template-columns: 1fr; }
    .f-sidebar { order: -1; }
}

.f-form { display: flex; flex-direction: column; gap: 0; }

/* ══════════════════════════════════════════
   SECCIONES — libro de actas
   Cada sección es un "capítulo" con número
   romano lateral y borde cromático.
   ══════════════════════════════════════════ */
.f-section {
    display: flex; gap: 1.1rem;
    margin-bottom: 1.75rem;
    animation: fIn .4s cubic-bezier(.16,1,.3,1) both;
}
.f-section:nth-child(2) { animation-delay: .06s; }
.f-section:nth-child(3) { animation-delay: .12s; }
.f-section:nth-child(4) { animation-delay: .18s; }

/* Canaleta lateral */
.f-section-aside {
    display: flex; flex-direction: column;
    align-items: center; width: 32px; flex-shrink: 0;
    padding-top: 1.1rem;
}
.f-aside-num {
    font-family: 'Georgia', serif; font-style: italic;
    font-size: .8rem; font-weight: 700;
    width: 26px; height: 26px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
}
.f-aside-num--I   { background: rgba(26,37,48,.09);  color: var(--c-navy-mid); }
.f-aside-num--II  { background: rgba(184,125,18,.12); color: #7a5000; }
.f-aside-num--III { background: rgba(13,110,80,.1);   color: var(--c-green); }
.f-aside-rule {
    flex: 1; width: 1.5px; background: var(--c-border);
    margin-top: .4rem; border-radius: 2px;
}
.f-section:last-of-type .f-aside-rule { display: none; }

/* Card de la sección */
.f-section-card {
    flex: 1; background: var(--c-surface);
    border-radius: var(--r); box-shadow: var(--sh-card);
    overflow: hidden;
}
.f-section-card--I   { border-left: 3px solid var(--c-navy-mid); }
.f-section-card--II  { border-left: 3px solid var(--c-amber); }
.f-section-card--III { border-left: 3px solid var(--c-green); }

/* Cabecera de la card */
.f-section-head {
    padding: 1.1rem 1.4rem .85rem;
    border-bottom: 1px solid rgba(26,37,48,.055);
}
.f-section-title {
    font-family: 'Work Sans', sans-serif;
    font-size: 1rem; font-weight: 700; color: var(--c-ink);
    margin: 0 0 .15rem;
    display: flex; align-items: center; gap: .5rem;
}
.f-section-sub { font-size: .77rem; color: var(--c-ink-soft); margin: 0; line-height: 1.6; }

/* ══════════════════════════════════════════
   CAMPOS
   ══════════════════════════════════════════ */
.f-fields {
    display: flex; flex-direction: column; gap: 1.15rem;
    padding: 1.25rem 1.4rem 1.4rem;
}
.f-row-2 {
    display: grid; grid-template-columns: 1fr 1fr; gap: 1.15rem;
}
@media (max-width: 640px) { .f-row-2 { grid-template-columns: 1fr; } }
.f-field { display: flex; flex-direction: column; gap: .3rem; }

.f-label {
    font-size: .79rem; font-weight: 700; color: var(--c-ink);
    display: flex; align-items: center; gap: .35rem;
}
.f-req { color: #b91c1c; }
.f-opt {
    font-size: .68rem; font-weight: 500; color: var(--c-ink-ghost);
    background: rgba(26,37,48,.05); border-radius: var(--r-pill);
    padding: .1rem .44rem; margin-left: .15rem;
}
.f-hint { font-size: .73rem; color: var(--c-ink-soft); line-height: 1.5; margin: 0; }

.f-input-wrap { position: relative; }
.f-input {
    width: 100%; padding: .7rem .92rem;
    font-size: .9rem; font-family: inherit;
    background: var(--c-surface-2);
    border: 1.5px solid var(--c-border);
    border-radius: var(--r-sm); color: var(--c-ink); outline: none;
    transition: border-color .13s, box-shadow .13s, background .13s;
}
.f-input:hover { border-color: var(--c-border-mid); }
.f-input:focus {
    border-color: var(--c-navy-mid);
    box-shadow: 0 0 0 3px rgba(44,68,86,.11);
    background: var(--c-surface);
}
.f-input--lg { font-size: .95rem; padding: .82rem 2.6rem .82rem 1rem; }
.f-textarea { resize: none; line-height: 1.6; }
/* Tick verde cuando campo válido */
.f-input-tick {
    position: absolute; right: .78rem; top: 50%; transform: translateY(-50%);
    width: 20px; height: 20px; border-radius: 50%;
    background: var(--c-green); color: white;
    display: flex; align-items: center; justify-content: center;
    animation: tickPop .2s cubic-bezier(.16,1,.3,1) both;
}
@keyframes tickPop {
    from { opacity: 0; transform: translateY(-50%) scale(.5); }
    to   { opacity: 1; transform: translateY(-50%) scale(1); }
}
.f-charcount {
    position: absolute; bottom: .52rem; right: .75rem;
    font-size: .67rem; color: var(--c-ink-ghost); pointer-events: none;
}
.f-charcount--warn { color: var(--c-amber); font-weight: 700; }
.f-error-box {
    display: flex; align-items: flex-start; gap: .55rem;
    padding: .7rem .9rem;
    background: rgba(185,28,28,.06);
    border: 1px solid rgba(185,28,28,.18);
    border-radius: var(--r-sm);
    font-size: .82rem; font-weight: 600; color: #991b1b; line-height: 1.5;
}

/* ══════════════════════════════════════════
   ACCESO — cards decisivas
   ══════════════════════════════════════════ */
.f-acceso-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: .85rem; padding: 1.1rem 1.4rem 1.35rem;
}
@media (max-width: 540px) { .f-acceso-grid { grid-template-columns: 1fr; } }

.f-acceso-card {
    position: relative;
    display: flex; flex-direction: column;
    align-items: flex-start; gap: .6rem;
    padding: 1.1rem 1rem;
    border: 1.5px solid var(--c-border);
    border-radius: var(--r);
    background: var(--c-surface-2);
    cursor: pointer; text-align: left;
    transition: border-color .14s, background .14s, box-shadow .14s, transform .14s;
}
.f-acceso-card:hover {
    border-color: var(--c-border-mid);
    transform: translateY(-1px); box-shadow: var(--sh-card);
}
.f-acceso-card--on { transform: translateY(-2px); }
.f-acceso-card--cerrado.f-acceso-card--on {
    border-color: var(--c-amber);
    background: rgba(184,125,18,.04);
    box-shadow: 0 0 0 3px rgba(184,125,18,.1), var(--sh-card);
}
.f-acceso-card--abierto.f-acceso-card--on {
    border-color: var(--c-green);
    background: rgba(13,110,80,.04);
    box-shadow: 0 0 0 3px rgba(13,110,80,.1), var(--sh-card);
}
.f-acceso-tick {
    position: absolute; top: .6rem; right: .6rem;
    width: 18px; height: 18px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center; color: white;
}
.f-acceso-tick--cerrado { background: var(--c-amber); }
.f-acceso-tick--abierto { background: var(--c-green); }
.f-acceso-icon {
    width: 40px; height: 40px; border-radius: .5rem;
    display: flex; align-items: center; justify-content: center;
    transition: background .14s, color .14s;
}
.f-acceso-icon--cerrado        { background: rgba(184,125,18,.12); color: var(--c-amber); }
.f-acceso-icon--cerrado-on     { background: var(--c-amber); color: white; }
.f-acceso-icon--abierto        { background: rgba(13,110,80,.1);  color: var(--c-green); }
.f-acceso-icon--abierto-on     { background: var(--c-green); color: white; }
.f-acceso-text { display: flex; flex-direction: column; gap: .3rem; }
.f-acceso-name {
    font-size: .9rem; font-weight: 700; color: var(--c-ink);
    display: flex; align-items: center; gap: .5rem; flex-wrap: wrap;
}
.f-rec-pill {
    font-size: .61rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase;
    padding: .12rem .46rem; border-radius: var(--r-pill);
    background: rgba(184,125,18,.13); border: 1px solid rgba(184,125,18,.28); color: #7a5000;
}
.f-acceso-desc { font-size: .76rem; color: var(--c-ink-soft); line-height: 1.55; margin: 0; }

/* ══════════════════════════════════════════
   VISUAL — tabs, color picker, icons
   ══════════════════════════════════════════ */
.f-tabs {
    display: flex; gap: 2px;
    background: rgba(26,37,48,.05); border-radius: var(--r-sm);
    padding: 3px; margin: 0 1.4rem .1rem;
}
.f-tab {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: .4rem;
    padding: .5rem .7rem; border-radius: calc(var(--r-sm) - 1px);
    font-size: .8rem; font-weight: 600; color: var(--c-ink-soft);
    border: none; background: transparent; cursor: pointer; transition: all .13s;
}
.f-tab--on {
    background: var(--c-surface); color: var(--c-ink);
    box-shadow: 0 1px 4px rgba(26,37,48,.1);
}

.f-visual-panel {
    display: flex; flex-direction: column; gap: 1.15rem;
    padding: 1rem 1.4rem 1.4rem;
}

/* ═══ COLOR PICKER ═══ */
.f-color-block { display: flex; flex-direction: column; gap: .85rem; }
.f-color-header {
    display: flex; align-items: center;
    justify-content: space-between; gap: 1rem;
}
/* Chip con código de color actual */
.f-color-current {
    display: flex; align-items: center; gap: .5rem;
    background: var(--c-surface-2);
    border: 1.5px solid var(--c-border);
    border-radius: var(--r-pill);
    padding: .28rem .65rem .28rem .38rem;
}
.f-color-current-dot {
    width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0;
    box-shadow: 0 1px 4px rgba(0,0,0,.2);
    transition: background .25s;
}
.f-color-current-code {
    font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
    font-size: .76rem; font-weight: 700; color: var(--c-ink-mid);
    letter-spacing: .08em; text-transform: uppercase;
}

/* Paleta de swatches — grid 6 col, swatches grandes con hover 3D */
.f-palette {
    display: grid; grid-template-columns: repeat(6, 1fr);
    gap: .5rem;
}
.f-swatch {
    position: relative; aspect-ratio: 1;
    border-radius: .6rem; border: 2.5px solid transparent;
    cursor: pointer; overflow: hidden;
    transition: transform .12s cubic-bezier(.16,1,.3,1),
                box-shadow .12s, border-color .12s;
    box-shadow:
        0 1px 4px rgba(0,0,0,.2),
        inset 0 1px 0 rgba(255,255,255,.18);
}
@media (hover: hover) and (pointer: fine) {
    .f-swatch:hover {
        transform: scale(1.18) translateY(-2px);
        box-shadow: 0 6px 18px rgba(0,0,0,.3),
                    inset 0 1px 0 rgba(255,255,255,.2);
        z-index: 2;
    }
}
.f-swatch--on {
    border-color: rgba(255,255,255,.9);
    box-shadow:
        0 0 0 2.5px rgba(0,0,0,.55),
        0 4px 14px rgba(0,0,0,.3);
    transform: scale(1.1) translateY(-1px);
    z-index: 3;
}
.f-swatch-fill {
    display: block; width: 100%; height: 100%;
    border-radius: calc(.6rem - 2.5px);
}
.f-swatch-check {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    width: 100%; height: 100%;
    font-size: 13px;
}
/* Tooltip del swatch */
.f-swatch-tip {
    position: absolute; bottom: calc(100% + 6px); left: 50%;
    transform: translateX(-50%) scale(.88);
    background: rgba(16,24,32,.92); color: #fff;
    font-size: .61rem; font-weight: 600; letter-spacing: .04em;
    padding: .2rem .48rem; border-radius: .3rem;
    white-space: nowrap; pointer-events: none; opacity: 0;
    transition: opacity .11s, transform .11s;
}
.f-swatch:hover .f-swatch-tip { opacity: 1; transform: translateX(-50%) scale(1); }

/* Fila hex — terminal académico */
.f-hex-row { display: flex; align-items: center; gap: .6rem; }
.f-hex-preview {
    width: 40px; height: 40px; border-radius: .5rem; flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(0,0,0,.2), inset 0 1px 0 rgba(255,255,255,.12);
    transition: background .25s;
}
.f-hex-field {
    flex: 1; display: flex; align-items: center;
    background: var(--c-surface-2);
    border: 1.5px solid var(--c-border);
    border-radius: var(--r-sm); overflow: hidden;
    transition: border-color .13s;
}
.f-hex-field:focus-within {
    border-color: var(--c-navy-mid);
    box-shadow: 0 0 0 3px rgba(44,68,86,.1);
}
.f-hex-field--err { border-color: var(--c-red) !important; }
.f-hex-hash {
    padding: .58rem .4rem .58rem .8rem;
    font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
    font-size: .9rem; font-weight: 700; color: var(--c-ink-ghost);
}
.f-hex-in {
    border: none; outline: none; background: transparent;
    font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
    font-size: .9rem; font-weight: 700; color: var(--c-ink);
    letter-spacing: .07em; text-transform: uppercase;
    padding: .58rem .8rem .58rem 0; width: 100%;
}
/* Botón cuentagotas */
.f-eyedrop {
    display: flex; align-items: center; justify-content: center;
    width: 40px; height: 40px; flex-shrink: 0;
    border-radius: var(--r-sm);
    border: 1.5px solid var(--c-border);
    background: var(--c-surface-2);
    color: var(--c-ink-soft); cursor: pointer;
    transition: border-color .13s, color .13s, background .13s;
}
.f-eyedrop:hover {
    border-color: var(--c-navy-mid); color: var(--c-navy-mid);
    background: rgba(44,68,86,.06);
}
.f-hex-err { font-size: .71rem; color: var(--c-red); margin: 0; }

/* Divisor con texto */
.f-divider {
    display: flex; align-items: center; gap: .7rem;
}
.f-divider::before, .f-divider::after {
    content: ''; flex: 1; height: 1px; background: var(--c-border);
}
.f-divider span {
    font-size: .66rem; font-weight: 800; letter-spacing: .1em;
    text-transform: uppercase; color: var(--c-ink-ghost); white-space: nowrap;
}

/* ═══ ICON BROWSER ═══ */
.f-icon-block { display: flex; flex-direction: column; gap: .6rem; }
.f-search-wrap { position: relative; display: flex; align-items: center; }
.f-search-icon {
    position: absolute; left: .75rem;
    width: 14px; height: 14px; color: var(--c-ink-soft); pointer-events: none;
}
.f-search-input {
    width: 100%; padding: .6rem .9rem .6rem 2.1rem;
    font-size: .86rem; font-family: inherit;
    background: var(--c-surface-2);
    border: 1.5px solid var(--c-border);
    border-radius: var(--r-sm); color: var(--c-ink); outline: none;
    transition: border-color .13s, box-shadow .13s;
}
.f-search-input:focus {
    border-color: var(--c-navy-mid);
    box-shadow: 0 0 0 3px rgba(44,68,86,.1);
}
.f-search-clear {
    position: absolute; right: .6rem;
    background: none; border: none; cursor: pointer;
    color: var(--c-ink-soft); display: flex; transition: color .13s;
}
.f-search-clear:hover { color: var(--c-ink); }
.f-icon-browser {
    max-height: 288px; overflow-y: auto;
    border: 1.5px solid var(--c-border);
    border-radius: var(--r-sm); padding: .7rem;
    background: var(--c-surface-2);
    scrollbar-width: thin;
    scrollbar-color: rgba(26,37,48,.18) transparent;
}
.f-icon-cat { margin-bottom: .8rem; }
.f-icon-cat:last-child { margin-bottom: 0; }
.f-icon-cat-label {
    font-size: .61rem; font-weight: 800; text-transform: uppercase;
    letter-spacing: .1em; color: var(--c-ink-ghost); margin: 0 0 .38rem;
}
.f-icon-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(54px, 1fr));
    gap: .3rem;
}
.f-icon-empty {
    display: flex; flex-direction: column;
    align-items: center; gap: .5rem;
    padding: 2rem; color: var(--c-ink-soft);
    font-size: .85rem; text-align: center;
}

/* ═══ IMAGEN ═══ */
.f-upload-zone {
    display: flex; flex-direction: column;
    align-items: center; gap: .6rem;
    width: 100%; padding: 2.5rem 1rem;
    border: 2px dashed var(--c-border-mid);
    border-radius: var(--r); background: var(--c-surface-2);
    cursor: pointer; transition: border-color .14s, background .14s;
}
.f-upload-zone:hover { border-color: var(--c-navy-mid); background: rgba(44,68,86,.03); }
.f-upload-icon {
    width: 48px; height: 48px; border-radius: .6rem;
    background: rgba(44,68,86,.09); color: var(--c-navy-mid);
    display: flex; align-items: center; justify-content: center;
    transition: background .14s;
}
.f-upload-zone:hover .f-upload-icon { background: rgba(44,68,86,.16); }
.f-upload-primary { font-size: .88rem; font-weight: 700; color: var(--c-ink-mid); }
.f-upload-secondary { font-size: .75rem; color: var(--c-ink-ghost); }
.f-img-row { display: flex; align-items: center; gap: 1.1rem; }
.f-img-frame {
    width: 72px; height: 72px; border-radius: .6rem;
    border: 2px solid; overflow: hidden; flex-shrink: 0;
    transition: border-color .25s;
}
.f-img-thumb { width: 100%; height: 100%; object-fit: cover; }
.f-img-meta { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: .25rem; }
.f-img-name {
    font-size: .82rem; font-weight: 600; color: var(--c-ink);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.f-img-remove {
    display: inline-flex; align-items: center; gap: .35rem;
    padding: .3rem .62rem; font-size: .74rem; font-weight: 600;
    color: #991b1b; background: rgba(185,28,28,.07);
    border: 1px solid rgba(185,28,28,.14); border-radius: var(--r-pill);
    cursor: pointer; transition: background .13s;
}
.f-img-remove:hover { background: rgba(185,28,28,.12); }

/* ══════════════════════════════════════════
   BOTONES FINALES
   ══════════════════════════════════════════ */
.f-actions {
    display: flex; align-items: center; gap: .85rem;
    padding: .5rem 0 2rem;
    margin-left: calc(32px + 1.1rem); /* alinea con el contenido, no la canaleta */
}
@media (max-width: 920px) { .f-actions { margin-left: 0; } }
@media (max-width: 520px) {
    .f-actions { flex-wrap: wrap; }
    .f-btn-submit, .f-btn-cancel { flex: 1; justify-content: center; }
}

.f-btn-submit {
    display: inline-flex; align-items: center; gap: .5rem;
    padding: .88rem 2.1rem;
    font-size: .92rem; font-weight: 700; letter-spacing: .01em;
    background: var(--c-navy); color: white;
    border: none; border-radius: var(--r-pill); cursor: pointer;
    box-shadow: 0 2px 14px rgba(26,37,48,.32);
    transition: background .14s, transform .14s, box-shadow .14s;
}
@media (hover: hover) and (pointer: fine) {
    .f-btn-submit:hover:not(:disabled) {
        background: var(--c-navy-lite);
        transform: translateY(-2px);
        box-shadow: 0 7px 22px rgba(26,37,48,.38);
    }
    .f-btn-submit:active:not(:disabled) { transform: translateY(0); }
}
.f-btn-submit:disabled { opacity: .38; cursor: not-allowed; }

.f-btn-cancel {
    display: inline-flex; align-items: center;
    padding: .88rem 1.5rem;
    font-size: .88rem; font-weight: 600; color: var(--c-ink-soft);
    background: transparent;
    border: 1.5px solid var(--c-border); border-radius: var(--r-pill);
    cursor: pointer; transition: border-color .13s, color .13s;
}
.f-btn-cancel:hover { border-color: var(--c-border-mid); color: var(--c-ink); }

/* ══════════════════════════════════════════
   SIDEBAR
   ══════════════════════════════════════════ */
.f-sidebar { align-self: start; }
.f-sidebar-inner {
    position: sticky; top: 1.5rem;
    display: flex; flex-direction: column; gap: 1rem;
}

.f-sb-preview {
    background: var(--c-surface); border-radius: var(--r);
    box-shadow: var(--sh-card); overflow: hidden;
    border: 1px solid var(--c-border);
    transition: box-shadow .2s;
}
.f-sb-preview:hover { box-shadow: var(--sh-lift); }
.f-sb-stripe { height: 4px; transition: background .3s; }
.f-sb-body {
    display: flex; align-items: flex-start; gap: .85rem;
    padding: .92rem 1rem;
}
.f-sb-meta { flex: 1; min-width: 0; }
.f-sb-name {
    font-size: .88rem; font-weight: 700; color: var(--c-ink);
    margin: 0 0 .08rem; word-break: break-word; line-height: 1.3;
}
.f-sb-uni  { font-size: .72rem; color: var(--c-ink-soft); margin: 0 0 .04rem; word-break: break-word; }
.f-sb-faculty { font-size: .67rem; color: var(--c-ink-ghost); margin: 0; }
.f-sb-desc {
    font-size: .7rem; color: var(--c-ink-soft); margin: .28rem 0 0; line-height: 1.5;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.f-sb-foot {
    padding: .4rem 1rem .68rem;
    border-top: 1px solid rgba(26,37,48,.05);
}

/* Checklist */
.f-sb-checklist {
    background: var(--c-surface); border-radius: var(--r);
    box-shadow: var(--sh-card); padding: .9rem 1.1rem;
    border: 1px solid var(--c-border);
}
.f-sb-checklist-title {
    font-size: .66rem; font-weight: 800;
    text-transform: uppercase; letter-spacing: .09em;
    color: var(--c-ink-ghost); margin: 0 0 .7rem;
}
.f-sb-checklist ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: .45rem; }
.f-chk-item { display: flex; align-items: center; gap: .5rem; font-size: .76rem; color: var(--c-ink-soft); }
.f-chk-item--done { color: var(--c-ink); }
.f-chk-dot {
    width: 15px; height: 15px; border-radius: 50%;
    border: 1.5px solid var(--c-border-mid);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; color: white;
    transition: background .15s, border-color .15s;
}
.f-chk-item--done .f-chk-dot { background: var(--c-green); border-color: var(--c-green); }
.f-chk-opt { font-style: italic; color: var(--c-ink-ghost); font-weight: 400; }

.f-sb-note {
    display: flex; align-items: flex-start; gap: .55rem;
    padding: .68rem .85rem;
    background: rgba(26,37,48,.03);
    border: 1px solid var(--c-border); border-radius: var(--r-sm);
}
.f-sb-note svg { color: var(--c-navy-mid); flex-shrink: 0; margin-top: .06rem; }
.f-sb-note p { font-size: .73rem; margin: 0; line-height: 1.55; color: var(--c-ink-soft); }

/* ══════════════════════════════════════════
   DARK MODE
   ══════════════════════════════════════════ */
.dark .cp-root, .dark .f-header, .dark .f-body {
    --c-paper:      #0d1318;
    --c-paper-2:    #111820;
    --c-ruled:      rgba(255,255,255,.038);
    --c-ink:        #dce6ed;
    --c-ink-mid:    #a5bbc8;
    --c-ink-soft:   #6a8898;
    --c-ink-ghost:  #435e6c;
    --c-surface:    #16202a;
    --c-surface-2:  #192330;
    --c-border:     rgba(255,255,255,.075);
    --c-border-mid: rgba(255,255,255,.14);
    --sh-card:      0 2px 8px rgba(0,0,0,.32), 0 0 0 1px rgba(255,255,255,.045);
    --sh-lift:      0 5px 24px rgba(0,0,0,.45), 0 0 0 1px rgba(255,255,255,.06);
}
.dark .f-header   { background: #0a0f14; border-color: #1a2430; }
.dark .f-paper-texture { opacity: .05; }
.dark .f-title-noun { color: #adc8e0; }
.dark .f-input, .dark .f-search-input, .dark .f-icon-browser,
.dark .f-hex-field, .dark .f-eyedrop, .dark .f-color-current,
.dark .f-upload-zone { background: #192330; border-color: rgba(255,255,255,.09); }
.dark .f-input:focus, .dark .f-search-input:focus {
    border-color: #5d8cc7; box-shadow: 0 0 0 3px rgba(93,140,199,.12);
}
.dark .f-tab--on   { background: #1e2c38; }
.dark .f-acceso-card { background: #192330; border-color: rgba(255,255,255,.09); }
.dark .f-btn-submit { background: #2e5070; }
.dark .f-btn-submit:hover:not(:disabled) { background: #3e6888; }
.dark .f-sb-preview, .dark .f-sb-checklist { border-color: rgba(255,255,255,.07); }
.dark .f-preview-card { background: #16202a; border-color: rgba(255,255,255,.07); }
.dark .f-hex-in { color: #dce6ed; }
.dark .f-margin { background: rgba(200,30,60,.08); }

/* ══════════════════════════════════════════
   REDUCED MOTION + PERFORMANCE
   ══════════════════════════════════════════ */
@media (prefers-reduced-motion: reduce) {
    .f-title, .f-subtitle, .f-preview-wrap, .f-section,
    .f-eyebrow-orb, .f-swatch:hover, .f-btn-submit:hover,
    .f-acceso-card:hover, .f-acceso-card--on {
        animation: none !important;
        transform: none !important;
    }
}

/* ══════════════════════════════════════════
   RESPONSIVE
   ══════════════════════════════════════════ */
@media (max-width: 768px) {
    .f-margin { left: 48px; }
    .f-palette { grid-template-columns: repeat(6, 1fr); }
}
@media (max-width: 480px) {
    .f-title-noun { font-size: 3rem; }
    .f-title-verb { font-size: 1.8rem; }
    .f-section { gap: .7rem; }
    .f-section-aside { width: 26px; }
    .f-aside-num { width: 22px; height: 22px; font-size: .74rem; }
    .f-palette { grid-template-columns: repeat(4, 1fr); }
    .f-header-grid { gap: 1rem; }
}
        `}</style>
        </div>
    );
}

/* ══ Botón de ícono individual ══════════════════════════════════ */
function IconBtn({
    value, label, Icon, selected, color, onSelect
}: {
    value: string; label: string; Icon: LucideIcon;
    selected: boolean; color: string; onSelect: (v: string) => void;
}) {
    return (
        <button
            type="button"
            onClick={() => onSelect(value)}
            title={label}
            role="option"
            aria-selected={selected}
            style={{
                position: "relative",
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: "4px",
                padding: "8px 4px 6px",
                borderRadius: "7px",
                border: selected ? `2px solid ${color}` : "2px solid transparent",
                background: selected ? `${color}16` : "transparent",
                cursor: "pointer",
                transition: "background .12s, border-color .12s, transform .12s",
            }}
            onMouseEnter={e => {
                if (!selected)
                    (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.1)";
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform =
                    selected ? "scale(1.05)" : "scale(1)";
            }}
        >
            <Icon style={{
                width: 19, height: 19,
                color: selected ? color : "#6a8898",
                transition: "color .12s",
            }} />
            <span style={{
                fontSize: ".59rem", fontWeight: 600,
                color: selected ? color : "#6a8898",
                maxWidth: "100%", overflow: "hidden",
                textOverflow: "ellipsis", whiteSpace: "nowrap",
                letterSpacing: ".01em", lineHeight: 1.2,
            }}>
                {label}
            </span>
            {selected && (
                <span style={{
                    position: "absolute", top: 3, right: 3,
                    width: 13, height: 13, borderRadius: "50%",
                    background: color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <Check style={{ width: 7, height: 7, color: "white" }} />
                </span>
            )}
        </button>
    );
}