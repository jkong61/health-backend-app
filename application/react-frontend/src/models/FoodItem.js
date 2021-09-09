import FoodNutrition from 'models/FoodNutrition'

export default class FoodItem {
  constructor (item) {
    this.volumeConsumed = item.volume_consumed ?? 0
    this.unit = item.per_unit_measurement ?? 0
    this.foodName = item?.food?.food_name ?? item.new_food_type
    this.nutrition = item?.food?.food_nutritions?.map(item => new FoodNutrition(
      item.nutrition.nutrition_name,
      item.nutrition.nutrition_measurement_suffix,
      item.nutrition_value
    )) ?? []
    this.measurementFactor = item?.measurement?.measurement_conversion_to_g ?? 0
  }

  totalNutritionWithCalculatedWeight () {
    const totalWeight = this.unit * this.measurementFactor * this.volumeConsumed
    return this.nutrition.map(nutrition => new FoodNutrition(nutrition.name, nutrition.suffix, nutrition.value * totalWeight))
  }
}
