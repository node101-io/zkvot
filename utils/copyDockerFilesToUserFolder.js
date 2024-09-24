const fs = require('fs');

module.exports = (data, callback) => {
  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.old_path || typeof data.old_path != 'string' || !data.old_path.trim().length)
    return callback('bad_request');

  if (!data.new_path || typeof data.new_path != 'string' || !data.new_path.trim().length)
    return callback('bad_request');

  if (data.replacements && (typeof data.replacements != 'object' || !Object.keys(data.replacements).length))
    return callback('bad_request');

  fs.readFile(data.old_path, 'utf8', (err, fileData) => {
    if (err)
      return callback('read_error');

    let newFileData = fileData;

    if (data.replacements) {
      for (const placeholder in data.replacements) {
        if (!data.replacements.hasOwnProperty(placeholder))
          return callback('bad_request');

        const value = data.replacements[placeholder];

        newFileData = newFileData.replace(new RegExp(placeholder.toUpperCase(), 'g'), value);
      };
    };

    fs.writeFile(data.new_path, newFileData, err => {
      if (err)
        return callback(err);

      return callback(null);
    });
  });
};
