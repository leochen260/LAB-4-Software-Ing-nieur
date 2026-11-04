// Lab 5 – 2.5 Modularization (run with: node main.js)
import { doctors, patients, addDoctor, addPatient, filterByAge } from './hospitalData.js'

addDoctor('Dr. Martin')
console.log('Updated doctors:', doctors)

addPatient('Enzo', 22)
console.log('Updated patients:', patients)

console.log('Patients older than 30:', filterByAge(30))
