/**
 * Reference data tool handlers
 *
 * Implements handlers for retrieving reference data like VAT rates,
 * bank accounts, and account information.
 */

import type { ApiClient } from "../api-client.js";
import type {
  ToolResponse,
  VatRateConfig,
  BankAccount,
  AccountInfo,
} from "../types.js";
import { convertAllMonetaryFields } from "../currency.js";

/**
 * Creates a JSON text response
 */
function createJsonResponse(data: unknown): ToolResponse {
  const convertedData = convertAllMonetaryFields(data);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(convertedData, null, 2),
      },
    ],
  };
}

/**
 * Get list of available VAT rates
 */
export async function getVatRates(
  apiClient: ApiClient,
  _args: unknown
): Promise<ToolResponse> {
  const response = await apiClient.get<{ entities: VatRateConfig[] }>(
    "/vat_rates.json"
  );

  return createJsonResponse(response);
}

/**
 * Get list of bank accounts configured for invoices
 */
export async function getBankAccounts(
  apiClient: ApiClient,
  _args: unknown
): Promise<ToolResponse> {
  const response = await apiClient.get<{ entities: BankAccount[] }>(
    "/bank_accounts.json"
  );

  return createJsonResponse(response);
}

/**
 * Get current account information including plan details and limits
 */
export async function getAccountInfo(
  apiClient: ApiClient,
  _args: unknown
): Promise<ToolResponse> {
  const response = await apiClient.get<AccountInfo>("/account.json");

  return createJsonResponse(response);
}
