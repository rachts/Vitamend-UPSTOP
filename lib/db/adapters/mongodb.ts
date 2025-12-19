// MongoDB Adapter - Server-side implementation
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

const API_BASE = "/api/db"

async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(error.message || `API call failed: ${response.statusText}`)
  }

  return response.json()
}

export const mongodbAdapter: DatabaseAdapter = {
  async initDatabase(): Promise<InitResult> {
    try {
      return await apiCall<InitResult>("/init", { method: "POST" })
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to initialize MongoDB: ${error.message}`,
      }
    }
  },

  // Donations
  async submitDonation(data: DonationInput, imageUrls: string[] = []): Promise<DbResult<{ id: string }>> {
    try {
      return await apiCall<DbResult<{ id: string }>>("/donations", {
        method: "POST",
        body: JSON.stringify({ ...data, imageUrls }),
      })
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  async getDonations(): Promise<Donation[]> {
    try {
      return await apiCall<Donation[]>("/donations")
    } catch {
      return []
    }
  },

  async getDonationById(id: string): Promise<Donation | null> {
    try {
      return await apiCall<Donation>(`/donations/${id}`)
    } catch {
      return null
    }
  },

  async updateDonationStatus(id: string, status: Donation["status"]): Promise<DbResult<void>> {
    try {
      await apiCall(`/donations/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      })
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // Medicines
  async getMedicines(): Promise<Medicine[]> {
    try {
      return await apiCall<Medicine[]>("/medicines")
    } catch {
      return []
    }
  },

  async getMedicineById(id: string): Promise<Medicine | null> {
    try {
      return await apiCall<Medicine>(`/medicines/${id}`)
    } catch {
      return null
    }
  },

  // Volunteers
  async submitVolunteer(data: VolunteerInput): Promise<DbResult<{ id: string }>> {
    try {
      return await apiCall<DbResult<{ id: string }>>("/volunteers", {
        method: "POST",
        body: JSON.stringify(data),
      })
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  async getVolunteers(): Promise<Volunteer[]> {
    try {
      return await apiCall<Volunteer[]>("/volunteers")
    } catch {
      return []
    }
  },

  // Profiles
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      return await apiCall<Profile>(`/profiles/${userId}`)
    } catch {
      return null
    }
  },

  async upsertProfile(profile: Partial<Profile> & { id: string }): Promise<DbResult<void>> {
    try {
      await apiCall(`/profiles/${profile.id}`, {
        method: "PUT",
        body: JSON.stringify(profile),
      })
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // Storage - MongoDB typically uses GridFS or external storage
  async uploadImage(): Promise<string | null> {
    return null // Implement via API route if needed
  },

  async uploadMultipleImages(): Promise<string[]> {
    return []
  },

  async deleteImage(): Promise<boolean> {
    return false
  },
}
