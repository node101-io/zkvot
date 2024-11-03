export type ElectionModel = {
  mina_contract_id: string;
  storage_layer_id: string;
  storage_layer_platform: ['A', 'F', 'P'];
  start_date: Date;
  end_date: Date;
  question: string;
  options: string[];
  description: string;
  image_url: string;
  voters_list: {
    public_key: string;
  }[];
  voters_merkle_root: bigint;
  communication_layers: {
    type: 'avail' | 'celestia';
    start_block: number;
    namespace: string;
    block_hash: string;
    app_id: number;
  }[]
};

export type ElectionState = {
  start_date: Date;
  end_date: Date;
  question: string;
  options: string[];
  description: string;
  image_raw: string;
  voters_list: {
    public_key: string;
  }[];
  communication_layers: {
    type: 'avail' | 'celestia';
    start_block: number;
    namespace: string;
    block_hash: string;
    app_id: number;
  }[]
};
