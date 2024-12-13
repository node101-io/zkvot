import fs from 'fs';
import path from 'path';

import { types } from 'zkvot-core';

const DEFAULT_DATA = JSON.stringify({
  avail: 0,
  celestia: 0
})
const DATA_PATH = path.join(__dirname, '../data/lastReadBlock.json');

const getLastReadBlock = (da: types.CommunicationLayerNames): number => {
  let data;

  try {
    data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  } catch (_) {
    data = JSON.parse(DEFAULT_DATA);
    fs.writeFileSync(DATA_PATH, DEFAULT_DATA);
  }

  return da in data ? data[da] : 0;
};