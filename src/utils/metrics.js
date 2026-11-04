import os from 'node:os'
import { formatStatus } from './status.js'

export function getMetrics () {
  const uptime = os.uptime()
  return { uptime, memory: process.memoryUsage.rss(), status: formatStatus(uptime) }
}
