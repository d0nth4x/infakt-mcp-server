/**
 * Invoice management tool handlers
 *
 * Implements all invoice-related operations including creation,
 * retrieval, updates, and document management.
 */

import type { ApiClient } from "../api-client.js";
import type {
  ToolResponse,
  CreateInvoiceRequest,
  CreateInvoiceResponse,
  InvoiceStatusResponse,
  // ListInvoicesParams,
  Invoice,
  UpdateInvoiceParams,
  // DownloadInvoicePdfParams,
  SendInvoiceEmailParams,
  // MarkInvoicePaidParams,
  RansackQueryParams,
} from "../types.js";
import {
  validateRequiredString,
  validateUUID,
  validateArray,
  validateInvoiceService,
  validateDateString,
  validatePaginationParams,
  validateEnum,
  sanitizeParams,
} from "../validation.js";
import { convertAllMonetaryFields } from "../currency.js";

const PAYMENT_METHODS = [
  "cash",
  "transfer",
  "card",
  "barter",
  "check",
  "bill_of_sale",
  "delivery",
  "compensation",
  "accredited",
  "paypal",
  "payu",
  "tpay",
  "przelewy24",
  "dotpay",
  "other",
] as const;

const INVOICE_STATUSES = ["draft", "paid", "printed", "sent"] as const;
const DOCUMENT_TYPES = [
  "original",
  "copy",
  "original_copy",
  "duplicate",
  "original_duplicate",
  "copy_duplicate",
  "regular",
  "double_regular",
] as const;
const LOCALES = ["pl", "en", "pe"] as const;

/**
 * Creates a JSON text response with automatic currency conversion
 * Converts all monetary values from grosze (API format) to PLN (user-friendly)
 */
function createJsonResponse(data: unknown): ToolResponse {
  // Convert all monetary fields from grosze to PLN
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
 * Create a new VAT invoice asynchronously
 */
export async function createInvoice(
  apiClient: ApiClient,
  args: unknown
): Promise<ToolResponse> {
  const params = args as Record<string, unknown>;

  // Validate required fields
  validateRequiredString(params.client_company_name, "client_company_name");
  validateRequiredString(params.payment_method, "payment_method");
  validateEnum(params.payment_method, "payment_method", PAYMENT_METHODS);

  // Validate services array
  if (!params.services) {
    throw new Error("services is required");
  }
  validateArray(params.services, "services", validateInvoiceService);

  // Validate optional status
  if (params.status !== undefined) {
    validateEnum(params.status, "status", INVOICE_STATUSES);
  }

  // Validate paid_date if status is paid
  if (params.status === "paid") {
    if (!params.paid_date) {
      throw new Error("paid_date is required when status is 'paid'");
    }
    validateDateString(params.paid_date, "paid_date");
  }

  // Validate optional date fields
  if (params.invoice_date !== undefined) {
    validateDateString(params.invoice_date, "invoice_date");
  }
  if (params.sale_date !== undefined) {
    validateDateString(params.sale_date, "sale_date");
  }
  if (params.payment_date !== undefined) {
    validateDateString(params.payment_date, "payment_date");
  }

  const response = await apiClient.post<CreateInvoiceResponse>(
    "/async/invoices.json",
    { invoice: params as unknown as CreateInvoiceRequest }
  );

  return createJsonResponse(response);
}

/**
 * Check the status of an asynchronously created invoice
 */
export async function checkInvoiceStatus(
  apiClient: ApiClient,
  args: unknown
): Promise<ToolResponse> {
  const params = args as Record<string, unknown>;

  validateRequiredString(params.task_reference_number, "task_reference_number");

  const response = await apiClient.get<InvoiceStatusResponse>(
    `/async/invoices/status/${params.task_reference_number}.json`
  );

  return createJsonResponse(response);
}

/**
 * List all VAT invoices with optional filtering
 */
export async function listInvoices(
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
    order: params.order as string | undefined,
    fields: params.fields as string | undefined,
  });

  // Build ransack-style filters
  const filters: Record<string, unknown> = {};

  if (params.number) {
    validateRequiredString(params.number, "number");
    filters.number_eq = params.number;
  }
  if (params.client_company_name) {
    validateRequiredString(params.client_company_name, "client_company_name");
    filters.client_company_name_cont = params.client_company_name;
  }
  if (params.status) {
    validateEnum(params.status, "status", INVOICE_STATUSES);
    filters.status_eq = params.status;
  }
  if (params.invoice_date_from) {
    validateDateString(params.invoice_date_from, "invoice_date_from");
    filters.invoice_date_gteq = params.invoice_date_from;
  }
  if (params.invoice_date_to) {
    validateDateString(params.invoice_date_to, "invoice_date_to");
    filters.invoice_date_lteq = params.invoice_date_to;
  }

  if (Object.keys(filters).length > 0) {
    queryParams.q = filters;
  }

  const response = await apiClient.get<{ entities: Invoice[] }>(
    "/invoices.json",
    { params: queryParams }
  );

  return createJsonResponse(response);
}

/**
 * Get detailed information about a specific invoice
 */
export async function getInvoice(
  apiClient: ApiClient,
  args: unknown
): Promise<ToolResponse> {
  const params = args as Record<string, unknown>;

  validateUUID(params.invoice_uuid, "invoice_uuid");

  const queryParams = sanitizeParams({
    fields: params.fields as string | undefined,
  });

  const response = await apiClient.get<Invoice>(
    `/invoices/${params.invoice_uuid}.json`,
    { params: queryParams }
  );

  return createJsonResponse(response);
}

/**
 * Update an existing invoice (only draft invoices can be updated)
 */
export async function updateInvoice(
  apiClient: ApiClient,
  args: unknown
): Promise<ToolResponse> {
  const params = args as Record<string, unknown>;

  validateUUID(params.invoice_uuid, "invoice_uuid");

  // Validate optional fields if provided
  if (params.payment_method !== undefined) {
    validateEnum(params.payment_method, "payment_method", PAYMENT_METHODS);
  }
  if (params.invoice_date !== undefined) {
    validateDateString(params.invoice_date, "invoice_date");
  }
  if (params.sale_date !== undefined) {
    validateDateString(params.sale_date, "sale_date");
  }
  if (params.payment_date !== undefined) {
    validateDateString(params.payment_date, "payment_date");
  }
  if (params.services !== undefined) {
    validateArray(params.services, "services", validateInvoiceService);
  }

  const { invoice_uuid, ...invoiceData } = params;

  const response = await apiClient.put<Invoice>(
    `/invoices/${invoice_uuid}.json`,
    { invoice: invoiceData as unknown as Omit<UpdateInvoiceParams, 'invoice_uuid'> }
  );

  return createJsonResponse(response);
}

/**
 * Delete an invoice (only draft invoices can be deleted)
 */
export async function deleteInvoice(
  apiClient: ApiClient,
  args: unknown
): Promise<ToolResponse> {
  const params = args as Record<string, unknown>;

  validateUUID(params.invoice_uuid, "invoice_uuid");

  await apiClient.delete(`/invoices/${params.invoice_uuid}.json`);

  return createTextResponse(
    `Invoice ${params.invoice_uuid} deleted successfully`
  );
}

/**
 * Download invoice as PDF
 */
export async function downloadInvoicePdf(
  apiClient: ApiClient,
  args: unknown
): Promise<ToolResponse> {
  const params = args as Record<string, unknown>;

  validateUUID(params.invoice_uuid, "invoice_uuid");

  // Validate optional parameters
  if (params.document_type !== undefined) {
    validateEnum(params.document_type, "document_type", DOCUMENT_TYPES);
  }
  if (params.locale !== undefined) {
    validateEnum(params.locale, "locale", LOCALES);
  }

  const queryParams = sanitizeParams({
    document_type: params.document_type as string | undefined,
    locale: params.locale as string | undefined,
  });

  const pdfData = await apiClient.getBinary(
    `/invoices/${params.invoice_uuid}/pdf.json`,
    { params: queryParams }
  );

  const base64Pdf = Buffer.from(pdfData).toString("base64");

  return {
    content: [
      {
        type: "text",
        text: `PDF downloaded successfully. Base64 encoded (${base64Pdf.length} characters). Use base64 decode to save the file.`,
      },
      {
        type: "text",
        text: base64Pdf,
      },
    ],
  };
}

/**
 * Send invoice via email to client
 */
export async function sendInvoiceEmail(
  apiClient: ApiClient,
  args: unknown
): Promise<ToolResponse> {
  const params = args as Record<string, unknown>;

  validateUUID(params.invoice_uuid, "invoice_uuid");

  const { invoice_uuid, ...emailData } = params;

  const response = await apiClient.post<{ success: boolean; message?: string }>(
    `/invoices/${invoice_uuid}/deliver_via_email.json`,
    sanitizeParams(emailData as unknown as Omit<SendInvoiceEmailParams, 'invoice_uuid'>)
  );

  return createJsonResponse(response);
}

/**
 * Mark an invoice as paid
 */
export async function markInvoicePaid(
  apiClient: ApiClient,
  args: unknown
): Promise<ToolResponse> {
  const params = args as Record<string, unknown>;

  validateUUID(params.invoice_uuid, "invoice_uuid");
  validateDateString(params.paid_date, "paid_date");

  const response = await apiClient.post<{ success: boolean }>(
    `/async/invoices/${params.invoice_uuid}/paid.json`,
    { paid_date: params.paid_date }
  );

  return createJsonResponse(response);
}
