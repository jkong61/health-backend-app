/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-unused-vars */
/* eslint-disable no-tabs */
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import ConfirmationModal from 'components/ConfirmationModal'
import { ReactComponent as SearchLogo } from 'svgs/search.svg'
import HttpHelper from 'utilities/HttpHelper'
import { useAuthProvider } from 'providers/AuthProvider'
import { AssignmentProviderDispatchMethodConstants } from 'providers/AssignmentProvider'
import {
  ClipboardListIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/solid'

const GRADIENT_BGS = [
  'gradient-bg-1',
  'gradient-bg-2',
  'gradient-bg-3',
  'gradient-bg-4',
  'gradient-bg-5'
]
const defaultData = [
  { user: 'William1', type: 'Admin', date: '2021-03-21', status: 'active' },
  { user: 'Milliam2', type: 'User', date: '2021-05-21', status: 'active' },
  { user: 'William3', type: 'Admin', date: '2021-07-21', status: 'active' },
  { user: 'William4', type: 'Admin', date: '2021-07-21', status: 'active' },
  { user: 'William5', type: 'Admin', date: '2021-07-21', status: 'active' },
  { user: 'William6', type: 'Admin', date: '2021-07-21', status: 'active' },
  { user: 'William7', type: 'Admin', date: '2021-07-21', status: 'active' }
]

const AssignmentListBox = ({ title, data, assignmentDispatch, searchable = true }) => {
  const columns =
		data && data.length > 0
		  ? Object.keys(data[0])
		  : Object.keys(defaultData[0])
  const [MYDATA, setMYDATA] = useState(data || defaultData)
  const [currentData, setCurrentData] = useState(MYDATA)
  const defaultDtState = {
    num_item_per_page: 5,
    total_item: currentData.length,
    pages: data.length > 0 ? Math.ceil(currentData.length / 5) : 1,
    page_limit: 5
  }

  const [currentPageData, setCurrentPageData] = useState(
    currentData.slice(0, 5)
  )
  const [dtState, setDtState] = useState(defaultDtState)
  const [currentPage, setCurrentPage] = useState(1)
  const [query, setQuery] = useState('')
  const [show, setShow] = useState(false)
  const [isAccept, setIsAccept] = useState(true)
  const [targetAssignment, setTargetAssignment] = useState()
  const [authState] = useAuthProvider()

  // clear the query text
  const clearQueryText = () => {
    setQuery('')
    search('')
  }

  // render the body of list box
  const renderBody = () => {
    if (MYDATA.length === 0) {
      return (
				<div className='inline-block min-w-full rounded-lg overflow-hidden shadow-md mb-2'>
					<div className='flex flex-col justify-center items-center bg-gray-100 dark:bg-gray-800 w-full h-20 p-4 dark-enabled-text'>
						<ExclamationCircleIcon className='w-8 h-8' />
						<p>Nothing to show.</p>
					</div>
				</div>
      )
    }
    return (
			<>
				{currentPageData.map((row, Indx) => (
					<div
						key={Indx}
						className='inline-block min-w-full rounded-lg overflow-hidden shadow-md mb-2 transition duration-300 ease-in-out transform hover:scale-110'>
						<div className='flex items-center bg-gray-100 dark:bg-gray-800 w-full h-20 p-4 dark-enabled-text'>
							<div
								className={`h-10 w-10 rounded-full ${GRADIENT_BGS[Indx]} flex justify-center items-center`}>
								<ClipboardListIcon className='h-6 w-6 text-white' />
							</div>
							<div className='h-10 px-5'>
								<p className='text-sm font-medium'>Patient ID: {row.user_id}</p>
								<p className='text-xs font-thin'>Pending: {row.clinician_assignment_id}</p>
							</div>
							<div className='ml-5'>
								<button
									className='ml-2 transition duration-300 ease-in-out transform hover:scale-125 focus:outline-none'
									// @ts-ignore
									onClick={() => acceptAssignment(row.clinician_assignment_id)}>
									<CheckCircleIcon className='h-8 w-8 text-green-400' />
								</button>
								<button
									className='ml-2 transition duration-300 ease-in-out transform hover:scale-125 focus:outline-none'
                                    // @ts-ignore
                                    onClick={() => declineAssignment(row.clinician_assignment_id)}>
									<XCircleIcon className='h-8 w-8 text-red-400' />
								</button>
							</div>
						</div>
					</div>
				))}
			</>
    )
  }

  // query handler
  const search = (val) => {
    setQuery(val)
    const filteredData = MYDATA.filter((row) =>
      columns.some(
        (col) =>
          row[col].toString().toLowerCase().indexOf(val.toLowerCase()) > -1
      )
    )
    if (val === '') {
      setCurrentData(MYDATA)
      setDtState({
        ...dtState,
        total_item: MYDATA.length,
        pages: Math.ceil(MYDATA.length / dtState.num_item_per_page)
      })
      currentPageDataHandler(undefined, undefined, MYDATA)
    } else {
      setCurrentData(filteredData)
      setDtState({
        ...dtState,
        total_item: filteredData.length,
        pages: Math.ceil(filteredData.length / dtState.num_item_per_page)
      })
      currentPageDataHandler(undefined, undefined, filteredData)
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

  // accept assignment handler
  const acceptAssignment = (assignmentId) => {
    setIsAccept(true)
    setTargetAssignment(assignmentId)
    toggleModal()
  }

  // decline assignment handler
  const declineAssignment = (assignmentId) => {
    setIsAccept(false)
    setTargetAssignment(assignmentId)
    toggleModal()
  }

  const assignmentHandler = async () => {
    let res
    if (isAccept) {
      console.log(`Accepting assignment ${targetAssignment}`, typeof targetAssignment)
      // API returns the assignment object as data
      res = await HttpHelper.Get.GetClinicianAcceptAssignment(
        targetAssignment,
        authState.token
      )
    } else {
      console.log(`Decline assignment ${targetAssignment}`, typeof targetAssignment)
      res = await HttpHelper.Get.GetClinicianDeleteAssignment(
        targetAssignment,
        authState.token
      )
    }
    if (!res.error) {
      // update the local state with the new data
      assignmentDispatch({
        type: AssignmentProviderDispatchMethodConstants.UPDATE_ASSGINMENT,
        payload: res.data
      })
      return toggleModal()
    }
    console.log('error')
  }

  const toggleModal = () => {
    setShow(!show)
  }

  useEffect(() => {
    const tempData = data || defaultData
    setMYDATA(tempData)
    setCurrentData(tempData)
    setCurrentPageData(tempData.slice(0, 5))
  }, [data])

  return (
		<div className='antialiased font-san'>
			<div className='container mx-auto px-4 sm:px-8'>
				<div className='py-4'>
					<div>
						<h2 className='font-bold text-xl leading-tight dark-enabled-text'>
							{title ?? 'Untitled'}
						</h2>
					</div>
					<div className='flex w-full flex-row mt-5'>
						{searchable && (
							<div className='relative flex items-center w-full lg:w-40 h-full group'>
								<SearchLogo />
								<input
									type='text'
									className='block w-full py-1.5 pl-10 pr-6 leading-normal rounded-lg focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 ring-opacity-90 bg-gray-100 dark:bg-gray-800 text-gray-400 aa-input'
									placeholder='Search'
									value={query}
									onChange={(e) => search(e.target.value)}
								/>
								{query !== '' && (
									<XCircleIcon
										className='h-6 w-6 absolute right-0 mr-2 text-red-400 cursor-pointer'
										onClick={clearQueryText}
									/>
								)}
							</div>
						)}
					</div>
					<div className='-mx-4 sm:-mx-8 px-4 sm:px-8 pt-4 overflow-x-auto'>
						{renderBody()}
					</div>
					<div className='flex xs:mt-0 justify-between items-center'>
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
			{isAccept
			  ? (
				<ConfirmationModal
					show={show}
					toggleModal={toggleModal}
					title={'Assignment Confirmation'}
					message={'Are you sure you want accept this assginment?'}
					btnStyle={
						'mx-2 px-4 py-2 text-sm font-medium text-gray-100 bg-green-500 border border-transparent rounded-md hover:bg-green-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500'
					}
                    onClick={assignmentHandler}
				/>
			    )
			  : (
				<ConfirmationModal
					show={show}
					toggleModal={toggleModal}
					title={'Assignment Confirmation'}
					message={'Are you sure you want decline this assginment?'}
					btnStyle={
						'mx-2 px-4 py-2 text-sm font-medium text-gray-100 bg-red-500 border border-transparent rounded-md hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500'
					}
                    onClick={assignmentHandler}
				/>
			    )}
		</div>
  )
}

AssignmentListBox.propTypes = {
  title: PropTypes.string,
  data: PropTypes.array,
  assignmentDispatch: PropTypes.func,
  searchable: PropTypes.bool
}

export default AssignmentListBox
