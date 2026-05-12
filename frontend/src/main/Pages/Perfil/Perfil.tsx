import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { GraduationCap, User, Mail, Building, Calendar, ArrowLeft, Edit2, Save, X, FileText, LogOut } from "lucide-react";

export function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: localStorage.getItem("userName") || "Usuario",
    email: localStorage.getItem("userEmail") || "",
    universidad: localStorage.getItem("userUniversity") || "Universidad",
    fechaRegistro: "15 de Abril, 2026",
    carrerasInscritas: ["Ingeniería Informática"],
  });

  // Número de solicitudes pendientes (mock - en producción vendría de backend)
  const solicitudesPendientes = 1;

  const handleSave = () => {
    localStorage.setItem("userName", formData.nombre);
    localStorage.setItem("userEmail", formData.email);
    localStorage.setItem("userUniversity", formData.universidad);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      nombre: localStorage.getItem("userName") || "Usuario",
      email: localStorage.getItem("userEmail") || "",
      universidad: localStorage.getItem("userUniversity") || "Universidad",
      fechaRegistro: "15 de Abril, 2026",
      carrerasInscritas: ["Ingeniería Informática"],
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
          {/* Profile Header */}
          <div className="bg-primary p-8 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-primary-foreground text-primary rounded-full mb-4">
              <User className="w-12 h-12" />
            </div>
            <h1 className="text-2xl font-bold text-primary-foreground mb-1">
              {formData.nombre}
            </h1>
            <p className="text-primary-foreground/80">{formData.email}</p>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                Información Personal
              </h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                  >
                    <Save className="w-4 h-4" />
                    Guardar
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-accent transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Name Field */}
              <div className="flex items-start gap-4">
                <div className="bg-accent p-3 rounded-lg">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-muted-foreground block mb-2">
                    Nombre Completo
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) =>
                        setFormData({ ...formData, nombre: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p className="text-foreground">{formData.nombre}</p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="flex items-start gap-4">
                <div className="bg-accent p-3 rounded-lg">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-muted-foreground block mb-2">
                    Correo Electrónico
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p className="text-foreground">{formData.email}</p>
                  )}
                </div>
              </div>

              {/* University Field */}
              <div className="flex items-start gap-4">
                <div className="bg-accent p-3 rounded-lg">
                  <Building className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-muted-foreground block mb-2">
                    Universidad
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.universidad}
                      onChange={(e) =>
                        setFormData({ ...formData, universidad: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p className="text-foreground">{formData.universidad}</p>
                  )}
                </div>
              </div>

              {/* Registration Date */}
              <div className="flex items-start gap-4">
                <div className="bg-accent p-3 rounded-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-muted-foreground block mb-2">
                    Fecha de Registro
                  </label>
                  <p className="text-foreground">{formData.fechaRegistro}</p>
                </div>
              </div>

              {/* Enrolled Careers */}
              <div className="flex items-start gap-4">
                <div className="bg-accent p-3 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-muted-foreground block mb-2">
                    Carreras Inscritas
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {formData.carrerasInscritas.map((carrera, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        {carrera}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Section */}
            <div className="mt-8 pt-8 border-t border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Estadísticas de Actividad
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-accent rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-primary mb-1">12</div>
                  <div className="text-sm text-muted-foreground">Materiales Subidos</div>
                </div>
                <div className="bg-accent rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-primary mb-1">28</div>
                  <div className="text-sm text-muted-foreground">Participaciones en Foro</div>
                </div>
                <div className="bg-accent rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-primary mb-1">5</div>
                  <div className="text-sm text-muted-foreground">Materias Activas</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}