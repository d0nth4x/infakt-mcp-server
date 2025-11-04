/**
 * Comprehensive type definitions for inFakt API v3
 *
 * This file contains all type definitions for the inFakt API integration,
 * including request/response types, domain models, and utility types.
 */

import type { ApiClient } from "./api-client.js";

// ============================================================================
// Base Types & Utilities
// ============================================================================

/**
 * ISO 8601 date string (YYYY-MM-DD)
 */
export type ISODateString = string;

/**
 * UUID string identifier
 */
export type UUID = string;

/**
 * Pagination parameters for list endpoints
 */
export interface PaginationParams {
  offset?: number;
  limit?: number;
}

/**
 * Field selection parameter for partial responses
 */
export interface FieldSelectionParams {
  fields?: string;
}

/**
 * Standard API response envelope
 */
export interface ApiResponse<T> {
  data?: T;
  error?: ApiErrorResponse;
}

/**
 * API error response structure
 */
export interface ApiErrorResponse {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// ============================================================================
// Invoice Types
// ============================================================================

/**
 * Invoice payment methods
 */
export type PaymentMethod =
  | "cash"
  | "transfer"
  | "card"
  | "barter"
  | "check"
  | "bill_of_sale"
  | "delivery"
  | "compensation"
  | "accredited"
  | "paypal"
  | "payu"
  | "tpay"
  | "przelewy24"
  | "dotpay"
  | "other";

/**
 * Invoice status values
 */
export type InvoiceStatus = "draft" | "paid" | "printed" | "sent";

/**
 * PDF document types for invoice downloads
 */
export type DocumentType =
  | "original"
  | "copy"
  | "original_copy"
  | "duplicate"
  | "original_duplicate"
  | "copy_duplicate"
  | "regular"
  | "double_regular";

/**
 * Locale options for invoice documents
 */
export type InvoiceLocale = "pl" | "en" | "pe";

/**
 * VAT rate value (can be number or string representation)
 */
export type VatRate = number | string;

/**
 * Invoice service/product line item
 */
export interface InvoiceService {
  name: string;
  net_price?: number;
  unit_net_price?: number;
  gross_price?: number;
  tax_symbol: VatRate;
  quantity?: number;
  unit?: string;
  pkwiu?: string;
  description?: string;
}

/**
 * Request payload for creating an invoice
 */
export interface CreateInvoiceRequest {
  client_company_name: string;
  payment_method: PaymentMethod;
  status?: InvoiceStatus;
  paid_date?: ISODateString;
  services: InvoiceService[];
  client_id?: number;

  // Client details for new clients
  client_first_name?: string;
  client_last_name?: string;
  client_tax_code?: string;
  client_street?: string;
  client_street_number?: string;
  client_flat_number?: string;
  client_city?: string;
  client_post_code?: string;
  client_country?: string;
  client_email?: string;
  client_phone?: string;

  // Invoice metadata
  notes?: string;
  invoice_date?: ISODateString;
  sale_date?: ISODateString;
  payment_date?: ISODateString;
  bank_account_id?: number;
}

/**
 * Response from async invoice creation
 */
export interface CreateInvoiceResponse {
  task_reference_number: string;
  status: "pending" | "processing" | "completed" | "failed";
}

/**
 * Invoice status check response
 */
export interface InvoiceStatusResponse {
  status: "pending" | "processing" | "completed" | "failed";
  invoice?: Invoice;
  error?: string;
}

/**
 * Complete invoice data structure
 */
export interface Invoice {
  id: number;
  uuid: UUID;
  number: string;
  invoice_date: ISODateString;
  sale_date: ISODateString;
  payment_date: ISODateString;
  paid_date?: ISODateString;
  status: InvoiceStatus;
  payment_method: PaymentMethod;

  // Client information
  client_id: number;
  client_company_name: string;
  client_first_name?: string;
  client_last_name?: string;
  client_tax_code?: string;
  client_street?: string;
  client_street_number?: string;
  client_flat_number?: string;
  client_city?: string;
  client_post_code?: string;
  client_country?: string;

  // Financial details
  net_price: number;
  gross_price: number;
  tax_price: number;
  currency: string;

  // Services/products
  services: InvoiceService[];

  // Metadata
  notes?: string;
  bank_account_id?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Query filters for listing invoices
 */
export interface ListInvoicesFilters {
  number?: string;
  client_company_name?: string;
  status?: InvoiceStatus;
  invoice_date_from?: ISODateString;
  invoice_date_to?: ISODateString;
}

/**
 * Parameters for listing invoices
 */
export interface ListInvoicesParams extends PaginationParams, FieldSelectionParams {
  order?: string;
  filters?: ListInvoicesFilters;
}

/**
 * Parameters for updating an invoice
 */
export interface UpdateInvoiceParams {
  invoice_uuid: UUID;
  client_company_name?: string;
  payment_method?: PaymentMethod;
  services?: InvoiceService[];
  notes?: string;
  invoice_date?: ISODateString;
  sale_date?: ISODateString;
  payment_date?: ISODateString;
}

/**
 * Parameters for downloading invoice PDF
 */
export interface DownloadInvoicePdfParams {
  invoice_uuid: UUID;
  document_type?: DocumentType;
  locale?: InvoiceLocale;
}

/**
 * Parameters for sending invoice via email
 */
export interface SendInvoiceEmailParams {
  invoice_uuid: UUID;
  recipient_email?: string;
  email_subject?: string;
  email_message?: string;
}

/**
 * Parameters for marking invoice as paid
 */
export interface MarkInvoicePaidParams {
  invoice_uuid: UUID;
  paid_date: ISODateString;
}

// ============================================================================
// Client Types
// ============================================================================

/**
 * Business activity kind
 */
export type BusinessActivityKind = "company" | "self_employed" | "private_person";

/**
 * Client data structure
 */
export interface Client {
  id: number;
  company_name: string;
  first_name?: string;
  last_name?: string;
  tax_code?: string;
  street?: string;
  street_number?: string;
  flat_number?: string;
  city?: string;
  post_code?: string;
  country?: string;
  email?: string;
  phone?: string;
  business_activity_kind?: BusinessActivityKind;
  created_at: string;
  updated_at: string;
}

/**
 * Request payload for creating a client
 */
export interface CreateClientRequest {
  company_name: string;
  first_name?: string;
  last_name?: string;
  tax_code?: string;
  street?: string;
  street_number?: string;
  flat_number?: string;
  city?: string;
  post_code?: string;
  country?: string;
  email?: string;
  phone?: string;
  business_activity_kind?: BusinessActivityKind;
}

/**
 * Query filters for listing clients
 */
export interface ListClientsFilters {
  company_name?: string;
  nip?: string;
  email?: string;
}

/**
 * Parameters for listing clients
 */
export interface ListClientsParams extends PaginationParams, FieldSelectionParams {
  filters?: ListClientsFilters;
}

/**
 * Parameters for updating a client
 */
export interface UpdateClientParams {
  client_id: number;
  company_name?: string;
  first_name?: string;
  last_name?: string;
  tax_code?: string;
  street?: string;
  street_number?: string;
  flat_number?: string;
  city?: string;
  post_code?: string;
  country?: string;
  email?: string;
  phone?: string;
}

// ============================================================================
// Product Types
// ============================================================================

/**
 * Product data structure
 */
export interface Product {
  id: number;
  name: string;
  unit_net_price: number;
  tax_symbol: VatRate;
  unit?: string;
  pkwiu?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Request payload for creating a product
 */
export interface CreateProductRequest {
  name: string;
  unit_net_price: number;
  tax_symbol: VatRate;
  unit?: string;
  pkwiu?: string;
  description?: string;
}

/**
 * Query filters for listing products
 */
export interface ListProductsFilters {
  name?: string;
}

/**
 * Parameters for listing products
 */
export interface ListProductsParams extends PaginationParams, FieldSelectionParams {
  filters?: ListProductsFilters;
}

/**
 * Parameters for updating a product
 */
export interface UpdateProductParams {
  product_id: number;
  name?: string;
  unit_net_price?: number;
  tax_symbol?: VatRate;
  unit?: string;
  pkwiu?: string;
  description?: string;
}

// ============================================================================
// Cost Types
// ============================================================================

/**
 * Cost document data structure
 */
export interface Cost {
  uuid: UUID;
  number: string;
  issue_date: ISODateString;
  net_price: number;
  gross_price: number;
  tax_price: number;
  currency: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Parameters for listing costs
 */
export interface ListCostsParams extends PaginationParams, FieldSelectionParams {}

// ============================================================================
// Reference Data Types
// ============================================================================

/**
 * VAT rate configuration
 */
export interface VatRateConfig {
  symbol: VatRate;
  rate: number;
  name: string;
}

/**
 * Bank account configuration
 */
export interface BankAccount {
  id: number;
  account_number: string;
  bank_name?: string;
  swift?: string;
  default?: boolean;
}

/**
 * Account information and limits
 */
export interface AccountInfo {
  company_name: string;
  plan_name: string;
  plan_limits: {
    invoices_per_month?: number;
    clients?: number;
    products?: number;
  };
  usage: {
    invoices_this_month?: number;
    clients?: number;
    products?: number;
  };
}

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Server configuration
 */
export interface ServerConfig {
  apiKey: string;
  baseUrl: string;
  useSandbox: boolean;
}

/**
 * Environment variables
 */
export interface EnvironmentVariables {
  INFAKT_API_KEY: string;
  INFAKT_USE_SANDBOX?: string;
  INFAKT_BASE_URL?: string;
}

// ============================================================================
// MCP Tool Types
// ============================================================================

/**
 * MCP tool response content
 */
export interface ToolResponse {
  content: Array<{
    type: "text";
    text: string;
  }>;
  isError?: boolean;
  [key: string]: unknown;
}

/**
 * Tool handler function signature
 * All handlers receive the API client and arguments
 */
export type ToolHandler = (
  apiClient: ApiClient,
  args: unknown
) => Promise<ToolResponse>;

/**
 * Tool registry mapping tool names to their handlers
 */
export type ToolRegistry = Record<string, ToolHandler>;

// ============================================================================
// Request Parameter Types (for internal API calls)
// ============================================================================

/**
 * Query parameters for list requests with ransack-style filtering
 */
export interface RansackQueryParams {
  offset?: number;
  limit?: number;
  order?: string;
  fields?: string;
  q?: Record<string, unknown>;
}

/**
 * Generic list response from API
 */
export interface ListResponse<T> {
  data: T[];
  total?: number;
  offset?: number;
  limit?: number;
}
