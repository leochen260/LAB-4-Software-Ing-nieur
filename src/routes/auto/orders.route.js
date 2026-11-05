import { Router } from 'express'

const router = Router()
const orders = [
  { id: 1, status: 'pending', deliveryMethod: 'standard', items: [{ productId: 1, quantity: 2 }], total: 120 }
]
let nextId = 2

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
const deliveryMethods = ['standard', 'express']

function validateOrder (body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Invalid order'
  if (!statuses.includes(body.status)) return 'Invalid status'
  if (!deliveryMethods.includes(body.deliveryMethod)) return 'Invalid delivery method'
  if (!Array.isArray(body.items) || body.items.length === 0 ||
    body.items.some(item => !item || !Number.isInteger(item.productId) || item.productId <= 0 ||
      !Number.isInteger(item.quantity) || item.quantity <= 0)) return 'Invalid items'
  if (typeof body.total !== 'number' || !Number.isFinite(body.total) || body.total < 0) return 'Invalid total'
  return null
}

router.get('/api/orders', (_req, res) => {
  res.status(200).json(orders)
})

router.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === Number(req.params.id))
  if (!order) return res.status(404).json({ error: 'Order not found' })
  res.status(200).json(order)
})

router.post('/api/orders', (req, res) => {
  const error = validateOrder(req.body)
  if (error) return res.status(400).json({ error })
  const { status, deliveryMethod, items, total } = req.body
  const order = { id: nextId++, status, deliveryMethod, items, total }
  orders.push(order)
  res.status(201).json(order)
})

router.put('/api/orders/:id', (req, res) => {
  const index = orders.findIndex(o => o.id === Number(req.params.id))
  if (index === -1) return res.status(404).json({ error: 'Order not found' })
  const error = validateOrder(req.body)
  if (error) return res.status(400).json({ error })
  const { status, deliveryMethod, items, total } = req.body
  orders[index] = { id: orders[index].id, status, deliveryMethod, items, total }
  res.status(200).json(orders[index])
})

router.delete('/api/orders/:id', (req, res) => {
  const index = orders.findIndex(o => o.id === Number(req.params.id))
  if (index === -1) return res.status(404).json({ error: 'Order not found' })
  orders.splice(index, 1)
  res.status(204).end()
})

export default router
