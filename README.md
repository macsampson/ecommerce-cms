# 🛒 E-Commerce CMS

A full-stack multi-store e-commerce content management system built with Next.js 13, TypeScript, and PostgreSQL.

## ✨ Features

- **Multi-Store Management**: Create and manage multiple stores from a single dashboard
- **Product Management**: Full product catalog with variations, bundles, and inventory tracking
- **Order Processing**: Complete order lifecycle with Stripe payment integration
- **Shipping Integration**: Integrated with Shippo and ChitChats APIs
- **Multi-Currency Support**: Dynamic exchange rate conversion
- **Authentication**: Secure user management with Clerk
- **Dashboard**: Comprehensive admin interface for store management

## 🛠️ Tech Stack

- **Frontend**: Next.js 13 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Clerk
- **Payments**: Stripe
- **Image Storage**: Cloudinary
- **Shipping**: Shippo & ChitChats APIs

## 📋 Prerequisites

- Node.js 18+ and bun
- PostgreSQL database
- Supabase CLI
- Stripe CLI (for webhook testing)

## 🔧 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL=""
DIRECT_URL=""

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""

# Payments (Stripe)
STRIPE_API_KEY=""
STRIPE_WEBHOOK_SECRET=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""

# Image Storage (Cloudinary)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""

# API Configuration
ALLOWED_ORIGINS=""
```

## 🚀 Getting Started

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd cms
   bun install
   ```

2. **Database Setup**
   ```bash
   # Start Supabase (includes PostgreSQL)
   supabase start
   
   # Deploy database migrations
   npx prisma migrate deploy
   
   # Seed development data
   bun run seed-dev
   ```

3. **Development Server**
   ```bash
   # Start development server
   bun run dev
   
   # Or start full-stack environment (includes frontend, cron jobs, webhooks)
   bun run dev:fullstack
   ```

4. **Access the Application**
   - CMS Dashboard: `http://localhost:3000`
   - Database Studio: Supabase Dashboard or `npx prisma studio`

## 📜 Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint
- `bun run cron` - Run background inventory management
- `bun run seed-dev` - Seed development database
- `bun test` - Run tests

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   └── api/               # API routes
├── components/            # Reusable components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and configurations
├── prisma/               # Database schema and migrations
└── public/               # Static assets
```

## 🤝 Contributing

1. Follow the existing code patterns and TypeScript conventions
2. Ensure all API routes include proper authentication and store ownership validation
3. Run `bun run lint` before committing
4. Update `CLAUDE.md` with any architectural changes

## 🏗️ Architecture Notes

This is a multi-tenant system where each store is isolated by `storeId`. All database queries must filter by store ownership to ensure data security. The system uses server components for data fetching and client components for interactivity.
