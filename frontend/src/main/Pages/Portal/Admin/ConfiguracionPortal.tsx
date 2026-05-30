import { useState } from "react";
import { Settings, Lock, Upload, Palette, AlertTriangle, Archive } from "lucide-react";

interface VoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;
  description: string;
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const iconOptions = [
  { id: "book", label: "Libro", icon: "📚" },
  { id: "graduate", label: "Graduación", icon: "🎓" },
  { id: "science", label: "Ciencia", icon: "🔬" },
  { id: "computer", label: "Computadora", icon: "💻" },
  { id: "flask", label: "Química", icon: "🧪" },
  { id: "atom", label: "Física", icon: "⚛️" },
  { id: "calculator", label: "Matemáticas", icon: "🧮" },
  { id: "brain", label: "Psicología", icon: "🧠" },
];

const backgroundColors = [
  "#2c4456",
  "#1e3a5f",
  "#4a5568",
  "#2d3748",
  "#38a169",
  "#3182ce",
  "#805ad5",
  "#dd6b20",
];

function ConfirmModal({ isOpen, onClose, onConfirm, title, message }: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card max-w-lg w-full shadow-2xl" style={{ borderRadius: "var(--radius)" }}>
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-card-foreground">{title}</h2>
        </div>
        <div className="p-6">
          <p className="text-foreground mb-6">{message}</p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-border hover:bg-accent transition-colors"
              style={{ borderRadius: "var(--radius)" }}
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors"
              style={{ borderRadius: "var(--radius)" }}
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function VoteModal({ isOpen, onClose, onConfirm, title, description }: VoteModalProps) {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason);
      setReason("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card max-w-lg w-full shadow-2xl" style={{ borderRadius: "var(--radius)" }}>
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-card-foreground">{title}</h2>
        </div>
        <div className="p-6 space-y-4">
          <div
            className="p-4 bg-primary/5 border border-primary/20"
            style={{ borderRadius: "var(--radius)" }}
          >
            <p className="text-sm text-foreground">{description}</p>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-foreground">
              Motivo de la propuesta <span className="text-destructive">*</span>
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              style={{ borderRadius: "var(--radius)" }}
              placeholder="Explica por qué propones este cambio. Todos los administradores verán este mensaje."
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-border hover:bg-accent transition-colors"
              style={{ borderRadius: "var(--radius)" }}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!reason.trim()}
              className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderRadius: "var(--radius)" }}
            >
              Abrir Votación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PortalConfig() {
  const [identityData, setIdentityData] = useState({
    universityName: "Universidad Nacional",
    careerName: "Ingeniería Informática",
    academicUnit: "Facultad de Ingeniería",
    description:
      "Portal colaborativo para estudiantes de Ingeniería Informática. Compartimos material de estudio, discutimos temas académicos y nos ayudamos mutuamente.",
  });

  const [visualData, setVisualData] = useState({
    type: "icon" as "icon" | "image",
    selectedIcon: "computer",
    backgroundColor: "#2c4456",
    customImage: null as string | null,
  });

  const [accessData, setAccessData] = useState({
    isPortalOpen: true,
    areRequestsOpen: true,
    joinRequirements:
      "Por favor incluye tu número de legajo y confirma que eres estudiante activo de la carrera.",
  });

  const [voteModal, setVoteModal] = useState<{
    isOpen: boolean;
    type: "university" | "career" | "portalAccess" | "archive";
    title: string;
    description: string;
  }>({
    isOpen: false,
    type: "university",
    title: "",
    description: "",
  });

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

  const handleProposeUniversityChange = () => {
    setVoteModal({
      isOpen: true,
      type: "university",
      title: "Proponer Cambio de Universidad",
      description: `Estás proponiendo cambiar el nombre de la universidad a "${identityData.universityName}". Esta acción requiere votación de todos los administradores.`,
    });
  };

  const handleProposeCareerChange = () => {
    setVoteModal({
      isOpen: true,
      type: "career",
      title: "Proponer Cambio de Carrera",
      description: `Estás proponiendo cambiar el nombre de la carrera a "${identityData.careerName}". Esta acción requiere votación de todos los administradores.`,
    });
  };

  const handleProposePortalAccessChange = () => {
    setVoteModal({
      isOpen: true,
      type: "portalAccess",
      title: "Proponer Cambio de Acceso al Portal",
      description: `Estás proponiendo cambiar el portal a modo ${
        accessData.isPortalOpen ? "Cerrado" : "Abierto"
      }. Esta acción requiere votación de todos los administradores.`,
    });
  };

  const handleProposeArchive = () => {
    setVoteModal({
      isOpen: true,
      type: "archive",
      title: "Proponer Archivar Portal",
      description:
        "Estás proponiendo archivar este portal. El portal será ocultado pero no eliminado permanentemente. Esta acción requiere votación de todos los administradores.",
    });
  };

  const handleConfirmVote = (reason: string) => {
    console.log("Vote proposed:", voteModal.type, reason);
    alert("Votación abierta correctamente");
  };

  const handleSaveDescription = () => {
    setConfirmModal({
      isOpen: true,
      title: "Guardar Descripción",
      message:
        "¿Estás seguro de que deseas actualizar la descripción del portal? Este cambio será visible para todos los usuarios.",
      onConfirm: () => {
        alert("Descripción actualizada correctamente");
      },
    });
  };

  const handleSaveVisualIdentity = () => {
    setConfirmModal({
      isOpen: true,
      title: "Guardar Identidad Visual",
      message:
        "¿Estás seguro de que deseas actualizar la identidad visual del portal? Este cambio afectará cómo se ve la tarjeta del portal en la página de exploración.",
      onConfirm: () => {
        alert("Identidad visual actualizada correctamente");
      },
    });
  };

  const handleToggleRequests = () => {
    const newState = !accessData.areRequestsOpen;
    setConfirmModal({
      isOpen: true,
      title: newState ? "Abrir Solicitudes" : "Cerrar Solicitudes",
      message: newState
        ? "¿Estás seguro de que deseas abrir las solicitudes de membresía? Los usuarios podrán enviar solicitudes para unirse al portal."
        : "¿Estás seguro de que deseas cerrar las solicitudes de membresía? Los usuarios no podrán enviar nuevas solicitudes hasta que las vuelvas a abrir.",
      onConfirm: () => {
        setAccessData({ ...accessData, areRequestsOpen: newState });
      },
    });
  };

  const handleSaveRequirements = () => {
    setConfirmModal({
      isOpen: true,
      title: "Guardar Requisitos",
      message:
        "¿Estás seguro de que deseas actualizar los requisitos para unirse? Este mensaje será visible para todos los usuarios que intenten enviar una solicitud.",
      onConfirm: () => {
        alert("Requisitos actualizados correctamente");
      },
    });
  };

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setVisualData({ ...visualData, customImage: result, type: "image" });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-foreground mb-2">Configuración del Portal</h1>
        <p className="text-on-surface-variant">
          Administra la identidad, acceso y configuración general del portal
        </p>
      </div>

      <div className="space-y-6">
        {/* Sección: Identidad del Portal */}
        <section
          className="bg-surface-container-lowest p-6 shadow-sm"
          style={{ borderRadius: "var(--radius)" }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10" style={{ borderRadius: "var(--radius)" }}>
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-foreground">Identidad del Portal</h2>
          </div>

          <div className="space-y-5">
            {/* Universidad */}
            <div>
              <label className="block mb-2 text-sm font-medium text-foreground">Universidad</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={identityData.universityName}
                  onChange={(e) =>
                    setIdentityData({ ...identityData, universityName: e.target.value })
                  }
                  className="flex-1 px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  style={{ borderRadius: "var(--radius)" }}
                />
                <button
                  onClick={handleProposeUniversityChange}
                  className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors shadow-sm whitespace-nowrap"
                  style={{ borderRadius: "var(--radius)" }}
                >
                  Proponer Cambio
                </button>
              </div>
              <p className="text-xs text-on-surface-variant mt-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Cambiar el nombre de la universidad requiere votación de todos los administradores
              </p>
            </div>

            {/* Carrera */}
            <div>
              <label className="block mb-2 text-sm font-medium text-foreground">Carrera</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={identityData.careerName}
                  onChange={(e) =>
                    setIdentityData({ ...identityData, careerName: e.target.value })
                  }
                  className="flex-1 px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  style={{ borderRadius: "var(--radius)" }}
                />
                <button
                  onClick={handleProposeCareerChange}
                  className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors shadow-sm whitespace-nowrap"
                  style={{ borderRadius: "var(--radius)" }}
                >
                  Proponer Cambio
                </button>
              </div>
              <p className="text-xs text-on-surface-variant mt-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Cambiar el nombre de la carrera requiere votación de todos los administradores
              </p>
            </div>

            {/* Unidad Académica */}
            <div>
              <label className="block mb-2 text-sm font-medium text-foreground">
                Unidad Académica (opcional)
              </label>
              <input
                type="text"
                value={identityData.academicUnit}
                onChange={(e) =>
                  setIdentityData({ ...identityData, academicUnit: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                style={{ borderRadius: "var(--radius)" }}
                placeholder="Ej: Facultad de Ingeniería"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block mb-2 text-sm font-medium text-foreground">
                Descripción Corta
              </label>
              <textarea
                rows={3}
                value={identityData.description}
                onChange={(e) =>
                  setIdentityData({ ...identityData, description: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                style={{ borderRadius: "var(--radius)" }}
                placeholder="Descripción que aparece en las tarjetas de búsqueda"
              />
              <p className="text-xs text-on-surface-variant mt-1.5">
                Se muestra en los resultados de búsqueda y la página de exploración
              </p>
            </div>

            <button
              onClick={handleSaveDescription}
              className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors shadow-sm"
              style={{ borderRadius: "var(--radius)" }}
            >
              Guardar Cambios
            </button>
          </div>
        </section>

        {/* Sección: Identidad Visual */}
        <section
          className="bg-surface-container-lowest p-6 shadow-sm"
          style={{ borderRadius: "var(--radius)" }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10" style={{ borderRadius: "var(--radius)" }}>
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-foreground">Identidad Visual</h2>
          </div>

          <div className="space-y-5">
            {/* Selector de tipo */}
            <div>
              <label className="block mb-3 text-sm font-medium text-foreground">
                Tipo de Imagen
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setVisualData({ ...visualData, type: "icon" })}
                  className={`flex-1 px-4 py-3 border-2 transition-colors ${
                    visualData.type === "icon"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:bg-accent text-foreground"
                  }`}
                  style={{ borderRadius: "var(--radius)" }}
                >
                  Icono Predefinido
                </button>
                <button
                  onClick={() => setVisualData({ ...visualData, type: "image" })}
                  className={`flex-1 px-4 py-3 border-2 transition-colors ${
                    visualData.type === "image"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:bg-accent text-foreground"
                  }`}
                  style={{ borderRadius: "var(--radius)" }}
                >
                  Imagen Personalizada
                </button>
              </div>
            </div>

            {/* Iconos predefinidos */}
            {visualData.type === "icon" && (
              <>
                <div>
                  <label className="block mb-3 text-sm font-medium text-foreground">
                    Selecciona un Icono
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {iconOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setVisualData({ ...visualData, selectedIcon: option.id })}
                        className={`p-4 border-2 transition-colors ${
                          visualData.selectedIcon === option.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-accent"
                        }`}
                        style={{ borderRadius: "var(--radius)" }}
                      >
                        <div className="text-3xl mb-1">{option.icon}</div>
                        <div className="text-xs text-foreground">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block mb-3 text-sm font-medium text-foreground">
                    Color de Fondo
                  </label>
                  <div className="grid grid-cols-8 gap-2">
                    {backgroundColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setVisualData({ ...visualData, backgroundColor: color })}
                        className={`w-full aspect-square border-2 transition-all ${
                          visualData.backgroundColor === color
                            ? "border-primary scale-110"
                            : "border-border"
                        }`}
                        style={{
                          borderRadius: "var(--radius)",
                          backgroundColor: color,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Imagen personalizada */}
            {visualData.type === "image" && (
              <div>
                <label className="block mb-3 text-sm font-medium text-foreground">
                  Subir Imagen
                </label>
                <div
                  className="border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary hover:bg-primary/5 cursor-pointer"
                  style={{ borderRadius: "var(--radius)" }}
                  onClick={() => document.getElementById("image-upload")?.click()}
                >
                  {visualData.customImage ? (
                    <div className="space-y-3">
                      <img
                        src={visualData.customImage}
                        alt="Preview"
                        className="w-32 h-32 object-cover mx-auto"
                        style={{ borderRadius: "var(--radius)" }}
                      />
                      <p className="text-sm text-on-surface-variant">Click para cambiar</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-on-surface-variant mx-auto mb-2" />
                      <p className="text-sm text-foreground mb-1">Click para subir una imagen</p>
                      <p className="text-xs text-on-surface-variant">
                        PNG, JPG o SVG (recomendado: 400x400px)
                      </p>
                    </>
                  )}
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                />
              </div>
            )}

            {/* Preview */}
            <div>
              <label className="block mb-3 text-sm font-medium text-foreground">
                Vista Previa
              </label>
              <div
                className="p-6 bg-surface-container"
                style={{ borderRadius: "var(--radius)" }}
              >
                <div className="max-w-xs">
                  <div
                    className="w-full h-40 flex items-center justify-center mb-3 overflow-hidden"
                    style={{
                      borderRadius: "var(--radius)",
                      backgroundColor:
                        visualData.type === "icon" ? visualData.backgroundColor : undefined,
                    }}
                  >
                    {visualData.type === "icon" ? (
                      <span className="text-6xl">
                        {iconOptions.find((opt) => opt.id === visualData.selectedIcon)?.icon}
                      </span>
                    ) : visualData.customImage ? (
                      <img
                        src={visualData.customImage}
                        alt="Portal"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-on-surface-variant">Sin imagen</span>
                    )}
                  </div>
                  <h3 className="text-foreground font-medium">{identityData.careerName}</h3>
                  <p className="text-sm text-on-surface-variant">{identityData.universityName}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveVisualIdentity}
              className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors shadow-sm"
              style={{ borderRadius: "var(--radius)" }}
            >
              Guardar Identidad Visual
            </button>
          </div>
        </section>

        {/* Sección: Control de Acceso */}
        <section
          className="bg-surface-container-lowest p-6 shadow-sm"
          style={{ borderRadius: "var(--radius)" }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10" style={{ borderRadius: "var(--radius)" }}>
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-foreground">Control de Acceso</h2>
          </div>

          <div className="space-y-6">
            {/* Portal Abierto/Cerrado */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-medium text-foreground mb-1">
                    Portal {accessData.isPortalOpen ? "Abierto" : "Cerrado"}
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    {accessData.isPortalOpen
                      ? "No miembros pueden ver Materias y Foro en modo lectura"
                      : "No miembros solo pueden ver la página de Inicio"}
                  </p>
                </div>
                <button
                  onClick={handleProposePortalAccessChange}
                  className={`px-4 py-2 transition-colors ${
                    accessData.isPortalOpen
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-surface-container text-foreground hover:bg-accent"
                  }`}
                  style={{ borderRadius: "var(--radius)" }}
                >
                  {accessData.isPortalOpen ? "Abierto" : "Cerrado"}
                </button>
              </div>
              <p className="text-xs text-on-surface-variant flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Cambiar el acceso al portal requiere votación de todos los administradores
              </p>
            </div>

            <div className="h-px bg-border"></div>

            {/* Solicitudes Abiertas/Cerradas */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-foreground mb-1">
                    Solicitudes de Membresía
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    {accessData.areRequestsOpen
                      ? "Los usuarios pueden enviar solicitudes para unirse"
                      : "Las solicitudes están cerradas temporalmente"}
                  </p>
                </div>
                <button
                  onClick={handleToggleRequests}
                  className={`px-4 py-2 transition-colors ${
                    accessData.areRequestsOpen
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-surface-container text-foreground hover:bg-accent"
                  }`}
                  style={{ borderRadius: "var(--radius)" }}
                >
                  {accessData.areRequestsOpen ? "Abiertas" : "Cerradas"}
                </button>
              </div>
            </div>

            <div className="h-px bg-border"></div>

            {/* Requisitos */}
            <div>
              <label className="block mb-2 text-sm font-medium text-foreground">
                Requisitos para Unirse (opcional)
              </label>
              <textarea
                rows={4}
                value={accessData.joinRequirements}
                onChange={(e) =>
                  setAccessData({ ...accessData, joinRequirements: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                style={{ borderRadius: "var(--radius)" }}
                placeholder="Indica qué deben incluir los usuarios en su solicitud (ej: número de legajo, año de cursada, etc.)"
              />
              <p className="text-xs text-on-surface-variant mt-1.5">
                Los usuarios verán este texto antes de enviar una solicitud
              </p>
            </div>

            <button
              onClick={handleSaveRequirements}
              className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors shadow-sm"
              style={{ borderRadius: "var(--radius)" }}
            >
              Guardar Requisitos
            </button>
          </div>
        </section>

        {/* Sección: Zona Peligrosa */}
        <section
          className="bg-surface-container-lowest p-6 border-2 border-destructive/20 shadow-sm"
          style={{ borderRadius: "var(--radius)" }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-destructive/10" style={{ borderRadius: "var(--radius)" }}>
              <Archive className="w-5 h-5 text-destructive" />
            </div>
            <h2 className="text-destructive">Zona Peligrosa</h2>
          </div>

          <div
            className="p-4 bg-destructive/5 border border-destructive/20 mb-4"
            style={{ borderRadius: "var(--radius)" }}
          >
            <p className="text-sm text-foreground mb-1 font-medium">Archivar Portal</p>
            <p className="text-sm text-on-surface-variant">
              El portal será ocultado y los miembros no podrán acceder. Esta acción se puede
              revertir, pero requiere votación de todos los administradores.
            </p>
          </div>

          <button
            onClick={handleProposeArchive}
            className="px-5 py-2.5 border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
            style={{ borderRadius: "var(--radius)" }}
          >
            Proponer Archivar Portal
          </button>
        </section>
      </div>

      {/* Modals */}
      <VoteModal
        isOpen={voteModal.isOpen}
        onClose={() => setVoteModal({ ...voteModal, isOpen: false })}
        onConfirm={handleConfirmVote}
        title={voteModal.title}
        description={voteModal.description}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
      />
    </div>
  );
}