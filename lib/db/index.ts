import { DB_PROVIDER, type DatabaseProvider } from "./config"
import type { DatabaseAdapter, InitResult } from "./types"

// Re-export types for convenience
export * from "./types"
export { DB_PROVIDER } from "./config"

// Lazy load adapters to avoid importing all providers
async function loadAdapter(provider: DatabaseProvider): Promise<DatabaseAdapter> {
  switch (provider) {
    case "supabase": {
      const { supabaseAdapter } = await import("./adapters/supabase")
      return supabaseAdapter
    }
    case "firebase": {
      const { firebaseAdapter } = await import("./adapters/firebase")
      return firebaseAdapter
    }
    case "mongodb": {
      const { mongodbAdapter } = await import("./adapters/mongodb")
      return mongodbAdapter
    }
    case "mysql": {
      const { mysqlAdapter } = await import("./adapters/mysql")
      return mysqlAdapter
    }
    case "mock": {
      const { mockAdapter } = await import("./adapters/mock")
      return mockAdapter
    }
    default:
      throw new Error(`Unknown database provider: ${provider}`)
  }
}

// Cached adapter instance
let cachedAdapter: DatabaseAdapter | null = null
let cachedProvider: DatabaseProvider | null = null

export async function getDb(): Promise<DatabaseAdapter> {
  if (cachedAdapter && cachedProvider === DB_PROVIDER) {
    return cachedAdapter
  }

  cachedAdapter = await loadAdapter(DB_PROVIDER)
  cachedProvider = DB_PROVIDER
  return cachedAdapter
}

// Synchronous getter for use in client components (returns cached or throws)
export function getDbSync(): DatabaseAdapter {
  if (!cachedAdapter) {
    throw new Error("Database not initialized. Call getDb() first.")
  }
  return cachedAdapter
}

export async function initializeDatabase(): Promise<InitResult> {
  const db = await getDb()
  return db.initDatabase()
}

// Initialize on module load for common cases
if (typeof window !== "undefined") {
  // Client-side: eagerly load the adapter
  getDb().catch(console.error)
}
