const { safeStorage } = require('electron');

let authKey = null;
let isEncryptionAvailable = false;

const AuthKey = {
  safeStore: key => {
    isEncryptionAvailable = safeStorage.isEncryptionAvailable();

    authKey = isEncryptionAvailable ? safeStorage.encryptString(key) : key;
  },
  get: _ => isEncryptionAvailable ? safeStorage.decryptString(authKey) : authKey
};

module.exports = AuthKey;