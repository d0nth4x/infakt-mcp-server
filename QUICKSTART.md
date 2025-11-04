# Quick Start Guide

**Languages:** [English](#) | [Polski (Polish)](QUICKSTART.pl.md)

Get your inFakt MCP server up and running in 5 minutes!

## Step 1: Get Your API Key

### Option A: Production (Real Account)
1. Go to https://app.infakt.pl
2. Sign in or create an account
3. Navigate to **Ustawienia** → **Inne opcje** → **API**
4. Click **Generuj nowy klucz API**
5. Select required scopes:
   - ✅ `api:invoices:read` - Read invoices, clients, products
   - ✅ `api:invoices:write` - Create/update invoices
   - ✅ `api:costs:read` - Read costs (optional)
   - ✅ `api:costs:write` - Manage costs (optional)
6. Copy your API key

### Option B: Sandbox (Testing Only)
1. Register at https://konto.sandbox-infakt.pl/rejestracja
2. Navigate to **Ustawienia** → **API**
3. Generate API key with all scopes
4. Copy your API key

## Step 2: Install Dependencies

```bash
cd infakt-mcp
npm install
npm run build
```

## Step 3: Configure Environment

Create a `.env` file:

```bash
# For production
INFAKT_API_KEY=your_production_api_key_here
INFAKT_USE_SANDBOX=false

# OR for sandbox testing
INFAKT_API_KEY=your_sandbox_api_key_here
INFAKT_USE_SANDBOX=true
```

## Step 4: Add to Claude Desktop

### macOS
Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

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

### Windows
Edit `%APPDATA%\Claude\claude_desktop_config.json` with the same configuration.

**Important:** Replace `/absolute/path/to/infakt-mcp` with the actual full path!

## Step 5: Restart Claude Desktop

Close and reopen Claude Desktop completely.

## Step 6: Test It!

Try these prompts in Claude:

### Test 1: List Invoices
```
List my last 5 invoices
```

### Test 2: Get Account Info
```
Show me my inFakt account information
```

### Test 3: List Clients
```
Show me all my clients
```

### Test 4: Create Invoice (Sandbox Only!)
```
Create a test invoice for "Test Client Sp. z o.o." with:
- One service: "Consulting" for 1000 PLN net with 23% VAT
- Payment method: bank transfer
- Client NIP: 1234567890
- Client address: ul. Testowa 1, 00-001 Warsaw
```

## Troubleshooting

### "MCP server not available"
- Verify the path in config is absolute (not relative)
- Check the build succeeded: `ls dist/index.js`
- Restart Claude Desktop completely

### "Authentication failed"
- Verify API key is correct
- Check it hasn't expired
- Ensure scopes include at least `api:invoices:read`

### "Cannot find module"
- Run `npm install` again
- Run `npm run build` again
- Check `node_modules` folder exists

### Still Having Issues?
1. Check logs: Look in Claude Desktop's developer console
2. Test manually:
   ```bash
   INFAKT_API_KEY=your_key_here npm run dev
   ```
3. Verify API key works with curl:
   ```bash
   curl -H "X-inFakt-ApiKey: YOUR_KEY" \
        https://api.infakt.pl/api/v3/account.json
   ```

## What's Next?

### Learn the Tools
Check out all available tools in the [README.md](README.md#available-tools).

### Common Use Cases

#### Invoice Workflow
1. List clients → `infakt_list_clients`
2. Create invoice → `infakt_create_invoice`
3. Check status → `infakt_check_invoice_status`
4. Download PDF → `infakt_download_invoice_pdf`
5. Send email → `infakt_send_invoice_email`
6. Mark paid → `infakt_mark_invoice_paid`

#### Client Management
1. List all clients → `infakt_list_clients`
2. Search by NIP → `infakt_list_clients` with `nip` filter
3. Get details → `infakt_get_client`
4. Update info → `infakt_update_client`

#### Product Catalog
1. List products → `infakt_list_products`
2. Search by name → `infakt_list_products` with `name` filter
3. Add new product → `infakt_create_product`
4. Update pricing → `infakt_update_product`

### Advanced Features

#### Filtering
```
Show me invoices from December 2024 that are unpaid
```

#### Sorting
```
List products sorted by price descending
```

#### Field Selection
```
Show me just the invoice numbers and totals for last month
```

## Support

- **API Documentation**: https://www.infakt.pl/api/
- **inFakt Support**: pomoc@infakt.pl
- **GitHub Issues**: [Create an issue](https://github.com/yourusername/infakt-mcp/issues)

## Tips

1. **Use Sandbox First**: Always test with sandbox before using production
2. **Check Status**: When creating invoices, always check the status
3. **Rate Limits**: Be aware of API rate limits (300 GET/min, 150 other/min)
4. **Cache Data**: Consider caching client and product lists
5. **Error Handling**: Check error messages for helpful debugging info

Happy invoicing! 🧾
