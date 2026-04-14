import { AuthForm } from '../../Components/AuthForm';

const Register = () => (
    <AuthForm 
        type="register" 
        title="Crear Cuenta" 
        submitLabel="Registrarse" 
        apiEndpoint="/api/auth/register" 
    />
);

export default Register;