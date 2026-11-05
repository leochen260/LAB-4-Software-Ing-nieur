import { Router } from 'express'

const router = Router()

const DDR_GENERATIONS = ['DDR3', 'DDR4', 'DDR5']
const FORM_FACTOR_BY_TYPE = new Map([['desktop', 'DIMM'], ['laptop', 'SO-DIMM']])
const NUMBER_FIELDS = ['slots', 'max_capacity_gb', 'max_speed_mhz']
const FIELDS = ['brand', 'model', 'machine_type', 'ddr_generation', 'form_factor', ...NUMBER_FIELDS]

let machineModels = [
  { id: 1, brand: 'Dell', model: 'XPS 15 9520', machine_type: 'laptop', ddr_generation: 'DDR5', form_factor: 'SO-DIMM', slots: 2, max_capacity_gb: 64, max_speed_mhz: 4800 },
  { id: 2, brand: 'Lenovo', model: 'ThinkCentre M70s Gen 3', machine_type: 'desktop', ddr_generation: 'DDR4', form_factor: 'DIMM', slots: 2, max_capacity_gb: 64, max_speed_mhz: 3200 }
]
let nextId = 3

function pickFields (body) {
  const data = {}
  for (const field of FIELDS) {
    if (body[field] !== undefined) data[field] = body[field]
  }
  return data
}

function validate (data) {
  const missing = FIELDS.filter(field => [undefined, null, ''].includes(data[field]))
  if (missing.length > 0) return `Missing required fields: ${missing.join(', ')}`
  if (!DDR_GENERATIONS.includes(data.ddr_generation)) return 'Invalid ddr_generation'
  if (!FORM_FACTOR_BY_TYPE.has(data.machine_type)) return 'Invalid machine_type'
  if (FORM_FACTOR_BY_TYPE.get(data.machine_type) !== data.form_factor) return 'form_factor does not match machine_type'
  if (!NUMBER_FIELDS.every(field => Number.isInteger(data[field]) && data[field] > 0)) {
    return 'slots, max_capacity_gb and max_speed_mhz must be positive integers'
  }
  return null
}

router.get('/api/machine-models', (_req, res) => res.status(200).json(machineModels))

router.get('/api/machine-models/:id', (req, res) => {
  const machineModel = machineModels.find(m => m.id === Number(req.params.id))
  if (!machineModel) return res.status(404).json({ error: 'Machine model not found' })
  res.status(200).json(machineModel)
})

router.post('/api/machine-models', (req, res) => {
  const data = pickFields(req.body)
  const error = validate(data)
  if (error) return res.status(400).json({ error })
  const machineModel = { id: nextId++, ...data }
  machineModels.push(machineModel)
  res.status(201).json(machineModel)
})

router.put('/api/machine-models/:id', (req, res) => {
  const index = machineModels.findIndex(m => m.id === Number(req.params.id))
  if (index === -1) return res.status(404).json({ error: 'Machine model not found' })
  const updated = { ...machineModels[index], ...pickFields(req.body) }
  const error = validate(updated)
  if (error) return res.status(400).json({ error })
  machineModels[index] = updated
  res.status(200).json(updated)
})

router.delete('/api/machine-models/:id', (req, res) => {
  const before = machineModels.length
  machineModels = machineModels.filter(m => m.id !== Number(req.params.id))
  if (machineModels.length === before) return res.status(404).json({ error: 'Machine model not found' })
  res.status(204).end()
})

export default router
