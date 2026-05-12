import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, User, LogOut, FileText } from "lucide-react";

export const Header = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userUniversity");
    navigate("/login");
  };

  const userName = localStorage.getItem("userName") || "Usuario";
  // Número de solicitudes pendientes (mock - en producción vendría de backend)
  const solicitudesPendientes = 1;

  return (
    <nav className="bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/home" className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
            <span className="text-xl font-semibold text-primary-foreground" style={{ fontFamily: 'Work Sans, sans-serif' }}>
              Scholarium
            </span>
          </Link>
          
          <div className="flex items-center gap-2">
            <Link
              to="/solicitudes"
              className="flex items-center gap-2 px-4 py-2 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-dim transition-colors rounded-sm relative"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Mis Solicitudes</span>
              {solicitudesPendientes > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-sm flex items-center justify-center font-medium">
                  {solicitudesPendientes}
                </span>
              )}
            </Link>
            
            <Link
              to="/perfil"
              className="flex items-center gap-2 px-4 py-2 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-dim transition-colors rounded-sm"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Perfil</span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-dim transition-colors rounded-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};