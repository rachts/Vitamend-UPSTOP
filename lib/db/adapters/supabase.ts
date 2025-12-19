import { createBrowserClient } from "@supabase/ssr"
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

const BUCKET_NAME = "medicine-images"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

function getClient() {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  return supabaseClient
}

function isTableNotFoundError(error: any): boolean {
  const errorMessage = error?.message || error?.toString() || ""
  return (
    errorMessage.includes("schema cache") ||
    errorMessage.includes("relation") ||
    errorMessage.includes("does not exist") ||
    error?.code === "42P01" ||
    error?.code === "PGRST116"
  )
}

export const supabaseAdapter: DatabaseAdapter = {
  async initDatabase(): Promise<InitResult> {
    const supabase = getClient()

    try {
      // Check if tables already exist by querying the profiles table
      const { error: checkError } = await supabase.from("profiles").select("id").limit(1)

      if (!checkError || !isTableNotFoundError(checkError)) {
        return {
          success: true,
          message: "Database is already initialized.",
          alreadyInitialized: true,
        }
      }

      // Tables don't exist - create them using raw SQL via RPC
      // Note: This requires a Supabase function to be set up, or manual table creation
      // For Supabase, tables are typically created via migrations or the dashboard

      // We'll create tables via individual insert attempts which will fail gracefully
      // The actual table creation should be done via SQL migrations

      const createTableSQL = `
        -- Profiles table
        CREATE TABLE IF NOT EXISTS public.profiles (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          email TEXT NOT NULL,
          name TEXT,
          avatar_url TEXT,
          role TEXT DEFAULT 'donor',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Donations table
        CREATE TABLE IF NOT EXISTS public.donations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          medicine_name TEXT NOT NULL,
          brand TEXT NOT NULL,
          generic_name TEXT,
          dosage TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          expiry_date DATE NOT NULL,
          condition TEXT NOT NULL,
          category TEXT NOT NULL,
          donor_name TEXT NOT NULL,
          donor_email TEXT NOT NULL,
          donor_phone TEXT NOT NULL,
          donor_address TEXT NOT NULL,
          notes TEXT,
          image_urls TEXT[] DEFAULT '{}',
          status TEXT DEFAULT 'pending',
          verified BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Medicines table
        CREATE TABLE IF NOT EXISTS public.medicines (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          brand TEXT NOT NULL,
          generic_name TEXT,
          dosage TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          expiry_date DATE NOT NULL,
          category TEXT NOT NULL,
          condition TEXT NOT NULL,
          available BOOLEAN DEFAULT TRUE,
          verified BOOLEAN DEFAULT FALSE,
          image_urls TEXT[] DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Volunteers table
        CREATE TABLE IF NOT EXISTS public.volunteers (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          full_name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          address TEXT NOT NULL,
          date_of_birth DATE,
          occupation TEXT,
          experience TEXT,
          availability TEXT,
          role TEXT,
          motivation TEXT,
          emergency_contact TEXT,
          emergency_phone TEXT,
          has_transport BOOLEAN DEFAULT FALSE,
          can_lift BOOLEAN DEFAULT FALSE,
          medical_conditions TEXT,
          "references" TEXT,
          status TEXT DEFAULT 'pending',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Enable RLS
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY IF NOT EXISTS "Public read access for medicines" ON public.medicines FOR SELECT USING (true);
        CREATE POLICY IF NOT EXISTS "Public read access for donations" ON public.donations FOR SELECT USING (true);
        CREATE POLICY IF NOT EXISTS "Public insert for donations" ON public.donations FOR INSERT WITH CHECK (true);
        CREATE POLICY IF NOT EXISTS "Public insert for volunteers" ON public.volunteers FOR INSERT WITH CHECK (true);
        CREATE POLICY IF NOT EXISTS "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
        CREATE POLICY IF NOT EXISTS "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
      `

      // Try to execute via RPC if available
      const { error: rpcError } = await supabase.rpc("exec_sql", { sql: createTableSQL })

      if (rpcError) {
        // RPC not available - return instructions for manual setup
        return {
          success: false,
          message:
            "Supabase requires manual table creation. Please run the SQL migration script in scripts/001-create-tables.sql via the Supabase SQL Editor or run it from this project.",
        }
      }

      return {
        success: true,
        message: "Database tables created successfully!",
        alreadyInitialized: false,
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to initialize database: ${error.message}`,
      }
    }
  },

  // Donations
  async submitDonation(data: DonationInput, imageUrls: string[] = []): Promise<DbResult<{ id: string }>> {
    const supabase = getClient()

    try {
      const { data: donation, error } = await supabase
        .from("donations")
        .insert({
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
        })
        .select()
        .single()

      if (error) {
        if (isTableNotFoundError(error)) {
          return {
            success: false,
            error: "Database tables not set up. Please run the setup scripts first.",
          }
        }
        throw new Error(error.message)
      }

      return {
        success: true,
        data: { id: donation.id },
        message: "Donation submitted successfully!",
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  async getDonations(): Promise<Donation[]> {
    const supabase = getClient()
    const { data, error } = await supabase.from("donations").select("*").order("created_at", { ascending: false })

    if (error) {
      if (isTableNotFoundError(error)) {
        return []
      }
      console.error("Error fetching donations:", error)
      return []
    }
    return data || []
  },

  async getDonationById(id: string): Promise<Donation | null> {
    const supabase = getClient()
    const { data, error } = await supabase.from("donations").select("*").eq("id", id).single()

    if (error) return null
    return data
  },

  async updateDonationStatus(id: string, status: Donation["status"]): Promise<DbResult<void>> {
    const supabase = getClient()
    const { error } = await supabase.from("donations").update({ status }).eq("id", id)

    if (error) {
      if (isTableNotFoundError(error)) {
        return { success: false, error: "Database tables not set up. Please run the setup scripts first." }
      }
      return { success: false, error: error.message }
    }
    return { success: true }
  },

  // Medicines
  async getMedicines(): Promise<Medicine[]> {
    const supabase = getClient()
    const { data, error } = await supabase
      .from("medicines")
      .select("*")
      .eq("available", true)
      .order("created_at", { ascending: false })

    if (error) {
      if (isTableNotFoundError(error)) {
        return []
      }
      console.error("Error fetching medicines:", error)
      return []
    }
    return data || []
  },

  async getMedicineById(id: string): Promise<Medicine | null> {
    const supabase = getClient()
    const { data, error } = await supabase.from("medicines").select("*").eq("id", id).single()

    if (error) return null
    return data
  },

  // Volunteers
  async submitVolunteer(data: VolunteerInput): Promise<DbResult<{ id: string }>> {
    const supabase = getClient()

    try {
      const { data: volunteer, error } = await supabase
        .from("volunteers")
        .insert({
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
        })
        .select()
        .single()

      if (error) {
        if (isTableNotFoundError(error)) {
          return {
            success: false,
            error: "Database tables not set up. Please run the setup scripts first.",
          }
        }
        throw new Error(error.message)
      }

      return {
        success: true,
        data: { id: volunteer.id },
        message: "Application submitted successfully!",
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  async getVolunteers(): Promise<Volunteer[]> {
    const supabase = getClient()
    const { data, error } = await supabase.from("volunteers").select("*").order("created_at", { ascending: false })

    if (error) {
      if (isTableNotFoundError(error)) {
        return []
      }
      console.error("Error fetching volunteers:", error)
      return []
    }
    return data || []
  },

  // Profiles
  async getProfile(userId: string): Promise<Profile | null> {
    const supabase = getClient()
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) return null
    return data
  },

  async upsertProfile(profile: Partial<Profile> & { id: string }): Promise<DbResult<void>> {
    const supabase = getClient()
    const { error } = await supabase.from("profiles").upsert(profile)

    if (error) {
      if (isTableNotFoundError(error)) {
        return { success: false, error: "Database tables not set up. Please run the setup scripts first." }
      }
      return { success: false, error: error.message }
    }
    return { success: true }
  },

  // Storage
  async uploadImage(file: File, folder = "donations"): Promise<string | null> {
    const supabase = getClient()
    const fileExt = file.name.split(".").pop()
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Error uploading image:", error)
      return null
    }

    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path)
    return urlData.publicUrl
  },

  async uploadMultipleImages(files: File[], folder = "donations"): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadImage(file, folder))
    const results = await Promise.all(uploadPromises)
    return results.filter((url): url is string => url !== null)
  },

  async deleteImage(imageUrl: string): Promise<boolean> {
    const supabase = getClient()
    const urlParts = imageUrl.split(`${BUCKET_NAME}/`)
    if (urlParts.length < 2) return false

    const path = urlParts[1]
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([path])

    return !error
  },
}
