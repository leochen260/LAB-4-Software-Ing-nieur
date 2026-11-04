// Lab 5 - Partie 2 : exercices JavaScript
// Lancer avec : node js-practice.js
// L'exercice 2.5 se trouve dans hospitalData.js et main.js

// ----- 2.1 Variables et types de donnees -----
console.log('--- 2.1 ---')

const hospitalName = 'Central Hospital'
const numberOfDoctors = 12
let isOpen = true

function showHospitalStatus () {
  if (isOpen) {
    console.log(`Welcome to ${hospitalName}! We have ${numberOfDoctors} doctors currently available.`)
  } else {
    console.log(`${hospitalName} is currently closed. Please come back later.`)
  }
}

showHospitalStatus()
isOpen = false
showHospitalStatus()

// ----- 2.2 Tableaux et boucles -----
console.log('\n--- 2.2 ---')

const doctors = ['Dr. Lee', 'Dr. Khan', 'Dr. Martin', 'Dr. Dubois', 'Dr. Garcia']

for (const [index, doctor] of doctors.entries()) {
  console.log(`Doctor #${index + 1}: ${doctor}`)
}

doctors.push('Dr. Chen')
console.log(`Number of doctors: ${doctors.length}`)

function findDoctor (name) {
  return doctors.includes(name) ? 'Doctor found' : 'Doctor not found'
}

console.log(findDoctor('Dr. Lee'))
console.log(findDoctor('Dr. House'))

// ----- 2.3 Objets et donnees imbriquees -----
console.log('\n--- 2.3 ---')

const patient = {
  name: 'Alice Martin',
  age: 34,
  conditions: ['diabetes', 'hypertension'],
  doctor: { name: 'Dr. Lee', specialty: 'Cardiology' }
}

console.log(`Doctor name: ${patient.doctor.name}`)
console.log(`Number of conditions: ${patient.conditions.length}`)
console.log(`${patient.name} is treated by ${patient.doctor.name} (${patient.doctor.specialty}).`)

patient.conditions.push('anxiety')
console.log(patient)

// ----- 2.4 Fonctions et filtrage de tableaux -----
console.log('\n--- 2.4 ---')

const patients = [
  { id: 1, name: 'Alice', age: 34 },
  { id: 2, name: 'John', age: 45 },
  { id: 3, name: 'Marie', age: 29 }
]

function filterByAge (minAge) {
  return patients.filter((p) => p.age > minAge)
}

function addPatient (name, age) {
  const newPatient = { id: patients.length + 1, name, age }
  patients.push(newPatient)
  return newPatient
}

console.log('Patients older than 30:', filterByAge(30))
addPatient('Paul', 52)
console.log('Updated list:', patients)

// ----- 2.6 Gestion des erreurs et validation -----
console.log('\n--- 2.6 ---')

function createAppointment (doctor, patient, date) {
  if (!doctor || !patient || !date) {
    throw new Error('Missing required fields')
  }
  return { doctor, patient, date }
}

try {
  console.log(createAppointment('Dr. Lee', 'Alice', '2025-03-15'))
  console.log(createAppointment('Dr. Lee')) // doit declencher l'erreur
} catch (err) {
  console.error('Error:', err.message)
}

// ----- 2.7 Code asynchrone -----
console.log('\n--- 2.7 ---')

function getHospitalData () {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ name: 'Central Hospital', uptime: 1234 })
    }, 1000)
  })
}

async function showData () {
  console.log('Fetching hospital data...')
  const data = await getHospitalData()
  console.log('Data loaded:', data)
}

showData()
