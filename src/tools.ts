/**
 * Tool definitions for inFakt MCP Server
 *
 * Defines all 28 tools available through the MCP server interface,
 * including their schemas and input validation specifications.
 */

import type { Tool } from "@modelcontextprotocol/sdk/types.js";

/**
 * All available tools for the inFakt MCP server
 */
export const TOOLS: Tool[] = [
  // =========================================================================
  // Invoice Management Tools
  // =========================================================================
  {
    name: "infakt_create_invoice",
    description:
      "Create a new VAT invoice asynchronously. Returns a task reference number to check status. " +
      "Invoices can be created with existing client (via client_id) or with new client details. " +
      "At least one service/product is required with pricing information.",
    inputSchema: {
      type: "object",
      properties: {
        client_company_name: {
          type: "string",
          description: "Client company name (required)",
        },
        payment_method: {
          type: "string",
          description: "Payment method",
          enum: [
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
          ],
        },
        status: {
          type: "string",
          description: "Invoice status (default: draft)",
          enum: ["draft", "paid", "printed"],
        },
        paid_date: {
          type: "string",
          description: "Payment date in YYYY-MM-DD format (required if status is 'paid')",
        },
        services: {
          type: "array",
          description: "Array of services/products on the invoice",
          items: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "Service/product name (required)",
              },
              net_price: {
                type: "number",
                description: "Net price (mutually exclusive with unit_net_price and gross_price)",
              },
              unit_net_price: {
                type: "number",
                description: "Unit net price (mutually exclusive with net_price and gross_price)",
              },
              gross_price: {
                type: "number",
                description: "Gross price (mutually exclusive with net_price and unit_net_price)",
              },
              tax_symbol: {
                type: ["string", "number"],
                description: "VAT rate (required): 23, 8, 5, 0, 'zw', 'oo', 'np', etc.",
              },
              quantity: {
                type: "number",
                description: "Quantity (default: 1)",
              },
              unit: {
                type: "string",
                description: "Unit of measure (e.g., 'szt', 'kg', 'h')",
              },
              pkwiu: {
                type: "string",
                description: "PKWiU classification code",
              },
            },
            required: ["name", "tax_symbol"],
          },
        },
        client_id: {
          type: "number",
          description: "ID of existing client (alternative to providing client details)",
        },
        client_first_name: {
          type: "string",
          description: "Client first name (for new clients)",
        },
        client_last_name: {
          type: "string",
          description: "Client last name (for new clients)",
        },
        client_tax_code: {
          type: "string",
          description: "Client NIP tax code (for new clients)",
        },
        client_street: {
          type: "string",
          description: "Client street name (for new clients)",
        },
        client_street_number: {
          type: "string",
          description: "Client street number (for new clients)",
        },
        client_flat_number: {
          type: "string",
          description: "Client flat/apartment number (for new clients)",
        },
        client_city: {
          type: "string",
          description: "Client city (for new clients)",
        },
        client_post_code: {
          type: "string",
          description: "Client postal code (for new clients)",
        },
        client_country: {
          type: "string",
          description: "Client country code, e.g., 'PL' (for new clients)",
        },
        client_email: {
          type: "string",
          description: "Client email address (for new clients)",
        },
        client_phone: {
          type: "string",
          description: "Client phone number (for new clients)",
        },
        notes: {
          type: "string",
          description: "Additional notes to appear on the invoice",
        },
        invoice_date: {
          type: "string",
          description: "Invoice issue date in YYYY-MM-DD format (default: today)",
        },
        sale_date: {
          type: "string",
          description: "Sale/service date in YYYY-MM-DD format (default: today)",
        },
        payment_date: {
          type: "string",
          description: "Payment due date in YYYY-MM-DD format",
        },
        bank_account_id: {
          type: "number",
          description: "Bank account ID for payment (use infakt_get_bank_accounts to list available accounts)",
        },
      },
      required: ["client_company_name", "payment_method", "services"],
    },
  },

  {
    name: "infakt_check_invoice_status",
    description:
      "Check the status of an asynchronously created invoice using the task reference number. " +
      "Returns processing status and invoice details once completed.",
    inputSchema: {
      type: "object",
      properties: {
        task_reference_number: {
          type: "string",
          description: "The task reference number returned from infakt_create_invoice",
        },
      },
      required: ["task_reference_number"],
    },
  },

  {
    name: "infakt_list_invoices",
    description:
      "List all VAT invoices with optional filtering, pagination, and sorting. " +
      "Supports filtering by invoice number, client name, status, and date ranges. " +
      "Use the 'fields' parameter to request only specific fields for better performance.",
    inputSchema: {
      type: "object",
      properties: {
        offset: {
          type: "number",
          description: "Pagination offset (default: 0)",
        },
        limit: {
          type: "number",
          description: "Results per page, max 100 (default: 25)",
        },
        order: {
          type: "string",
          description: "Sort order (e.g., 'invoice_date desc', 'number asc')",
        },
        number: {
          type: "string",
          description: "Filter by invoice number (exact match)",
        },
        client_company_name: {
          type: "string",
          description: "Filter by client name (contains)",
        },
        status: {
          type: "string",
          description: "Filter by status",
          enum: ["draft", "sent", "paid", "printed"],
        },
        invoice_date_from: {
          type: "string",
          description: "Filter by invoice date from (YYYY-MM-DD, inclusive)",
        },
        invoice_date_to: {
          type: "string",
          description: "Filter by invoice date to (YYYY-MM-DD, inclusive)",
        },
        fields: {
          type: "string",
          description: "Comma-separated fields to return (e.g., 'number,client_company_name,net_price')",
        },
      },
    },
  },

  {
    name: "infakt_get_invoice",
    description:
      "Get detailed information about a specific invoice by UUID. " +
      "Returns complete invoice data including services, client details, and financial information.",
    inputSchema: {
      type: "object",
      properties: {
        invoice_uuid: {
          type: "string",
          description: "UUID of the invoice",
        },
        fields: {
          type: "string",
          description: "Comma-separated fields to return (optional)",
        },
      },
      required: ["invoice_uuid"],
    },
  },

  {
    name: "infakt_update_invoice",
    description:
      "Update an existing invoice by UUID. Only draft invoices can be updated. " +
      "You can update client details, services, dates, and other invoice properties.",
    inputSchema: {
      type: "object",
      properties: {
        invoice_uuid: {
          type: "string",
          description: "UUID of the invoice to update",
        },
        client_company_name: {
          type: "string",
          description: "Update client company name",
        },
        payment_method: {
          type: "string",
          description: "Update payment method",
          enum: [
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
          ],
        },
        services: {
          type: "array",
          description: "Update services (replaces all existing services)",
          items: {
            type: "object",
          },
        },
        notes: {
          type: "string",
          description: "Update invoice notes",
        },
        invoice_date: {
          type: "string",
          description: "Update invoice date (YYYY-MM-DD)",
        },
        sale_date: {
          type: "string",
          description: "Update sale date (YYYY-MM-DD)",
        },
        payment_date: {
          type: "string",
          description: "Update payment due date (YYYY-MM-DD)",
        },
      },
      required: ["invoice_uuid"],
    },
  },

  {
    name: "infakt_delete_invoice",
    description:
      "Delete an invoice by UUID. Only draft invoices can be deleted. " +
      "This operation is permanent and cannot be undone.",
    inputSchema: {
      type: "object",
      properties: {
        invoice_uuid: {
          type: "string",
          description: "UUID of the invoice to delete",
        },
      },
      required: ["invoice_uuid"],
    },
  },

  {
    name: "infakt_download_invoice_pdf",
    description:
      "Download invoice as PDF document. Returns base64 encoded PDF content. " +
      "You can specify document type (original, copy, duplicate) and language (Polish, English).",
    inputSchema: {
      type: "object",
      properties: {
        invoice_uuid: {
          type: "string",
          description: "UUID of the invoice",
        },
        document_type: {
          type: "string",
          description: "Type of document to generate",
          enum: [
            "original",
            "copy",
            "original_copy",
            "duplicate",
            "original_duplicate",
            "copy_duplicate",
            "regular",
            "double_regular",
          ],
        },
        locale: {
          type: "string",
          description: "Language: pl (Polish), en (English), pe (Polish-English bilingual)",
          enum: ["pl", "en", "pe"],
        },
      },
      required: ["invoice_uuid"],
    },
  },

  {
    name: "infakt_send_invoice_email",
    description:
      "Send invoice via email to client. By default uses client's email address. " +
      "You can customize recipient, subject, and message body.",
    inputSchema: {
      type: "object",
      properties: {
        invoice_uuid: {
          type: "string",
          description: "UUID of the invoice",
        },
        recipient_email: {
          type: "string",
          description: "Recipient email address (optional, uses client email by default)",
        },
        email_subject: {
          type: "string",
          description: "Custom email subject (optional)",
        },
        email_message: {
          type: "string",
          description: "Custom email message body (optional)",
        },
      },
      required: ["invoice_uuid"],
    },
  },

  {
    name: "infakt_mark_invoice_paid",
    description:
      "Mark an invoice as paid with specified payment date. " +
      "This updates the invoice status and records the payment date.",
    inputSchema: {
      type: "object",
      properties: {
        invoice_uuid: {
          type: "string",
          description: "UUID of the invoice",
        },
        paid_date: {
          type: "string",
          description: "Payment date in YYYY-MM-DD format",
        },
      },
      required: ["invoice_uuid", "paid_date"],
    },
  },

  // =========================================================================
  // Client Management Tools
  // =========================================================================
  {
    name: "infakt_list_clients",
    description:
      "List all clients with optional filtering and pagination. " +
      "Supports filtering by company name, NIP tax code, and email address.",
    inputSchema: {
      type: "object",
      properties: {
        offset: {
          type: "number",
          description: "Pagination offset",
        },
        limit: {
          type: "number",
          description: "Results per page (max: 100)",
        },
        company_name: {
          type: "string",
          description: "Filter by company name (contains)",
        },
        nip: {
          type: "string",
          description: "Filter by NIP tax code (exact match)",
        },
        email: {
          type: "string",
          description: "Filter by email (exact match)",
        },
        fields: {
          type: "string",
          description: "Comma-separated fields to return",
        },
      },
    },
  },

  {
    name: "infakt_get_client",
    description:
      "Get detailed information about a specific client by ID. " +
      "Returns complete client data including contact information and address.",
    inputSchema: {
      type: "object",
      properties: {
        client_id: {
          type: "number",
          description: "Client ID",
        },
      },
      required: ["client_id"],
    },
  },

  {
    name: "infakt_create_client",
    description:
      "Create a new client with company and contact information. " +
      "Company name is required; all other fields are optional.",
    inputSchema: {
      type: "object",
      properties: {
        company_name: {
          type: "string",
          description: "Company name (required)",
        },
        first_name: {
          type: "string",
          description: "Contact person first name",
        },
        last_name: {
          type: "string",
          description: "Contact person last name",
        },
        tax_code: {
          type: "string",
          description: "NIP tax code",
        },
        street: {
          type: "string",
          description: "Street name",
        },
        street_number: {
          type: "string",
          description: "Street number",
        },
        flat_number: {
          type: "string",
          description: "Flat/apartment number",
        },
        city: {
          type: "string",
          description: "City",
        },
        post_code: {
          type: "string",
          description: "Postal code",
        },
        country: {
          type: "string",
          description: "Country code (e.g., 'PL', 'DE', 'US')",
        },
        email: {
          type: "string",
          description: "Email address",
        },
        phone: {
          type: "string",
          description: "Phone number",
        },
        business_activity_kind: {
          type: "string",
          description: "Type of business activity",
          enum: ["company", "self_employed", "private_person"],
        },
      },
      required: ["company_name"],
    },
  },

  {
    name: "infakt_update_client",
    description:
      "Update an existing client's information. " +
      "Only provided fields will be updated; others remain unchanged.",
    inputSchema: {
      type: "object",
      properties: {
        client_id: {
          type: "number",
          description: "Client ID",
        },
        company_name: {
          type: "string",
          description: "Update company name",
        },
        first_name: {
          type: "string",
          description: "Update first name",
        },
        last_name: {
          type: "string",
          description: "Update last name",
        },
        tax_code: {
          type: "string",
          description: "Update NIP tax code",
        },
        street: {
          type: "string",
          description: "Update street name",
        },
        street_number: {
          type: "string",
          description: "Update street number",
        },
        flat_number: {
          type: "string",
          description: "Update flat number",
        },
        city: {
          type: "string",
          description: "Update city",
        },
        post_code: {
          type: "string",
          description: "Update postal code",
        },
        country: {
          type: "string",
          description: "Update country code",
        },
        email: {
          type: "string",
          description: "Update email address",
        },
        phone: {
          type: "string",
          description: "Update phone number",
        },
      },
      required: ["client_id"],
    },
  },

  {
    name: "infakt_delete_client",
    description:
      "Delete a client by ID. This operation is permanent and cannot be undone. " +
      "Clients with associated invoices cannot be deleted.",
    inputSchema: {
      type: "object",
      properties: {
        client_id: {
          type: "number",
          description: "Client ID to delete",
        },
      },
      required: ["client_id"],
    },
  },

  // =========================================================================
  // Product Management Tools
  // =========================================================================
  {
    name: "infakt_list_products",
    description:
      "List all products/services with optional filtering and pagination. " +
      "Products can be reused when creating invoices.",
    inputSchema: {
      type: "object",
      properties: {
        offset: {
          type: "number",
          description: "Pagination offset",
        },
        limit: {
          type: "number",
          description: "Results per page (max: 100)",
        },
        name: {
          type: "string",
          description: "Filter by product name (contains)",
        },
        fields: {
          type: "string",
          description: "Comma-separated fields to return",
        },
      },
    },
  },

  {
    name: "infakt_get_product",
    description:
      "Get detailed information about a specific product by ID. " +
      "Returns complete product data including pricing and tax information.",
    inputSchema: {
      type: "object",
      properties: {
        product_id: {
          type: "number",
          description: "Product ID",
        },
      },
      required: ["product_id"],
    },
  },

  {
    name: "infakt_create_product",
    description:
      "Create a new product/service that can be reused on invoices. " +
      "Name, unit price, and VAT rate are required.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Product/service name (required)",
        },
        unit_net_price: {
          type: "number",
          description: "Unit net price (required)",
        },
        tax_symbol: {
          type: ["string", "number"],
          description: "VAT rate (required): 23, 8, 5, 0, 'zw', etc.",
        },
        unit: {
          type: "string",
          description: "Unit of measure (e.g., 'szt', 'kg', 'h')",
        },
        pkwiu: {
          type: "string",
          description: "PKWiU classification code",
        },
        description: {
          type: "string",
          description: "Product description",
        },
      },
      required: ["name", "unit_net_price", "tax_symbol"],
    },
  },

  {
    name: "infakt_update_product",
    description:
      "Update an existing product's information. " +
      "Only provided fields will be updated; others remain unchanged.",
    inputSchema: {
      type: "object",
      properties: {
        product_id: {
          type: "number",
          description: "Product ID",
        },
        name: {
          type: "string",
          description: "Update product name",
        },
        unit_net_price: {
          type: "number",
          description: "Update unit net price",
        },
        tax_symbol: {
          type: ["string", "number"],
          description: "Update VAT rate",
        },
        unit: {
          type: "string",
          description: "Update unit of measure",
        },
        pkwiu: {
          type: "string",
          description: "Update PKWiU code",
        },
        description: {
          type: "string",
          description: "Update product description",
        },
      },
      required: ["product_id"],
    },
  },

  {
    name: "infakt_delete_product",
    description:
      "Delete a product by ID. This operation is permanent and cannot be undone. " +
      "Products used on invoices cannot be deleted.",
    inputSchema: {
      type: "object",
      properties: {
        product_id: {
          type: "number",
          description: "Product ID to delete",
        },
      },
      required: ["product_id"],
    },
  },

  // =========================================================================
  // Reference Data Tools
  // =========================================================================
  {
    name: "infakt_get_vat_rates",
    description:
      "Get list of available VAT rates for use on invoices. " +
      "Returns standard rates (23%, 8%, 5%, 0%) and special rates (exempt, reverse charge, etc.).",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },

  {
    name: "infakt_get_bank_accounts",
    description:
      "Get list of bank accounts configured for invoices. " +
      "These can be used when creating invoices to specify payment destination.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },

  {
    name: "infakt_get_account_info",
    description:
      "Get current account information including subscription plan details and usage limits. " +
      "Shows remaining quota for invoices, clients, and products.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },

  // =========================================================================
  // Cost Management Tools
  // =========================================================================
  {
    name: "infakt_list_costs",
    description:
      "List cost documents (expenses) with optional pagination. " +
      "Cost documents track business expenses for accounting purposes.",
    inputSchema: {
      type: "object",
      properties: {
        offset: {
          type: "number",
          description: "Pagination offset",
        },
        limit: {
          type: "number",
          description: "Results per page (max: 100)",
        },
        fields: {
          type: "string",
          description: "Comma-separated fields to return",
        },
      },
    },
  },

  {
    name: "infakt_get_cost",
    description:
      "Get detailed information about a specific cost document by UUID. " +
      "Returns complete cost data including amounts and metadata.",
    inputSchema: {
      type: "object",
      properties: {
        cost_uuid: {
          type: "string",
          description: "Cost document UUID",
        },
      },
      required: ["cost_uuid"],
    },
  },
];
