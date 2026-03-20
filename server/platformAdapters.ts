/**
 * Platform Adapter Layer - Modular abstraction for quick commerce platforms
 * Supports both mock data and real API integration
 * Each adapter can be independently replaced with real API calls
 */

import { PLATFORM_VARIATIONS, LOCATION_MULTIPLIERS } from "./catalogData";

export interface PlatformProduct {
  id: string;
  name: string;
  brand: string;
  quantity: number;
  unit: string;
  price: number; // in paise
  discount: number; // percentage
  finalPrice: number; // in paise
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  deliveryTime: number; // in minutes
  deliveryFee: number; // in paise
  imageUrl?: string;
}

export interface CartComparison {
  platformName: string;
  totalPrice: number; // in paise
  totalDiscount: number; // in paise
  deliveryFee: number; // in paise
  finalTotal: number; // in paise
  estimatedDeliveryTime: number; // in minutes
  savings: number; // compared to most expensive
}

export interface PlatformAdapter {
  name: string;
  searchProducts(query: string, location: string): Promise<PlatformProduct[]>;
  getPrices(productIds: string[], location: string): Promise<Map<string, number>>;
  compareCart(items: CartItem[], location: string): Promise<CartComparison>;
  getDeliveryFee(location: string, totalPrice: number): Promise<number>;
}

export interface CartItem {
  productId: string;
  quantity: number;
  basePrice: number;
}

/**
 * Blinkit Adapter - Mock implementation with real API hooks
 */
export class BlinkitAdapter implements PlatformAdapter {
  name = "Blinkit";
  private baseUrl = process.env.BLINKIT_API_URL || "https://api.blinkit.com/v1";
  private apiKey = process.env.BLINKIT_API_KEY;

  async searchProducts(query: string, location: string): Promise<PlatformProduct[]> {
    // TODO: Replace with real API call
    // const response = await fetch(`${this.baseUrl}/search`, {
    //   headers: { Authorization: `Bearer ${this.apiKey}` },
    //   body: JSON.stringify({ query, location })
    // });
    // return response.json();

    // Mock implementation
    return this.mockSearch(query, location);
  }

  async getPrices(productIds: string[], location: string): Promise<Map<string, number>> {
    // TODO: Replace with real API call
    // const response = await fetch(`${this.baseUrl}/prices`, {
    //   headers: { Authorization: `Bearer ${this.apiKey}` },
    //   body: JSON.stringify({ productIds, location })
    // });
    // return new Map(Object.entries(await response.json()));

    // Mock implementation
    return this.mockGetPrices(productIds, location);
  }

  async compareCart(items: CartItem[], location: string): Promise<CartComparison> {
    const deliveryFee = await this.getDeliveryFee(location, items.reduce((sum, item) => sum + item.basePrice * item.quantity, 0));
    const totalPrice = items.reduce((sum, item) => sum + item.basePrice * item.quantity, 0);
    const discount = Math.floor(totalPrice * 0.02); // 2% average discount for Blinkit
    const finalTotal = totalPrice - discount + deliveryFee;

    return {
      platformName: this.name,
      totalPrice,
      totalDiscount: discount,
      deliveryFee,
      finalTotal,
      estimatedDeliveryTime: 15,
      savings: 0,
    };
  }

  async getDeliveryFee(location: string, totalPrice: number): Promise<number> {
    // TODO: Replace with real API call
    // const response = await fetch(`${this.baseUrl}/delivery-fee`, {
    //   body: JSON.stringify({ location, totalPrice })
    // });
    // return response.json().fee;

    // Mock: Free delivery above ₹200, else ₹40
    return totalPrice >= 20000 ? 0 : 4000;
  }

  private mockSearch(query: string, location: string): PlatformProduct[] {
    // Generate mock products with Blinkit pricing
    const multiplier = PLATFORM_VARIATIONS.Blinkit.priceMultiplier;
    const locationMultiplier = LOCATION_MULTIPLIERS[location] || 1.0;

    return [
      {
        id: `blinkit-${query}-1`,
        name: query,
        brand: "Sample Brand",
        quantity: 500,
        unit: "ml",
        price: Math.floor(5000 * multiplier * locationMultiplier),
        discount: 2,
        finalPrice: Math.floor(5000 * multiplier * locationMultiplier * 0.98),
        stockStatus: "in_stock",
        deliveryTime: 12,
        deliveryFee: 4000,
      },
    ];
  }

  private mockGetPrices(productIds: string[], location: string): Map<string, number> {
    const multiplier = PLATFORM_VARIATIONS.Blinkit.priceMultiplier;
    const locationMultiplier = LOCATION_MULTIPLIERS[location] || 1.0;
    const prices = new Map<string, number>();

    for (const id of productIds) {
      prices.set(id, Math.floor(5000 * multiplier * locationMultiplier));
    }

    return prices;
  }
}

/**
 * Zepto Adapter - Mock implementation with real API hooks
 */
export class ZeptoAdapter implements PlatformAdapter {
  name = "Zepto";
  private baseUrl = process.env.ZEPTO_API_URL || "https://api.zepto.com/v1";
  private apiKey = process.env.ZEPTO_API_KEY;

  async searchProducts(query: string, location: string): Promise<PlatformProduct[]> {
    // TODO: Replace with real API call
    // const response = await fetch(`${this.baseUrl}/search`, {
    //   headers: { Authorization: `Bearer ${this.apiKey}` },
    //   body: JSON.stringify({ query, location })
    // });
    // return response.json();

    // Mock implementation
    return this.mockSearch(query, location);
  }

  async getPrices(productIds: string[], location: string): Promise<Map<string, number>> {
    // TODO: Replace with real API call
    // const response = await fetch(`${this.baseUrl}/prices`, {
    //   headers: { Authorization: `Bearer ${this.apiKey}` },
    //   body: JSON.stringify({ productIds, location })
    // });
    // return new Map(Object.entries(await response.json()));

    // Mock implementation
    return this.mockGetPrices(productIds, location);
  }

  async compareCart(items: CartItem[], location: string): Promise<CartComparison> {
    const deliveryFee = await this.getDeliveryFee(location, items.reduce((sum, item) => sum + item.basePrice * item.quantity, 0));
    const totalPrice = items.reduce((sum, item) => sum + item.basePrice * item.quantity, 0);
    const discount = Math.floor(totalPrice * 0.035); // 3.5% average discount for Zepto
    const finalTotal = totalPrice - discount + deliveryFee;

    return {
      platformName: this.name,
      totalPrice,
      totalDiscount: discount,
      deliveryFee,
      finalTotal,
      estimatedDeliveryTime: 10,
      savings: 0,
    };
  }

  async getDeliveryFee(location: string, totalPrice: number): Promise<number> {
    // TODO: Replace with real API call
    // const response = await fetch(`${this.baseUrl}/delivery-fee`, {
    //   body: JSON.stringify({ location, totalPrice })
    // });
    // return response.json().fee;

    // Mock: Free delivery above ₹250, else ₹50
    return totalPrice >= 25000 ? 0 : 5000;
  }

  private mockSearch(query: string, location: string): PlatformProduct[] {
    // Generate mock products with Zepto pricing (2% cheaper)
    const multiplier = PLATFORM_VARIATIONS.Zepto.priceMultiplier;
    const locationMultiplier = LOCATION_MULTIPLIERS[location] || 1.0;

    return [
      {
        id: `zepto-${query}-1`,
        name: query,
        brand: "Sample Brand",
        quantity: 500,
        unit: "ml",
        price: Math.floor(5000 * multiplier * locationMultiplier),
        discount: 3,
        finalPrice: Math.floor(5000 * multiplier * locationMultiplier * 0.97),
        stockStatus: "in_stock",
        deliveryTime: 10,
        deliveryFee: 5000,
      },
    ];
  }

  private mockGetPrices(productIds: string[], location: string): Map<string, number> {
    const multiplier = PLATFORM_VARIATIONS.Zepto.priceMultiplier;
    const locationMultiplier = LOCATION_MULTIPLIERS[location] || 1.0;
    const prices = new Map<string, number>();

    for (const id of productIds) {
      prices.set(id, Math.floor(5000 * multiplier * locationMultiplier));
    }

    return prices;
  }
}

/**
 * Swiggy Instamart Adapter - Mock implementation with real API hooks
 */
export class InstamartAdapter implements PlatformAdapter {
  name = "Swiggy Instamart";
  private baseUrl = process.env.SWIGGY_INSTAMART_API_URL || "https://api.swiggystaging.com/v1";
  private apiKey = process.env.SWIGGY_INSTAMART_API_KEY;

  async searchProducts(query: string, location: string): Promise<PlatformProduct[]> {
    // TODO: Replace with real API call
    // const response = await fetch(`${this.baseUrl}/search`, {
    //   headers: { Authorization: `Bearer ${this.apiKey}` },
    //   body: JSON.stringify({ query, location })
    // });
    // return response.json();

    // Mock implementation
    return this.mockSearch(query, location);
  }

  async getPrices(productIds: string[], location: string): Promise<Map<string, number>> {
    // TODO: Replace with real API call
    // const response = await fetch(`${this.baseUrl}/prices`, {
    //   headers: { Authorization: `Bearer ${this.apiKey}` },
    //   body: JSON.stringify({ productIds, location })
    // });
    // return new Map(Object.entries(await response.json()));

    // Mock implementation
    return this.mockGetPrices(productIds, location);
  }

  async compareCart(items: CartItem[], location: string): Promise<CartComparison> {
    const deliveryFee = await this.getDeliveryFee(location, items.reduce((sum, item) => sum + item.basePrice * item.quantity, 0));
    const totalPrice = items.reduce((sum, item) => sum + item.basePrice * item.quantity, 0);
    const discount = Math.floor(totalPrice * 0.025); // 2.5% average discount for Instamart
    const finalTotal = totalPrice - discount + deliveryFee;

    return {
      platformName: this.name,
      totalPrice,
      totalDiscount: discount,
      deliveryFee,
      finalTotal,
      estimatedDeliveryTime: 18,
      savings: 0,
    };
  }

  async getDeliveryFee(location: string, totalPrice: number): Promise<number> {
    // TODO: Replace with real API call
    // const response = await fetch(`${this.baseUrl}/delivery-fee`, {
    //   body: JSON.stringify({ location, totalPrice })
    // });
    // return response.json().fee;

    // Mock: Free delivery above ₹300, else ₹60
    return totalPrice >= 30000 ? 0 : 6000;
  }

  private mockSearch(query: string, location: string): PlatformProduct[] {
    // Generate mock products with Instamart pricing (baseline)
    const multiplier = PLATFORM_VARIATIONS["Swiggy Instamart"].priceMultiplier;
    const locationMultiplier = LOCATION_MULTIPLIERS[location] || 1.0;

    return [
      {
        id: `instamart-${query}-1`,
        name: query,
        brand: "Sample Brand",
        quantity: 500,
        unit: "ml",
        price: Math.floor(5000 * multiplier * locationMultiplier),
        discount: 2,
        finalPrice: Math.floor(5000 * multiplier * locationMultiplier * 0.98),
        stockStatus: "in_stock",
        deliveryTime: 18,
        deliveryFee: 6000,
      },
    ];
  }

  private mockGetPrices(productIds: string[], location: string): Map<string, number> {
    const multiplier = PLATFORM_VARIATIONS["Swiggy Instamart"].priceMultiplier;
    const locationMultiplier = LOCATION_MULTIPLIERS[location] || 1.0;
    const prices = new Map<string, number>();

    for (const id of productIds) {
      prices.set(id, Math.floor(5000 * multiplier * locationMultiplier));
    }

    return prices;
  }
}

/**
 * Adapter Factory - Creates and manages platform adapters
 */
export class AdapterFactory {
  private static adapters: Map<string, PlatformAdapter> = new Map();

  static {
    this.adapters.set("Blinkit", new BlinkitAdapter());
    this.adapters.set("Zepto", new ZeptoAdapter());
    this.adapters.set("Swiggy Instamart", new InstamartAdapter());
  }

  static getAdapter(platformName: string): PlatformAdapter | null {
    return this.adapters.get(platformName) || null;
  }

  static getAllAdapters(): PlatformAdapter[] {
    return Array.from(this.adapters.values());
  }

  static registerAdapter(name: string, adapter: PlatformAdapter): void {
    this.adapters.set(name, adapter);
  }
}

/**
 * Aggregator Service - Coordinates across all platform adapters
 */
export class PlatformAggregator {
  async searchAcrossAllPlatforms(query: string, location: string) {
    const adapters = AdapterFactory.getAllAdapters();
    const results = await Promise.all(
      adapters.map((adapter) => adapter.searchProducts(query, location))
    );

    return {
      Blinkit: results[0],
      Zepto: results[1],
      "Swiggy Instamart": results[2],
    };
  }

  async compareCartAcrossAllPlatforms(items: CartItem[], location: string) {
    const adapters = AdapterFactory.getAllAdapters();
    const comparisons = await Promise.all(
      adapters.map((adapter) => adapter.compareCart(items, location))
    );

    // Add savings calculation
    const maxPrice = Math.max(...comparisons.map((c) => c.finalTotal));
    return comparisons.map((comparison) => ({
      ...comparison,
      savings: maxPrice - comparison.finalTotal,
    }));
  }
}
