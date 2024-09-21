const fs = require('fs');

module.exports = (data, callback) => {
  if (!data || typeof data !== 'object')
    return callback('bad_request');

  if (!data.old_path || typeof data.old_path !== 'string' || !data.old_path.trim().length)
    return callback('bad_request');

  if (!data.new_path || typeof data.new_path !== 'string' || !data.new_path.trim().length)
    return callback('bad_request');

  fs.readFile(
    data.old_path,
    (err, fileData) => {
      if (err)
        return callback(err);

      fs.writeFile(
        data.new_path,
        fileData,
        err => {
          if (err)
            return callback(err);

          return callback(null);
        }
      );
    }
  );
};