import React from 'react'
import PropTypes from 'prop-types'

function Selector ({ choice, select, press }) {
  return (
      <div>
        {choice === select
          ? (
          <button className='gradient-bg-1 px-4 py-1 focus:outline-none text-white rounded-lg mx-2' onClick={press}>
            {typeof select === 'boolean' ? (choice ? 'Yes' : 'No') : select}
          </button>
            )
          : (
          <button className='bg-gray-400 px-4 py-1 focus:outline-none text-white rounded-lg mx-2' onClick={press}>
            {typeof select === 'boolean' ? (choice ? 'No' : 'Yes') : select}
          </button>
            )}
      </div>
  )
}

Selector.propTypes = {
  choice: PropTypes.bool,
  select: PropTypes.bool,
  press: PropTypes.func
}

export default function TwoSelections ({
  choice,
  select1,
  press1,
  select2,
  press2
}) {
  return (
    <div className='flex fle-row flex-end'>
      {/* First Tag */}
      <Selector choice={choice} select={select1} press={press1} />

      {/* Second Tag */}
      <Selector choice={choice} select={select2} press={press2} />
    </div>
  )
}

TwoSelections.propTypes = {
  choice: PropTypes.bool,
  select1: PropTypes.bool,
  press1: PropTypes.func,
  select2: PropTypes.bool,
  press2: PropTypes.func
}
