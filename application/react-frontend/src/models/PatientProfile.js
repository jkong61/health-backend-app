import { differenceInYears } from 'date-fns'

export const GENDER = {
  MALE: 'male',
  FEMALE: 'female'
}

export class PatientProfile {
  /**
   * @param {Date} dateOfBirth
   * @param {string} gender
   * @param {number} [height]
   */
  constructor (dateOfBirth, gender, height) {
    this.dateOfBirth = dateOfBirth
    this.gender = gender
    this.height = height ?? undefined
  }

  getAge () {
    return differenceInYears(new Date(), this.dateOfBirth)
  }

  // Based on Harris-Benedict formula
  getBMR (weightInKG) {
    if (weightInKG <= 0 || !this.height) {
      return undefined
    }
    let genderVariable
    switch (this.gender) {
      case GENDER.FEMALE:
        genderVariable = -161
        break
      default:
        genderVariable = 5
        break
    }
    return (10 * weightInKG) + (6.25 * this.height) - (5 * this.getAge()) + genderVariable
  }
}
