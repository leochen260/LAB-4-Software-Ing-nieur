import request from 'supertest'
import { describe, it, expect } from 'vitest'
import app from '../src/app.js'

const sample = {
  status: 'pending',
  deliveryMethod: 'standard',
  items: [{ productId: 1, quantity: 2 }],
  total: 120
}

describe('Orders API', () => {
  it('GET /api/orders returns an array', async () => {
    const res = await request(app).get('/api/orders')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('POST creates an order and GET retrieves it by ID', async () => {
    const created = await request(app).post('/api/orders').send(sample)
    expect(created.status).toBe(201)
    expect(created.body).toMatchObject(sample)
    expect(created.body).toHaveProperty('id')
    const found = await request(app).get('/api/orders/' + created.body.id)
    expect(found.status).toBe(200)
    expect(found.body).toEqual(created.body)
  })

  it('PUT replaces an existing order while preserving ID', async () => {
    const created = await request(app).post('/api/orders').send(sample)
    const updated = { ...sample, status: 'shipped', deliveryMethod: 'express', total: 150 }
    const res = await request(app).put('/api/orders/' + created.body.id).send(updated)
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ id: created.body.id, ...updated })
  })

  it('DELETE removes an order', async () => {
    const created = await request(app).post('/api/orders').send(sample)
    const removed = await request(app).delete('/api/orders/' + created.body.id)
    expect(removed.status).toBe(204)
    const missing = await request(app).get('/api/orders/' + created.body.id)
    expect(missing.status).toBe(404)
  })

  it.each(['get', 'put', 'delete'])('%s on unknown order returns 404', async method => {
    const req = request(app)[method]('/api/orders/999999')
    const res = method === 'put' ? await req.send(sample) : await req
    expect(res.status).toBe(404)
  })

  it.each([
    [{ ...sample, status: 'unknown' }],
    [{ ...sample, deliveryMethod: 'drone' }],
    [{ ...sample, items: [] }],
    [{ ...sample, items: [{ productId: 1, quantity: 0 }] }],
    [{ ...sample, total: -1 }],
    [{}]
  ])('POST rejects invalid order %j', async body => {
    const res = await request(app).post('/api/orders').send(body)
    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
  })

  it('PUT rejects invalid order data', async () => {
    const res = await request(app).put('/api/orders/1').send({ ...sample, status: 'invalid' })
    expect(res.status).toBe(400)
  })
})
