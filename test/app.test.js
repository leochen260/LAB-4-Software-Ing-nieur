import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../src/app.js'

describe('application HTTP contracts', () => {
  it('returns the root greeting as JSON', async () => {
    const res = await request(app).get('/')
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toMatch(/application\/json/)
    expect(res.body.ok).toBe(true)
    expect(res.body.message).toEqual(expect.any(String))
    expect(res.body.message.length).toBeGreaterThan(0)
  })

  it('returns the health check body', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.text).toBe('OK')
  })

  it('returns 404 for an unknown endpoint', async () => {
    const res = await request(app).get('/not-a-route')
    expect(res.status).toBe(404)
  })

  it('returns a JSON error message from the global middleware', async () => {
    const res = await request(app).get('/boom')
    expect(res.status).toBe(500)
    expect(res.headers['content-type']).toMatch(/application\/json/)
    expect(res.body).toEqual({ error: true, message: expect.any(String) })
    expect(res.body.message.length).toBeGreaterThan(0)
  })
})
