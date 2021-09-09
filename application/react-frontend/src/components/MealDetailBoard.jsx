import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { BASE_URL } from 'utilities/Constant'
import { getDateObjFromISOString } from 'utilities/DateTimeHelper'
import {
  FOOD_NUTRITIONS,
  defaultSelectedNutrition,
  processNutritionName
} from 'utilities/NutritionHelper'
import { CogIcon } from '@heroicons/react/solid'

import NutritionModal from 'components/NutritionModal'

const ProgressBar = (value) => {
  return (
    <div className='flex mt-1 bg-indigo-300 w-full h-2 rounded-lg'>
      <div
     style={{
       height: '100%',
       backgroundColor: '#6366F1',
       borderRadius: 8,
       width: `${value.percent}%`
     }}></div>
    </div>

  )
}

const MealDetailBoard = ({ data, patientId }) => {
  const dateObj = getDateObjFromISOString(data?.date_created)
  const [currentTab, setCurrentTab] = useState(0)

  // nutritions states & functions
  const [selectedNutrition] = useState(defaultSelectedNutrition)
  const [foodNutritions, setFoodNutritions] = useState(
    FOOD_NUTRITIONS.map((f) => ({
      ...f,
      selected: selectedNutrition.includes(f.nutrition.nutrition_code)
    }))
  )

  const totalFood = (foodItemsArray, defaultNutrition) => {
    // For making a deep copy
    const nutritions = JSON.parse(JSON.stringify(defaultNutrition))
    const copy = JSON.parse(JSON.stringify(foodItemsArray))

    const array = copy.map((item) => {
      const factorValue =
        item.per_unit_measurement *
        (item.measurement?.measurement_conversion_to_g ?? 0) *
        item.volume_consumed

      // make a deep copy for nutrions (prevent override the value)
      const copyNutritions = JSON.parse(JSON.stringify(nutritions))
      return copyNutritions.map((nutrition) => {
        if (item.food) {
          if (item.food?.food_nutritions.length <= 0) {
            console.log('gg')
            return nutrition
          }

          const nutritionIndex = item.food?.food_nutritions.findIndex(
            (n) =>
              n.nutrition.nutrition_code === nutrition.nutrition.nutrition_code
          )
          if (nutritionIndex === -1) {
            return nutrition
          }

          nutrition.nutrition_value =
            item.food?.food_nutritions[nutritionIndex]?.nutrition_value *
            factorValue
          return nutrition
        }
        nutrition.nutrition_value = 0
        return nutrition
      })
    })

    // to display all the nutrtion value for each food item (for testing purpose)
    // console.log(array.map((a) => a.map((i) => i.nutrition_value)));

    const results = array.reduce((acc, value) => {
      // if value is empty array, for each does not execute
      value.forEach((k, index) => {
        acc[index].nutrition_value += k.nutrition_value
      })
      return acc
    }, nutritions)
    return results
  }

  const renderContent = () => {
    if (currentTab === 0) {
      return (
        <>
          <div className='flex xs:mt-0 justify-between items-center w-80'>
            <img
              src={`${BASE_URL}image/${patientId}/${data?.image}`}
              className='object-cover h-40 w-full rounded-lg'
            />
          </div>
          <div className='bg-gray-100 dark:bg-gray-800 px-4 py-2 mt-3 rounded-lg text-sm shadow-md'>
            <div className='flex w-full flex-row dark-enabled-text items-center justify-between'>
              <p>Meal Date: </p>
              <p>{`${dateObj.day} ${dateObj.month} ${dateObj.year} | ${dateObj.timeIn12NoSecs}`}</p>
            </div>
            <div className='flex w-full flex-row mt-1 dark-enabled-text items-center justify-between'>
              <p>Blood Glucose:</p>
              <p>{data?.blood_glucose ? data.blood_glucose : 'Not Provided'}</p>
            </div>
          </div>
          <div className='bg-gray-100 dark:bg-gray-800 px-4 py-4 mt-3 rounded-lg text-sm shadow-md'>
            {data?.food_items.length > 0
              ? (
              <table className='min-w-full leading-normal border-transparent border-none table-auto'>
                <thead>
                  <tr>
                    <th className='px-3 py-1 text-left text-xs font-bold dark-enabled-text uppercase tracking-wider border-b border-gray-400'>
                      Food Items
                    </th>
                    <th className='px-3 py-1 text-right text-xs font-bold dark-enabled-text uppercase tracking-wider border-b border-gray-400'>
                      Amount Consumed
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data?.food_items.map((food, Indx) => (
                    <tr key={Indx}>
                      <td className='px-3 py-2 border-b border-gray-400'>
                        <p className='dark-enabled-text whitespace-no-wrap'>
                          {food.food?.food_name ?? food.new_food_type}
                        </p>
                      </td>
                      <td className='px-3 py-2 border-b border-gray-400 text-right'>
                        <p className='dark-enabled-text whitespace-no-wrap'>
                          {food?.per_unit_measurement ?? '0'} {food.measurement?.suffix ?? 'g'}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
                )
              : (
              <div className='flex dark-enabled-text justify-center'>
                No food items
              </div>
                )}
          </div>
        </>
      )
    } else {
      return (
        <>
          {data.food_items && selectedNutrition.length > 0
            ? (
            <div className='flex xs:mt-0 justify-between items-center w-80'>
              <div className='bg-gray-100 dark:bg-gray-800 px-4 py-4 rounded-lg text-sm shadow-md w-full'>
                <div className='flex flex-row justify-between items-center'>
                  <p className='dark-enabled-text text-lg'>
                    Total Meal Nutrition
                  </p>
                  <button className='dark-enabled-text' onClick={toggleDialog}>
                    <CogIcon className='h-5 w-5' />
                  </button>
                </div>
                {totalFood(data?.food_items, foodNutritions).map((n, i) => {
                  if (n.selected) {
                    return (
                      <div
                        key={i}
                        className='flex flex-row mt-1 justify-between py-2 border-b-1'>
                        <p className='dark-enabled-text text-xs font-thin'>
                          {`${processNutritionName(n)} (${
                            n.nutrition.nutrition_measurement_suffix
                          })`}
                        </p>
                        <p className='dark-enabled-text text-xs'>
                          {n.nutrition_value.toFixed(2)}
                        </p>
                      </div>
                    )
                  }
                  return null
                })}
              </div>
            </div>
              )
            : (
            <div className='flex xs:mt-0 justify-between items-center w-80'>
              <div className='bg-gray-100 dark:bg-gray-800 px-4 py-4 mt-3 rounded-lg text-sm shadow-md w-full'>
                <div className='flex flex-row justify-between items-center'>
                  <p className='dark-enabled-text text-lg'>
                    Total Meal Nutrition
                  </p>
                  <button className='dark-enabled-text' onClick={toggleDialog}>
                    <CogIcon className='h-5 w-5' />
                  </button>
                </div>
                <div className='flex justify-center dark-enabled-text px-4 py-1 bg-white dark:bg-gray-700 mt-3 rounded-lg'>
                  Nothing to show.
                </div>
              </div>
            </div>
              )}

          {data.food_items.map((item, Indx) => (
            <div
              key={Indx}
              className='flex xs:mt-0 justify-between items-center w-80'>
              <div className='bg-gray-100 dark:bg-gray-800 px-4 py-4 mt-3 rounded-lg text-sm shadow-md w-full'>
                <div className='flex flex-row justify-between items-center'>
                  <div className='flex flex-col'>
                    <p className='dark-enabled-text text-lg'>
                      {item.new_food_type ?? item.food.food_name}
                    </p>
                    <p className='text-xs text-indigo-400'>
                      {item.per_unit_measurement}{' '}
                      {item.measurement?.measurement_description}
                    </p>
                  </div>
                  <div className='flex flex-col'>
                    <p className='dark-enabled-text text-xs'>
                      Consumed: {item.volume_consumed * 100}%
                    </p>
                    <ProgressBar percent={item.volume_consumed * 100} />
                  </div>
                </div>
                {selectedNutrition.length > 0
                  ? (
                      foodNutritions.map((n) => {
                        let value
                        const nutritionIndex = item.food?.food_nutritions.findIndex(
                          (nutrition) =>
                            nutrition.nutrition.nutrition_code ===
                        n.nutrition.nutrition_code
                        )

                        if (nutritionIndex === -1) value = 0
                        if (n.selected) {
                          return (
                        <div
                          key={n.nutrition.nutrition_code}
                          className='flex flex-row mt-1 justify-between py-2 border-b-1'>
                          <p className='dark-enabled-text text-xs font-thin'>
                            {`${processNutritionName(n)} (${
                              n.nutrition.nutrition_measurement_suffix
                            })`}
                          </p>
                          <p className='dark-enabled-text text-xs'>
                            {(
                              value ??
                              item.per_unit_measurement *
                                (item.measurement
                                  ?.measurement_conversion_to_g ?? 0) *
                                (item.food?.food_nutritions.length > 0
                                  ? item.food.food_nutritions[nutritionIndex]
                                    ?.nutrition_value
                                  : 0) *
                                item.volume_consumed
                            ).toFixed(2)}
                          </p>
                        </div>
                          )
                        }
                        return ''
                      })
                    )
                  : (
                  <div className='flex justify-center dark-enabled-text px-4 py-1 bg-white dark:bg-gray-700 mt-3 rounded-lg'>
                    Nothing to show.
                  </div>
                    )}
              </div>
            </div>
          ))}
        </>
      )
    }
  }

  // nutrition modal states & functions
  const [visibleDialog, setVisibleDialog] = useState(false)
  const toggleDialog = () => {
    setVisibleDialog(!visibleDialog)
  }

  return (
    <div className='px-4'>
      <div className='py-2'>
        <div className='dark-enabled-text mb-5 bg-gray-100 dark:bg-gray-800'>
          <button
            className={`px-4 py-2 ${
              currentTab === 0
                ? 'border-b-4 border-indigo-500 text-indigo-500'
                : ''
            }  focus:outline-none`}
            onClick={() => setCurrentTab(0)}>
            Meal Info
          </button>
          {/* <span className='border-r-1 mx-4'></span> */}
          <button
            className={`px-4 py-2 ${
              currentTab === 1
                ? 'border-b-4 border-indigo-500 text-indigo-500'
                : ''
            }  focus:outline-none`}
            onClick={() => setCurrentTab(1)}>
            Nutritions
          </button>
        </div>

        {renderContent()}
      </div>
      <div>
        <NutritionModal
          show={visibleDialog}
          toggleModal={toggleDialog}
          selectedNutritions={selectedNutrition}
          foodNutritions={foodNutritions}
          setFoodNutritions={setFoodNutritions}
        />
      </div>
    </div>
  )
}

MealDetailBoard.propTypes = {
  data: PropTypes.object,
  patientId: PropTypes.string
}

export default MealDetailBoard
