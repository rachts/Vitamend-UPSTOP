// MongoDB Medicines API Route
import { type NextRequest, NextResponse } from "next/server"
import { getMongoDb } from "@/lib/db/mongodb-client"

// GET - Fetch all medicines
export async function GET() {
  try {
    const db = await getMongoDb()
    const medicines = await db.collection("medicines").find({ available: true }).sort({ createdAt: -1 }).toArray()

    // Transform MongoDB _id to id
    const transformed = medicines.map((m) => ({
      ...m,
      id: m._id.toString(),
      _id: undefined,
    }))

    return NextResponse.json(transformed)
  } catch (error: any) {
    console.error("[MongoDB] Error fetching medicines:", error)
    return NextResponse.json({ message: error.message || "Failed to fetch medicines" }, { status: 500 })
  }
}

// POST - Create new medicine
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const db = await getMongoDb()

    const medicine = {
      ...data,
      available: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const result = await db.collection("medicines").insertOne(medicine)

    return NextResponse.json({
      success: true,
      data: { id: result.insertedId.toString() },
    })
  } catch (error: any) {
    console.error("[MongoDB] Error creating medicine:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to create medicine" }, { status: 500 })
  }
}
