import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, User, LogOut, FileText } from "lucide-react";
import { Sun } from "lucide-react";
import { Moon } from "lucide-react";
import { useState } from "react";
import { useSwitchTheme } from "../../Hooks/useSwitchTheme";
import { authService } from "../../services/AuthService";

export type HeaderProps = {
  darkTheme: Boolean
  switchTheme: () => void
}

export const Header = (props: HeaderProps) => {
  const navigate = useNavigate();
  //const { darkTheme, switchTheme } = useSwitchTheme();
  
const handleLogout = () => {
    authService.clearSession();
    navigate("/login");
};

  const userName = authService.getUserName() || "Usuario";
  // Número de solicitudes pendientes (mock - en producción vendría de backend)
  const solicitudesPendientes = 1;

  const [temaTest, setTemaTest] = useState(false);

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
              <button onClick={props.switchTheme} className="cursor-pointer">
                {
                  props.darkTheme ? 
                  <Sun className="text-primary-foreground"/> :
                  <Moon className="text-primary-foreground"/>
                }
              
              </button>

              <Link
                to="/perfil"
                className="flex items-center gap-2 px-4 py-2 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-dim transition-colors rounded-sm"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Perfil</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-dim transition-colors rounded-sm cursor-pointer"
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