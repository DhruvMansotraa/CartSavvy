/**
 * Location-aware database helpers
 * Manages cities, delivery zones, platform coverage, and location-based pricing
 */

import { getDb } from "./db";
import {
  cities,
  deliveryZones,
  platformCoverage,
  locationPricing,
  userLocations,
  platforms,
  InsertCity,
  InsertDeliveryZone,
  InsertPlatformCoverage,
  InsertLocationPricing,
  InsertUserLocation,
} from "../drizzle/schema";
import { CITIES, DELIVERY_ZONES, LOCATION_MULTIPLIERS } from "./catalogData";
import { eq, and } from "drizzle-orm";

/**
 * Seed cities into database
 */
export async function seedCities(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    for (const city of CITIES) {
      const cityData: InsertCity = {
        name: city.name,
        code: city.code,
        state: city.state,
        latitude: city.latitude.toString(),
        longitude: city.longitude.toString(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.insert(cities).values(cityData).onDuplicateKeyUpdate({
        set: {
          state: city.state,
          latitude: city.latitude.toString(),
          longitude: city.longitude.toString(),
          updatedAt: new Date(),
        },
      });
    }

    console.log(`[LocationDB] Seeded ${CITIES.length} cities`);
  } catch (error) {
    console.error("[LocationDB] Error seeding cities:", error);
    throw error;
  }
}

/**
 * Seed delivery zones into database
 */
export async function seedDeliveryZones(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    for (const zone of DELIVERY_ZONES) {
      // Get city ID
      const cityRecord = await db
        .select()
        .from(cities)
        .where(eq(cities.code, zone.cityCode))
        .limit(1);

      if (cityRecord.length === 0) {
        console.warn(`[LocationDB] City not found for code: ${zone.cityCode}`);
        continue;
      }

      const zoneData: InsertDeliveryZone = {
        cityId: cityRecord[0].id,
        pincode: zone.pincode,
        areaName: zone.areaName,
        deliveryTimeMinutes: zone.deliveryTimeMinutes,
        isServiceable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.insert(deliveryZones).values(zoneData).onDuplicateKeyUpdate({
        set: {
          areaName: zone.areaName,
          deliveryTimeMinutes: zone.deliveryTimeMinutes,
          updatedAt: new Date(),
        },
      });
    }

    console.log(`[LocationDB] Seeded ${DELIVERY_ZONES.length} delivery zones`);
  } catch (error) {
    console.error("[LocationDB] Error seeding delivery zones:", error);
    throw error;
  }
}

/**
 * Seed platform coverage (which platforms operate in which zones)
 */
export async function seedPlatformCoverage(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    const platformNames = ["Blinkit", "Zepto", "Swiggy Instamart"];
    const deliveryFees = {
      Blinkit: 4000, // ₹40
      Zepto: 5000, // ₹50
      "Swiggy Instamart": 6000, // ₹60
    };
    const freeDeliveryThresholds = {
      Blinkit: 20000, // ₹200
      Zepto: 25000, // ₹250
      "Swiggy Instamart": 30000, // ₹300
    };

    // Get all delivery zones
    const allZones = await db.select().from(deliveryZones);

    for (const platform of platformNames) {
      // Get platform ID
      const platformRecord = await db
        .select()
        .from(platforms)
        .where(eq(platforms.name, platform))
        .limit(1);

      if (platformRecord.length === 0) {
        console.warn(`[LocationDB] Platform not found: ${platform}`);
        continue;
      }

      if (!platformRecord[0]) continue;
      const platformId = platformRecord[0].id;

      // Add coverage for all zones
      for (const zone of allZones) {
        const coverageData: InsertPlatformCoverage = {
          platformId,
          deliveryZoneId: zone.id,
          deliveryFee: deliveryFees[platform as keyof typeof deliveryFees] || 5000,
          freeDeliveryThreshold:
            freeDeliveryThresholds[platform as keyof typeof freeDeliveryThresholds] || 25000,
          isAvailable: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await db.insert(platformCoverage).values(coverageData).onDuplicateKeyUpdate({
          set: {
            deliveryFee: deliveryFees[platform as keyof typeof deliveryFees] || 5000,
            updatedAt: new Date(),
          },
        });
      }
    }

    console.log(
      `[LocationDB] Seeded platform coverage for ${platformNames.length} platforms across ${allZones.length} zones`
    );
  } catch (error) {
    console.error("[LocationDB] Error seeding platform coverage:", error);
    throw error;
  }
}

/**
 * Get user's location with delivery zone details
 */
export async function getUserLocation(userId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const userLoc = await db
      .select()
      .from(userLocations)
      .where(eq(userLocations.userId, userId))
      .limit(1);

    if (userLoc.length === 0) return null;

    const zone = await db
      .select()
      .from(deliveryZones)
      .where(eq(deliveryZones.id, userLoc[0].deliveryZoneId))
      .limit(1);

    const city = await db
      .select()
      .from(cities)
      .where(eq(cities.id, userLoc[0].cityId))
      .limit(1);

    return {
      ...userLoc[0],
      zone: zone[0] || null,
      city: city[0] || null,
    };
  } catch (error) {
    console.error("[LocationDB] Error getting user location:", error);
    return null;
  }
}

/**
 * Set user location
 */
export async function setUserLocation(
  userId: number,
  cityId: number,
  deliveryZoneId: number,
  pincode: string,
  address?: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    const locationData: InsertUserLocation = {
      userId,
      cityId,
      deliveryZoneId,
      pincode,
      address,
      isPrimary: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(userLocations).values(locationData).onDuplicateKeyUpdate({
      set: {
        cityId,
        deliveryZoneId,
        pincode,
        address,
        updatedAt: new Date(),
      },
    });

    console.log(`[LocationDB] Set location for user ${userId}`);
  } catch (error) {
    console.error("[LocationDB] Error setting user location:", error);
    throw error;
  }
}

/**
 * Get delivery zones for a city
 */
export async function getDeliveryZonesByCity(cityId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(deliveryZones).where(eq(deliveryZones.cityId, cityId));
  } catch (error) {
    console.error("[LocationDB] Error getting delivery zones:", error);
    return [];
  }
}

/**
 * Get platform coverage for a delivery zone
 */
export async function getPlatformCoverageByZone(deliveryZoneId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(platformCoverage)
      .where(eq(platformCoverage.deliveryZoneId, deliveryZoneId));
  } catch (error) {
    console.error("[LocationDB] Error getting platform coverage:", error);
    return [];
  }
}

/**
 * Get location multiplier for pricing
 */
export function getLocationMultiplier(pincode: string): number {
  return LOCATION_MULTIPLIERS[pincode] || 1.0;
}

/**
 * Search cities by name or state
 */
export async function searchCities(query: string) {
  const db = await getDb();
  if (!db) return [];

  try {
    const searchTerm = `%${query}%`;
    // Note: This is a simplified search - in production use full-text search
    return await db
      .select()
      .from(cities)
      .where(eq(cities.isActive, true));
  } catch (error) {
    console.error("[LocationDB] Error searching cities:", error);
    return [];
  }
}

/**
 * Get all active cities
 */
export async function getAllCities() {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(cities).where(eq(cities.isActive, true));
  } catch (error) {
    console.error("[LocationDB] Error getting cities:", error);
    return [];
  }
}

/**
 * Initialize location data (seed all tables)
 */
export async function initializeLocationData(): Promise<void> {
  try {
    console.log("[LocationDB] Initializing location data...");
    await seedCities();
    await seedDeliveryZones();
    await seedPlatformCoverage();
    console.log("[LocationDB] Location data initialization complete");
  } catch (error) {
    console.error("[LocationDB] Error initializing location data:", error);
    throw error;
  }
}
