/**
 * Mock Data Generator for Quick Commerce Platforms
 * Generates realistic product catalog and pricing data for Blinkit, Zepto, and Swiggy Instamart
 * This layer can be easily replaced with real API integrations later
 */

export interface MockProduct {
  name: string;
  category: string;
  description: string;
  standardQuantity: number;
  unit: string;
  keywords: string[];
}

export interface MockPlatformPrice {
  platformName: string;
  price: number; // in paise (1 rupee = 100 paise)
  discountPercent: number;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
}

/**
 * Comprehensive mock product catalog
 * Covers common grocery items across categories
 */
export const MOCK_PRODUCTS: MockProduct[] = [
  // Dairy & Milk
  {
    name: "Amul Full Cream Milk",
    category: "Dairy",
    description: "Fresh full cream milk, rich in calcium and protein",
    standardQuantity: 500,
    unit: "ml",
    keywords: ["milk", "dairy", "amul", "full cream"],
  },
  {
    name: "Amul Toned Milk",
    category: "Dairy",
    description: "Nutritious toned milk with reduced fat",
    standardQuantity: 500,
    unit: "ml",
    keywords: ["milk", "dairy", "amul", "toned"],
  },
  {
    name: "Mother Dairy Full Cream Milk",
    category: "Dairy",
    description: "Pure full cream milk from Mother Dairy",
    standardQuantity: 500,
    unit: "ml",
    keywords: ["milk", "dairy", "mother dairy"],
  },
  {
    name: "Amul Butter",
    category: "Dairy",
    description: "Pure butter made from milk",
    standardQuantity: 100,
    unit: "g",
    keywords: ["butter", "dairy", "amul"],
  },
  {
    name: "Amul Cheese Slices",
    category: "Dairy",
    description: "Processed cheese slices",
    standardQuantity: 200,
    unit: "g",
    keywords: ["cheese", "dairy", "amul"],
  },
  {
    name: "Yogurt - Amul Masti",
    category: "Dairy",
    description: "Fresh yogurt with live cultures",
    standardQuantity: 400,
    unit: "g",
    keywords: ["yogurt", "dairy", "amul"],
  },

  // Fruits & Vegetables
  {
    name: "Banana - Yellow",
    category: "Fruits",
    description: "Fresh yellow bananas, ripe and sweet",
    standardQuantity: 1,
    unit: "kg",
    keywords: ["banana", "fruit", "yellow"],
  },
  {
    name: "Apple - Red Delicious",
    category: "Fruits",
    description: "Fresh red delicious apples",
    standardQuantity: 1,
    unit: "kg",
    keywords: ["apple", "fruit", "red"],
  },
  {
    name: "Orange - Fresh",
    category: "Fruits",
    description: "Juicy fresh oranges",
    standardQuantity: 1,
    unit: "kg",
    keywords: ["orange", "fruit", "citrus"],
  },
  {
    name: "Tomato - Fresh",
    category: "Vegetables",
    description: "Fresh ripe tomatoes",
    standardQuantity: 1,
    unit: "kg",
    keywords: ["tomato", "vegetable", "fresh"],
  },
  {
    name: "Onion - White",
    category: "Vegetables",
    description: "Fresh white onions",
    standardQuantity: 1,
    unit: "kg",
    keywords: ["onion", "vegetable", "white"],
  },
  {
    name: "Potato - Red",
    category: "Vegetables",
    description: "Fresh red potatoes",
    standardQuantity: 1,
    unit: "kg",
    keywords: ["potato", "vegetable", "red"],
  },
  {
    name: "Carrot - Fresh",
    category: "Vegetables",
    description: "Fresh orange carrots",
    standardQuantity: 1,
    unit: "kg",
    keywords: ["carrot", "vegetable", "orange"],
  },
  {
    name: "Cucumber - Fresh",
    category: "Vegetables",
    description: "Fresh green cucumbers",
    standardQuantity: 1,
    unit: "kg",
    keywords: ["cucumber", "vegetable", "green"],
  },

  // Grains & Cereals
  {
    name: "Basmati Rice - India Gate",
    category: "Grains",
    description: "Premium basmati rice",
    standardQuantity: 1,
    unit: "kg",
    keywords: ["rice", "basmati", "grain"],
  },
  {
    name: "Wheat Flour - Aashirvaad",
    category: "Grains",
    description: "Whole wheat flour for rotis",
    standardQuantity: 1,
    unit: "kg",
    keywords: ["flour", "wheat", "aashirvaad"],
  },
  {
    name: "Oats - Quaker",
    category: "Grains",
    description: "Quick cooking oats",
    standardQuantity: 500,
    unit: "g",
    keywords: ["oats", "cereal", "quaker"],
  },

  // Oils & Spices
  {
    name: "Sunflower Oil - Fortune",
    category: "Oils",
    description: "Pure sunflower cooking oil",
    standardQuantity: 1,
    unit: "l",
    keywords: ["oil", "sunflower", "fortune"],
  },
  {
    name: "Mustard Oil - Kachi Ghani",
    category: "Oils",
    description: "Cold-pressed mustard oil",
    standardQuantity: 1,
    unit: "l",
    keywords: ["oil", "mustard", "kachi ghani"],
  },
  {
    name: "Turmeric Powder",
    category: "Spices",
    description: "Pure turmeric powder",
    standardQuantity: 100,
    unit: "g",
    keywords: ["spice", "turmeric", "powder"],
  },
  {
    name: "Chili Powder",
    category: "Spices",
    description: "Red chili powder",
    standardQuantity: 100,
    unit: "g",
    keywords: ["spice", "chili", "powder"],
  },

  // Bakery & Bread
  {
    name: "Bread - White",
    category: "Bakery",
    description: "Fresh white bread",
    standardQuantity: 400,
    unit: "g",
    keywords: ["bread", "white", "bakery"],
  },
  {
    name: "Bread - Whole Wheat",
    category: "Bakery",
    description: "Whole wheat bread",
    standardQuantity: 400,
    unit: "g",
    keywords: ["bread", "wheat", "bakery"],
  },
  {
    name: "Biscuits - Marie",
    category: "Bakery",
    description: "Classic Marie biscuits",
    standardQuantity: 200,
    unit: "g",
    keywords: ["biscuit", "marie", "bakery"],
  },

  // Beverages
  {
    name: "Tea - Taj Mahal",
    category: "Beverages",
    description: "Premium black tea",
    standardQuantity: 250,
    unit: "g",
    keywords: ["tea", "taj mahal", "beverage"],
  },
  {
    name: "Coffee - Nescafé",
    category: "Beverages",
    description: "Instant coffee",
    standardQuantity: 100,
    unit: "g",
    keywords: ["coffee", "nescafe", "beverage"],
  },
  {
    name: "Juice - Tropicana Orange",
    category: "Beverages",
    description: "Fresh orange juice",
    standardQuantity: 1,
    unit: "l",
    keywords: ["juice", "tropicana", "orange"],
  },

  // Snacks
  {
    name: "Chips - Lay's Classic",
    category: "Snacks",
    description: "Classic salted potato chips",
    standardQuantity: 40,
    unit: "g",
    keywords: ["chips", "lays", "snack"],
  },
  {
    name: "Namkeen - Haldiram's",
    category: "Snacks",
    description: "Mixed savory snacks",
    standardQuantity: 200,
    unit: "g",
    keywords: ["namkeen", "haldirams", "snack"],
  },

  // Eggs
  {
    name: "Eggs - Brown",
    category: "Eggs",
    description: "Fresh brown eggs",
    standardQuantity: 1,
    unit: "dozen",
    keywords: ["eggs", "brown", "dozen"],
  },

  // Meat (if available)
  {
    name: "Chicken - Breast",
    category: "Meat",
    description: "Fresh chicken breast",
    standardQuantity: 1,
    unit: "kg",
    keywords: ["chicken", "meat", "breast"],
  },
];

/**
 * Generate realistic pricing variations for a product across platforms
 * Simulates price differences based on platform strategies
 */
export function generatePlatformPrices(
  basePrice: number,
  productName: string
): MockPlatformPrice[] {
  // Create platform-specific variations
  // Base price is in paise

  const platforms = [
    {
      name: "Blinkit",
      priceMultiplier: 0.98, // Generally 2% cheaper
      discountRange: [0, 5],
      stockStatus: "in_stock" as const,
    },
    {
      name: "Zepto",
      priceMultiplier: 1.0, // Market rate
      discountRange: [0, 8],
      stockStatus: "in_stock" as const,
    },
    {
      name: "Swiggy Instamart",
      priceMultiplier: 1.02, // Generally 2% more expensive
      discountRange: [0, 3],
      stockStatus: "in_stock" as const,
    },
  ];

  return platforms.map((platform) => {
    const baseWithMultiplier = Math.round(basePrice * platform.priceMultiplier);

    // Add some randomness to make it realistic
    const randomVariation = Math.round((Math.random() - 0.5) * basePrice * 0.05);
    const finalPrice = Math.max(baseWithMultiplier + randomVariation, basePrice * 0.9);

    // Random discount
    const discountPercent = Math.floor(
      Math.random() * (platform.discountRange[1] - platform.discountRange[0]) +
        platform.discountRange[0]
    );

    // Calculate final price after discount
    const priceAfterDiscount = Math.round(
      finalPrice * (1 - discountPercent / 100)
    );

    // Randomly set some items as low stock (10% chance)
    const stockStatus =
      Math.random() < 0.1
        ? ("low_stock" as const)
        : ("in_stock" as const);

    return {
      platformName: platform.name,
      price: Math.round(finalPrice),
      discountPercent,
      stockStatus,
    };
  });
}

/**
 * Generate realistic base prices for products
 * Prices in paise (1 rupee = 100 paise)
 */
export function getBasePrice(productName: string): number {
  const priceMap: Record<string, number> = {
    // Dairy - prices in paise
    "Amul Full Cream Milk": 2500, // ₹25
    "Amul Toned Milk": 2200, // ₹22
    "Mother Dairy Full Cream Milk": 2600, // ₹26
    "Amul Butter": 35000, // ₹350
    "Amul Cheese Slices": 12000, // ₹120
    "Yogurt - Amul Masti": 4000, // ₹40

    // Fruits
    "Banana - Yellow": 4000, // ₹40/kg
    "Apple - Red Delicious": 8000, // ₹80/kg
    "Orange - Fresh": 6000, // ₹60/kg

    // Vegetables
    "Tomato - Fresh": 3000, // ₹30/kg
    "Onion - White": 2500, // ₹25/kg
    "Potato - Red": 2000, // ₹20/kg
    "Carrot - Fresh": 3500, // ₹35/kg
    "Cucumber - Fresh": 2500, // ₹25/kg

    // Grains
    "Basmati Rice - India Gate": 25000, // ₹250/kg
    "Wheat Flour - Aashirvaad": 3500, // ₹35/kg
    "Oats - Quaker": 15000, // ₹150

    // Oils
    "Sunflower Oil - Fortune": 18000, // ₹180/l
    "Mustard Oil - Kachi Ghani": 20000, // ₹200/l

    // Spices
    "Turmeric Powder": 5000, // ₹50
    "Chili Powder": 6000, // ₹60

    // Bakery
    "Bread - White": 3500, // ₹35
    "Bread - Whole Wheat": 4000, // ₹40
    "Biscuits - Marie": 4500, // ₹45

    // Beverages
    "Tea - Taj Mahal": 20000, // ₹200
    "Coffee - Nescafé": 12000, // ₹120
    "Juice - Tropicana Orange": 8000, // ₹80

    // Snacks
    "Chips - Lay's Classic": 2000, // ₹20
    "Namkeen - Haldiram's": 8000, // ₹80

    // Eggs
    "Eggs - Brown": 7000, // ₹70/dozen

    // Meat
    "Chicken - Breast": 30000, // ₹300/kg
  };

  return priceMap[productName] || 5000; // Default ₹50 if not found
}

/**
 * Get product image URL (placeholder)
 */
export function getProductImageUrl(productName: string): string {
  // In production, this would return actual product images
  // For now, using placeholder service
  const encodedName = encodeURIComponent(productName);
  return `https://via.placeholder.com/200x200?text=${encodedName}`;
}

/**
 * Platform metadata
 */
export const PLATFORM_METADATA = [
  {
    name: "Blinkit",
    displayName: "Blinkit",
    avgDeliveryTime: 10,
    baseDeliveryFee: 0, // Free delivery
    minOrderValue: 0,
  },
  {
    name: "Zepto",
    displayName: "Zepto",
    avgDeliveryTime: 12,
    baseDeliveryFee: 0, // Free delivery
    minOrderValue: 0,
  },
  {
    name: "Swiggy Instamart",
    displayName: "Swiggy Instamart",
    avgDeliveryTime: 15,
    baseDeliveryFee: 0, // Free delivery
    minOrderValue: 0,
  },
];
