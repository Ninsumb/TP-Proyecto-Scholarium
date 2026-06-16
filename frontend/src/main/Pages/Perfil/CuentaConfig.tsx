import { useState, useEffect } from "react";
import {
    Lock,
    Mail,
    User as UserIcon,
    ShieldAlert,
    Trash2,
    Eye,
    EyeOff,
    Camera,
} from "lucide-react";
import { usuarioService } from "../../services/UsuarioService";
import { authService } from "../../services/AuthService";
import type { UsuarioMeResponse } from "../../services/UsuarioService";

// ─── Helpers ───────────────────────────────────────────────────────────────────

// "2026-04-15T00:00:00" → "15 de abril de 2026"
function formatFechaLarga(iso: string): string {
    return new Date(iso).toLocaleDateString("es-AR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

// "2026-04-15T00:00:00" → "Abril 2026"
function formatMesAnio(iso: string): string {
    const d = new Date(iso);
    const mes = d.toLocaleDateString("es-AR", { month: "long" });
    return `${mes.charAt(0).toUpperCase()}${mes.slice(1)} ${d.getFullYear()}`;
}

// ─── AvatarPreview ─────────────────────────────────────────────────────────────
// Replica el mismo patrón del componente Avatar genérico (iniciales + foto)
// pero en tamaño fijo 80×80 para el formulario de perfil.
// No reutilizamos Avatar directamente porque ese componente tiene sizes sm/md
// y no queremos romper su contrato agregando un size "lg" solo para este caso.

interface AvatarPreviewProps {
    nombre: string;
    fotoPerfil: string | null | undefined;
}

function AvatarPreview({ nombre, fotoPerfil }: AvatarPreviewProps) {
    if (fotoPerfil) {
        return (
            <img
                src={fotoPerfil}
                alt={nombre}
                className="w-20 h-20 object-cover flex-shrink-0"
                style={{ borderRadius: "var(--radius)" }}
            />
        );
    }
    return (
        <div
            className="w-20 h-20 bg-primary/15 flex items-center justify-center text-primary flex-shrink-0"
            style={{ borderRadius: "var(--radius)" }}
        >
            <span className="text-xl font-medium select-none">
                {nombre.slice(0, 2).toUpperCase()}
            </span>
        </div>
    );
}

// ─── Section ───────────────────────────────────────────────────────────────────

interface SectionProps {
    icon: React.ReactNode;
    title: string;
    danger?: boolean;
    children: React.ReactNode;
}

function Section({ icon, title, danger, children }: SectionProps) {
    return (
        <section
            className={`bg-surface-container-lowest p-6 shadow-sm ${
                danger ? "border-2 border-destructive/20" : ""
            }`}
            style={{ borderRadius: "var(--radius)" }}
        >
            <div className="flex items-center gap-3 mb-5">
                <div
                    className={`p-2 ${danger ? "bg-destructive/10" : "bg-primary/10"}`}
                    style={{ borderRadius: "var(--radius)" }}
                >
                    {icon}
                </div>
                <h2 className={danger ? "text-destructive" : "text-foreground"}>{title}</h2>
            </div>
            {children}
        </section>
    );
}

// ─── Field ─────────────────────────────────────────────────────────────────────

interface FieldProps {
    label: string;
    children: React.ReactNode;
    hint?: string;
}

function Field({ label, children, hint }: FieldProps) {
    return (
        <div>
            <label className="block mb-2 text-sm text-foreground">{label}</label>
            {children}
            {hint && <p className="text-xs text-on-surface-variant mt-1">{hint}</p>}
        </div>
    );
}

// ─── Estilos compartidos ───────────────────────────────────────────────────────

const inputClass =
    "w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all";

const btnPrimaryClass =
    "px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed";

// ─── AccountSettings ───────────────────────────────────────────────────────────

export function AccountSettings() {

    // ══ Carga inicial del perfil ══════════════════════════════════════════════════

    const [perfil, setPerfil] = useState<UsuarioMeResponse | null>(null);
    const [loadingPerfil, setLoadingPerfil] = useState(true);

    useEffect(() => {
        usuarioService
            .getMiPerfil()
            .then(setPerfil)
            .finally(() => setLoadingPerfil(false));
    }, []);

    // ══ Sección: Perfil ═══════════════════════════════════════════════════════════

    const [nombreDraft, setNombreDraft] = useState("");
    const [fotoPreview, setFotoPreview] = useState<string | null>(null); // URL local (FileReader)
    const [fotoArchivo, setFotoArchivo] = useState<File | null>(null);   // File real para el PATCH
    const [isDragging, setIsDragging] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileSaved, setProfileSaved] = useState(false);
    const [profileError, setProfileError] = useState("");

    // Sincronizar draft cuando llegan los datos del servidor
    useEffect(() => {
        if (perfil) setNombreDraft(perfil.nombre);
    }, [perfil]);

    const handleAvatarFile = (file: File) => {
        if (!file.type.startsWith("image/")) return;
        setFotoArchivo(file);
        const reader = new FileReader();
        reader.onloadend = () => setFotoPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSaveProfile = async () => {
        if (!perfil) return;
        setSavingProfile(true);
        setProfileError("");
        try {
            // Paso 1: si hay foto nueva, subirla primero
            if (fotoArchivo) {
                const nuevaUrl = await usuarioService.actualizarFotoPerfil(fotoArchivo);
                setPerfil((prev) => prev ? { ...prev, fotoPerfil: nuevaUrl } : prev);
                setFotoArchivo(null);
                setFotoPreview(null);
            }
            // Paso 2: si el nombre cambió, actualizarlo
            if (nombreDraft.trim() !== perfil.nombre) {
                const actualizado = await usuarioService.actualizarPerfil({
                    nombre: nombreDraft.trim(),
                });
                setPerfil(actualizado);
            }
            setProfileSaved(true);
            setTimeout(() => setProfileSaved(false), 2500);
        } catch {
            setProfileError("No se pudieron guardar los cambios. Intentá de nuevo.");
        } finally {
            setSavingProfile(false);
        }
    };

    // La foto que se muestra en el AvatarPreview:
    // - si el usuario eligió una imagen localmente (aún sin subir) → fotoPreview
    // - si no, la que vino del servidor → perfil.fotoPerfil
    // - si no hay ninguna → null (el AvatarPreview muestra iniciales)
    const fotoActual = fotoPreview ?? perfil?.fotoPerfil ?? null;

    // ══ Sección: Contraseña ═══════════════════════════════════════════════════════

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showCurrentPwd, setShowCurrentPwd] = useState(false);
    const [showNewPwd, setShowNewPwd] = useState(false);
    const [savingPwd, setSavingPwd] = useState(false);
    const [pwdError, setPwdError] = useState("");
    const [pwdSuccess, setPwdSuccess] = useState(false);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwdError("");

        // Validaciones client-side antes de tocar el servidor
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPwdError("Las contraseñas no coinciden.");
            return;
        }
        if (passwordData.newPassword.length < 8) {
            setPwdError("La nueva contraseña debe tener al menos 8 caracteres.");
            return;
        }

        setSavingPwd(true);
        try {
            await usuarioService.cambiarPassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setPwdSuccess(true);
            setTimeout(() => setPwdSuccess(false), 2500);
        } catch (err: any) {
            // El backend devuelve el mensaje en response.data.message (Spring Boot default)
            const msg = err?.response?.data?.message;
            setPwdError(msg ?? "La contraseña actual es incorrecta o hubo un error.");
        } finally {
            setSavingPwd(false);
        }
    };

    // ══ Sección: Email ════════════════════════════════════════════════════════════

    const [emailData, setEmailData] = useState({ newEmail: "", password: "" });
    const [savingEmail, setSavingEmail] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [emailSuccess, setEmailSuccess] = useState(false);

    const handleChangeEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setEmailError("");

        if (!emailData.newEmail.trim() || !emailData.password.trim()) {
            setEmailError("Completá todos los campos.");
            return;
        }

        setSavingEmail(true);
        try {
            const { token, refreshToken } = await usuarioService.cambiarEmail({
                newEmail: emailData.newEmail.trim(),
                password: emailData.password,
            });

            authService.saveSession({ token, refreshToken });

            // Actualizar el estado local para que "Email actual" refleje el cambio
            setPerfil((prev) => prev ? { ...prev, email: emailData.newEmail.trim() } : prev);
            setEmailData({ newEmail: "", password: "" });
            setEmailSuccess(true);
            setTimeout(() => setEmailSuccess(false), 2500);
        } catch (err: any) {
            const msg = err?.response?.data?.message;
            setEmailError(msg ?? "No se pudo actualizar el email. Verificá los datos.");
        } finally {
            setSavingEmail(false);
        }
    };

    // ══ Sección: Eliminar cuenta ══════════════════════════════════════════════════

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletingAccount, setDeletingAccount] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    const handleDeleteAccount = async () => {
        setDeletingAccount(true);
        setDeleteError("");
        try {
            await usuarioService.eliminarCuenta();
            localStorage.clear();
            window.location.href = "/";
        } catch {
            setDeletingAccount(false);
            setShowDeleteConfirm(false);
            setDeleteError("No se pudo eliminar la cuenta. Intentá de nuevo.");
        }
    };

    // ══ Render ════════════════════════════════════════════════════════════════════

    if (loadingPerfil) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-on-surface-variant text-sm">Cargando...</p>
            </div>
        );
    }

    if (!perfil) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-destructive text-sm">
                    No se pudo cargar la información de la cuenta.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* ── Header de página ── */}
                <div className="mb-8">
                    <h1 className="text-foreground" style={{ fontFamily: "Work Sans, sans-serif" }}>
                        Configuración de Cuenta
                    </h1>
                    <p className="text-on-surface-variant text-sm mt-1">
                        Administrá tu información personal, seguridad y preferencias.
                    </p>
                </div>

                <div className="space-y-6">

                    {/* ══ SECCIÓN: Perfil ═════════════════════════════════════════════════════ */}
                    <Section icon={<UserIcon className="w-5 h-5 text-primary" />} title="Perfil">
                        <div className="space-y-5">

                            <Field label="Foto de perfil">
                                <div className="flex items-center gap-4">
                                    <AvatarPreview
                                        nombre={nombreDraft || perfil.nombre}
                                        fotoPerfil={fotoActual}
                                    />
                                    <div
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            setIsDragging(false);
                                            const file = e.dataTransfer.files[0];
                                            if (file) handleAvatarFile(file);
                                        }}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            setIsDragging(true);
                                        }}
                                        onDragLeave={() => setIsDragging(false)}
                                        className={`flex-1 border-2 border-dashed px-4 py-4 text-center transition-colors ${
                                            isDragging
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-primary/50 hover:bg-surface-container-low"
                                        }`}
                                        style={{ borderRadius: "var(--radius)" }}
                                    >
                                        <Camera className="w-6 h-6 text-on-surface-variant mx-auto mb-2" />
                                        <p className="text-xs text-foreground mb-1">
                                            Arrastrá una imagen o seleccioná un archivo
                                        </p>
                                        <p className="text-xs text-on-surface-variant mb-2">
                                            PNG, JPG hasta 5MB
                                        </p>
                                        <label className="inline-block cursor-pointer">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleAvatarFile(file);
                                                }}
                                            />
                                            <span
                                                className="px-3 py-1.5 bg-surface-container-high text-foreground hover:bg-surface-container text-xs transition-colors inline-block"
                                                style={{ borderRadius: "var(--radius)" }}
                                            >
                                                Seleccionar archivo
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </Field>

                            <Field label="Nombre de usuario">
                                <input
                                    type="text"
                                    value={nombreDraft}
                                    onChange={(e) => setNombreDraft(e.target.value)}
                                    className={inputClass}
                                    style={{ borderRadius: "var(--radius)" }}
                                    placeholder="Tu nombre de usuario"
                                />
                            </Field>

                            <div className="flex items-center gap-3 pt-1">
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={!nombreDraft.trim() || savingProfile}
                                    className={btnPrimaryClass}
                                    style={{ borderRadius: "var(--radius)" }}
                                >
                                    {savingProfile ? "Guardando..." : "Guardar cambios"}
                                </button>
                                {profileSaved && (
                                    <span className="text-sm text-primary">✓ Guardado correctamente</span>
                                )}
                                {profileError && (
                                    <span className="text-sm text-destructive">{profileError}</span>
                                )}
                            </div>

                        </div>
                    </Section>

                    {/* ══ SECCIÓN: Seguridad ══════════════════════════════════════════════════ */}
                    <Section icon={<Lock className="w-5 h-5 text-primary" />} title="Seguridad">
                        <form onSubmit={handleChangePassword} className="space-y-4">

                            <Field label="Contraseña actual">
                                <div className="relative">
                                    <input
                                        type={showCurrentPwd ? "text" : "password"}
                                        value={passwordData.currentPassword}
                                        onChange={(e) =>
                                            setPasswordData((d) => ({ ...d, currentPassword: e.target.value }))
                                        }
                                        className={`${inputClass} pr-12`}
                                        style={{ borderRadius: "var(--radius)" }}
                                        placeholder="Ingresá tu contraseña actual"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPwd((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-accent transition-colors"
                                        style={{ borderRadius: "var(--radius)" }}
                                    >
                                        {showCurrentPwd
                                            ? <EyeOff className="w-4 h-4 text-on-surface-variant" />
                                            : <Eye className="w-4 h-4 text-on-surface-variant" />
                                        }
                                    </button>
                                </div>
                            </Field>

                            <Field label="Nueva contraseña">
                                <div className="relative">
                                    <input
                                        type={showNewPwd ? "text" : "password"}
                                        value={passwordData.newPassword}
                                        onChange={(e) =>
                                            setPasswordData((d) => ({ ...d, newPassword: e.target.value }))
                                        }
                                        className={`${inputClass} pr-12`}
                                        style={{ borderRadius: "var(--radius)" }}
                                        placeholder="Mínimo 8 caracteres"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPwd((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-accent transition-colors"
                                        style={{ borderRadius: "var(--radius)" }}
                                    >
                                        {showNewPwd
                                            ? <EyeOff className="w-4 h-4 text-on-surface-variant" />
                                            : <Eye className="w-4 h-4 text-on-surface-variant" />
                                        }
                                    </button>
                                </div>
                            </Field>

                            <Field label="Confirmar nueva contraseña">
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) =>
                                        setPasswordData((d) => ({ ...d, confirmPassword: e.target.value }))
                                    }
                                    className={inputClass}
                                    style={{ borderRadius: "var(--radius)" }}
                                    placeholder="Repetí la nueva contraseña"
                                />
                            </Field>

                            {pwdError && <p className="text-sm text-destructive">{pwdError}</p>}
                            {pwdSuccess && <p className="text-sm text-primary">✓ Contraseña actualizada correctamente</p>}

                            <button
                                type="submit"
                                disabled={savingPwd}
                                className={btnPrimaryClass}
                                style={{ borderRadius: "var(--radius)" }}
                            >
                                {savingPwd ? "Guardando..." : "Cambiar contraseña"}
                            </button>

                        </form>
                    </Section>

                    {/* ══ SECCIÓN: Email ═══════════════════════════════════════════════════════ */}
                    <Section icon={<Mail className="w-5 h-5 text-primary" />} title="Correo Electrónico">
                        <form onSubmit={handleChangeEmail} className="space-y-4">

                            <Field label="Email actual">
                                <input
                                    type="email"
                                    value={perfil.email}
                                    disabled
                                    className="w-full px-4 py-2.5 border border-border bg-surface-container text-on-surface-variant"
                                    style={{ borderRadius: "var(--radius)" }}
                                />
                            </Field>

                            <Field label="Nuevo email">
                                <input
                                    type="email"
                                    value={emailData.newEmail}
                                    onChange={(e) =>
                                        setEmailData((d) => ({ ...d, newEmail: e.target.value }))
                                    }
                                    className={inputClass}
                                    style={{ borderRadius: "var(--radius)" }}
                                    placeholder="nuevo.email@universidad.edu"
                                />
                            </Field>

                            <Field
                                label="Confirmar con contraseña"
                                hint="Por seguridad necesitamos verificar tu identidad."
                            >
                                <input
                                    type="password"
                                    value={emailData.password}
                                    onChange={(e) =>
                                        setEmailData((d) => ({ ...d, password: e.target.value }))
                                    }
                                    className={inputClass}
                                    style={{ borderRadius: "var(--radius)" }}
                                    placeholder="Ingresá tu contraseña actual"
                                />
                            </Field>

                            {emailError && <p className="text-sm text-destructive">{emailError}</p>}
                            {emailSuccess && (
                                <p className="text-sm text-primary">✓ Email actualizado correctamente</p>
                            )}

                            <button
                                type="submit"
                                disabled={savingEmail}
                                className={btnPrimaryClass}
                                style={{ borderRadius: "var(--radius)" }}
                            >
                                {savingEmail ? "Actualizando..." : "Actualizar email"}
                            </button>

                        </form>
                    </Section>

                    {/* ══ SECCIÓN: Información general (solo lectura) ══════════════════════════ */}
                    <Section
                        icon={<ShieldAlert className="w-5 h-5 text-primary" />}
                        title="Información General"
                    >
                        <div className="space-y-4">

                            <div className="flex items-start gap-3">
                                <UserIcon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                    <div className="text-sm font-medium text-foreground mb-0.5">
                                        Miembro desde
                                    </div>
                                    <div className="text-sm text-on-surface-variant">
                                        {formatMesAnio(perfil.createdAt)}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <ShieldAlert className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                    <div className="text-sm font-medium text-foreground mb-0.5">
                                        Fecha de registro
                                    </div>
                                    <div className="text-sm text-on-surface-variant">
                                        {formatFechaLarga(perfil.createdAt)}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </Section>

                    {/* ══ SECCIÓN: Zona peligrosa ══════════════════════════════════════════════ */}
                    <Section
                        icon={<Trash2 className="w-5 h-5 text-destructive" />}
                        title="Zona Peligrosa"
                        danger
                    >
                        <div
                            className="p-4 bg-destructive/5 border border-destructive/20 mb-4"
                            style={{ borderRadius: "var(--radius)" }}
                        >
                            <p className="text-sm text-foreground mb-1 font-medium">
                                Eliminar cuenta permanentemente
                            </p>
                            <p className="text-sm text-on-surface-variant">
                                Esta acción es irreversible. Perderás acceso a todos tus portales,
                                materiales y publicaciones.
                            </p>
                        </div>

                        {!showDeleteConfirm ? (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="px-5 py-2.5 border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                                style={{ borderRadius: "var(--radius)" }}
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
                                        disabled={deletingAccount}
                                        className="px-5 py-2.5 border border-border hover:bg-surface-container transition-colors disabled:opacity-40"
                                        style={{ borderRadius: "var(--radius)" }}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={deletingAccount}
                                        className="px-5 py-2.5 bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-sm disabled:opacity-60"
                                        style={{ borderRadius: "var(--radius)" }}
                                    >
                                        {deletingAccount ? "Eliminando..." : "Sí, eliminar definitivamente"}
                                    </button>
                                </div>
                            </div>
                        )}
                        {deleteError && (
                            <p className="text-sm text-destructive mt-2">{deleteError}</p>
                        )}
                    </Section>

                </div>
            </div>
        </div>
    );
}