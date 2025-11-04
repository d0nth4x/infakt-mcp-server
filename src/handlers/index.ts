/**
 * Central export point for all tool handlers
 *
 * Aggregates and exports all handler functions from different modules.
 */

// Invoice handlers
export {
  createInvoice,
  checkInvoiceStatus,
  listInvoices,
  getInvoice,
  updateInvoice,
  deleteInvoice,
  downloadInvoicePdf,
  sendInvoiceEmail,
  markInvoicePaid,
} from "./invoice-handlers.js";

// Client handlers
export {
  listClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
} from "./client-handlers.js";

// Product handlers
export {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./product-handlers.js";

// Reference data handlers
export {
  getVatRates,
  getBankAccounts,
  getAccountInfo,
} from "./reference-handlers.js";

// Cost handlers
export { listCosts, getCost } from "./cost-handlers.js";
