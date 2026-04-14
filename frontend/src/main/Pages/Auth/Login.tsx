import { AuthForm } from '../../Components/AuthForm';

const Login = () => (
    <AuthForm 
        type="login" 
        title="Iniciar Sesión" 
        submitLabel="Iniciar sesión" 
        apiEndpoint="/api/auth/login" 
    />
);

export default Login;