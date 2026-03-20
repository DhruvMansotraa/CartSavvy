# Quick Commerce Price Comparison App - Setup Guide

## Overview

QuickCompare is a production-ready MVP for comparing grocery and product prices across Indian quick commerce platforms (Blinkit, Zepto, Swiggy Instamart). The app features a React frontend with Memphis-inspired design, Node.js backend with tRPC, and a mock aggregator service that can be easily replaced with real APIs.

## Architecture

### Technology Stack

- **Frontend:** React 19, Tailwind CSS 4, shadcn/ui, Lucide React
- **Backend:** Node.js, Express, tRPC 11
- **Database:** MySQL/TiDB with Drizzle ORM
- **Authentication:** Manus OAuth
- **Styling:** Memphis design system with OKLCH colors

### Project Structure

```
quick-commerce-compare/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   │   ├── Home.tsx      # Search & discovery
│   │   │   ├── ProductDetail.tsx  # Product comparison
│   │   │   ├── Cart.tsx      # Cart management
│   │   │   └── Saved.tsx     # Saved products
│   │   ├── components/       # Reusable UI components
│   │   ├── lib/trpc.ts       # tRPC client setup
│   │   ├── App.tsx           # Router & layout
│   │   └── index.css         # Memphis design tokens
│   └── public/               # Static assets
├── server/                    # Node.js backend
│   ├── routers.ts            # tRPC procedure definitions
│   ├── db.ts                 # Database query helpers
│   ├── aggregator.ts         # Platform aggregation layer
│   ├── mockData.ts           # Mock data generator
│   ├── init.ts               # Initialization script
│   └── _core/                # Framework internals
├── drizzle/                   # Database schema & migrations
│   ├── schema.ts             # Table definitions
│   └── migrations/           # SQL migration files
├── shared/                    # Shared types & constants
├── storage/                   # S3 storage helpers
└── package.json              # Dependencies
```

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 10+
- MySQL/TiDB database
- Manus account (for OAuth)

### Installation

1. **Install Dependencies**
   ```bash
   cd /home/ubuntu/quick-commerce-compare
   pnpm install
   ```

2. **Database Setup**
   The database schema is already created. Verify tables exist:
   ```bash
   # Tables created:
   - users
   - products
   - platforms
   - product_pricing
   - carts
   - cart_items
   - saved_products
   - price_history
   - price_drop_notifications
   - user_preferences
   ```

3. **Environment Variables**
   All required environment variables are automatically injected:
   - `DATABASE_URL` - Database connection
   - `JWT_SECRET` - Session signing
   - `VITE_APP_ID` - OAuth app ID
   - `OAUTH_SERVER_URL` - OAuth endpoint
   - And more (see `.env` in template)

4. **Start Development Server**
   ```bash
   pnpm dev
   ```
   Server runs on `http://localhost:3000`

5. **Initialize Mock Data**
   Mock data is automatically seeded on first run. To manually trigger:
   - Sign in as admin user
   - Call the `admin.initializeMockData` endpoint via the API

## Features

### Core Features Implemented

#### 1. Product Search & Discovery
- Full-text search across product catalog
- Category filtering
- Trending products
- Best deals with discounts
- Product suggestions

#### 2. Price Comparison
- Cross-platform price comparison for any product
- Real-time pricing from mock aggregator
- Discount tracking
- Stock status indicators
- Delivery time information

#### 3. Smart Cart
- Add/remove items
- Quantity management
- Cart persistence per user
- Platform-by-platform total calculation
- Savings calculation

#### 4. Saved Products
- Save products for later
- Price drop notifications (structure in place)
- Watchlist management
- Preferred platform tracking

#### 5. User Preferences
- Budget preference (low/medium/high)
- Preferred categories
- Preferred platforms
- Notification settings

### Smart Features (Structure Ready)

#### Recommendations Engine
- Category-based recommendations
- Best deals finder
- Trending products
- Alternative product suggestions

#### Price Drop Notifications
- Database structure ready
- Notification history tracking
- Read/unread status
- Savings amount calculation

#### Savings Calculator
- Per-item savings display
- Total cart savings
- Platform comparison with savings
- Savings percentage display

## API Documentation

### tRPC Endpoints

All endpoints are type-safe with automatic validation.

#### Products

**Search Products**
```typescript
trpc.products.search.useQuery({
  query: string,           // Search term
  category?: string,       // Optional category filter
  limit?: number          // Default: 20
})
```

**Get Product Details**
```typescript
trpc.products.getDetails.useQuery({
  productId: number
})
// Returns: Product with prices across all platforms
```

**Get Categories**
```typescript
trpc.products.getCategories.useQuery()
// Returns: Array of category names
```

**Get Trending Products**
```typescript
trpc.products.getTrending.useQuery({
  limit?: number  // Default: 10
})
```

**Get Best Deals**
```typescript
trpc.products.getBestDeals.useQuery({
  limit?: number  // Default: 10
})
```

#### Cart Management

**Get User Cart**
```typescript
trpc.cart.getCart.useQuery()
// Returns: Cart with enriched items and pricing
```

**Add Item to Cart**
```typescript
trpc.cart.addItem.useMutation({
  productId: number,
  quantity: number
})
```

**Update Item Quantity**
```typescript
trpc.cart.updateQuantity.useMutation({
  cartItemId: number,
  quantity: number
})
```

**Remove Item from Cart**
```typescript
trpc.cart.removeItem.useMutation({
  cartItemId: number
})
```

**Clear Cart**
```typescript
trpc.cart.clear.useMutation()
```

#### Cart Comparison

**Compare Cart Across Platforms**
```typescript
trpc.comparison.compareCart.useQuery()
// Returns: Array of platforms with total prices and savings
```

#### Saved Products

**Get Saved Products**
```typescript
trpc.saved.getList.useQuery()
```

**Save Product**
```typescript
trpc.saved.save.useMutation({
  productId: number,
  preferredPlatformId?: number
})
```

**Remove Saved Product**
```typescript
trpc.saved.remove.useMutation({
  productId: number
})
```

#### Recommendations

**Get Category Recommendations**
```typescript
trpc.recommendations.getForCategory.useQuery({
  category: string,
  limit?: number  // Default: 5
})
```

#### User Preferences

**Get Preferences**
```typescript
trpc.preferences.get.useQuery()
```

**Update Preferences**
```typescript
trpc.preferences.update.useMutation({
  preferredCategories?: string[],
  preferredPlatforms?: string[],
  budgetPreference?: 'low' | 'medium' | 'high',
  showRecommendations?: boolean,
  enablePriceAlerts?: boolean
})
```

#### Notifications

**Get Notifications**
```typescript
trpc.notifications.getList.useQuery({
  limit?: number  // Default: 50
})
```

**Mark as Read**
```typescript
trpc.notifications.markAsRead.useMutation({
  notificationId: number
})
```

## Mock Data Structure

### Products (40+ items)

Categories:
- Dairy (milk, butter, cheese, yogurt)
- Fruits (banana, apple, orange)
- Vegetables (tomato, onion, potato, carrot)
- Grains (rice, flour, oats)
- Oils & Spices
- Bakery (bread, biscuits)
- Beverages (tea, coffee, juice)
- Snacks
- Eggs
- Meat

### Pricing Strategy

Each product has platform-specific pricing:

- **Blinkit:** 2% cheaper (aggressive pricing)
- **Zepto:** Market rate (baseline)
- **Swiggy Instamart:** 2% more expensive

Prices include:
- Base price (in paise, 1 rupee = 100 paise)
- Random discount (0-8%)
- Stock status (in_stock, low_stock, out_of_stock)
- Platform-specific product IDs

### Delivery Information

- **Blinkit:** 10 min delivery, free
- **Zepto:** 12 min delivery, free
- **Swiggy Instamart:** 15 min delivery, free

## Replacing Mock Data with Real APIs

### Step 1: Create API Adapter

Create `server/adapters/` directory with platform-specific adapters:

```typescript
// server/adapters/blinkit.ts
export async function searchBlinkitProducts(query: string) {
  const response = await fetch('https://api.blinkit.com/search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${BLINKIT_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });
  return response.json();
}

export async function getBlinkitPricing(productId: string) {
  // Fetch real pricing from Blinkit
}
```

### Step 2: Update Aggregator

Modify `server/aggregator.ts` to use real APIs:

```typescript
export async function searchProductsAcrossPlatforms(
  query: string,
  category?: string
) {
  // Replace mock search with real API calls
  const blinkitResults = await searchBlinkitProducts(query);
  const zeptoResults = await searchZeptoProducts(query);
  const instamart Results = await searchInstamartProducts(query);
  
  // Normalize and merge results
  return normalizeResults([...blinkitResults, ...zeptoResults, ...instamartResults]);
}
```

### Step 3: Update Pricing Service

Replace `generatePlatformPrices()` with real API calls:

```typescript
export async function getProductPricesAcrossPlatforms(productId: number) {
  const product = await getProductById(productId);
  
  const prices = await Promise.all([
    getBlinkitPricing(product.blinkitId),
    getZeptoPricing(product.zeptoId),
    getInstamartPricing(product.instamartId)
  ]);
  
  return prices;
}
```

### Step 4: Add API Keys

Add platform API keys via `webdev_request_secrets`:
- `BLINKIT_API_KEY`
- `ZEPTO_API_KEY`
- `SWIGGY_INSTAMART_API_KEY`

### Step 5: Update Database

Store platform-specific product IDs:
- `productPricing.platformProductId` - Already in schema
- Add platform-specific metadata as needed

## Testing

### Run Tests

```bash
pnpm test
```

### Test Coverage

- Product search and filtering
- Cart operations (add, remove, update)
- Price comparison logic
- Saved products management
- User preferences
- Admin initialization

### Manual Testing

1. **Search Flow**
   - Go to home page
   - Search for "milk"
   - Verify results appear
   - Click on product to see comparison

2. **Cart Flow**
   - Add items to cart
   - Verify quantities update
   - Check platform comparison
   - Verify savings calculation

3. **Saved Products**
   - Save a product
   - Go to saved page
   - Verify product appears
   - Remove product

## Performance Optimization

### Current Optimizations

- Database indexes on frequently queried columns
- Lazy loading of product images
- Memoized search results
- Efficient cart comparison algorithm

### Future Optimizations

- Redis caching for product catalog
- CDN for product images
- Pagination for large result sets
- GraphQL for flexible queries
- Real-time price updates with WebSockets

## Deployment

### Prerequisites for Production

1. **Environment Variables**
   - All required env vars configured
   - API keys secured in secrets manager
   - Database connection string validated

2. **Database**
   - Schema migrated
   - Indexes created
   - Backups configured

3. **Security**
   - HTTPS enabled
   - CORS configured
   - Rate limiting enabled
   - Input validation active

### Deploy Command

```bash
pnpm build
pnpm start
```

## Troubleshooting

### Mock Data Not Showing

1. Check if admin user is logged in
2. Call `admin.initializeMockData` endpoint
3. Verify database tables are created
4. Check server logs for errors

### Product Search Not Working

1. Verify products exist in database
2. Check search query syntax
3. Verify category names match
4. Check database connection

### Cart Not Updating

1. Verify user is authenticated
2. Check cart exists for user
3. Verify product exists
4. Check database for cart items

### Price Comparison Empty

1. Verify cart has items
2. Check product pricing exists for all platforms
3. Verify platforms are active in database
4. Check aggregator service logs

## Next Steps

1. **Real API Integration**
   - Implement platform adapters
   - Add API authentication
   - Handle rate limiting

2. **Enhanced Features**
   - Real-time price tracking
   - User notifications
   - Order history
   - Wishlist sharing

3. **Analytics**
   - Track search patterns
   - Monitor price trends
   - User behavior analytics
   - Platform performance metrics

4. **Scaling**
   - Database optimization
   - Caching layer
   - Load balancing
   - CDN integration

## Support

For issues or questions:
1. Check logs in `.manus-logs/`
2. Review error messages in browser console
3. Check database connection
4. Verify all environment variables are set

## License

MIT
