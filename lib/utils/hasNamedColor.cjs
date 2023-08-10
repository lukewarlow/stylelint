'use strict';

const keywords = require('../reference/keywords.cjs');

const HAS_NAMED_COLOR = new RegExp(`\\b(?:${[...keywords.namedColorsKeywords.values()].join('|')})\\b`, 'i');

/**
 * Check if a value contains any standard CSS named color
 *
 * `transparent` and `currentcolor` are not named colors
 *
 * @param {string} value
 * @returns {boolean}
 */
function hasNamedColor(value) {
	return HAS_NAMED_COLOR.test(value);
}

module.exports = hasNamedColor;
