import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { locationRouter } from "./locationRouters";
import { authRouter } from "./authRouters";
import {
  searchProductsAcrossPlatforms,
  getProductPricesAcrossPlatforms,
  compareCartAcrossPlatforms,
  getRecommendations,
  findBestDeals,
  getTrendingProducts,
  initializeMockData,
} from "./aggregator";
import {
  getUserCart,
  getCartItems,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  getSavedProducts,
  saveProduct,
  removeSavedProduct,
  getUserPreferences,
  updateUserPreferences,
  getUserNotifications,
  createPriceDropNotification,
  markNotificationAsRead,
  getProductById,
  getProductCategories,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  location: locationRouter,
  auth: authRouter,

  /**
   * PRODUCT SEARCH & DISCOVERY
   */
  products: router({
    /**
     * Search for products across all platforms
     */
    search: publicProcedure
      .input(
        z.object({
          query: z.string().min(1).max(100),
          category: z.string().optional(),
          limit: z.number().int().min(1).max(100).default(20),
        })
      )
      .query(async ({ input }) => {
        try {
          return await searchProductsAcrossPlatforms(
            input.query,
            input.category,
            input.limit
          );
        } catch (error) {
          console.error("[Router] Product search error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to search products",
          });
        }
      }),

    /**
     * Get product details with pricing across all platforms
     */
    getDetails: publicProcedure
      .input(z.object({ productId: z.number().int().positive() }))
      .query(async ({ input }) => {
        try {
          const product = await getProductById(input.productId);
          if (!product) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Product not found",
            });
          }

          const prices = await getProductPricesAcrossPlatforms(input.productId);

          return {
            ...product,
            keywords: product.keywords ? JSON.parse(product.keywords) : [],
            prices,
          };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("[Router] Get product details error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get product details",
          });
        }
      }),

    /**
     * Get all product categories
     */
    getCategories: publicProcedure.query(async () => {
      try {
        return await getProductCategories();
      } catch (error) {
        console.error("[Router] Get categories error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get categories",
        });
      }
    }),

    /**
     * Get trending products
     */
    getTrending: publicProcedure
      .input(z.object({ limit: z.number().int().min(1).max(50).default(10) }))
      .query(async ({ input }) => {
        try {
          return await getTrendingProducts(input.limit);
        } catch (error) {
          console.error("[Router] Get trending products error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get trending products",
          });
        }
      }),

    /**
     * Get best deals (highest discounts)
     */
    getBestDeals: publicProcedure
      .input(z.object({ limit: z.number().int().min(1).max(50).default(10) }))
      .query(async ({ input }) => {
        try {
          return await findBestDeals(input.limit);
        } catch (error) {
          console.error("[Router] Get best deals error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get best deals",
          });
        }
      }),
  }),

  /**
   * CART MANAGEMENT
   */
  cart: router({
    /**
     * Get user's active cart
     */
    getCart: protectedProcedure.query(async ({ ctx }) => {
      try {
        const cart = await getUserCart(ctx.user.id, true);
        if (!cart) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get or create cart",
          });
        }

        const items = await getCartItems(cart.id);

        // Enrich items with product and pricing info
        const enrichedItems = await Promise.all(
          items.map(async (item) => {
            const product = await getProductById(item.productId);
            const prices = await getProductPricesAcrossPlatforms(item.productId);

            return {
              ...item,
              product,
              prices,
            };
          })
        );

        return {
          ...cart,
          items: enrichedItems,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Router] Get cart error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get cart",
        });
      }
    }),

    /**
     * Add item to cart
     */
    addItem: protectedProcedure
      .input(
        z.object({
          productId: z.number().int().positive(),
          quantity: z.number().int().min(1).max(100),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const cart = await getUserCart(ctx.user.id, true);
          if (!cart) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to get cart",
            });
          }

          const product = await getProductById(input.productId);
          if (!product) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Product not found",
            });
          }

          await addToCart(cart.id, input.productId, input.quantity);

          return { success: true, message: "Item added to cart" };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("[Router] Add to cart error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to add item to cart",
          });
        }
      }),

    /**
     * Update item quantity in cart
     */
    updateQuantity: protectedProcedure
      .input(
        z.object({
          cartItemId: z.number().int().positive(),
          quantity: z.number().int().min(0).max(100),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await updateCartItemQuantity(input.cartItemId, input.quantity);
          return { success: true, message: "Quantity updated" };
        } catch (error) {
          console.error("[Router] Update quantity error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update quantity",
          });
        }
      }),

    /**
     * Remove item from cart
     */
    removeItem: protectedProcedure
      .input(z.object({ cartItemId: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        try {
          await removeFromCart(input.cartItemId);
          return { success: true, message: "Item removed from cart" };
        } catch (error) {
          console.error("[Router] Remove from cart error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to remove item from cart",
          });
        }
      }),

    /**
     * Clear entire cart
     */
    clear: protectedProcedure.mutation(async ({ ctx }) => {
      try {
        const cart = await getUserCart(ctx.user.id, false);
        if (cart) {
          await clearCart(cart.id);
        }
        return { success: true, message: "Cart cleared" };
      } catch (error) {
        console.error("[Router] Clear cart error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to clear cart",
        });
      }
    }),
  }),

  /**
   * CART COMPARISON
   */
  comparison: router({
    /**
     * Compare cart prices across all platforms
     */
    compareCart: protectedProcedure.query(async ({ ctx }) => {
      try {
        const cart = await getUserCart(ctx.user.id, false);
        if (!cart) {
          return [];
        }

        const items = await getCartItems(cart.id);
        if (items.length === 0) {
          return [];
        }

        const cartItems = items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        }));

        return await compareCartAcrossPlatforms(cartItems);
      } catch (error) {
        console.error("[Router] Compare cart error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to compare cart",
        });
      }
    }),
  }),

  /**
   * SAVED PRODUCTS & WATCHLIST
   */
  saved: router({
    /**
     * Get user's saved products
     */
    getList: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await getSavedProducts(ctx.user.id);
      } catch (error) {
        console.error("[Router] Get saved products error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get saved products",
        });
      }
    }),

    /**
     * Save a product
     */
    save: protectedProcedure
      .input(
        z.object({
          productId: z.number().int().positive(),
          preferredPlatformId: z.number().int().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          await saveProduct(
            ctx.user.id,
            input.productId,
            input.preferredPlatformId
          );
          return { success: true, message: "Product saved" };
        } catch (error) {
          console.error("[Router] Save product error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to save product",
          });
        }
      }),

    /**
     * Remove saved product
     */
    remove: protectedProcedure
      .input(z.object({ productId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        try {
          await removeSavedProduct(ctx.user.id, input.productId);
          return { success: true, message: "Product removed from saved" };
        } catch (error) {
          console.error("[Router] Remove saved product error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to remove saved product",
          });
        }
      }),
  }),

  /**
   * RECOMMENDATIONS
   */
  recommendations: router({
    /**
     * Get product recommendations for a category
     */
    getForCategory: publicProcedure
      .input(
        z.object({
          category: z.string().min(1).max(100),
          limit: z.number().int().min(1).max(20).default(5),
        })
      )
      .query(async ({ input }) => {
        try {
          return await getRecommendations(input.category, input.limit);
        } catch (error) {
          console.error("[Router] Get recommendations error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get recommendations",
          });
        }
      }),
  }),

  /**
   * USER PREFERENCES
   */
  preferences: router({
    /**
     * Get user preferences
     */
    get: protectedProcedure.query(async ({ ctx }) => {
      try {
        const prefs = await getUserPreferences(ctx.user.id);
        if (!prefs) {
          return {
            userId: ctx.user.id,
            preferredCategories: [],
            preferredPlatforms: [],
            budgetPreference: "medium",
            showRecommendations: true,
            enablePriceAlerts: true,
          };
        }
        return {
          ...prefs,
          preferredCategories: prefs.preferredCategories
            ? JSON.parse(prefs.preferredCategories)
            : [],
          preferredPlatforms: prefs.preferredPlatforms
            ? JSON.parse(prefs.preferredPlatforms)
            : [],
        };
      } catch (error) {
        console.error("[Router] Get preferences error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get preferences",
        });
      }
    }),

    /**
     * Update user preferences
     */
    update: protectedProcedure
      .input(
        z.object({
          preferredCategories: z.array(z.string()).optional(),
          preferredPlatforms: z.array(z.string()).optional(),
          budgetPreference: z.enum(["low", "medium", "high"]).optional(),
          showRecommendations: z.boolean().optional(),
          enablePriceAlerts: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const updateData: any = { ...input };
          if (input.preferredCategories) {
            updateData.preferredCategories = JSON.stringify(
              input.preferredCategories
            );
          }
          if (input.preferredPlatforms) {
            updateData.preferredPlatforms = JSON.stringify(
              input.preferredPlatforms
            );
          }

          await updateUserPreferences(ctx.user.id, updateData);
          return { success: true, message: "Preferences updated" };
        } catch (error) {
          console.error("[Router] Update preferences error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update preferences",
          });
        }
      }),
  }),

  /**
   * NOTIFICATIONS
   */
  notifications: router({
    /**
     * Get user's price drop notifications
     */
    getList: protectedProcedure
      .input(z.object({ limit: z.number().int().min(1).max(100).default(50) }))
      .query(async ({ ctx, input }) => {
        try {
          return await getUserNotifications(ctx.user.id, input.limit);
        } catch (error) {
          console.error("[Router] Get notifications error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get notifications",
          });
        }
      }),

    /**
     * Mark notification as read
     */
    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        try {
          await markNotificationAsRead(input.notificationId);
          return { success: true, message: "Notification marked as read" };
        } catch (error) {
          console.error("[Router] Mark notification as read error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to mark notification as read",
          });
        }
      }),
  }),

  /**
   * ADMIN: Initialize mock data
   */
  admin: router({
    initializeMockData: protectedProcedure.mutation(async ({ ctx }) => {
      // Only allow admin users
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can initialize mock data",
        });
      }

      try {
        await initializeMockData();
        return { success: true, message: "Mock data initialized" };
      } catch (error) {
        console.error("[Router] Initialize mock data error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to initialize mock data",
        });
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
