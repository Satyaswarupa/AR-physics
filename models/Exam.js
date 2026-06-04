import mongoose from 'mongoose'

const QuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: { type: [String], required: true, validate: (v) => v.length === 4 },
  correctOption: { type: Number, required: true, min: 0, max: 3 },
  marks: { type: Number, required: true, default: 1 },
})

const ExamSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, enum: ['Math', 'Physics', 'Chemistry'], required: true },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  durationMinutes: { type: Number, required: true },
  totalMarks: { type: Number, default: 0 },
  questions: [QuestionSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
})

// Auto-compute totalMarks before save
ExamSchema.pre('save', async function () {
  this.totalMarks = this.questions.reduce((sum, q) => sum + q.marks, 0)
})

export default mongoose.models.Exam || mongoose.model('Exam', ExamSchema)
