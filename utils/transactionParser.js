const normalizeWhitespace = (value = "") => value.replace(/\s+/g, " ").trim();

const extractUPIAddress = (description = "") => {
	const fromMatch = description.match(/\/From:([^/]+)/i);
	const toMatch = description.match(/\/To:([^/]+)/i);

	return {
		fromAddress: fromMatch ? normalizeWhitespace(fromMatch[1]) : undefined,
		toAddress: toMatch ? normalizeWhitespace(toMatch[1]) : undefined,
	};
};

const extractNEFTDetails = (description = "") => {
	const bankCodeMatch = description.match(/NEFT\s+[^-]*-([A-Z0-9]+)-/i);
	const referenceMatch = description.match(/-([A-Z0-9]+)$/i);
	const nameMatch = description.match(/NEFT\s+[^-]*-[A-Z0-9]+-(.+?)-([A-Z0-9]+)$/i);

	const counterpartyName = nameMatch ? normalizeWhitespace(nameMatch[1]) : undefined;
	const paymentReference = referenceMatch ? normalizeWhitespace(referenceMatch[1]) : undefined;

	return {
		bankCode: bankCodeMatch ? normalizeWhitespace(bankCodeMatch[1]) : undefined,
		counterpartyName,
		paymentReference,
	};
};

export const parseTransactionMetadata = (description = "") => {
	if (!description) {
		return {
			paymentType: "UNKNOWN",
		};
	}

	const normalized = description.trim();

	if (normalized.toUpperCase().startsWith("UPI/")) {
		const { fromAddress, toAddress } = extractUPIAddress(normalized);
		return {
			paymentType: "UPI",
			fromAddress,
			toAddress,
			counterpartyName: toAddress || fromAddress,
		};
	}

	if (normalized.toUpperCase().startsWith("NEFT")) {
		return {
			paymentType: "NEFT",
			...extractNEFTDetails(normalized),
		};
	}

	return {
		paymentType: "UNKNOWN",
	};
};
