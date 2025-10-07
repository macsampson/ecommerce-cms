# 🛒 Self-Hosted E-Commerce CMS

A complete, self-hosted e-commerce platform that provides an alternative to Etsy and Shopify. Built for individuals and small businesses who want full control over their online store without monthly fees or transaction limits.

![CMS Dashboard](https://github.com/macsampson/ecommerce-cms/blob/main/images/1.png)

## Why This Project?

**I was tired of paying monthly fees and high transaction fees to Etsy or Shopify, so I built this app**

This project gives you:

- **Complete ownership** of your store and customer data
- **Zero monthly fees** - host it yourself or deploy for free on Vercel
- **No transaction limits** - keep 100% of your profits (minus payment processing)
- **Full customization** - modify anything to fit your brand
- **Professional features** - automated inventory management, order tracking, shipping integration
- **Multi-store capability** - run multiple brands from one installation

## Features

### **Store Management**

- Multiple stores from single dashboard
- SEO-optimized product pages
- Mobile-responsive design

### **Product Management**

- Unlimited products and variations
- Image galleries with Cloudinary integration
- Product bundles and categories
- Sales and promotions with percentage-based discounts
- Store-wide or product-specific sales

### **Payments & Orders**

- Stripe integration for secure payments
- Complete order lifecycle management
- Customer management system
- Automated inventory updates

### **Shipping & Fulfillment**

- Integrated shipping rate calculator (Shippo & ChitChats)
- Automatic shipping label generation
- Multi-currency support with live exchange rates
- Order tracking and notifications

### **Analytics & Insights**

- Revenue and sales display
- Customer insights

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL (Supabase recommended)
- **Authentication**: Iron Session (secure, cookie-based)
- **Payments**: Stripe
- **Hosting**: Deploy anywhere (Vercel, Railway, self-hosted)
- **Images**: Cloudinary
- **Shipping**: Shippo & ChitChats APIs

## Quick Start

### Option 1: Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/ecommerce-cms)

1. Click "Deploy with Vercel" and connect your GitHub
2. Set up a Supabase database (free tier available)
3. Configure environment variables in Vercel
4. Your CMS will be live in minutes!

### Option 2: Local Development

```bash
# Clone the repository
git clone https://github.com/your-username/ecommerce-cms
cd ecommerce-cms

# Install dependencies
npm install

# Set up database
supabase start
npx prisma migrate deploy

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Generate admin password
node scripts/generate-password-hash.js

# Start development server
npm run dev
```

Visit `http://localhost:3000/login` to access your admin dashboard.

## Environment Configuration

Create a `.env.local` file with these required variables:

```env
# Database (Supabase)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Admin Authentication
ADMIN_EMAIL="your-email@example.com"
ADMIN_PASSWORD_HASH="$2b$12$..." # Generate with scripts/generate-password-hash.js
SESSION_SECRET="your-32-character-secret-key-here"

# Stripe Payments
STRIPE_API_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."

# Image Storage (Cloudinary)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"

# API Configuration
ALLOWED_ORIGINS="https://yourdomain.com,https://yourstore.com"
```

## Setup Guide

### 1. Database Setup

**Option A: Supabase (Recommended)**

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Copy database URLs to environment variables
4. Run migrations: `npx prisma migrate deploy`

**Option B: Self-hosted PostgreSQL**

1. Install PostgreSQL locally or on your server
2. Create database and user
3. Update DATABASE_URL in environment variables
4. Run migrations: `npx prisma migrate deploy`

### 2. Authentication Setup

Generate your admin password hash:

```bash
node scripts/generate-password-hash.js
# Enter your desired password when prompted
# Copy the generated hash to ADMIN_PASSWORD_HASH in .env.local
```

### 3. Payment Setup

1. Create [Stripe](https://stripe.com) account
2. Get API keys from Stripe dashboard
3. Set up webhook endpoint: `https://yourdomain.com/api/webhook`
4. Add webhook events: `payment_intent.succeeded`, `checkout.session.completed`

### 4. Image Storage Setup

1. Create [Cloudinary](https://cloudinary.com) account (free tier available)
2. Get cloud name from dashboard
3. Add to NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

## Production Checklist

Before going live:

- [ ] Set up production database (Supabase/PostgreSQL)
- [ ] Configure secure SESSION_SECRET (32+ characters)
- [ ] Set up Stripe webhook endpoint
- [ ] Configure Cloudinary for image storage
- [ ] Set ALLOWED_ORIGINS for your domain(s)
- [ ] Test payment flow end-to-end
- [ ] Set up SSL certificate
- [ ] Configure backup strategy

## Security Features

- Session-based authentication with encrypted cookies
- CSRF protection on all forms
- SQL injection protection via Prisma ORM
- Environment-based configuration
- Secure password hashing with bcrypt
- Rate limiting on sensitive endpoints

## License

MIT License

---
