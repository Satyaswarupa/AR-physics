import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'teacher', 'student'], required: true },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  rollNumber: { type: String },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.User || mongoose.model('User', UserSchema)
