import { connectDB } from '@/lib/db'
import { getSession } from '@/lib/auth'
import Batch from '@/models/Batch'

// Readable by any authenticated user (admin or teacher need batch list)
export async function GET() {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: 'Unauthenticated' }, { status: 401 })
  }

  await connectDB()
  const batches = await Batch.find().sort({ year: -1, name: 1 })
  return Response.json({ batches })
}
