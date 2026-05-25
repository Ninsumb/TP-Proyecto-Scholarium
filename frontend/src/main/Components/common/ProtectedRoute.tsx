// src/main/Components/common/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { authService } from '../../services/AuthService';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!authService.isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};