import os from 'node:os'
import express from 'express'
import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import app from '../src/app.js'
import router from '../src/routes/auto/metrics.route.js'
import { getMetrics } from '../src/utils/metrics.js'

describe('system metrics', () => {
  it('reports host uptime in seconds and process RSS in bytes', () => {
    vi.spyOn(os, 'uptime').mockReturnValue(120)
    vi.spyOn(process.memoryUsage, 'rss').mockReturnValue(1048576)
    expect(getMetrics()).toEqual({ uptime: 120, memory: 1048576, status: 'healthy' })
  })

  it.each([[5, 'warming-up'], [120, 'healthy'], [7200, 'steady']])('serves metrics for uptime %i', async (uptime, status) => {
    vi.spyOn(os, 'uptime').mockReturnValue(uptime)
    const res = await request(app).get('/api/metrics').expect(200).expect('Content-Type', /json/)
    expect(res.body.uptime).toBe(uptime)
    expect(res.body.memory).toBeGreaterThan(0)
    expect(res.body.status).toBe(status)
  })

  it.each([-1, NaN, undefined])('uses the global error handler for invalid uptime %s', async uptime => {
    vi.spyOn(os, 'uptime').mockReturnValue(uptime)
    const res = await request(app).get('/api/metrics').expect(500)
    expect(res.body.message).toBe('invalid uptime')
  })

  it('reads a fresh snapshot on each request', async () => {
    const isolatedApp = express().use(router)
    vi.spyOn(os, 'uptime').mockReturnValueOnce(59).mockReturnValueOnce(60)
    for (const status of ['warming-up', 'healthy']) {
      const res = await request(isolatedApp).get('/api/metrics').expect(200)
      expect(res.body.status).toBe(status)
    }
  })
})
