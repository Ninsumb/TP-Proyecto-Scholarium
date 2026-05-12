import type { Block } from '../../Components/PortalHome-blocks/BlockComponents';


export interface BlocksResponse {
  blocks: Block[];
  error?: string;
}

export interface UpdateBlocksRequest {
  blocks: Block[];
}
