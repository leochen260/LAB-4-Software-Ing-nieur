/**
 * GET  /api/doctors → list of all doctors
 * POST /api/doctors → adds a doctor from { name, specialty }
 * Data is kept in memory, so it resets when the server restarts.
 */
import { Router } from 'express'
import { doctors } from '../../data/hospital.js'

const router = Router()

router.get('/api/doctors', (_req, res) => {
  res.status(200).json(doctors)
})

router.post('/api/doctors', (req, res) => {
  const { name, specialty } = req.body
  if (!name || !specialty) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  const newDoctor = { id: doctors.length + 1, name, specialty }
  doctors.push(newDoctor)
  res.status(201).json(newDoctor)
})

export default router
