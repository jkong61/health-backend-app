import FoodItem from 'models/FoodItem'
import FoodNutrition from 'models/FoodNutrition'

export default class MealRecord {
  constructor (record) {
    this.date = new Date(record.date_modified || record.date_created)
    this.bloodGlucose = record.blood_glucose
    this.foodItems = record.food_items.map(item => new FoodItem(item))
    this.totalNutrition = undefined
  }

  getTotalMealNutrition () {
    if (this.totalNutrition) {
      return this.totalNutrition
    }

    const totalFoodNurtitions = this.foodItems.map(item => item.totalNutritionWithCalculatedWeight())
    const unsorted = totalFoodNurtitions.reduce((accumulator, nutrition) => {
      nutrition.forEach(element => {
        const nutritionName = element.name
        const index = accumulator.findIndex(item => item.name === nutritionName)
        if (index === -1) {
          accumulator.push(new FoodNutrition(nutritionName, element.suffix, element.value))
        } else {
          accumulator[index].value += element.value
        }
      })
      return accumulator
    })

    // Returns sorted nutrition
    this.totalNutrition = unsorted.sort((a, b) => ('' + a.name).localeCompare(b.name))
    return this.totalNutrition
  }
}
