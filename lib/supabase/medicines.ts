import { getDb, type Medicine } from "@/lib/db"

export type { Medicine }

export async function getMedicines(): Promise<Medicine[]> {
  const db = await getDb()
  return db.getMedicines()
}

export async function getMedicineById(id: string): Promise<Medicine | null> {
  const db = await getDb()
  return db.getMedicineById(id)
}

// Subscribe to real-time changes - only works with Supabase provider
export function subscribeToMedicinesChanges(callback: (medicines: Medicine[]) => void) {
  // Initial fetch using abstraction
  getMedicines().then(callback)

  // For real-time, we need to check if using Supabase
  if (process.env.NEXT_PUBLIC_DB_PROVIDER === "supabase" || !process.env.NEXT_PUBLIC_DB_PROVIDER) {
    // Dynamic import to avoid bundling if not used
    import("./client").then(({ createClient }) => {
      const supabase = createClient()

      const channel = supabase
        .channel("medicines-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "medicines",
          },
          () => {
            getMedicines().then(callback)
          },
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    })
  }

  // Return empty cleanup for non-Supabase providers
  return () => {}
}
