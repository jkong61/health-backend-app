/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-unused-vars */
/* eslint-disable no-tabs */
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import HttpHelper from 'utilities/HttpHelper'
import { getDateObjFromISOString } from 'utilities/DateTimeHelper'
import { useAuthProvider } from 'providers/AuthProvider'
import { ExclamationCircleIcon, DocumentTextIcon, ChartBarIcon } from '@heroicons/react/solid'
import { BASE_URL } from 'utilities/Constant'
import MealDetailBoard from 'components/MealDetailBoard'
import HealthDetailBoard from 'components/HealthDetailBoard'
import useLoading from 'utilities/customHooks/useLoading'
import { Link } from 'react-router-dom'

const GRADIENT_BGS = [
  'gradient-bg-1',
  'gradient-bg-2',
  'gradient-bg-3',
  'gradient-bg-4',
  'gradient-bg-5'
]

const PatientMealHealthBoard = ({ title, patientId }) => {
  const [MYDATA, setMYDATA] = useState([])
  const [currentData, setCurrentData] = useState(MYDATA)
  const defaultDtState = {
    num_item_per_page: 5,
    total_item: currentData.length,
    pages: MYDATA.length > 0 ? Math.ceil(currentData.length / 5) : 1,
    page_limit: 5
  }

  const [currentPageData, setCurrentPageData] = useState(
    currentData.slice(0, defaultDtState.page_limit)
  )
  const [dtState, setDtState] = useState(defaultDtState)
  const [currentPage, setCurrentPage] = useState(1)
  const [targetObject, setTargetObject] = useState()
  const [authState] = useAuthProvider()
  const [currentTab, setCurrentTab] = useState(0)

  const switchTab = (val) => {
    setCurrentTab(val)
    setTargetObject(null)
    setCurrentPage(1)
    setDtState(defaultDtState)
    setMYDATA([])
    setCurrentData([])
    setCurrentPageData([])
    if (val === 0) getPatientMeal()
    else getPatientHealth()
  }

  // render the body of list box
  const renderBody = () => {
    if (MYDATA.length === 0) {
      return (
        <div className='inline-block rounded-lg overflow-hidden shadow-md mb-2 w-full'>
          <div className='flex flex-col justify-center items-center bg-gray-100 dark:bg-gray-800 w-full h-20 p-4 dark-enabled-text'>
            <ExclamationCircleIcon className='w-8 h-8' />
            <p>Nothing to show.</p>
          </div>
        </div>
      )
    }
    if (currentTab === 0) {
      return (
        <>
          {currentPageData.map((row, Indx) => {
            const dateObj = getDateObjFromISOString(row.date_created)
            return (
              <button
                key={Indx}
                className={`inline-block w-full rounded-lg overflow-hidden shadow-md mb-2 transition duration-300 ease-in-out transform hover:scale-110 focus:outline-none ${targetObject?.meal_id === row.meal_id ? 'dark:bg-gray-600 bg-gray-300' : 'bg-gray-100 dark:bg-gray-800'}`}
                onClick={() => setTargetObject(row)}>
                <div className='flex items-center w-full h-20 text-white'>
                  <img
                    alt='meal'
                    src={`${BASE_URL}image/${patientId}/${row.image}`}
                    className='h-20 w-20 rounded-lg'
                  />
                  <div className='px-5 flex flex-col justify-start items-start'>
                    <p className='text-sm font-medium dark-enabled-text'>{`${dateObj.day} ${dateObj.month} ${dateObj.year}`}</p>
                    <p className='text-xs font-thin dark-enabled-text'>{`${dateObj.weekday} | ${dateObj.timeIn12}`}</p>
                    <div className='flex flex-wrap overflow-hidden h-8'>
                      {row?.food_items?.map((food, Indx2) => (
                        <span
                          key={Indx2}
                          className={`px-2 py-1 ${GRADIENT_BGS[Indx]} rounded-lg mr-2 mt-1 mb-1 text-xs font-extralight`}>
                          {food?.food
                            ? food?.food?.food_name
                            : food.new_food_type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </>
      )
    } else {
      return (
        <>
          {currentPageData.map((row, Indx) => {
            const dateObj = getDateObjFromISOString(row.date_created)
            return (
              <button
                key={Indx}
                className={`inline-block w-full rounded-lg overflow-hidden shadow-md mb-2 transition duration-300 ease-in-out transform hover:scale-110 focus:outline-none ${targetObject?.health_record_id === row.health_record_id ? 'dark:bg-gray-600 bg-gray-300' : 'bg-gray-100 dark:bg-gray-800'}`}
                onClick={() => setTargetObject(row)}>
                <div className='flex items-center w-full h-20 text-white'>
                  <div className={`w-20 h-20 ${GRADIENT_BGS[Indx]} flex items-center justify-center`}>
                    <DocumentTextIcon className='w-10 h-10' />
                  </div>
                  <div className='px-5 flex flex-col justify-start items-start'>
                    <p className='text-sm font-medium dark-enabled-text'>{`${dateObj.day} ${dateObj.month} ${dateObj.year}`}</p>
                    <p className='text-xs font-thin dark-enabled-text'>{`${dateObj.weekday} | ${dateObj.timeIn12}`}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </>
      )
    }
  }

  // current data handler
  const currentPageDataHandler = (
    page = 1,
    numItemPerPage = dtState.num_item_per_page,
    currData = currentData
  ) => {
    const startIndex = (page - 1) * numItemPerPage
    const end = startIndex + numItemPerPage
    const dataInPage = currData.slice(startIndex, end)
    setCurrentPageData(dataInPage)
    setCurrentPage(page)
  }

  async function fetchUserMealRecords () {
    let res = await HttpHelper.Get.GetClinicianAssignedUserMealRecords(
      patientId,
      authState.token
    )
    if (res.error) {
      return
    }
    res = res.data
    setDtState({
      ...dtState,
      total_item: res.length,
      pages: res.length > 0 ? Math.ceil(res.length / 5) : 1
    })
    setMYDATA(res)
    setCurrentData(res)
    setCurrentPageData(res.slice(0, 5))
  }

  async function fetchUserHealthRecord () {
    let res = await HttpHelper.Get.GetClinicianAssignedUserHealthRecords(
      patientId,
      authState.token
    )
    if (res.error) {
      return
    }
    res = res.data
    setDtState({
      ...dtState,
      total_item: res.length,
      pages: res.length > 0 ? Math.ceil(res.length / 5) : 1
    })
    setMYDATA(res)
    setCurrentData(res)
    setCurrentPageData(res.slice(0, 5))
  }

  const [getPatientMeal, loadingMeal] = useLoading(fetchUserMealRecords)
  const [getPatientHealth, loadingHealth] = useLoading(fetchUserHealthRecord)

  useEffect(() => {
    if (currentTab === 0) getPatientMeal()
    else getPatientHealth()
    return () => {
      setMYDATA([])
      setCurrentData([])
      setCurrentPageData([])
    }
  }, [])

  return (
    <div className='antialiased font-san flex flex-col'>
      <div className='px-4'>
        <div className='py-4'>
          <div className='flex justify-between'>
            <h2 className='font-bold text-xl leading-tight dark-enabled-text'>
              {title ?? 'Untitled'}
            </h2>
            <Link
              className={'flex justify-center items-center px-4 py-1 focus:outline-none gradient-bg-1 text-white rounded-lg'}
              to={`/patients/${patientId}/chart`}
            >
             <ChartBarIcon className='w-5 h-5 mx-2'/> View Charts
            </Link>
          </div>
          <div className='flex w-auto flex-row mt-5 dark:bg-gray-800 bg-gray-100 dark-enabled-text'>
            <button
              className={`px-4 py-2 mr-4 focus:outline-none ${
                currentTab === 0 && 'border-b-4 border-indigo-500 text-indigo-500'
              }`}
              onClick={() => switchTab(0)}>
              Meal History
            </button>
            <button
              className={`px-4 py-2 mr-4 focus:outline-none ${
                currentTab === 1 && 'border-b-4 border-indigo-500 text-indigo-500'
              }`}
              onClick={() => switchTab(1)}>
              Health History
            </button>
          </div>
        </div>
      </div>

      {currentTab === 0
        ? !loadingMeal && (
            <div className='flex flex-row justify-between my-2 px-4'>
              <div>
                <div className='pt-2 w-72'>{renderBody()}</div>
                <div className='flex xs:mt-0 justify-between items-center w-72'>
                  <span className='text-xs xs:text-sm dark-enabled-text'>
                    Showing {(currentPage - 1) * dtState.num_item_per_page + 1}{' '}
                    to{' '}
                    {(currentPage - 1) * dtState.num_item_per_page +
                      currentPageData.length}{' '}
                    of {dtState.total_item} Entries
                  </span>
                  <div>
                    <button
                      className={`text-sm bg-gray-100 border border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:hover:bg-gray-900 hover:bg-gray-200 dark-enabled-text font-semibold py-2 px-4 rounded-l focus:outline-none ${
                        currentPage === 1 && 'cursor-not-allowed'
                      }`}
                      onClick={() => currentPageDataHandler(currentPage - 1)}
                      disabled={currentPage === 1}>
                      Prev
                    </button>
                    <button
                      className={`text-sm bg-gray-100 border border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:hover:bg-gray-900 hover:bg-gray-200 dark-enabled-text font-semibold py-2 px-4 rounded-r focus:outline-none ${
                        currentPage === dtState.pages && 'cursor-not-allowed'
                      }`}
                      onClick={() => currentPageDataHandler(currentPage + 1)}
                      disabled={currentPage === dtState.pages}>
                      Next
                    </button>
                  </div>
                </div>
              </div>

              {targetObject
                ? (
                <MealDetailBoard data={targetObject} patientId={patientId} />
                  )
                : (
                <div className='flex xs:mt-0 justify-between items-center w-80'></div>
                  )}
            </div>
          )
        : !loadingHealth && (
            <div className='flex flex-row justify-between my-2 px-4'>
              <div>
                <div className='pt-2 w-72'>{renderBody()}</div>
                <div className='flex xs:mt-0 justify-between items-center w-72'>
                  <span className='text-xs xs:text-sm dark-enabled-text'>
                    Showing {(currentPage - 1) * dtState.num_item_per_page + 1}{' '}
                    to{' '}
                    {(currentPage - 1) * dtState.num_item_per_page +
                      currentPageData.length}{' '}
                    of {dtState.total_item} Entries
                  </span>
                  <div>
                    <button
                      className={`text-sm bg-gray-100 border border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:hover:bg-gray-900 hover:bg-gray-200 dark-enabled-text font-semibold py-2 px-4 rounded-l focus:outline-none ${
                        currentPage === 1 && 'cursor-not-allowed'
                      }`}
                      onClick={() => currentPageDataHandler(currentPage - 1)}
                      disabled={currentPage === 1}>
                      Prev
                    </button>
                    <button
                      className={`text-sm bg-gray-100 border border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:hover:bg-gray-900 hover:bg-gray-200 dark-enabled-text font-semibold py-2 px-4 rounded-r focus:outline-none ${
                        currentPage === dtState.pages && 'cursor-not-allowed'
                      }`}
                      onClick={() => currentPageDataHandler(currentPage + 1)}
                      disabled={currentPage === dtState.pages}>
                      Next
                    </button>
                  </div>
                </div>
              </div>
              {targetObject
                ? (
                <HealthDetailBoard data={targetObject} patientId={patientId} />
                  )
                : (
                <div className='flex xs:mt-0 justify-between items-center w-80'></div>
                  )}
            </div>
          )}
    </div>
  )
}

PatientMealHealthBoard.propTypes = {
  title: PropTypes.string,
  patientId: PropTypes.string
}

export default PatientMealHealthBoard
