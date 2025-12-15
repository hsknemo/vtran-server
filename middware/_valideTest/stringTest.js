const StringValidator = require('../validator/StringValidator');
const stringValidator = new StringValidator({ value: 'a11243a', range: { min: 5, max: 10 }, reg: /^\d/g });
console.log(stringValidator.notEmpty().isString().len().regExp())
