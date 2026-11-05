/**
 * Direct-import tests for the categories router.
 * Routes auto-mounted by app.js are loaded with require(), which the coverage
 * tool measures incorrectly, so this file imports the router itself.
 */
import { describe, it, expect } from 'vitest'
import express from 'express'
import request from 'supertest'
import router, { validateCategory, USAGES } from '../src/routes/auto/categories.route.js'

function createApp () {
  const app = express()
  app.use(express.json())
  app.use('/', router)
  return app
}

describe('validateCategory', () => {
  it('accepts a valid category', () => {
    expect(validateCategory({ name: 'DDR3', usage: 'desktop', description: 'Legacy' })).toBeNull()
    expect(validateCategory({ name: 'DDR3', usage: 'laptop' })).toBeNull()
  })

  it('rejects a missing, empty or non-string name', () => {
    const msg = 'name is required and must be a non-empty string'
    expect(validateCategory({})).toBe(msg)
    expect(validateCategory({ name: '   ' })).toBe(msg)
    expect(validateCategory({ name: 42 })).toBe(msg)
  })

  it('rejects a non-string description', () => {
    expect(validateCategory({ name: 'DDR3', usage: 'gaming', description: 1 })).toBe('description must be a string')
  })

  it('rejects a missing or unknown usage', () => {
    const msg = `usage is required and must be one of: ${USAGES.join(', ')}`
    expect(USAGES).toEqual(['desktop', 'laptop', 'gaming'])
    expect(validateCategory({ name: 'DDR3' })).toBe(msg)
    expect(validateCategory({ name: 'DDR3', usage: 'server' })).toBe(msg)
  })
})

describe('categories router', () => {
  const app = createApp()

  it('lists only active categories', async () => {
    const created = await request(app).post('/api/categories').send({ name: 'To hide', usage: 'desktop' })
    await request(app).delete(`/api/categories/${created.body.id}`)

    const res = await request(app).get('/api/categories')
    expect(res.status).toBe(200)
    expect(res.body.every(c => c.is_active)).toBe(true)
    expect(res.body.some(c => c.id === created.body.id)).toBe(false)
  })

  it('returns one category by id, 404 otherwise', async () => {
    expect((await request(app).get('/api/categories/2')).body).toMatchObject({ id: 2, name: 'Gaming', usage: 'gaming' })
    expect((await request(app).get('/api/categories/abc')).status).toBe(404)
  })

  it('creates a category with a trimmed name and default description', async () => {
    const res = await request(app).post('/api/categories').send({ name: '  DDR3 Desktop  ', usage: 'desktop' })
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ name: 'DDR3 Desktop', usage: 'desktop', description: '', is_active: true })
  })

  it('rejects invalid bodies with 400', async () => {
    expect((await request(app).post('/api/categories').send({})).status).toBe(400)
    expect((await request(app).post('/api/categories')).status).toBe(400)
  })

  it('rejects duplicate names (case-insensitive) with 409', async () => {
    const res = await request(app).post('/api/categories').send({ name: 'pc FIXE', usage: 'desktop' })
    expect(res.status).toBe(409)
    expect(res.body).toEqual({ error: 'A category with this name already exists' })
  })

  it('allows reusing the name of a deleted category', async () => {
    const first = await request(app).post('/api/categories').send({ name: 'Reusable', usage: 'desktop' })
    await request(app).delete(`/api/categories/${first.body.id}`)
    const second = await request(app).post('/api/categories').send({ name: 'Reusable', usage: 'desktop' })
    expect(second.status).toBe(201)
    expect(second.body.id).not.toBe(first.body.id)
  })

  it('updates a category but ignores id and is_active', async () => {
    const created = await request(app).post('/api/categories').send({ name: 'To update', usage: 'desktop' })
    const id = created.body.id
    const res = await request(app)
      .put(`/api/categories/${id}`)
      .send({ id: 999, is_active: false, name: ' Updated ', description: 'New desc' })
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ id, name: 'Updated', usage: 'desktop', description: 'New desc', is_active: true })
  })

  it('keeps the same name on update without a conflict', async () => {
    const res = await request(app).put('/api/categories/3').send({ name: 'Portable' })
    expect(res.status).toBe(200)
  })

  it('rejects invalid or conflicting updates', async () => {
    expect((await request(app).put('/api/categories/9999').send({ name: 'X' })).status).toBe(404)
    expect((await request(app).put('/api/categories/1').send({ name: '' })).status).toBe(400)
    expect((await request(app).put('/api/categories/1')).status).toBe(200)
    expect((await request(app).put('/api/categories/1').send({ name: 'Gaming' })).status).toBe(409)
    expect((await request(app).put('/api/categories/1').send({ usage: 'server' })).status).toBe(400)
  })

  it('returns 404 when deleting an unknown or already deleted category', async () => {
    const created = await request(app).post('/api/categories').send({ name: 'Delete twice', usage: 'desktop' })
    expect((await request(app).delete(`/api/categories/${created.body.id}`)).status).toBe(204)
    expect((await request(app).delete(`/api/categories/${created.body.id}`)).status).toBe(404)
    expect((await request(app).delete('/api/categories/9999')).status).toBe(404)
  })
})
