import { JsonProof } from 'o1js';

import { AvailDaLayerInfo, CelestiaDaLayerInfo } from './daLayers.js';

export type Election = {
  mina_contract_id: string,
  end_block: number,
  question: string,
  options: string[],
  description: string,
  image_url?: string,
  image_raw?: string,
  voters_list: object[],
  da_layers: (AvailDaLayerInfo | CelestiaDaLayerInfo)[]
};

export type AggregatedElectionResult = {
  electionId: string,
  result?: JsonProof
};
