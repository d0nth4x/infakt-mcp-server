/**
 * Input validation utilities
 *
 * Provides validation functions for tool parameters to ensure
 * data integrity before making API calls.
 */

import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

/**
 * Validation error with field context
 */
export class ValidationError extends McpError {
  constructor(
    public readonly field: string,
    message: string
  ) {
    super(ErrorCode.InvalidParams, `Validation error for '${field}': ${message}`);
    this.name = "ValidationError";
  }
}

/**
 * Validates that a value is a non-empty string
 */
export function validateRequiredString(
  value: unknown,
  fieldName: string
): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ValidationError(fieldName, "must be a non-empty string");
  }
}

/**
 * Validates that a value is a positive number
 */
export function validatePositiveNumber(
  value: unknown,
  fieldName: string
): asserts value is number {
  if (typeof value !== "number" || value <= 0 || !Number.isFinite(value)) {
    throw new ValidationError(fieldName, "must be a positive number");
  }
}

/**
 * Validates that a value is a non-negative number
 */
export function validateNonNegativeNumber(
  value: unknown,
  fieldName: string
): asserts value is number {
  if (typeof value !== "number" || value < 0 || !Number.isFinite(value)) {
    throw new ValidationError(fieldName, "must be a non-negative number");
  }
}

/**
 * Validates ISO date string format (YYYY-MM-DD)
 */
export function validateDateString(
  value: unknown,
  fieldName: string
): asserts value is string {
  if (typeof value !== "string") {
    throw new ValidationError(fieldName, "must be a string");
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(value)) {
    throw new ValidationError(
      fieldName,
      "must be in YYYY-MM-DD format"
    );
  }

  // Check if it's a valid date
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new ValidationError(fieldName, "is not a valid date");
  }

  // Check that the date string matches what we parsed (handles invalid dates like 2024-02-30)
  const [year, month, day] = value.split("-").map(Number);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    throw new ValidationError(fieldName, "is not a valid date");
  }
}

/**
 * Validates email format
 */
export function validateEmail(
  value: unknown,
  fieldName: string
): asserts value is string {
  if (typeof value !== "string") {
    throw new ValidationError(fieldName, "must be a string");
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    throw new ValidationError(fieldName, "is not a valid email address");
  }
}

/**
 * Validates UUID format
 */
export function validateUUID(
  value: unknown,
  fieldName: string
): asserts value is string {
  if (typeof value !== "string") {
    throw new ValidationError(fieldName, "must be a string");
  }

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(value)) {
    throw new ValidationError(fieldName, "is not a valid UUID");
  }
}

/**
 * Validates that a value is in an allowed set of values
 */
export function validateEnum<T extends string>(
  value: unknown,
  fieldName: string,
  allowedValues: readonly T[]
): asserts value is T {
  if (typeof value !== "string") {
    throw new ValidationError(fieldName, "must be a string");
  }

  if (!allowedValues.includes(value as T)) {
    throw new ValidationError(
      fieldName,
      `must be one of: ${allowedValues.join(", ")}`
    );
  }
}

/**
 * Type for item validator function
 */
type ItemValidator<T> = (item: unknown, index: number) => asserts item is T;

/**
 * Validates array and its items
 */
export function validateArray<T>(
  value: unknown,
  fieldName: string,
  itemValidator?: ItemValidator<T>
): asserts value is T[] {
  if (!Array.isArray(value)) {
    throw new ValidationError(fieldName, "must be an array");
  }

  if (value.length === 0) {
    throw new ValidationError(fieldName, "must not be empty");
  }

  if (itemValidator) {
    // Explicit loop to satisfy TypeScript assertion requirements
    for (let index = 0; index < value.length; index++) {
      try {
        const item: unknown = value[index];
        const validator: ItemValidator<T> = itemValidator;
        validator(item, index);
      } catch (error) {
        if (error instanceof ValidationError) {
          throw new ValidationError(
            `${fieldName}[${index}].${error.field}`,
            error.message.replace(`Validation error for '${error.field}': `, "")
          );
        }
        throw error;
      }
    }
  }
}

/**
 * Validates an invoice service object
 */
export function validateInvoiceService(
  value: unknown,
  index: number
): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object") {
    throw new ValidationError(`services[${index}]`, "must be an object");
  }

  const service = value as Record<string, unknown>;

  // Required fields
  validateRequiredString(service.name, "name");

  if (
    service.tax_symbol === undefined ||
    (typeof service.tax_symbol !== "string" && typeof service.tax_symbol !== "number")
  ) {
    throw new ValidationError("tax_symbol", "is required and must be a string or number");
  }

  // Optional numeric fields
  if (service.net_price !== undefined) {
    validateNonNegativeNumber(service.net_price, "net_price");
  }
  if (service.unit_net_price !== undefined) {
    validateNonNegativeNumber(service.unit_net_price, "unit_net_price");
  }
  if (service.gross_price !== undefined) {
    validateNonNegativeNumber(service.gross_price, "gross_price");
  }
  if (service.quantity !== undefined) {
    validatePositiveNumber(service.quantity, "quantity");
  }

  // At least one price field must be provided
  if (
    service.net_price === undefined &&
    service.unit_net_price === undefined &&
    service.gross_price === undefined
  ) {
    throw new ValidationError(
      "services",
      "each service must have at least one of: net_price, unit_net_price, or gross_price"
    );
  }
}

/**
 * Validates pagination parameters
 */
export function validatePaginationParams(params: {
  offset?: unknown;
  limit?: unknown;
}): void {
  if (params.offset !== undefined) {
    validateNonNegativeNumber(params.offset, "offset");
  }

  if (params.limit !== undefined) {
    validatePositiveNumber(params.limit, "limit");
    if (params.limit > 100) {
      throw new ValidationError("limit", "must not exceed 100");
    }
  }
}

/**
 * Validates that required fields are present
 */
export function validateRequiredFields(
  data: Record<string, unknown>,
  requiredFields: string[]
): void {
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null) {
      throw new ValidationError(field, "is required");
    }
  }
}

/**
 * Sanitizes and validates query parameters, removing undefined values
 */
export function sanitizeParams<T extends Record<string, unknown>>(
  params: T
): Partial<T> {
  const sanitized: Partial<T> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      sanitized[key as keyof T] = value as T[keyof T];
    }
  }

  return sanitized;
}
