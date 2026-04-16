import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { login, register } from '../service/authService';

interface AuthFormProps {
    type: 'login' | 'register';
    title: string;
    submitLabel: string;
}

export const AuthForm: React.FC<AuthFormProps> = ({ type, title, submitLabel }) => {
    const [email, setEmail] = useState('');
    const [nombre, setNombre] = useState('USER') // FALTA EL CAMPO DEL NOMBRE EN EL REGISTRO
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();

    const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validaciones frontend (lógica de tu compañera)
        if (!validateEmail(email)) {
            setError("Email inválido");
            return;
        }
        if (password.trim() === "") {
            setError("La contraseña no puede estar vacía");
            return;
        }

        try {
            if (type === "login"){
                await login({email,password})
            
                if(rememberMe){
                    localStorage.setItem("userEmail",email)
                }

                navigate("/portales")
            } else {
                await register({nombre,email,password})
                navigate("/login")
            }
        } catch (err) {
            setError(type === "login" ? "Credenciales incorrectas" : "Error en el registro");
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Header con logo (diseño Figma) */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <GraduationCap className="w-12 h-12 text-primary" />
                        <h1 className="text-3xl font-bold text-foreground">
                            Portal Universitario
                        </h1>
                    </div>
                    <p className="text-muted-foreground">
                        {type === 'login' 
                            ? 'Accede a tus carreras y materiales de estudio'
                            : 'Crea tu cuenta para comenzar'}
                    </p>
                </div>

                {/* Card del formulario (diseño Figma) */}
                <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
                    <h2 className="text-2xl font-semibold text-foreground mb-6">
                        {title}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Campo Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-foreground mb-2"
                            >
                                {type === 'login' ? 'Correo Electrónico' : 'Email'}
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                                    error === "Email inválido" ? 'border-red-500' : 'border-border'
                                }`}
                                placeholder={type === 'login' ? 'tu.correo@universidad.edu' : 'email@ejemplo.com'}
                            />
                        </div>

                        {/* Campo Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-foreground mb-2"
                            >
                                Contraseña
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                                    error && password === "" ? 'border-red-500' : 'border-border'
                                }`}
                                placeholder="••••••••"
                            />
                        </div>

                        {/* Opciones adicionales (solo para login) */}
                        {type === 'login' && (
                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                    />
                                    Recordarme
                                </label>
                                <a
                                    href="#"
                                    className="text-primary hover:underline"
                                >
                                    ¿Olvidaste tu contraseña?
                                </a>
                            </div>
                        )}

                        {/* Mensaje de error */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        {/* Botón Submit */}
                        <button
                            type="submit"
                            className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:opacity-90 transition-opacity font-medium"
                        >
                            {submitLabel}
                        </button>
                    </form>

                    {/* Footer con link a registro/login */}
                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        {type === 'login' ? (
                            <>
                                ¿No tenés cuenta?{" "}
                                <Link
                                    to="/register"
                                    className="text-primary hover:underline font-medium"
                                >
                                    Registrate
                                </Link>
                            </>
                        ) : (
                            <>
                                ¿Ya tenés cuenta?{" "}
                                <Link
                                    to="/login"
                                    className="text-primary hover:underline font-medium"
                                >
                                    Iniciá sesión
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};