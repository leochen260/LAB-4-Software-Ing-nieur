/**
 * Integration tests for /api/doctors.
 * Focus: status codes, payload shape and input validation.
 */
import request from 'supertest'
import app from '../src/app.js'
import { describe, it, expect } from 'vitest'

describe('Doctors API', () => {
  it('GET /api/doctors should return an array', async () => {
    const res = await request(app).get('/api/doctors')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('POST /api/doctors should add a new doctor', async () => {
    const res = await request(app)
      .post('/api/doctors')
      .send({ name: 'Dr. Julie', specialty: 'Neurology' })
    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body.name).toBe('Dr. Julie')
    expect(res.body.specialty).toBe('Neurology')

    const list = await request(app).get('/api/doctors')
    expect(list.body).toContainEqual(res.body)
  })

  it('POST /api/doctors should reject a missing name', async () => {
    const res = await request(app)
      .post('/api/doctors')
      .send({ specialty: 'Neurology' })
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'Missing required fields' })
  })

  it('POST /api/doctors should reject a missing specialty', async () => {
    const res = await request(app)
      .post('/api/doctors')
      .send({ name: 'Dr. Julie' })
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'Missing required fields' })
  })
})
