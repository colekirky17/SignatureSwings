# Signature Swings

Next.js and Tailwind CSS starter for the Signature Swings website.

## Getting Started

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

Railway can detect this as a Node/Next.js app from `package.json`. The production build command is
`npm run build` and the start command is `npm start`.

## Contact Email

The contact form sends internal inquiry emails through Resend. Configure these server-only
environment variables in Railway:

```bash
RESEND_API_KEY=
CONTACT_FROM_EMAIL=
CONTACT_TO_EMAIL=
```

`CONTACT_FROM_EMAIL` must use a domain verified in Resend. None of these variables should use a
`NEXT_PUBLIC_` prefix.

## Paid Order Fulfillment Email

The site accepts Shopify `orders/paid` webhooks at:

```text
https://YOUR_SITE_DOMAIN/api/webhooks/shopify/orders-paid
```

Configure that HTTPS URL for the `orders/paid` topic in the Shopify app connected to the store,
then set these server-only environment variables:

```bash
SHOPIFY_WEBHOOK_SECRET=
FULFILLMENT_FROM_EMAIL=
FULFILLMENT_TO_EMAIL=
```

`SHOPIFY_WEBHOOK_SECRET` is the Shopify app client secret used to sign webhook deliveries.
`FULFILLMENT_FROM_EMAIL` must use a domain verified in Resend. The fulfillment email includes
each paid line item and its Shopify line-item properties, which contain the customization choices.
If the fulfillment email variables are omitted, the contact email addresses are used as fallback.
