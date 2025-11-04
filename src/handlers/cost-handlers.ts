/**
 * Cost document management tool handlers
 *
 * Implements handlers for retrieving cost documents.
 */

import type { ApiClient } from "../api-client.js";
import type {
  ToolResponse,
  Cost,
  // ListCostsParams,
  RansackQueryParams,
} from "../types.js";
import {
  validateUUID,
  validatePaginationParams,
  sanitizeParams,
} from "../validation.js";

/**
 * Creates a JSON text response
 */
function createJsonResponse(data: unknown): ToolResponse {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

/**
 * List cost documents
 */
export async function listCosts(
  apiClient: ApiClient,
  args: unknown
): Promise<ToolResponse> {
  const params = args as Record<string, unknown>;

  // Validate pagination
  validatePaginationParams(params);

  // Build query parameters
  const queryParams: RansackQueryParams = sanitizeParams({
    offset: params.offset as number | undefined,
    limit: params.limit as number | undefined,
    fields: params.fields as string | undefined,
  });

  const response = await apiClient.get<{ entities: Cost[] }>(
    "/documents/costs.json",
    { params: queryParams }
  );

  return createJsonResponse(response);
}

/**
 * Get detailed information about a specific cost document
 */
export async function getCost(
  apiClient: ApiClient,
  args: unknown
): Promise<ToolResponse> {
  const params = args as Record<string, unknown>;

  validateUUID(params.cost_uuid, "cost_uuid");

  const response = await apiClient.get<Cost>(
    `/documents/costs/${params.cost_uuid}.json`
  );

  return createJsonResponse(response);
}
