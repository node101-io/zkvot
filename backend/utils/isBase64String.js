const validator = require('./validator');

const BASE64_REGEX = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

module.exports = data => {
  if (!validator(data, { required: true, type: "string" })) return false;

  return BASE64_REGEX.test(data);
};
