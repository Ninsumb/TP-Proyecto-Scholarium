import { useState, useEffect } from "react";
import { Check, X, Users, FileText, Clock, CheckCircle, XCircle, Download, Eye, Shield } from "lucide-react";
import { useNavigate, useParams, useOutletContext } from "react-router";

interface PortalContext {
  isMember: boolean;
  isAdmin: boolean;
}

interface UserRequest {
  id: number;
  name: string;
  email: string;
  studentId: string;
  career: string;
  year: string;
  date: string;
  reason: string;
  status: string;
  university?: string;
}

interface MaterialRequest {
  id: number;
  title: string;
  subject: string;
  uploadedBy: string;
  date: string;
  type: string;
  size: string;
  status: string;
  description?: string;
  fileUrl?: string;
}

const mockUserRequests = [
  {
    id: 1,
    name: "Pedro Sánchez",
    email: "pedro.sanchez@universidad.edu",
    studentId: "12345678",
    career: "Licenciatura en Informática",
    year: "2026",
    date: "2026-03-30",
    reason: "Me gustaría acceder a los materiales de estudio y participar en el foro...",
    status: "pending",
  },
  {
    id: 2,
    name: "Laura Martínez",
    email: "laura.martinez@universidad.edu",
    studentId: "87654321",
    career: "Ingeniería en Sistemas",
    year: "2025",
    date: "2026-03-29",
    reason: "Quiero compartir mis apuntes y colaborar con otros estudiantes...",
    status: "pending",
  },
  {
    id: 3,
    name: "Diego Fernández",
    email: "diego.fernandez@universidad.edu",
    studentId: "45678912",
    career: "Ingeniería en Software",
    year: "2024",
    date: "2026-03-28",
    reason: "Necesito acceso a los materiales de años anteriores para preparar finales...",
    status: "pending",
  },
];

const mockMaterialRequests = [
  {
    id: 1,
    title: "Resumen Final - Arquitectura de Computadoras",
    subject: "Arquitectura de Computadoras",
    uploadedBy: "Ana López",
    date: "2026-03-30",
    type: "PDF",
    size: "3.2 MB",
    status: "pending",
  },
  {
    id: 2,
    title: "Ejercicios Resueltos - Matemática III",
    subject: "Matemática III",
    uploadedBy: "Roberto García",
    date: "2026-03-29",
    type: "PDF",
    size: "1.9 MB",
    status: "pending",
  },
  {
    id: 3,
    title: "Código de Práctica - Desarrollo Web",
    subject: "Desarrollo Web",
    uploadedBy: "María Ruiz",
    date: "2026-03-28",
    type: "ZIP",
    size: "5.4 MB",
    status: "pending",
  },
];

const mockAdmins = [
  {
    id: 1,
    name: "Dr. Carlos Martínez",
    email: "carlos.martinez@universidad.edu",
    role: "Coordinador",
    since: "2020",
  },
  {
    id: 2,
    name: "Lic. Ana López",
    email: "ana.lopez@universidad.edu",
    role: "Administrador",
    since: "2022",
  },
  {
    id: 3,
    name: "Ing. Roberto García",
    email: "roberto.garcia@universidad.edu",
    role: "Administrador",
    since: "2023",
  },
];

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"users" | "materials">("users");
  const [userRequests, setUserRequests] = useState(mockUserRequests);
  const [materialRequests, setMaterialRequests] = useState(mockMaterialRequests);
  const [selectedUserRequest, setSelectedUserRequest] = useState<UserRequest | null>(null);
  const [selectedMaterialRequest, setSelectedMaterialRequest] = useState<MaterialRequest | null>(null);

  const handleUserAction = (id: number, action: "approve" | "reject") => {
    setUserRequests(userRequests.map((req) =>
      req.id === id ? { ...req, status: action === "approve" ? "approved" : "rejected" } : req
    ));
    setSelectedUserRequest(null);
  };

  const handleMaterialAction = (id: number, action: "approve" | "reject") => {
    setMaterialRequests(materialRequests.map((req) =>
      req.id === id ? { ...req, status: action === "approve" ? "approved" : "rejected" } : req
    ));
    setSelectedMaterialRequest(null);
  };

  const pendingUsers = userRequests.filter((req) => req.status === "pending").length;
  const pendingMaterials = materialRequests.filter((req) => req.status === "pending").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl mb-2 text-foreground">Panel de Administración</h1>
        <p className="text-muted-foreground">Gestiona solicitudes de usuarios y aprobación de materiales</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-primary" />
            <span className="text-2xl text-card-foreground">{pendingUsers}</span>
          </div>
          <h3 className="text-sm text-muted-foreground">Solicitudes de Usuario Pendientes</h3>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-8 h-8 text-primary" />
            <span className="text-2xl text-card-foreground">{pendingMaterials}</span>
          </div>
          <h3 className="text-sm text-muted-foreground">Materiales Pendientes de Revisión</h3>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-primary" />
            <span className="text-2xl text-card-foreground">{pendingUsers + pendingMaterials}</span>
          </div>
          <h3 className="text-sm text-muted-foreground">Total de Tareas Pendientes</h3>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="border-b border-border">
          <div className="flex">
            <button
              onClick={() => setActiveTab("users")}
              className={`flex-1 px-6 py-4 transition-colors ${
                activeTab === "users"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <Users className="w-5 h-5 inline mr-2" />
              Solicitudes de Usuario ({pendingUsers})
            </button>
            <button
              onClick={() => setActiveTab("materials")}
              className={`flex-1 px-6 py-4 transition-colors ${
                activeTab === "materials"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <FileText className="w-5 h-5 inline mr-2" />
              Materiales ({pendingMaterials})
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === "users" && (
            <div className="space-y-4">
              {userRequests.map((request) => (
                <div
                  key={request.id}
                  onClick={() => setSelectedUserRequest(request)}
                  className={`border rounded-lg p-5 cursor-pointer transition-all hover:shadow-md ${
                    request.status === "pending"
                      ? "border-border bg-background"
                      : request.status === "approved"
                      ? "border-primary/30 bg-primary/5"
                      : "border-destructive/30 bg-destructive/5"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg mb-1 text-foreground">{request.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{request.email}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                        <span>Legajo: {request.studentId}</span>
                        <span>•</span>
                        <span>{request.career}</span>
                        <span>•</span>
                        <span>Año {request.year}</span>
                        <span>•</span>
                        <span>{new Date(request.date).toLocaleDateString("es-ES")}</span>
                      </div>
                    </div>
                    {request.status === "pending" ? (
                      <span className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm">
                        Pendiente
                      </span>
                    ) : request.status === "approved" ? (
                      <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Aprobado
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-destructive/20 text-destructive rounded-full text-sm flex items-center gap-1">
                        <XCircle className="w-4 h-4" />
                        Rechazado
                      </span>
                    )}
                  </div>
                  <div className="mb-4">
                    <p className="text-sm mb-1 text-muted-foreground">Motivo de la solicitud:</p>
                    <p className="text-sm text-foreground line-clamp-2">{request.reason}</p>
                  </div>
                  {request.status === "pending" && (
                    <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleUserAction(request.id, "approve")}
                        className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                      >
                        <Check className="w-5 h-5" />
                        Aprobar
                      </button>
                      <button
                        onClick={() => handleUserAction(request.id, "reject")}
                        className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors flex items-center justify-center gap-2"
                      >
                        <X className="w-5 h-5" />
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {userRequests.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No hay solicitudes de usuario
                </div>
              )}
            </div>
          )}

          {activeTab === "materials" && (
            <div className="space-y-4">
              {materialRequests.map((request) => (
                <div
                  key={request.id}
                  onClick={() => setSelectedMaterialRequest(request)}
                  className={`border rounded-lg p-5 cursor-pointer transition-all hover:shadow-md ${
                    request.status === "pending"
                      ? "border-border bg-background"
                      : request.status === "approved"
                      ? "border-primary/30 bg-primary/5"
                      : "border-destructive/30 bg-destructive/5"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="mb-1 text-foreground">{request.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{request.subject}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                          <span>Subido por: {request.uploadedBy}</span>
                          <span>•</span>
                          <span>{request.type} • {request.size}</span>
                          <span>•</span>
                          <span>{new Date(request.date).toLocaleDateString("es-ES")}</span>
                        </div>
                      </div>
                    </div>
                    {request.status === "pending" ? (
                      <span className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm whitespace-nowrap">
                        Pendiente
                      </span>
                    ) : request.status === "approved" ? (
                      <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm flex items-center gap-1 whitespace-nowrap">
                        <CheckCircle className="w-4 h-4" />
                        Aprobado
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-destructive/20 text-destructive rounded-full text-sm flex items-center gap-1 whitespace-nowrap">
                        <XCircle className="w-4 h-4" />
                        Rechazado
                      </span>
                    )}
                  </div>
                  {request.status === "pending" && (
                    <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleMaterialAction(request.id, "approve")}
                        className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                      >
                        <Check className="w-5 h-5" />
                        Aprobar y Publicar
                      </button>
                      <button
                        onClick={() => handleMaterialAction(request.id, "reject")}
                        className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors flex items-center justify-center gap-2"
                      >
                        <X className="w-5 h-5" />
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {materialRequests.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No hay materiales pendientes de revisión
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lista de Administradores */}
      <div className="bg-card border border-border rounded-lg p-6 mt-8">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Administradores del Portal</h2>
        </div>
        <div className="space-y-3">
          {mockAdmins.map((admin) => (
            <div
              key={admin.id}
              className="flex items-center justify-between p-4 bg-background border border-border rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{admin.name}</h3>
                  <p className="text-sm text-muted-foreground">{admin.email}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">{admin.role}</div>
                <div className="text-xs text-muted-foreground">Desde {admin.since}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de detalles de solicitud de usuario */}
      {selectedUserRequest && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedUserRequest(null)}
        >
          <div
            className="bg-card border border-border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-semibold text-foreground">Detalles de la Solicitud</h2>
              <button
                onClick={() => setSelectedUserRequest(null)}
                className="p-2 hover:bg-accent rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Nombre Completo</h3>
                <p className="text-foreground">{selectedUserRequest.name}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Email</h3>
                <p className="text-foreground">{selectedUserRequest.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Legajo</h3>
                  <p className="text-foreground">{selectedUserRequest.studentId}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Año de Ingreso</h3>
                  <p className="text-foreground">{selectedUserRequest.year}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Carrera</h3>
                <p className="text-foreground">{selectedUserRequest.career}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Fecha de Solicitud</h3>
                <p className="text-foreground">{new Date(selectedUserRequest.date).toLocaleDateString("es-ES", { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Motivo de la Solicitud</h3>
                <p className="text-foreground">{selectedUserRequest.reason}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Estado</h3>
                <div className="inline-flex">
                  {selectedUserRequest.status === "pending" ? (
                    <span className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm">
                      Pendiente
                    </span>
                  ) : selectedUserRequest.status === "approved" ? (
                    <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Aprobado
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-destructive/20 text-destructive rounded-full text-sm flex items-center gap-1">
                      <XCircle className="w-4 h-4" />
                      Rechazado
                    </span>
                  )}
                </div>
              </div>

              {selectedUserRequest.status === "pending" && (
                <div className="flex gap-3 pt-4 border-t border-border">
                  <button
                    onClick={() => handleUserAction(selectedUserRequest.id, "approve")}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Aprobar
                  </button>
                  <button
                    onClick={() => handleUserAction(selectedUserRequest.id, "reject")}
                    className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Rechazar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles de material */}
      {selectedMaterialRequest && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMaterialRequest(null)}
        >
          <div
            className="bg-card border border-border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-semibold text-foreground">Detalles del Material</h2>
              <button
                onClick={() => setSelectedMaterialRequest(null)}
                className="p-2 hover:bg-accent rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-foreground mb-1">{selectedMaterialRequest.title}</h3>
                  <p className="text-sm text-muted-foreground">{selectedMaterialRequest.subject}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Tipo de Archivo</h3>
                  <p className="text-foreground">{selectedMaterialRequest.type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Tamaño</h3>
                  <p className="text-foreground">{selectedMaterialRequest.size}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Subido por</h3>
                <p className="text-foreground">{selectedMaterialRequest.uploadedBy}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Fecha de Subida</h3>
                <p className="text-foreground">{new Date(selectedMaterialRequest.date).toLocaleDateString("es-ES", { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Estado</h3>
                <div className="inline-flex">
                  {selectedMaterialRequest.status === "pending" ? (
                    <span className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm">
                      Pendiente
                    </span>
                  ) : selectedMaterialRequest.status === "approved" ? (
                    <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Aprobado
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-destructive/20 text-destructive rounded-full text-sm flex items-center gap-1">
                      <XCircle className="w-4 h-4" />
                      Rechazado
                    </span>
                  )}
                </div>
              </div>

              {/* Botón de descarga del archivo */}
              <div className="pt-4 border-t border-border">
                <button
                  className="w-full px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-accent transition-colors flex items-center justify-center gap-2"
                  onClick={() => {
                    // Mock de descarga - en producción descargaría el archivo real
                    alert("Descargando archivo: " + selectedMaterialRequest.title);
                  }}
                >
                  <Download className="w-5 h-5" />
                  Descargar Archivo para Revisión
                </button>
              </div>

              {selectedMaterialRequest.status === "pending" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleMaterialAction(selectedMaterialRequest.id, "approve")}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Aprobar y Publicar
                  </button>
                  <button
                    onClick={() => handleMaterialAction(selectedMaterialRequest.id, "reject")}
                    className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Rechazar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}