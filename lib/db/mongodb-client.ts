// MongoDB Client - Server-side only
import { MongoClient, type Db, ObjectId } from "mongodb"
import { DB_CONFIG } from "./config"

let client: MongoClient | null = null
let db: Db | null = null

export async function getMongoDb(): Promise<Db> {
  if (db) return db

  const uri = DB_CONFIG.mongodb.uri
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set")
  }

  client = new MongoClient(uri)
  await client.connect()
  db = client.db(DB_CONFIG.mongodb.dbName)

  return db
}

export async function closeMongoDb(): Promise<void> {
  if (client) {
    await client.close()
    client = null
    db = null
  }
}

export { ObjectId }
