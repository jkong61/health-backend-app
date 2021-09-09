/* eslint-disable array-callback-return */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react'
import {
  useReportProvider
} from 'providers/ReportProvider'
import {
  DocumentTextIcon,
  ExclamationCircleIcon
} from '@heroicons/react/solid'
import { useAssignmentProvider } from 'providers/AssignmentProvider'
import { useHistory } from 'react-router-dom'

const GRADIENT_BGS = [
  'gradient-bg-1',
  'gradient-bg-2',
  'gradient-bg-3',
  'gradient-bg-4',
  'gradient-bg-5'
]

const ReportBoard = () => {
  const [reportState] = useReportProvider()
  const [assignmentState] = useAssignmentProvider()
  const [selectedTab, setSelectedTab] = useState(0)
  const [result, setResult] = useState([])

  const defaultDtState = {
    num_item_per_page: 5,
    total_item: 0,
    pages: Math.ceil(0 / 5),
    page_limit: 5
  }
  const [currentPageData, setCurrentPageData] = useState(
    [].slice(0, defaultDtState.page_limit)
  )
  const [dtState, setDtState] = useState(defaultDtState)
  const [currentPage, setCurrentPage] = useState(1)

  const history = useHistory()

  function getPatientInfo (resultIndex = 0) {
    if (reportState.trend?.result[resultIndex]) {
      const patientIDs = reportState.trend?.result[
        resultIndex
      ]?.data.toString()
      let assignmentInfo = assignmentState.map((ass) => {
        if (patientIDs.includes(ass.user_id)) return ass
      })
      assignmentInfo = assignmentInfo.filter(Boolean)
      setDtState({
        ...dtState,
        total_item: assignmentInfo.length,
        pages: assignmentInfo.length > 0 ? Math.ceil(assignmentInfo.length / 5) : 1
      })
      setCurrentPageData(assignmentInfo.slice(0, 5))
      return assignmentInfo
    }
    return []
  }

  const clickOnTab = (index) => {
    setSelectedTab(index)
    setCurrentPage(1)
    setDtState(defaultDtState)
    setCurrentPageData([])
    setResult(getPatientInfo(index))
  }

  // current data handler
  const currentPageDataHandler = (
    page = 1,
    numItemPerPage = dtState.num_item_per_page,
    currData = result
  ) => {
    const startIndex = (page - 1) * numItemPerPage
    const end = startIndex + numItemPerPage
    const dataInPage = currData.slice(startIndex, end)
    setCurrentPageData(dataInPage)
    setCurrentPage(page)
  }

  useEffect(() => {
    setResult(getPatientInfo(selectedTab))
  }, [reportState.trend.loading])

  return (
    <>
      {Object.keys(reportState.trend.result).length !== 0
        ? (
        <div className='container mx-auto px-4 sm:px-8'>
          <div className='flex justify-between pt-4'>
            <h2 className='font-bold text-xl leading-tight dark-enabled-text'>
              Report
            </h2>
          </div>
          <div className='my-5 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg'>
            <div className='flex w-auto flex-row dark-enabled-text'>
              <button
                className={`px-4 py-2 mr-4 focus:outline-none ${
                  selectedTab === 0 &&
                  'border-b-4 border-indigo-500 text-indigo-500'
                }`}
                onClick={() => clickOnTab(0)}>
                Normal Patient
              </button>
              <button
                className={`px-4 py-2 mr-4 focus:outline-none ${
                  selectedTab === 1 &&
                  'border-b-4 border-indigo-500 text-indigo-500'
                }`}
                onClick={() => clickOnTab(1)}>
                Abnormal Patient
              </button>
            </div>
          </div>
          <div>
            <div className='pt-2 w-72'>
              {result.length > 0
                ? (
                    result.map((row, Indx) => {
                      return (
                    <button
                      key={Indx}
                      className='inline-block rounded-lg overflow-hidden shadow-md mb-2 transition duration-300 ease-in-out transform hover:scale-110 focus:outline-none bg-gray-100 dark:bg-gray-800'
                      onClick={() => history.push(`/patients/${row.user_id}`)}>
                      <div className='flex items-center w-full h-20 text-white'>
                        <div
                          className={`w-20 h-20 ${GRADIENT_BGS[Indx]} flex items-center justify-center`}>
                          <DocumentTextIcon className='w-10 h-10' />
                        </div>
                        <div className='px-5 flex flex-col justify-start items-start'>
                          <p className='text-sm font-medium dark-enabled-text'>
                            Patient ID: {row.user_id}
                          </p>
                          <p className='text-xs font-thin dark-enabled-text'></p>
                        </div>
                      </div>
                    </button>
                      )
                    })
                  )
                : (
                <div className='inline-block rounded-lg overflow-hidden shadow-md mb-2 w-full'>
                  <div className='flex flex-col justify-center items-center bg-gray-100 dark:bg-gray-800 w-full h-20 p-4 dark-enabled-text'>
                    <ExclamationCircleIcon className='w-8 h-8' />
                    <p>Nothing to show.</p>
                  </div>
                </div>
                  )}
            </div>
            <div className='flex mt-5 justify-between items-center w-72'>
              <span className='text-xs xs:text-sm dark-enabled-text'>
                Showing {(currentPage - 1) * dtState.num_item_per_page + 1} to{' '}
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
        </div>
          )
        : (
        <div className='container mx-auto px-4 sm:px-8 flex justify-center items-center'>
          <div className='pt-4'>
            <h2 className='font-bold text-xl leading-tight dark-enabled-text'>
              <ExclamationCircleIcon className='h-10 w-10 mx-auto' />
              Please generate report to view.
            </h2>
          </div>
        </div>
          )}
    </>
  )
}

export default ReportBoard
