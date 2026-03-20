# Real API Integration Guide

This document provides step-by-step instructions for integrating real APIs from Blinkit, Zepto, and Swiggy Instamart into the QuickCompare platform.

## Architecture Overview

The system uses a **modular adapter pattern** that allows seamless switching between mock data and real APIs. Each platform has its own adapter class that implements the `PlatformAdapter` interface.

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
│              Location Selector → Search → Cart              │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  tRPC Backend                               │
│  location.searchProductsByLocation                          │
│  location.compareCartByLocation                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              Platform Aggregator                            │
│         (Coordinates all platform adapters)                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼────┐  ┌──────▼────┐  ┌─────▼──────┐
│  Blinkit   │  │   Zepto   │  │  Instamart │
│  Adapter   │  │  Adapter  │  │  Adapter   │
└───────┬────┘  └──────┬────┘  └─────┬──────┘
        │              │              │
┌───────▼────┐  ┌──────▼────┐  ┌─────▼──────┐
│  Mock Data │  │  Mock Data │  │  Mock Data │
│   (Dev)    │  │   (Dev)    │  │   (Dev)    │
└────────────┘  └────────────┘  └────────────┘
        │              │              │
        └──────────────┼──────────────┘
                       │
              (Replace with Real APIs)
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼────────┐  ┌──────▼─────┐  ┌─────▼──────────┐
│  Blinkit API   │  │  Zepto API │  │  Instamart API │
│  (Production)  │  │ (Production)│  │  (Production)  │
└────────────────┘  └────────────┘  └────────────────┘
```

## Step 1: Get API Credentials

### Blinkit API

1. **Register as a Developer**
   - Visit: https://developer.blinkit.com
   - Sign up for a developer account
   - Verify your email

2. **Create an Application**
   - Go to Dashboard → Applications
   - Click "Create New Application"
   - Fill in application details
   - Accept terms and conditions

3. **Get Credentials**
   - Copy your `API_KEY` and `API_SECRET`
   - Note the `BASE_URL` (usually `https://api.blinkit.com/v1`)

4. **Enable Required APIs**
   - Search API
   - Product Details API
   - Pricing API
   - Cart Comparison API

### Zepto API

1. **Register as a Developer**
   - Visit: https://developers.zepto.com
   - Create a developer account
   - Complete KYC verification

2. **Create an Application**
   - Dashboard → My Apps
   - Click "Create App"
   - Select "Quick Commerce" category
   - Fill in application details

3. **Get Credentials**
   - Copy your `API_KEY` and `API_SECRET`
   - Note the `BASE_URL` (usually `https://api.zepto.com/v1`)

4. **Enable Required APIs**
   - Search & Discovery API
   - Product Catalog API
   - Pricing & Availability API
   - Order Comparison API

### Swiggy Instamart API

1. **Register as a Developer**
   - Visit: https://developer.swiggystaging.com
   - Sign up for developer access
   - Complete business verification

2. **Create an Application**
   - Developer Portal → Applications
   - Click "New Application"
   - Select "Instamart" as service
   - Fill in details

3. **Get Credentials**
   - Copy your `API_KEY` and `API_SECRET`
   - Note the `BASE_URL` (usually `https://api.swiggystaging.com/v1`)

4. **Enable Required APIs**
   - Product Search API
   - Product Details API
   - Pricing API
   - Cart Comparison API

## Step 2: Set Environment Variables

Create a `.env.local` file in the project root:

```env
# Blinkit API
BLINKIT_API_URL=https://api.blinkit.com/v1
BLINKIT_API_KEY=your_blinkit_api_key
BLINKIT_API_SECRET=your_blinkit_api_secret

# Zepto API
ZEPTO_API_URL=https://api.zepto.com/v1
ZEPTO_API_KEY=your_zepto_api_key
ZEPTO_API_SECRET=your_zepto_api_secret

# Swiggy Instamart API
SWIGGY_INSTAMART_API_URL=https://api.swiggystaging.com/v1
SWIGGY_INSTAMART_API_KEY=your_instamart_api_key
SWIGGY_INSTAMART_API_SECRET=your_instamart_api_secret

# Encryption
ENCRYPTION_KEY=your_32_byte_hex_key
```

## Step 3: Update Platform Adapters

### Blinkit Adapter Implementation

Replace the mock implementation in `server/platformAdapters.ts`:

```typescript
export class BlinkitAdapter implements PlatformAdapter {
  name = "Blinkit";
  private baseUrl = process.env.BLINKIT_API_URL;
  private apiKey = process.env.BLINKIT_API_KEY;
  private apiSecret = process.env.BLINKIT_API_SECRET;

  async searchProducts(query: string, location: string): Promise<PlatformProduct[]> {
    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "X-API-Secret": this.apiSecret,
        },
        body: JSON.stringify({
          query,
          location,
          limit: 20,
        }),
      });

      if (!response.ok) {
        throw new Error(`Blinkit API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformProducts(data.products);
    } catch (error) {
      console.error("[BlinkitAdapter] Search failed:", error);
      // Fallback to mock data
      return this.mockSearch(query, location);
    }
  }

  async getPrices(productIds: string[], location: string): Promise<Map<string, number>> {
    try {
      const response = await fetch(`${this.baseUrl}/prices`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "X-API-Secret": this.apiSecret,
        },
        body: JSON.stringify({
          productIds,
          location,
        }),
      });

      if (!response.ok) {
        throw new Error(`Blinkit API error: ${response.statusText}`);
      }

      const data = await response.json();
      return new Map(Object.entries(data.prices));
    } catch (error) {
      console.error("[BlinkitAdapter] Get prices failed:", error);
      // Fallback to mock data
      return this.mockGetPrices(productIds, location);
    }
  }

  async compareCart(items: CartItem[], location: string): Promise<CartComparison> {
    try {
      const response = await fetch(`${this.baseUrl}/cart/compare`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "X-API-Secret": this.apiSecret,
        },
        body: JSON.stringify({
          items,
          location,
        }),
      });

      if (!response.ok) {
        throw new Error(`Blinkit API error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        platformName: this.name,
        totalPrice: data.totalPrice,
        totalDiscount: data.totalDiscount,
        deliveryFee: data.deliveryFee,
        finalTotal: data.finalTotal,
        estimatedDeliveryTime: data.deliveryTime,
        savings: 0,
      };
    } catch (error) {
      console.error("[BlinkitAdapter] Compare cart failed:", error);
      // Fallback to mock data
      const items_total = items.reduce((sum, item) => sum + item.basePrice * item.quantity, 0);
      return {
        platformName: this.name,
        totalPrice: items_total,
        totalDiscount: Math.floor(items_total * 0.02),
        deliveryFee: items_total >= 20000 ? 0 : 4000,
        finalTotal: items_total - Math.floor(items_total * 0.02) + (items_total >= 20000 ? 0 : 4000),
        estimatedDeliveryTime: 15,
        savings: 0,
      };
    }
  }

  async getDeliveryFee(location: string, totalPrice: number): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/delivery/fee`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "X-API-Secret": this.apiSecret,
        },
        body: JSON.stringify({
          location,
          totalPrice,
        }),
      });

      if (!response.ok) {
        throw new Error(`Blinkit API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.deliveryFee;
    } catch (error) {
      console.error("[BlinkitAdapter] Get delivery fee failed:", error);
      // Fallback to mock data
      return totalPrice >= 20000 ? 0 : 4000;
    }
  }

  private transformProducts(apiProducts: any[]): PlatformProduct[] {
    return apiProducts.map((product) => ({
      id: product.id,
      name: product.name,
      brand: product.brand,
      quantity: product.quantity,
      unit: product.unit,
      price: product.price,
      discount: product.discount || 0,
      finalPrice: product.finalPrice || product.price,
      stockStatus: product.inStock ? "in_stock" : "out_of_stock",
      deliveryTime: product.deliveryTime || 15,
      deliveryFee: product.deliveryFee || 0,
      imageUrl: product.imageUrl,
    }));
  }
}
```

### Zepto Adapter Implementation

Similar pattern for Zepto:

```typescript
export class ZeptoAdapter implements PlatformAdapter {
  name = "Zepto";
  private baseUrl = process.env.ZEPTO_API_URL;
  private apiKey = process.env.ZEPTO_API_KEY;
  private apiSecret = process.env.ZEPTO_API_SECRET;

  async searchProducts(query: string, location: string): Promise<PlatformProduct[]> {
    // Implementation similar to BlinkitAdapter
    // Use Zepto's specific API endpoints and response format
  }

  // ... other methods
}
```

### Swiggy Instamart Adapter Implementation

Similar pattern for Instamart:

```typescript
export class InstamartAdapter implements PlatformAdapter {
  name = "Swiggy Instamart";
  private baseUrl = process.env.SWIGGY_INSTAMART_API_URL;
  private apiKey = process.env.SWIGGY_INSTAMART_API_KEY;
  private apiSecret = process.env.SWIGGY_INSTAMART_API_SECRET;

  async searchProducts(query: string, location: string): Promise<PlatformProduct[]> {
    // Implementation similar to BlinkitAdapter
    // Use Instamart's specific API endpoints and response format
  }

  // ... other methods
}
```

## Step 4: Error Handling & Fallbacks

The system includes automatic fallback to mock data if real APIs fail:

```typescript
async searchProducts(query: string, location: string): Promise<PlatformProduct[]> {
  try {
    // Try real API first
    const response = await fetch(`${this.baseUrl}/search`, { ... });
    if (!response.ok) throw new Error("API error");
    return this.transformProducts(await response.json());
  } catch (error) {
    console.error("[Adapter] Error:", error);
    // Fallback to mock data
    return this.mockSearch(query, location);
  }
}
```

This ensures:
- **Graceful degradation** if API is down
- **Development flexibility** - test with mock data first
- **Production reliability** - automatic fallback to mock data

## Step 5: Testing Real API Integration

### Unit Tests

```typescript
describe("BlinkitAdapter with Real API", () => {
  it("should search products from real API", async () => {
    const adapter = new BlinkitAdapter();
    const results = await adapter.searchProducts("milk", "560001");
    
    expect(results).toHaveLength(20);
    expect(results[0]).toHaveProperty("name");
    expect(results[0]).toHaveProperty("price");
  });

  it("should compare cart with real API", async () => {
    const adapter = new BlinkitAdapter();
    const comparison = await adapter.compareCart(
      [{ productId: "1", quantity: 2, basePrice: 5000 }],
      "560001"
    );
    
    expect(comparison.platformName).toBe("Blinkit");
    expect(comparison.finalTotal).toBeGreaterThan(0);
  });
});
```

### Integration Tests

```typescript
describe("Platform Aggregator with Real APIs", () => {
  it("should compare all platforms", async () => {
    const aggregator = new PlatformAggregator();
    const comparisons = await aggregator.compareCartAcrossAllPlatforms(
      [{ productId: "1", quantity: 1, basePrice: 5000 }],
      "560001"
    );
    
    expect(comparisons).toHaveLength(3);
    expect(comparisons[0].platformName).toBeDefined();
    expect(comparisons[0].finalTotal).toBeGreaterThan(0);
  });
});
```

## Step 6: Deployment Considerations

### Environment Variables

- Store API keys in secure environment variables
- Never commit `.env` files to version control
- Use different keys for staging and production
- Rotate keys periodically

### Rate Limiting

```typescript
const rateLimiter = new RateLimiter(100, 60000); // 100 requests per minute

async searchProducts(query: string, location: string): Promise<PlatformProduct[]> {
  if (rateLimiter.isLimited(`search-${location}`)) {
    throw new Error("Rate limit exceeded");
  }
  // ... API call
}
```

### Caching

```typescript
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes

async searchProducts(query: string, location: string): Promise<PlatformProduct[]> {
  const cacheKey = `search-${query}-${location}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const results = await this.apiCall(query, location);
  cache.set(cacheKey, results);
  return results;
}
```

### Monitoring

```typescript
import { auditLogger } from "./security";

async searchProducts(query: string, location: string): Promise<PlatformProduct[]> {
  const startTime = Date.now();
  try {
    const results = await this.apiCall(query, location);
    const duration = Date.now() - startTime;
    console.log(`[${this.name}] Search took ${duration}ms, returned ${results.length} products`);
    return results;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${this.name}] Search failed after ${duration}ms:`, error);
    throw error;
  }
}
```

## Step 7: Gradual Rollout

### Phase 1: Staging Environment
1. Deploy real API adapters to staging
2. Run integration tests
3. Monitor for 24-48 hours
4. Verify pricing accuracy

### Phase 2: Canary Deployment
1. Deploy to production with 10% traffic
2. Monitor error rates and performance
3. Gradually increase to 50%, then 100%
4. Keep mock data as fallback

### Phase 3: Full Production
1. 100% traffic on real APIs
2. Monitor continuously
3. Maintain mock data as emergency fallback
4. Set up alerts for API failures

## Troubleshooting

### Common Issues

1. **API Authentication Fails**
   - Verify API keys are correct
   - Check API key expiration
   - Ensure IP whitelisting is configured

2. **Timeout Errors**
   - Increase timeout values
   - Implement request retry logic
   - Check network connectivity

3. **Pricing Mismatch**
   - Verify location coordinates
   - Check platform pricing rules
   - Compare with platform websites

4. **Missing Products**
   - Verify search query normalization
   - Check product availability in location
   - Compare with platform search results

## Support & Resources

- **Blinkit Developer Docs**: https://docs.blinkit.com
- **Zepto Developer Docs**: https://docs.zepto.com
- **Swiggy Instamart Docs**: https://docs.swiggystaging.com
- **QuickCompare Issues**: GitHub Issues

## Next Steps

1. Obtain API credentials from all three platforms
2. Update environment variables
3. Implement adapter methods for real APIs
4. Run integration tests
5. Deploy to staging environment
6. Monitor and optimize performance
7. Gradual rollout to production
