import { useState } from "react";
import { Link } from "react-router-dom"; 
import { GraduationCap, ArrowLeft } from "lucide-react";
import { authService } from "../../services/AuthService"; 

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Ocurrió un error al procesar la solicitud.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="w-12 h-12 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Scholarium</h1>
          </div>
          <p className="text-muted-foreground">Recuperación de contraseña</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            ¿Olvidaste tu contraseña?
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center space-y-4">
              <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
                Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña.
              </div>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
              >
                <ArrowLeft className="w-4 h-4" /> Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Ingresá tu correo electrónico y te enviaremos las instrucciones para crear una nueva contraseña.
              </p>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="tu.correo@universidad.edu"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
              </button>

              <div className="mt-4 text-center">
                <Link
                  to="/login"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Volver atrás
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}