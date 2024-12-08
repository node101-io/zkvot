import { types } from 'zkvot-core';

const API_URL = process.env.NODE_ENV === 'production' ? 'https://backend.zkvot.io/api' : 'http://localhost:8000/api';

export const submitElectionToBackend = async (
  mina_contract_id: string
): Promise<types.ElectionBackendData> => {
  try {
    const response = await fetch(`${API_URL}/election/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mina_contract_id,
        is_devnet: process.env.NODE_ENV !== 'production'
      })
    });

    if (!response.ok)
      throw new Error('Failed to submit election to the backend');

    const result = await response.json();

    if (!result.success)
      throw new Error(result.error || 'Failed to submit election to the backend');

    return result.election;
  } catch (error) {
    console.log(error);
    throw new Error('Failed to submit election to the backend');
  };
};

export const fetchElectionsFromBackend = async (
  skip: number = 0,
  is_ongoing: boolean = true
): Promise<types.ElectionBackendData[]> => {
  try {
    const response = await fetch(`${API_URL}/election/filter?skip=${skip}&is_ongoing=${is_ongoing}&is_devnet=${process.env.NODE_ENV !== 'production'}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok)
      throw new Error('Failed to fetch elections');

    const result = await response.json();

    if (!result.success)
      throw new Error(result.error || 'Failed to fetch elections');

    return result.elections;
  } catch (error) {
    throw new Error('Failed to fetch elections');
  };
};

export const fetchElectionByContractIdFromBackend = async (
  id: string
): Promise<types.ElectionBackendData> => {
  try {
    const response = await fetch(`${API_URL}/election/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok)
      throw new Error('Failed to fetch the election');

    const result = await response.json();

    if (!result.success)
      throw new Error(result.error || 'Failed to fetch the election');

    return result.election;
  } catch (error) {
    throw new Error('Failed to fetch elections');
  };
};

export const sendVoteViaBackend = async (
  vote: string,
  election_contract_id: string,
  da_layer: types.DaLayerInfo['name']
) => {
  try {
    const response = await fetch(`${API_URL}/vote/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vote,
        election_contract_id,
        da_layer
      })
    });

    if (!response.ok)
      throw new Error('Failed to submit vote to backend');

    const result = await response.json();

    if (!result.success)
      throw new Error(result.error || 'Failed to suvmit vote to backend');

    return result.elections;
  } catch (error) {
    throw new Error('Failed to submit vote to backend');
  }
};

export const fetchAvailBlockHeightFromBackend = async () => {
  try {
    const response = await fetch(`${API_URL}/block-info/avail`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error fetching Avail block data: ${errorText}`);
    }

    const result = await response.json();

    if (result.success) {
      return result.block_height;
    } else {
      throw new Error(`Error in response data: ${result.error}`);
    }
  } catch (error) {
    console.error('Error fetching Avail block data:', error);
    throw error;
  }
};

export const fetchCelestiaBlockInfoFromBackend = async () => {
  try {
    const response = await fetch(`${API_URL}/block-info/celestia`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error fetching Celestia block data: ${errorText}`);
    }

    const result = await response.json();

    if (result.success) {
      return {
        blockHeight: result.block_height,
        blockHash: result.block_hash,
      };
    } else {
      throw new Error(`Error in response data: ${result.error}`);
    }
  } catch (error) {
    console.error('Error fetching Celestia block data:', error);
    throw error;
  }
};

export const calculateMinaBlockHeightFromTimestampViaBackend = async (
  start_date: Date,
  end_date: Date
): Promise<{
  startBlockHeight: number;
  endBlockHeight: number;
}> => {
  try {
    const response = await fetch(`${API_URL}/block-info/mina`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        start_date,
        end_date
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error calculating Mina block height: ${errorText}`);
    }

    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(`Error in response data: ${result.error}`);
    }
  } catch (error) {
    console.error('Error calculating Mina block height:', error);
    throw error;
  }
}
