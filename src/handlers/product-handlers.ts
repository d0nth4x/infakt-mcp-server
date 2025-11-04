/**
 * Product management tool handlers
 *
 * Implements all product-related operations including CRUD operations.
 */

import type { ApiClient } from "../api-client.js";
import type {
  ToolResponse,
  Product,
  CreateProductRequest,
  // ListProductsParams,
  UpdateProductParams,
  RansackQueryParams,
} from "../types.js";
import {
  validateRequiredString,
  validatePositiveNumber,
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
 * List all products with optional filtering
 */
export async function listProducts(
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

  if (params.name) {
    validateRequiredString(params.name, "name");
    filters.name_cont = params.name;
  }

  if (Object.keys(filters).length > 0) {
    queryParams.q = filters;
  }

  const response = await apiClient.get<{ entities: Product[] }>(
    "/products.json",
    { params: queryParams }
  );

  return createJsonResponse(response);
}

/**
 * Get detailed information about a specific product
 */
export async function getProduct(
  apiClient: ApiClient,
  args: unknown
): Promise<ToolResponse> {
  const params = args as Record<string, unknown>;

  validatePositiveNumber(params.product_id, "product_id");

  const response = await apiClient.get<Product>(
    `/products/${params.product_id}.json`
  );

  return createJsonResponse(response);
}

/**
 * Create a new product
 */
export async function createProduct(
  apiClient: ApiClient,
  args: unknown
): Promise<ToolResponse> {
  const params = args as Record<string, unknown>;

  // Validate required fields
  validateRequiredString(params.name, "name");
  validatePositiveNumber(params.unit_net_price, "unit_net_price");

  if (
    params.tax_symbol === undefined ||
    (typeof params.tax_symbol !== "string" && typeof params.tax_symbol !== "number")
  ) {
    throw new Error("tax_symbol is required and must be a string or number");
  }

  const response = await apiClient.post<Product>("/products.json", {
    product: params as unknown as CreateProductRequest,
  });

  return createJsonResponse(response);
}

/**
 * Update an existing product
 */
export async function updateProduct(
  apiClient: ApiClient,
  args: unknown
): Promise<ToolResponse> {
  const params = args as Record<string, unknown>;

  validatePositiveNumber(params.product_id, "product_id");

  // Validate optional fields if provided
  if (params.unit_net_price !== undefined) {
    validatePositiveNumber(params.unit_net_price, "unit_net_price");
  }

  const { product_id, ...productData } = params;

  const response = await apiClient.put<Product>(
    `/products/${product_id}.json`,
    { product: productData as unknown as Omit<UpdateProductParams, "product_id"> }
  );

  return createJsonResponse(response);
}

/**
 * Delete a product
 */
export async function deleteProduct(
  apiClient: ApiClient,
  args: unknown
): Promise<ToolResponse> {
  const params = args as Record<string, unknown>;

  validatePositiveNumber(params.product_id, "product_id");

  await apiClient.delete(`/products/${params.product_id}.json`);

  return createTextResponse(
    `Product ${params.product_id} deleted successfully`
  );
}
