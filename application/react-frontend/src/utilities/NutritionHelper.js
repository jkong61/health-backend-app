export const MEASUREMENT = [
  { desc: 'Gram', value: 'g', measurement_conversion_to_g: 1 },
  { desc: 'Kilogram', value: 'kg', measurement_conversion_to_g: 1000 },
  { desc: 'Ounce', value: 'oz', measurement_conversion_to_g: 28.3495 },
  { desc: 'Pound', value: 'lb', measurement_conversion_to_g: 453.592 },
  { desc: 'Cup', value: 'cup', measurement_conversion_to_g: 250 },
  { desc: 'Bowl', value: 'bowl', measurement_conversion_to_g: 350 }
]

export function processNutritionName (n) {
  const word = n.nutrition.nutrition_name.split('_')
  const newWord = word.map(x =>
    x[0].toUpperCase() + x.slice(1)
  )
  return newWord.join(' ')
}

export const defaultSelectedNutrition = ['ENERC_KCAL', 'FAT', 'PROCNT']

export const FOOD_NUTRITIONS = [
  {
    nutrition: {
      nutrition_code: 'ENERC_KCAL',
      nutrition_name: 'energy',
      nutrition_measurement_suffix: 'kcal'
    },
    nutrition_value: 0,
    limit: 2000
  },
  {
    nutrition: {
      nutrition_code: 'FAT',
      nutrition_name: 'fat',
      nutrition_measurement_suffix: 'g'
    },
    nutrition_value: 0,
    limit: 78,
    restricted: true
  },
  {
    nutrition: {
      nutrition_code: 'FASAT',
      nutrition_name: 'saturated',
      nutrition_measurement_suffix: 'g'
    },
    nutrition_value: 0,
    limit: 50,
    restricted: true
  },
  {
    nutrition: {
      nutrition_code: 'FATRN',
      nutrition_name: 'trans',
      nutrition_measurement_suffix: 'g'
    },
    nutrition_value: 0,
    limit: -1,
    restricted: true
  },
  {
    nutrition: {
      nutrition_code: 'FAMS',
      nutrition_name: 'monounsaturated',
      nutrition_measurement_suffix: 'g'
    },
    nutrition_value: 0,
    limit: -1
  },
  {
    nutrition: {
      nutrition_code: 'FAPU',
      nutrition_name: 'polyunsaturated',
      nutrition_measurement_suffix: 'g'
    },
    nutrition_value: 0,
    limit: -1
  },
  {
    nutrition: {
      nutrition_code: 'CHOCDF',
      nutrition_name: 'carbs',
      nutrition_measurement_suffix: 'g'
    },
    nutrition_value: 0,
    limit: 300
  },
  {
    nutrition: {
      nutrition_code: 'FIBTG',
      nutrition_name: 'fibre',
      nutrition_measurement_suffix: 'g'
    },
    nutrition_value: 0,
    limit: 28
  },
  {
    nutrition: {
      nutrition_code: 'SUGAR',
      nutrition_name: 'sugars',
      nutrition_measurement_suffix: 'g'
    },
    nutrition_value: 0,
    limit: 50,
    restricted: true
  },
  {
    nutrition: {
      nutrition_code: 'PROCNT',
      nutrition_name: 'protein',
      nutrition_measurement_suffix: 'g'
    },
    nutrition_value: 0,
    limit: 50
  },
  {
    nutrition: {
      nutrition_code: 'CHOLE',
      nutrition_name: 'cholestrol',
      nutrition_measurement_suffix: 'mg'
    },
    nutrition_value: 0,
    limit: 300,
    restricted: true
  },
  {
    nutrition: {
      nutrition_code: 'NA',
      nutrition_name: 'sodium',
      nutrition_measurement_suffix: 'mg'
    },
    nutrition_value: 0,
    limit: 2300,
    restricted: true
  },
  {
    nutrition: {
      nutrition_code: 'CA',
      nutrition_name: 'calcium',
      nutrition_measurement_suffix: 'mg'
    },
    nutrition_value: 0,
    limit: 1300
  },
  {
    nutrition: {
      nutrition_code: 'MG',
      nutrition_name: 'magnesium',
      nutrition_measurement_suffix: 'mg'
    },
    nutrition_value: 0,
    limit: 420
  },
  {
    nutrition: {
      nutrition_code: 'K',
      nutrition_name: 'potassium',
      nutrition_measurement_suffix: 'mg'
    },
    nutrition_value: 0,
    limit: 4700
  },
  {
    nutrition: {
      nutrition_code: 'FE',
      nutrition_name: 'iron',
      nutrition_measurement_suffix: 'mg'
    },
    nutrition_value: 0,
    limit: 18
  },
  {
    nutrition: {
      nutrition_code: 'ZN',
      nutrition_name: 'zinc',
      nutrition_measurement_suffix: 'mg'
    },
    nutrition_value: 0,
    limit: 11
  },
  {
    nutrition: {
      nutrition_code: 'P',
      nutrition_name: 'phosphorus',
      nutrition_measurement_suffix: 'mg'
    },
    nutrition_value: 0,
    limit: 1250
  },
  {
    nutrition: {
      nutrition_code: 'VITA_RAE',
      nutrition_name: 'vitamin_a',
      nutrition_measurement_suffix: 'µg'
    },
    nutrition_value: 0,
    limit: 900
  },
  {
    nutrition: {
      nutrition_code: 'VITC',
      nutrition_name: 'vitamin_c',
      nutrition_measurement_suffix: 'mg'
    },
    nutrition_value: 0,
    limit: 90
  },
  {
    nutrition: {
      nutrition_code: 'THIA',
      nutrition_name: 'thiamin_b1',
      nutrition_measurement_suffix: 'mg'
    },
    nutrition_value: 0,
    limit: 1.2
  },
  {
    nutrition: {
      nutrition_code: 'RIBF',
      nutrition_name: 'riboflavin_b2',
      nutrition_measurement_suffix: 'mg'
    },
    nutrition_value: 0,
    limit: 1.3
  },
  {
    nutrition: {
      nutrition_code: 'NIA',
      nutrition_name: 'niacin_b3',
      nutrition_measurement_suffix: 'mg'
    },
    nutrition_value: 0,
    limit: 16
  },
  {
    nutrition: {
      nutrition_code: 'VITB6A',
      nutrition_name: 'vitamin_b6',
      nutrition_measurement_suffix: 'mg'
    },
    nutrition_value: 0,
    limit: 1.6
  },
  {
    nutrition: {
      nutrition_code: 'FOLDFE',
      nutrition_name: 'folate_equivalent',
      nutrition_measurement_suffix: 'µg'
    },
    nutrition_value: 0,
    limit: -1
  },
  {
    nutrition: {
      nutrition_code: 'FOLFD',
      nutrition_name: 'folate_food',
      nutrition_measurement_suffix: 'µg'
    },
    nutrition_value: 0,
    limit: 400
  },
  {
    nutrition: {
      nutrition_code: 'FOLAC',
      nutrition_name: 'folic_acid',
      nutrition_measurement_suffix: 'µg'
    },
    nutrition_value: 0,
    limit: 0
  },
  {
    nutrition: {
      nutrition_code: 'VITB12',
      nutrition_name: 'vitamin_b12',
      nutrition_measurement_suffix: 'µg'
    },
    nutrition_value: 0,
    limit: 2.4
  },
  {
    nutrition: {
      nutrition_code: 'VITD',
      nutrition_name: 'vitamin_d',
      nutrition_measurement_suffix: 'µg'
    },
    nutrition_value: 0,
    limit: 20
  },
  {
    nutrition: {
      nutrition_code: 'TOCPHA',
      nutrition_name: 'vitamin_e',
      nutrition_measurement_suffix: 'mg'
    },
    nutrition_value: 0,
    limit: 15
  },
  {
    nutrition: {
      nutrition_code: 'VITK1',
      nutrition_name: 'vitamin_k',
      nutrition_measurement_suffix: 'µg'
    },
    nutrition_value: 0,
    limit: 120
  },
  {
    nutrition: {
      nutrition_code: 'WATER',
      nutrition_name: 'water',
      nutrition_measurement_suffix: 'g'
    },
    nutrition_value: 0,
    limit: 2000
  }
]

export function calculateCalories (BMRValue, physicalExercise) {
  if (isNaN(BMRValue)) {
    return 2000
  }
  let BMRfactor = 1
  if (physicalExercise <= 100) {
    BMRfactor = 1.2
  } else if (physicalExercise > 100 && physicalExercise <= 300) {
    BMRfactor = 1.375
  } else if (physicalExercise > 300 && physicalExercise <= 500) {
    BMRfactor = 1.55
  } else if (physicalExercise > 500 && physicalExercise <= 700) {
    BMRfactor = 1.725
  } else {
    BMRfactor = 1.9
  }

  return Math.round(BMRValue * BMRfactor)
}

export function nutritionCalculation (calculatedCalories, baseNutrient) {
  return Math.round((calculatedCalories * baseNutrient) / 2000)
}
