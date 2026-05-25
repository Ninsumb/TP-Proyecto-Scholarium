import { GoogleLogin, } from '@react-oauth/google';
import type {  CredentialResponse } from '@react-oauth/google';
import { authService } from '../../services/AuthService';
import { useNavigate } from 'react-router';

interface GoogleAuthButtonProps {
  mode: 'login' | 'register';
  onError: (message: string) => void;
  onLoading: (loading: boolean) => void;
}

export default function GoogleAuthButton({ mode, onError, onLoading }: GoogleAuthButtonProps) {
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      onError("No se pudo obtener las credenciales de Google");
      return;
    }

    onLoading(true);
    onError(""); // Limpiar errores previos

    try {
      const response = await authService.loginWithGoogle({
        idToken: credentialResponse.credential
      });

      authService.saveSession(response);
      navigate("/home");
    } catch (err: any) {
      console.error("Error en Google auth:", err);
      
      // Manejo de errores específicos
      if (err.response?.data?.message) {
        onError(err.response.data.message);
      } else if (err.response?.status === 400) {
        onError("Ya existe una cuenta con este email. Por favor, inicia sesión con tu contraseña.");
      } else {
        const action = mode === 'login' ? 'iniciar sesión' : 'registrarse';
        onError(`Error al ${action} con Google. Intentá de nuevo.`);
      }
    } finally {
      onLoading(false);
    }
  };

  const handleGoogleError = () => {
    const action = mode === 'login' ? 'iniciar sesión' : 'registrarse';
    onError(`Error al ${action} con Google`);
  };

  const buttonText = mode === 'login' ? 'continue_with' : 'signup_with';

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        text={buttonText}
       /*  locale="es" */
        width="100%"
      />
    </div>
  );
}