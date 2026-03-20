# API Integration Guide - Quick Commerce Price Comparison App

## Overview

This guide provides step-by-step instructions for integrating real APIs from Blinkit, Zepto, and Swiggy Instamart into the QuickCompare application. The current implementation uses a mock aggregator service that can be seamlessly replaced with real API calls.

## Architecture Overview

The application uses a layered architecture that abstracts platform integrations:

```
Frontend (React)
    ↓
tRPC Procedures (Type-Safe API)
    ↓
Aggregator Service (Platform Abstraction)
    ↓
Platform Adapters (Blinkit, Zepto, Swiggy Instamart)
    ↓
Real APIs / Mock Data
```

This design allows you to replace the mock data layer without changing the frontend or tRPC procedures.

## Current Mock Implementation

### File Structure

The mock data system is organized as follows:

**`server/mockData.ts`** - Generates 40+ realistic products with platform-specific pricing variations. Each product includes:
- Standardized product name and description
- Category classification (Dairy, Fruits, Vegetables, etc.)
- Quantity and unit information
- Platform-specific pricing with random discounts (0-8%)
- Stock status (in_stock, low_stock, out_of_stock)
- Delivery time information

**`server/aggregator.ts`** - Provides the abstraction layer that currently uses mock data. Key functions:
- `searchProductsAcrossPlatforms()` - Search across all platforms
- `getProductPricesAcrossPlatforms()` - Get pricing for a specific product
- `initializeMockData()` - Seed database with mock products

**`server/db.ts`** - Database query helpers that interact with the schema

## Step-by-Step Integration Guide

### Phase 1: Set Up Platform API Credentials

#### 1.1 Obtain API Keys

Contact each platform's developer program:

**Blinkit Developer Program**
- Visit: https://developer.blinkit.com
- Register for API access
- Generate API keys and store securely
- Note: Rate limits typically 100-1000 requests/minute

**Zepto Developer Program**
- Visit: https://developer.zepto.com
- Apply for API access
- Receive API credentials
- Note: Rate limits typically 500-5000 requests/minute

**Swiggy Instamart Developer Program**
- Visit: https://developer.swiggystaging.com
- Request API access
- Obtain credentials
- Note: Rate limits typically 100-1000 requests/minute

#### 1.2 Store API Credentials

Use the `webdev_request_secrets` tool to add credentials:

```bash
# Add via management UI or CLI
BLINKIT_API_KEY=your_blinkit_key
BLINKIT_API_URL=https://api.blinkit.com/v1
ZEPTO_API_KEY=your_zepto_key
ZEPTO_API_URL=https://api.zepto.com/v1
SWIGGY_INSTAMART_API_KEY=your_instamart_key
SWIGGY_INSTAMART_API_URL=https://api.swiggystaging.com/v1
```

### Phase 2: Create Platform Adapters

#### 2.1 Create Adapter Directory

```bash
mkdir -p server/adapters
```

#### 2.2 Create Blinkit Adapter

Create `server/adapters/blinkit.ts`:

```typescript
import { ENV } from "../_core/env";

interface BlinkitProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  imageUrl: string;
  category: string;
  quantity: string;
  unit: string;
}

interface BlinkitPricing {
  productId: string;
  price: number;
  discount: number;
  finalPrice: number;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  deliveryTime: number;
}

export async function searchBlinkitProducts(
  query: string,
  category?: string
): Promise<BlinkitProduct[]> {
  try {
    const params = new URLSearchParams({
      q: query,
      limit: "50",
    });

    if (category) {
      params.append("category", category);
    }

    const response = await fetch(
      `${ENV.blinkitApiUrl}/search?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${ENV.blinkitApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Blinkit API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error("[Blinkit] Search error:", error);
    return [];
  }
}

export async function getBlinkitProductPricing(
  productId: string
): Promise<BlinkitPricing | null> {
  try {
    const response = await fetch(
      `${ENV.blinkitApiUrl}/products/${productId}/pricing`,
      {
        headers: {
          Authorization: `Bearer ${ENV.blinkitApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Blinkit API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data || null;
  } catch (error) {
    console.error("[Blinkit] Pricing error:", error);
    return null;
  }
}

export async function getBlinkitProductDetails(
  productId: string
): Promise<BlinkitProduct | null> {
  try {
    const response = await fetch(
      `${ENV.blinkitApiUrl}/products/${productId}`,
      {
        headers: {
          Authorization: `Bearer ${ENV.blinkitApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Blinkit API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("[Blinkit] Details error:", error);
    return null;
  }
}
```

#### 2.3 Create Zepto Adapter

Create `server/adapters/zepto.ts`:

```typescript
import { ENV } from "../_core/env";

interface ZeptoProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  imageUrl: string;
  category: string;
  quantity: string;
  unit: string;
}

interface ZeptoPricing {
  productId: string;
  price: number;
  discount: number;
  finalPrice: number;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  deliveryTime: number;
}

export async function searchZeptoProducts(
  query: string,
  category?: string
): Promise<ZeptoProduct[]> {
  try {
    const params = new URLSearchParams({
      search: query,
      limit: "50",
    });

    if (category) {
      params.append("category", category);
    }

    const response = await fetch(
      `${ENV.zeptoApiUrl}/search?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${ENV.zeptoApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Zepto API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("[Zepto] Search error:", error);
    return [];
  }
}

export async function getZeptoProductPricing(
  productId: string
): Promise<ZeptoPricing | null> {
  try {
    const response = await fetch(
      `${ENV.zeptoApiUrl}/products/${productId}/price`,
      {
        headers: {
          Authorization: `Bearer ${ENV.zeptoApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Zepto API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("[Zepto] Pricing error:", error);
    return null;
  }
}

export async function getZeptoProductDetails(
  productId: string
): Promise<ZeptoProduct | null> {
  try {
    const response = await fetch(
      `${ENV.zeptoApiUrl}/products/${productId}`,
      {
        headers: {
          Authorization: `Bearer ${ENV.zeptoApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Zepto API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("[Zepto] Details error:", error);
    return null;
  }
}
```

#### 2.4 Create Swiggy Instamart Adapter

Create `server/adapters/instamart.ts`:

```typescript
import { ENV } from "../_core/env";

interface InstamartProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  imageUrl: string;
  category: string;
  quantity: string;
  unit: string;
}

interface InstamartPricing {
  productId: string;
  price: number;
  discount: number;
  finalPrice: number;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  deliveryTime: number;
}

export async function searchInstamartProducts(
  query: string,
  category?: string
): Promise<InstamartProduct[]> {
  try {
    const payload = {
      query,
      limit: 50,
      ...(category && { category }),
    };

    const response = await fetch(
      `${ENV.instamartApiUrl}/search`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ENV.instamartApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`Instamart API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("[Instamart] Search error:", error);
    return [];
  }
}

export async function getInstamartProductPricing(
  productId: string
): Promise<InstamartPricing | null> {
  try {
    const response = await fetch(
      `${ENV.instamartApiUrl}/products/${productId}/pricing`,
      {
        headers: {
          Authorization: `Bearer ${ENV.instamartApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Instamart API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("[Instamart] Pricing error:", error);
    return null;
  }
}

export async function getInstamartProductDetails(
  productId: string
): Promise<InstamartProduct | null> {
  try {
    const response = await fetch(
      `${ENV.instamartApiUrl}/products/${productId}`,
      {
        headers: {
          Authorization: `Bearer ${ENV.instamartApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Instamart API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("[Instamart] Details error:", error);
    return null;
  }
}
```

### Phase 3: Update Aggregator Service

#### 3.1 Modify `server/aggregator.ts`

Replace the mock implementation with real API calls:

```typescript
import {
  searchBlinkitProducts,
  getBlinkitProductPricing,
} from "./adapters/blinkit";
import {
  searchZeptoProducts,
  getZeptoProductPricing,
} from "./adapters/zepto";
import {
  searchInstamartProducts,
  getInstamartProductPricing,
} from "./adapters/instamart";
import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { products, productPricing, platforms } from "../drizzle/schema";

export async function searchProductsAcrossPlatforms(
  query: string,
  category?: string
) {
  try {
    // Call real APIs in parallel
    const [blinkitResults, zeptoResults, instamartResults] = await Promise.all([
      searchBlinkitProducts(query, category),
      searchZeptoProducts(query, category),
      searchInstamartProducts(query, category),
    ]);

    // Normalize and merge results
    const allResults = [
      ...blinkitResults.map((p) => ({
        ...p,
        platform: "Blinkit",
        platformId: 1,
      })),
      ...zeptoResults.map((p) => ({
        ...p,
        platform: "Zepto",
        platformId: 2,
      })),
      ...instamartResults.map((p) => ({
        ...p,
        platform: "Swiggy Instamart",
        platformId: 3,
      })),
    ];

    // Deduplicate and normalize product names
    const normalizedProducts = new Map();
    for (const product of allResults) {
      const normalized = normalizeProductName(product.name);
      if (!normalizedProducts.has(normalized)) {
        normalizedProducts.set(normalized, {
          name: product.name,
          category: product.category,
          quantity: product.quantity,
          unit: product.unit,
          imageUrl: product.imageUrl,
          platforms: [],
        });
      }
      normalizedProducts.get(normalized).platforms.push({
        platformId: product.platformId,
        platformName: product.platform,
        originalId: product.id,
      });
    }

    // Save to database for caching
    const db = await getDb();
    if (db) {
      for (const [_, product] of normalizedProducts) {
        // Insert or update product
        const existingProduct = await db
          .select()
          .from(products)
          .where(eq(products.name, product.name))
          .limit(1);

        if (existingProduct.length === 0) {
          await db.insert(products).values({
            name: product.name,
            category: product.category,
            standardQuantity: parseFloat(product.quantity),
            unit: product.unit,
            description: product.name,
            imageUrl: product.imageUrl,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
    }

    return Array.from(normalizedProducts.values());
  } catch (error) {
    console.error("[Aggregator] Search error:", error);
    return [];
  }
}

export async function getProductPricesAcrossPlatforms(productId: number) {
  try {
    const db = await getDb();
    if (!db) return [];

    // Get product details
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (product.length === 0) return [];

    // Get pricing from all platforms
    const [blinkitPricing, zeptoPricing, instamartPricing] = await Promise.all([
      getBlinkitProductPricing(product[0].blinkitId || ""),
      getZeptoProductPricing(product[0].zeptoId || ""),
      getInstamartProductPricing(product[0].instamartId || ""),
    ]);

    const prices = [];

    if (blinkitPricing) {
      prices.push({
        platformId: 1,
        platformName: "Blinkit",
        price: blinkitPricing.price,
        discountPercent: blinkitPricing.discount,
        finalPrice: blinkitPricing.finalPrice,
        deliveryTime: blinkitPricing.deliveryTime,
        stockStatus: blinkitPricing.stockStatus,
      });
    }

    if (zeptoPricing) {
      prices.push({
        platformId: 2,
        platformName: "Zepto",
        price: zeptoPricing.price,
        discountPercent: zeptoPricing.discount,
        finalPrice: zeptoPricing.finalPrice,
        deliveryTime: zeptoPricing.deliveryTime,
        stockStatus: zeptoPricing.stockStatus,
      });
    }

    if (instamartPricing) {
      prices.push({
        platformId: 3,
        platformName: "Swiggy Instamart",
        price: instamartPricing.price,
        discountPercent: instamartPricing.discount,
        finalPrice: instamartPricing.finalPrice,
        deliveryTime: instamartPricing.deliveryTime,
        stockStatus: instamartPricing.stockStatus,
      });
    }

    // Cache pricing in database
    if (db && prices.length > 0) {
      for (const price of prices) {
        await db.insert(productPricing).values({
          productId,
          platformId: price.platformId,
          price: price.price,
          discountPercent: price.discountPercent,
          finalPrice: price.finalPrice,
          deliveryTime: price.deliveryTime,
          stockStatus: price.stockStatus,
          updatedAt: new Date(),
        });
      }
    }

    return prices;
  } catch (error) {
    console.error("[Aggregator] Pricing error:", error);
    return [];
  }
}

function normalizeProductName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/g, "");
}
```

### Phase 4: Add Error Handling and Caching

#### 4.1 Implement Retry Logic

Add to `server/adapters/blinkit.ts`:

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T | null> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delayMs * (i + 1)));
    }
  }
  return null;
}
```

#### 4.2 Implement Rate Limiting

Add to `server/_core/rateLimiter.ts`:

```typescript
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async checkLimit(key: string): Promise<boolean> {
    const now = Date.now();
    const requests = this.requests.get(key) || [];

    // Remove old requests outside the window
    const recentRequests = requests.filter((time) => now - time < this.windowMs);

    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    return true;
  }
}
```

### Phase 5: Update Environment Configuration

#### 5.1 Add to `server/_core/env.ts`

```typescript
export const ENV = {
  // ... existing env vars
  blinkitApiKey: process.env.BLINKIT_API_KEY || "",
  blinkitApiUrl: process.env.BLINKIT_API_URL || "https://api.blinkit.com/v1",
  zeptoApiKey: process.env.ZEPTO_API_KEY || "",
  zeptoApiUrl: process.env.ZEPTO_API_URL || "https://api.zepto.com/v1",
  instamartApiKey: process.env.SWIGGY_INSTAMART_API_KEY || "",
  instamartApiUrl:
    process.env.SWIGGY_INSTAMART_API_URL || "https://api.swiggystaging.com/v1",
};
```

### Phase 6: Testing Real APIs

#### 6.1 Create Integration Tests

Create `server/adapters.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  searchBlinkitProducts,
  getBlinkitProductPricing,
} from "./adapters/blinkit";

describe("Platform Adapters", () => {
  describe("Blinkit Adapter", () => {
    it("should search for products", async () => {
      const results = await searchBlinkitProducts("milk");
      expect(Array.isArray(results)).toBe(true);
    });

    it("should get product pricing", async () => {
      const results = await searchBlinkitProducts("milk");
      if (results.length > 0) {
        const pricing = await getBlinkitProductPricing(results[0].id);
        expect(pricing).toBeDefined();
      }
    });
  });
});
```

#### 6.2 Run Integration Tests

```bash
pnpm test:integration
```

### Phase 7: Gradual Rollout

#### 7.1 Feature Flag Implementation

Add feature flags to control which data source to use:

```typescript
export const USE_REAL_APIS = process.env.USE_REAL_APIS === "true";

export async function searchProductsAcrossPlatforms(
  query: string,
  category?: string
) {
  if (USE_REAL_APIS) {
    return searchProductsAcrossPlatformsReal(query, category);
  } else {
    return searchProductsAcrossPlatformsMock(query, category);
  }
}
```

#### 7.2 Gradual Migration

1. Deploy with feature flag disabled (use mock data)
2. Test real APIs in staging environment
3. Enable for 10% of traffic
4. Monitor for errors and performance
5. Gradually increase to 100%

## Monitoring and Debugging

### API Response Logging

Add logging to adapters:

```typescript
console.log(`[Blinkit] Search request: ${query}`);
console.log(`[Blinkit] Response status: ${response.status}`);
console.log(`[Blinkit] Response time: ${Date.now() - startTime}ms`);
```

### Error Tracking

Use error tracking service (Sentry, LogRocket, etc.):

```typescript
import * as Sentry from "@sentry/node";

try {
  // API call
} catch (error) {
  Sentry.captureException(error);
}
```

### Performance Monitoring

Track API response times:

```typescript
const startTime = Date.now();
const response = await fetch(url);
const duration = Date.now() - startTime;
console.log(`API call took ${duration}ms`);
```

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| API Key Invalid | Verify credentials in environment variables |
| Rate Limit Exceeded | Implement exponential backoff retry logic |
| Network Timeout | Increase timeout duration or implement circuit breaker |
| Inconsistent Data | Normalize product names and categories |
| Missing Products | Check API documentation for search parameters |

### Debugging Steps

1. Check API credentials are set correctly
2. Test API endpoints directly with curl or Postman
3. Review server logs for error messages
4. Verify network connectivity
5. Check API rate limits and quotas
6. Test with mock data to isolate issues

## Next Steps

After successfully integrating real APIs:

1. **Implement Caching** - Cache product data for 24 hours to reduce API calls
2. **Add Analytics** - Track which products are searched most frequently
3. **Optimize Queries** - Use pagination and filtering to reduce data transfer
4. **Add Webhooks** - Receive real-time price updates from platforms
5. **Implement Sync** - Periodically sync product catalog with platforms

## Support

For API-specific questions, refer to:
- Blinkit API Docs: https://developer.blinkit.com/docs
- Zepto API Docs: https://developer.zepto.com/docs
- Swiggy Instamart Docs: https://developer.swiggystaging.com/docs
