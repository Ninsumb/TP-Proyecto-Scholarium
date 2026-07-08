// src/main/Components/common/AdminRoute.tsx
import { Navigate } from 'react-router-dom';
import { usePortalContext } from '../../hooks/usePortalContext';

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAdmin, loading } = usePortalContext();

    // Mientras el portal no terminó de cargar, no renderizamos nada.
    // El loading spinner ya lo maneja PortalLayout, así que acá solo
    // devolvemos null para no interferir con ese flujo.
    if (loading) return null;

    if (!isAdmin) {
        return <Navigate to="/home" replace />;
    }

    return <>{children}</>;
};