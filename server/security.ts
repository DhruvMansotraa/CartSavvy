/**
 * Security utilities for data encryption and session management
 * Protects sensitive user data and ensures secure session handling
 */

import crypto from "crypto";

const ENCRYPTION_ALGORITHM = "aes-256-cbc";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);

/**
 * Encrypt sensitive data
 * @param data - Data to encrypt
 * @returns Encrypted data with IV
 */
export function encryptData(data: string): string {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, iv);

    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");

    // Return IV + encrypted data
    return iv.toString("hex") + ":" + encrypted;
  } catch (error) {
    console.error("[Security] Encryption failed:", error);
    throw new Error("Failed to encrypt data");
  }
}

/**
 * Decrypt sensitive data
 * @param encryptedData - Encrypted data with IV
 * @returns Decrypted data
 */
export function decryptData(encryptedData: string): string {
  try {
    const [ivHex, encrypted] = encryptedData.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, iv);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("[Security] Decryption failed:", error);
    throw new Error("Failed to decrypt data");
  }
}

/**
 * Hash sensitive data (one-way)
 * @param data - Data to hash
 * @returns Hashed data
 */
export function hashData(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Generate secure random token
 * @param length - Token length in bytes
 * @returns Random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Validate session token
 * @param token - Session token to validate
 * @returns Whether token is valid
 */
export function isValidSessionToken(token: string): boolean {
  // Token should be 64 characters (32 bytes in hex)
  return /^[a-f0-9]{64}$/.test(token);
}

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isLimited(key: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record || now > record.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + this.windowMs });
      return false;
    }

    record.count++;
    return record.count > this.maxAttempts;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

/**
 * Input validation helpers
 */
export const ValidationRules = {
  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 320;
  },

  /**
   * Validate phone number (Indian format)
   */
  isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\D/g, ""));
  },

  /**
   * Validate pincode (Indian format)
   */
  isValidPincode(pincode: string): boolean {
    const pincodeRegex = /^\d{6}$/;
    return pincodeRegex.test(pincode);
  },

  /**
   * Validate password strength
   */
  isStrongPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongRegex.test(password);
  },

  /**
   * Sanitize user input
   */
  sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, "") // Remove potential HTML tags
      .substring(0, 1000); // Limit length
  },
};

/**
 * CORS and security headers
 */
export const SecurityHeaders = {
  /**
   * Get security headers for responses
   */
  getHeaders() {
    return {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
      "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
    };
  },

  /**
   * Check CORS origin
   */
  isAllowedOrigin(origin: string): boolean {
    const allowedOrigins = [
      process.env.FRONTEND_URL || "http://localhost:3000",
      process.env.APP_URL || "http://localhost:3000",
    ];
    return allowedOrigins.includes(origin);
  },
};

/**
 * Session management
 */
export class SessionManager {
  private sessions: Map<string, { userId: number; createdAt: number; expiresAt: number }> =
    new Map();
  private sessionTimeout: number;

  constructor(sessionTimeout: number = 24 * 60 * 60 * 1000) {
    // 24 hours
    this.sessionTimeout = sessionTimeout;
  }

  /**
   * Create new session
   */
  createSession(userId: number): string {
    const token = generateSecureToken();
    const now = Date.now();

    this.sessions.set(token, {
      userId,
      createdAt: now,
      expiresAt: now + this.sessionTimeout,
    });

    return token;
  }

  /**
   * Validate session
   */
  validateSession(token: string): { userId: number } | null {
    const session = this.sessions.get(token);

    if (!session) {
      return null;
    }

    if (Date.now() > session.expiresAt) {
      this.sessions.delete(token);
      return null;
    }

    return { userId: session.userId };
  }

  /**
   * Destroy session
   */
  destroySession(token: string): void {
    this.sessions.delete(token);
  }

  /**
   * Cleanup expired sessions
   */
  cleanupExpiredSessions(): void {
    const now = Date.now();
    const tokensToDelete: string[] = [];
    this.sessions.forEach((session, token) => {
      if (now > session.expiresAt) {
        tokensToDelete.push(token);
      }
    });
    tokensToDelete.forEach((token) => this.sessions.delete(token));
  }
}

/**
 * Audit logging
 */
export class AuditLogger {
  private logs: Array<{
    timestamp: number;
    userId: number;
    action: string;
    resource: string;
    status: "success" | "failure";
    details?: Record<string, unknown>;
  }> = [];

  /**
   * Log action
   */
  log(
    userId: number,
    action: string,
    resource: string,
    status: "success" | "failure",
    details?: Record<string, unknown>
  ): void {
    this.logs.push({
      timestamp: Date.now(),
      userId,
      action,
      resource,
      status,
      details,
    });

    // Keep only last 10000 logs in memory
    if (this.logs.length > 10000) {
      this.logs = this.logs.slice(-10000);
    }

    console.log(`[Audit] ${action} on ${resource} by user ${userId}: ${status}`);
  }

  /**
   * Get logs for user
   */
  getLogsForUser(userId: number, limit: number = 100) {
    return this.logs.filter((log) => log.userId === userId).slice(-limit);
  }

  /**
   * Get all logs
   */
  getAllLogs(limit: number = 1000) {
    return this.logs.slice(-limit);
  }
}

// Export singleton instances
export const auditLogger = new AuditLogger();
export const sessionManager = new SessionManager();
export const rateLimiter = new RateLimiter(5, 60000); // 5 attempts per minute
