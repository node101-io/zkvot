import fs from 'fs';

export default (
  data: {
    old_path: string,
    new_path: string,
    replacements?: {[placeholder: string]: string}
  },
  callback: (err: string | null) => void
) => {
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
        return callback('write_error');

      return callback(null);
    });
  });
};
