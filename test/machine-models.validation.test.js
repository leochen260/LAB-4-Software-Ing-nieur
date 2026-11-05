import request from 'supertest'
import { describe, expect, it } from 'vitest'
import app from '../src/app.js'

const validModel = {
  brand: 'MSI',
  model: 'Katana 15',
  machine_type: 'laptop',
  ddr_generation: 'DDR5',
  form_factor: 'SO-DIMM',
  slots: 2,
  max_capacity_gb: 64,
  max_speed_mhz: 4800
}

describe('machine models validation through the application', () => {
  it('rejects a machine model with missing fields', async () => {
    const res = await request(app).post('/api/machine-models').send({ brand: 'MSI' }).expect(400)
    expect(res.body.error).toMatch(/Missing required fields/)
  })

  it('rejects an unknown machine type', async () => {
    const res = await request(app)
      .post('/api/machine-models')
      .send({ ...validModel, machine_type: 'tablet' })
      .expect(400)
    expect(res.body.error).toBe('Invalid machine_type')
  })

  it('rejects a form factor that does not match the machine type', async () => {
    const res = await request(app)
      .post('/api/machine-models')
      .send({ ...validModel, machine_type: 'desktop' })
      .expect(400)
    expect(res.body.error).toBe('form_factor does not match machine_type')
  })

  it.each([0, -2, 1.5, '4'])('rejects invalid slots %j', async slots => {
    await request(app).post('/api/machine-models').send({ ...validModel, slots }).expect(400)
  })

  it('rejects an update that makes the model invalid', async () => {
    const created = await request(app).post('/api/machine-models').send(validModel).expect(201)
    const res = await request(app)
      .put(`/api/machine-models/${created.body.id}`)
      .send({ ddr_generation: 'DDR2' })
      .expect(400)
    expect(res.body.error).toBe('Invalid ddr_generation')
  })

  it('ignores a client-supplied id and unknown fields', async () => {
    const res = await request(app)
      .post('/api/machine-models')
      .send({ ...validModel, id: 999999, color: 'red' })
      .expect(201)
    expect(res.body.id).not.toBe(999999)
    expect(res.body).not.toHaveProperty('color')
  })
})
