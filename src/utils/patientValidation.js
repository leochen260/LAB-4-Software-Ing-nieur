/**
 * Validates the body of POST /api/patients.
 * Returns an error message, or null when the body is valid.
 */
export function validatePatient (body = {}) {
  const { name, age } = body
  if (name === undefined || age === undefined) {
    return 'Missing required fields: name and age'
  }
  if (typeof name !== 'string' || name.trim() === '') {
    return 'name must be a non-empty string'
  }
  if (!Number.isInteger(age) || age < 0 || age > 150) {
    return 'age must be an integer between 0 and 150'
  }
  return null
}
