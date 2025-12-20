// MongoDB Donations API Route
import { type NextRequest, NextResponse } from "next/server"
import { getMongoDb } from "@/lib/db/mongodb-client"

// GET - Fetch all donations
export async function GET() {
  try {
    const db = await getMongoDb()
    const donations = await db.collection("donations").find({}).sort({ createdAt: -1 }).toArray()

    // Transform MongoDB _id to id
    const transformed = donations.map((d) => ({
      ...d,
      id: d._id.toString(),
      _id: undefined,
    }))

    return NextResponse.json(transformed)
  } catch (error: any) {
    console.error("[MongoDB] Error fetching donations:", error)
    return NextResponse.json({ message: error.message || "Failed to fetch donations" }, { status: 500 })
  }
}

// POST - Create new donation
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const db = await getMongoDb()

    const donation = {
      ...data,
      donationId: `DON-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: "pending",
      isReserved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const result = await db.collection("donations").insertOne(donation)

    return NextResponse.json({
      success: true,
      data: { id: result.insertedId.toString() },
      message: "Donation submitted successfully!",
    })
  } catch (error: any) {
    console.error("[MongoDB] Error creating donation:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to create donation" }, { status: 500 })
  }
}
