/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-unused-vars */
/* eslint-disable no-tabs */
import React from 'react'
import PropTypes from 'prop-types'
import { HomeIcon, ChevronRightIcon } from '@heroicons/react/solid'
import { Link, useLocation } from 'react-router-dom'

export default function Breadcrumb () {
  const location = useLocation()
  const paths = location.pathname.split('/').filter(Boolean) // split string by '/' and filter is to remove the empty string
  let destination = ''

  const capitalizeFirstWord = (str) => {
    return str.split(' ').map(w => `${w[0].toUpperCase()}${w.slice(1)}`).join(' ')
  }

  const pathNameHandler = (path, prevIndx) => {
    if (!isNaN(path)) {
      const prevPath = paths[prevIndx]
      path = `${prevPath} ${path}`
    }
    const mainPath = path.replace('_', ' ')
    return capitalizeFirstWord(mainPath)
  }

  return (
		<div className='w-full flex items-center'>
			<Link to='/'>
				<HomeIcon className='w-5 h-5 dark-enabled-text' />
			</Link>
			{paths.map((path, Indx) => {
			  destination += `/${path}`
			  return (
					<div key={Indx} className="flex  items-center">
						{/* <span className="mx-4 text-gray-400 font-medium">/</span> */}
						<ChevronRightIcon className='mx-4 h-6 w-6 text-gray-400' />
						{/* <Link to={url}></Link> */}
						<Link
							className={`dark-enabled-text font-normal text-sm ${
								Indx + 1 === paths.length && 'font-bold'
							}`}
							to={destination}>
							{pathNameHandler(path, Indx - 1)}
						</Link>
					</div>
			  )
			})}
		</div>
  )
}
