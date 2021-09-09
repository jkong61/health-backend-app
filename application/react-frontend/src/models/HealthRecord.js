export default class HealthRecord {
  constructor (record) {
    this.date = new Date(record.date_modified || record.date_created)
    this.physicalMinutes = record.physical_exercise_hours * 60 + record.physical_exercise_minutes
    this.waistCircumference = record.waist_circumference
    this.weight = record.weight
  }
}
