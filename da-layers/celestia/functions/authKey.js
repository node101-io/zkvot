const fs = require('fs');
const path = require('path');
const { app, safeStorage } = require('electron');

const authKeyPath = path.join(app.getPath('userData'), 'authKey.txt');

let authKey = null;
let isEncryptionAvailable = false;

const AuthKey = {
  init: callback => {
    fs.access(
      authKeyPath,
      fs.constants.F_OK,
      err => {
        if (err)
          return callback(null);

        fs.readFile(
          authKeyPath,
          (err, keyData) => {
            if (err)
              return callback(err);

            isEncryptionAvailable = safeStorage.isEncryptionAvailable();

            authKey = keyData;

            return callback(null);
          }
        );
      }
    );
  },
  safeStore: (key, callback) => {
    isEncryptionAvailable = safeStorage.isEncryptionAvailable();

    fs.writeFile(
      authKeyPath,
      isEncryptionAvailable ? safeStorage.encryptString(key) : key,
      err => {
        if (err)
          return callback(err);

        AuthKey.init(err => {
          if (err)
            return callback(err);

          return callback(null);
        });
      }
    );
  },
  get: _ => isEncryptionAvailable ? safeStorage.decryptString(authKey) : authKey
};

module.exports = AuthKey;