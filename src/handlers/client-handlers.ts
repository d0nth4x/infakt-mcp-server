/**
 * Client management tool handlers
 *
 * Implements all client-related operations including CRUD operations.
 */

import type { ApiClient } from "../api-client.js";
import type {
  ToolResponse,
  Client,
  CreateClientRequest,
  // ListClientsParams,
  UpdateClientParams,
  RansackQueryParams,
} from "../types.js";
import {
  validateRequiredString,
  validateEnum,
  validatePaginationParams,
  sanitizeParams,
  validatePositiveNumber,
} from "../validation.js";
import { convertAllMonetaryFields } from "../currency.js";

const BUSINESS_ACTIVITY_KINDS = [
  "company",
  "self_employed",
  "private_person",
] as const;

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
 * Creates a text response
 */
function createTextResponse(text: string): ToolResponse {
  return {
    content: [
      {
        type: "text",
        text,
      },
    ],
  };
}

/**
 * List all clients with optional filtering
 */
export async function listClients(
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

  // Build ransack-style filters
  const filters: Record<string, unknown> = {};

  if (params.company_name) {
    validateRequiredString(params.company_name, "company_name");
    filters.company_name_cont = params.company_name;
  }
  if (params.nip) {
    validateRequiredString(params.nip, "nip");
    filters.nip_eq = params.nip;
  }
  if (params.email) {
    validateRequiredString(params.email, "email");
    filters.email_eq = params.email;
  }

  if (Object.keys(filters).length > 0) {
    queryParams.q = filters;
  }

  const response = await apiClient.get<{ entities: Client[] }>(
    "/clients.json",
    { params: queryParams }
  );

  return createJsonResponse(response);
}

/**
 * Get detailed information about a specific client
 */
export async function getClient(
  apiClient: ApiClient,
  args: unknown
): Promise<ToolResponse> {
  const params = args as Record<string, unknown>;

  validatePositiveNumber(params.client_id, "client_id");

  const response = await apiClient.get<Client>(
    `/clients/${params.client_id}.json`
  );

  return createJsonResponse(response);
}

/**
 * Create a new client
 */
export async function createClient(
  apiClient: ApiClient,
  args: unknown
): Promise<ToolResponse> {
  const params = args as Record<string, unknown>;

  // Validate required fields
  validateRequiredString(params.company_name, "company_name");

  // Validate optional business activity kind
  if (params.business_activity_kind !== undefined) {
    validateEnum(
      params.business_activity_kind,
      "business_activity_kind",
      BUSINESS_ACTIVITY_KINDS
    );
  }

  const response = await apiClient.post<Client>("/clients.json", {
    client: params as unknown as CreateClientRequest,
  });

  return createJsonResponse(response);
}

/**
 * Update an existing client
 */
export async function updateClient(
  apiClient: ApiClient,
  args: unknown
): Promise<ToolResponse> {
  const params = args as Record<string, unknown>;

  validatePositiveNumber(params.client_id, "client_id");

  const { client_id, ...clientData } = params;

  const response = await apiClient.put<Client>(
    `/clients/${client_id}.json`,
    { client: clientData as unknown as Omit<UpdateClientParams, "client_id"> }
  );

  return createJsonResponse(response);
}

/**
 * Delete a client
 */
export async function deleteClient(
  apiClient: ApiClient,
  args: unknown
): Promise<ToolResponse> {
  const params = args as Record<string, unknown>;

  validatePositiveNumber(params.client_id, "client_id");

  await apiClient.delete(`/clients/${params.client_id}.json`);

  return createTextResponse(`Client ${params.client_id} deleted successfully`);
}
