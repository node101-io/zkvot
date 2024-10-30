export interface DaLayerInfo {
  name: 'avail' | 'celestia',
  start_block_height: number
};

export interface AvailDaLayerInfo extends DaLayerInfo {
  app_id: number
};

export type AvailDataTx = {
  data: string
};

export interface CelestiaDaLayerInfo extends DaLayerInfo {
  namespace: string,
  start_block_hash: string
};

export type CelestiaDataTx = {
  namespace: string,
  data: string,
  share_version: number,
  commitment: string,
  index: number
};
