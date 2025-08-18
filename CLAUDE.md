# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack e-commerce CMS built with Next.js 13 (App Router), TypeScript, Prisma, PostgreSQL, Clerk authentication, and Stripe payments. The system manages multiple stores with products, orders, categories, and shipping functionality.

## Development Commands

### Core Development

- `npm run dev` - Start the full development environment (includes Supabase, Next.js, cron job, Stripe webhook listener, and frontend)
- `npm run build` - Build the Next.js application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database Operations

- `npx prisma generate` - Generate Prisma client
- `npx prisma migrate deploy` - Deploy database migrations
- `npm run seed-dev` - Seed development database with test data
- `npx prisma studio` - Open Prisma Studio for database inspection

### Testing

- `npm test` - Run Jest tests
- Tests are configured with ts-jest preset and Next.js integration

### Background Services

- `npm run cron` - Run cron job separately (runs automatically in dev mode)
- Cron job releases reserved inventory every 30 minutes

## Architecture Overview

### Database Schema (PostgreSQL + Prisma)

- **Multi-tenant**: Each store has isolated data via `storeId` foreign keys
- **Core entities**: Store, Product, Category, Order, Customer
- **Product system**: Supports variations, bundles, images, and inventory tracking
- **Order management**: Complete order lifecycle with Stripe integration
- **Shipping**: Integrated with Shippo and ChitChats APIs
- **Exchange rates**: Dynamic currency conversion support

### Authentication & Authorization

- **Clerk**: Handles user authentication and session management
- **Middleware**: All routes protected except API endpoints and webhooks
- **Store isolation**: Users can only access stores they own via `userId` filtering

### Payment Processing

- **Stripe**: Complete payment flow with webhooks
- **Webhook endpoint**: `/api/webhook` for Stripe events
- **Currency support**: Multi-currency with exchange rate conversion

### API Architecture

- **App Router**: All APIs in `app/api/` directory
- **Store-scoped**: Most endpoints under `/api/[storeId]/`
- **RESTful**: Standard HTTP methods with proper status codes
- **Type-safe**: Full TypeScript coverage with Zod validation

### Frontend Structure

- **Route groups**: `(auth)`, `(dashboard)`, `(root)` for layout isolation
- **Dynamic routes**: Store-specific pages under `[storeId]`
- **Component library**: Custom UI components in `components/ui/`
- **State management**: Zustand for global state
- **Styling**: Tailwind CSS with custom theme

### External Integrations

- **Cloudinary**: Image storage and optimization
- **Shippo/ChitChats**: Shipping rate calculation and label generation
- **Exchange rates**: Real-time currency conversion
- **Supabase**: PostgreSQL database hosting

## Key Development Patterns

### Database Queries

- Always filter by `storeId` for data isolation
- Use Prisma's type-safe query builder
- Include relations for complete data fetching
- Handle cascading deletes properly

### API Route Structure

```typescript
// Standard pattern for store-scoped endpoints
export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  // 1. Authenticate user
  // 2. Validate storeId ownership
  // 3. Execute business logic
  // 4. Return typed response
}
```

### Error Handling

- Return proper HTTP status codes
- Use try-catch for database operations
- Validate user permissions for store access
- Handle Stripe webhook verification

### Component Patterns

- Server components for data fetching
- Client components for interactivity
- Separate form components for complex forms
- Reusable table components with Tanstack Table

## Important Environment Variables

- `DATABASE_URL`, `DIRECT_URL` - PostgreSQL connection
- `NEXT_PUBLIC_CLERK_*` - Clerk authentication
- `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET` - Stripe integration
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` - Image uploads
- `ALLOWED_ORIGINS` - CORS configuration for API access

## Testing Strategy

- Unit tests for utility functions and API routes
- Integration tests for database operations
- Mock external services (Stripe, Shippo) in tests
- Test files use `.test.ts` suffix

## Multi-Store Architecture

This system supports multiple stores per user. Always ensure:

- Store ownership validation in API routes
- Proper data isolation using `storeId`
- Store context in frontend components
- Consistent store switcher functionality

## IMPORTANT

- update this file with any architectural changes that are made
