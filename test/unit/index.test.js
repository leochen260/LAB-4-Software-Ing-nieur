import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import app from '../../src/app.js'

vi.mock('../../src/app.js', () => ({ default: { listen: vi.fn() } }))

describe('server entrypoint', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    app.listen.mockImplementation((_port, ready) => { ready() })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('listens on port 3000 by default and logs readiness', async () => {
    vi.stubEnv('PORT', '')
    await import('../../src/index.js')
    expect(app.listen).toHaveBeenCalledWith(3000, expect.any(Function))
    expect(console.log).toHaveBeenCalledWith('[server] listening on http://localhost:3000')
  })

  it('uses the configured PORT and logs it', async () => {
    vi.stubEnv('PORT', '4123')
    await import('../../src/index.js')
    expect(app.listen).toHaveBeenCalledWith('4123', expect.any(Function))
    expect(console.log).toHaveBeenCalledWith('[server] listening on http://localhost:4123')
  })
})
