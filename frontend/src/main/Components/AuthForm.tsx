import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { useNavigate, Link } from 'react-router-dom';

interface AuthFormProps {
    type: 'login' | 'register';
    title: string;
    submitLabel: string;
    apiEndpoint: string;
}

export const AuthForm: React.FC<AuthFormProps> = ({ type, title, submitLabel, apiEndpoint }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        
        if (!validateEmail(email)) {
            setError("Email inválido");
            return;
        }
        if (password.trim() === "") {
            setError("La contraseña no puede estar vacía");
            return;
        }

        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token); 
                navigate('/portales');
            } else {
                setError(type === 'login' ? "Credenciales incorrectas" : "Error en el registro");
            }
        } catch (err) {
            setError("Error de conexión con el servidor");
        }
    };

    return (
        <div className="flex justify-content-center align-items-center min-h-screen">
            <div className="card p-4 shadow-2 border-round w-full lg:w-4">
                <h2 className="text-center">{title}</h2>
                <form onSubmit={handleSubmit} className="flex flex-column gap-3">
                    
                    <div className="flex flex-column gap-2">
                        <label htmlFor="email">Email</label>
                        <InputText 
                            id="email" 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className={error === "Email inválido" ? 'p-invalid' : ''}
                        />
                    </div>

                    <div className="flex flex-column gap-2">
                        <label htmlFor="password">Password</label>
                        <Password 
                            id="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            feedback={type === 'register'} 
                            toggleMask 
                            className={error && password === "" ? 'p-invalid' : ''}
                        />
                    </div>

                    {error && <Message severity="error" text={error} />}

                    <Button label={submitLabel} type="submit" className="mt-2" />

                    <div className="text-center mt-3">
                        {type === 'login' ? (
                            <span>¿No tenés cuenta? <Link to="/register">Registrate</Link></span>
                        ) : (
                            <span>¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link></span>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};