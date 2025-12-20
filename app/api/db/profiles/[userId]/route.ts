// MongoDB Profiles API Route
import { type NextRequest, NextResponse } from "next/server"
import { getMongoDb } from "@/lib/db/mongodb-client"

// GET - Fetch profile by user ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params
    const db = await getMongoDb()

    const profile = await db.collection("profiles").findOne({ userId })

    if (!profile) {
      return NextResponse.json({ message: "Profile not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...profile,
      id: profile._id.toString(),
      _id: undefined,
    })
  } catch (error: any) {
    console.error("[MongoDB] Error fetching profile:", error)
    return NextResponse.json({ message: error.message || "Failed to fetch profile" }, { status: 500 })
  }
}

// PUT - Upsert profile
export async function PUT(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params
    const data = await request.json()
    const db = await getMongoDb()

    const result = await db.collection("profiles").updateOne(
      { userId },
      {
        $set: {
          ...data,
          userId,
          updatedAt: new Date().toISOString(),
        },
        $setOnInsert: {
          createdAt: new Date().toISOString(),
        },
      },
      { upsert: true },
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[MongoDB] Error updating profile:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to update profile" }, { status: 500 })
  }
}
