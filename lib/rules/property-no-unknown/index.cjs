// NOTICE: This file is generated by Rollup. To modify it,
// please instead edit the ESM counterpart and rebuild with Rollup (npm run build).
'use strict';

const knownCssProperties = require('known-css-properties');
const typeGuards = require('../../utils/typeGuards.cjs');
const validateTypes = require('../../utils/validateTypes.cjs');
const isCustomProperty = require('../../utils/isCustomProperty.cjs');
const isStandardSyntaxDeclaration = require('../../utils/isStandardSyntaxDeclaration.cjs');
const isStandardSyntaxProperty = require('../../utils/isStandardSyntaxProperty.cjs');
const optionsMatches = require('../../utils/optionsMatches.cjs');
const report = require('../../utils/report.cjs');
const ruleMessages = require('../../utils/ruleMessages.cjs');
const validateOptions = require('../../utils/validateOptions.cjs');
const vendor = require('../../utils/vendor.cjs');

const ruleName = 'property-no-unknown';

const messages = ruleMessages(ruleName, {
	rejected: (property) => `Unexpected unknown property "${property}"`,
});

const meta = {
	url: 'https://stylelint.io/user-guide/rules/property-no-unknown',
};

/** @type {import('stylelint').Rule} */
const rule = (primary, secondaryOptions) => {
	const allValidProperties = new Set(knownCssProperties.all);

	return (root, result) => {
		const validOptions = validateOptions(
			result,
			ruleName,
			{ actual: primary },
			{
				actual: secondaryOptions,
				possible: {
					ignoreProperties: [validateTypes.isString, validateTypes.isRegExp],
					checkPrefixed: [validateTypes.isBoolean],
					ignoreSelectors: [validateTypes.isString, validateTypes.isRegExp],
					ignoreAtRules: [validateTypes.isString, validateTypes.isRegExp],
				},
				optional: true,
			},
		);

		if (!validOptions) {
			return;
		}

		const shouldCheckPrefixed = secondaryOptions && secondaryOptions.checkPrefixed;

		root.walkDecls(checkStatement);

		/**
		 * @param {import('postcss').Declaration} decl
		 */
		function checkStatement(decl) {
			const prop = decl.prop;

			if (!isStandardSyntaxProperty(prop)) {
				return;
			}

			if (!isStandardSyntaxDeclaration(decl)) {
				return;
			}

			if (isCustomProperty(prop)) {
				return;
			}

			if (!shouldCheckPrefixed && vendor.prefix(prop)) {
				return;
			}

			if (optionsMatches(secondaryOptions, 'ignoreProperties', prop)) {
				return;
			}

			const parent = decl.parent;

			if (
				parent &&
				typeGuards.isRule(parent) &&
				optionsMatches(secondaryOptions, 'ignoreSelectors', parent.selector)
			) {
				return;
			}

			/** @type {import('postcss').Node | undefined} */
			let node = parent;

			while (node && node.type !== 'root') {
				if (typeGuards.isAtRule(node) && optionsMatches(secondaryOptions, 'ignoreAtRules', node.name)) {
					return;
				}

				node = node.parent;
			}

			if (allValidProperties.has(prop.toLowerCase())) {
				return;
			}

			report({
				message: messages.rejected,
				messageArgs: [prop],
				node: decl,
				result,
				ruleName,
				word: prop,
			});
		}
	};
};

rule.ruleName = ruleName;
rule.messages = messages;
rule.meta = meta;

module.exports = rule;