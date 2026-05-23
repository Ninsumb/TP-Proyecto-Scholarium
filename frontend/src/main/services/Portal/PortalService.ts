import apiClient from '../../services/apiClient';
import type { PortalDetailResponse } from '../../types/Portal/Portal';
import type { Block } from '../../Components/PortalHome-blocks/BlockComponents';

export interface BlocksResponse {
  blocks: Block[];
  error?: string;
}

export interface UpdateBlocksRequest {
  blocks: Block[];
}

export interface BloqueBackendResponse {
  id: string;
  type: string;
  data: Record<string, any>;
  orden: number;
}

class PortalService {
  async getPortalDetail(portalId: number): Promise<PortalDetailResponse> {
    const response = await apiClient.get<PortalDetailResponse>(`/portales/${portalId}`);
    return response.data;
  }

  async getHomeBlocks(portalId: number): Promise<BlocksResponse> {
    const response = await apiClient.get<BlocksResponse>(`/portales/${portalId}/home`);
    return response.data;
  }

  async updateHomeBlocks(portalId: number, blocks: Block[]): Promise<BlocksResponse> {
    const response = await apiClient.put<BlocksResponse>(`/portales/${portalId}/home`, { blocks });
    return response.data;
  }
}

export const portalService = new PortalService();