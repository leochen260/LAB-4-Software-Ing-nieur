import request from 'supertest'
import { describe, expect, it } from 'vitest'
import app from '../src/app.js'

const validModel = {
  brand: 'ASUS',
  model: 'ROG Strix G16',
  machine_type: 'laptop',
  ddr_generation: 'DDR5',
  form_factor: 'SO-DIMM',
  slots: 2,
  max_capacity_gb: 64,
  max_speed_mhz: 4800
}

describe('machine models through the application', () => {
  it('lists the machine models', async () => {
    const res = await request(app).get('/api/machine-models').expect(200).expect('Content-Type', /json/)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('runs a full create, read, update, delete cycle', async () => {
    const created = await request(app).post('/api/machine-models').send(validModel).expect(201)
    const url = `/api/machine-models/${created.body.id}`

    const read = await request(app).get(url).expect(200)
    expect(read.body.brand).toBe('ASUS')

    const updated = await request(app).put(url).send({ max_speed_mhz: 5200 }).expect(200)
    expect(updated.body.max_speed_mhz).toBe(5200)

    await request(app).delete(url).expect(204)
    await request(app).get(url).expect(404)
  })

  it('rejects an invalid machine model with a 400', async () => {
    const res = await request(app)
      .post('/api/machine-models')
      .send({ ...validModel, ddr_generation: 'DDR2' })
      .expect(400)
    expect(res.body).toHaveProperty('error')
  })

  it('returns 404 for an unknown machine model', async () => {
    await request(app).get('/api/machine-models/999999').expect(404)
    await request(app).put('/api/machine-models/999999').send({ slots: 4 }).expect(404)
    await request(app).delete('/api/machine-models/999999').expect(404)
  })
})
