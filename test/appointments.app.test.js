import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../src/app.js'

describe('Appointments API through the app', () => {
  it('serves the list of appointments', async () => {
    const res = await request(app).get('/api/appointments')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('creates an appointment', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .send({ doctor: 'Dr. Khan', patient: 'John', date: '2026-12-01' })
    expect(res.status).toBe(201)
    expect(res.body.patient).toBe('John')
  })

  it('rejects an incomplete appointment', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .send({ patient: 'John' })
    expect(res.status).toBe(400)
  })
})
