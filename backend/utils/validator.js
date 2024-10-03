const types = ['string', 'number', 'object', 'array', 'boolean', 'date'];
const typesWithLength = ['string', 'array'];
const typesWithComparableValue = ['number'];

function isValidDate(value) {
    // Check if it's an instance of Date and it's valid
    if (value instanceof Date && !isNaN(value.getTime())) {
        return true;
    }

    // Check if it's a valid Unix timestamp (number)
    if (typeof value === 'number' && !isNaN(new Date(value).getTime())) {
        return true;
    }

    // Check if it's a valid ISO 8601 date string
    if (typeof value === 'string' && !isNaN(Date.parse(value))) {
        return true;
    }
    
    console.log('date is not valid');
    return false;
}


/**
 * Validates a value based on the provided options.
 * required option are true by default.
 * @param {any} value - The value to be validated.
 * @param {Object} options - The validation options.
 * @param {boolean} options.required - Specifies if the value is required.
 * @param {string} options.type - Specifies the expected type of the value.
 * @param {number} options.minLength - Specifies the minimum length of the value.
 * @param {number} options.maxLength - Specifies the maximum length of the value.
 * @param {number} options.minValue - Specifies the minimum value of the number.
 * @param {number} options.maxValue - Specifies the maximum value of the number.
 * @param {Array} options.objectContainsKeys - Specifies the object should contain the keys.
 * @returns {boolean} - Returns true if the value is valid, false otherwise.
 */

//TODO: Check for nested keys in objectContainsKeys.
module.exports = (value, options) => {
  if (!options || typeof options !== 'object') return false;

  if(!('required' in options && typeof options.required === 'boolean' && options.required === false)) {
    if (typeof value === 'string' && value.trim() === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    if (typeof value === 'object' && options.type !== 'date' && Object.keys(value).length === 0) return false;
} else {
    if(value === undefined || value === null) return true;
}

console.log('value:', value);
  if ('type' in options && typeof options.type === 'string' && types.includes(options.type)) {
      if (options.type === 'array' && !Array.isArray(value)) return false;

      if (options.type === 'date' && !isValidDate(value)) return false;

      if (options.type !== 'array' && options.type !== 'date' && options.type !== typeof value) return false;
}

  if (options.minLength && typesWithLength.includes(typeof value) && value.length < options.minLength) return false;
  
  if (options.maxLength && typesWithLength.includes(typeof value) && value.length > options.maxLength) return false;
  
  if (options.minValue && typeof typesWithComparableValue.includes(typeof options.minValue) && typesWithComparableValue.includes(typeof value) && value < options.minValue) return false;
  
  if (options.maxValue && typeof typesWithComparableValue.includes(typeof options.maxValue) && typesWithComparableValue.includes(typeof value) && value > options.maxValue) return false;
  
  if (options.objectContainsKeys) {
      if (typeof value !== 'object' || Array.isArray(value)) {
          console.warn('Warning: objectContainsKeys is specified but value is not an object.');
          return false;
      }

      if (Array.isArray(options.objectContainsKeys) && options.objectContainsKeys.length > 0) {
          const keys = Object.keys(value);
          if (!options.objectContainsKeys.every(key => keys.includes(key))) return false;
      }
  }

  return true
}

// const testValidation = () => {
//     const tests = [
//         { value: { a: 1, b: 2 }, options: { objectContainsKeys: ['a', 'b'] }, expected: true },
//         { value: { a: 1, b: 2 }, options: { objectContainsKeys: ['a', 'c'] }, expected: false },
//         { value: { a: 1 }, options: { objectContainsKeys: ['a'] }, expected: true },
//         { value: {}, options: { objectContainsKeys: ['a'] }, expected: false },
//         { value: { a: 1, b: 2, c: 3 }, options: { objectContainsKeys: ['a', 'b', 'c'] }, expected: true },
//         { value: 'notAnObject', options: { objectContainsKeys: ['a'] }, expected: false }
//     ];

//     tests.forEach((test, index) => {
//         const result = module.exports(test.value, test.options);
//         console.log(`Test ${index + 1}: ${result === test.expected ? 'PASSED' : 'FAILED'}`);
//     });
// }

// testValidation();
