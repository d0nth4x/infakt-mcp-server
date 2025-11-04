# inFakt MCP Server

**Languages:** [English](#) | [Polski (Polish)](README.pl.md)

Model Context Protocol (MCP) server for the inFakt API - a comprehensive Polish invoicing and accounting service.

## Overview

This MCP server provides seamless integration with inFakt's REST API, enabling AI assistants like Claude to interact with your inFakt account for:

- **Invoice Management** - Create, read, update, and delete VAT invoices, corrective invoices, and other document types
- **Client Management** - Manage customer database
- **Product Management** - Maintain product/service catalog
- **Cost Tracking** - Access expense documents
- **Reference Data** - Query VAT rates, bank accounts, and other configuration data

## Features

- Full CRUD operations for invoices, clients, and products
- Asynchronous invoice creation with status tracking
- PDF generation and email delivery
- Advanced filtering, pagination, and sorting
- Support for both production and sandbox environments
- Comprehensive error handling

## Prerequisites

- Node.js 18 or higher
- inFakt account (production or sandbox)
- inFakt API key

## Installation

1. Clone this repository:

```bash
git clone <repository-url>
cd infakt-mcp
```

2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

## Configuration

### Getting Your API Key

#### Production Environment:

1. Log in to [inFakt](https://app.infakt.pl)
2. Navigate to Settings → Other Options → API
3. Generate a new API key with required scopes

#### Sandbox Environment:

1. Register at [inFakt Sandbox](https://konto.sandbox-infakt.pl/rejestracja)
2. Navigate to Settings → API
3. Generate a test API key

### Environment Variables

Create a `.env` file or set the following environment variables:

```bash
# Required
INFAKT_API_KEY=your_api_key_here

# Optional
INFAKT_USE_SANDBOX=true  # Set to 'true' for sandbox, omit or 'false' for production
INFAKT_BASE_URL=https://api.infakt.pl/api/v3  # Custom base URL (optional)
```

### MCP Client Configuration

#### For Claude Desktop:

Add to your `claude_desktop_config.json`:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "infakt": {
      "command": "node",
      "args": ["/absolute/path/to/infakt-mcp/dist/index.js"],
      "env": {
        "INFAKT_API_KEY": "your_api_key_here",
        "INFAKT_USE_SANDBOX": "false"
      }
    }
  }
}
```

#### For Other MCP Clients:

Configure according to your client's documentation, ensuring:

- Command: `node dist/index.js`
- Environment variables are properly set
- Working directory is set to the project root

## Available Tools

### Invoice Management

#### `infakt_create_invoice`

Create a new VAT invoice asynchronously.

**Parameters:**

- `client_company_name` (required): Client company name
- `payment_method` (required): cash, transfer, card, etc.
- `services` (required): Array of services/products
- `status`: draft (default), paid, or printed
- `client_id`: Use existing client
- Client details for new clients (first_name, last_name, tax_code, etc.)
- Additional fields: notes, invoice_date, sale_date, payment_date, etc.

**Returns:** Task reference number for status checking

#### `infakt_check_invoice_status`

Check the status of an asynchronously created invoice.

**Parameters:**

- `task_reference_number` (required): Reference number from create_invoice

#### `infakt_list_invoices`

List all invoices with filtering and pagination.

**Parameters:**

- `offset`: Pagination offset
- `limit`: Results per page (max 100)
- `order`: Sort order (e.g., "invoice_date desc")
- `number`: Filter by invoice number
- `client_company_name`: Filter by client name
- `status`: Filter by status
- `invoice_date_from`, `invoice_date_to`: Date range filters
- `fields`: Comma-separated fields to return

#### `infakt_get_invoice`

Get detailed information about a specific invoice.

**Parameters:**

- `invoice_uuid` (required): Invoice UUID
- `fields`: Optional field selection

#### `infakt_update_invoice`

Update an existing invoice (draft only).

**Parameters:**

- `invoice_uuid` (required): Invoice UUID
- Fields to update (client_company_name, payment_method, services, etc.)

#### `infakt_delete_invoice`

Delete an invoice (draft only).

**Parameters:**

- `invoice_uuid` (required): Invoice UUID

#### `infakt_download_invoice_pdf`

Download invoice as PDF (base64 encoded).

**Parameters:**

- `invoice_uuid` (required): Invoice UUID
- `document_type`: original, copy, duplicate, etc.
- `locale`: pl, en, or pe

#### `infakt_send_invoice_email`

Send invoice via email.

**Parameters:**

- `invoice_uuid` (required): Invoice UUID
- `recipient_email`: Custom recipient (uses client email by default)
- `email_subject`: Custom subject
- `email_message`: Custom message

#### `infakt_mark_invoice_paid`

Mark an invoice as paid.

**Parameters:**

- `invoice_uuid` (required): Invoice UUID
- `paid_date` (required): Payment date (YYYY-MM-DD)

### Client Management

#### `infakt_list_clients`

List all clients with filtering.

#### `infakt_get_client`

Get client details by ID.

#### `infakt_create_client`

Create a new client.

#### `infakt_update_client`

Update an existing client.

#### `infakt_delete_client`

Delete a client.

### Product Management

#### `infakt_list_products`

List all products with filtering.

#### `infakt_get_product`

Get product details by ID.

#### `infakt_create_product`

Create a new product.

#### `infakt_update_product`

Update an existing product.

#### `infakt_delete_product`

Delete a product.

### Reference Data

#### `infakt_get_vat_rates`

Get available VAT rates.

#### `infakt_get_bank_accounts`

Get configured bank accounts.

#### `infakt_get_account_info`

Get account information and limits.

### Cost Management

#### `infakt_list_costs`

List cost documents.

#### `infakt_get_cost`

Get cost document details.

## Usage Examples

### Example 1: Create an Invoice

```
Create a new invoice for client "ACME Corp" with:
- Payment method: bank transfer
- One service: "Website Development" for 5000 PLN net with 23% VAT
- Client tax code: 1234567890
- Client address: ul. Główna 1, 00-001 Warsaw, Poland
```

The MCP server will:

1. Create the invoice asynchronously
2. Return a task reference number
3. You can then check the status and retrieve the invoice UUID

### Example 2: List Recent Invoices

```
List the last 10 invoices from December 2024, sorted by date descending
```

### Example 3: Send Invoice via Email

```
Send invoice <uuid> via email to client
```

### Example 4: Generate PDF

```
Download PDF for invoice <uuid> in Polish language
```

## API Scopes Required

The API key must have appropriate scopes for the operations you want to perform:

- `api:invoices:read` - Read invoices, clients, products
- `api:invoices:write` - Create/update/delete invoices, clients, products
- `api:costs:read` - Read cost documents
- `api:costs:write` - Manage costs
- `api:accounting:read` - Read accounting data
- `api:accounting:write` - Manage accounting operations
- `api:sensitive:bank_accounts:write` - Manage bank accounts

## Rate Limits

inFakt API has the following rate limits:

- GET requests: 300 requests per 60 seconds per IP
- Other methods: 150 requests per 60 seconds per IP
- Invoice email sends: 3000/day (paid accounts), 20/day (free accounts)

## Development

### Run in Development Mode

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run watch
```

## Testing

### Using Sandbox Environment

Set `INFAKT_USE_SANDBOX=true` to use the test environment:

- No real invoices are created
- Safe for testing integrations
- Limit: 2500 invoices per month

## Troubleshooting

### Authentication Errors (401)

- Verify your API key is correct
- Check that the key has required scopes
- Ensure the key hasn't expired

### Payment Required (402)

- Your plan doesn't support API access or has exceeded document limits
- Upgrade your plan at [inFakt](https://app.infakt.pl)

### Rate Limit Errors (429)

- Wait before retrying
- Implement exponential backoff
- Consider caching responses

### Validation Errors (422)

- Check required fields are provided
- Verify data formats (dates as YYYY-MM-DD, valid VAT rates, etc.)
- Review error messages in response

## Resources

- [inFakt API Documentation](https://www.infakt.pl/api/)
- [inFakt Website](https://www.infakt.pl)
- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [MCP Specification](https://spec.modelcontextprotocol.io)

## License

MIT

## Support

For API issues, contact inFakt support at [pomoc@infakt.pl](mailto:pomoc@infakt.pl)

For MCP server issues, please open an issue in this repository.
