import React from 'react'
import PropTypes from 'prop-types'
import { Link, useLocation } from 'react-router-dom'

export default function NavSideBarLink ({
  linkDescription = '',
  iconSVG = undefined,
  url
}) {
  const location = useLocation()
  return (
    <Link
      className={`w-full font-thin uppercase p-4 my-2 flex items-center transition-colors duration-200 justify-start
      ${location.pathname === url
          ? 'text-indigo-500 bg-gradient-to-r from-white to-indigo-100 border-r-4 border-indigo-500 dark:from-gray-700 dark:to-gray-800'
          : 'hover:text-indigo-500 text-gray-500 dark:text-gray-200 dark:hover:text-indigo-500'}`}
      to={url}
    >
      <span className="text-left">
        {iconSVG || <svg
          className="h-5 w-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
        </svg>
        }
      </span>
      <span className="mx-4 text-sm font-medium">{linkDescription}</span>
    </Link>
  )
}

NavSideBarLink.propTypes = {
  linkDescription: PropTypes.string.isRequired,
  iconSVG: PropTypes.any,
  url: PropTypes.string.isRequired
}
