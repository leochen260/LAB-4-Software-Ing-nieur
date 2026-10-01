import { describe, it, expect, vi, beforeEach } from 'vitest'
import express from 'express'
import request from 'supertest'

vi.mock('../src/utils/appInfo.js', () => ({
  getPackageInfo: vi.fn(),
  getRuntimeInfo: vi.fn(),
}))

import { getPackageInfo, getRuntimeInfo } from '../src/utils/appInfo.js'
import router from '../src/routes/auto/info.route.js'

function makeApp() {
  const app = express()
  app.use('/', router)
  return app
}

describe('info route (import direct)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('GET /info renvoie 200 avec { name, version, node, uptime }', async () => {
    getPackageInfo.mockReturnValue({ name: 'my-app', version: '1.2.3' })
    getRuntimeInfo.mockReturnValue({ node: 'v20.0.0', uptime: 42 })

    const res = await request(makeApp()).get('/info')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      name: 'my-app',
      version: '1.2.3',
      node: 'v20.0.0',
      uptime: 42,
    })
  })

  it('GET /info appelle chacun des deux helpers une seule fois', async () => {
    getPackageInfo.mockReturnValue({ name: 'my-app', version: '1.2.3' })
    getRuntimeInfo.mockReturnValue({ node: 'v20.0.0', uptime: 42 })

    await request(makeApp()).get('/info')

    expect(getPackageInfo).toHaveBeenCalledTimes(1)
    expect(getRuntimeInfo).toHaveBeenCalledTimes(1)
  })

  it('GET /info : en cas de clé commune, getRuntimeInfo prend le dessus', async () => {
    getPackageInfo.mockReturnValue({ name: 'from-package', version: '1.0.0' })
    getRuntimeInfo.mockReturnValue({ name: 'from-runtime', node: 'v20.0.0' })

    const res = await request(makeApp()).get('/info')

    expect(res.body.name).toBe('from-runtime')
    expect(res.body.version).toBe('1.0.0')
    expect(res.body.node).toBe('v20.0.0')
  })
})
