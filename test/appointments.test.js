import { describe, it, expect } from 'vitest'
import express from 'express'
import request from 'supertest'
import router from '../src/routes/auto/appointments.route.js'

const app = express()
app.use(router)

describe('Appointments API', () => {
  it('GET /api/appointments should return an array', async () => {
    const res = await request(app).get('/api/appointments')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('POST /api/appointments should add a new appointment', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .send({ doctor: 'Dr. Lee', patient: 'Alice', date: '2026-11-20' })
    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body.doctor).toBe('Dr. Lee')
  })

  it('POST /api/appointments should return 400 if a field is missing', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .send({ doctor: 'Dr. Lee' })
    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
  })
})
