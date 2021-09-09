/* eslint-disable no-tabs */
import React from 'react'
import PropTypes from 'prop-types'
import { ReactComponent as WelcomeSVG } from 'svgs/welcome.svg'

export default function WelcomeBoard ({ name = 'Unknown' }) {
  return (
		<div className='flex flex-row py-5 px-10'>
			<div className='flex flex-col text-white'>
				<span className='text-indigo-600 font-bold text-2xl tracking-wide'>Welcome back {name}!</span>
				<span className='py-8 text-gray-800'>
					Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tempora
					ipsum fugit, repudiandae excepturi
				</span>
			</div>
			<div className='flex flex-col'>
				<WelcomeSVG className="w-auto h-40 p-2"/>
			</div>
		</div>
  )
}

WelcomeBoard.propTypes = {
  name: PropTypes.string
}
