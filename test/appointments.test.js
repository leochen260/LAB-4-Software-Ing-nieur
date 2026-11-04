import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../src/app.js'

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
  })

  it('POST /api/appointments should return 400 if a field is missing', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .send({ doctor: 'Dr. Lee' })
    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
  })
})
