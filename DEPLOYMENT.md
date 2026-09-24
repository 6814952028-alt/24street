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
CLIENT_ORIGIN=https://<your-vercel-domain>
```

`VITE_API_URL` is not required in the deployed client. The Vercel rewrite sends `/api/*` requests to the serverless API function. For local development, keep `VITE_API_URL=http://localhost:5000` in `client/.env.local` if needed.

## 3. Deploy

Vercel uses `vercel.json` to build `client` and route API requests to `api/index.js`. Product image uploads use memory storage and are written directly to Vercel Blob; no local upload directory is required.

For local setup, copy `server/.env.example` to `server/.env`, install dependencies, and run:

```text
npm install
npm --prefix server install
npm --prefix client install
npm run build
```