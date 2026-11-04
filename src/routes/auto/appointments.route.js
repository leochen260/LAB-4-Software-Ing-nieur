import express from 'express'

const router = express.Router()

const appointments = [
  { id: 1, doctor: 'Dr. Sarah Lee', patient: 'Alice', date: '2026-11-15' },
  { id: 2, doctor: 'Dr. Amir Khan', patient: 'John', date: '2026-11-16' }
]

router.get('/api/appointments', (_req, res) => res.status(200).json(appointments))

router.post('/api/appointments', express.json(), (req, res) => {
  const { doctor, patient, date } = req.body || {}
  if (!doctor || !patient || !date) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  const newAppointment = { id: appointments.length + 1, doctor, patient, date }
  appointments.push(newAppointment)
  res.status(201).json(newAppointment)
})

export default router