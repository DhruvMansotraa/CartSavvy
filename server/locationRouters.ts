/**
 * Location-aware tRPC routers
 * Handles city selection, delivery zone management, and location-based pricing
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  getAllCities,
  getDeliveryZonesByCity,
  getPlatformCoverageByZone,
  getUserLocation,
  setUserLocation,
  getLocationMultiplier,
} from "./locationDb";
import { PlatformAggregator } from "./platformAdapters";

export const locationRouter = router({
  /**
   * Get all available cities
   */
  getCities: publicProcedure.query(async () => {
    try {
      const cities = await getAllCities();
      return cities.map((city) => ({
        id: city.id,
        name: city.name,
        code: city.code,
        state: city.state,
        latitude: parseFloat(city.latitude || "0"),
        longitude: parseFloat(city.longitude || "0"),
      }));
    } catch (error) {
      console.error("[LocationRouter] Error getting cities:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch cities",
      });
    }
  }),

  /**
   * Search cities by name or state
   */
  searchCities: publicProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input }) => {
      try {
        const allCities = await getAllCities();
        const query = input.query.toLowerCase();

        return allCities
          .filter(
            (city) =>
              city.name.toLowerCase().includes(query) ||
              city.state.toLowerCase().includes(query)
          )
          .map((city) => ({
            id: city.id,
            name: city.name,
            code: city.code,
            state: city.state,
          }));
      } catch (error) {
        console.error("[LocationRouter] Error searching cities:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to search cities",
        });
      }
    }),

  /**
   * Get delivery zones for a city
   */
  getDeliveryZones: publicProcedure
    .input(z.object({ cityId: z.number() }))
    .query(async ({ input }) => {
      try {
        const zones = await getDeliveryZonesByCity(input.cityId);
        return zones.map((zone) => ({
          id: zone.id,
          pincode: zone.pincode,
          areaName: zone.areaName,
          deliveryTimeMinutes: zone.deliveryTimeMinutes,
          isServiceable: zone.isServiceable,
        }));
      } catch (error) {
        console.error("[LocationRouter] Error getting delivery zones:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch delivery zones",
        });
      }
    }),

  /**
   * Get platform coverage for a delivery zone
   */
  getPlatformCoverage: publicProcedure
    .input(z.object({ deliveryZoneId: z.number() }))
    .query(async ({ input }) => {
      try {
        const coverage = await getPlatformCoverageByZone(input.deliveryZoneId);
        return coverage.map((c) => ({
          platformId: c.platformId,
          deliveryFee: c.deliveryFee,
          freeDeliveryThreshold: c.freeDeliveryThreshold,
          isAvailable: c.isAvailable,
        }));
      } catch (error) {
        console.error("[LocationRouter] Error getting platform coverage:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch platform coverage",
        });
      }
    }),

  /**
   * Get user's current location
   */
  getUserLocation: protectedProcedure.query(async ({ ctx }) => {
    try {
      const location = await getUserLocation(ctx.user.id);

      if (!location) {
        return null;
      }

      return {
        id: location.id,
        cityId: location.cityId,
        deliveryZoneId: location.deliveryZoneId,
        pincode: location.pincode,
        address: location.address,
        city: location.city
          ? {
              id: location.city.id,
              name: location.city.name,
              code: location.city.code,
              state: location.city.state,
            }
          : null,
        zone: location.zone
          ? {
              id: location.zone.id,
              areaName: location.zone.areaName,
              deliveryTimeMinutes: location.zone.deliveryTimeMinutes,
            }
          : null,
      };
    } catch (error) {
      console.error("[LocationRouter] Error getting user location:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch user location",
      });
    }
  }),

  /**
   * Set user location
   */
  setUserLocation: protectedProcedure
    .input(
      z.object({
        cityId: z.number(),
        deliveryZoneId: z.number(),
        pincode: z.string(),
        address: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await setUserLocation(
          ctx.user.id,
          input.cityId,
          input.deliveryZoneId,
          input.pincode,
          input.address
        );

        return {
          success: true,
          message: "Location updated successfully",
        };
      } catch (error) {
        console.error("[LocationRouter] Error setting user location:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update location",
        });
      }
    }),

  /**
   * Get location multiplier for pricing
   */
  getLocationMultiplier: publicProcedure
    .input(z.object({ pincode: z.string() }))
    .query(({ input }) => {
      return {
        pincode: input.pincode,
        multiplier: getLocationMultiplier(input.pincode),
      };
    }),

  /**
   * Search products across all platforms for a location
   */
  searchProductsByLocation: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        pincode: z.string(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      try {
        const aggregator = new PlatformAggregator();
        const results = await aggregator.searchAcrossAllPlatforms(
          input.query,
          input.pincode
        );

        return {
          query: input.query,
          location: input.pincode,
          results: {
            blinkit: results.Blinkit || [],
            zepto: results.Zepto || [],
            instamart: results["Swiggy Instamart"] || [],
          },
        };
      } catch (error) {
        console.error("[LocationRouter] Error searching products:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to search products",
        });
      }
    }),

  /**
   * Compare cart across all platforms for a location
   */
  compareCartByLocation: publicProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.string(),
            quantity: z.number().min(1),
            basePrice: z.number(),
          })
        ),
        pincode: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        if (input.items.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cart cannot be empty",
          });
        }

        const aggregator = new PlatformAggregator();
        const comparisons = await aggregator.compareCartAcrossAllPlatforms(
          input.items,
          input.pincode
        );

        // Sort by final total (cheapest first)
        comparisons.sort((a, b) => a.finalTotal - b.finalTotal);

        return {
          location: input.pincode,
          itemCount: input.items.length,
          comparisons: comparisons.map((c) => ({
            platformName: c.platformName,
            totalPrice: c.totalPrice,
            totalDiscount: c.totalDiscount,
            deliveryFee: c.deliveryFee,
            finalTotal: c.finalTotal,
            estimatedDeliveryTime: c.estimatedDeliveryTime,
            savings: c.savings,
            isCheapest: c.finalTotal === comparisons[0].finalTotal,
          })),
          cheapestPlatform: comparisons[0]?.platformName || null,
          maxSavings: comparisons[0]
            ? comparisons[comparisons.length - 1].finalTotal -
              comparisons[0].finalTotal
            : 0,
        };
      } catch (error) {
        console.error("[LocationRouter] Error comparing cart:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to compare cart",
        });
      }
    }),
});
