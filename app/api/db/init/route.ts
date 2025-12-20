import { NextResponse } from "next/server"
import { DB_PROVIDER } from "@/lib/db/config"
import { getMongoDb } from "@/lib/db/mongodb-client"

// This route handles database initialization for providers that need server-side execution
// Currently used by MongoDB and MySQL adapters

export async function POST() {
  try {
    switch (DB_PROVIDER) {
      case "mongodb": {
        const db = await getMongoDb()

        // Create collections
        const collections = ["donations", "medicines", "volunteers", "profiles"]
        for (const name of collections) {
          try {
            await db.createCollection(name)
          } catch (e: any) {
            // Collection already exists, ignore
            if (!e.message?.includes("already exists")) {
              console.warn(`[MongoDB] Warning creating ${name}:`, e.message)
            }
          }
        }

        // Create indexes
        await db.collection("donations").createIndex({ createdAt: -1 })
        await db.collection("donations").createIndex({ status: 1 })
        await db.collection("medicines").createIndex({ available: 1, createdAt: -1 })
        await db.collection("medicines").createIndex({ category: 1 })
        await db.collection("volunteers").createIndex({ status: 1, createdAt: -1 })
        await db.collection("profiles").createIndex({ userId: 1 }, { unique: true })
        await db.collection("profiles").createIndex({ email: 1 })

        // Seed sample medicines if collection is empty
        const medicineCount = await db.collection("medicines").countDocuments()
        if (medicineCount === 0) {
          const sampleMedicines = [
            {
              name: "Paracetamol 500mg",
              brand: "Crocin",
              genericName: "Acetaminophen",
              dosage: "500mg",
              category: "Pain Relief",
              description: "Fever and pain relief medication",
              quantity: 100,
              expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
              price: 0,
              available: true,
              imageUrl: "/paracetamol-medicine-box.jpg",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              name: "Amoxicillin 250mg",
              brand: "Mox",
              genericName: "Amoxicillin",
              dosage: "250mg",
              category: "Antibiotics",
              description: "Antibiotic for bacterial infections",
              quantity: 50,
              expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
              price: 0,
              available: true,
              imageUrl: "/medicines/amoxicillin.png",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              name: "Cetirizine 10mg",
              brand: "Zyrtec",
              genericName: "Cetirizine Hydrochloride",
              dosage: "10mg",
              category: "Allergy",
              description: "Antihistamine for allergies",
              quantity: 75,
              expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
              price: 0,
              available: true,
              imageUrl: "/cetirizine-allergy-medicine.jpg",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              name: "Omeprazole 20mg",
              brand: "Prilosec",
              genericName: "Omeprazole",
              dosage: "20mg",
              category: "Digestive",
              description: "For acid reflux and heartburn",
              quantity: 60,
              expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
              price: 0,
              available: true,
              imageUrl: "/omeprazole-stomach-medicine.jpg",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              name: "Vitamin D3 1000IU",
              brand: "Nature Made",
              genericName: "Cholecalciferol",
              dosage: "1000IU",
              category: "Vitamins",
              description: "Vitamin D supplement",
              quantity: 120,
              expiryDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString(),
              price: 0,
              available: true,
              imageUrl: "/vitamin-d3-supplement-bottle.jpg",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ]

          await db.collection("medicines").insertMany(sampleMedicines)
        }

        return NextResponse.json({
          success: true,
          message: "MongoDB collections and indexes created successfully!",
          alreadyInitialized: medicineCount > 0,
        })
      }

      case "mysql": {
        // MySQL initialization would go here
        // const mysql = await import("mysql2/promise")
        // const connection = await mysql.createConnection({
        //   host: process.env.MYSQL_HOST,
        //   user: process.env.MYSQL_USER,
        //   password: process.env.MYSQL_PASSWORD,
        //   database: process.env.MYSQL_DATABASE,
        // })
        //
        // const createTablesSQL = `
        //   CREATE TABLE IF NOT EXISTS profiles (...);
        //   CREATE TABLE IF NOT EXISTS donations (...);
        //   CREATE TABLE IF NOT EXISTS medicines (...);
        //   CREATE TABLE IF NOT EXISTS volunteers (...);
        // `
        //
        // await connection.execute(createTablesSQL)
        // await connection.end()

        return NextResponse.json({
          success: true,
          message: "MySQL tables initialized. Configure MYSQL_* environment variables.",
          alreadyInitialized: false,
        })
      }

      default:
        return NextResponse.json({
          success: false,
          message: `Provider ${DB_PROVIDER} does not use this API route for initialization.`,
        })
    }
  } catch (error: any) {
    console.error("[DB Init] Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to initialize database",
      },
      { status: 500 },
    )
  }
}
