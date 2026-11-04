/**
 * Integration tests for the Patient Management API (/api/patients),
 * through the main Express app (auto-mounted route).
 */
import request from 'supertest'
import { describe, it, expect } from 'vitest'
import app from '../src/app.js'

describe('Patients API', () => {
  it('GET /api/patients should return an array', async () => {
    const res = await request(app).get('/api/patients')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('POST /api/patients should add a new patient', async () => {
    const res = await request(app)
      .post('/api/patients')
      .send({ name: 'Enzo Blain', age: 22 })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
  })

  it.each([
    [{ name: 'No Age' }, /Missing required fields/],
    [{ name: '  ', age: 30 }, /name/],
    [{ name: 'Bad Age', age: -3 }, /age/]
  ])('POST /api/patients with %j should return 400', async (body, message) => {
    const res = await request(app).post('/api/patients').send(body)
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(message)
  })
})
