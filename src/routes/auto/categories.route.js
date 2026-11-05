/**
 * CRUD for /api/categories (RAM module categories on PeopleRam).
 * Matches the Categorie entity of the SRS (id, nom, usage) and FR-07 / FR-09.
 *
 * GET    /api/categories      → list of active categories
 * GET    /api/categories/:id  → one active category
 * POST   /api/categories      → creates a category
 * PUT    /api/categories/:id  → updates a category
 * DELETE /api/categories/:id  → soft delete (is_active = false)
 *
 * usage is one of USAGES: desktop (PC fixe), laptop (portable) or gaming.
 * Category ids match the category_id used by /api/products.
 * Data is kept in memory, so it resets when the server restarts.
 */
import { Router } from 'express'

const router = Router()

export const USAGES = ['desktop', 'laptop', 'gaming']

const categories = [
  { id: 1, name: 'PC fixe', usage: 'desktop', description: 'DIMM modules for desktop PCs', is_active: true },
  { id: 2, name: 'Gaming', usage: 'gaming', description: 'High-frequency DIMM kits for gaming PCs', is_active: true },
  { id: 3, name: 'Portable', usage: 'laptop', description: 'SO-DIMM modules for laptops', is_active: true }
]

/**
 * Returns an error message, or null when the category is valid.
 */
export function validateCategory (category) {
  if (typeof category.name !== 'string' || category.name.trim() === '') {
    return 'name is required and must be a non-empty string'
  }
  if (!USAGES.includes(category.usage)) {
    return `usage is required and must be one of: ${USAGES.join(', ')}`
  }
  if (category.description !== undefined && typeof category.description !== 'string') {
    return 'description must be a string'
  }
  return null
}

function findActive (id) {
  return categories.find(c => c.id === Number(id) && c.is_active)
}

function nameTaken (name, exceptId) {
  const wanted = name.trim().toLowerCase()
  return categories.some(c => c.is_active && c.id !== exceptId && c.name.toLowerCase() === wanted)
}

router.get('/api/categories', (_req, res) => {
  res.status(200).json(categories.filter(c => c.is_active))
})

router.get('/api/categories/:id', (req, res) => {
  const category = findActive(req.params.id)
  if (!category) {
    return res.status(404).json({ error: 'Category not found' })
  }
  res.status(200).json(category)
})

router.post('/api/categories', (req, res) => {
  const body = req.body ?? {}
  const error = validateCategory(body)
  if (error) {
    return res.status(400).json({ error })
  }
  if (nameTaken(body.name)) {
    return res.status(409).json({ error: 'A category with this name already exists' })
  }

  const newCategory = {
    id: Math.max(0, ...categories.map(c => c.id)) + 1,
    name: body.name.trim(),
    usage: body.usage,
    description: body.description ?? '',
    is_active: true
  }
  categories.push(newCategory)
  res.status(201).json(newCategory)
})

router.put('/api/categories/:id', (req, res) => {
  const category = findActive(req.params.id)
  if (!category) {
    return res.status(404).json({ error: 'Category not found' })
  }

  // id and is_active cannot be changed through PUT
  const { id: _id, is_active: _isActive, ...changes } = req.body ?? {}
  const updated = { ...category, ...changes }

  const error = validateCategory(updated)
  if (error) {
    return res.status(400).json({ error })
  }
  if (nameTaken(updated.name, category.id)) {
    return res.status(409).json({ error: 'A category with this name already exists' })
  }

  Object.assign(category, updated, { name: updated.name.trim() })
  res.status(200).json(category)
})

router.delete('/api/categories/:id', (req, res) => {
  const category = findActive(req.params.id)
  if (!category) {
    return res.status(404).json({ error: 'Category not found' })
  }
  category.is_active = false
  res.status(204).end()
})

export default router
