import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { portalService } from '../Services/Portal/PortalService';
import type { PortalDetailResponse, RolUsuario } from '../types/Portal/Portal';
import { getRolFromPortal } from '../types/Portal/Portal';

interface UsePortalContextReturn {
  portal: PortalDetailResponse | null;
  loading: boolean;
  error: string | null;
  rol: RolUsuario;
  isMember: boolean;
  isAdmin: boolean;
  isGuest: boolean;
  portalId: number;
  refetch: () => Promise<void>;
}

export function usePortalContext(): UsePortalContextReturn {
  const { portalId } = useParams();
  const navigate = useNavigate();
  
  const [portal, setPortal] = useState<PortalDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortalData = async () => {
    if (!portalId) {
      setError('ID de portal no válido');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await portalService.getPortalDetail(Number(portalId));
      setPortal(data);
    } catch (err: any) {
      console.error('Error al cargar portal:', err);
      
      if (err.response?.status === 404) {
        setError('Portal no encontrado');
        setTimeout(() => navigate('/'), 3000);
      } else if (err.response?.status === 403) {
        setError('No tienes acceso a este portal');
      } else {
        setError('Error al cargar el portal. Verifica tu conexión.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, [portalId]);

  
  const rol: RolUsuario = portal ? getRolFromPortal(portal) : 'GUEST';
  const isMember = rol === 'MIEMBRO' || rol === 'ADMIN';
  const isAdmin = rol === 'ADMIN';
  const isGuest = rol === 'GUEST';

  return {
    portal,
    loading,
    error,
    rol,
    isMember,
    isAdmin,
    isGuest,
    portalId: Number(portalId),
    refetch: fetchPortalData,
  };
}