/* eslint-disable no-tabs */
import React from 'react'
import PropTypes from 'prop-types'
import avatar from 'assets/avatar2.png'

const EthnicityText = {
  0: 'Malay',
  1: 'Chinese',
  2: 'Bumiputera Sarawak',
  3: 'Indian',
  4: 'Eurasian',
  99: 'Other'
}

const YesNo = (val) => {
  return val ? 'Yes' : 'No'
}

export default function PatientProfileDetail ({ data, title }) {
  return (
		<div className='antialiased font-san'>
			<div className='container mx-auto px-4 sm:px-8'>
				<div className='py-4'>
					<div className='flex justify-between'>
						<h2 className='font-bold text-xl leading-tight dark-enabled-text'>
							{title ?? 'Untitled'}
						</h2>
					</div>
					<div className='flex w-full flex-col mt-5 justify-center bg-gray-100 dark:bg-gray-800 p-4 rounded-lg'>
						<div className='flex w-full flex-row items-center'>
							<img
								alt='profil'
								src={avatar}
								className='object-cover rounded-full h-20 w-20'
							/>
							<div className='dark-enabled-text'>
								<p className='ml-10 text-xl font-medium my-1'>
									{data.info?.name ?? 'Unknown'}
								</p>
								<p className='ml-10 font-thin'>
									Patient ID: {data.profile?.user_id}
								</p>
							</div>
						</div>

						<div className='mt-5'>
							<div className='flex w-full flex-row dark-enabled-text items-center text-sm'>
								<p className='w-20'>Email:</p>
								<p className='ml-10'>{data.info?.email ?? 'unknown'}</p>
							</div>
							<div className='flex w-full flex-row mt-1 dark-enabled-text items-center text-sm'>
								<p className='w-20'>Phone:</p>
								<p className='ml-10'>
									{data.info?.contact_information ?? 'unknown'}
								</p>
							</div>
						</div>
					</div>

					<div className='bg-gray-100 dark:bg-gray-800 px-4 py-2 mt-3 rounded-lg text-sm'>
						<div className='flex w-full flex-row dark-enabled-text items-center justify-between'>
							<p>Date of birth:</p>
							<p>{data.profile?.date_of_birth ?? 'unknown'}</p>
						</div>
						<div className='flex w-full flex-row mt-1 dark-enabled-text items-center justify-between'>
							<p>Gender:</p>
							<p>{data.profile?.gender ?? 'unknown'}</p>
						</div>
						<div className='flex w-full flex-row mt-1 dark-enabled-text items-center justify-between'>
							<p>Height (CM):</p>
							<p>{data.profile?.height ?? 'unknown'}</p>
						</div>
						<div className='flex w-full flex-row mt-1 dark-enabled-text items-center justify-between'>
							<p>Ethnicity:</p>
							<p>{EthnicityText[data.profile?.ethnicity] ?? 'unknown'}</p>
						</div>
					</div>
					<div className='bg-gray-100 dark:bg-gray-800 px-4 py-2 mt-3 rounded-lg text-sm'>
						<div className='flex w-full flex-row dark-enabled-text items-center justify-between '>
							<p>High Blood Glucose History:</p>
							<p>{YesNo(data.profile?.high_blood_glucose_history)}</p>
						</div>
						<div className='flex w-full flex-row mt-1 dark-enabled-text items-center justify-between'>
							<p>High Blood Pressure History:</p>
							<p>{YesNo(data.profile?.high_blood_pressure_medication_history)}</p>
						</div>
					</div>
					<div className='bg-gray-100 dark:bg-gray-800 px-4 py-2 mt-3 rounded-lg'>
                        <p className='dark-enabled-text font-medium text-lg'>Relatives with Diabetes</p>
						<div className='flex w-full flex-row dark-enabled-text items-center justify-between text-sm'>
							<p>Non - Immediate:</p>
							<p>{YesNo(data.profile?.family_history_diabetes_non_immediate)}</p>
						</div>
						<div className='flex w-full flex-row mt-1 dark-enabled-text items-center justify-between text-sm'>
							<p>Parents:</p>
							<p>{YesNo(data.profile?.family_history_diabetes_parents)}</p>
						</div>
						<div className='flex w-full flex-row mt-1 dark-enabled-text items-center justify-between text-sm'>
							<p>Siblings:</p>
							<p>{YesNo(data.profile?.family_history_diabetes_siblings)}</p>
						</div>
						<div className='flex w-full flex-row mt-1 dark-enabled-text items-center justify-between text-sm'>
							<p>Children:</p>
							<p>{YesNo(data.profile?.family_history_diabetes_children)}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
  )
}

PatientProfileDetail.propTypes = {
  data: PropTypes.object,
  title: PropTypes.string
}
