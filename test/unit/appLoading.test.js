import { afterEach, describe, it, expect, vi } from 'vitest'
import express from 'express'
import request from 'supertest'

async function loadApp ({ exists, files = [], module }) {
  vi.resetModules()
  vi.doMock('node:fs', () => ({
    default: {
      existsSync: vi.fn(() => exists),
      readdirSync: vi.fn(() => files)
    }
  }))
  const load = vi.fn(() => module)
  vi.doMock('node:module', () => ({ createRequire: () => load }))
  const { default: app } = await import('../../src/app.js')
  return { app, load }
}

afterEach(() => {
  vi.doUnmock('node:fs')
  vi.doUnmock('node:module')
  vi.resetModules()
})

describe('automatic route discovery', () => {
  it('keeps base routes available when the optional route directory is absent', async () => {
    const { app, load } = await loadApp({ exists: false })
    expect((await request(app).get('/health')).text).toBe('OK')
    expect((await request(app).get('/version')).status).toBe(404)
    expect(load).not.toHaveBeenCalled()
  })

  it('loads CommonJS router exports and ignores non-route files', async () => {
    const router = express.Router()
    router.get('/fixture', (_req, res) => res.json({ mounted: true }))
    const { app, load } = await loadApp({
      exists: true,
      files: ['fixture.route.js', 'README.md'],
      module: router
    })
    const res = await request(app).get('/fixture')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ mounted: true })
    expect(load).toHaveBeenCalledTimes(1)
    expect(load).toHaveBeenCalledWith(expect.stringMatching(/fixture\.route\.js$/))
  })

  it('skips a disabled route module without breaking the application', async () => {
    const { app } = await loadApp({
      exists: true,
      files: ['disabled.route.js'],
      module: false
    })
    expect((await request(app).get('/health')).status).toBe(200)
    expect((await request(app).get('/disabled')).status).toBe(404)
  })
})
