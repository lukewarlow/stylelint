// NOTICE: This file is generated by Rollup. To modify it,
// please instead edit the ESM counterpart and rebuild with Rollup (npm run build).
'use strict';

const validateTypes = require('./validateTypes.cjs');

/**
 * Check whether the variable is an object and all its properties are one or more values
 * that satisfy the specified validator(s):
 *
 * @example
 * ignoreProperties = {
 *   value1: ["item11", "item12", "item13"],
 *   value2: "item2",
 * };
 * validateObjectWithArrayProps(isString)(ignoreProperties);
 * //=> true
 *
 * @typedef {(value: unknown) => boolean} Validator
 * @param {...Validator} validators
 * @returns {Validator}
 */
function validateObjectWithArrayProps(...validators) {
	return (value) => {
		if (!validateTypes.isPlainObject(value)) {
			return false;
		}

		return Object.values(value)
			.flat()
			.every((item) => validators.some((v) => v(item)));
	};
}

module.exports = validateObjectWithArrayProps;