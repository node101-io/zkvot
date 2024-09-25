const fs = require('fs');
const path = require('path');
const { app, safeStorage } = require('electron');

const safeStorageFilePath = path.join(app.getPath('userData'), 'safeStorage.json');

const AVAIL_MNEMONIC_DATA_FIELD = 'avail_mnemonic';
const CELESTIA_AUTH_KEY_DATA_FIELD = 'celestia_auth_key';

let availMnemonic = null;
let celestiaAuthKey = null;

let isEncryptionAvailable = false;

const writeToSafeStore = (data, callback) => {
  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.field || typeof data.field != 'string' || !data.field.trim().length)
    return callback('bad_request');

  if (!data.key)
    return callback('bad_request');

  fs.readFile(
    safeStorageFilePath,
    (err, fileData) => {
      if (err)
        return callback(err);

      const storageData = JSON.parse(fileData);

      storageData[data.field] = data.key;

      fs.writeFile(
        safeStorageFilePath,
        JSON.stringify(storageData, null, 2),
        err => {
          if (err)
            return callback(err);

          return callback(null);
        }
      );
    }
  );
};

const SafeStore = {
  init: callback => {
    fs.access(
      safeStorageFilePath,
      fs.constants.F_OK,
      err => {
        if (err && err.code === 'ENOENT') {
          fs.writeFile(
            safeStorageFilePath,
            JSON.stringify({}, null, 2),
            err => {
              if (err)
                return callback(err);

              return callback(null);
            }
          );
        };

        if (err)
          return callback(null);

        fs.readFile(
          safeStorageFilePath,
          (err, data) => {
            if (err)
              return callback(err);

            const storageData = JSON.parse(data);

            if (Object.keys(storageData).length == 0)
              return callback(null);

            isEncryptionAvailable = safeStorage.isEncryptionAvailable();

            availMnemonic = storageData.avail_mnemonic && isEncryptionAvailable ? Buffer.from(storageData.avail_mnemonic.data) : storageData.avail_mnemonic;
            celestiaAuthKey = storageData.celestia_auth_key && isEncryptionAvailable ? Buffer.from(storageData.celestia_auth_key.data) : storageData.celestia_auth_key;

            return callback(null);
          }
        );
      }
    );
  },
  keepAvailMnemonic: (mnemonic, callback) => {
    isEncryptionAvailable = safeStorage.isEncryptionAvailable();

    writeToSafeStore({
      field: AVAIL_MNEMONIC_DATA_FIELD,
      key: isEncryptionAvailable ? safeStorage.encryptString(mnemonic) : mnemonic
    }, err => {
      if (err)
        return callback(err);

      SafeStore.init(err => {
        if (err)
          return callback(err);

        return callback(null);
      });
    });
  },
  keepCelestiaAuthKey: (auth_key, callback) => {
    isEncryptionAvailable = safeStorage.isEncryptionAvailable();

    writeToSafeStore({
      field: CELESTIA_AUTH_KEY_DATA_FIELD,
      key: isEncryptionAvailable ? safeStorage.encryptString(auth_key) : auth_key
    }, err => {
      if (err)
        return callback(err);

      SafeStore.init(err => {
        if (err)
          return callback(err);

        return callback(null);
      });
    });
  },
  getAvailMnemonic: _ => isEncryptionAvailable ? safeStorage.decryptString(availMnemonic) : availMnemonic,
  getCelestiaAuthKey: _ => isEncryptionAvailable ? safeStorage.decryptString(celestiaAuthKey) : celestiaAuthKey
};

module.exports = SafeStore;