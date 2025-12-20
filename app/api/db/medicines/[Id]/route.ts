// MongoDB Single Medicine API Route
import { type NextRequest, NextResponse } from "next/server"
import { getMongoDb, ObjectId } from "@/lib/db/mongodb-client"

// GET - Fetch single medicine by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const db = await getMongoDb()

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid medicine ID" }, { status: 400 })
    }

    const medicine = await db.collection("medicines").findOne({ _id: new ObjectId(id) })

    if (!medicine) {
      return NextResponse.json({ message: "Medicine not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...medicine,
      id: medicine._id.toString(),
      _id: undefined,
    })
  } catch (error: any) {
    console.error("[MongoDB] Error fetching medicine:", error)
    return NextResponse.json({ message: error.message || "Failed to fetch medicine" }, { status: 500 })
  }
}
