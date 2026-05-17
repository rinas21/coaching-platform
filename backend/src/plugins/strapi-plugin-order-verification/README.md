# Order Verification Plugin for Strapi

This plugin provides an order verification and payment confirmation interface within the Strapi admin panel, replicating the functionality of the frontend admin portal.

## Features

- **Order Listing**: Displays all orders with status, order code, customer email, and total amount
- **Order Details**: Shows order items, line totals, shipping address, and customer slip details
- **Payment Verification**: Mark orders as paid with optional payment reference and notes
- **Slip Management**: View uploaded payment slips
- **Status Tracking**: Real-time status updates (Pending Payment, Awaiting Verification, Payment Verified)

## Installation & Setup

### Prerequisites

- Strapi running on `http://localhost:1337` (or configured via `STRAPI_API_URL`)
- Express API running on `http://localhost:8000` (or configured via `STRAPI_BACKEND_API_URL`)
- Backend authentication configured (cookies will be passed to the Express API)

### Environment Variables

The plugin uses the following environment variables (set in your `.env` or deployment config):

```bash
# Strapi API URL (used by the plugin)
STRAPI_API_URL=http://localhost:1337

# Express backend API URL (where orders are fetched from)
STRAPI_BACKEND_API_URL=http://localhost:8000

# Express API authentication (via cookies from Strapi admin session)
```

### Running the Plugin

1. **Start the Express API** (if not already running):
   ```bash
   cd api
   node src/index.js
   ```

2. **Start Strapi** in development mode:
   ```bash
   cd backend
   npm run develop
   ```

3. **Access the Order Verification page**:
   - Navigate to the Strapi admin at `http://localhost:1337/admin`
   - Look for **"Order Verification"** in the left sidebar (under the main navigation)
   - Click to open the Order Verification Portal

### Usage

1. **View Orders**: The page loads and displays all orders with their current status
2. **Review Order Details**: Each order card shows:
   - Order code and status
   - Customer email and total amount
   - Order items with line totals
   - Shipping address (if available)
   - Customer slip details (payment reference and notes)
   - Link to view the uploaded payment slip

3. **Mark Order as Paid**:
   - For orders not yet marked as paid, fill in optional fields:
     - **Payment Reference**: The payment transaction/reference number
     - **Notes**: Additional notes about the payment
   - Click **"Mark payment verified (complete order)"**
   - The order will be updated and emails sent to both customer and admin

4. **View Payment Slip**: Click **"View Uploaded Slip"** to download/view the slip image or document

## API Endpoints Used

The plugin communicates with these Express API endpoints:

- `GET /admin/orders` - Fetch all orders (requires admin authentication)
- `POST /admin/orders/mark-paid` - Mark order as paid and send notifications
- `GET /admin/orders/:orderId/slip` - Download/view the payment slip

All requests include cookies for session-based authentication.

## Authentication

The plugin inherits the Strapi admin session. When you're logged into the Strapi admin, your session cookies are automatically sent to the Express API for authentication.

**Note**: The Express API checks for admin authentication via cookies or the `ADMIN_ORDER_SECRET` environment variable.

## Troubleshooting

### Orders not loading
- Ensure the Express API is running at the correct URL
- Check that `STRAPI_BACKEND_API_URL` environment variable is set correctly
- Verify admin authentication is configured in the Express API
- Check browser console for CORS or network errors

### "Mark payment verified" failing
- Ensure the Express API is accessible from Strapi
- Verify the order ID and code are correct
- Check that the Express API has SMTP configured for sending confirmation emails

### Slip not viewing
- Ensure the file was properly uploaded to the Express API
- Check that the order has a valid `slip_id` in the database

## File Structure

```
backend/src/plugins/strapi-plugin-order-verification/
├── package.json                    # Plugin metadata
├── strapi-server.js               # Server-side plugin registration
├── strapi-admin.js                # Admin UI registration
└── pages/
    └── OrderVerificationPage.tsx  # React component for the admin page
```

## Styling

The plugin uses Strapi's built-in design system components (`@strapi/design-system`), which ensures the UI integrates seamlessly with the Strapi admin theme.

## Development Notes

- The plugin is configured in `backend/config/plugins.ts`
- The component uses React hooks (`useState`, `useEffect`) for state management
- Authentication relies on browser cookies; ensure `credentials: 'include'` is set in fetch calls
- The plugin will be compiled when Strapi builds (in development mode, changes are hot-reloaded)

## Rebuilding Strapi Admin

If you make changes to the plugin code, rebuild the Strapi admin:

```bash
cd backend
npm run build
```

Then restart Strapi in development or production mode.
