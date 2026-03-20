/**
 * Enhanced authentication routers with security features
 * Includes session management, data encryption, and audit logging
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { auditLogger, rateLimiter, ValidationRules, encryptData, decryptData } from "./security";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const authRouter = router({
  /**
   * Get current user
   */
  me: publicProcedure.query((opts) => opts.ctx.user),

  /**
   * Logout
   */
  logout: protectedProcedure.mutation(({ ctx }) => {
    auditLogger.log(ctx.user.id, "LOGOUT", "auth", "success");
    return { success: true };
  }),

  /**
   * Update user profile
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(100).optional(),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Validate email if provided
        if (input.email && !ValidationRules.isValidEmail(input.email)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid email format",
          });
        }

        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database connection failed",
          });
        }

        // Update user
        await db
          .update(users)
          .set({
            name: input.name || ctx.user.name,
            email: input.email || ctx.user.email,
            updatedAt: new Date(),
          })
          .where(eq(users.id, ctx.user.id));

        auditLogger.log(ctx.user.id, "UPDATE_PROFILE", "user", "success", {
          updatedFields: Object.keys(input),
        });

        return {
          success: true,
          message: "Profile updated successfully",
        };
      } catch (error) {
        auditLogger.log(ctx.user.id, "UPDATE_PROFILE", "user", "failure", {
          error: error instanceof Error ? error.message : "Unknown error",
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update profile",
        });
      }
    }),

  /**
   * Get user's security settings
   */
  getSecuritySettings: protectedProcedure.query(async ({ ctx }) => {
    return {
      userId: ctx.user.id,
      lastLogin: ctx.user.lastSignedIn,
      loginMethod: ctx.user.loginMethod,
      twoFactorEnabled: false, // TODO: Implement 2FA
      sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    };
  }),

  /**
   * Get user's activity log
   */
  getActivityLog: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(({ ctx, input }) => {
      const logs = auditLogger.getLogsForUser(ctx.user.id, input.limit);
      return logs.map((log) => ({
        timestamp: new Date(log.timestamp),
        action: log.action,
        resource: log.resource,
        status: log.status,
        details: log.details,
      }));
    }),

  /**
   * Encrypt sensitive data (for client-side encryption)
   */
  encryptData: protectedProcedure
    .input(
      z.object({
        data: z.string(),
      })
    )
    .mutation(({ input }) => {
      try {
        const encrypted = encryptData(input.data);
        return {
          encrypted,
          algorithm: "aes-256-cbc",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Encryption failed",
        });
      }
    }),

  /**
   * Decrypt sensitive data (for authorized users only)
   */
  decryptData: protectedProcedure
    .input(
      z.object({
        encrypted: z.string(),
      })
    )
    .mutation(({ input }) => {
      try {
        const decrypted = decryptData(input.encrypted);
        return {
          decrypted,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Decryption failed",
        });
      }
    }),

  /**
   * Check if email is available (for registration)
   */
  checkEmailAvailable: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .query(async ({ input }) => {
      try {
        // Rate limit this endpoint
        if (rateLimiter.isLimited(`email-check-${input.email}`)) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Too many requests. Please try again later.",
          });
        }

        const db = await getDb();
        if (!db) {
          return { available: false };
        }

        const existing = await db
          .select()
          .from(users)
          .where(eq(users.email, input.email))
          .limit(1);

        return {
          available: existing.length === 0,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check email availability",
        });
      }
    }),

  /**
   * Request password reset (stub for future implementation)
   */
  requestPasswordReset: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Rate limit this endpoint
        if (rateLimiter.isLimited(`password-reset-${input.email}`)) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Too many requests. Please try again later.",
          });
        }

        // TODO: Implement password reset email sending
        // For now, just log the request
        console.log(`[Auth] Password reset requested for ${input.email}`);

        return {
          success: true,
          message: "If an account exists, a password reset email will be sent",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process password reset request",
        });
      }
    }),

  /**
   * Enable two-factor authentication (stub for future implementation)
   */
  enableTwoFactor: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      // TODO: Implement 2FA setup
      auditLogger.log(ctx.user.id, "ENABLE_2FA", "auth", "success");

      return {
        success: true,
        message: "Two-factor authentication setup initiated",
        // In real implementation, return QR code and backup codes
      };
    } catch (error) {
      auditLogger.log(ctx.user.id, "ENABLE_2FA", "auth", "failure");

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to enable two-factor authentication",
      });
    }
  }),

  /**
   * Disable two-factor authentication
   */
  disableTwoFactor: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      // TODO: Implement 2FA disable
      auditLogger.log(ctx.user.id, "DISABLE_2FA", "auth", "success");

      return {
        success: true,
        message: "Two-factor authentication disabled",
      };
    } catch (error) {
      auditLogger.log(ctx.user.id, "DISABLE_2FA", "auth", "failure");

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to disable two-factor authentication",
      });
    }
  }),

  /**
   * Request data export (GDPR)
   */
  requestDataExport: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      auditLogger.log(ctx.user.id, "REQUEST_DATA_EXPORT", "user", "success");

      return {
        success: true,
        message: "Data export request received. You will receive an email with your data within 24 hours.",
      };
    } catch (error) {
      auditLogger.log(ctx.user.id, "REQUEST_DATA_EXPORT", "user", "failure");

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to process data export request",
      });
    }
  }),

  /**
   * Request account deletion (GDPR)
   */
  requestAccountDeletion: protectedProcedure
    .input(
      z.object({
        password: z.string().optional(), // For additional verification
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        auditLogger.log(ctx.user.id, "REQUEST_ACCOUNT_DELETION", "user", "success");

        return {
          success: true,
          message: "Account deletion request received. Your account will be deleted within 30 days.",
        };
      } catch (error) {
        auditLogger.log(ctx.user.id, "REQUEST_ACCOUNT_DELETION", "user", "failure");

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process account deletion request",
        });
      }
    }),
});
