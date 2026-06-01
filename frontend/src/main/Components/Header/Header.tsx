import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, User, LogOut, Bell } from "lucide-react";
import { Sun, Moon } from "lucide-react";
import { authService } from "../../services/AuthService";

export type HeaderProps = {
    darkTheme: Boolean;
    switchTheme: () => void;
    // Cuando el sistema de notificaciones esté implementado, este prop
    // vendrá del contexto/store global con el conteo real del back.
    // Por ahora se puede pasar desde el componente padre o dejarlo en 0.
    unreadNotifications?: number;
};

export const Header = (props: HeaderProps) => {
    const navigate = useNavigate();
    const unread = props.unreadNotifications ?? 0;

    const handleLogout = () => {
        authService.clearSession();
        navigate("/login");
    };

    return (
        <nav className="bg-primary">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/home" className="flex items-center gap-2">
                        <GraduationCap className="w-8 h-8 text-primary-foreground" />
                        <span
                            className="text-xl font-semibold text-primary-foreground"
                            style={{ fontFamily: "Work Sans, sans-serif" }}
                        >
                            Scholarium
                        </span>
                    </Link>

                    <div className="flex items-center gap-2">
                        {/* Modo oscuro */}
                        <button
                            onClick={props.switchTheme}
                            className="p-2 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-dim transition-colors rounded-sm cursor-pointer"
                        >
                            {props.darkTheme ? (
                                <Sun className="w-5 h-5" />
                            ) : (
                                <Moon className="w-5 h-5" />
                            )}
                        </button>

                        {/* Notificaciones */}
                        <Link
                            to="/notificaciones"
                            className="relative p-2 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-dim transition-colors rounded-sm"
                            title="Notificaciones"
                        >
                            <Bell className="w-5 h-5" />
                            {unread > 0 && (
                                <span
                                    className="absolute top-1 right-1 flex items-center justify-center text-primary-foreground font-semibold leading-none"
                                    style={{
                                        background: "var(--destructive)",
                                        minWidth: "16px",
                                        height: "16px",
                                        borderRadius: "999px",
                                        fontSize: "10px",
                                        padding: "0 3px",
                                        // Tiny ring so it lifts off the icon visually
                                        boxShadow: "0 0 0 2px var(--primary)",
                                    }}
                                >
                                    {unread > 99 ? "99+" : unread}
                                </span>
                            )}
                        </Link>

                        {/* Mi Cuenta */}
                        <Link
                            to="/configuracion"
                            className="flex items-center gap-2 px-4 py-2 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-dim transition-colors rounded-sm"
                        >
                            <User className="w-4 h-4" />
                            <span className="hidden sm:inline">Mi Cuenta</span>
                        </Link>

                        {/* Salir */}
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