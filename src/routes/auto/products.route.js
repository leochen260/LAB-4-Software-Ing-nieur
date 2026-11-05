/**
 * CRUD for /api/products (RAM modules sold on PeopleRam).
 *
 * GET    /api/products      → list of active products
 *                              filters: ?category_id=1&brand=Kingston&inStock=true
 * GET    /api/products/:id  → one active product
 * POST   /api/products      → creates a product
 * PUT    /api/products/:id  → updates a product
 * DELETE /api/products/:id  → soft delete (is_active = false), as planned in the SDD
 *
 * Each product returned has a computed "availability" field (SRS FR-11):
 * in_stock, low_stock (stock at or under low_stock_threshold) or out_of_stock.
 *
 * Data is kept in memory, so it resets when the server restarts.
 */
import { Router } from 'express'

const router = Router()

const products = [
  {
    id: 1,
    category_id: 1,
    name: 'Fury Beast 16 GB (2 x 8 GB) DDR4 3200 MHz',
    brand: 'Kingston',
    description: 'DIMM kit for desktop PCs, CL16',
    sku: 'KF432C16BBK2-16',
    price: 39.9,
    stock: 25,
    low_stock_threshold: 5,
    purchase_limit: 5,
    is_active: true
  },
  {
    id: 2,
    category_id: 2,
    name: 'Vengeance 32 GB (2 x 16 GB) DDR5 6000 MHz',
    brand: 'Corsair',
    description: 'DIMM kit for gaming PCs, CL30',
    sku: 'CMK32GX5M2B6000C30',
    price: 109.9,
    stock: 12,
    low_stock_threshold: 5,
    purchase_limit: 3,
    is_active: true
  },
  {
    id: 3,
    category_id: 3,
    name: 'Laptop 16 GB DDR5 5600 MHz SO-DIMM',
    brand: 'Crucial',
    description: 'SO-DIMM module for laptops, CL46',
    sku: 'CT16G56C46S5',
    price: 49.9,
    stock: 0,
    low_stock_threshold: 3,
    purchase_limit: 4,
    is_active: true
  }
]

const REQUIRED_FIELDS = ['name', 'brand', 'sku', 'price', 'stock']

/**
 * Returns an error message, or null when the product is valid.
 */
export function validateProduct (product) {
  const missing = REQUIRED_FIELDS.filter(field => product[field] === undefined || product[field] === '')
  if (missing.length > 0) {
    return `Missing required fields: ${missing.join(', ')}`
  }
  if (typeof product.price !== 'number' || product.price <= 0) {
    return 'price must be a number greater than 0'
  }
  if (!Number.isInteger(product.stock) || product.stock < 0) {
    return 'stock must be an integer greater than or equal to 0'
  }
  if (product.low_stock_threshold !== undefined &&
    (!Number.isInteger(product.low_stock_threshold) || product.low_stock_threshold < 0)) {
    return 'low_stock_threshold must be an integer greater than or equal to 0'
  }
  return null
}

export function getAvailability (product) {
  if (product.stock === 0) return 'out_of_stock'
  if (product.stock <= product.low_stock_threshold) return 'low_stock'
  return 'in_stock'
}

function toResponse (product) {
  return { ...product, availability: getAvailability(product) }
}

function findActive (id) {
  return products.find(p => p.id === Number(id) && p.is_active)
}

function skuTaken (sku, exceptId) {
  return products.some(p => p.sku === sku && p.id !== exceptId)
}

router.get('/api/products', (req, res) => {
  const { category_id: categoryId, brand, inStock } = req.query
  let list = products.filter(p => p.is_active)

  if (categoryId !== undefined) {
    list = list.filter(p => p.category_id === Number(categoryId))
  }
  if (brand !== undefined) {
    list = list.filter(p => p.brand.toLowerCase() === String(brand).toLowerCase())
  }
  if (inStock === 'true') {
    list = list.filter(p => p.stock > 0)
  }

  res.status(200).json(list.map(toResponse))
})

router.get('/api/products/:id', (req, res) => {
  const product = findActive(req.params.id)
  if (!product) {
    return res.status(404).json({ error: 'Product not found' })
  }
  res.status(200).json(toResponse(product))
})

router.post('/api/products', (req, res) => {
  const body = req.body ?? {}
  const error = validateProduct(body)
  if (error) {
    return res.status(400).json({ error })
  }
  if (skuTaken(body.sku)) {
    return res.status(409).json({ error: 'A product with this sku already exists' })
  }

  const newProduct = {
    id: Math.max(0, ...products.map(p => p.id)) + 1,
    category_id: body.category_id ?? null,
    name: body.name,
    brand: body.brand,
    description: body.description ?? '',
    sku: body.sku,
    price: body.price,
    stock: body.stock,
    low_stock_threshold: body.low_stock_threshold ?? 5,
    purchase_limit: body.purchase_limit ?? null,
    is_active: true
  }
  products.push(newProduct)
  res.status(201).json(toResponse(newProduct))
})

router.put('/api/products/:id', (req, res) => {
  const product = findActive(req.params.id)
  if (!product) {
    return res.status(404).json({ error: 'Product not found' })
  }

  // id, is_active and the computed availability cannot be changed through PUT
  const { id: _id, is_active: _isActive, availability: _availability, ...changes } = req.body ?? {}
  const updated = { ...product, ...changes }

  const error = validateProduct(updated)
  if (error) {
    return res.status(400).json({ error })
  }
  if (skuTaken(updated.sku, product.id)) {
    return res.status(409).json({ error: 'A product with this sku already exists' })
  }

  Object.assign(product, updated)
  res.status(200).json(toResponse(product))
})

router.delete('/api/products/:id', (req, res) => {
  const product = findActive(req.params.id)
  if (!product) {
    return res.status(404).json({ error: 'Product not found' })
  }
  product.is_active = false
  res.status(204).end()
})

export default router
