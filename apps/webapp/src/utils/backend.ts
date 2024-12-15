import { types } from 'zkvot-core';

const API_URL = process.env.NODE_ENV === 'production' ?
  'https://backend.zkvot.io/api' :
  'http://localhost:8000/api';

export const submitElectionToBackend = async (
  mina_contract_id: string
): Promise<types.ElectionBackendData | undefined> => {
  try {
    const response = await fetch(`${API_URL}/election/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mina_contract_id,
        is_devnet: !!process.env.DEVNET
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
  };
};

export const fetchElectionsFromBackend = async (
  skip: number = 0,
  is_ongoing: boolean = true
): Promise<types.ElectionBackendData[]> => {
  try {
    const response = await fetch(`${API_URL}/election/filter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        skip,
        is_ongoing,
        is_devnet: !!process.env.DEVNET
      })
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

export const fetchElectionResultByContractIdFromBackend = async (
  id: string
): Promise<{
  result: {
    name: string,
    percentage: number,
    voteCount: string,
  }[],
  proof: string
}> => {
  try {
    const response = await fetch(`${API_URL}/election/result`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id
      })
    });

    if (!response.ok)
      throw new Error('Failed to fetch the election result');

    const result = await response.json();

    if (!result.success)
      throw new Error(result.error || 'Failed to fetch the election result');

    return result.data;
  } catch (error) {
    throw new Error('Failed to fetch election result');
  };
};

export const sendVoteViaBackend = async (
  da_layer_submission_data: types.DaLayerSubmissionData,
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
        is_devnet: !!process.env.DEVNET,
        da_layer_submission_data,
        election_contract_id,
        da_layer
      })
    });

    if (!response.ok)
      throw new Error('Failed to submit vote to backend');

    const result = await response.json();

    console.log(result);

    if (!result.success)
      throw new Error(result.error || 'Failed to suvmit vote to backend');

    return result.vote;
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