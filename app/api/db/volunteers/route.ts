// MongoDB Volunteers API Route
import { type NextRequest, NextResponse } from "next/server"
import { getMongoDb } from "@/lib/db/mongodb-client"

// GET - Fetch all volunteers
export async function GET() {
  try {
    const db = await getMongoDb()
    const volunteers = await db.collection("volunteers").find({}).sort({ createdAt: -1 }).toArray()

    // Transform MongoDB _id to id
    const transformed = volunteers.map((v) => ({
      ...v,
      id: v._id.toString(),
      _id: undefined,
    }))

    return NextResponse.json(transformed)
  } catch (error: any) {
    console.error("[MongoDB] Error fetching volunteers:", error)
    return NextResponse.json({ message: error.message || "Failed to fetch volunteers" }, { status: 500 })
  }
}

// POST - Create new volunteer
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const db = await getMongoDb()

    const volunteer = {
      ...data,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const result = await db.collection("volunteers").insertOne(volunteer)

    return NextResponse.json({
      success: true,
      data: { id: result.insertedId.toString() },
      message: "Volunteer application submitted successfully!",
    })
  } catch (error: any) {
    console.error("[MongoDB] Error creating volunteer:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit volunteer application" },
      { status: 500 },
    )
  }
}
