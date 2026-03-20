/**
 * Aggregator Service
 * Abstracts platform integrations and provides unified interface for pricing data
 * This layer allows easy replacement of mock data with real APIs
 */

import {
  searchProducts,
  getProductById,
  getPlatforms,
  getProductPricing,
  getProductPricingByPlatforms,
  getDb,
} from "./db";
import {
  MOCK_PRODUCTS,
  generatePlatformPrices,
  getBasePrice,
  PLATFORM_METADATA,
  getProductImageUrl,
} from "./mockData";
import { products, platforms, productPricing } from "../drizzle/schema";

export interface ProductResult {
  id: number;
  name: string;
  category: string;
  description: string;
  standardQuantity: number;
  unit: string;
  imageUrl: string;
  keywords: string[];
}

export interface PlatformPriceResult {
  platformId: number;
  platformName: string;
  price: number; // in paise
  discountPercent: number;
  finalPrice: number; // price after discount
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  deliveryTime: number; // in minutes
  deliveryFee: number; // in paise
}

export interface CartComparisonResult {
  platformId: number;
  platformName: string;
  totalPrice: number; // in paise
  deliveryFee: number; // in paise
  totalWithDelivery: number; // in paise
  items: CartItemPricing[];
  savings?: number; // compared to most expensive
}

export interface CartItemPricing {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number; // in paise
  totalPrice: number; // in paise
  discountPercent: number;
}

export interface RecommendationResult {
  productId: number;
  productName: string;
  category: string;
  reason: string;
  cheapestPrice: number; // in paise
  platform: string;
}

/**
 * Initialize mock data in database
 * This runs once to seed the database with products and pricing
 */
export async function initializeMockData(): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Aggregator] Database not available for initialization");
    return;
  }

  try {
    // Check if data already exists
    const existingProducts = await searchProducts("", undefined, 1);
    if (existingProducts.length > 0) {
      console.log("[Aggregator] Mock data already initialized");
      return;
    }

    console.log("[Aggregator] Initializing mock data...");

    // Insert platforms
    for (const platformData of PLATFORM_METADATA) {
      await db.insert(platforms).values({
        name: platformData.name,
        displayName: platformData.displayName,
        avgDeliveryTime: platformData.avgDeliveryTime,
        baseDeliveryFee: platformData.baseDeliveryFee,
        minOrderValue: platformData.minOrderValue,
        isActive: true,
      });
    }

    console.log("[Aggregator] Platforms inserted");

    // Get inserted platforms
    const insertedPlatforms = await getPlatforms();
    const platformMap = new Map(
      insertedPlatforms.map((p) => [p.name, p.id])
    );

    // Insert products and pricing
    for (const mockProduct of MOCK_PRODUCTS) {
      const basePrice = getBasePrice(mockProduct.name);
      const imageUrl = getProductImageUrl(mockProduct.name);

      // Insert product
      const productResult = await db.insert(products).values({
        name: mockProduct.name,
        category: mockProduct.category,
        description: mockProduct.description,
        standardQuantity: mockProduct.standardQuantity,
        unit: mockProduct.unit,
        imageUrl,
        keywords: JSON.stringify(mockProduct.keywords),
        isActive: true,
      });

      const productId = productResult[0].insertId as number;

      // Generate and insert pricing for each platform
      const platformPrices = generatePlatformPrices(basePrice, mockProduct.name);

      for (const platformPrice of platformPrices) {
        const platformId = platformMap.get(platformPrice.platformName);
        if (!platformId) continue;

        const finalPrice = Math.round(
          platformPrice.price * (1 - platformPrice.discountPercent / 100)
        );

        await db.insert(productPricing).values({
          productId,
          platformId,
          price: platformPrice.price,
          discountPercent: platformPrice.discountPercent,
          finalPrice,
          stockStatus: platformPrice.stockStatus,
          platformProductId: `${platformPrice.platformName.toLowerCase()}_${productId}`,
        });
      }
    }

    console.log("[Aggregator] Mock data initialization complete");
  } catch (error) {
    console.error("[Aggregator] Error initializing mock data:", error);
    throw error;
  }
}

/**
 * Search for products across the catalog
 */
export async function searchProductsAcrossPlatforms(
  query: string,
  category?: string,
  limit: number = 20
): Promise<ProductResult[]> {
  try {
    const results = await searchProducts(query, category, limit);
    return results.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      description: p.description || "",
      standardQuantity: p.standardQuantity,
      unit: p.unit,
      imageUrl: p.imageUrl || "",
      keywords: p.keywords ? JSON.parse(p.keywords) : [],
    }));
  } catch (error) {
    console.error("[Aggregator] Error searching products:", error);
    return [];
  }
}

/**
 * Get pricing for a product across all platforms
 */
export async function getProductPricesAcrossPlatforms(
  productId: number
): Promise<PlatformPriceResult[]> {
  try {
    const product = await getProductById(productId);
    if (!product) return [];

    const pricing = await getProductPricing(productId);
    const platformsData = await getPlatforms();

    const platformMap = new Map(platformsData.map((p) => [p.id, p]));

    return pricing.map((p) => {
      const platform = platformMap.get(p.platformId);
      return {
        platformId: p.platformId,
        platformName: platform?.displayName || "Unknown",
        price: p.price,
        discountPercent: p.discountPercent,
        finalPrice: p.finalPrice,
        stockStatus: p.stockStatus,
        deliveryTime: platform?.avgDeliveryTime || 15,
        deliveryFee: platform?.baseDeliveryFee || 0,
      };
    });
  } catch (error) {
    console.error("[Aggregator] Error getting product prices:", error);
    return [];
  }
}

/**
 * Compare cart prices across all platforms
 * Returns total price for the same cart on each platform
 */
export async function compareCartAcrossPlatforms(
  cartItems: Array<{ productId: number; quantity: number }>
): Promise<CartComparisonResult[]> {
  try {
    const platformsData = await getPlatforms();
    const results: CartComparisonResult[] = [];

    for (const platform of platformsData) {
      let totalPrice = 0;
      const itemPricings: CartItemPricing[] = [];

      for (const item of cartItems) {
        const pricing = await getProductPricing(item.productId, platform.id);
        if (pricing.length === 0) continue;

        const p = pricing[0];
        const product = await getProductById(item.productId);

        const itemTotal = p.finalPrice * item.quantity;
        totalPrice += itemTotal;

        itemPricings.push({
          productId: item.productId,
          productName: product?.name || "Unknown",
          quantity: item.quantity,
          unitPrice: p.finalPrice,
          totalPrice: itemTotal,
          discountPercent: p.discountPercent,
        });
      }

      results.push({
        platformId: platform.id,
        platformName: platform.displayName,
        totalPrice,
        deliveryFee: platform.baseDeliveryFee,
        totalWithDelivery: totalPrice + platform.baseDeliveryFee,
        items: itemPricings,
      });
    }

    // Calculate savings compared to most expensive
    if (results.length > 0) {
      const maxPrice = Math.max(...results.map((r) => r.totalWithDelivery));
      results.forEach((r) => {
        r.savings = maxPrice - r.totalWithDelivery;
      });
    }

    // Sort by total price
    results.sort((a, b) => a.totalWithDelivery - b.totalWithDelivery);

    return results;
  } catch (error) {
    console.error("[Aggregator] Error comparing cart:", error);
    return [];
  }
}

/**
 * Get product recommendations based on category and user preferences
 */
export async function getRecommendations(
  category: string,
  limit: number = 5
): Promise<RecommendationResult[]> {
  try {
    const categoryProducts = await searchProducts("", category, limit * 2);
    const platformsData = await getPlatforms();

    const recommendations: RecommendationResult[] = [];

    for (const product of categoryProducts.slice(0, limit)) {
      const pricing = await getProductPricing(product.id);
      if (pricing.length === 0) continue;

      // Find cheapest option
      let cheapestPrice = Math.min(...pricing.map((p) => p.finalPrice));
      const cheapestPlatform = pricing.find((p) => p.finalPrice === cheapestPrice);
      const platform = platformsData.find((p) => p.id === cheapestPlatform?.platformId);

      recommendations.push({
        productId: product.id,
        productName: product.name,
        category: product.category,
        reason: `Best price available on ${platform?.displayName}`,
        cheapestPrice,
        platform: platform?.displayName || "Unknown",
      });
    }

    return recommendations;
  } catch (error) {
    console.error("[Aggregator] Error getting recommendations:", error);
    return [];
  }
}

/**
 * Find best deals - products with highest discounts
 */
export async function findBestDeals(limit: number = 10): Promise<RecommendationResult[]> {
  try {
    const allProducts = await searchProducts("", undefined, 100);
    const deals: RecommendationResult[] = [];

    for (const product of allProducts) {
      const pricing = await getProductPricing(product.id);
      if (pricing.length === 0) continue;

      // Find best discount
      const bestDiscount = pricing.reduce((max, p) =>
        p.discountPercent > max.discountPercent ? p : max
      );

      if (bestDiscount.discountPercent > 0) {
        const platform = (await getPlatforms()).find((p) => p.id === bestDiscount.platformId);

        deals.push({
          productId: product.id,
          productName: product.name,
          category: product.category,
          reason: `${bestDiscount.discountPercent}% discount on ${platform?.displayName}`,
          cheapestPrice: bestDiscount.finalPrice,
          platform: platform?.displayName || "Unknown",
        });
      }
    }

    // Sort by discount percentage and return top deals
    return deals
      .sort((a, b) => {
        const aDiscount = parseInt(a.reason.split("%")[0]);
        const bDiscount = parseInt(b.reason.split("%")[0]);
        return bDiscount - aDiscount;
      })
      .slice(0, limit);
  } catch (error) {
    console.error("[Aggregator] Error finding best deals:", error);
    return [];
  }
}

/**
 * Get trending products (most searched/popular)
 */
export async function getTrendingProducts(limit: number = 10): Promise<ProductResult[]> {
  try {
    // In a real system, this would track search/view counts
    // For now, return random products from popular categories
    const categories = ["Dairy", "Vegetables", "Fruits", "Grains"];
    const trendingProducts: ProductResult[] = [];

    for (const category of categories) {
      const categoryProducts = await searchProducts("", category, limit);
      for (const p of categoryProducts.slice(0, Math.ceil(limit / categories.length))) {
        trendingProducts.push({
          id: p.id,
          name: p.name,
          category: p.category,
          description: p.description || "",
          standardQuantity: p.standardQuantity,
          unit: p.unit,
          imageUrl: p.imageUrl || "",
          keywords: p.keywords ? JSON.parse(p.keywords) : [],
        });
      }
    }

    return trendingProducts.slice(0, limit);
  } catch (error) {
    console.error("[Aggregator] Error getting trending products:", error);
    return [];
  }
}
