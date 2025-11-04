#!/usr/bin/env node

/**
 * inFakt MCP Server
 *
 * A Model Context Protocol (MCP) server for the inFakt API - Polish invoicing
 * and accounting service. Provides 28 tools for managing invoices, clients,
 * products, costs, and reference data.
 *
 * @version 1.0.0
 * @author d0nth4x
 * @license MIT
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";

import { getConfig, getDisplayConfig, ConfigurationError } from "./config.js";
import { createApiClient, ApiClient, handleApiError } from "./api-client.js";
import { TOOLS } from "./tools.js";
import type { ToolResponse, ToolHandler } from "./types.js";

// Import all tool handlers
import * as handlers from "./handlers/index.js";

/**
 * Tool registry mapping tool names to their handler functions
 */
const TOOL_HANDLERS: Record<string, ToolHandler> = {
  // Invoice handlers
  infakt_create_invoice: handlers.createInvoice,
  infakt_check_invoice_status: handlers.checkInvoiceStatus,
  infakt_list_invoices: handlers.listInvoices,
  infakt_get_invoice: handlers.getInvoice,
  infakt_update_invoice: handlers.updateInvoice,
  infakt_delete_invoice: handlers.deleteInvoice,
  infakt_download_invoice_pdf: handlers.downloadInvoicePdf,
  infakt_send_invoice_email: handlers.sendInvoiceEmail,
  infakt_mark_invoice_paid: handlers.markInvoicePaid,

  // Client handlers
  infakt_list_clients: handlers.listClients,
  infakt_get_client: handlers.getClient,
  infakt_create_client: handlers.createClient,
  infakt_update_client: handlers.updateClient,
  infakt_delete_client: handlers.deleteClient,

  // Product handlers
  infakt_list_products: handlers.listProducts,
  infakt_get_product: handlers.getProduct,
  infakt_create_product: handlers.createProduct,
  infakt_update_product: handlers.updateProduct,
  infakt_delete_product: handlers.deleteProduct,

  // Reference data handlers
  infakt_get_vat_rates: handlers.getVatRates,
  infakt_get_bank_accounts: handlers.getBankAccounts,
  infakt_get_account_info: handlers.getAccountInfo,

  // Cost handlers
  infakt_list_costs: handlers.listCosts,
  infakt_get_cost: handlers.getCost,
} as const;

/**
 * Validates that all defined tools have corresponding handlers
 */
function validateToolHandlers(): void {
  const toolNames = new Set(TOOLS.map((tool) => tool.name));
  const handlerNames = new Set(Object.keys(TOOL_HANDLERS));

  // Check for tools without handlers
  const missingHandlers = [...toolNames].filter((name) => !handlerNames.has(name));
  if (missingHandlers.length > 0) {
    throw new Error(
      `Missing handlers for tools: ${missingHandlers.join(", ")}`
    );
  }

  // Check for handlers without tools (could indicate orphaned code)
  const extraHandlers = [...handlerNames].filter((name) => !toolNames.has(name));
  if (extraHandlers.length > 0) {
    console.error(
      `Warning: Handlers registered for non-existent tools: ${extraHandlers.join(", ")}`
    );
  }
}

/**
 * Handles a tool call by dispatching to the appropriate handler
 *
 * @param apiClient - Configured API client instance
 * @param name - Name of the tool to invoke
 * @param args - Arguments to pass to the tool handler
 * @returns Tool response with content
 * @throws {McpError} If the tool is not found or execution fails
 */
async function handleToolCall(
  apiClient: ApiClient,
  name: string,
  args: unknown
): Promise<ToolResponse> {
  // Look up the handler
  const handler = TOOL_HANDLERS[name];

  if (!handler) {
    throw new McpError(
      ErrorCode.MethodNotFound,
      `Unknown tool: ${name}. Available tools: ${Object.keys(TOOL_HANDLERS).join(", ")}`
    );
  }

  try {
    // Execute the handler
    return await handler(apiClient, args);
  } catch (error) {
    // Handle and convert errors to MCP format
    handleApiError(error);
  }
}

/**
 * Creates and configures the MCP server
 */
function createMcpServer(apiClient: ApiClient): Server {
  const server = new Server(
    {
      name: "infakt-mcp-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register tool list handler
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS,
  }));

  // Register tool execution handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    // Log tool invocation (to stderr to not interfere with MCP protocol)
    console.error(`[inFakt MCP] Executing tool: ${name}`);

    return await handleToolCall(apiClient, name, args ?? {});
  });

  return server;
}

/**
 * Main server initialization and startup
 */
async function main(): Promise<void> {
  try {
    // Validate tool/handler consistency at startup
    validateToolHandlers();

    // Load and validate configuration
    const config = getConfig();
    const displayConfig = getDisplayConfig();

    console.error("=".repeat(60));
    console.error("inFakt MCP Server");
    console.error("=".repeat(60));
    console.error(`Version: 1.0.0`);
    console.error(`API Base URL: ${displayConfig.baseUrl}`);
    console.error(`Sandbox Mode: ${displayConfig.useSandbox ? "YES" : "NO"}`);
    console.error(`API Key: ${displayConfig.apiKeyMasked}`);
    console.error(`Available Tools: ${TOOLS.length}`);
    console.error("=".repeat(60));

    // Create API client
    const axiosInstance = createApiClient(config);
    const apiClient = new ApiClient(axiosInstance);

    // Create and configure MCP server
    const server = createMcpServer(apiClient);

    // Create transport and connect
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error("Server started successfully on stdio transport");
    console.error("Ready to receive requests...");
  } catch (error) {
    if (error instanceof ConfigurationError) {
      console.error("Configuration Error:", error.message);
      console.error("\nRequired environment variables:");
      console.error("  INFAKT_API_KEY - Your inFakt API key (required)");
      console.error("\nOptional environment variables:");
      console.error("  INFAKT_USE_SANDBOX - Set to 'true' to use sandbox API (default: false)");
      console.error("  INFAKT_BASE_URL - Custom API base URL (default: production URL)");
      process.exit(1);
    }

    console.error("Fatal error starting server:", error);
    if (error instanceof Error) {
      console.error("Stack trace:", error.stack);
    }
    process.exit(1);
  }
}

// Start the server
main().catch((error) => {
  console.error("Unhandled error in main:", error);
  process.exit(1);
});
