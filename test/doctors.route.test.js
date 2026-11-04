/**
 * Direct-import tests for the doctors router.
 * Routes auto-mounted by app.js are loaded with require(), which the coverage
 * tool measures incorrectly, so this file imports the router itself.
 */
import { describe, it, expect } from 'vitest'
import express from 'express'
import request from 'supertest'
import router from '../src/routes/auto/doctors.route.js'

function createApp () {
  const app = express()
  app.use(express.json())
  app.use('/', router)
  return app
}

describe('doctors route (direct import)', () => {
  it('GET /api/doctors returns the initial doctors', async () => {
    const res = await request(createApp()).get('/api/doctors')

    expect(res.status).toBe(200)
    expect(res.body).toContainEqual({ id: 1, name: 'Dr. Sarah Lee', specialty: 'Cardiology' })
  })

  it('POST /api/doctors creates a doctor with a new id', async () => {
    const res = await request(createApp())
      .post('/api/doctors')
      .send({ name: 'Dr. Julie', specialty: 'Neurology' })

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ name: 'Dr. Julie', specialty: 'Neurology' })
    expect(res.body.id).toBeGreaterThan(2)
  })

  it('POST /api/doctors returns 400 when a field is missing', async () => {
    const res = await request(createApp())
      .post('/api/doctors')
      .send({ name: 'Dr. Julie' })

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'Missing required fields' })
  })
})
