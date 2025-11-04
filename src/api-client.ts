/**
 * API client for inFakt API v3
 *
 * Provides a type-safe wrapper around axios for making API calls
 * with proper error handling and request/response typing.
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from "axios";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import type { ServerConfig } from "./types.js";

/**
 * Custom error class for API-specific errors
 */
export class InfaktApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly responseData: unknown,
    message: string
  ) {
    super(message);
    this.name = "InfaktApiError";
  }
}

/**
 * Creates and configures an axios instance for the inFakt API
 *
 * @param config - Server configuration containing API key and base URL
 * @returns Configured axios instance
 */
export function createApiClient(config: ServerConfig): AxiosInstance {
  return axios.create({
    baseURL: config.baseUrl,
    headers: {
      "X-inFakt-ApiKey": config.apiKey,
      "Content-Type": "application/json",
    },
    timeout: 30000, // 30 second timeout
    validateStatus: (status) => status >= 200 && status < 300,
  });
}

/**
 * Extracts a meaningful error message from an axios error
 *
 * @param error - The axios error object
 * @returns Human-readable error message
 */
function extractErrorMessage(error: AxiosError): string {
  const status = error.response?.status;
  const data = error.response?.data;

  if (!status) {
    return error.message || "Network error occurred";
  }

  // Try to extract error message from various response formats
  if (data && typeof data === "object") {
    const dataObj = data as Record<string, unknown>;

    // Check common error message fields
    if (typeof dataObj.message === "string") {
      return dataObj.message;
    }
    if (typeof dataObj.error === "string") {
      return dataObj.error;
    }
    if (typeof dataObj.errors === "string") {
      return dataObj.errors;
    }
    if (Array.isArray(dataObj.errors) && dataObj.errors.length > 0) {
      return dataObj.errors.join(", ");
    }
  }

  // Fallback to status-based messages
  switch (status) {
    case 400:
      return "Bad request: Invalid parameters";
    case 401:
      return "Unauthorized: Invalid or missing API key";
    case 403:
      return "Forbidden: Insufficient permissions";
    case 404:
      return "Not found: Resource does not exist";
    case 422:
      return "Unprocessable entity: Validation failed";
    case 429:
      return "Too many requests: Rate limit exceeded";
    case 500:
      return "Internal server error";
    case 503:
      return "Service unavailable: API is temporarily down";
    default:
      return `API error: ${status}`;
  }
}

/**
 * Handles API errors and converts them to MCP errors
 *
 * This function analyzes various error types and converts them into
 * appropriate MCP error responses with meaningful messages.
 *
 * @param error - The error to handle (can be any type)
 * @throws {McpError} Always throws an McpError with appropriate code and message
 */
export function handleApiError(error: unknown): never {
  // If it's already an MCP error, just rethrow it
  if (error instanceof McpError) {
    throw error;
  }

  // Handle axios errors
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status;
    const data = axiosError.response?.data;
    const message = extractErrorMessage(axiosError);

    // Log error details for debugging (to stderr to not interfere with MCP)
    console.error("InfaktAPI Error:", {
      status,
      message,
      url: axiosError.config?.url,
      method: axiosError.config?.method,
    });

    // Map HTTP status codes to MCP error codes
    let errorCode = ErrorCode.InternalError;

    if (status === 400 || status === 422) {
      errorCode = ErrorCode.InvalidParams;
    } else if (status === 401 || status === 403) {
      errorCode = ErrorCode.InvalidRequest;
    } else if (status === 404) {
      errorCode = ErrorCode.InvalidRequest;
    }

    throw new McpError(
      errorCode,
      `inFakt API error (${status ?? "unknown"}): ${message}${
        data ? `\nDetails: ${JSON.stringify(data)}` : ""
      }`
    );
  }

  // Handle custom InfaktApiError
  if (error instanceof InfaktApiError) {
    console.error("InfaktAPI Error:", {
      status: error.statusCode,
      message: error.message,
    });

    throw new McpError(
      ErrorCode.InternalError,
      `inFakt API error (${error.statusCode}): ${error.message}`
    );
  }

  // Handle generic errors
  const message =
    error instanceof Error ? error.message : String(error);

  console.error("Unexpected error:", message);

  throw new McpError(
    ErrorCode.InternalError,
    `Unexpected error: ${message}`
  );
}

/**
 * Type-safe wrapper for API client
 *
 * Provides strongly-typed methods for common HTTP operations
 */
export class ApiClient {
  constructor(private readonly client: AxiosInstance) {}

  /**
   * Performs a GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.get<T>(url, config);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Performs a POST request
   */
  async post<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Performs a PUT request
   */
  async put<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Performs a DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.delete<T>(url, config);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Performs a GET request that returns binary data (e.g., PDF)
   */
  async getBinary(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ArrayBuffer> {
    try {
      const response = await this.client.get<ArrayBuffer>(url, {
        ...config,
        responseType: "arraybuffer",
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }
}
