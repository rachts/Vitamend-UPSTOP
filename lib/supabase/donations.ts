import { getDb, type DonationInput, type Donation, type DbResult } from "@/lib/db"

export type { DonationInput as DonationData }

export async function submitDonation(data: DonationInput): Promise<DbResult<{ id: string }>> {
  const db = await getDb()

  // Handle file uploads if present
  let imageUrls: string[] = []
  if (data.files && data.files.length > 0) {
    imageUrls = await db.uploadMultipleImages(data.files, "donations")
  }

  return db.submitDonation(data, imageUrls)
}

export async function getDonations(): Promise<Donation[]> {
  const db = await getDb()
  return db.getDonations()
}
