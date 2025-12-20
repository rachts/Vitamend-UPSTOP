// MongoDB Donation Status Update API Route
import { type NextRequest, NextResponse } from "next/server"
import { getMongoDb, ObjectId } from "@/lib/db/mongodb-client"

// PATCH - Update donation status
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { status } = await request.json()
    const db = await getMongoDb()

    const query: any = {}
    if (ObjectId.isValid(id)) {
      query._id = new ObjectId(id)
    } else {
      query.donationId = id
    }

    const result = await db.collection("donations").updateOne(query, {
      $set: {
        status,
        updatedAt: new Date().toISOString(),
      },
    })

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: "Donation not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[MongoDB] Error updating donation status:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to update status" }, { status: 500 })
  }
}
