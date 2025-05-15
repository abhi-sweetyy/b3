# BrochureAI

## Environment Setup

### Required Environment Variables
Create a `.env` file in your project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=""              # From Project Settings → API
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"           # From Project Settings → API
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"       # From Project Settings → API


# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."        # From Stripe Dashboard → API Keys
STRIPE_SECRET_KEY="sk_test_..."                         # From Stripe Dashboard → API Keys
STRIPE_WEBHOOK_SECRET="whsec_..."                       # From Stripe → Webhooks (Select These events to monitor customer.subscription.created
customer.subscription.deleted
customer.subscription.updated
price.created
price.updated
product.created
product.updated)

NEXT_PUBLIC_STRIPE_PRO_PRICE_ID="price_..."            # Your Pro Plan Price ID

# OpenRouter Configuration
NEXT_PUBLIC_OPENROUTER_API_KEY="sk-or-v1-..."          # From OpenRouter Dashboard

# Site Configuration
NEXT_PUBLIC_SITE_URL="https://brochureai.vercel.app/"  # Your site URL

# Google Configuration
NEXT_PUBLIC_GOOGLE_API_KEY="your-google-api-key"       # Your Google API Key
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}  # Your Google Service Account JSON
```

### Database Management

#### Backup and Restore
First, install PostgreSQL tools:
```bash
# macOS (using Homebrew)
brew install postgresql@15
brew link --force postgresql@15
```

Then use these commands for backup/restore:
```bash


# Restore to new database
psql "$TARGET_DATABASE_URL" < supabase_backup.sql
```

### Getting Database URLs
To get your Supabase database URL:

1. Open your Supabase project dashboard
2. Click "Connect" in the Top Navbar.
3. Click "Connection String" tab in the opened internal window.
4. Look for "Connection Pooling" and copy the "URI" format
5. Replace `[YOUR-PASSWORD]` in the URL with your database password
6. If your password contains special characters (like @), replace them with their URL-encoded versions (e.g., %40)

Example URL format:
```
postgresql://postgres.[PROJECT_REF]:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres
```



## License
I am transferring my whole rights to Ines after full payment
