import React, { useEffect, useState, useMemo, forwardRef } from 'react'
import GraphChart from 'components/LineGraphChart'
import GridContentCardContainer from 'containers/Content/GridContentCardContainer'
import HealthRecord from 'models/HealthRecord'
import { getNumOfDaysInMonth } from 'utilities/DateTimeHelper'
import HttpHelper from 'utilities/HttpHelper'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import MealRecord from 'models/MealRecord'
import NutritionModal from 'components/NutritionModal'
import ContentCardContainer from 'containers/Content/ContentCardContainer'
import {
  CircularProgressbarWithChildren,
  buildStyles
} from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { useThemeProvider } from 'providers/ThemeProvider'
import { useAuthProvider } from 'providers/AuthProvider'
import {
  BarChartDataset,
  ChartData,
  LineChartDataset,
  ChartOptions
} from 'models/ChartModels'
import { format } from 'date-fns'
import {
  CogIcon,
  CalendarIcon,
  ExclamationCircleIcon
} from '@heroicons/react/solid'
// import { CalendarIcon } from '@heroicons/react/outline'
import { useParams } from 'react-router-dom'
import {
  FOOD_NUTRITIONS,
  processNutritionName,
  defaultSelectedNutrition,
  calculateCalories,
  nutritionCalculation
} from 'utilities/NutritionHelper'
import { PatientProfile } from 'models/PatientProfile'

// const myfood = require('data/food.json')
// const myhealth = require('data/health.json')

function healthArrayReducer (healthArray) {
  const accumulator = {
    physicalMinutes: 0,
    waistCircumference: 0,
    weight: 0
  }
  let numOfDays = 0
  const totalMonthHealth = healthArray.reduce((acc, item) => {
    if (item) {
      acc.physicalMinutes += item.physicalMinutes
      acc.waistCircumference += item.waistCircumference
      acc.weight += item.weight
      numOfDays++
      return acc
    }
    return acc
  }, accumulator)
  Object.keys(totalMonthHealth).forEach(key => {
    totalMonthHealth[key] /= numOfDays === 0 ? 1 : numOfDays
  })
  return totalMonthHealth
}

function processMealRecord (date, mealRecords) {
  let earliestDate = new Date()
  let latestDate
  const array = mealRecords.map((record) => {
    const myrecord = new MealRecord(record)
    earliestDate = earliestDate < myrecord.date ? earliestDate : myrecord.date
    latestDate = latestDate > myrecord.date ? latestDate : myrecord.date
    return myrecord
  })
  const dayArray = new Array(getNumOfDaysInMonth(date))
    .fill(undefined)
    .map((item, index) => index + 1)
  const dataArrayPerMonth = new Array(getNumOfDaysInMonth(date)).fill(
    undefined
  )
  const monthArray = array.filter(
    (record) =>
      record.date.getMonth() === date.getMonth() &&
      record.date.getFullYear() === date.getFullYear()
  )
  monthArray.forEach((record) => {
    const day = record.date.getDate() - 1
    // if item is undefined place an empty array
    dataArrayPerMonth[day] = dataArrayPerMonth[day] ?? []
    dataArrayPerMonth[day].push(record)
  })

  const processedData = dataArrayPerMonth.map((day) => {
    // Only if item is undefined
    if (!day) {
      return undefined
    }

    if (day.length === 1) {
      return day[0]
    }

    return day.reduce((acc, item) => {
      acc.bloodGlucose = item.bloodGlucose
        ? (acc.bloodGlucose + item.bloodGlucose) / 2
        : acc.bloodGlucose
      acc.foodItems = acc.foodItems.concat(item.foodItems)
      return acc
    })
  })

  return [dayArray, processedData, [earliestDate, latestDate]]
}

function processHealthRecord (date, healthRecords) {
  let earliestDate = new Date()
  let latestDate
  const array = healthRecords.map((record) => {
    const myrecord = new HealthRecord(record)
    earliestDate = earliestDate < myrecord.date ? earliestDate : myrecord.date
    latestDate = latestDate > myrecord.date ? latestDate : myrecord.date
    return myrecord
  })
  const dayArray = new Array(getNumOfDaysInMonth(date))
    .fill(undefined)
    .map((item, index) => index + 1)
  const dataArrayPerMonth = new Array(getNumOfDaysInMonth(date)).fill(
    undefined
  )
  const monthArray = array.filter(
    (record) =>
      record.date.getMonth() === date.getMonth() &&
      record.date.getFullYear() === date.getFullYear()
  )
  monthArray.forEach((record) => {
    const day = record.date.getDate() - 1
    // if item is undefined place an empty array
    dataArrayPerMonth[day] = dataArrayPerMonth[day] ?? []
    dataArrayPerMonth[day].push(record)
  })

  const processedData = dataArrayPerMonth.map((day) => {
    // Only if item is undefined
    if (!day) {
      return undefined
    }

    if (day.length === 1) {
      return day[0]
    }

    return day.reduce((acc, item) => {
      acc.physicalMinutes += item.physicalMinutes
      acc.waistCircumference =
        (acc.waistCircumference + item.waistCircumference) / 2
      acc.weight = (acc.weight + item.weight) / 2
      return acc
    })
  })

  return [dayArray, processedData, [earliestDate, latestDate]]
}

// Main Page Component
const ChartsDashboard = () => {
  // display healthcharts if true, else mealcharts
  const [authState] = useAuthProvider()
  const [healthCharts, setHealthCharts] = useState(true)
  const [healthData, setHealthData] = useState([])
  const [mealData, setMealData] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [month, setMonth] = useState(0)
  const [currentMealNutrition, setCurrentMealNutrition] = useState(undefined)
  const [
    numOfHealthDays,
    myHealthData,
    smallestLargestHealthYearHealth
  ] = useMemo(() => processHealthRecord(currentDate, healthData), [
    month,
    healthData
  ])
  const [
    numOfMealDays,
    myMealData,
    smallestLargestHealthYearMeal
  ] = useMemo(() => processMealRecord(currentDate, mealData), [
    month,
    mealData
  ])

  const [currentPatient, setCurrentPatient] = useState(new PatientProfile(new Date(), undefined))
  const monthHealthAverage = useMemo(() => healthArrayReducer(myHealthData), [myHealthData])
  const dailyRecommendedCalories = useMemo(() => calculateCalories(currentPatient.getBMR(monthHealthAverage.weight), monthHealthAverage.physicalMinutes), [currentPatient, monthHealthAverage])

  // @ts-ignore
  const { id } = useParams()
  const [dark] = useThemeProvider()

  const [selectedNutrition] = useState(defaultSelectedNutrition)
  const [foodNutritions, setFoodNutritions] = useState(
    FOOD_NUTRITIONS.map((f) => ({
      ...f,
      selected: selectedNutrition.includes(f.nutrition.nutrition_code)
    }))
  )

  const [visibleDialog, setVisibleDialog] = useState(false)
  const toggleDialog = () => {
    setVisibleDialog(!visibleDialog)
  }

  async function fetchData () {
    try {
      const [profile, health, meals] = await Promise.all([
        HttpHelper.Get.GetClinicianAssignedUserHealthProfile(
          id,
          authState.token
        ),
        HttpHelper.Get.GetClinicianAssignedUserHealthRecords(
          id,
          authState.token
        ),
        HttpHelper.Get.GetClinicianAssignedUserMealRecords(id, authState.token)
      ])

      // // Testing Only
      // const response = {
      //   data: [myhealth, myfood],
      //   error: false
      // }

      if (!health?.error && !meals?.error) {
        setHealthData(health.data ?? [])
        setMealData(meals.data ?? [])

        // Need to get a patient's height
        if (profile) {
          setCurrentPatient(new PatientProfile(
            new Date(profile.date_of_birth),
            profile.gender?.toLowerCase(),
            profile.height
          ))
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getElementAtEvent = (element) => {
    if (!element.length) return

    const { _index } = element[0]
    const date = new Date(currentDate)
    date.setDate(_index + 1)
    setCurrentDate(date)
  }

  useEffect(() => {
    const lMonth = currentDate.getMonth()
    if (lMonth !== month) {
      setMonth(lMonth)
    }
  }, [currentDate])

  useEffect(() => {
    setCurrentMealNutrition(
      myMealData[currentDate.getDate() - 1]?.getTotalMealNutrition()
    )
  }, [myMealData, currentDate])

  useEffect(() => {
    // Need to fetch patient data on first load
    fetchData()
  }, [])

  // eslint-disable-next-line react/display-name
  const CustomDateBox = forwardRef(
    // @ts-ignore
    // eslint-disable-next-line react/prop-types
    ({ value, onClick }, ref) => (
      <button
        className='px-4 gradient-bg-1 py-1 text-white text-sm font-medium rounded-lg flex justify-center items-center focus:outline-none'
        onClick={onClick}
        ref={ref}>
        {value} <CalendarIcon className='ml-2 w-5 h-5' />
      </button>
    )
  )

  return (
    <div className='flex flex-col min-h-screen'>
      <ContentCardContainer>
        <div className='px-4 py-4'>
          <div>
            <h2 className='font-bold text-xl leading-tight dark-enabled-text'>
              Charts
            </h2>
          </div>
          <div className='flex flex-col mt-5'>
            {/* Button components */}
            <div className='flex w-auto flex-row dark:bg-gray-800 bg-gray-100 rounded-t-lg'>
              <button
                className={`px-4 py-2 mr-4 dark-enabled-tex focus:outline-none ${
                  healthCharts
                    ? 'border-b-4 border-indigo-500 text-indigo-500'
                    : 'dark-enabled-text'
                }`}
                onClick={() => setHealthCharts(true)}>
                Health
              </button>
              <button
                className={`px-4 py-2 mr-4 focus:outline-none ${
                  !healthCharts
                    ? 'border-b-4 border-indigo-500 text-indigo-500'
                    : 'dark-enabled-text'
                }`}
                onClick={() => setHealthCharts(false)}>
                Meals
              </button>
            </div>

            <div className='mt-5 px-2'>
              <span className='mr-1 dark-enabled-text'>Record Date: </span>
              <DatePicker
                dateFormat='MMMM yyyy'
                selected={currentDate}
                onChange={(date) => setCurrentDate(date)}
                minDate={
                  smallestLargestHealthYearHealth[0] >
                  smallestLargestHealthYearMeal[0]
                    ? smallestLargestHealthYearMeal[0].setDate(1)
                    : smallestLargestHealthYearHealth[0].setDate(1)
                }
                showMonthYearPicker
                showFullMonthYearPicker
                customInput={<CustomDateBox />}
              />
            </div>
          </div>
          <div className='flex flex-row my-2 items-center px-2'>
            <ExclamationCircleIcon className='w-5 h-5 text-indigo-500 mr-2' />
            <p className='text-indigo-400'>
              You can select a month and year to see the summary visualizing
              records.
            </p>
          </div>
          {/* Health Charts only */}
          {healthCharts && (
            <div className='grid gap-3 md:grid-cols-2 auto-row-min mt-5'>
              <div className='h-96 col-span-full px-4 pt-4 pb-8 mb-3 dark:bg-gray-800 bg-gray-100 rounded-lg'>
                <p className='text-sm mb-2 text-indigo-500 font-medium text-center'>
                  Weight(kg) & Waist Circumference (cm)
                </p>
                <GraphChart
                  data={
                    new ChartData(numOfHealthDays, [
                      new LineChartDataset(
                        'Weight (kg)',
                        myHealthData.map((item) => item?.weight),
                        '#6366F1'
                      ),
                      new BarChartDataset(
                        'Waist Circumference (cm)',
                        myHealthData.map((item) => item?.waistCircumference),
                        '#ed64a6'
                      )
                    ])
                  }
                  options={
                    new ChartOptions(
                      dark,
                      '',
                      `Day of Month (${format(
                        new Date(currentDate),
                        'MMM-yyyy'
                      )})`,
                      '',
                      false
                    )
                  }
                />
              </div>
              <div className='h-72 px-4 pt-4 pb-8 dark:bg-gray-800 bg-gray-100 rounded-lg'>
                <p className='text-sm mb-2 text-indigo-500 font-medium text-center'>
                  Physical Exercise
                </p>
                <GraphChart
                  data={
                    new ChartData(numOfHealthDays, [
                      new LineChartDataset(
                        'Physical Exercise',
                        myHealthData.map((item) => item?.physicalMinutes),
                        '#6366F1'
                      )
                    ])
                  }
                  options={
                    new ChartOptions(
                      dark,
                      '',
                      `Day of Month (${format(
                        new Date(currentDate),
                        'MMM-yyyy'
                      )})`,
                      '(Minutes)',
                      false
                    )
                  }
                />
              </div>
              <div className='h-72 px-4 pt-4 pb-8 dark:bg-gray-800 bg-gray-100 rounded-lg'>
                <p className='text-sm mb-2 text-indigo-500 font-medium text-center'>
                  BMI
                </p>
                <GraphChart
                  data={
                    new ChartData(numOfHealthDays, [
                      new BarChartDataset(
                        'BMI',
                        myHealthData.map(
                          (item) =>
                            (
                              item?.weight /
                              (currentPatient.height / 100) ** 2
                            )?.toFixed(2) ?? 0
                        ),
                        '#6366F1'
                      )
                    ])
                  }
                  options={
                    new ChartOptions(
                      dark,
                      '',
                      `Day of Month (${format(
                        new Date(currentDate),
                        'MMM-yyyy'
                      )})`,
                      '',
                      false
                    )
                  }
                />
              </div>
            </div>
          )}

          {/* Meal Charts only */}
          {!healthCharts && (
            <div>
              {/* Upper Full Stretch Charts */}
              <div className='grid gap-3 grid-cols-2 md:grid-cols-6 mt-5'>
                <div className='col-span-full h-72 px-4 pt-4 pb-8 mb-3 dark:bg-gray-800 bg-gray-100 rounded-lg'>
                  <p className='text-sm mb-2 text-indigo-500 font-medium text-center'>
                    Enegry(kcal) & Water(g)
                  </p>
                  <GraphChart
                    data={
                      new ChartData(numOfMealDays, [
                        new LineChartDataset(
                          'Energy (kcal)',
                          myMealData.map((item) =>
                            item
                              ?.getTotalMealNutrition()
                              .find((item) => item.name === 'energy')
                              ?.value?.toFixed(2)
                          ),
                          '#ed64a6'
                        ),
                        new LineChartDataset(
                          'Water (g)',
                          myMealData.map((item) =>
                            item
                              ?.getTotalMealNutrition()
                              .find((item) => item.name === 'water')
                              ?.value.toFixed(2)
                          ),
                          '#6366F1'
                        )
                      ])
                    }
                    options={
                      new ChartOptions(
                        dark,
                        '',
                        `Day of Month (${format(
                          new Date(currentDate),
                          'MMM-yyyy'
                        )})`,
                        '',
                        false
                      )
                    }
                    event={getElementAtEvent}
                  />
                </div>
              </div>

              <div className='flex flex-col px-4 pt-4 pb-8 mb-3 dark:bg-gray-800 bg-gray-100 rounded-lg'>
                <div className='flex flex-row justify-between items-center mb-5'>
                  <span></span>
                  <span className='text-indigo-500'>
                    Daily Nutrition Value for (
                    {format(new Date(currentDate), 'dd-MMM-yyyy')})
                  </span>
                  <button className='dark-enabled-text' onClick={toggleDialog}>
                    <CogIcon className='h-5 w-5' />
                  </button>
                </div>
                <div className='flex flex-row mb-3 items-center px-2'>
                  <ExclamationCircleIcon className='w-5 h-5 text-indigo-500 mr-2' />
                  <p className='text-indigo-400'>
                    Click on the point on above line chart to view the nutrition
                    values.
                  </p>
                </div>
                {/* Lower Progress Charts */}
                <div className='grid gap-3 grid-cols-2 md:grid-cols-7'>
                  {/* Map to each nutrition, will return nothing if limit greater than 0 */}
                  {foodNutritions.map((nutritionItem, index) => {
                    const nutritionValue = (
                      currentMealNutrition?.find(
                        (item) =>
                          item.name === nutritionItem.nutrition.nutrition_name
                      )?.value ?? 0
                    ).toFixed(2)
                    return nutritionItem.limit > 0 && nutritionItem.selected
                      ? (
                      <GridContentCardContainer key={index}>
                        <CircularProgressbarWithChildren
                          value={nutritionValue}
                          maxValue={nutritionCalculation(dailyRecommendedCalories, nutritionItem.limit) ?? 0}
                          styles={buildStyles({
                            pathColor:
                              nutritionValue > nutritionCalculation(dailyRecommendedCalories, nutritionItem.limit) &&
                              nutritionItem.restricted
                                ? '#DC2626'
                                : nutritionValue > nutritionCalculation(dailyRecommendedCalories, nutritionItem.limit)
                                  ? '#10B981'
                                  : '#6366F1'
                          })}>
                          <span className='dark-enabled-text text-xs'>
                            {processNutritionName(nutritionItem)}
                          </span>
                          <span className='dark-enabled-text text-xs'>
                            {nutritionValue}/{nutritionCalculation(dailyRecommendedCalories, nutritionItem.limit) ?? ''}
                          </span>
                          <span className='dark-enabled-text text-xs'>
                            {
                              nutritionItem.nutrition
                                .nutrition_measurement_suffix
                            }
                          </span>
                        </CircularProgressbarWithChildren>
                      </GridContentCardContainer>
                        )
                      : (
                      <></>
                        )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </ContentCardContainer>

      <NutritionModal
        show={visibleDialog}
        toggleModal={toggleDialog}
        selectedNutritions={selectedNutrition}
        foodNutritions={foodNutritions}
        setFoodNutritions={setFoodNutritions}
      />
    </div>
  )
}

export default ChartsDashboard
