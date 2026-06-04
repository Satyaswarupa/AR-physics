// Run: node scripts/seed.js
// Creates the initial admin user. Requires MONGODB_URI in .env

import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error('MONGODB_URI not found. Create .env.local from .env.example')
  process.exit(1)
}

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  role: String,
  batchId: mongoose.Schema.Types.ObjectId,
  rollNumber: String,
  createdAt: { type: Date, default: Date.now },
})

async function seed() {
  await mongoose.connect(MONGODB_URI)

  const User = mongoose.models.User || mongoose.model('User', UserSchema)

  const existing = await User.findOne({ email: 'admin@arphysics.com' })
  if (existing) {
    console.log('Admin already exists:', existing.email)
    await mongoose.disconnect()
    return
  }

  const password = await bcrypt.hash('admin123', 10)
  const admin = await User.create({
    name: 'AR Physics Admin',
    email: 'admin@arphysics.com',
    password,
    role: 'admin',
  })

  console.log('Admin created:', admin.email)
  console.log('Password: admin123  (change this immediately!)')
  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
