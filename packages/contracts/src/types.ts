namespace typesNamespace {
  export interface DaLayerInfo {
    name: 'Avail' | 'Celestia',
    start_block_height: number
  };

  export type AvailDaLayerInfo = DaLayerInfo & {
    app_id: number
  };

  export type AvailDataTx = {
    data: string
  };

  export type CelestiaDaLayerInfo = DaLayerInfo & {
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

  export type VoterCustomFields = {
    [key: string]: string;
  };
  export type Voter = VoterCustomFields & {
    public_key: string;
  };

  export type StorageLayerPlatformCodes = 'A' | 'F';
  export type StorageLayerPlatformNames = 'Arweave' | 'Filecoin';
  export type CommunicationLayerNames = 'Avail' | 'Celestia';

  export type ElectionStaticData = {
    start_date: Date;
    end_date: Date;
    question: string;
    options: string[];
    description: string;
    image_raw: string;
    voters_list: Voter[];
    communication_layers: (AvailDaLayerInfo | CelestiaDaLayerInfo)[]
  };
  export type ElectionBackendData = {
    is_devnet: boolean;
    mina_contract_id: string;
    storage_layer_id: string;
    storage_layer_platform: StorageLayerPlatformCodes;
    start_date: Date;
    end_date: Date;
    question: string;
    options: string[];
    description: string;
    image_url: string;
    voters_list: Voter[];
    voters_merkle_root: bigint;
    communication_layers: (AvailDaLayerInfo | CelestiaDaLayerInfo)[]
  };
};

export default typesNamespace;
