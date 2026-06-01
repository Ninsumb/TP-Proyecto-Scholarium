import { useState } from "react";
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

// ─── Tipos ─────────────────────────────────────────────────────────────────────
interface AccountInfo {
    username: string;
    avatarUrl: string;
    memberSince: string;
    email: string;
    registrationDate: string;
}

// ─── Componente: Sección con header ───────────────────────────────────────────
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

// ─── Componente: Input con label ───────────────────────────────────────────────
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

const inputClass =
    "w-full px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all";

// ─── Componente principal ──────────────────────────────────────────────────────
export function AccountSettings() {
    // ── Datos de la cuenta ──────────────────────────────────────────────────────
    const [account, setAccount] = useState<AccountInfo>({
        username: localStorage.getItem("userName") || "Usuario",
        avatarUrl: localStorage.getItem("userAvatar") || "",
        memberSince: "Abril 2026",
        email: localStorage.getItem("userEmail") || "",
        registrationDate: "15 de Abril, 2026",
    });

    // ── Estado de edición de perfil ─────────────────────────────────────────────
    const [profileDraft, setProfileDraft] = useState({
        username: account.username,
        avatarUrl: account.avatarUrl,
    });
    const [isDragging, setIsDragging] = useState(false);
    const [profileSaved, setProfileSaved] = useState(false);

    const handleAvatarFile = (file: File) => {
        if (!file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setProfileDraft((d) => ({ ...d, avatarUrl: result }));
        };
        reader.readAsDataURL(file);
    };

    const handleSaveProfile = () => {
        setAccount((prev) => ({ ...prev, ...profileDraft }));
        localStorage.setItem("userName", profileDraft.username);
        localStorage.setItem("userAvatar", profileDraft.avatarUrl);
        // TODO: PUT /api/usuarios/me  body: { username, avatarUrl }
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 2500);
    };

    // ── Estado de contraseña ────────────────────────────────────────────────────
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showCurrentPwd, setShowCurrentPwd] = useState(false);
    const [showNewPwd, setShowNewPwd] = useState(false);
    const [pwdError, setPwdError] = useState("");

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPwdError("Las contraseñas no coinciden.");
            return;
        }
        if (passwordData.newPassword.length < 8) {
            setPwdError("La nueva contraseña debe tener al menos 8 caracteres.");
            return;
        }
        setPwdError("");
        // TODO: POST /api/auth/change-password  body: { currentPassword, newPassword }
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    };

    // ── Estado de email ─────────────────────────────────────────────────────────
    const [emailData, setEmailData] = useState({
        newEmail: "",
        password: "",
    });

    const handleChangeEmail = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: POST /api/auth/change-email  body: { newEmail, password }
        localStorage.setItem("userEmail", emailData.newEmail);
        setAccount((prev) => ({ ...prev, email: emailData.newEmail }));
        setEmailData({ newEmail: "", password: "" });
    };

    // ── Estado de eliminación de cuenta ────────────────────────────────────────
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDeleteAccount = () => {
        // TODO: DELETE /api/usuarios/me
        localStorage.clear();
    };

    // ── Render ──────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header de página */}
                <div className="mb-8">
                    <h1 className="text-foreground" style={{ fontFamily: "Work Sans, sans-serif" }}>
                        Configuración de Cuenta
                    </h1>
                    <p className="text-on-surface-variant text-sm mt-1">
                        Administrá tu información personal, seguridad y preferencias.
                    </p>
                </div>

                <div className="space-y-6">
                    {/* ══ SECCIÓN: Perfil ══════════════════════════════════════════════════════ */}
                    <Section icon={<UserIcon className="w-5 h-5 text-primary" />} title="Perfil">
                        <div className="space-y-5">
                            {/* Avatar */}
                            <Field label="Foto de perfil">
                                <div className="flex items-center gap-4">
                                    {/* Previsualización circular */}
                                    <div
                                        className="w-20 h-20 bg-surface-container-low flex items-center justify-center flex-shrink-0 overflow-hidden relative group"
                                        style={{ borderRadius: "var(--radius)" }}
                                    >
                                        {profileDraft.avatarUrl ? (
                                            <img
                                                src={profileDraft.avatarUrl}
                                                alt="Avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <UserIcon className="w-10 h-10 text-on-surface-variant" />
                                        )}
                                    </div>

                                    {/* Zona de drop */}
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

                            {/* Nombre de usuario */}
                            <Field label="Nombre de usuario">
                                <input
                                    type="text"
                                    value={profileDraft.username}
                                    onChange={(e) =>
                                        setProfileDraft((d) => ({ ...d, username: e.target.value }))
                                    }
                                    className={inputClass}
                                    style={{ borderRadius: "var(--radius)" }}
                                    placeholder="Tu nombre de usuario"
                                />
                            </Field>

                            <div className="flex items-center gap-3 pt-1">
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={!profileDraft.username.trim()}
                                    className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                                    style={{ borderRadius: "var(--radius)" }}
                                >
                                    Guardar cambios
                                </button>
                                {profileSaved && (
                                    <span className="text-sm text-primary">
                                        ✓ Guardado correctamente
                                    </span>
                                )}
                            </div>
                        </div>
                    </Section>

                    {/* ══ SECCIÓN: Seguridad ═══════════════════════════════════════════════════ */}
                    <Section icon={<Lock className="w-5 h-5 text-primary" />} title="Seguridad">
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <Field label="Contraseña actual">
                                <div className="relative">
                                    <input
                                        type={showCurrentPwd ? "text" : "password"}
                                        value={passwordData.currentPassword}
                                        onChange={(e) =>
                                            setPasswordData((d) => ({
                                                ...d,
                                                currentPassword: e.target.value,
                                            }))
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
                                        {showCurrentPwd ? (
                                            <EyeOff className="w-4 h-4 text-on-surface-variant" />
                                        ) : (
                                            <Eye className="w-4 h-4 text-on-surface-variant" />
                                        )}
                                    </button>
                                </div>
                            </Field>

                            <Field label="Nueva contraseña">
                                <div className="relative">
                                    <input
                                        type={showNewPwd ? "text" : "password"}
                                        value={passwordData.newPassword}
                                        onChange={(e) =>
                                            setPasswordData((d) => ({
                                                ...d,
                                                newPassword: e.target.value,
                                            }))
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
                                        {showNewPwd ? (
                                            <EyeOff className="w-4 h-4 text-on-surface-variant" />
                                        ) : (
                                            <Eye className="w-4 h-4 text-on-surface-variant" />
                                        )}
                                    </button>
                                </div>
                            </Field>

                            <Field label="Confirmar nueva contraseña">
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) =>
                                        setPasswordData((d) => ({
                                            ...d,
                                            confirmPassword: e.target.value,
                                        }))
                                    }
                                    className={inputClass}
                                    style={{ borderRadius: "var(--radius)" }}
                                    placeholder="Repetí la nueva contraseña"
                                />
                            </Field>

                            {pwdError && (
                                <p className="text-sm text-destructive">{pwdError}</p>
                            )}

                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors shadow-sm"
                                style={{ borderRadius: "var(--radius)" }}
                            >
                                Cambiar contraseña
                            </button>
                        </form>
                    </Section>

                    {/* ══ SECCIÓN: Email ═══════════════════════════════════════════════════════ */}
                    <Section icon={<Mail className="w-5 h-5 text-primary" />} title="Correo Electrónico">
                        <form onSubmit={handleChangeEmail} className="space-y-4">
                            <Field label="Email actual">
                                <input
                                    type="email"
                                    value={account.email}
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

                            <Field label="Confirmar con contraseña">
                                <input
                                    type="password"
                                    value={emailData.password}
                                    onChange={(e) =>
                                        setEmailData((d) => ({ ...d, password: e.target.value }))
                                    }
                                    className={inputClass}
                                    style={{ borderRadius: "var(--radius)" }}
                                    placeholder="Ingresá tu contraseña"
                                />
                            </Field>

                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors shadow-sm"
                                style={{ borderRadius: "var(--radius)" }}
                            >
                                Actualizar email
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
                                        {account.memberSince}
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
                                        {account.registrationDate}
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
                                        className="px-5 py-2.5 border border-border hover:bg-surface-container transition-colors"
                                        style={{ borderRadius: "var(--radius)" }}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleDeleteAccount}
                                        className="px-5 py-2.5 bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-sm"
                                        style={{ borderRadius: "var(--radius)" }}
                                    >
                                        Sí, eliminar definitivamente
                                    </button>
                                </div>
                            </div>
                        )}
                    </Section>
                </div>
            </div>
        </div>
    );
}