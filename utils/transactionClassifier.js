const UNKNOWN = "UNKNOWN";

export const classifyTransaction = ({ description, withdrawals, deposits }) => {
	const normalizedDescription = description.toLowerCase();
	const isIncome = Boolean(deposits && deposits !== "0.00");

	let type = isIncome ? "INCOME" : "EXPENSE";
	if (/iifl|mutual fund|sip|investment|zerodha|groww/.test(normalizedDescription)) {
		type = "INVESTMENT";
	}

	let category = UNKNOWN;
	if (/swiggy|zomato|domino|restaurant|food/.test(normalizedDescription)) {
		category = "FOOD";
	} else if (/grocery|instamart|blinkit|zepto|bigbasket/.test(normalizedDescription)) {
		category = "GROCERIES";
	} else if (/uber|ola|rapido|travel|flight|cleartrip/.test(normalizedDescription)) {
		category = "TRAVEL";
	}

	let tag = UNKNOWN;
	if (/cleartrip/.test(normalizedDescription)) {
		tag = "CLEARTRIP";
	} else if (/uber/.test(normalizedDescription)) {
		tag = "UBER";
	} else if (/domino/.test(normalizedDescription)) {
		tag = "DOMINOES";
	}

	return { category, tag, type };
};
