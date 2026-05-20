import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { GraduationCap, AlertCircle } from "lucide-react";
import { useToast } from "../../../hooks/useToast";

export function JoinPortal() {
  const { portalId } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    studentId: "",
    career: "",
    enrollmentYear: "",
    message: "",
  });

  const portalNames: Record<string, string> = {
    "ingenieria-informatica": "Ingeniería Informática",
    "administracion": "Administración de Empresas",
    "ingenieria-quimica": "Ingeniería Química",
    "matematicas": "Matemáticas",
    "letras": "Letras",
    "medicina": "Medicina",
  };

  const portalName = portalNames[portalId || ""] || "Portal";

  const careers = [
    "Ingeniería Informática",
    "Administración de Empresas",
    "Ingeniería Química",
    "Matemáticas",
    "Letras",
    "Medicina",
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulación de envío
    setTimeout(() => {
      // Guardar solicitud en localStorage (mock)
      const requestData = {
        ...formData,
        portalId,
        status: "pending",
        submittedAt: new Date().toISOString(),
      };
      localStorage.setItem(`portal-request-${portalId}`, JSON.stringify(requestData));

      useToast().showToast("Solicitud enviada correctamente", 'success');
      setIsSubmitting(false);

      // Redirigir a la vista de solicitud pendiente
      navigate(`/portal/${portalId}/solicitud-estado`);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div
          className="w-16 h-16 bg-primary/10 flex items-center justify-center mx-auto mb-4"
          style={{ borderRadius: 'var(--radius)' }}
        >
          <GraduationCap className="w-10 h-10 text-primary" />
        </div>
        <h1 className="mb-3 text-foreground">Solicitar Acceso a la Carrera</h1>
        <p className="text-on-surface-variant max-w-2xl mx-auto">
          Completa el formulario para solicitar acceso al portal de <span className="font-medium text-foreground">{portalName}</span>. Un administrador revisará tu solicitud y te enviará una respuesta por correo electrónico.
        </p>
      </div>

      {/* Formulario */}
      <div
        className="bg-surface-container-lowest p-8 shadow-sm"
        style={{ borderRadius: 'var(--radius)' }}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-foreground">
                Nombre <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="Tu nombre"
                className="w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                style={{ borderRadius: 'var(--radius)' }}
              />
            </div>
            <div>
              <label className="block mb-2 text-foreground">
                Apellido <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="Tu apellido"
                className="w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                style={{ borderRadius: 'var(--radius)' }}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block mb-2 text-foreground">
              Correo Electrónico Institucional <span className="text-destructive">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="tunombre@universidad.edu"
              className="w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              style={{ borderRadius: 'var(--radius)' }}
            />
          </div>

          {/* Número de Legajo */}
          <div>
            <label className="block mb-2 text-foreground">
              Número de Legajo <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              required
              placeholder="Ej: 12345678"
              className="w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              style={{ borderRadius: 'var(--radius)' }}
            />
          </div>

          {/* Carrera y Año */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-foreground">
                Carrera <span className="text-destructive">*</span>
              </label>
              <select
                name="career"
                value={formData.career}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                style={{ borderRadius: 'var(--radius)' }}
              >
                <option value="">Selecciona tu carrera</option>
                {careers.map((career) => (
                  <option key={career} value={career}>
                    {career}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2 text-foreground">
                Año de Ingreso <span className="text-destructive">*</span>
              </label>
              <select
                name="enrollmentYear"
                value={formData.enrollmentYear}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                style={{ borderRadius: 'var(--radius)' }}
              >
                <option value="">Selecciona el año</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mensaje adicional */}
          <div>
            <label className="block mb-2 text-foreground">
              Mensaje adicional / Motivo de Ingreso
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              placeholder="¿Algo más que quieras agregar?"
              className="w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-all"
              style={{ borderRadius: 'var(--radius)' }}
            />
          </div>

          {/* Aviso */}
          <div
            className="flex gap-3 p-4 bg-primary/5 border border-primary/20"
            style={{ borderRadius: 'var(--radius)' }}
          >
            <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-on-surface-variant">
              Al enviar esta solicitud, recibirás un correo de confirmación. El tiempo de revisión suele ser de 24-48 horas.
            </p>
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full px-6 py-3 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            style={{ borderRadius: 'var(--radius)' }}
          >
            {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
          </button>
        </form>
      </div>
    </div>
  );
}
