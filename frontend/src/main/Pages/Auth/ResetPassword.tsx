import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { GraduationCap } from "lucide-react";
import { authService } from "../../services/AuthService";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); 

  const [formData, setFormData] = useState({
    passwordNueva: "",
    confirmacionPassword: "",
  });
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!token) {
      setError("El enlace de recuperación no es válido o está incompleto.");
      setIsLoading(false);
      return;
    }

    if (formData.passwordNueva !== formData.confirmacionPassword) {
      setError("Las contraseñas no coinciden.");
      setIsLoading(false);
      return;
    }

    try {
      await authService.resetPassword({
        token,
        passwordNueva: formData.passwordNueva,
        confirmacionPassword: formData.confirmacionPassword,
      });
      setSuccess(true);
      
      setTimeout(() => navigate("/login"), 3000);
      
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al restablecer la contraseña. Es posible que el enlace haya expirado.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-card border border-border rounded-lg p-8 shadow-sm text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Enlace inválido</h2>
          <p className="text-muted-foreground mb-4">No se encontró el token de recuperación de seguridad.</p>
          <Link to="/login" className="text-primary hover:underline">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="w-12 h-12 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Scholarium</h1>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Crear nueva contraseña
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center space-y-4">
              <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
                ¡Tu contraseña ha sido actualizada con éxito!
              </div>
              <p className="text-sm text-muted-foreground">Redirigiendo al inicio de sesión...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="passwordNueva" className="block text-sm font-medium text-foreground mb-2">
                  Nueva Contraseña
                </label>
                <input
                  id="passwordNueva"
                  type="password"
                  required
                  value={formData.passwordNueva}
                  onChange={(e) => setFormData({ ...formData, passwordNueva: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="confirmacionPassword" className="block text-sm font-medium text-foreground mb-2">
                  Confirmar Contraseña
                </label>
                <input
                  id="confirmacionPassword"
                  type="password"
                  required
                  value={formData.confirmacionPassword}
                  onChange={(e) => setFormData({ ...formData, confirmacionPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Guardando..." : "Actualizar contraseña"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}