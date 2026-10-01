import { describe, it, expect } from 'vitest'
import express from 'express'
import request from 'supertest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import router from '../src/routes/auto/version.route.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8')
)

describe('version route (import direct)', () => {
  it('GET /version renvoie 200 avec { version } issu de package.json', async () => {
    const app = express()
    app.use('/', router)

    const res = await request(app).get('/version')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ version: pkg.version })
  })

  it('GET /version renvoie une version au format semver', async () => {
    const app = express()
    app.use('/', router)

    const res = await request(app).get('/version')

    expect(res.body.version).toMatch(/^\d+\.\d+\.\d+/)
  })
})
