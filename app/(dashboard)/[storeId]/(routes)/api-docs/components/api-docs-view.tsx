"use client"

import { useParams } from "next/navigation"
import { toast } from "react-hot-toast"
import { Copy, AlertTriangle, CheckCircle2 } from "lucide-react"

import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { ApiAlert } from "@/components/ui/api-alert"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useOrigin } from "@/hooks/use-origin"

interface ApiDocsViewProps {
  allowedOrigins: string[]
}

interface Endpoint {
  method: "GET" | "POST" | "PATCH" | "DELETE"
  variant: "public" | "admin"
  path: string
  summary: string
  params?: string[]
  example?: string
}

const CodeBlock: React.FC<{ code: string }> = ({ code }) => {
  const onCopy = () => {
    navigator.clipboard.writeText(code)
    toast.success("Copied to clipboard.")
  }

  return (
    <div className="relative">
      <pre className="rounded bg-muted p-4 text-xs overflow-x-auto font-mono">
        <code>{code}</code>
      </pre>
      <Button
        variant="outline"
        size="icon"
        className="absolute top-2 right-2 h-7 w-7"
        onClick={onCopy}
      >
        <Copy className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

const EndpointSection: React.FC<{
  title: string
  description: string
  endpoints: Endpoint[]
  baseUrl: string
}> = ({ title, description, endpoints, baseUrl }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {endpoints.map((endpoint, i) => (
          <div key={i} className="space-y-2">
            <ApiAlert
              title={endpoint.method}
              variant={endpoint.variant}
              description={`${baseUrl}${endpoint.path}`}
            />
            <p className="text-sm text-muted-foreground pl-1">{endpoint.summary}</p>
            {endpoint.params && endpoint.params.length > 0 && (
              <ul className="text-xs text-muted-foreground pl-5 list-disc space-y-0.5">
                {endpoint.params.map(p => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            )}
            {endpoint.example && <CodeBlock code={endpoint.example} />}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export const ApiDocsView: React.FC<ApiDocsViewProps> = ({ allowedOrigins }) => {
  const params = useParams()
  const origin = useOrigin()
  const baseUrl = `${origin}/api/${params.storeId}`

  return (
    <>
      <Heading
        title="API / Developers"
        description="Endpoints your storefront can call to read products, sizes, colors, categories, sales, billboards, exchange rates, and to run checkout."
      />
      <Separator />

      {allowedOrigins.length > 0 ? (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Allowed storefront origins</AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              Requests from these origins are allowed by the CMS&apos;s CORS policy (configured via the{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">ALLOWED_ORIGINS</code> environment
              variable on this deployment). This applies to every store hosted on this CMS, not just this one.
            </p>
            <ul className="list-disc pl-5 text-sm">
              {allowedOrigins.map(o => (
                <li key={o} className="font-mono">{o}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No allowed origins configured</AlertTitle>
          <AlertDescription>
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">ALLOWED_ORIGINS</code> is not set on
            this deployment. Requests from your storefront&apos;s domain will be blocked with a 403 until it&apos;s
            added (comma-separated list) to the CMS&apos;s environment variables and redeployed.
          </AlertDescription>
        </Alert>
      )}

      <EndpointSection
        title="Products"
        description="The main catalog endpoints a storefront uses to list and display products."
        baseUrl={baseUrl}
        endpoints={[
          {
            method: "GET",
            variant: "public",
            path: "/products",
            summary: "List products for this store. Filters and ordering below; results are ordered newest first and exclude archived products.",
            params: [
              "categoryId, colorId, sizeId — filter by relation id",
              "isFeatured — any truthy value filters to featured products only",
              "amountToFetch — limit the number of results returned",
              "excludeProductId — omit a specific product (e.g. on a product detail page's 'related products')"
            ],
            example: `GET ${baseUrl}/products?isFeatured=true&amountToFetch=4

[
  {
    "id": "…",
    "name": "…",
    "priceInCents": 2999,
    "quantity": 10,
    "description": "…",
    "isFeatured": true,
    "isArchived": false,
    "images": [{ "url": "…", "credit": "…" }],
    "category": { "id": "…", "name": "…" },
    "color": { "id": "…", "name": "…", "value": "…" },
    "size": { "id": "…", "name": "…", "value": "…" },
    "variations": [{ "id": "…", "name": "…", "priceInCents": 3499 }],
    "bundles": [ /* … */ ]
  }
]`
          },
          {
            method: "GET",
            variant: "public",
            path: "/products/{productId}",
            summary: "Fetch a single product, including its current sale price if a store-wide or product-specific sale is active. Sold-out products (quantity 0) never show a sale.",
            example: `GET ${baseUrl}/products/{productId}

{
  "id": "…",
  "name": "…",
  "priceInCents": 2999,
  "price": "29.99",
  "images": [ /* … */ ],
  "category": { /* … */ },
  "color": { /* … */ },
  "size": { /* … */ },
  "variations": [ /* … */ ],
  "bundles": [ /* … */ ],
  "saleInfo": {
    "originalPriceInCents": 2999,
    "salePriceInCents": 2399,
    "discountPercentage": 20,
    "sale": { "id": "…", "name": "Summer Sale" },
    "hasActiveSale": true
  }
}`
          }
        ]}
      />

      <EndpointSection
        title="Checkout"
        description="Endpoints for running a Stripe-hosted checkout from your storefront's cart."
        baseUrl={baseUrl}
        endpoints={[
          {
            method: "POST",
            variant: "public",
            path: "/checkout",
            summary: "Creates a Stripe Checkout session and returns its redirect URL. Rate-limited to 20 requests per 60 seconds per IP.",
            params: [
              "cartItems (required) — object keyed by productId, each entry: { name, priceInCents (or price), quantity, category?, variations?, weight? }",
              "totalPrice (required) — number",
              "shippingAddress (required) — { street, city, state, zipCode, country }",
              "currency (required) — e.g. \"usd\"",
              "shippingType (optional) — { id, title, rate } — a shipping line item is added if rate > 0"
            ],
            example: `POST ${baseUrl}/checkout
Content-Type: application/json

{
  "cartItems": {
    "clw1a2b3c": { "name": "Tee", "priceInCents": 2999, "quantity": 2 }
  },
  "totalPrice": 59.98,
  "shippingAddress": { "street": "123 Main St", "city": "Austin", "state": "TX", "zipCode": "78701", "country": "US" },
  "currency": "usd"
}

→ 200 { "url": "https://checkout.stripe.com/…" }
→ 400 missing cartItems / totalPrice / shippingAddress
→ 404 "Store not found"
→ 429 rate limited
`
          },
          {
            method: "GET",
            variant: "public",
            path: "/checkout/{sessionId}",
            summary: "After Stripe redirects back to your success page, fetch the customer's name/email for confirmation.",
            example: `GET ${baseUrl}/checkout/{sessionId}

{ "name": "Jane Doe", "email": "jane@example.com" }`
          }
        ]}
      />

      <EndpointSection
        title="Catalog reference data"
        description="Categories, colors, sizes and billboards used to build product listing/filter UI."
        baseUrl={baseUrl}
        endpoints={[
          { method: "GET", variant: "public", path: "/categories", summary: "List all categories for this store." },
          { method: "GET", variant: "public", path: "/categories/{categoryId}", summary: "Fetch a category with its billboard." },
          { method: "GET", variant: "public", path: "/colors", summary: "List all colors for this store." },
          { method: "GET", variant: "public", path: "/sizes", summary: "List all sizes for this store." },
          { method: "GET", variant: "public", path: "/billboards", summary: "List all billboards for this store." },
          { method: "GET", variant: "public", path: "/billboards/{billboardId}", summary: "Fetch a single billboard." }
        ]}
      />

      <EndpointSection
        title="Sales"
        description="Active promotions, used to show sale pricing/badges in your storefront."
        baseUrl={baseUrl}
        endpoints={[
          {
            method: "GET",
            variant: "public",
            path: "/sales/active",
            summary: "List currently active sales (started, not yet ended), best discount first.",
          }
        ]}
      />

      <EndpointSection
        title="Exchange rates"
        description="For storefronts displaying prices in a currency other than the store's base currency."
        baseUrl={baseUrl}
        endpoints={[
          {
            method: "GET",
            variant: "public",
            path: "/exchange-rates?base=USD",
            summary: "Returns current exchange rates for the given base currency (defaults to USD), cached server-side.",
            example: `GET ${baseUrl}/exchange-rates?base=USD

{
  "success": true,
  "rates": { "EUR": 0.92, "GBP": 0.79, "…": "…" },
  "base": "USD",
  "timestamp": 1732000000000,
  "cached": true,
  "cacheAge": 12,
  "nextUpdate": "2026-07-22T18:00:00.000Z"
}`
          }
        ]}
      />

      <Alert>
        <AlertTitle>Write endpoints (create/update/delete)</AlertTitle>
        <AlertDescription>
          POST/PATCH/DELETE endpoints for products, categories, colors, sizes, billboards and sales require an
          authenticated CMS admin session and are meant for this dashboard, not for storefronts to call directly.
        </AlertDescription>
      </Alert>
    </>
  )
}
