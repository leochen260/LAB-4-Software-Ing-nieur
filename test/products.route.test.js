/**
 * Direct-import tests for the products router.
 * Routes auto-mounted by app.js are loaded with require(), which the coverage
 * tool measures incorrectly, so this file imports the router itself.
 */
import { describe, it, expect } from 'vitest'
import express from 'express'
import request from 'supertest'
import router, { validateProduct, getAvailability } from '../src/routes/auto/products.route.js'

function createApp () {
  const app = express()
  app.use(express.json())
  app.use('/', router)
  return app
}

const valid = {
  name: 'Test module 8 GB DDR4',
  brand: 'TestBrand',
  sku: 'TEST-SKU-1',
  price: 19.9,
  stock: 3
}

describe('validateProduct', () => {
  it('accepts a valid product', () => {
    expect(validateProduct(valid)).toBeNull()
  })

  it('lists every missing field', () => {
    expect(validateProduct({ name: 'Only a name', brand: '' }))
      .toBe('Missing required fields: brand, sku, price, stock')
  })

  it('rejects a price that is not strictly positive', () => {
    expect(validateProduct({ ...valid, price: 0 })).toBe('price must be a number greater than 0')
    expect(validateProduct({ ...valid, price: '19.9' })).toBe('price must be a number greater than 0')
  })

  it('rejects a negative or non-integer stock', () => {
    expect(validateProduct({ ...valid, stock: -1 }))
      .toBe('stock must be an integer greater than or equal to 0')
    expect(validateProduct({ ...valid, stock: 1.5 }))
      .toBe('stock must be an integer greater than or equal to 0')
  })
})

describe('getAvailability', () => {
  it('returns out_of_stock when the stock is 0', () => {
    expect(getAvailability({ stock: 0, low_stock_threshold: 5 })).toBe('out_of_stock')
  })

  it('returns low_stock at or under the threshold', () => {
    expect(getAvailability({ stock: 5, low_stock_threshold: 5 })).toBe('low_stock')
  })

  it('returns in_stock above the threshold', () => {
    expect(getAvailability({ stock: 6, low_stock_threshold: 5 })).toBe('in_stock')
  })

  it('rejects an invalid low_stock_threshold', () => {
    expect(validateProduct({ ...valid, low_stock_threshold: 1.5 }))
      .toBe('low_stock_threshold must be an integer greater than or equal to 0')
  })
})

describe('products route (direct import)', () => {
  const app = createApp()

  it('GET /api/products returns the initial products', async () => {
    const res = await request(app).get('/api/products')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(3)
    expect(res.body[0]).toMatchObject({ id: 1, brand: 'Kingston', is_active: true })
  })

  it('GET /api/products combines filters', async () => {
    const res = await request(app).get('/api/products?category_id=1&brand=KINGSTON&inStock=true')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0]).toMatchObject({ id: 1, availability: 'in_stock' })

    const none = await request(app).get('/api/products?brand=Unknown')
    expect(none.body).toEqual([])

    const outOfStockIncluded = await request(app).get('/api/products?inStock=false')
    expect(outOfStockIncluded.body.map(p => p.id)).toContain(3)
  })

  it('GET /api/products/:id returns 404 for a non numeric id', async () => {
    const res = await request(app).get('/api/products/abc')
    expect(res.status).toBe(404)
  })

  it('POST /api/products creates a product with defaults for optional fields', async () => {
    const res = await request(app).post('/api/products').send(valid)
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({
      ...valid,
      id: 4,
      category_id: null,
      description: '',
      purchase_limit: null,
      low_stock_threshold: 5,
      availability: 'low_stock',
      is_active: true
    })
  })

  it('POST /api/products returns 400 for an invalid price', async () => {
    const res = await request(app).post('/api/products').send({ ...valid, sku: 'OTHER', price: -5 })
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'price must be a number greater than 0' })
  })

  it('POST /api/products returns 400 when the body is empty', async () => {
    const res = await request(app).post('/api/products')
    expect(res.status).toBe(400)
  })

  it('POST /api/products returns 409 for a duplicated sku', async () => {
    const res = await request(app).post('/api/products').send({ ...valid, name: 'Copy' })
    expect(res.status).toBe(409)
    expect(res.body).toEqual({ error: 'A product with this sku already exists' })
  })

  it('PUT /api/products/:id updates fields but keeps id and is_active', async () => {
    const res = await request(app)
      .put('/api/products/2')
      .send({ price: 99.9, id: 50, is_active: false })
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ id: 2, price: 99.9, is_active: true })
  })

  it('PUT /api/products/:id returns 400 when the update makes the product invalid', async () => {
    const res = await request(app).put('/api/products/2').send({ stock: -3 })
    expect(res.status).toBe(400)

    const unchanged = await request(app).get('/api/products/2')
    expect(unchanged.body.stock).toBe(12)
  })

  it('PUT /api/products/:id returns 409 when the sku belongs to another product', async () => {
    const res = await request(app).put('/api/products/2').send({ sku: 'KF432C16BBK2-16' })
    expect(res.status).toBe(409)
  })

  it('PUT /api/products/:id returns 404 for an unknown product', async () => {
    const res = await request(app).put('/api/products/9999').send({ price: 10 })
    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: 'Product not found' })
  })

  it('PUT /api/products/:id returns 404 when the body is empty on an unknown product', async () => {
    const res = await request(app).put('/api/products/9999')
    expect(res.status).toBe(404)
  })

  it('DELETE /api/products/:id hides the product from the list', async () => {
    const res = await request(app).delete('/api/products/3')
    expect(res.status).toBe(204)

    const list = await request(app).get('/api/products')
    expect(list.body.map(p => p.id)).not.toContain(3)
  })

  it('DELETE /api/products/:id returns 404 when deleting twice', async () => {
    const res = await request(app).delete('/api/products/3')
    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: 'Product not found' })
  })
})
