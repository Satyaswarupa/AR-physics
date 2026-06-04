// Local dev cron runner. Call /api/cron/auto-submit every 60 seconds.
// Run with: node scripts/cron-dev.js
// Requires CRON_SECRET and APP_URL in .env.local

import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const CRON_SECRET = process.env.CRON_SECRET
const APP_URL = process.env.APP_URL || 'http://localhost:3000'
const ENDPOINT = `${APP_URL}/api/cron/auto-submit`

async function run() {
  try {
    const res = await fetch(ENDPOINT, {
      headers: { Authorization: `Bearer ${CRON_SECRET}` },
    })
    const data = await res.json()
    console.log(`[cron] ${new Date().toISOString()} processed=${data.processed}`)
  } catch (err) {
    console.error('[cron] error:', err.message)
  }
}

console.log(`[cron] Starting — hitting ${ENDPOINT} every 60s`)
run()
setInterval(run, 60_000)
