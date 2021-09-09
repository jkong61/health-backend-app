import React from 'react'
import PropTypes from 'prop-types'

const Content = ({ children }) => {
  return (
    <div className="overflow-auto h-screen pb-24 pt-2 pr-2 pl-2 md:pt-0 md:pr-0 md:pl-0">
      {children}
    </div>
  )
}

Content.propTypes = {
  children: PropTypes.node.isRequired
}

export default Content
