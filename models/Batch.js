import mongoose from 'mongoose'

const BatchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String },
  year: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.Batch || mongoose.model('Batch', BatchSchema)
