// NOTICE: This file is generated by Rollup. To modify it,
// please instead edit the ESM counterpart and rebuild with Rollup (npm run build).
'use strict';

const parser = require('postcss-selector-parser');
const findAtRuleContext = require('../../utils/findAtRuleContext.cjs');
const flattenNestedSelectorsForRule = require('../../utils/flattenNestedSelectorsForRule.cjs');
const getRuleSelector = require('../../utils/getRuleSelector.cjs');
const getSelectorSourceIndex = require('../../utils/getSelectorSourceIndex.cjs');
const validateTypes = require('../../utils/validateTypes.cjs');
const isKeyframeRule = require('../../utils/isKeyframeRule.cjs');
const isStandardSyntaxRule = require('../../utils/isStandardSyntaxRule.cjs');
const nodeContextLookup = require('../../utils/nodeContextLookup.cjs');
const normalizeSelector = require('../../utils/normalizeSelector.cjs');
const parseSelector = require('../../utils/parseSelector.cjs');
const report = require('../../utils/report.cjs');
const ruleMessages = require('../../utils/ruleMessages.cjs');
const validateOptions = require('../../utils/validateOptions.cjs');

const ruleName = 'no-duplicate-selectors';

const messages = ruleMessages(ruleName, {
	rejected: (selector, firstDuplicateLine) =>
		`Unexpected duplicate selector "${selector}", first used at line ${firstDuplicateLine}`,
});

const meta = {
	url: 'https://stylelint.io/user-guide/rules/no-duplicate-selectors',
};

/** @import { Rule as PostcssRule } from 'postcss' */
/** @import { Node as SelectorNode, Root as SelectorRoot, Selector } from 'postcss-selector-parser' */

/** @type {import('stylelint').Rule} */
const rule = (primary, secondaryOptions) => {
	return (root, result) => {
		const validOptions = validateOptions(
			result,
			ruleName,
			{ actual: primary },
			{
				actual: secondaryOptions,
				possible: {
					disallowInList: [validateTypes.isBoolean],
				},
				optional: true,
			},
		);

		if (!validOptions) {
			return;
		}

		const shouldDisallowDuplicateInList = secondaryOptions && secondaryOptions.disallowInList;

		// The top level of this map will be rule sources.
		// Each source maps to another map, which maps rule parents to a set of selectors.
		// This ensures that selectors are only checked against selectors
		// from other rules that share the same parent and the same source.
		const selectorContextLookup = nodeContextLookup();

		/**
		 * @param {PostcssRule} node
		 * @param {string} selector
		 * @param {number} index
		 * @param {number} previousDuplicateLine
		 */
		function complain(node, selector, index, previousDuplicateLine) {
			report({
				result,
				ruleName,
				node,
				message: messages.rejected,
				messageArgs: [selector, previousDuplicateLine],
				index,
				endIndex: index + selector.length,
			});
		}

		/**
		 * Check selectors in the same rule:
		 * `a, b, a {}` -> double "a"
		 *
		 * @param {PostcssRule} ruleNode
		 */
		function checkSelectorsInTheSameRule(ruleNode) {
			const selectorsInList = new Map();
			const selectors = parseSelector(getRuleSelector(ruleNode), result, ruleNode);

			selectors?.each((selector) => {
				const normalized = normalizeSelector(selector.clone()).toString();
				const previousDuplicatePosition = selectorsInList.get(normalized);

				if (!previousDuplicatePosition) {
					selectorsInList.set(normalized, {
						// line numbers start at 1, adding two line numbers together requires subtracting 1
						line: (selector.source?.start?.line ?? 1) + (ruleNode.source?.start?.line ?? 1) - 1,
					});

					return;
				}

				const index = getSelectorSourceIndex(selector);
				const selectorStr = selector.toString().trim();

				complain(ruleNode, selectorStr, index, previousDuplicatePosition.line);
			});
		}

		/**
		 * Check selectors in different rules, but evaluate each selector list as a single item:
		 * `a, b {} b, a {}` -> double "a, b"
		 *
		 * @param {PostcssRule} ruleNode
		 * @param {Map<string, { line: number }>} contextSelectorSet
		 */
		function checkSelectorListInDifferentRules(ruleNode, contextSelectorSet) {
			const flattenedNestedSelectors = flattenNestedSelectorsForRule(ruleNode, result).flatMap(
				({ resolvedSelectors }) => resolvedSelectors.nodes,
			);

			if (!flattenedNestedSelectors.length) return;

			const combinedRoot = parser.root({
				nodes: flattenedNestedSelectors,
				value: '',
			});

			const normalized = normalizeSelector(combinedRoot).toString();
			const previousDuplicatePosition = contextSelectorSet.get(normalized);

			if (!previousDuplicatePosition) {
				contextSelectorSet.set(normalized, {
					line: ruleNode.source?.start?.line ?? 1,
				});

				return;
			}

			const selector = getRuleSelector(ruleNode);
			const selectorStr = selector.toString().trim();

			complain(ruleNode, selectorStr, 0, previousDuplicatePosition.line);
		}

		/**
		 * Check selectors in different rules, and evaluate each selector as an individual item:
		 * `a, b {} a {}` -> double "a"
		 *
		 * @param {PostcssRule} ruleNode
		 * @param {Map<string, { line: number }>} contextSelectorSet
		 */
		function checkSelectorsInDifferentRules(ruleNode, contextSelectorSet) {
			flattenNestedSelectorsForRule(ruleNode, result).forEach((flattenedSelector) => {
				const { selector, resolvedSelectors } = flattenedSelector;

				resolvedSelectors.each((resolvedSelector) => {
					const normalized = normalizeSelector(resolvedSelector).toString();
					const previousDuplicatePosition = contextSelectorSet.get(normalized);

					if (!previousDuplicatePosition) {
						contextSelectorSet.set(normalized, {
							// line numbers start at 1, adding two line numbers together requires subtracting 1
							line: (selector.source?.start?.line ?? 1) + (ruleNode.source?.start?.line ?? 1) - 1,
						});

						return;
					}

					const index = getSelectorSourceIndex(selector);
					const selectorStr = selector.toString().trim();

					complain(ruleNode, selectorStr, index, previousDuplicatePosition.line);
				});
			});
		}

		root.walkRules((ruleNode) => {
			if (isKeyframeRule(ruleNode)) return;

			if (!isStandardSyntaxRule(ruleNode)) return;

			const contextSelectorSet = selectorContextLookup.getContext(
				ruleNode,
				findAtRuleContext(ruleNode),
			);

			if (shouldDisallowDuplicateInList) {
				checkSelectorsInDifferentRules(ruleNode, contextSelectorSet);

				return;
			}

			checkSelectorsInTheSameRule(ruleNode);
			checkSelectorListInDifferentRules(ruleNode, contextSelectorSet);
		});
	};
};

rule.ruleName = ruleName;
rule.messages = messages;
rule.meta = meta;

module.exports = rule;
