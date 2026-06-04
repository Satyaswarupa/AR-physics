import mongoose from 'mongoose'

const SubmissionSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [{ type: Number, default: -1 }], // -1 = unanswered
  score: { type: Number, default: 0 },
  startedAt: { type: Date, required: true },
  submittedAt: { type: Date },
  autoSubmitted: { type: Boolean, default: false },
  lastSavedAt: { type: Date },
})

// One submission per student per exam
SubmissionSchema.index({ examId: 1, studentId: 1 }, { unique: true })

export default mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema)
