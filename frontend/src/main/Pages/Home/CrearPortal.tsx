import { useState, useRef, useContext } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft, Upload, Palette, X, Check, Search,
  GraduationCap, BookOpen, Code, Briefcase, FlaskConical,
  Calculator, Languages, Network, BarChart2, Rocket, Cpu, Terminal,
  Globe, Lock, // <-- Agregamos íconos para el Tipo de Acceso
  type LucideIcon
} from "lucide-react";
import { portalService } from "../../services/PortalService";
import { PortalAvatar } from "../../Components/common/PortalAvatar";
import { MainContext } from "../../types/MainContext";

// ─── Íconos disponibles ───────────────────────────────────────────────────────
const ICONOS_DISPONIBLES: { value: string; label: string; Icon: LucideIcon }[] = [
  { value: "GraduationCap", label: "Birrete",      Icon: GraduationCap },
  { value: "BookOpen",      label: "Libro",         Icon: BookOpen },
  { value: "Code",          label: "Código",        Icon: Code },
  { value: "Briefcase",     label: "Maletín",       Icon: Briefcase },
  { value: "FlaskConical",  label: "Laboratorio",   Icon: FlaskConical },
  { value: "Calculator",    label: "Calculadora",   Icon: Calculator },
  { value: "Languages",     label: "Idiomas",       Icon: Languages },
  { value: "Network",       label: "Redes",         Icon: Network },
  { value: "BarChart2",     label: "Datos",         Icon: BarChart2 },
  { value: "Rocket",        label: "Cohete",        Icon: Rocket },
  { value: "Cpu",           label: "CPU",           Icon: Cpu },
  { value: "Terminal",      label: "Terminal",      Icon: Terminal },
];

// ─── Paleta de colores ────────────────────────────────────────────────────────
const COLORES_DISPONIBLES = [
  { hex: "#2563EB", label: "Azul" },
  { hex: "#7C3AED", label: "Púrpura" },
  { hex: "#059669", label: "Verde" },
  { hex: "#D97706", label: "Naranja" },
  { hex: "#DC2626", label: "Rojo" },
  { hex: "#BE185D", label: "Rosa" },
  { hex: "#0891B2", label: "Cian" },
  { hex: "#4F46E5", label: "Índigo" },
  { hex: "#65A30D", label: "Lima" },
  { hex: "#B45309", label: "Marrón" },
  { hex: "#0F766E", label: "Esmeralda" },
  { hex: "#9333EA", label: "Violeta" },
];

type ModoVisual = "icono" | "imagen";

interface FormState {
  carrera: string;
  universidad: string;
  unidadAcademica: string;
  descripcion: string;
  tipoAcceso: "ABIERTO" | "CERRADO"; // <-- Nuevo campo
}

export function CreatePortal() {
  const navigate = useNavigate();
  const { showToast } = useContext(MainContext);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Campos del formulario ──
  const [form, setForm] = useState<FormState>({
    carrera: "",
    universidad: "",
    unidadAcademica: "",
    descripcion: "",
    tipoAcceso: "CERRADO", // Por defecto cerrado por seguridad
  });

  // ── Identidad visual ──
  const [modoVisual, setModoVisual] = useState<ModoVisual>("icono");
  const [iconoSeleccionado, setIconoSeleccionado] = useState("GraduationCap");
  const [colorSeleccionado, setColorSeleccionado] = useState("#2563EB");
  const [busquedaIcono, setBusquedaIcono] = useState("");
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [imagenPreviewUrl, setImagenPreviewUrl] = useState<string | null>(null);

  // ── Estado de envío ──
  const [loading, setLoading] = useState(false);
  const [errorDuplicado, setErrorDuplicado] = useState<string | null>(null);

  // ─── Handlers formulario ──────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Limpiar error de duplicado cuando el usuario edita universidad o carrera
    if (name === "universidad" || name === "carrera") {
      setErrorDuplicado(null);
    }
  };

  // ─── Handlers imagen ─────────────────────────────────────────────────────
  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagenFile(file);
    const url = URL.createObjectURL(file);
    setImagenPreviewUrl(url);
  };

  const handleQuitarImagen = () => {
    setImagenFile(null);
    if (imagenPreviewUrl) URL.revokeObjectURL(imagenPreviewUrl);
    setImagenPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ─── Íconos filtrados por búsqueda ────────────────────────────────────────
  const iconosFiltrados = ICONOS_DISPONIBLES.filter((i) =>
    i.label.toLowerCase().includes(busquedaIcono.toLowerCase())
  );

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorDuplicado(null);

    if (!form.carrera.trim() || !form.universidad.trim()) return;

    setLoading(true);
    try {
      // TODO: si modoVisual === "imagen" y hay imagenFile,
      //       subir primero a Cloudinary y obtener la URL.
      //       Por ahora el campo logoUrl se deja null hasta implementar esa lógica.
      // const logoUrl = imagenFile ? await cloudinaryService.upload(imagenFile) : undefined;

      const response = await portalService.crearPortal({
        carrera: form.carrera.trim(),
        universidad: form.universidad.trim(),
        unidadAcademica: form.unidadAcademica.trim() || undefined,
        descripcion: form.descripcion.trim() || undefined,
        tipoAcceso: form.tipoAcceso, // <-- Pasamos el tipo de acceso al servicio
        // identidad visual
        logoUrl: undefined, // TODO: reemplazar con logoUrl cuando esté Cloudinary
        iconoPortal: modoVisual === "icono" ? iconoSeleccionado : undefined,
        colorPortal: modoVisual === "icono" ? colorSeleccionado : undefined,
      });

      showToast("¡Portal creado exitosamente!", "success");
      navigate(`/portal/${response.id}`);
    } catch (err: any) {
      const mensaje = err.response?.data?.message || err.response?.data || "";
      if (typeof mensaje === "string" && mensaje.includes("Ya existe un portal")) {
        setErrorDuplicado(
          "Ya existe un portal para esa universidad y carrera. Podés buscarlo en Explorar Portales."
        );
      } else {
        showToast("Ocurrió un error al crear el portal. Intentá de nuevo.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Preview live ─────────────────────────────────────────────────────────
  const previewLogoUrl = modoVisual === "imagen" ? imagenPreviewUrl : null;
  const previewIcono = modoVisual === "icono" ? iconoSeleccionado : null;
  const previewColor = modoVisual === "icono" ? colorSeleccionado : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        onClick={() => navigate("/home")}
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a Mis Portales
      </button>

      <div className="bg-surface-container-lowest p-8 rounded-sm">
        <div className="mb-8">
          <h1
            className="text-3xl font-bold text-foreground mb-2"
            style={{ fontFamily: "Work Sans, sans-serif" }}
          >
            Crear Nuevo Portal
          </h1>
          <p className="text-muted-foreground">
            Completá los datos para crear el portal de tu carrera. El nombre de
            la carrera y la universidad son obligatorios.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* ── Información básica ─────────────────────────────────────── */}
          <section className="space-y-4">
            <h3
              className="text-lg font-semibold text-foreground"
              style={{ fontFamily: "Work Sans, sans-serif" }}
            >
              Información básica
            </h3>

            {/* Carrera */}
            <div>
              <label htmlFor="carrera" className="block text-sm font-medium text-foreground mb-2">
                Nombre de la carrera <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                id="carrera"
                name="carrera"
                required
                value={form.carrera}
                onChange={handleChange}
                placeholder="Ej: Ingeniería Informática"
                className="w-full px-4 py-3 bg-surface-container-lowest text-foreground rounded-sm focus:outline-none focus:ring-2 focus:ring-primary"
                style={{ border: "2px solid rgba(169, 180, 185, 0.15)" }}
              />
            </div>

            {/* Universidad */}
            <div>
              <label htmlFor="universidad" className="block text-sm font-medium text-foreground mb-2">
                Universidad <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                id="universidad"
                name="universidad"
                required
                value={form.universidad}
                onChange={handleChange}
                placeholder="Ej: Universidad de Buenos Aires"
                className="w-full px-4 py-3 bg-surface-container-lowest text-foreground rounded-sm focus:outline-none focus:ring-2 focus:ring-primary"
                style={{ border: "2px solid rgba(169, 180, 185, 0.15)" }}
              />
            </div>

            {/* Error duplicado — aparece solo si el back devuelve conflicto */}
            {errorDuplicado && (
              <p className="text-sm text-destructive">{errorDuplicado}</p>
            )}

            {/* Unidad académica */}
            <div>
              <label htmlFor="unidadAcademica" className="block text-sm font-medium text-foreground mb-1">
                Facultad / Unidad Académica{" "}
                <span className="text-muted-foreground font-normal">(opcional)</span>
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                Ayuda a distinguir tu portal en búsquedas. Ej: "Facultad de Ciencias Exactas".
              </p>
              <input
                type="text"
                id="unidadAcademica"
                name="unidadAcademica"
                value={form.unidadAcademica}
                onChange={handleChange}
                placeholder="Ej: Escuela de Ciencia y Tecnología"
                className="w-full px-4 py-3 bg-surface-container-lowest text-foreground rounded-sm focus:outline-none focus:ring-2 focus:ring-primary"
                style={{ border: "2px solid rgba(169, 180, 185, 0.15)" }}
              />
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-foreground mb-1">
                Descripción corta{" "}
                <span className="text-muted-foreground font-normal">(opcional)</span>
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                Se muestra en las cards de búsqueda. Máximo 300 caracteres.
              </p>
              <textarea
                id="descripcion"
                name="descripcion"
                rows={2}
                maxLength={300}
                value={form.descripcion}
                onChange={handleChange}
                placeholder="Describe brevemente la carrera..."
                className="w-full px-4 py-3 bg-surface-container-lowest text-foreground rounded-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                style={{ border: "2px solid rgba(169, 180, 185, 0.15)" }}
              />
              <p className="text-xs text-muted-foreground text-right mt-1">
                {form.descripcion.length}/300
              </p>
            </div>
          </section>

          {/* ── Tipo de Acceso ─────────────────────────────────────────── */}
          <section
            className="space-y-4 pt-6"
            style={{ borderTop: "1px solid rgba(169, 180, 185, 0.15)" }}
          >
            <h3
              className="text-lg font-semibold text-foreground flex items-center gap-2"
              style={{ fontFamily: "Work Sans, sans-serif" }}
            >
              Tipo de Acceso
            </h3>
            <p className="text-sm text-muted-foreground">
              Determiná cómo se unirán los estudiantes a tu portal.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tarjeta Abierto */}
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, tipoAcceso: "ABIERTO" }))}
                className={`relative flex flex-col p-4 text-left cursor-pointer rounded-sm border-2 transition-all ${
                  form.tipoAcceso === "ABIERTO"
                    ? "border-primary bg-primary/5"
                    : "border-border bg-surface-container-lowest hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`p-2 rounded-full ${
                      form.tipoAcceso === "ABIERTO" ? "bg-primary text-primary-foreground" : "bg-surface-container text-muted-foreground"
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-foreground">Abierto</span>
                </div>
                <p className="text-xs text-muted-foreground ml-[44px]">
                  Cualquier estudiante podrá unirse automáticamente al portal de la carrera.
                </p>
              </button>

              {/* Tarjeta Cerrado */}
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, tipoAcceso: "CERRADO" }))}
                className={`relative flex flex-col p-4 text-left cursor-pointer rounded-sm border-2 transition-all ${
                  form.tipoAcceso === "CERRADO"
                    ? "border-primary bg-primary/5"
                    : "border-border bg-surface-container-lowest hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`p-2 rounded-full ${
                      form.tipoAcceso === "CERRADO" ? "bg-primary text-primary-foreground" : "bg-surface-container text-muted-foreground"
                    }`}
                  >
                    <Lock className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-foreground">Cerrado</span>
                </div>
                <p className="text-xs text-muted-foreground ml-[44px]">
                  Los estudiantes enviarán una solicitud que requerirá tu aprobación.
                </p>
              </button>
            </div>
          </section>

          {/* ── Identidad visual ───────────────────────────────────────── */}
          <section
            className="space-y-5 pt-6"
            style={{ borderTop: "1px solid rgba(169, 180, 185, 0.15)" }}
          >
            <h3
              className="text-lg font-semibold text-foreground flex items-center gap-2"
              style={{ fontFamily: "Work Sans, sans-serif" }}
            >
              <Palette className="w-5 h-5" />
              Identidad visual{" "}
              <span className="text-muted-foreground font-normal text-sm">(opcional)</span>
            </h3>

            {/* Selector de modo */}
            <div
              className="grid grid-cols-2 gap-2 p-1 rounded-sm"
              style={{ background: "rgba(169, 180, 185, 0.1)" }}
            >
              <button
                type="button"
                onClick={() => setModoVisual("icono")}
                className={`py-2 px-4 rounded-sm text-sm font-medium transition-all ${
                  modoVisual === "icono"
                    ? "bg-surface-container-lowest text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Ícono + color
              </button>
              <button
                type="button"
                onClick={() => setModoVisual("imagen")}
                className={`py-2 px-4 rounded-sm text-sm font-medium transition-all ${
                  modoVisual === "imagen"
                    ? "bg-surface-container-lowest text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Subir imagen
              </button>
            </div>

            {/* Panel ícono+color */}
            {modoVisual === "icono" && (
              <div className="space-y-4">
                {/* Buscador de íconos */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Ícono
                  </label>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Buscar ícono..."
                      value={busquedaIcono}
                      onChange={(e) => setBusquedaIcono(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm bg-surface-container-lowest text-foreground rounded-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      style={{ border: "2px solid rgba(169, 180, 185, 0.15)" }}
                    />
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {iconosFiltrados.map(({ value, label, Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setIconoSeleccionado(value)}
                        title={label}
                        className={`relative flex flex-col items-center gap-1 p-3 rounded-sm transition-all ${
                          iconoSeleccionado === value
                            ? "ring-2 ring-primary bg-primary/10"
                            : "hover:bg-surface-container-low"
                        }`}
                      >
                        <Icon className="w-5 h-5 text-foreground" />
                        <span className="text-xs text-muted-foreground truncate w-full text-center">
                          {label}
                        </span>
                        {iconoSeleccionado === value && (
                          <div className="absolute top-1 right-1">
                            <Check className="w-3 h-3 text-primary" />
                          </div>
                        )}
                      </button>
                    ))}
                    {iconosFiltrados.length === 0 && (
                      <p className="col-span-6 text-sm text-muted-foreground text-center py-4">
                        No hay íconos que coincidan con "{busquedaIcono}".
                      </p>
                    )}
                  </div>
                </div>

                {/* Paleta de colores */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Color de fondo
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {COLORES_DISPONIBLES.map(({ hex, label }) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => setColorSeleccionado(hex)}
                        title={label}
                        className="relative w-10 h-10 rounded-sm transition-all hover:scale-110"
                        style={{ backgroundColor: hex }}
                      >
                        {colorSeleccionado === hex && (
                          <Check className="absolute inset-0 m-auto w-5 h-5 text-white" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Panel imagen */}
            {modoVisual === "imagen" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Imagen del portal
                </label>
                {imagenPreviewUrl ? (
                  <div className="flex items-center gap-4">
                    <img
                      src={imagenPreviewUrl}
                      alt="Preview"
                      className="w-16 h-16 rounded-sm object-cover"
                    />
                    <div>
                      <p className="text-sm text-foreground mb-1">{imagenFile?.name}</p>
                      <button
                        type="button"
                        onClick={handleQuitarImagen}
                        className="inline-flex items-center gap-1 text-sm text-destructive hover:underline"
                      >
                        <X className="w-3 h-3" />
                        Quitar imagen
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex flex-col items-center gap-2 py-8 rounded-sm border-2 border-dashed text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                    style={{ borderColor: "rgba(169, 180, 185, 0.3)" }}
                  >
                    <Upload className="w-6 h-6" />
                    <span className="text-sm">Hacé click para elegir una imagen</span>
                    <span className="text-xs">PNG, JPG, WEBP — máx. 2MB</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImagenChange}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  La subida a Cloudinary se implementa próximamente. Por ahora el portal se crea sin imagen.
                </p>
              </div>
            )}

            {/* Preview de la card */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Vista previa
              </label>
              <div
                className="bg-surface-container-low p-5 rounded-sm"
                style={{ border: "1px solid rgba(169, 180, 185, 0.1)" }}
              >
                <div className="flex items-start gap-4">
                  <PortalAvatar
                    logoUrl={previewLogoUrl}
                    iconoPortal={previewIcono}
                    colorPortal={previewColor}
                    carrera={form.carrera || "Nombre de la carrera"}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {form.carrera || "Nombre de la carrera"}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {form.universidad || "Universidad"}
                    </p>
                    {form.unidadAcademica && (
                      <p className="text-xs text-muted-foreground truncate">
                        {form.unidadAcademica}
                      </p>
                    )}
                    {form.descripcion && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {form.descripcion}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Botones ────────────────────────────────────────────────── */}
          <div
            className="flex gap-4 pt-6"
            style={{ borderTop: "1px solid rgba(169, 180, 185, 0.15)" }}
          >
            <button
              type="submit"
              disabled={loading || !form.carrera.trim() || !form.universidad.trim()}
              className="px-6 py-3 rounded-sm transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 100%)",
                color: "var(--primary-foreground)",
              }}
            >
              {loading ? "Creando portal..." : "Crear portal"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/home")}
              className="px-6 py-3 bg-surface-container-high text-foreground rounded-sm hover:bg-surface-container transition-colors font-medium"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}