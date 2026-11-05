import express from 'express'
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import router from '../src/routes/auto/machine-models.route.js'

const app = express().use(express.json()).use(router)

const validModel = {
  brand: 'HP',
  model: 'EliteBook 840 G9',
  machine_type: 'laptop',
  ddr_generation: 'DDR5',
  form_factor: 'SO-DIMM',
  slots: 2,
  max_capacity_gb: 64,
  max_speed_mhz: 4800
}

async function createModel (overrides = {}) {
  const res = await request(app).post('/api/machine-models').send({ ...validModel, ...overrides })
  return res
}

describe('machine models router', () => {
  it('GET /api/machine-models returns an array', async () => {
    const res = await request(app).get('/api/machine-models').expect(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThanOrEqual(2)
  })

  it('GET /api/machine-models/:id returns one machine model', async () => {
    const res = await request(app).get('/api/machine-models/1').expect(200)
    expect(res.body).toHaveProperty('id', 1)
    expect(res.body).toHaveProperty('ddr_generation')
  })

  it('GET /api/machine-models/:id returns 404 for an unknown id', async () => {
    const res = await request(app).get('/api/machine-models/999999').expect(404)
    expect(res.body).toHaveProperty('error')
  })

  it('POST creates a machine model and ignores a client-supplied id', async () => {
    const res = await createModel({ id: 999999 })
    expect(res.status).toBe(201)
    expect(res.body.id).not.toBe(999999)
    expect(res.body.model).toBe(validModel.model)
  })

  it('POST returns 400 when a required field is missing', async () => {
    const res = await request(app).post('/api/machine-models').send({ brand: 'HP' }).expect(400)
    expect(res.body.error).toMatch(/Missing required fields/)
  })

  it('POST returns 400 for an unknown DDR generation', async () => {
    const res = await createModel({ ddr_generation: 'DDR2' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Invalid ddr_generation')
  })

  it('POST returns 400 for an unknown machine type', async () => {
    const res = await createModel({ machine_type: 'tablet' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Invalid machine_type')
  })

  it('POST returns 400 when the form factor does not match the machine type', async () => {
    const res = await createModel({ machine_type: 'desktop', form_factor: 'SO-DIMM' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('form_factor does not match machine_type')
  })

  it.each([0, -2, 1.5, '4'])('POST returns 400 for invalid slots %j', async slots => {
    const res = await createModel({ slots })
    expect(res.status).toBe(400)
  })

  it('PUT updates a machine model', async () => {
    const created = await createModel()
    const res = await request(app)
      .put(`/api/machine-models/${created.body.id}`)
      .send({ max_capacity_gb: 32 })
      .expect(200)
    expect(res.body.max_capacity_gb).toBe(32)
    expect(res.body.id).toBe(created.body.id)
  })

  it('PUT returns 404 for an unknown id', async () => {
    await request(app).put('/api/machine-models/999999').send({ slots: 4 }).expect(404)
  })

  it('PUT returns 400 when the update makes the model invalid', async () => {
    const created = await createModel()
    const res = await request(app)
      .put(`/api/machine-models/${created.body.id}`)
      .send({ ddr_generation: 'DDR2' })
      .expect(400)
    expect(res.body.error).toBe('Invalid ddr_generation')
  })

  it('DELETE removes a machine model', async () => {
    const created = await createModel()
    await request(app).delete(`/api/machine-models/${created.body.id}`).expect(204)
    await request(app).get(`/api/machine-models/${created.body.id}`).expect(404)
  })

  it('DELETE returns 404 for an unknown id', async () => {
    await request(app).delete('/api/machine-models/999999').expect(404)
  })
})
