import { describe, it, expect } from 'vitest'
import express from 'express'
import request from 'supertest'
import router from '../src/routes/auto/boom.route.js'
import { errorHandler } from '../src/utils/errorHandler.js'

describe('boom route (import direct)', () => {
  it('GET /boom renvoie 500 avec { error: true, message }', async () => {
    const app = express()
    app.use('/', router)
    app.use(errorHandler)

    const res = await request(app).get('/boom')

    expect(res.status).toBe(500)
    expect(res.body.error).toBe(true)
    expect(res.body.message).toBeDefined()
  })
})