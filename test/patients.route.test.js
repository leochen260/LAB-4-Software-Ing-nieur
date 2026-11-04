/**
 * Route-level tests for /api/patients (router imported directly,
 * same pattern as info.route.test.js) + validation unit tests.
 */
import express from 'express'
import request from 'supertest'
import { describe, it, expect } from 'vitest'
import router from '../src/routes/auto/patients.route.js'
import { validatePatient } from '../src/utils/patientValidation.js'

function makeApp () {
  const app = express()
  app.use('/', router)
  return app
}

describe('patients route (import direct)', () => {
  it('GET /api/patients returns the patient list', async () => {
    const res = await request(makeApp()).get('/api/patients')
    expect(res.status).toBe(200)
    expect(res.body.length).toBeGreaterThan(0)
    expect(res.body[0]).toEqual(
      expect.objectContaining({ id: expect.any(Number), name: expect.any(String), age: expect.any(Number) })
    )
  })

  it('POST /api/patients creates a patient and adds it to the list', async () => {
    const app = makeApp()
    const res = await request(app)
      .post('/api/patients')
      .send({ name: '  Enzo Blain  ', age: 22 })

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ id: expect.any(Number), name: 'Enzo Blain', age: 22 })

    const list = await request(app).get('/api/patients')
    expect(list.body).toContainEqual(res.body)
  })

  it('POST /api/patients returns 400 when a field is missing', async () => {
    const res = await request(makeApp())
      .post('/api/patients')
      .send({ name: 'No Age' })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/Missing required fields/)
  })

  it('POST /api/patients returns 400 for an invalid age', async () => {
    const res = await request(makeApp())
      .post('/api/patients')
      .send({ name: 'Bad Age', age: -3 })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/age/)
  })
})

describe('validatePatient', () => {
  it('accepts a valid patient', () => {
    expect(validatePatient({ name: 'Alice', age: 30 })).toBeNull()
  })

  it('rejects an empty body', () => {
    expect(validatePatient()).toMatch(/Missing/)
  })

  it('rejects an empty name', () => {
    expect(validatePatient({ name: '   ', age: 30 })).toMatch(/name/)
  })

  it('rejects a non-integer age', () => {
    expect(validatePatient({ name: 'Alice', age: '30' })).toMatch(/age/)
  })
})
