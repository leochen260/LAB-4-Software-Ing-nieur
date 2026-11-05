/**
 * Integration tests for /api/categories through the full app.
 * Focus: status codes, payload shape and the full CRUD flow.
 */
import request from 'supertest'
import app from '../src/app.js'
import { describe, it, expect } from 'vitest'

describe('Categories API', () => {
  it('GET /api/categories should return an array', async () => {
    const res = await request(app).get('/api/categories')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
  })

  it('GET /api/categories/:id should return one category', async () => {
    const res = await request(app).get('/api/categories/1')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('id', 1)
    expect(res.body).toHaveProperty('name')
  })

  it('GET /api/categories/:id should return 404 for an unknown id', async () => {
    const res = await request(app).get('/api/categories/9999')
    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: 'Category not found' })
  })

  it('supports the full create, update and delete flow', async () => {
    const created = await request(app).post('/api/categories').send({ name: 'Server ECC (app)' })
    expect(created.status).toBe(201)
    expect(created.body).toHaveProperty('id')
    expect(created.body).toMatchObject({ name: 'Server ECC (app)', description: '', is_active: true })

    const id = created.body.id

    const updated = await request(app).put(`/api/categories/${id}`).send({ description: 'ECC RDIMM' })
    expect(updated.status).toBe(200)
    expect(updated.body).toMatchObject({ id, name: 'Server ECC (app)', description: 'ECC RDIMM' })

    const deleted = await request(app).delete(`/api/categories/${id}`)
    expect(deleted.status).toBe(204)

    const afterDelete = await request(app).get(`/api/categories/${id}`)
    expect(afterDelete.status).toBe(404)
  })

  it('POST /api/categories should reject a missing name', async () => {
    const res = await request(app).post('/api/categories').send({ description: 'No name' })
    expect(res.status).toBe(400)
  })
})
