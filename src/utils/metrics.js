import os from 'node:os'
import { formatStatus } from './status.js'
import { doctors, patients, appointments } from '../data/hospital.js'

export function getMetrics () {
  const uptime = os.uptime()
  return {
    uptime,
    memory: process.memoryUsage.rss(),
    status: formatStatus(uptime),
    hospital: { doctors: doctors.length, patients: patients.length, appointments: appointments.length }
  }
}
