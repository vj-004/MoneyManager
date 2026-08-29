const getRuleValue = (transaction, field) => {
	if (field === "reference") {
		return transaction.chequeNoReferenceNo || "";
	}

	return transaction[field] || "";
};

const matchesRule = (transaction, rule) => {
	if (!rule.enabled) {
		return false;
	}

	const actualValue = String(getRuleValue(transaction, rule.field)).toLowerCase();
	const expectedValue = rule.value.toLowerCase();

	if (rule.operator === "equals") {
		return actualValue === expectedValue;
	}

	if (rule.operator === "regex") {
		return new RegExp(rule.value, "i").test(actualValue);
	}

	return actualValue.includes(expectedValue);
};

export const findRuleMatch = (documents, transaction) => documents
	.flatMap((document) => (document.rules || []).map((rule) => ({ document, rule })))
	.filter(({ rule }) => matchesRule(transaction, rule))
	.sort((left, right) => right.rule.priority - left.rule.priority)[0]?.document || null;
