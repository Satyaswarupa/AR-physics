import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { Server as SocketIOServer } from 'socket.io'
import mongoose from 'mongoose'
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '.env.local') })

// Import models AFTER env is loaded so MONGODB_URI is available
const { default: Exam } = await import('./models/Exam.js')

const dev = process.env.NODE_ENV !== 'production'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev })
const handle = app.getRequestHandler()

await app.prepare()
await mongoose.connect(process.env.MONGODB_URI)
console.log('[db] Connected to MongoDB')

const httpServer = createServer((req, res) => {
  const parsedUrl = parse(req.url, true)
  handle(req, res, parsedUrl)
})

const io = new SocketIOServer(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
})

// Make io accessible from API route handlers (e.g. to emit on exam create)
globalThis._io = io

// Track which exams have already been announced so we don't spam
const announced = new Set()

io.on('connection', (socket) => {
  // Each student joins a room named after their batchId
  socket.on('join:batch', async (batchId) => {
    if (!batchId) return
    socket.join(`batch:${batchId}`)

    // Immediately push any exams that are ALREADY live for this batch
    // (handles the case where student loads the page after an exam started)
    try {
      const now = new Date()
      const live = await Exam.find({
        batchId,
        startTime: { $lte: now },
        endTime:   { $gte: now },
      }).select('_id title subject')

      for (const exam of live) {
        socket.emit('exam:live', {
          examId:  exam._id.toString(),
          title:   exam.title,
          subject: exam.subject,
        })
      }
    } catch (err) {
      console.error('[socket] join:batch fetch error:', err.message)
    }
  })
})

async function checkLiveExams() {
  try {
    const now = new Date()

    // Find exams whose window is currently open
    const liveExams = await Exam.find({
      startTime: { $lte: now },
      endTime:   { $gte: now },
    }).select('_id title subject batchId')

    for (const exam of liveExams) {
      const id = exam._id.toString()
      if (!announced.has(id)) {
        announced.add(id)
        // Push to every student in this batch
        io.to(`batch:${exam.batchId}`).emit('exam:live', {
          examId:  id,
          title:   exam.title,
          subject: exam.subject,
        })
        console.log(`[socket] exam:live → batch:${exam.batchId} — "${exam.title}"`)
      }
    }

    // Clean up ended exams so the Set doesn't grow forever
    if (announced.size > 0) {
      const ended = await Exam.find({
        _id:     { $in: [...announced] },
        endTime: { $lt: now },
      }).select('_id')
      for (const e of ended) announced.delete(e._id.toString())
    }
  } catch (err) {
    console.error('[socket] checkLiveExams error:', err.message)
  }
}

// Check immediately on boot, then every 30 seconds
checkLiveExams()
setInterval(checkLiveExams, 30_000)

httpServer.listen(port, () => {
  console.log(`> Ready on http://localhost:${port}`)
})
