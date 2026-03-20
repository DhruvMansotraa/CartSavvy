/**
 * Initialization Script
 * Runs on server startup to seed mock data if database is empty
 */

import { initializeMockData } from "./aggregator";

export async function initializeApp() {
  try {
    console.log("[Init] Starting application initialization...");

    // Initialize mock data
    await initializeMockData();

    console.log("[Init] Application initialization complete");
  } catch (error) {
    console.error("[Init] Error during initialization:", error);
    // Don't throw - allow app to continue even if init fails
  }
}
