import React from 'react'
import PropTypes from 'prop-types'

const GridContentCardContainer = ({ children, bgcolor }) => {
  return (
    <div className={`shadow-lg rounded-2xl p-2 ${bgcolor ?? 'bg-white dark:bg-gray-700'}  w-full h-full`}>
      {children}
    </div>
  )
}

GridContentCardContainer.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  bgcolor: PropTypes.string
}

export default GridContentCardContainer
