import { useState } from "react";
import { useNavigate } from "react-router";
import { Settings, Edit2, X, Check, User as UserIcon } from "lucide-react";

export function Profile() {
  const navigate = useNavigate();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [profileData, setProfileData] = useState({
    username: localStorage.getItem("userName") || "Usuario",
    bio: "Estudiante de Ingeniería Informática apasionado por la tecnología y el aprendizaje colaborativo.",
    avatarUrl: "", // URL de la foto de perfil
    memberSince: "Abril 2026",
  });

  const [editData, setEditData] = useState({ ...profileData });
  const [previewImage, setPreviewImage] = useState<string>(profileData.avatarUrl);

  const handleSaveProfile = () => {
    setProfileData(editData);
    localStorage.setItem("userName", editData.username);
    setIsEditingProfile(false);
  };

  const handleCancelEdit = () => {
    setEditData({ ...profileData });
    setPreviewImage(profileData.avatarUrl);
    setIsEditingProfile(false);
  };

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setEditData({ ...editData, avatarUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto">
        {/* Banner decorativo */}
        <div
          className="h-48 relative"
          style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 100%)'
          }}
        >
          {/* Botón de configuración - esquina superior derecha */}
          <button
            onClick={() => navigate("/configuracion")}
            className="absolute top-4 right-4 p-2.5 bg-black/20 hover:bg-black/30 text-primary-foreground backdrop-blur-sm transition-colors"
            style={{ borderRadius: 'var(--radius)' }}
            title="Configuración de cuenta"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Contenedor del perfil */}
        <div className="px-6 pb-8 relative">
          {/* Avatar que sobresale del banner */}
          <div className="flex items-end justify-between mb-6" style={{ marginTop: '-72px' }}>
            <div
              className="w-36 h-36 bg-surface-container-lowest border-4 border-background flex items-center justify-center shadow-lg"
              style={{ borderRadius: 'var(--radius)' }}
            >
              {profileData.avatarUrl ? (
                <img
                  src={profileData.avatarUrl}
                  alt={profileData.username}
                  className="w-full h-full object-cover"
                  style={{ borderRadius: 'calc(var(--radius) - 4px)' }}
                />
              ) : (
                <UserIcon className="w-16 h-16 text-on-surface-variant" />
              )}
            </div>

            {/* Botón Editar Perfil */}
            {!isEditingProfile && (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="px-5 py-2.5 border-2 border-border hover:bg-surface-container transition-colors flex items-center gap-2 shadow-sm"
                style={{ borderRadius: 'var(--radius)' }}
              >
                <Edit2 className="w-4 h-4" />
                <span>Editar perfil</span>
              </button>
            )}

            {/* Botones de guardar/cancelar cuando está editando */}
            {isEditingProfile && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="px-5 py-2.5 border border-border hover:bg-surface-container transition-colors flex items-center gap-2"
                  style={{ borderRadius: 'var(--radius)' }}
                >
                  <X className="w-4 h-4" />
                  <span>Cancelar</span>
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors flex items-center gap-2 shadow-sm"
                  style={{ borderRadius: 'var(--radius)' }}
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar</span>
                </button>
              </div>
            )}
          </div>

          {/* Información del perfil */}
          <div className="space-y-4">
            {/* Nombre de usuario */}
            {!isEditingProfile ? (
              <div>
                <h1 className="text-foreground">{profileData.username}</h1>
              </div>
            ) : (
              <div>
                <label className="block mb-2 text-sm text-on-surface-variant">Nombre de usuario</label>
                <input
                  type="text"
                  value={editData.username}
                  onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                  className="w-full max-w-md px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  style={{ borderRadius: 'var(--radius)' }}
                  placeholder="Tu nombre de usuario"
                />
              </div>
            )}

            {/* Biografía */}
            {!isEditingProfile ? (
              <div>
                <p className="text-foreground leading-relaxed max-w-2xl">
                  {profileData.bio}
                </p>
              </div>
            ) : (
              <div>
                <label className="block mb-2 text-sm text-on-surface-variant">Biografía</label>
                <textarea
                  rows={4}
                  value={editData.bio}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  className="w-full max-w-2xl px-4 py-2.5 border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-all"
                  style={{ borderRadius: 'var(--radius)' }}
                  placeholder="Cuéntanos un poco sobre ti..."
                  maxLength={160}
                />
                <p className="text-xs text-on-surface-variant mt-1">
                  {editData.bio.length}/160 caracteres
                </p>
              </div>
            )}

            {/* Miembro desde */}
            {!isEditingProfile && (
              <div className="flex items-center gap-2 mt-3">
                <span className="text-sm text-on-surface-variant">
                  Miembro desde {profileData.memberSince}
                </span>
              </div>
            )}

            {/* Foto de perfil (solo en modo edición) */}
            {isEditingProfile && (
              <div>
                <label className="block mb-2 text-sm text-on-surface-variant">Foto de perfil</label>
                <div className="flex items-start gap-4">
                  {/* Preview */}
                  <div
                    className="w-24 h-24 bg-surface-container-low flex items-center justify-center flex-shrink-0"
                    style={{ borderRadius: 'var(--radius)' }}
                  >
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        style={{ borderRadius: 'var(--radius)' }}
                      />
                    ) : (
                      <UserIcon className="w-12 h-12 text-on-surface-variant" />
                    )}
                  </div>

                  {/* Upload area */}
                  <div className="flex-1">
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      className={`border-2 border-dashed p-6 text-center transition-colors ${
                        isDragging
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 hover:bg-surface-container-low'
                      }`}
                      style={{ borderRadius: 'var(--radius)' }}
                    >
                      <UserIcon className="w-10 h-10 text-on-surface-variant mx-auto mb-3" />
                      <p className="text-sm text-foreground mb-1">
                        Arrastra una imagen aquí o haz clic para seleccionar
                      </p>
                      <p className="text-xs text-on-surface-variant mb-3">
                        PNG, JPG hasta 5MB. Recomendamos imagen cuadrada.
                      </p>
                      <label className="inline-block">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                          }}
                          className="hidden"
                        />
                        <span
                          className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary-dim transition-colors cursor-pointer inline-block"
                          style={{ borderRadius: 'var(--radius)' }}
                        >
                          Seleccionar archivo
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
