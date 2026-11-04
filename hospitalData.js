// Lab 5 – 2.5 Modularization: shared hospital data and helpers

export const doctors = ['Dr. Lee', 'Dr. Khan']

export const patients = [
  { id: 1, name: 'Alice', age: 34 },
  { id: 2, name: 'John', age: 45 },
  { id: 3, name: 'Marie', age: 29 }
]

export function addDoctor (name) {
  doctors.push(name)
}

export function addPatient (name, age) {
  const newPatient = { id: patients.length + 1, name, age }
  patients.push(newPatient)
  return newPatient
}

export function filterByAge (minAge) {
  return patients.filter((p) => p.age > minAge)
}
