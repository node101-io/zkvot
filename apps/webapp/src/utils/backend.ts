import { types } from 'zkvot-core';

import mockElections from './mockElectionsData.js';

const API_URL = 'https://backend.zkvot.io/api';

export const fetchElectionsFromBackend = async (
  skip: number = 0,
  is_ongoing: boolean = true
): Promise<types.ElectionBackendData[] | Error> => {
  try {
    const url = `${API_URL}/election/filter?skip=${skip}&is_ongoing=${is_ongoing}`;

    const response = await fetch(url, {
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

export const sendVoteViaBackend = async (
  vote: string,
  election_contract_id: string,
  da_layer: 'avail' | 'celestia'
) => {
  try {
    const response = await fetch('/api/vote/send', {
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
    const response = await fetch('/block-info/avail');

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
    const response = await fetch('https://backend.zkvot.io/api/block-info/celestia');

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
