/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-tabs */
/* eslint-disable react/display-name */
import React, { useEffect, useState } from 'react'
import GridContentCardContainer from 'containers/Content/GridContentCardContainer'
import Datatable from 'components/Datatable'
import AssignmentListBox from 'components/AssignmentListBox'
import { useAssignmentProvider } from 'providers/AssignmentProvider'
import { CheckCircleIcon } from '@heroicons/react/solid'
import { useHistory } from 'react-router-dom'

const PatientsBoard = () => {
  const [assignmentState, assignmentDispatch] = useAssignmentProvider()
  // only extract accepted assignments
  const [patientsState, setPatientsState] = useState(
    assignmentState.filter((assign) => assign.assignment_accepted)
  )
  // only extract pending assignments
  const [pendingPatientsState, setPendingPatientsState] = useState(
    assignmentState
      .filter((assign) => assign.assignment_accepted === null)
      .map(({ clinician_assignment_id, user_id }) => ({
        clinician_assignment_id,
        user_id
      }))
  )

  const history = useHistory()
  const clickOnRow = (id) => {
    history.push(`/patients/${id}`)
  }

  useEffect(() => {
    // only extract accepted assignments
    setPatientsState(
      assignmentState.filter((assign) => assign.assignment_accepted)
    )
    // only extract pending assignments
    setPendingPatientsState(
      assignmentState
        .filter((assign) => assign.assignment_accepted === null)
        .map(({ clinician_assignment_id, user_id }) => ({
          clinician_assignment_id,
          user_id
        }))
    )
    console.log('trigger')
  }, [assignmentState])

  return (
		<div className='grid md:grid-cols-3 md:auto-rows-auto gap-4'>
            {console.log('render patients')}
			<div className='col-span-2 md:col-span-2'>
				<GridContentCardContainer>
					<Datatable
						data={patientsState}
						title={'Patient Assignments'}
						description={'Click on a row to view the patient details.'}
						renderCustomTableBody={[
						  {
						    col: 'clinician_assignment_id',
						    rename: 'Assignment ID',
						    render: (row, Indx) => (
									<td
										key={Indx}
										className='px-3 py-5 border-b border-gray-200 dark:border-gray-800'>
										<p className='dark-enabled-text whitespace-no-wrap'>
											{row?.clinician_assignment_id}
										</p>
									</td>
						    )
						  },
						  {
						    col: 'user_id',
						    rename: 'Patient ID',
						    render: (row, Indx) => (
									<td
										key={Indx}
										className='px-3 py-5 border-b border-gray-200 dark:border-gray-800'>
										<p className='dark-enabled-text whitespace-no-wrap ml-4'>
											{row?.user_id}
										</p>
									</td>
						    )
						  },
						  {
						    col: 'assignment_accepted',
						    rename: 'Status',
						    render: (row, Indx) => (
									<td
										key={Indx}
										className='px-3 py-5 border-b border-gray-200 dark:border-gray-800'>
										<div className='flex items-center'>
											<div className='px-1 py-1 rounded-md bg-green-500 flex justify-center items-center'>
												<CheckCircleIcon className='h-4 w-4 text-white' />
												<p className='text-xs font-medium text-white'>
													{row?.assignment_accepted.toString() === 'true'
													  ? 'Accepted'
													  : 'Declined'}
												</p>
											</div>
										</div>
									</td>
						    )
						  }
						]}
						clickOnRow={clickOnRow}
					/>
				</GridContentCardContainer>
			</div>
			<div className='col-span-1 md:col-span-1'>
				<GridContentCardContainer>
					<AssignmentListBox
						title={'Pending Patients'}
						data={pendingPatientsState}
						assignmentDispatch={assignmentDispatch}
					/>
				</GridContentCardContainer>
			</div>
		</div>
  )
}

export default PatientsBoard
