import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
  index,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Product catalog with standardized product information.
 * Stores base product data that is normalized across platforms.
 */
export const products = mysqlTable(
  "products",
  {
    id: int("id").autoincrement().primaryKey(),
    /** Standardized product name (e.g., "Amul Full Cream Milk") */
    name: varchar("name", { length: 255 }).notNull(),
    /** Product category (groceries, fruits, vegetables, dairy, etc.) */
    category: varchar("category", { length: 100 }).notNull(),
    /** Product description */
    description: text("description"),
    /** Standard quantity (e.g., 500 for 500ml milk) */
    standardQuantity: int("standardQuantity").notNull(),
    /** Unit of measurement (ml, l, kg, g, pieces, etc.) */
    unit: varchar("unit", { length: 50 }).notNull(),
    /** Product image URL */
    imageUrl: varchar("imageUrl", { length: 512 }),
    /** Search keywords for autocomplete */
    keywords: text("keywords"), // JSON array stored as text
    /** Whether product is actively available */
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    categoryIdx: index("category_idx").on(table.category),
    nameIdx: index("name_idx").on(table.name),
  })
);

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Platform definitions (Blinkit, Zepto, Swiggy Instamart).
 * Stores metadata about each quick commerce platform.
 */
export const platforms = mysqlTable("platforms", {
  id: int("id").autoincrement().primaryKey(),
  /** Platform name (e.g., "Blinkit", "Zepto", "Swiggy Instamart") */
  name: varchar("name", { length: 100 }).notNull().unique(),
  /** Platform display name */
  displayName: varchar("displayName", { length: 100 }).notNull(),
  /** Platform logo URL */
  logoUrl: varchar("logoUrl", { length: 512 }),
  /** Average delivery time in minutes */
  avgDeliveryTime: int("avgDeliveryTime").notNull(),
  /** Base delivery fee in paise (1 rupee = 100 paise) */
  baseDeliveryFee: int("baseDeliveryFee").notNull(),
  /** Minimum order value in paise */
  minOrderValue: int("minOrderValue").notNull(),
  /** API endpoint for this platform (for future real integration) */
  apiEndpoint: varchar("apiEndpoint", { length: 512 }),
  /** Whether this platform is currently available */
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Platform = typeof platforms.$inferSelect;
export type InsertPlatform = typeof platforms.$inferInsert;

/**
 * Product pricing across platforms.
 * Stores platform-specific prices for products with realistic variations.
 */
export const productPricing = mysqlTable(
  "product_pricing",
  {
    id: int("id").autoincrement().primaryKey(),
    /** Reference to product */
    productId: int("productId").notNull(),
    /** Reference to platform */
    platformId: int("platformId").notNull(),
    /** Price in paise (1 rupee = 100 paise) */
    price: int("price").notNull(),
    /** Discount percentage (0-100) */
    discountPercent: int("discountPercent").default(0).notNull(),
    /** Final price after discount in paise */
    finalPrice: int("finalPrice").notNull(),
    /** Stock status (in_stock, low_stock, out_of_stock) */
    stockStatus: mysqlEnum("stockStatus", ["in_stock", "low_stock", "out_of_stock"])
      .default("in_stock")
      .notNull(),
    /** Platform-specific product ID for future API integration */
    platformProductId: varchar("platformProductId", { length: 255 }),
    /** Last updated timestamp for price tracking */
    lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    productPlatformIdx: index("product_platform_idx").on(
      table.productId,
      table.platformId
    ),
  })
);

export type ProductPricing = typeof productPricing.$inferSelect;
export type InsertProductPricing = typeof productPricing.$inferInsert;

/**
 * User shopping carts.
 * Stores cart state for users to compare prices across platforms.
 */
export const carts = mysqlTable(
  "carts",
  {
    id: int("id").autoincrement().primaryKey(),
    /** Reference to user */
    userId: int("userId").notNull(),
    /** Cart name/label (e.g., "Weekly Groceries") */
    name: varchar("name", { length: 255 }).default("My Cart").notNull(),
    /** Whether this is the active cart */
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
  })
);

export type Cart = typeof carts.$inferSelect;
export type InsertCart = typeof carts.$inferInsert;

/**
 * Cart items.
 * Stores individual items in a user's cart with quantity.
 */
export const cartItems = mysqlTable(
  "cart_items",
  {
    id: int("id").autoincrement().primaryKey(),
    /** Reference to cart */
    cartId: int("cartId").notNull(),
    /** Reference to product */
    productId: int("productId").notNull(),
    /** Quantity of product in cart */
    quantity: int("quantity").notNull(),
    /** Timestamp when item was added */
    addedAt: timestamp("addedAt").defaultNow().notNull(),
  },
  (table) => ({
    cartIdIdx: index("cart_id_idx").on(table.cartId),
    productIdIdx: index("product_id_idx").on(table.productId),
  })
);

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

/**
 * User saved/favorite products.
 * Tracks products users want to monitor for price drops.
 */
export const savedProducts = mysqlTable(
  "saved_products",
  {
    id: int("id").autoincrement().primaryKey(),
    /** Reference to user */
    userId: int("userId").notNull(),
    /** Reference to product */
    productId: int("productId").notNull(),
    /** Whether to notify on price drop */
    notifyOnPriceDrop: boolean("notifyOnPriceDrop").default(true).notNull(),
    /** Last known price in paise (for tracking drops) */
    lastKnownPrice: int("lastKnownPrice"),
    /** Preferred platform for this product */
    preferredPlatformId: int("preferredPlatformId"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userProductIdx: index("user_product_idx").on(table.userId, table.productId),
  })
);

export type SavedProduct = typeof savedProducts.$inferSelect;
export type InsertSavedProduct = typeof savedProducts.$inferInsert;

/**
 * Price history for tracking price changes over time.
 * Enables analytics and price trend visualization.
 */
export const priceHistory = mysqlTable(
  "price_history",
  {
    id: int("id").autoincrement().primaryKey(),
    /** Reference to product pricing record */
    productPricingId: int("productPricingId").notNull(),
    /** Historical price in paise */
    price: int("price").notNull(),
    /** Historical discount percentage */
    discountPercent: int("discountPercent").notNull(),
    /** Historical final price in paise */
    finalPrice: int("finalPrice").notNull(),
    /** When this price was recorded */
    recordedAt: timestamp("recordedAt").defaultNow().notNull(),
  },
  (table) => ({
    productPricingIdx: index("product_pricing_idx").on(table.productPricingId),
    recordedAtIdx: index("recorded_at_idx").on(table.recordedAt),
  })
);

export type PriceHistory = typeof priceHistory.$inferSelect;
export type InsertPriceHistory = typeof priceHistory.$inferInsert;

/**
 * Price drop notifications sent to users.
 * Tracks notification history for analytics and deduplication.
 */
export const priceDropNotifications = mysqlTable(
  "price_drop_notifications",
  {
    id: int("id").autoincrement().primaryKey(),
    /** Reference to user */
    userId: int("userId").notNull(),
    /** Reference to product */
    productId: int("productId").notNull(),
    /** Reference to platform */
    platformId: int("platformId").notNull(),
    /** Previous price in paise */
    previousPrice: int("previousPrice").notNull(),
    /** New price in paise */
    newPrice: int("newPrice").notNull(),
    /** Savings amount in paise */
    savings: int("savings").notNull(),
    /** Whether user has viewed this notification */
    isRead: boolean("isRead").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    productIdIdx: index("product_id_idx").on(table.productId),
  })
);

export type PriceDropNotification = typeof priceDropNotifications.$inferSelect;
export type InsertPriceDropNotification =
  typeof priceDropNotifications.$inferInsert;

/**
 * User preferences and recommendations data.
 * Stores user shopping patterns and preferences for recommendations.
 */
export const userPreferences = mysqlTable(
  "user_preferences",
  {
    id: int("id").autoincrement().primaryKey(),
    /** Reference to user */
    userId: int("userId").notNull().unique(),
    /** Preferred categories (JSON array) */
    preferredCategories: text("preferredCategories"), // JSON array
    /** Preferred platforms (JSON array) */
    preferredPlatforms: text("preferredPlatforms"), // JSON array
    /** Budget preference (low, medium, high) */
    budgetPreference: mysqlEnum("budgetPreference", ["low", "medium", "high"])
      .default("medium")
      .notNull(),
    /** Whether to show recommendations */
    showRecommendations: boolean("showRecommendations").default(true).notNull(),
    /** Whether to enable price drop alerts */
    enablePriceAlerts: boolean("enablePriceAlerts").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
  })
);

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = typeof userPreferences.$inferInsert;
