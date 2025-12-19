import type {
  DatabaseAdapter,
  Donation,
  DonationInput,
  Medicine,
  Volunteer,
  VolunteerInput,
  Profile,
  DbResult,
  InitResult,
} from "../types"

// In-memory storage for mock data
const mockDonations: Donation[] = []
const mockMedicines: Medicine[] = []
const mockVolunteers: Volunteer[] = []
const mockProfiles: Map<string, Profile> = new Map()
const mockImages: Map<string, string> = new Map()
let mockInitialized = false

function generateId(): string {
  return `mock-${Date.now()}-${Math.random().toString(36).substring(7)}`
}

export const mockAdapter: DatabaseAdapter = {
  async initDatabase(): Promise<InitResult> {
    if (mockInitialized) {
      return {
        success: true,
        message: "Mock database is already initialized.",
        alreadyInitialized: true,
      }
    }

    // Add some sample data
    const sampleMedicines: Medicine[] = [
      {
        id: generateId(),
        name: "Paracetamol 500mg",
        brand: "Calpol",
        generic_name: "Paracetamol",
        dosage: "500mg",
        quantity: 100,
        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        category: "Pain Relief",
        condition: "New",
        available: true,
        verified: true,
        image_urls: [],
        created_at: new Date().toISOString(),
      },
      {
        id: generateId(),
        name: "Amoxicillin 250mg",
        brand: "Amoxil",
        generic_name: "Amoxicillin",
        dosage: "250mg",
        quantity: 50,
        expiry_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        category: "Antibiotics",
        condition: "New",
        available: true,
        verified: true,
        image_urls: [],
        created_at: new Date().toISOString(),
      },
    ]

    mockMedicines.push(...sampleMedicines)
    mockInitialized = true

    return {
      success: true,
      message: "Mock database initialized with sample data!",
      alreadyInitialized: false,
    }
  },

  // Donations
  async submitDonation(data: DonationInput, imageUrls: string[] = []): Promise<DbResult<{ id: string }>> {
    const id = generateId()
    const donation: Donation = {
      id,
      medicine_name: data.medicineName,
      brand: data.brand,
      generic_name: data.genericName || null,
      dosage: data.dosage,
      quantity: data.quantity,
      expiry_date: data.expiryDate,
      condition: data.condition,
      category: data.category,
      donor_name: data.donorName,
      donor_email: data.donorEmail,
      donor_phone: data.donorPhone,
      donor_address: data.donorAddress,
      notes: data.notes || null,
      image_urls: imageUrls,
      status: "pending",
      verified: false,
      created_at: new Date().toISOString(),
    }
    mockDonations.unshift(donation)
    return { success: true, data: { id }, message: "Donation submitted successfully!" }
  },

  async getDonations(): Promise<Donation[]> {
    return [...mockDonations]
  },

  async getDonationById(id: string): Promise<Donation | null> {
    return mockDonations.find((d) => d.id === id) || null
  },

  async updateDonationStatus(id: string, status: Donation["status"]): Promise<DbResult<void>> {
    const donation = mockDonations.find((d) => d.id === id)
    if (donation) {
      donation.status = status
      return { success: true }
    }
    return { success: false, error: "Donation not found" }
  },

  // Medicines
  async getMedicines(): Promise<Medicine[]> {
    return mockMedicines.filter((m) => m.available)
  },

  async getMedicineById(id: string): Promise<Medicine | null> {
    return mockMedicines.find((m) => m.id === id) || null
  },

  // Volunteers
  async submitVolunteer(data: VolunteerInput): Promise<DbResult<{ id: string }>> {
    const id = generateId()
    const volunteer: Volunteer = {
      id,
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      date_of_birth: data.dateOfBirth || null,
      occupation: data.occupation || null,
      experience: data.experience || null,
      availability: data.availability || null,
      role: data.role || null,
      motivation: data.motivation || null,
      emergency_contact: data.emergencyContact || null,
      emergency_phone: data.emergencyPhone || null,
      has_transport: data.hasTransport || false,
      can_lift: data.canLift || false,
      medical_conditions: data.medicalConditions || null,
      references: data.references || null,
      status: "pending",
      created_at: new Date().toISOString(),
    }
    mockVolunteers.unshift(volunteer)
    return { success: true, data: { id }, message: "Application submitted successfully!" }
  },

  async getVolunteers(): Promise<Volunteer[]> {
    return [...mockVolunteers]
  },

  // Profiles
  async getProfile(userId: string): Promise<Profile | null> {
    return mockProfiles.get(userId) || null
  },

  async upsertProfile(profile: Partial<Profile> & { id: string }): Promise<DbResult<void>> {
    const existing = mockProfiles.get(profile.id)
    mockProfiles.set(profile.id, {
      id: profile.id,
      email: profile.email || existing?.email || "",
      name: profile.name ?? existing?.name,
      avatar_url: profile.avatar_url ?? existing?.avatar_url,
      role: profile.role || existing?.role || "donor",
      created_at: existing?.created_at || new Date().toISOString(),
    })
    return { success: true }
  },

  // Storage
  async uploadImage(file: File, folder = "donations"): Promise<string | null> {
    const id = generateId()
    const mockUrl = `https://mock-storage.local/${folder}/${id}-${file.name}`
    mockImages.set(mockUrl, file.name)
    return mockUrl
  },

  async uploadMultipleImages(files: File[], folder = "donations"): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadImage(file, folder))
    const results = await Promise.all(uploadPromises)
    return results.filter((url): url is string => url !== null)
  },

  async deleteImage(imageUrl: string): Promise<boolean> {
    if (mockImages.has(imageUrl)) {
      mockImages.delete(imageUrl)
      return true
    }
    return false
  },
}
