import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Lock, Mail, User, ShieldAlert, Trash2, Eye, EyeOff, Building } from "lucide-react";

export function AccountSettings() {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Estado para cambiar contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Estado para cambiar email
  const [emailData, setEmailData] = useState({
    currentEmail: localStorage.getItem("userEmail") || "",
    newEmail: "",
    password: "",
  });

  // Estado para datos generales
  const [accountData, setAccountData] = useState({
    university: localStorage.getItem("userUniversity") || "Universidad",
    registrationDate: "15 de Abril, 2026",
  });

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para cambiar contraseña
    alert("Contraseña actualizada correctamente");
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleChangeEmail = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para cambiar email
    localStorage.setItem("userEmail", emailData.newEmail);
    alert("Email actualizado correctamente");
  };

  const handleDeleteAccount = () => {
    // Aquí iría la lógica para eliminar cuenta
    alert("Cuenta eliminada");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/perfil")}
            className="p-2 hover:bg-surface-container transition-colors"
            style={{ borderRadius: 'var(--radius)' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-foreground">Configuración de Cuenta</h1>
            <p className="text-on-surface-variant text-sm mt-1">
              Administra la seguridad y configuración de tu cuenta
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Sección: Seguridad */}
          <section
            className="bg-surface-container-lowest p-6 shadow-sm"
            style={{ borderRadius: 'var(--radius)' }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div
                className="p-2 bg-primary/10"
                style={{ borderRadius: 'var(--radius)' }}
              >
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-foreground">Seguridad</h2>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm text-foreground">
                  Contraseña actual
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    className="w-full px-4 py-2.5 pr-12 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    style={{ borderRadius: 'var(--radius)' }}
                    placeholder="Ingresa tu contraseña actual"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-accent transition-colors"
                    style={{ borderRadius: 'var(--radius)' }}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4 text-on-surface-variant" />
                    ) : (
                      <Eye className="w-4 h-4 text-on-surface-variant" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm text-foreground">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    className="w-full px-4 py-2.5 pr-12 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    style={{ borderRadius: 'var(--radius)' }}
                    placeholder="Ingresa tu nueva contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-accent transition-colors"
                    style={{ borderRadius: 'var(--radius)' }}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4 text-on-surface-variant" />
                    ) : (
                      <Eye className="w-4 h-4 text-on-surface-variant" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm text-foreground">
                  Confirmar nueva contraseña
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  style={{ borderRadius: 'var(--radius)' }}
                  placeholder="Confirma tu nueva contraseña"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors shadow-sm"
                style={{ borderRadius: 'var(--radius)' }}
              >
                Cambiar Contraseña
              </button>
            </form>
          </section>

          {/* Sección: Email */}
          <section
            className="bg-surface-container-lowest p-6 shadow-sm"
            style={{ borderRadius: 'var(--radius)' }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div
                className="p-2 bg-primary/10"
                style={{ borderRadius: 'var(--radius)' }}
              >
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-foreground">Correo Electrónico</h2>
            </div>

            <form onSubmit={handleChangeEmail} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm text-foreground">
                  Email actual
                </label>
                <input
                  type="email"
                  value={emailData.currentEmail}
                  disabled
                  className="w-full px-4 py-2.5 border border-border bg-surface-container text-on-surface-variant"
                  style={{ borderRadius: 'var(--radius)' }}
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-foreground">
                  Nuevo email
                </label>
                <input
                  type="email"
                  value={emailData.newEmail}
                  onChange={(e) => setEmailData({ ...emailData, newEmail: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  style={{ borderRadius: 'var(--radius)' }}
                  placeholder="nuevo.email@universidad.edu"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-foreground">
                  Confirmar con contraseña
                </label>
                <input
                  type="password"
                  value={emailData.password}
                  onChange={(e) => setEmailData({ ...emailData, password: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  style={{ borderRadius: 'var(--radius)' }}
                  placeholder="Ingresa tu contraseña"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors shadow-sm"
                style={{ borderRadius: 'var(--radius)' }}
              >
                Actualizar Email
              </button>
            </form>
          </section>

          {/* Sección: Información General */}
          <section
            className="bg-surface-container-lowest p-6 shadow-sm"
            style={{ borderRadius: 'var(--radius)' }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div
                className="p-2 bg-primary/10"
                style={{ borderRadius: 'var(--radius)' }}
              >
                <User className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-foreground">Información General</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Building className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground mb-1">Universidad</div>
                  <div className="text-sm text-on-surface-variant">{accountData.university}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground mb-1">Fecha de Registro</div>
                  <div className="text-sm text-on-surface-variant">{accountData.registrationDate}</div>
                </div>
              </div>
            </div>
          </section>

          {/* Sección: Zona Peligrosa */}
          <section
            className="bg-surface-container-lowest p-6 border-2 border-destructive/20 shadow-sm"
            style={{ borderRadius: 'var(--radius)' }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div
                className="p-2 bg-destructive/10"
                style={{ borderRadius: 'var(--radius)' }}
              >
                <Trash2 className="w-5 h-5 text-destructive" />
              </div>
              <h2 className="text-destructive">Zona Peligrosa</h2>
            </div>

            <div
              className="p-4 bg-destructive/5 border border-destructive/20 mb-4"
              style={{ borderRadius: 'var(--radius)' }}
            >
              <p className="text-sm text-foreground mb-1 font-medium">
                Eliminar cuenta permanentemente
              </p>
              <p className="text-sm text-on-surface-variant">
                Esta acción es irreversible. Perderás acceso a todos tus portales, materiales y publicaciones.
              </p>
            </div>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-5 py-2.5 border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                style={{ borderRadius: 'var(--radius)' }}
              >
                Eliminar mi cuenta
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-destructive font-medium">
                  ¿Estás completamente seguro? Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-5 py-2.5 border border-border hover:bg-surface-container transition-colors"
                    style={{ borderRadius: 'var(--radius)' }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="px-5 py-2.5 bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-sm"
                    style={{ borderRadius: 'var(--radius)' }}
                  >
                    Sí, eliminar definitivamente
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
