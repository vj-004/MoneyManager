import test from "node:test";
import assert from "node:assert/strict";

import { parseTransactionMetadata } from "../utils/transactionParser.js";

test("extracts UPI sender and receiver details from the description", () => {
  const result = parseTransactionMetadata(
    "UPI/660595730546/From:vayunjain2004@okaxis/To:dominospizza.42403545@hdfcbank/UPI"
  );

  assert.deepEqual(result, {
    paymentType: "UPI",
    fromAddress: "vayunjain2004@okaxis",
    toAddress: "dominospizza.42403545@hdfcbank",
    counterpartyName: "dominospizza.42403545@hdfcbank",
  });
});

test("extracts NEFT bank and reference details from the description", () => {
  const result = parseTransactionMetadata(
    "NEFT Cr-ICIC0099999-IIFL CAPITAL SERVICES LIM-VAYUN  JAIN-IN22623948780476"
  );

  assert.deepEqual(result, {
    paymentType: "NEFT",
    bankCode: "ICIC0099999",
    counterpartyName: "IIFL CAPITAL SERVICES LIM-VAYUN JAIN",
    paymentReference: "IN22623948780476",
  });
});
