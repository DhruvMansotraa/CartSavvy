import { eq, and, like, inArray, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  products,
  platforms,
  productPricing,
  carts,
  cartItems,
  savedProducts,
  priceHistory,
  priceDropNotifications,
  userPreferences,
  type Product,
  type Platform,
  type ProductPricing,
  type Cart,
  type CartItem,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * PRODUCT QUERIES
 */

export async function searchProducts(
  query: string,
  category?: string,
  limit: number = 20
): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(products.isActive, true)];

  if (query) {
    conditions.push(
      like(products.name, `%${query}%`)
    );
  }

  if (category) {
    conditions.push(eq(products.category, category));
  }

  const result = await db
    .select()
    .from(products)
    .where(and(...conditions))
    .limit(limit);

  return result;
}

export async function getProductById(productId: number): Promise<Product | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getProductsByCategory(
  category: string,
  limit: number = 50
): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(products)
    .where(and(eq(products.category, category), eq(products.isActive, true)))
    .limit(limit);
}

export async function getProductCategories(): Promise<string[]> {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .selectDistinct({ category: products.category })
    .from(products)
    .where(eq(products.isActive, true));

  return result.map((r) => r.category);
}

/**
 * PLATFORM QUERIES
 */

export async function getPlatforms(): Promise<Platform[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(platforms).where(eq(platforms.isActive, true));
}

export async function getPlatformById(platformId: number): Promise<Platform | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(platforms)
    .where(eq(platforms.id, platformId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getPlatformByName(name: string): Promise<Platform | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(platforms)
    .where(eq(platforms.name, name))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * PRICING QUERIES
 */

export async function getProductPricing(
  productId: number,
  platformId?: number
): Promise<ProductPricing[]> {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(productPricing.productId, productId)];
  if (platformId) {
    conditions.push(eq(productPricing.platformId, platformId));
  }

  return db
    .select()
    .from(productPricing)
    .where(and(...conditions));
}

export async function getProductPricingByPlatforms(
  productId: number,
  platformIds: number[]
): Promise<ProductPricing[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(productPricing)
    .where(
      and(
        eq(productPricing.productId, productId),
        inArray(productPricing.platformId, platformIds)
      )
    );
}

/**
 * CART QUERIES
 */

export async function getUserCart(
  userId: number,
  createIfNotExists: boolean = true
): Promise<Cart | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(carts)
    .where(and(eq(carts.userId, userId), eq(carts.isActive, true)))
    .limit(1);

  if (result.length > 0) {
    return result[0];
  }

  if (createIfNotExists) {
    const newCart = await db.insert(carts).values({
      userId,
      name: "My Cart",
      isActive: true,
    });
    const cartId = newCart[0].insertId;
    return { id: cartId as number, userId, name: "My Cart", isActive: true, createdAt: new Date(), updatedAt: new Date() };
  }

  return null;
}

export async function getCartItems(cartId: number): Promise<CartItem[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(cartItems)
    .where(eq(cartItems.cartId, cartId));
}

export async function addToCart(
  cartId: number,
  productId: number,
  quantity: number
): Promise<CartItem | null> {
  const db = await getDb();
  if (!db) return null;

  // Check if item already exists
  const existing = await db
    .select()
    .from(cartItems)
    .where(
      and(
        eq(cartItems.cartId, cartId),
        eq(cartItems.productId, productId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Update quantity
    await db
      .update(cartItems)
      .set({ quantity: existing[0].quantity + quantity })
      .where(
        and(
          eq(cartItems.cartId, cartId),
          eq(cartItems.productId, productId)
        )
      );
    return { ...existing[0], quantity: existing[0].quantity + quantity };
  }

  // Insert new item
  const result = await db.insert(cartItems).values({
    cartId,
    productId,
    quantity,
  });

  return {
    id: result[0].insertId as number,
    cartId,
    productId,
    quantity,
    addedAt: new Date(),
  };
}

export async function updateCartItemQuantity(
  cartItemId: number,
  quantity: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  if (quantity <= 0) {
    // Delete item if quantity is 0 or less
    await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
    return true;
  }

  await db
    .update(cartItems)
    .set({ quantity })
    .where(eq(cartItems.id, cartItemId));

  return true;
}

export async function removeFromCart(cartItemId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
  return true;
}

export async function clearCart(cartId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
  return true;
}

/**
 * SAVED PRODUCTS QUERIES
 */

export async function getSavedProducts(userId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(savedProducts)
    .where(eq(savedProducts.userId, userId));
}

export async function saveProduct(
  userId: number,
  productId: number,
  preferredPlatformId?: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const existing = await db
    .select()
    .from(savedProducts)
    .where(
      and(
        eq(savedProducts.userId, userId),
        eq(savedProducts.productId, productId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return true; // Already saved
  }

  await db.insert(savedProducts).values({
    userId,
    productId,
    notifyOnPriceDrop: true,
    preferredPlatformId,
  });

  return true;
}

export async function removeSavedProduct(
  userId: number,
  productId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  await db
    .delete(savedProducts)
    .where(
      and(
        eq(savedProducts.userId, userId),
        eq(savedProducts.productId, productId)
      )
    );

  return true;
}

/**
 * USER PREFERENCES QUERIES
 */

export async function getUserPreferences(userId: number): Promise<any | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateUserPreferences(
  userId: number,
  preferences: Partial<typeof userPreferences.$inferInsert>
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const existing = await getUserPreferences(userId);

  if (!existing) {
    await db.insert(userPreferences).values({
      userId,
      ...preferences,
    });
  } else {
    await db
      .update(userPreferences)
      .set(preferences)
      .where(eq(userPreferences.userId, userId));
  }

  return true;
}

/**
 * PRICE HISTORY & NOTIFICATIONS
 */

export async function recordPriceHistory(
  productPricingId: number,
  price: number,
  discountPercent: number,
  finalPrice: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  await db.insert(priceHistory).values({
    productPricingId,
    price,
    discountPercent,
    finalPrice,
  });

  return true;
}

export async function getUserNotifications(
  userId: number,
  limit: number = 50
): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(priceDropNotifications)
    .where(eq(priceDropNotifications.userId, userId))
    .orderBy(desc(priceDropNotifications.createdAt))
    .limit(limit);
}

export async function createPriceDropNotification(
  userId: number,
  productId: number,
  platformId: number,
  previousPrice: number,
  newPrice: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const savings = previousPrice - newPrice;
  if (savings <= 0) return false; // Only notify on actual price drops

  await db.insert(priceDropNotifications).values({
    userId,
    productId,
    platformId,
    previousPrice,
    newPrice,
    savings,
  });

  return true;
}

export async function markNotificationAsRead(notificationId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  await db
    .update(priceDropNotifications)
    .set({ isRead: true })
    .where(eq(priceDropNotifications.id, notificationId));

  return true;
}
