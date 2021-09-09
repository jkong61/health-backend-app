import React from 'react'
import PropTypes from 'prop-types'
import { getDateObjFromISOString } from 'utilities/DateTimeHelper'

const HealthDetailBoard = ({ data }) => {
  const dateObj = getDateObjFromISOString(data?.date_created)
  const YesNo = (val) => {
    return val ? 'Yes' : 'No'
  }

  return (
    <div className='px-4'>
    {console.log(data)}
      <div className='dark-enabled-text mb-5'>
        <div className='flex justify-between items-center w-80'>
          <div className='bg-gray-100 dark:bg-gray-800 px-4 py-4 mt-3 rounded-lg text-sm shadow-md w-full'>
            <div className='flex flex-col justify-between items-center'>
              <div className='flex w-full flex-row justify-between dark-enabled-text items-center text-sm'>
                <p>Recorded Date:</p>
                <p>{`${dateObj.day} ${dateObj.month} ${dateObj.year} | ${dateObj.timeIn12NoSecs}`}</p>
              </div>
              <div className='flex w-full flex-row justify-between dark-enabled-text items-center text-sm'>
                <p>Weight (Kg):</p>
                <p>{data.weight}</p>
              </div>
              <div className='flex w-full flex-row justify-between dark-enabled-text items-center text-sm'>
                <p>Waist Circumference (Cm):</p>
                <p>{data.waist_circumference}</p>
              </div>
              <div className='flex w-full flex-row justify-between dark-enabled-text items-center text-sm'>
                <p>Physical Exercise Duration:</p>
                <p>{`${data.physical_exercise_hours} hrs ${data.physical_exercise_minutes} mins`}</p>
              </div>
            </div>
          </div>
        </div>
        <div className='flex justify-between items-center w-80'>
          <div className='bg-gray-100 dark:bg-gray-800 px-4 py-4 mt-3 rounded-lg text-sm shadow-md w-full'>
            <div className='flex flex-col justify-between items-center'>
              <div className='flex w-full flex-row justify-between dark-enabled-text items-center text-sm'>
                <p>Fruit, Berry, Vege:</p>
                <p>{YesNo(data?.vegetable_fruit_berries_consumption)}</p>
              </div>
              <div className='flex w-full flex-row justify-between dark-enabled-text items-center text-sm'>
                <p>Smoking:</p>
                <p>{YesNo(data?.smoking)}</p>
              </div>
            </div>
          </div>
        </div>
        <div className='flex justify-between items-center w-80'>
          <div className='bg-gray-100 dark:bg-gray-800 px-4 py-4 mt-3 rounded-lg text-sm shadow-md w-full'>
            <div className='flex flex-col justify-between items-center'>
              <div className='flex w-full flex-row justify-between dark-enabled-text items-center text-sm'>
                <p>Fasting Blood Glucose:</p>
                <p>{YesNo(data?.fasting_blood_glucose)}</p>
              </div>
              <div className='flex w-full flex-row justify-between dark-enabled-text items-center text-sm'>
                <p>Triglycerides:</p>
                <p>{YesNo(data?.triglycerides)}</p>
              </div>
              <div className='flex w-full flex-row justify-between dark-enabled-text items-center text-sm'>
                <p>Systolic Pressure:</p>
                <p>{YesNo(data?.systolic_pressure)}</p>
              </div>
              <div className='flex w-full flex-row justify-between dark-enabled-text items-center text-sm'>
                <p>HDL Cholesterol:</p>
                <p>{YesNo(data?.hdl_cholesterol)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

HealthDetailBoard.propTypes = {
  data: PropTypes.object
}

export default HealthDetailBoard
