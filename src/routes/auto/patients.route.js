/**
 * Patient Management
 *  - GET  /api/patients → list every patient
 *  - POST /api/patients → add a patient { name, age }
 * Data is kept in memory (no database yet).
 */
import express, { Router } from 'express'
import { validatePatient } from '../../utils/patientValidation.js'
import { patients } from '../../data/hospital.js'

const router = Router()

router.get('/api/patients', (_req, res) => {
  res.status(200).json(patients)
})

// express.json() is applied here so this route does not depend on app.js
router.post('/api/patients', express.json(), (req, res) => {
  const error = validatePatient(req.body)
  if (error) {
    res.status(400).json({ error })
  } else {
    const newPatient = { id: patients.length + 1, name: req.body.name.trim(), age: req.body.age }
    patients.push(newPatient)
    res.status(201).json(newPatient)
  }
})

export default router
