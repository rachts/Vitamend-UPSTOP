// MongoDB Single Donation API Route
import { type NextRequest, NextResponse } from "next/server"
import { getMongoDb, ObjectId } from "@/lib/db/mongodb-client"

// GET - Fetch single donation by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const db = await getMongoDb()

    const query: any = {}
    if (ObjectId.isValid(id)) {
      query._id = new ObjectId(id)
    } else {
      query.donationId = id
    }

    const donation = await db.collection("donations").findOne(query)

    if (!donation) {
      return NextResponse.json({ message: "Donation not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...donation,
      id: donation._id.toString(),
      _id: undefined,
    })
  } catch (error: any) {
    console.error("[MongoDB] Error fetching donation:", error)
    return NextResponse.json({ message: error.message || "Failed to fetch donation" }, { status: 500 })
  }
}
