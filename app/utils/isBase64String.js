const BASE64_REGEX = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
const DEFAULT_MAX_TEXT_FIELD_LENGTH = 1e4;

/**
 * @param {string} data
 * @returns {boolean}
 */
module.exports = data => {
  if (!data || typeof data != 'string' || !data.trim().length || data.trim().length > DEFAULT_MAX_TEXT_FIELD_LENGTH)
    return false;

  return BASE64_REGEX.test(data);
};