import React from 'react'
import PropTypes from 'prop-types'

const ContentCardContainer = ({ children }) => {
  return (
    <div className="mb-4">
      <div className="shadow-lg rounded-2xl p-4 bg-white dark:bg-gray-700 w-full">
        {children}
      </div>
    </div>
  )
}

ContentCardContainer.propTypes = {
  children: PropTypes.node.isRequired
}

export default ContentCardContainer
