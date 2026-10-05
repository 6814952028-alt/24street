# Vercel deployment

## 1. Create the services

1. Create a MongoDB Atlas cluster and database user. In Atlas, allow connections from Vercel by configuring the network access list appropriately.
2. Create a Vercel Blob store in the Vercel project under **Storage**.
3. Import this repository into Vercel with the repository root as the project root.

## 2. Configure environment variables

Add these variables in Vercel for Production, Preview, and Development as needed:

```text
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/24street?retryWrites=true&w=majority
JWT_SECRET=<long-random-secret>
BLOB_READ_WRITE_TOKEN=<token-created-by-vercel-blob>
CLIENT_ORIGIN=https://<your-storefront-domain>
APP_URL=https://<your-storefront-domain>
STRIPE_SECRET_KEY=<Stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<Stripe-webhook-signing-secret>
PAYMENT_SLIP_BLOB_TOKEN=<private-Blob-store-token>
BANK_TRANSFER_INSTRUCTIONS=<transfer-details-for-customers>
```

The shared client API base defaults to `https://two4street.onrender.com` in production to match the existing hosted API and `http://localhost:5000` in local development. Set `VITE_API_URL` in Vercel to the backend origin (for example, `https://two4street.onrender.com`). To use this repository's Vercel serverless API instead, set `VITE_API_URL=/`. For local development, leave it unset or use `http://localhost:5000`.

## 3. Deploy

Vercel uses `vercel.json` to build `client` and route API requests to `api/index.js`. Product image uploads use memory storage and are written directly to Vercel Blob; no local upload directory is required.

For local setup, copy `server/.env.example` to `server/.env`, install dependencies, and run:

```text
npm install
npm --prefix server install
npm --prefix client install
npm run build
```
## Payments and orders

For hosted PromptPay and card checkout, add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` to the server environment and set `APP_URL` to the public storefront origin. Register a Stripe webhook at `/api/orders/payments/stripe-webhook` for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, and `checkout.session.expired`.

For bank transfers, set `BANK_TRANSFER_INSTRUCTIONS` and connect a dedicated **private** Vercel Blob store for payment slips as `PAYMENT_SLIP_BLOB_TOKEN`. Do not reuse the public product-image Blob store for slips. Vercel private Blob supports authenticated access through the SDK; the admin slip endpoint streams slips only after admin authentication. [Vercel private Blob documentation](https://vercel.com/docs/vercel-blob/private-storage).

Production order creation uses MongoDB transactions to reserve stock. Use MongoDB Atlas (replica set) and allow the deployed API host to connect to it. Set `CLIENT_ORIGIN` to the exact storefront origin for the Render API CORS policy.
