import fs from 'fs';

export default (folderPath, callback) => {
  if (!folderPath || typeof folderPath != 'string' || !folderPath.trim().length)
    return callback('bad_request');

  fs.access(folderPath, fs.constants.F_OK, err => {
    if (err && err.code == 'ENOENT') {
      fs.mkdir(folderPath, { recursive: true }, err => {
        if (err)
          return callback('folder_error');

        return callback(null);
      });
    } else if (err) {
      return callback('folder_error');
    } else {
      return callback(null);
    };
  });
};