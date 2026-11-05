/**
 * Integration tests for /api/products through the full app.
 * Focus: status codes, payload shape and the full CRUD flow.
 */
import request from 'supertest'
import app from '../src/app.js'
import { describe, it, expect } from 'vitest'

const newProduct = {
  category_id: 1,
  name: 'Ripjaws V 16 GB (2 x 8 GB) DDR4 3600 MHz',
  brand: 'G.Skill',
  sku: 'F4-3600C18D-16GVK',
  price: 44.9,
  stock: 10
}

describe('Products API', () => {
  it('GET /api/products should return an array', async () => {
    const res = await request(app).get('/api/products')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
  })

  it('GET /api/products/:id should return one product', async () => {
    const res = await request(app).get('/api/products/1')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('id', 1)
    expect(res.body).toHaveProperty('sku')
  })

  it('GET /api/products/:id should return 404 for an unknown id', async () => {
    const res = await request(app).get('/api/products/9999')
    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: 'Product not found' })
  })

  it('supports the full create, update and delete flow', async () => {
    const created = await request(app).post('/api/products').send(newProduct)
    expect(created.status).toBe(201)
    expect(created.body).toHaveProperty('id')
    expect(created.body).toMatchObject({ ...newProduct, is_active: true })

    const id = created.body.id

    const updated = await request(app).put(`/api/products/${id}`).send({ price: 39.9, stock: 8 })
    expect(updated.status).toBe(200)
    expect(updated.body).toMatchObject({ id, price: 39.9, stock: 8, sku: newProduct.sku })

    const deleted = await request(app).delete(`/api/products/${id}`)
    expect(deleted.status).toBe(204)

    const afterDelete = await request(app).get(`/api/products/${id}`)
    expect(afterDelete.status).toBe(404)
  })

  it('POST /api/products should reject missing fields', async () => {
    const res = await request(app).post('/api/products').send({ name: 'Incomplete' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/Missing required fields/)
  })

  it('POST /api/products should reject an invalid price or stock', async () => {
    const badPrice = await request(app).post('/api/products').send({ ...newProduct, price: 0 })
    expect(badPrice.status).toBe(400)

    const badStock = await request(app).post('/api/products').send({ ...newProduct, stock: -1 })
    expect(badStock.status).toBe(400)
  })

  it('POST /api/products should reject a duplicated sku', async () => {
    const res = await request(app).post('/api/products').send({ ...newProduct, sku: 'KF432C16BBK2-16' })
    expect(res.status).toBe(409)
  })

  it('POST /api/products should fill optional fields with defaults', async () => {
    const { category_id: _c, ...withoutCategory } = newProduct
    const res = await request(app)
      .post('/api/products')
      .send({ ...withoutCategory, sku: 'DEFAULTS-SKU', description: 'Desc', purchase_limit: 2 })
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ category_id: null, description: 'Desc', purchase_limit: 2 })
  })

  it('PUT /api/products/:id should return 400, 404 or 409 when needed', async () => {
    const invalid = await request(app).put('/api/products/2').send({ price: -10 })
    expect(invalid.status).toBe(400)

    const duplicate = await request(app).put('/api/products/2').send({ sku: 'KF432C16BBK2-16' })
    expect(duplicate.status).toBe(409)

    const unknown = await request(app).put('/api/products/9999')
    expect(unknown.status).toBe(404)
  })

  it('GET /api/products should filter by category, brand and stock', async () => {
    const byCategory = await request(app).get('/api/products?category_id=2')
    expect(byCategory.body.every(p => p.category_id === 2)).toBe(true)

    const byBrand = await request(app).get('/api/products?brand=kingston')
    expect(byBrand.body.map(p => p.brand)).toEqual(['Kingston'])

    const inStock = await request(app).get('/api/products?inStock=true')
    expect(inStock.body.every(p => p.stock > 0)).toBe(true)
  })

  it('GET /api/products should return the availability of each product', async () => {
    const res = await request(app).get('/api/products/3')
    expect(res.body.availability).toBe('out_of_stock')
  })

  it('POST /api/products should reject a negative low_stock_threshold', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ ...newProduct, sku: 'THRESHOLD-SKU', low_stock_threshold: -1 })
    expect(res.status).toBe(400)
  })

  it('DELETE /api/products/:id should return 404 for an unknown id', async () => {
    const res = await request(app).delete('/api/products/9999')
    expect(res.status).toBe(404)
  })
})
