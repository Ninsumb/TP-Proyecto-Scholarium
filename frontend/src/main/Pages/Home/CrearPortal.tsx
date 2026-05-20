import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, GraduationCap, Palette } from "lucide-react";

const ICON_OPTIONS = [
  { value: "GraduationCap", label: "Birrete", color: "bg-blue-600" },
  { value: "Calculator", label: "Calculadora", color: "bg-purple-600" },
  { value: "Beaker", label: "Química", color: "bg-green-600" },
  { value: "BookOpen", label: "Libro", color: "bg-orange-600" },
  { value: "Briefcase", label: "Maletín", color: "bg-indigo-600" },
  { value: "Code", label: "Código", color: "bg-teal-600" },
];

const COLOR_OPTIONS = [
  { value: "bg-blue-600", label: "Azul" },
  { value: "bg-purple-600", label: "Púrpura" },
  { value: "bg-green-600", label: "Verde" },
  { value: "bg-orange-600", label: "Naranja" },
  { value: "bg-indigo-600", label: "Índigo" },
  { value: "bg-teal-600", label: "Turquesa" },
  { value: "bg-red-600", label: "Rojo" },
  { value: "bg-pink-600", label: "Rosa" },
];

export function CreatePortal() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    universidad: "",
    facultad: "",
    duracion: "",
    icono: "GraduationCap",
    color: "bg-blue-600",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Aquí iría la lógica para crear el portal en el backend
    console.log("Crear portal:", formData);
    
    // Simulación: crear el portal y redirigir
    alert("Portal creado exitosamente!");
    navigate("/home");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        onClick={() => navigate("/home")}
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a Mis Portales
      </button>

      <div className="bg-surface-container-lowest p-8 rounded-sm">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2" style={{ fontFamily: 'Work Sans, sans-serif' }}>
            Crear Nuevo Portal
          </h1>
          <p className="text-muted-foreground">
            Completa la información para crear un portal de carrera universitaria
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'Work Sans, sans-serif' }}>
              Información Básica
            </h3>

            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-foreground mb-2">
                Nombre de la Carrera *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Ingeniería Informática"
                className="w-full px-4 py-3 bg-surface-container-lowest text-foreground rounded-sm focus:outline-none focus:ring-2 focus:ring-primary"
                style={{ border: '2px solid rgba(169, 180, 185, 0.15)' }}
              />
            </div>

            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-foreground mb-2">
                Descripción *
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                required
                rows={3}
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Describe brevemente la carrera..."
                className="w-full px-4 py-3 bg-surface-container-lowest text-foreground rounded-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                style={{ border: '2px solid rgba(169, 180, 185, 0.15)' }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="universidad" className="block text-sm font-medium text-foreground mb-2">
                  Universidad *
                </label>
                <input
                  type="text"
                  id="universidad"
                  name="universidad"
                  required
                  value={formData.universidad}
                  onChange={handleChange}
                  placeholder="Ej: Universidad de Buenos Aires"
                  className="w-full px-4 py-3 bg-surface-container-lowest text-foreground rounded-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  style={{ border: '2px solid rgba(169, 180, 185, 0.15)' }}
                />
              </div>

              <div>
                <label htmlFor="facultad" className="block text-sm font-medium text-foreground mb-2">
                  Facultad *
                </label>
                <input
                  type="text"
                  id="facultad"
                  name="facultad"
                  required
                  value={formData.facultad}
                  onChange={handleChange}
                  placeholder="Ej: Facultad de Ingeniería"
                  className="w-full px-4 py-3 bg-surface-container-lowest text-foreground rounded-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  style={{ border: '2px solid rgba(169, 180, 185, 0.15)' }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="duracion" className="block text-sm font-medium text-foreground mb-2">
                Duración
              </label>
              <input
                type="text"
                id="duracion"
                name="duracion"
                value={formData.duracion}
                onChange={handleChange}
                placeholder="Ej: 5 años"
                className="w-full px-4 py-3 bg-surface-container-lowest text-foreground rounded-sm focus:outline-none focus:ring-2 focus:ring-primary"
                style={{ border: '2px solid rgba(169, 180, 185, 0.15)' }}
              />
            </div>
          </div>

          {/* Personalización Visual */}
          <div className="space-y-4 pt-6" style={{ borderTop: '1px solid rgba(169, 180, 185, 0.15)' }}>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2" style={{ fontFamily: 'Work Sans, sans-serif' }}>
              <Palette className="w-5 h-5" />
              Personalización Visual
            </h3>

            <div>
              <label htmlFor="icono" className="block text-sm font-medium text-foreground mb-2">
                Icono
              </label>
              <select
                id="icono"
                name="icono"
                value={formData.icono}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-surface-container-lowest text-foreground rounded-sm focus:outline-none focus:ring-2 focus:ring-primary"
                style={{ border: '2px solid rgba(169, 180, 185, 0.15)' }}
              >
                {ICON_OPTIONS.map((icon) => (
                  <option key={icon.value} value={icon.value}>
                    {icon.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Color del Portal
              </label>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                {COLOR_OPTIONS.map((colorOption) => (
                  <button
                    key={colorOption.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: colorOption.value })}
                    className={`${colorOption.value} w-12 h-12 rounded-sm transition-all ${
                      formData.color === colorOption.value
                        ? "ring-2 ring-primary ring-offset-2"
                        : "hover:scale-105"
                    }`}
                    title={colorOption.label}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="pt-4">
              <label className="block text-sm font-medium text-foreground mb-3">
                Vista Previa
              </label>
              <div className="bg-surface-container-low p-6 rounded-sm">
                <div className="flex items-start gap-4">
                  <div className={`${formData.color} p-3 rounded-sm`}>
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">
                      {formData.nombre || "Nombre de la Carrera"}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {formData.descripcion || "Descripción de la carrera"}
                    </p>
                    {formData.universidad && (
                      <p className="text-xs text-foreground">
                        {formData.universidad}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              className="px-6 py-3 rounded-sm transition-all font-medium"
              style={{ 
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 100%)',
                color: 'var(--primary-foreground)'
              }}
            >
              Crear Portal
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